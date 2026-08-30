use base64::{engine::general_purpose::STANDARD as B64, Engine};
use reqwest::{header, Client, Response};
use serde::de::DeserializeOwned;
use serde::{Deserialize, Serialize};
use std::sync::OnceLock;

const UNIKEY_URL: &str = "https://interface.music.163.com/api/login/qrcode/unikey";
const CHECK_URL: &str = "https://interface.music.163.com/api/login/qrcode/client/login";
const API_USER_AGENT: &str = "Mozilla/5.0 (Windows NT 10.0; WOW64) AppleWebKit/537.36 (KHTML, like Gecko) Safari/537.36 Chrome/91.0.4472.164 NeteaseMusicDesktop/3.0.18.203152";
const API_COOKIE: &str = "os=pc; appver=3.1.17.204416; osver=Microsoft-Windows-10-Professional-build-19045-64bit; channel=netease; __remember_me=true";

fn client() -> &'static Client {
    static C: OnceLock<Client> = OnceLock::new();
    C.get_or_init(|| {
        Client::builder()
            .cookie_store(true)
            .user_agent(API_USER_AGENT)
            .default_headers({
                let mut headers = header::HeaderMap::new();
                headers.insert(
                    header::ACCEPT_ENCODING,
                    header::HeaderValue::from_static("identity"),
                );
                headers.insert(header::COOKIE, header::HeaderValue::from_static(API_COOKIE));
                headers
            })
            .build()
            .unwrap()
    })
}

async fn parse_json_response<T: DeserializeOwned>(
    endpoint: &str,
    response: Response,
) -> Result<(T, Vec<String>), String> {
    let status = response.status();
    let set_cookies = response
        .headers()
        .get_all(header::SET_COOKIE)
        .iter()
        .filter_map(|value| value.to_str().ok().map(str::to_owned))
        .collect();
    let content_type = response
        .headers()
        .get(header::CONTENT_TYPE)
        .and_then(|value| value.to_str().ok())
        .unwrap_or("<missing>")
        .to_owned();
    let content_encoding = response
        .headers()
        .get(header::CONTENT_ENCODING)
        .and_then(|value| value.to_str().ok())
        .unwrap_or("identity")
        .to_owned();
    let bytes = response.bytes().await.map_err(|error| {
        format!(
            "{endpoint}: failed to read response (status {status}, content-type {content_type}, content-encoding {content_encoding}): {error}"
        )
    })?;

    println!(
        "[omc:netease] {endpoint}: status={status}, content-type={content_type}, content-encoding={content_encoding}, bytes={}",
        bytes.len()
    );

    if !status.is_success() {
        return Err(format!("{endpoint}: HTTP {status}"));
    }

    let body = serde_json::from_slice(&bytes).map_err(|error| {
        let preview = String::from_utf8_lossy(&bytes);
        let preview: String = preview.chars().take(200).collect();
        format!("{endpoint}: invalid JSON: {error}; response: {preview}")
    })?;
    Ok((body, set_cookies))
}

#[derive(Deserialize)]
struct UnkeyResp {
    code: i32,
    unikey: Option<String>,
}

#[derive(Serialize, Deserialize, Clone, Debug)]
pub struct QrLoginInfo {
    pub unikey: String,
    pub url: String,
}

#[derive(Serialize, Deserialize, Clone, Debug)]
pub struct QrStatus {
    pub status: String, // "waiting" | "scanned" | "expired" | "authorized" | "failed"
    pub message: String,
}

pub async fn generate_unikey() -> Result<QrLoginInfo, String> {
    let resp = client()
        .post(UNIKEY_URL)
        .header("Origin", "https://music.163.com")
        .header("Referer", "https://music.163.com/")
        .form(&[("type", "3")])
        .send()
        .await
        .map_err(|e| e.to_string())?;

    let (body, _): (UnkeyResp, _) = parse_json_response("unikey", resp).await?;
    if body.code != 200 {
        return Err(format!("unikey code: {}", body.code));
    }
    let unikey = body.unikey.ok_or("no unikey")?;

    let mut url = reqwest::Url::parse("https://music.163.com/login").unwrap();
    url.query_pairs_mut().append_pair("codekey", &unikey);

    Ok(QrLoginInfo {
        unikey,
        url: url.to_string(),
    })
}

#[derive(Deserialize)]
struct CheckResp {
    code: i32,
    message: Option<String>,
}

pub async fn check_qr_status(unikey: &str) -> Result<(QrStatus, Vec<String>), String> {
    let resp = client()
        .post(CHECK_URL)
        .header("Origin", "https://music.163.com")
        .header("Referer", "https://music.163.com/")
        .form(&[("type", "3"), ("key", unikey)])
        .send()
        .await
        .map_err(|e| e.to_string())?;

    let (body, set_cookies): (CheckResp, _) = parse_json_response("qr-check", resp).await?;
    let (status, msg) = match body.code {
        800 => ("expired", "二维码已过期"),
        801 => ("waiting", "等待扫码"),
        802 => ("scanned", "已扫描，请确认"),
        803 => ("authorized", "登录成功"),
        _ => ("failed", "未知状态"),
    };
    Ok((
        QrStatus {
            status: status.into(),
            message: body.message.unwrap_or_else(|| msg.into()),
        },
        set_cookies,
    ))
}

/// Generate QR code as PNG data URL
pub fn qr_to_data_url(content: &str) -> Result<String, String> {
    use image::Luma;
    use qrcode::QrCode;

    let code = QrCode::new(content.as_bytes()).map_err(|e| e.to_string())?;
    let img = code
        .render::<Luma<u8>>()
        .quiet_zone(true)
        .min_dimensions(200, 200)
        .build();

    let mut buf = std::io::Cursor::new(Vec::new());
    img.write_to(&mut buf, image::ImageFormat::Png)
        .map_err(|e| e.to_string())?;
    let b64 = B64.encode(buf.into_inner());
    Ok(format!("data:image/png;base64,{}", b64))
}

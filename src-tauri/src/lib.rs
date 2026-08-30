mod login;
mod media;
mod netease;
mod tray;

use media::{MediaMetadata, MediaStore};
use tauri::webview::WebviewWindowBuilder;
use tauri::{Emitter, Manager};
use tauri_plugin_autostart::MacosLauncher;
use tauri_plugin_global_shortcut::{Code, GlobalShortcutExt, Modifiers, Shortcut};

pub const USER_AGENT: &str = "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/131.0.0.0 Safari/537.36";

const INJECT_JS: &str = include_str!("../../src/inject.js");

fn is_netease_login_url(url: &tauri::Url) -> bool {
    if url.host_str() != Some("music.163.com") {
        return false;
    }

    url.path() == "/login"
        || (url.path() == "/"
            && url
                .fragment()
                .is_some_and(|fragment| fragment.starts_with("/login")))
}

// ── Tauri commands ──────────────────────────────────────────────────────

#[tauri::command]
fn update_media_metadata(
    app: tauri::AppHandle,
    title: String,
    artist: String,
    album: String,
    cover_url: String,
) {
    let store = app.state::<MediaStore>();
    {
        let mut state = store.0.lock().unwrap();
        state.metadata = Some(MediaMetadata {
            title,
            artist,
            album,
            cover_url,
        });
    }
    tray::update_tray(&app);
}

#[tauri::command]
fn update_play_status(app: tauri::AppHandle, playing: bool) {
    let store = app.state::<MediaStore>();
    {
        let mut state = store.0.lock().unwrap();
        state.playing = playing;
    }
    tray::update_tray(&app);
}

#[tauri::command]
fn open_login_window(app: tauri::AppHandle) {
    login::open_login_window(&app);
}

#[tauri::command]
fn on_login_success(app: tauri::AppHandle) {
    if let Some(win) = app.get_webview_window("login") {
        let _ = win.close();
    }
    if let Some(win) = app.get_webview_window("main") {
        let _ = win.eval("window.location.reload()");
    }
}

#[tauri::command]
async fn qr_generate() -> Result<serde_json::Value, String> {
    let info = netease::generate_unikey().await?;
    let qr_data_url = netease::qr_to_data_url(&info.url)?;
    Ok(serde_json::json!({
        "unikey": info.unikey,
        "qr_data_url": qr_data_url,
    }))
}

#[tauri::command]
async fn qr_check(app: tauri::AppHandle, unikey: String) -> Result<netease::QrStatus, String> {
    let (status, set_cookies) = netease::check_qr_status(&unikey).await?;
    if status.status == "authorized" {
        let main_window = app
            .get_webview_window("main")
            .ok_or("main window not found")?;
        for value in set_cookies {
            let cookie = tauri::webview::Cookie::parse(value)
                .map_err(|error| format!("invalid login cookie: {error}"))?;
            main_window
                .set_cookie(cookie)
                .map_err(|error| format!("failed to set login cookie: {error}"))?;
        }
    }
    Ok(status)
}

// ── App entry ───────────────────────────────────────────────────────────

pub fn run() {
    tauri::Builder::default()
        .manage(MediaStore::new())
        .plugin(tauri_plugin_shell::init())
        .plugin(tauri_plugin_single_instance::init(|app, _args, _cwd| {
            if let Some(window) = app.get_webview_window("main") {
                let _ = window.show();
                let _ = window.set_focus();
            }
        }))
        .plugin(tauri_plugin_autostart::init(
            MacosLauncher::LaunchAgent,
            Some(vec![]),
        ))
        .plugin(tauri_plugin_global_shortcut::Builder::new().build())
        .invoke_handler(tauri::generate_handler![
            update_media_metadata,
            update_play_status,
            open_login_window,
            on_login_success,
            qr_generate,
            qr_check,
            tray::get_tray_state,
            tray::tray_action,
        ])
        .setup(|app| {
            let navigation_app = app.handle().clone();
            let main_window = WebviewWindowBuilder::new(
                app,
                "main",
                tauri::WebviewUrl::External("https://music.163.com/st/webplayer".parse().unwrap()),
            )
            .title("ohMyCloudmusic")
            .inner_size(1200.0, 800.0)
            .min_inner_size(800.0, 600.0)
            .decorations(false)
            .resizable(true)
            .visible(false)
            .user_agent(USER_AGENT)
            .initialization_script(INJECT_JS)
            .on_navigation(move |url| {
                println!("[omc:navigation] {url}");
                if is_netease_login_url(url) {
                    println!("[omc:navigation] blocked NetEase login page");
                    let app = navigation_app.clone();
                    std::thread::spawn(move || {
                        std::thread::sleep(std::time::Duration::from_millis(50));
                        let window_app = app.clone();
                        if let Err(error) = app.run_on_main_thread(move || {
                            login::open_login_window(&window_app);
                        }) {
                            eprintln!("[omc] failed to schedule login window: {error}");
                        }
                    });
                    return false;
                }
                true
            })
            .build()?;

            let startup_app = app.handle().clone();
            std::thread::spawn(move || {
                std::thread::sleep(std::time::Duration::from_secs(2));
                let fallback_app = startup_app.clone();
                if let Err(error) = startup_app.run_on_main_thread(move || {
                    if let Some(window) = fallback_app.get_webview_window("main") {
                        if !window.is_visible().unwrap_or(false) {
                            let _ = window.show();
                            let _ = window.set_focus();
                        }
                    }
                }) {
                    eprintln!("[omc] failed to schedule startup window fallback: {error}");
                }
            });

            if let Err(e) = tray::create_tray(app.handle()) {
                eprintln!("[omc] tray error: {}", e);
            }

            if let Err(e) = register_shortcuts(app.handle()) {
                eprintln!("[omc] shortcut error: {}", e);
            }

            let win = main_window.clone();
            main_window.on_window_event(move |event| {
                if let tauri::WindowEvent::CloseRequested { api, .. } = event {
                    api.prevent_close();
                    let _ = win.hide();
                }
            });

            Ok(())
        })
        .run(tauri::generate_context!())
        .expect("error while running tauri application");
}

fn register_shortcuts(app: &tauri::AppHandle) -> Result<(), Box<dyn std::error::Error>> {
    let handle = app.clone();

    let play_pause = Shortcut::new(Some(Modifiers::CONTROL | Modifiers::ALT), Code::KeyP);
    let previous = Shortcut::new(Some(Modifiers::CONTROL | Modifiers::ALT), Code::ArrowLeft);
    let next = Shortcut::new(Some(Modifiers::CONTROL | Modifiers::ALT), Code::ArrowRight);
    let vol_up = Shortcut::new(Some(Modifiers::CONTROL | Modifiers::ALT), Code::ArrowUp);
    let vol_down = Shortcut::new(Some(Modifiers::CONTROL | Modifiers::ALT), Code::ArrowDown);

    app.global_shortcut().on_shortcuts(
        [play_pause, previous, next, vol_up, vol_down],
        move |_app, shortcut, _event| {
            let action = if shortcut == &play_pause {
                "play"
            } else if shortcut == &previous {
                "previoustrack"
            } else if shortcut == &next {
                "nexttrack"
            } else if shortcut == &vol_up {
                "volume-up"
            } else if shortcut == &vol_down {
                "volume-down"
            } else {
                return;
            };

            if let Some(win) = handle.get_webview_window("main") {
                let _ = win.emit("media-control", action);
            }
        },
    )?;

    Ok(())
}

#[cfg(test)]
mod tests {
    use super::is_netease_login_url;

    #[test]
    fn recognizes_netease_login_routes() {
        let direct = "https://music.163.com/login?targetUrl=%2Fst%2Fwebplayer"
            .parse()
            .unwrap();
        let hash = "https://music.163.com/#/login?targetUrl=%2Fst%2Fwebplayer"
            .parse()
            .unwrap();

        assert!(is_netease_login_url(&direct));
        assert!(is_netease_login_url(&hash));
    }

    #[test]
    fn allows_webplayer_and_external_login_routes() {
        let webplayer = "https://music.163.com/st/webplayer".parse().unwrap();
        let external = "https://example.com/login".parse().unwrap();

        assert!(!is_netease_login_url(&webplayer));
        assert!(!is_netease_login_url(&external));
    }
}

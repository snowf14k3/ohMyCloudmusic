use tauri::webview::WebviewWindowBuilder;
use tauri::{AppHandle, Manager};

pub fn open_login_window(app: &AppHandle) {
    if let Some(win) = app.get_webview_window("login") {
        let _ = win.show();
        let _ = win.set_focus();
        return;
    }

    if let Err(e) = create_login_window(app) {
        eprintln!("[omc] login window error: {}", e);
    }
}

fn create_login_window(app: &AppHandle) -> Result<(), Box<dyn std::error::Error>> {
    let _login_window =
        WebviewWindowBuilder::new(app, "login", tauri::WebviewUrl::App("login.html".into()))
            .title("登录 - ohMyCloudmusic")
            .inner_size(320.0, 420.0)
            .resizable(false)
            .decorations(false)
            .center()
            .always_on_top(true)
            .build()?;

    Ok(())
}

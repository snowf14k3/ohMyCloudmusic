use tauri::{
    menu::{MenuBuilder, MenuItemBuilder, PredefinedMenuItem},
    tray::{MouseButton, MouseButtonState, TrayIconBuilder, TrayIconEvent},
    AppHandle, Emitter, Manager,
};

use crate::media::MediaStore;

pub fn create_tray(app: &AppHandle) -> tauri::Result<()> {
    let icon = app
        .default_window_icon()
        .cloned()
        .expect("missing default window icon");

    let menu = build_tray_menu(app, None, false)?;

    let _tray = TrayIconBuilder::with_id("main")
        .icon(icon)
        .menu(&menu)
        .tooltip("ohMyCloudmusic")
        .on_menu_event(move |app, event| {
            handle_menu_event(app, event.id().as_ref());
        })
        .on_tray_icon_event(|tray, event| {
            if let TrayIconEvent::Click {
                button: MouseButton::Left,
                button_state: MouseButtonState::Up,
                ..
            } = event
            {
                toggle_window(tray.app_handle());
            }
        })
        .build(app)?;

    Ok(())
}

/// Rebuild the tray menu with current media state
pub fn update_tray(app: &AppHandle) {
    let store = app.state::<MediaStore>();
    let state = store.0.lock().unwrap().clone();

    if let Some(tray) = app.tray_by_id("main") {
        if let Ok(menu) = build_tray_menu(app, state.metadata.as_ref(), state.playing) {
            let _ = tray.set_menu(Some(menu));

            // Update tooltip with current track
            let tooltip = match &state.metadata {
                Some(m) if !m.title.is_empty() => {
                    format!("{} - {} | ohMyCloudmusic", m.title, m.artist)
                }
                _ => "ohMyCloudmusic".to_string(),
            };
            let _ = tray.set_tooltip(Some(&tooltip));
        }
    }
}

fn build_tray_menu(
    app: &AppHandle,
    metadata: Option<&crate::media::MediaMetadata>,
    playing: bool,
) -> tauri::Result<tauri::menu::Menu<tauri::Wry>> {
    let mut builder = MenuBuilder::new(app);

    // Show current track info if available
    if let Some(meta) = metadata {
        if !meta.title.is_empty() {
            let track_info = if meta.artist.is_empty() {
                meta.title.clone()
            } else {
                format!("{} - {}", meta.title, meta.artist)
            };
            // Truncate long titles (char-safe for CJK)
            let display: String = if track_info.chars().count() > 30 {
                let truncated: String = track_info.chars().take(27).collect();
                format!("{}...", truncated)
            } else {
                track_info
            };
            let track_item = MenuItemBuilder::with_id("track_info", &display)
                .enabled(false)
                .build(app)?;
            builder = builder.item(&track_item);
            builder = builder.item(&PredefinedMenuItem::separator(app)?);
        }
    }

    // Play/Pause toggle
    let play_label = if playing { "暂停" } else { "播放" };
    let play_pause = MenuItemBuilder::with_id("play_pause", play_label).build(app)?;
    let previous = MenuItemBuilder::with_id("previous", "上一首").build(app)?;
    let next = MenuItemBuilder::with_id("next", "下一首").build(app)?;

    builder = builder
        .item(&play_pause)
        .item(&previous)
        .item(&next)
        .item(&PredefinedMenuItem::separator(app)?);

    // Window & app controls
    let show = MenuItemBuilder::with_id("show", "显示/隐藏窗口").build(app)?;
    let login = MenuItemBuilder::with_id("login", "登录").build(app)?;
    let quit = MenuItemBuilder::with_id("quit", "退出").build(app)?;

    builder = builder
        .item(&show)
        .item(&login)
        .item(&PredefinedMenuItem::separator(app)?)
        .item(&quit);

    builder.build()
}

fn handle_menu_event(app: &AppHandle, id: &str) {
    match id {
        "show" => toggle_window(app),
        "play_pause" => emit_media(app, "play"),
        "previous" => emit_media(app, "previoustrack"),
        "next" => emit_media(app, "nexttrack"),
        "login" => {
            crate::login::open_login_window(app);
        }
        "quit" => app.exit(0),
        _ => {}
    }
}

fn toggle_window(app: &AppHandle) {
    if let Some(win) = app.get_webview_window("main") {
        if win.is_visible().unwrap_or(false) {
            let _ = win.hide();
        } else {
            let _ = win.show();
            let _ = win.set_focus();
        }
    }
}

fn emit_media(app: &AppHandle, action: &str) {
    if let Some(win) = app.get_webview_window("main") {
        let _ = win.emit("media-control", action);
    }
}

#[cfg(target_os = "linux")]
use tauri::menu::{MenuBuilder, MenuItemBuilder, PredefinedMenuItem};
#[cfg(not(target_os = "linux"))]
use tauri::webview::WebviewWindowBuilder;
use tauri::{
    tray::{MouseButton, MouseButtonState, TrayIconBuilder, TrayIconEvent},
    AppHandle, Emitter, Manager,
};

use crate::media::{MediaState, MediaStore};

#[cfg(not(target_os = "linux"))]
const POPUP_WIDTH: f64 = 236.0;
#[cfg(not(target_os = "linux"))]
const POPUP_HEIGHT: f64 = 226.0;

pub fn create_tray(app: &AppHandle) -> tauri::Result<()> {
    let icon = app
        .default_window_icon()
        .cloned()
        .expect("missing default window icon");

    #[cfg(not(target_os = "linux"))]
    create_tray_menu_window(app)?;

    let tray = TrayIconBuilder::with_id("main")
        .icon(icon)
        .tooltip("ohMyCloudmusic");

    #[cfg(target_os = "linux")]
    let tray = {
        let menu = build_native_menu(app, None, false)?;
        tray.menu(&menu).on_menu_event(move |app, event| {
            handle_action(app, event.id().as_ref());
        })
    };

    let _tray = tray
        .on_tray_icon_event(|tray, event| {
            if let TrayIconEvent::Click {
                position,
                button,
                button_state: MouseButtonState::Up,
                ..
            } = event
            {
                match button {
                    MouseButton::Left => toggle_window(tray.app_handle()),
                    #[cfg(not(target_os = "linux"))]
                    MouseButton::Right => toggle_tray_menu(tray.app_handle(), position),
                    _ => {}
                }
            }
        })
        .build(app)?;

    Ok(())
}

pub fn update_tray(app: &AppHandle) {
    let state = current_state(app);

    if let Some(tray) = app.tray_by_id("main") {
        #[cfg(target_os = "linux")]
        if let Ok(menu) = build_native_menu(app, state.metadata.as_ref(), state.playing) {
            let _ = tray.set_menu(Some(menu));
        }

        let tooltip = match &state.metadata {
            Some(metadata) if !metadata.title.is_empty() => {
                format!("{} - {} | ohMyCloudmusic", metadata.title, metadata.artist)
            }
            _ => "ohMyCloudmusic".to_string(),
        };
        let _ = tray.set_tooltip(Some(&tooltip));
    }

    #[cfg(not(target_os = "linux"))]
    if let Some(window) = app.get_webview_window("tray-menu") {
        let _ = window.emit("tray-state", state);
    }
}

#[tauri::command]
pub fn get_tray_state(app: AppHandle) -> MediaState {
    current_state(&app)
}

#[tauri::command]
pub fn tray_action(app: AppHandle, action: String) {
    if action == "quit" {
        if let Some(window) = app.get_webview_window("tray-menu") {
            let _ = window.hide();
        }
        let exit_app = app.clone();
        std::thread::spawn(move || {
            std::thread::sleep(std::time::Duration::from_millis(100));
            exit_app.exit(0);
        });
        return;
    }
    handle_action(&app, &action);
    if action == "show" {
        if let Some(window) = app.get_webview_window("tray-menu") {
            let _ = window.hide();
        }
    }
}

fn current_state(app: &AppHandle) -> MediaState {
    app.state::<MediaStore>().0.lock().unwrap().clone()
}

fn handle_action(app: &AppHandle, action: &str) {
    match action {
        "show" => toggle_window(app),
        "play_pause" => emit_media(app, "play"),
        "previous" => emit_media(app, "previoustrack"),
        "next" => emit_media(app, "nexttrack"),
        "like" => emit_media(app, "like"),
        _ => {}
    }
}

fn toggle_window(app: &AppHandle) {
    if let Some(window) = app.get_webview_window("main") {
        if window.is_visible().unwrap_or(false) {
            let _ = window.hide();
        } else {
            let _ = window.show();
            let _ = window.set_focus();
        }
    }
}

fn emit_media(app: &AppHandle, action: &str) {
    if let Some(window) = app.get_webview_window("main") {
        let _ = window.emit("media-control", action);
    }
}

#[cfg(not(target_os = "linux"))]
fn create_tray_menu_window(app: &AppHandle) -> tauri::Result<()> {
    if app.get_webview_window("tray-menu").is_some() {
        return Ok(());
    }

    let window =
        WebviewWindowBuilder::new(app, "tray-menu", tauri::WebviewUrl::App("tray.html".into()))
            .title("ohMyCloudmusic")
            .inner_size(POPUP_WIDTH, POPUP_HEIGHT)
            .resizable(false)
            .decorations(false)
            .transparent(true)
            .shadow(false)
            .always_on_top(true)
            .skip_taskbar(true)
            .visible(false)
            .build()?;

    let blur_window = window.clone();
    window.on_window_event(move |event| {
        if matches!(event, tauri::WindowEvent::Focused(false)) {
            let _ = blur_window.hide();
        }
    });

    Ok(())
}

#[cfg(not(target_os = "linux"))]
fn toggle_tray_menu(app: &AppHandle, cursor: tauri::PhysicalPosition<f64>) {
    let Some(window) = app.get_webview_window("tray-menu") else {
        return;
    };

    if window.is_visible().unwrap_or(false) {
        let _ = window.hide();
        return;
    }

    let scale = window.scale_factor().unwrap_or(1.0);
    let popup_width = (POPUP_WIDTH * scale).round() as i32;
    let popup_height = (POPUP_HEIGHT * scale).round() as i32;
    let cursor_x = cursor.x.round() as i32;
    let cursor_y = cursor.y.round() as i32;
    let mut x = cursor_x - popup_width + (20.0 * scale).round() as i32;
    let mut y = cursor_y - popup_height - (8.0 * scale).round() as i32;

    if let Ok(Some(monitor)) = app.monitor_from_point(cursor.x, cursor.y) {
        let work = monitor.work_area();
        let left = work.position.x + 8;
        let top = work.position.y + 8;
        let right = work.position.x + work.size.width as i32 - 8;
        let bottom = work.position.y + work.size.height as i32 - 8;

        x = x.clamp(left, (right - popup_width).max(left));
        if y < top {
            y = cursor_y + (8.0 * scale).round() as i32;
        }
        y = y.clamp(top, (bottom - popup_height).max(top));
    }

    let _ = window.set_position(tauri::PhysicalPosition::new(x, y));
    let _ = window.emit("tray-state", current_state(app));
    let _ = window.show();
    let _ = window.set_focus();

    let focus_window = window.clone();
    std::thread::spawn(move || {
        std::thread::sleep(std::time::Duration::from_millis(300));
        loop {
            if !focus_window.is_visible().unwrap_or(false) {
                break;
            }
            if !focus_window.is_focused().unwrap_or(true) {
                let _ = focus_window.hide();
                break;
            }
            std::thread::sleep(std::time::Duration::from_millis(100));
        }
    });
}

#[cfg(target_os = "linux")]
fn build_native_menu(
    app: &AppHandle,
    metadata: Option<&crate::media::MediaMetadata>,
    playing: bool,
) -> tauri::Result<tauri::menu::Menu<tauri::Wry>> {
    let track_info = metadata
        .filter(|metadata| !metadata.title.is_empty())
        .map(|metadata| {
            if metadata.artist.is_empty() {
                metadata.title.clone()
            } else {
                format!("{} - {}", metadata.title, metadata.artist)
            }
        })
        .unwrap_or_else(|| "ohMyCloudmusic".to_string());
    let display = if track_info.chars().count() > 28 {
        format!("{}...", track_info.chars().take(25).collect::<String>())
    } else {
        track_info
    };

    let track = MenuItemBuilder::with_id("track_info", display)
        .enabled(false)
        .build(app)?;
    let previous = MenuItemBuilder::with_id("previous", "上一首").build(app)?;
    let play_pause =
        MenuItemBuilder::with_id("play_pause", if playing { "暂停" } else { "播放" }).build(app)?;
    let next = MenuItemBuilder::with_id("next", "下一首").build(app)?;
    let like = MenuItemBuilder::with_id("like", "喜欢当前歌曲").build(app)?;
    let show = MenuItemBuilder::with_id("show", "显示 / 隐藏主窗口").build(app)?;
    let quit = MenuItemBuilder::with_id("quit", "退出 ohMyCloudmusic").build(app)?;

    MenuBuilder::new(app)
        .item(&track)
        .item(&PredefinedMenuItem::separator(app)?)
        .item(&previous)
        .item(&play_pause)
        .item(&next)
        .item(&like)
        .item(&PredefinedMenuItem::separator(app)?)
        .item(&show)
        .item(&PredefinedMenuItem::separator(app)?)
        .item(&quit)
        .build()
}

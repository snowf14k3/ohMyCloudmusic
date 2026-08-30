mod login;
mod media;
mod netease;
mod tray;

use media::{MediaMetadata, MediaStore};
use tauri::webview::WebviewWindowBuilder;
use tauri::{Emitter, Manager};
use tauri_plugin_autostart::MacosLauncher;
use tauri_plugin_global_shortcut::{Code, GlobalShortcutExt, Modifiers, Shortcut};

#[cfg(windows)]
use windows::Win32::{
    Foundation::{POINT, RECT},
    Graphics::Gdi::{ClientToScreen, CreateRoundRectRgn, SetWindowRgn},
    UI::WindowsAndMessaging::{
        GetClientRect, GetForegroundWindow, GetWindowRect, SetForegroundWindow, SetWindowPos,
        SWP_NOACTIVATE, SWP_NOZORDER,
    },
};

pub const USER_AGENT: &str = "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/131.0.0.0 Safari/537.36";

const INJECT_JS: &str = concat!(
    include_str!("../../src/inject/styles.js"),
    "\n;\n",
    include_str!("../../src/inject/netease-adapter.js"),
    "\n;\n",
    include_str!("../../src/inject/media-controller.js"),
    "\n;\n",
    include_str!("../../src/inject/mini-player.js"),
    "\n;\n",
    include_str!("../../src/inject/bootstrap.js"),
);

static SONG_MENU_ACTION: std::sync::Mutex<Option<String>> = std::sync::Mutex::new(None);
static SONG_MENU_SESSION: std::sync::atomic::AtomicU64 = std::sync::atomic::AtomicU64::new(0);
static VOLUME_POPUP_VALUE: std::sync::Mutex<Option<f64>> = std::sync::Mutex::new(None);
static VOLUME_POPUP_OPEN: std::sync::atomic::AtomicBool = std::sync::atomic::AtomicBool::new(false);
static VOLUME_POPUP_SESSION: std::sync::atomic::AtomicU64 = std::sync::atomic::AtomicU64::new(0);

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
fn update_like_status(app: tauri::AppHandle, liked: Option<bool>) {
    let store = app.state::<MediaStore>();
    let changed = {
        let mut state = store.0.lock().unwrap();
        if state.liked == liked {
            false
        } else {
            state.liked = liked;
            true
        }
    };
    if changed {
        tray::update_tray(&app);
    }
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

#[cfg(windows)]
#[tauri::command]
fn animate_window_size_anchored_bottom(
    window: tauri::WebviewWindow,
    width: f64,
    height: f64,
    duration: u64,
) -> Result<(), String> {
    let hwnd = window.hwnd().map_err(|error| error.to_string())?;
    let scale = window.scale_factor().map_err(|error| error.to_string())?;
    let mut window_rect = RECT::default();
    let mut client_rect = RECT::default();
    let mut client_origin = POINT::default();

    unsafe {
        GetWindowRect(hwnd, &mut window_rect).map_err(|error| error.to_string())?;
        GetClientRect(hwnd, &mut client_rect).map_err(|error| error.to_string())?;
        if !ClientToScreen(hwnd, &mut client_origin).as_bool() {
            return Err("failed to locate animated window client area".to_string());
        }
    }

    let source_client_width = client_rect.right - client_rect.left;
    let source_client_height = client_rect.bottom - client_rect.top;
    let source_outer_width = window_rect.right - window_rect.left;
    let source_outer_height = window_rect.bottom - window_rect.top;
    let frame_width = source_outer_width - source_client_width;
    let frame_height = source_outer_height - source_client_height;
    let client_left = client_origin.x - window_rect.left;
    let client_top = client_origin.y - window_rect.top;
    let target_client_width = (width * scale).round() as i32;
    let target_client_height = (height * scale).round() as i32;
    let target_outer_width = target_client_width + frame_width;
    let expanding = target_client_height > source_client_height;
    let animation_client_height = source_client_height.max(target_client_height);
    let animation_outer_height = animation_client_height + frame_height;
    let steps = (duration / 16).max(1);

    let set_region = |visible_height: i32| -> Result<(), String> {
        let bottom = client_top + animation_client_height;
        let corner_radius = (8.0 * scale).round() as i32;
        let region = unsafe {
            CreateRoundRectRgn(
                client_left,
                bottom - visible_height,
                client_left + target_client_width + 1,
                bottom + 1,
                corner_radius * 2,
                corner_radius * 2,
            )
        };
        if unsafe { SetWindowRgn(hwnd, Some(region), true) } == 0 {
            return Err("failed to update animated window region".to_string());
        }
        Ok(())
    };

    if expanding {
        set_region(source_client_height)?;
    }

    unsafe {
        SetWindowPos(
            hwnd,
            None,
            window_rect.left,
            window_rect.bottom - animation_outer_height,
            target_outer_width,
            animation_outer_height,
            SWP_NOACTIVATE | SWP_NOZORDER,
        )
        .map_err(|error| error.to_string())?;
    }

    for step in 1..=steps {
        let progress = step as f64 / steps as f64;
        let eased = progress * progress * (3.0 - 2.0 * progress);
        let visible_height = (source_client_height as f64
            + (target_client_height - source_client_height) as f64 * eased)
            .round() as i32;
        set_region(visible_height)?;
        std::thread::sleep(std::time::Duration::from_millis(duration / steps));
    }

    if expanding {
        unsafe { SetWindowRgn(hwnd, None, true) };
    }
    Ok(())
}

#[cfg(windows)]
#[tauri::command]
fn finish_window_region_animation(
    window: tauri::WebviewWindow,
    width: f64,
    height: f64,
) -> Result<(), String> {
    let hwnd = window.hwnd().map_err(|error| error.to_string())?;
    let scale = window.scale_factor().map_err(|error| error.to_string())?;
    let mut window_rect = RECT::default();
    let mut client_rect = RECT::default();
    unsafe {
        GetWindowRect(hwnd, &mut window_rect).map_err(|error| error.to_string())?;
        GetClientRect(hwnd, &mut client_rect).map_err(|error| error.to_string())?;
    }

    let frame_width =
        (window_rect.right - window_rect.left) - (client_rect.right - client_rect.left);
    let frame_height =
        (window_rect.bottom - window_rect.top) - (client_rect.bottom - client_rect.top);
    let target_outer_width = (width * scale).round() as i32 + frame_width;
    let target_outer_height = (height * scale).round() as i32 + frame_height;
    unsafe {
        SetWindowPos(
            hwnd,
            None,
            window_rect.left,
            window_rect.bottom - target_outer_height,
            target_outer_width,
            target_outer_height,
            SWP_NOACTIVATE | SWP_NOZORDER,
        )
        .map_err(|error| error.to_string())?;
        SetWindowRgn(hwnd, None, true);
    }
    Ok(())
}

#[cfg(windows)]
#[tauri::command]
fn open_song_menu(
    app: tauri::AppHandle,
    window: tauri::WebviewWindow,
    x: f64,
    y: f64,
    artist: String,
    album: String,
    source: String,
) -> Result<(), String> {
    let scale = window.scale_factor().map_err(|error| error.to_string())?;
    let origin = window.inner_position().map_err(|error| error.to_string())?;
    let menu = app
        .get_webview_window("song-menu")
        .ok_or("song menu window is unavailable")?;
    let session = SONG_MENU_SESSION.fetch_add(1, std::sync::atomic::Ordering::AcqRel) + 1;
    *SONG_MENU_ACTION
        .lock()
        .map_err(|_| "failed to lock song menu action")? = None;
    menu.set_position(tauri::LogicalPosition::new(
        origin.x as f64 / scale + x,
        origin.y as f64 / scale + y,
    ))
    .map_err(|error| error.to_string())?;
    let payload = serde_json::json!({ "artist": artist, "album": album, "source": source });
    menu.eval(format!("window.renderSongMenu({payload})"))
        .map_err(|error| error.to_string())?;
    menu.show().map_err(|error| error.to_string())?;
    let menu_hwnd = menu.hwnd().map_err(|error| error.to_string())?;
    unsafe {
        let _ = SetForegroundWindow(menu_hwnd);
    }
    menu.set_focus().map_err(|error| error.to_string())?;

    let watched_menu = menu.clone();
    let menu_hwnd_value = menu_hwnd.0 as isize;
    std::thread::spawn(move || {
        std::thread::sleep(std::time::Duration::from_millis(100));
        loop {
            if SONG_MENU_SESSION.load(std::sync::atomic::Ordering::Acquire) != session {
                return;
            }
            let foreground = unsafe { GetForegroundWindow() };
            if foreground.0 as isize != menu_hwnd_value {
                if SONG_MENU_SESSION
                    .compare_exchange(
                        session,
                        session + 1,
                        std::sync::atomic::Ordering::AcqRel,
                        std::sync::atomic::Ordering::Acquire,
                    )
                    .is_ok()
                {
                    if let Ok(mut action) = SONG_MENU_ACTION.lock() {
                        if action.is_none() {
                            *action = Some(String::new());
                        }
                    }
                    let _ = watched_menu.hide();
                }
                return;
            }
            std::thread::sleep(std::time::Duration::from_millis(50));
        }
    });
    Ok(())
}

#[tauri::command]
fn select_song_menu_action(app: tauri::AppHandle, action: String) -> Result<(), String> {
    SONG_MENU_SESSION.fetch_add(1, std::sync::atomic::Ordering::AcqRel);
    *SONG_MENU_ACTION
        .lock()
        .map_err(|_| "failed to lock song menu action")? = Some(action);
    if let Some(menu) = app.get_webview_window("song-menu") {
        menu.hide().map_err(|error| error.to_string())?;
    }
    if let Some(main) = app.get_webview_window("main") {
        let _ = main.set_focus();
    }
    Ok(())
}

#[tauri::command]
fn close_song_menu(app: tauri::AppHandle) -> Result<(), String> {
    SONG_MENU_SESSION.fetch_add(1, std::sync::atomic::Ordering::AcqRel);
    if let Ok(mut action) = SONG_MENU_ACTION.lock() {
        if action.is_none() {
            *action = Some(String::new());
        }
    }
    if let Some(menu) = app.get_webview_window("song-menu") {
        menu.hide().map_err(|error| error.to_string())?;
    }
    Ok(())
}

#[tauri::command]
fn take_song_menu_action() -> Result<Option<String>, String> {
    Ok(SONG_MENU_ACTION
        .lock()
        .map_err(|_| "failed to lock song menu action")?
        .take())
}

#[tauri::command]
fn open_volume_popup(
    app: tauri::AppHandle,
    window: tauri::WebviewWindow,
    x: f64,
    y: f64,
    value: f64,
) -> Result<(), String> {
    let scale = window.scale_factor().map_err(|error| error.to_string())?;
    let origin = window.inner_position().map_err(|error| error.to_string())?;
    let popup = app
        .get_webview_window("volume-popup")
        .ok_or("volume popup window is unavailable")?;
    let session = VOLUME_POPUP_SESSION.fetch_add(1, std::sync::atomic::Ordering::AcqRel) + 1;
    *VOLUME_POPUP_VALUE
        .lock()
        .map_err(|_| "failed to lock volume popup value")? = None;
    VOLUME_POPUP_OPEN.store(true, std::sync::atomic::Ordering::Release);
    popup
        .set_position(tauri::LogicalPosition::new(
            origin.x as f64 / scale + x,
            origin.y as f64 / scale + y,
        ))
        .map_err(|error| error.to_string())?;
    popup
        .eval(format!("window.renderVolume({})", value.clamp(0.0, 1.0)))
        .map_err(|error| error.to_string())?;
    popup.show().map_err(|error| error.to_string())?;
    let popup_hwnd = popup.hwnd().map_err(|error| error.to_string())?;
    unsafe {
        let _ = SetForegroundWindow(popup_hwnd);
    }
    popup.set_focus().map_err(|error| error.to_string())?;

    let watched_popup = popup.clone();
    let popup_hwnd_value = popup_hwnd.0 as isize;
    std::thread::spawn(move || {
        std::thread::sleep(std::time::Duration::from_millis(100));
        loop {
            if VOLUME_POPUP_SESSION.load(std::sync::atomic::Ordering::Acquire) != session {
                return;
            }
            let foreground = unsafe { GetForegroundWindow() };
            if foreground.0 as isize != popup_hwnd_value {
                if VOLUME_POPUP_SESSION
                    .compare_exchange(
                        session,
                        session + 1,
                        std::sync::atomic::Ordering::AcqRel,
                        std::sync::atomic::Ordering::Acquire,
                    )
                    .is_ok()
                {
                    VOLUME_POPUP_OPEN.store(false, std::sync::atomic::Ordering::Release);
                    let _ = watched_popup.hide();
                }
                return;
            }
            std::thread::sleep(std::time::Duration::from_millis(50));
        }
    });
    Ok(())
}

#[tauri::command]
fn set_volume_popup_value(value: f64) -> Result<(), String> {
    *VOLUME_POPUP_VALUE
        .lock()
        .map_err(|_| "failed to lock volume popup value")? = Some(value.clamp(0.0, 1.0));
    Ok(())
}

#[tauri::command]
fn take_volume_popup_state() -> Result<serde_json::Value, String> {
    let value = VOLUME_POPUP_VALUE
        .lock()
        .map_err(|_| "failed to lock volume popup value")?
        .take();
    Ok(serde_json::json!({
        "open": VOLUME_POPUP_OPEN.load(std::sync::atomic::Ordering::Acquire),
        "value": value,
    }))
}

#[tauri::command]
fn close_volume_popup(app: tauri::AppHandle) -> Result<(), String> {
    VOLUME_POPUP_SESSION.fetch_add(1, std::sync::atomic::Ordering::AcqRel);
    VOLUME_POPUP_OPEN.store(false, std::sync::atomic::Ordering::Release);
    if let Some(popup) = app.get_webview_window("volume-popup") {
        popup.hide().map_err(|error| error.to_string())?;
    }
    Ok(())
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
            update_like_status,
            open_login_window,
            on_login_success,
            animate_window_size_anchored_bottom,
            finish_window_region_animation,
            open_song_menu,
            select_song_menu_action,
            close_song_menu,
            take_song_menu_action,
            open_volume_popup,
            set_volume_popup_value,
            take_volume_popup_state,
            close_volume_popup,
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

            let song_menu = WebviewWindowBuilder::new(
                app,
                "song-menu",
                tauri::WebviewUrl::App("song-menu.html".into()),
            )
            .title("Song menu")
            .inner_size(172.0, 318.0)
            .decorations(false)
            .transparent(true)
            .shadow(false)
            .resizable(false)
            .always_on_top(true)
            .skip_taskbar(true)
            .visible(false)
            .build()?;
            let song_menu_window = song_menu.clone();
            song_menu.on_window_event(move |event| {
                if let tauri::WindowEvent::Focused(false) = event {
                    if let Ok(mut action) = SONG_MENU_ACTION.lock() {
                        if action.is_none() {
                            *action = Some(String::new());
                        }
                    }
                    let _ = song_menu_window.hide();
                }
            });

            let volume_popup = WebviewWindowBuilder::new(
                app,
                "volume-popup",
                tauri::WebviewUrl::App("volume-popup.html".into()),
            )
            .title("Volume")
            .inner_size(132.0, 50.0)
            .decorations(false)
            .transparent(true)
            .shadow(false)
            .resizable(false)
            .always_on_top(true)
            .skip_taskbar(true)
            .visible(false)
            .build()?;
            let volume_popup_window = volume_popup.clone();
            volume_popup.on_window_event(move |event| {
                if let tauri::WindowEvent::Focused(false) = event {
                    VOLUME_POPUP_OPEN.store(false, std::sync::atomic::Ordering::Release);
                    let _ = volume_popup_window.hide();
                }
            });

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

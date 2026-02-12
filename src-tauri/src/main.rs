#![cfg_attr(not(debug_assertions), windows_subsystem = "windows")]

use tauri::{
    menu::{Menu, MenuItem, PredefinedMenuItem},
    tray::{MouseButton, MouseButtonState, TrayIconBuilder, TrayIconEvent},
    Manager, RunEvent, AppHandle, WebviewWindow, Emitter,
};
use tauri_plugin_positioner::{Position, WindowExt};
use std::fs;
use std::path::PathBuf;

// Check if this is the first time the app is running
fn is_first_run(app_handle: &AppHandle) -> bool {
    let app_dir = app_handle.path().app_data_dir().unwrap_or_else(|_| PathBuf::from("."));
    let flag_file = app_dir.join("first_run_complete");
    !flag_file.exists()
}

// Mark the app as having been run before
fn mark_first_run_complete(app_handle: &AppHandle) -> Result<(), Box<dyn std::error::Error>> {
    let app_dir = app_handle.path().app_data_dir().unwrap_or_else(|_| PathBuf::from("."));
    fs::create_dir_all(&app_dir)?;
    let flag_file = app_dir.join("first_run_complete");
    fs::write(flag_file, "completed")?;
    Ok(())
}

// Tauri command to hide/minimize window
#[tauri::command]
async fn hide_window(window: WebviewWindow, app_handle: AppHandle) -> Result<(), String> {
    println!("Hide window command received");
    window.hide().map_err(|e| format!("Failed to hide window: {}", e))?;
    // Emit event to show desktop icon
    let _ = app_handle.emit("window-hidden", ());
    Ok(())
}

// Tauri command to show window
#[tauri::command]
async fn show_window(app_handle: AppHandle) -> Result<(), String> {
    println!("Show window command received");
    if let Some(window) = app_handle.get_webview_window("main") {
        window.show().map_err(|e| format!("Failed to show window: {}", e))?;
        window.set_focus().map_err(|e| format!("Failed to focus window: {}", e))?;
        // Emit event to hide desktop icon
        let _ = app_handle.emit("window-shown", ());
        Ok(())
    } else {
        Err("Window not found".to_string())
    }
}

// Tauri command to start dragging
#[tauri::command]
async fn start_drag(window: WebviewWindow) -> Result<(), String> {
    println!("Start drag command received");
    window.start_dragging().map_err(|e| format!("Failed to start drag: {}", e))
}

// Tauri command to mark first run as complete
#[tauri::command]
fn mark_installed(app_handle: AppHandle) -> Result<(), String> {
    println!("Mark installed command received");
    mark_first_run_complete(&app_handle).map_err(|e| e.to_string())
}

fn main() {
    let mut builder = tauri::Builder::default()
        .plugin(tauri_plugin_shell::init())
        .plugin(tauri_plugin_autostart::init(
            tauri_plugin_autostart::MacosLauncher::LaunchAgent,
            None,
        ))
        .plugin(tauri_plugin_positioner::init())
        .plugin(tauri_plugin_notification::init());

    builder = builder
        .invoke_handler(tauri::generate_handler![
            hide_window,
            show_window,
            start_drag,
            mark_installed
        ])
        .setup(|app| {
            let app_handle = app.handle().clone();
            
            // Check if this is the first run
            let first_run = is_first_run(&app_handle);
            println!("First run: {}", first_run);
            
            // Create menu items
            let quit_i = MenuItem::with_id(app, "quit", "Quit", true, None::<&str>)?;
            let show_i = MenuItem::with_id(app, "show", "Show Widget", true, None::<&str>)?;
            let hide_i = MenuItem::with_id(app, "hide", "Hide Widget", true, None::<&str>)?;
            let separator = PredefinedMenuItem::separator(app)?;
            
            let menu = Menu::with_items(app, &[&show_i, &hide_i, &separator, &quit_i])?;

            // Create tray icon
            let _tray = TrayIconBuilder::with_id("tray")
                .menu(&menu)
                .show_menu_on_left_click(false)
                .on_menu_event(|app: &AppHandle, event| match event.id().as_ref() {
                    "quit" => {
                        app.exit(0);
                    }
                    "show" => {
                        if let Some(window) = app.get_webview_window("main") {
                            let _: Result<(), tauri::Error> = window.show();
                            let _: Result<(), tauri::Error> = window.set_focus();
                            let _ = app.emit("window-shown", ());
                        }
                    }
                    "hide" => {
                        if let Some(window) = app.get_webview_window("main") {
                            let _: Result<(), tauri::Error> = window.hide();
                            let _ = app.emit("window-hidden", ());
                        }
                    }
                    _ => {}
                })
                .on_tray_icon_event(|tray, event| {
                    if let TrayIconEvent::Click {
                        button: MouseButton::Left,
                        button_state: MouseButtonState::Up,
                        ..
                    } = event
                    {
                        let app = tray.app_handle();
                        if let Some(window) = app.get_webview_window("main") {
                            let is_visible = window.is_visible().unwrap_or(false);
                            if is_visible {
                                let _: Result<(), tauri::Error> = window.hide();
                                let _ = app.emit("window-hidden", ());
                            } else {
                                let _: Result<(), tauri::Error> = window.move_window(Position::TopRight);
                                let _: Result<(), tauri::Error> = window.show();
                                let _: Result<(), tauri::Error> = window.set_focus();
                                let _ = app.emit("window-shown", ());
                            }
                        }
                    }
                })
                .build(app);

            // Show window on startup
            if let Some(window) = app.get_webview_window("main") {
                // Always show window on startup
                let _: Result<(), tauri::Error> = window.show();
                let _: Result<(), tauri::Error> = window.set_focus();
                
                // If it's the first run, mark it complete after a delay
                if first_run {
                    let app_handle_clone = app_handle.clone();
                    std::thread::spawn(move || {
                        std::thread::sleep(std::time::Duration::from_secs(5));
                        let _ = mark_first_run_complete(&app_handle_clone);
                    });
                }
            }

            Ok(())
        });

    let app = builder
        .build(tauri::generate_context!())
        .expect("error while running tauri application");

    app.run(|_app_handle, event| {
        if let RunEvent::ExitRequested { code, .. } = event {
            if code.is_none() {
                // Keep the app running in the background
            }
        }
    });
}

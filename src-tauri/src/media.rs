use serde::{Deserialize, Serialize};
use std::sync::Mutex;

#[derive(Debug, Clone, Default, Serialize, Deserialize)]
pub struct MediaMetadata {
    pub title: String,
    pub artist: String,
    pub album: String,
    pub cover_url: String,
}

#[derive(Debug, Clone, Default)]
pub struct MediaState {
    pub playing: bool,
    pub metadata: Option<MediaMetadata>,
}

/// Global media state, shared between Tauri commands and tray updates
pub struct MediaStore(pub Mutex<MediaState>);

impl MediaStore {
    pub fn new() -> Self {
        Self(Mutex::new(MediaState::default()))
    }
}

(function () {
  'use strict';
  var OMC = window.__OMC__ = window.__OMC__ || {};
  var adapter = OMC.neteaseAdapter;
  var performMediaAction = adapter.performMediaAction;
  var getBestArtwork = adapter.getBestArtwork;
  var readDomMediaState = adapter.readDomMediaState;
  var readLoggedLikeControl = adapter.readLoggedLikeControl;
  var readCurrentTrackId = adapter.readCurrentTrackId;
  var readLikeState = adapter.readLikeState;
  var readInternalPlayerState = adapter.readInternalPlayerState;
  function setupFrameRelay() {
    window.addEventListener('message', function (event) {
      if (event.origin === 'https://music.163.com' && event.data && event.data.type === 'omc-media-action') {
        performMediaAction(event.data.action);
      }
    });
    setupMediaPolling(null, null, function (metadata, playing, timeline) {
      window.top.postMessage({
        type: 'omc-media-state',
        metadata: metadata,
        playing: playing,
        timeline: timeline
      }, 'https://music.163.com');
    });
  }

  // ── MediaSession: no monkey-patching, use polling to read state ──
  // WebView2 crashes if we patch HTMLAudioElement.prototype or MediaSession.prototype
  // Instead, poll navigator.mediaSession for metadata changes
  function setupMediaPolling(T, miniPlayer, relay) {
    var invoke = T && T.core.invoke;
    var lastMetadata = '';
    var lastPlaying = null;
    var lastLiked;
    var observedLikePlayer = null;
    var likeObserver = null;
    var likedTrackIds = null;
    var likedTracksLoading = false;
    var likedTracksRetryAt = 0;
    OMC.mediaHandlers = {};

    function loadLikedTracks() {
      if (likedTracksLoading || Date.now() < likedTracksRetryAt) return;
      likedTracksLoading = true;
      fetch('/api/nuser/account/get', { credentials: 'include' })
        .then(function (response) { return response.json(); })
        .then(function (account) {
          var userId = account && ((account.profile && account.profile.userId) || (account.account && account.account.id));
          if (!userId) throw new Error('not logged in');
          return fetch('/api/user/playlist?uid=' + encodeURIComponent(userId) + '&offset=0&limit=1000', { credentials: 'include' });
        })
        .then(function (response) { return response.json(); })
        .then(function (result) {
          var playlists = result && result.playlist || [];
          var likedPlaylist = playlists.find(function (playlist) { return Number(playlist.specialType) === 5; });
          if (!likedPlaylist) throw new Error('liked playlist not found');
          return fetch('/api/v6/playlist/detail?id=' + encodeURIComponent(likedPlaylist.id) + '&n=0&newStyle=true', { credentials: 'include' });
        })
        .then(function (response) { return response.json(); })
        .then(function (result) {
          likedTrackIds = new Set((result && result.playlist && result.playlist.trackIds || []).map(function (track) {
            return String(track.id);
          }));
          likedTracksLoading = false;
          update();
        }).catch(function () {
          likedTracksLoading = false;
          likedTracksRetryAt = Date.now() + 30000;
        });
    }

    window.addEventListener('omc-like-toggle', function (event) {
      var detail = event.detail;
      if (!detail || !detail.trackId || !likedTrackIds) return;
      if (detail.liked) likedTrackIds.add(String(detail.trackId));
      else likedTrackIds.delete(String(detail.trackId));
      update();
    });

    function observeLikePlayer(player) {
      if (!player || player === observedLikePlayer) return;
      if (likeObserver) likeObserver.disconnect();
      observedLikePlayer = player;
      likeObserver = new MutationObserver(update);
      likeObserver.observe(player, {
        subtree: true,
        childList: true,
        attributes: true,
        attributeFilter: ['data-log']
      });
    }

    function update() {
      try {
        var mediaSession = navigator.mediaSession;
        var mediaDocument = document;
        var audio = mediaDocument.querySelector('audio');
        if (window === window.top) {
          var contentFrame = document.querySelector('#g_iframe,iframe[name="contentFrame"]');
          try {
            if (contentFrame && contentFrame.contentWindow && contentFrame.contentDocument) {
              var frameSession = contentFrame.contentWindow.navigator.mediaSession;
              var frameAudio = contentFrame.contentDocument.querySelector('audio');
              if ((frameSession && frameSession.metadata) || frameAudio) {
                mediaSession = frameSession;
                mediaDocument = contentFrame.contentDocument;
                audio = frameAudio;
              }
            }
          } catch (error) {}
        }
        var meta = mediaSession && mediaSession.metadata;
        var domState = readDomMediaState(mediaDocument) || readDomMediaState(document);
        var loggedState = readLoggedLikeControl(mediaDocument);
        if (!loggedState && mediaDocument !== document) loggedState = readLoggedLikeControl(document);
        var internalState = readInternalPlayerState(window);
        if (!internalState && window !== window.top) internalState = readInternalPlayerState(window.top);
        var trackId = internalState && internalState.trackId || loggedState && loggedState.trackId || readCurrentTrackId(mediaDocument);
        if (!trackId && mediaDocument !== document) trackId = readCurrentTrackId(document);
        if (trackId && !likedTrackIds) loadLikedTracks();
        var liked = likedTrackIds && trackId
          ? likedTrackIds.has(String(trackId))
          : (internalState && typeof internalState.liked === 'boolean' ? internalState.liked : readLikeState(mediaDocument));
        if (liked === null && mediaDocument !== document) liked = readLikeState(document);
        observeLikePlayer(
          mediaDocument.querySelector('#page_pc_mini_bar,#page_pc_minibar,[id*="page_pc_mini"]') ||
          document.querySelector('#page_pc_mini_bar,#page_pc_minibar,[id*="page_pc_mini"]')
        );
        if (!meta && !audio && !domState && liked === null) return;

        var metadata = null;
        if (meta && meta.title) {
          metadata = {
            title: meta.title || '',
            artist: meta.artist || '',
            album: meta.album || '',
            artwork: getBestArtwork(meta.artwork)
          };
        }
        if (!metadata && domState) metadata = domState.metadata;
        if (metadata && domState && domState.metadata && domState.metadata.artwork) {
          metadata.artwork = domState.metadata.artwork;
        }
        if (miniPlayer && metadata) miniPlayer.updateMetadata(metadata);

        var state = mediaSession ? mediaSession.playbackState : 'none';
        var playing = audio
          ? !audio.paused && !audio.ended
          : state === 'playing' || (state === 'none' && domState && domState.playing);
        if (miniPlayer) miniPlayer.updatePlayback(playing);
        var timeline = audio && isFinite(audio.currentTime) && isFinite(audio.duration) && audio.duration
          ? { currentTime: audio.currentTime, duration: audio.duration }
          : null;
        if (miniPlayer && timeline) miniPlayer.updateTimeline(timeline);

        var metadataKey = metadata ? JSON.stringify(metadata) : '';
        var metadataChanged = !!metadata && metadataKey !== lastMetadata;
        var playingChanged = playing !== lastPlaying;
        var likedChanged = liked !== lastLiked;
        if (relay) relay(metadata, playing, timeline);
        if (invoke && metadataChanged) {
          invoke('update_media_metadata', {
            title: metadata.title,
            artist: metadata.artist,
            album: metadata.album,
            coverUrl: metadata.artwork
          });
        }

        if (invoke && playingChanged) {
          invoke('update_play_status', { playing: playing });
        }
        if (invoke && likedChanged) {
          invoke('update_like_status', { liked: liked });
        }
        if (metadata) lastMetadata = metadataKey;
        lastPlaying = playing;
        lastLiked = liked;
      } catch (e) {}
    }

    document.addEventListener('play', update, true);
    document.addEventListener('pause', update, true);
    document.addEventListener('ended', update, true);
    document.addEventListener('loadedmetadata', update, true);
    setInterval(update, 250);
  }
  OMC.mediaController = {
    setupFrameRelay: setupFrameRelay,
    setupMediaPolling: setupMediaPolling
  };
})();

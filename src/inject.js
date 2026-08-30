(function () {
  'use strict';
  if (window.__omc_injected) return;
  window.__omc_injected = true;

  // ── CSS ──
  var css = document.createElement('style');
  css.id = 'omc-styles';
  css.textContent =
    '.omc-draggable,#page_pc_main_nav,#page_pc_main_nav .draggable,#topArea{-webkit-app-region:drag!important}' +
    '.omc-draggable a,.omc-draggable button,.omc-draggable input,.omc-draggable textarea,.omc-draggable select,.omc-draggable [role="button"],.omc-draggable [role="link"],.omc-draggable [contenteditable="true"],.omc-draggable [tabindex]:not([tabindex="-1"]),.omc-draggable [title],#page_pc_main_nav a,#page_pc_main_nav button,#page_pc_main_nav input,#page_pc_main_nav textarea,#page_pc_main_nav select,#page_pc_main_nav [role="button"],#page_pc_main_nav [role="link"],#page_pc_main_nav [contenteditable="true"],#page_pc_main_nav [tabindex]:not([tabindex="-1"]),#page_pc_main_nav [title]{-webkit-app-region:no-drag!important}' +
    '#omc-window-controls{position:relative;z-index:20;display:flex;align-self:center;align-items:center;height:28px;margin:0 8px 0 auto;overflow:hidden;flex:0 0 auto;-webkit-app-region:no-drag!important;background:transparent;color:inherit;}' +
    '#omc-window-controls::before{content:"";width:1px;height:14px;margin:0 8px;flex:0 0 auto;background:currentColor;opacity:.2;}' +
    '#omc-window-controls.omc-floating{position:fixed;top:4px;right:4px;height:28px;margin:0;z-index:2147483647;background:rgba(24,24,27,.82);border-radius:5px;}' +
    '.omc-win-btn{appearance:none;width:32px;height:28px;padding:0;display:flex;align-items:center;justify-content:center;cursor:default;border:0;border-radius:4px;background:transparent;color:inherit;opacity:.62;-webkit-app-region:no-drag!important;transition:background-color .12s ease,color .12s ease,opacity .12s ease;}' +
    '.omc-win-btn:hover{background:transparent;opacity:1}' +
    '.omc-win-btn:active{background:transparent;opacity:.76}' +
    '.omc-win-btn:focus-visible{outline:1px solid currentColor;outline-offset:-2px;opacity:1}' +
    '.omc-win-btn.close:hover{background:transparent;color:inherit}' +
    '.omc-win-btn.close:active{background:transparent;color:inherit}' +
    '#omc-btn-max .omc-restore-icon{display:none}' +
    '#omc-btn-max[data-maximized="true"] .omc-maximize-icon{display:none}' +
    '#omc-btn-max[data-maximized="true"] .omc-restore-icon{display:block}' +
    '#omc-mini-player{position:fixed;inset:0;z-index:2147483647;display:none;overflow:hidden;background:#171719;color:#f5f5f5;font-family:"Microsoft YaHei UI","Segoe UI",sans-serif;-webkit-app-region:drag}' +
    '.omc-mini-active #omc-mini-player{display:block}' +
    '.omc-mini-active #omc-window-controls{display:none}' +
    '#omc-mini-art{position:absolute;inset:0;overflow:hidden;background:linear-gradient(145deg,#29292d,#111)}' +
    '#omc-mini-art::after{content:"";position:absolute;inset:0;background:linear-gradient(180deg,rgba(0,0,0,.08),rgba(0,0,0,.42))}' +
    '#omc-mini-cover{width:100%;height:100%;display:block;object-fit:cover}' +
    '.omc-mini-button{appearance:none;width:28px;height:28px;padding:0;display:flex;align-items:center;justify-content:center;border:0;border-radius:50%;background:rgba(10,10,12,.38);color:rgba(255,255,255,.78);cursor:default;backdrop-filter:blur(10px);-webkit-app-region:no-drag;transition:color .12s ease,background-color .12s ease,opacity .12s ease}' +
    '.omc-mini-button:hover{color:#fff;background:rgba(10,10,12,.58)}' +
    '.omc-mini-button:active{opacity:.7}' +
    '#omc-mini-hover-zone{position:absolute;left:0;right:0;bottom:0;z-index:3;height:24px;-webkit-app-region:no-drag}' +
    '#omc-mini-panel{position:absolute;left:0;right:0;bottom:0;z-index:4;height:104px;padding:11px 14px 10px;display:flex;flex-direction:column;justify-content:center;opacity:0;transform:translateY(100%);pointer-events:none;background:rgba(245,245,247,.96);color:#252529;box-shadow:0 -1px rgba(255,255,255,.12);-webkit-app-region:drag;transition:opacity .18s ease,transform .18s ease}' +
    '#omc-mini-hover-zone:hover~#omc-mini-panel,#omc-mini-panel:hover{opacity:1;transform:translateY(0);pointer-events:auto}' +
    '#omc-mini-info{min-width:0;text-align:center}' +
    '#omc-mini-title{overflow:hidden;text-overflow:ellipsis;white-space:nowrap;font-size:14px;font-weight:600;line-height:20px}' +
    '#omc-mini-artist{overflow:hidden;text-overflow:ellipsis;white-space:nowrap;margin-top:1px;font-size:11px;line-height:17px;color:#85858d}' +
    '#omc-mini-controls{height:38px;margin-top:5px;display:flex;align-items:center;justify-content:center;gap:9px;opacity:0;transform:translateY(3px);pointer-events:none;-webkit-app-region:no-drag;transition:opacity .16s ease,transform .16s ease}' +
    '#omc-mini-hover-zone:hover~#omc-mini-panel #omc-mini-controls,#omc-mini-panel:hover #omc-mini-controls{opacity:1;transform:translateY(0);pointer-events:auto}' +
    '#omc-mini-controls .omc-mini-button{width:30px;height:30px;background:transparent;color:#66666d;backdrop-filter:none}' +
    '#omc-mini-controls .omc-mini-button:hover{background:transparent;color:#171719}' +
    '#omc-mini-play{width:34px!important;height:34px!important;border:1px solid #77777e!important;color:#303035!important}' +
    '#omc-mini-play .omc-pause-icon{display:none}' +
    '#omc-mini-play[data-playing="true"] .omc-play-icon{display:none}' +
    '#omc-mini-play[data-playing="true"] .omc-pause-icon{display:block}';

  function mountStyles() {
    var root = document.head || document.documentElement;
    if (!root) return false;
    if (!document.getElementById(css.id)) root.appendChild(css);
    return true;
  }

  if (!mountStyles()) {
    document.addEventListener('DOMContentLoaded', mountStyles, { once: true });
  }

  if (window !== window.top) {
    window.addEventListener('message', function (event) {
      if (event.origin === 'https://music.163.com' && event.data && event.data.type === 'omc-media-action') {
        performMediaAction(event.data.action);
      }
    });
    setupMediaPolling(null, null, function (metadata, playing) {
      window.top.postMessage({
        type: 'omc-media-state',
        metadata: metadata,
        playing: playing
      }, 'https://music.163.com');
    });
    return;
  }

  // ── Wait for Tauri ──
  function poll(fn, interval, timeout) {
    var elapsed = 0;
    var id = setInterval(function () {
      elapsed += interval;
      if (fn()) { clearInterval(id); }
      else if (elapsed >= timeout) { clearInterval(id); }
    }, interval);
  }

  poll(function () {
    if (!window.__TAURI__) return false;
    try { setup(window.__TAURI__); } catch (e) { console.error('[omc]', e); }
    return true;
  }, 100, 10000);

  function setup(T) {
    var invoke = T.core.invoke;
    var listen = T.event.listen;
    var getWin = T.window.getCurrentWindow;
    var appWin = getWin();
    var miniPlayer = setupMiniPlayer(T, appWin);
    var bridgedMetadata = '';
    var bridgedPlaying = null;

    window.addEventListener('message', function (event) {
      if (event.origin !== 'https://music.163.com' || !event.data || event.data.type !== 'omc-media-state') return;
      var metadata = event.data.metadata;
      var playing = !!event.data.playing;
      if (metadata) {
        miniPlayer.updateMetadata(metadata);
        var metadataKey = JSON.stringify(metadata);
        if (metadataKey !== bridgedMetadata) {
          bridgedMetadata = metadataKey;
          invoke('update_media_metadata', {
            title: metadata.title || '',
            artist: metadata.artist || '',
            album: metadata.album || '',
            coverUrl: metadata.artwork || ''
          });
        }
      }
      miniPlayer.updatePlayback(playing);
      if (playing !== bridgedPlaying) {
        bridgedPlaying = playing;
        invoke('update_play_status', { playing: playing });
      }
    });

    // ── Window controls ──
    waitFor('#page_pc_main_nav', function (nav) {
      nav.classList.add('omc-draggable');
      nav.setAttribute('data-tauri-drag-region', '');
      Array.prototype.forEach.call(nav.querySelectorAll('.draggable'), function (region) {
        region.setAttribute('data-tauri-drag-region', '');
      });
      var topArea = document.getElementById('topArea');
      if (topArea) {
        topArea.classList.add('omc-draggable');
        topArea.setAttribute('data-tauri-drag-region', '');
      }
      setupWindowControls(appWin, nav, false, miniPlayer);
      setupTitlebarDragging(appWin);
    }, function () {
      setupWindowControls(appWin, document.documentElement, true, miniPlayer);
      setupTitlebarDragging(appWin);
    });

    // ── Login interception ──
    // Click on login links
    document.addEventListener('click', function (e) {
      try {
        var a = e.target.closest && e.target.closest('a[href]');
        if (a && a.href && a.href.indexOf('/login') !== -1) {
          e.preventDefault();
          e.stopPropagation();
          invoke('open_login_window');
        }
      } catch (x) {}
    }, true);

    // Listen for Rust telling us navigation to /login was blocked
    listen('open-login', function () {
      invoke('open_login_window');
    });

    // ── Media: polling-based (no monkey-patching, avoids WebView2 crash) ──
    setupMediaPolling(T, miniPlayer);

    // ── Media control from Rust (shortcuts/tray) ──
    listen('media-control', function (ev) {
      performMediaAction(ev.payload);
    });

    // ── Window state ──
    var saveTimer;
    function save() {
      if (document.documentElement.classList.contains('omc-mini-active')) return;
      appWin.scaleFactor().then(function (f) {
        return Promise.all([appWin.innerSize(), appWin.innerPosition(), appWin.isMaximized()]).then(function (r) {
          localStorage.setItem('omc-ws', JSON.stringify({ w: Math.round(r[0].width / f), h: Math.round(r[0].height / f), x: Math.round(r[1].x / f), y: Math.round(r[1].y / f), m: r[2] }));
        });
      }).catch(function () {});
    }
    appWin.onMoved(function () { clearTimeout(saveTimer); saveTimer = setTimeout(save, 500); });
    appWin.onResized(function () { clearTimeout(saveTimer); saveTimer = setTimeout(save, 500); });
    try {
      var s = JSON.parse(localStorage.getItem('omc-ws'));
      if (s) {
        if (s.m) appWin.maximize();
        else {
          if (s.w && s.h) appWin.setSize(new T.window.LogicalSize(s.w, s.h));
          if (s.x != null && s.y != null) appWin.setPosition(new T.window.LogicalPosition(s.x, s.y));
        }
      }
    } catch (x) {}
  }

  function setupWindowControls(appWin, host, floating, miniPlayer) {
    var existing = document.getElementById('omc-window-controls');
    if (existing) {
      if (host && existing.parentNode !== host) host.appendChild(existing);
      existing.classList.toggle('omc-floating', !!floating);
      return;
    }
    if (!document.documentElement) {
      document.addEventListener('DOMContentLoaded', function () {
        setupWindowControls(appWin, host, floating, miniPlayer);
      }, { once: true });
      return;
    }

    var controls = document.createElement('div');
    controls.id = 'omc-window-controls';
    controls.setAttribute('role', 'group');
    controls.setAttribute('aria-label', '窗口控制');
    controls.classList.toggle('omc-floating', !!floating);
    controls.innerHTML =
      '<button type="button" class="omc-win-btn mini" id="omc-btn-mini" title="封面 Mini 模式" aria-label="封面 Mini 模式"><svg aria-hidden="true" viewBox="0 0 12 12" width="12" height="12"><rect x="1.5" y="4" width="8" height="6.5" rx="1" fill="none" stroke="currentColor"/><path d="M3.5 4V2.5a1 1 0 0 1 1-1h5a1 1 0 0 1 1 1v5a1 1 0 0 1-1 1" fill="none" stroke="currentColor"/></svg></button>' +
      '<button type="button" class="omc-win-btn minimize" id="omc-btn-min" title="最小化" aria-label="最小化"><svg aria-hidden="true" viewBox="0 0 12 12" width="12" height="12"><path d="M1 6.5h10" fill="none" stroke="currentColor" stroke-width="1"/></svg></button>' +
      '<button type="button" class="omc-win-btn maximize" id="omc-btn-max" title="最大化" aria-label="最大化"><svg class="omc-maximize-icon" aria-hidden="true" viewBox="0 0 12 12" width="12" height="12"><rect x="1.5" y="1.5" width="9" height="9" fill="none" stroke="currentColor" stroke-width="1"/></svg><svg class="omc-restore-icon" aria-hidden="true" viewBox="0 0 12 12" width="12" height="12"><path d="M3.5 3.5V1.5h7v7h-2M1.5 3.5h7v7h-7z" fill="none" stroke="currentColor" stroke-width="1"/></svg></button>' +
      '<button type="button" class="omc-win-btn close" id="omc-btn-close" title="关闭" aria-label="关闭"><svg aria-hidden="true" viewBox="0 0 12 12" width="12" height="12"><path d="M1.5 1.5l9 9m0-9l-9 9" fill="none" stroke="currentColor" stroke-width="1"/></svg></button>';
    (host || document.documentElement).appendChild(controls);

    function stopPageEvent(e) {
      e.preventDefault();
      e.stopPropagation();
    }

    var mini = document.getElementById('omc-btn-mini');
    var minimize = document.getElementById('omc-btn-min');
    var maximize = document.getElementById('omc-btn-max');
    var close = document.getElementById('omc-btn-close');
    [mini, minimize, maximize, close].forEach(function (button) {
      button.addEventListener('pointerdown', stopPageEvent);
      button.addEventListener('click', function (e) { e.stopPropagation(); });
    });

    mini.addEventListener('click', miniPlayer.enter);
    minimize.addEventListener('click', function () { appWin.minimize(); });
    maximize.addEventListener('click', function () {
      appWin.isMaximized().then(function (isMaximized) {
        return isMaximized ? appWin.unmaximize() : appWin.maximize();
      }).then(updateMaximizedState);
    });
    close.addEventListener('click', function () { appWin.hide(); });

    function updateMaximizedState() {
      appWin.isMaximized().then(function (isMaximized) {
        maximize.setAttribute('data-maximized', String(isMaximized));
        maximize.setAttribute('title', isMaximized ? '还原' : '最大化');
        maximize.setAttribute('aria-label', isMaximized ? '还原' : '最大化');
      });
    }
    updateMaximizedState();
    appWin.onResized(updateMaximizedState);
  }

  function setupMiniPlayer(T, appWin) {
    var mode = 'normal';
    var transitioning = false;
    var restoreState = null;
    var lastMetadata = null;
    var lastPlaying = false;

    function mount() {
      if (!document.documentElement || document.getElementById('omc-mini-player')) return;
      var player = document.createElement('section');
      player.id = 'omc-mini-player';
      player.setAttribute('aria-label', 'Mini 播放器');
      player.innerHTML =
        '<div id="omc-mini-art"><img id="omc-mini-cover" alt="专辑封面"></div>' +
        '<div id="omc-mini-hover-zone" aria-hidden="true"></div>' +
        '<div id="omc-mini-panel"><div id="omc-mini-info"><div id="omc-mini-title">网易云音乐</div><div id="omc-mini-artist">等待播放</div></div><div id="omc-mini-controls">' +
        '<button class="omc-mini-button" id="omc-mini-exit" title="恢复主窗口" aria-label="恢复主窗口"><svg viewBox="0 0 12 12" width="13" height="13"><path d="M4.5 1.5h-3v3m9-3h-3v3m-6 3v3h3m6-3v3h-3M1.5 4.5l3-3m3 0l3 3m-9 3l3 3m3 0l3-3" fill="none" stroke="currentColor"/></svg></button>' +
        '<button class="omc-mini-button" id="omc-mini-prev" title="上一首" aria-label="上一首"><svg viewBox="0 0 12 12" width="13" height="13"><path d="M2.5 2v8m7-7.5L4 6l5.5 3.5z" fill="currentColor"/></svg></button>' +
        '<button class="omc-mini-button" id="omc-mini-play" title="播放/暂停" aria-label="播放/暂停"><svg class="omc-play-icon" viewBox="0 0 12 12" width="15" height="15"><path d="M3 1.8L10 6 3 10.2z" fill="currentColor"/></svg><svg class="omc-pause-icon" viewBox="0 0 12 12" width="14" height="14"><path d="M3 2h2v8H3zm4 0h2v8H7z" fill="currentColor"/></svg></button>' +
        '<button class="omc-mini-button" id="omc-mini-next" title="下一首" aria-label="下一首"><svg viewBox="0 0 12 12" width="13" height="13"><path d="M9.5 2v8m-7-7.5L8 6 2.5 9.5z" fill="currentColor"/></svg></button>' +
        '</div></div>';
      document.documentElement.appendChild(player);

      player.querySelectorAll('button').forEach(function (button) {
        button.addEventListener('pointerdown', function (e) { e.stopPropagation(); });
      });
      document.getElementById('omc-mini-exit').addEventListener('click', exit);
      document.getElementById('omc-mini-prev').addEventListener('click', function () { performMediaAction('previoustrack'); });
      document.getElementById('omc-mini-next').addEventListener('click', function () { performMediaAction('nexttrack'); });
      document.getElementById('omc-mini-play').addEventListener('click', function () {
        performMediaAction(lastPlaying ? 'pause' : 'play');
      });
      updateMetadata(lastMetadata);
      updatePlayback(lastPlaying);
    }

    function enter() {
      if (mode !== 'normal' || transitioning) return;
      transitioning = true;
      Promise.all([appWin.scaleFactor(), appWin.innerSize(), appWin.innerPosition(), appWin.isMaximized()]).then(function (state) {
        restoreState = {
          width: Math.round(state[1].width / state[0]),
          height: Math.round(state[1].height / state[0]),
          x: Math.round(state[2].x / state[0]),
          y: Math.round(state[2].y / state[0]),
          maximized: state[3]
        };
        var ready = state[3] ? appWin.unmaximize() : Promise.resolve();
        return ready
          .then(function () { return appWin.setMinSize(new T.window.LogicalSize(320, 320)); })
          .then(function () { return appWin.setSize(new T.window.LogicalSize(320, 320)); })
          .then(function () { return appWin.setAlwaysOnTop(true); });
      }).then(function () {
        mode = 'expanded';
        document.documentElement.classList.add('omc-mini-active');
      }).catch(function (error) {
        console.error('[omc] failed to enter Mini mode', error);
      }).then(function () { transitioning = false; });
    }

    function exit() {
      if (mode === 'normal' || transitioning) return;
      transitioning = true;
      var state = restoreState;
      document.documentElement.classList.remove('omc-mini-active');
      mode = 'normal';
      appWin.setAlwaysOnTop(false)
        .then(function () { return appWin.setMinSize(new T.window.LogicalSize(800, 600)); })
        .then(function () {
          if (!state) return;
          if (state.maximized) return appWin.maximize();
          return appWin.setSize(new T.window.LogicalSize(state.width, state.height)).then(function () {
            return appWin.setPosition(new T.window.LogicalPosition(state.x, state.y));
          });
        }).catch(function (error) {
          console.error('[omc] failed to exit Mini mode', error);
        }).then(function () { transitioning = false; });
    }

    function updateMetadata(metadata) {
      if (metadata) lastMetadata = metadata;
      var title = document.getElementById('omc-mini-title');
      if (!title) return;
      var artist = document.getElementById('omc-mini-artist');
      var cover = document.getElementById('omc-mini-cover');
      title.textContent = (lastMetadata && lastMetadata.title) || '网易云音乐';
      artist.textContent = (lastMetadata && lastMetadata.artist) || '等待播放';
      var artwork = lastMetadata && lastMetadata.artwork;
      if (artwork) {
        cover.src = artwork;
      }
    }

    function updatePlayback(playing) {
      lastPlaying = !!playing;
      var play = document.getElementById('omc-mini-play');
      if (play) play.setAttribute('data-playing', String(lastPlaying));
    }

    if (document.documentElement) mount();
    else document.addEventListener('DOMContentLoaded', mount, { once: true });

    return {
      enter: enter,
      updateMetadata: updateMetadata,
      updatePlayback: updatePlayback
    };
  }

  function performMediaAction(action) {
    try {
      var handler = window.__omc_media_handlers && window.__omc_media_handlers[action];
      if (typeof handler === 'function') {
        handler({ action: action });
        return;
      }
      var selectors = {
        play: '#btn_pc_minibar_play',
        pause: '#btn_pc_minibar_play',
        nexttrack: '[aria-label="next"]',
        previoustrack: '[aria-label="pre"]'
      };
      var button = document.querySelector(selectors[action]);
      var audio = document.querySelector('audio');
      if (window === window.top) {
        var contentFrame = document.querySelector('#g_iframe,iframe[name="contentFrame"]');
        try {
          if (!button && contentFrame && contentFrame.contentDocument) {
            button = contentFrame.contentDocument.querySelector(selectors[action]);
          }
          if (!audio && contentFrame && contentFrame.contentDocument) {
            audio = contentFrame.contentDocument.querySelector('audio');
          }
        } catch (error) {}
      }
      if (button) {
        if (button.tagName !== 'BUTTON') button = button.closest('button') || button;
        button.click();
        return;
      }
      if (audio && action === 'play') {
        audio.play();
        return;
      }
      if (audio && action === 'pause') {
        audio.pause();
        return;
      }
      if (window === window.top) {
        Array.prototype.forEach.call(window.frames, function (frame) {
          frame.postMessage({ type: 'omc-media-action', action: action }, 'https://music.163.com');
        });
      }
    } catch (error) {}
  }

  function getBestArtwork(artwork) {
    if (!artwork || !artwork.length) return '';
    var best = artwork[artwork.length - 1];
    var bestArea = 0;
    artwork.forEach(function (item) {
      var match = item.sizes && item.sizes.match(/(\d+)x(\d+)/);
      var area = match ? Number(match[1]) * Number(match[2]) : 0;
      if (area >= bestArea) {
        best = item;
        bestArea = area;
      }
    });
    return getOriginalArtworkUrl(best.src);
  }

  function getOriginalArtworkUrl(src) {
    if (!src) return '';
    try {
      var url = new URL(src, window.location.href);
      if (/\.music\.126\.net$/.test(url.hostname)) url.search = '';
      return url.toString();
    } catch (error) {
      return src;
    }
  }

  function readDomMediaState(scope) {
    if (!scope) return null;
    var info = scope.querySelector('[class*="songPlayInfo"]');
    var playButton = scope.querySelector('#btn_pc_minibar_play');
    if (!info && !playButton) return null;

    var title = '';
    var titleRoot = info && info.querySelector('.title');
    if (titleRoot) {
      var titleParts = titleRoot.querySelectorAll('span');
      for (var i = 0; i < titleParts.length; i++) {
        var part = titleParts[i];
        if (!part.classList.contains('link') && !part.classList.contains('author') && part.textContent.trim() !== '-') {
          title = part.textContent.trim();
          if (title) break;
        }
      }
    }
    var artistNode = info && info.querySelector('.author');
    var cover = scope.querySelector('.miniVinylWrapper img') || scope.querySelector('[class*="miniVinylWrapper"] img');
    var stateIcon = playButton && playButton.querySelector('[aria-label]');
    var stateLabel = stateIcon ? stateIcon.getAttribute('aria-label') : '';

    return {
      metadata: title ? {
        title: title,
        artist: artistNode ? artistNode.textContent.trim() : '',
        album: '',
        artwork: getOriginalArtworkUrl(cover && (cover.currentSrc || cover.src))
      } : null,
      playing: stateLabel === 'pause' || (stateIcon && stateIcon.getAttribute('title') === '暂停')
    };
  }

  function setupTitlebarDragging(appWin) {
    var dragHost = document.documentElement;
    if (dragHost.dataset.omcDraggingReady) return;
    dragHost.dataset.omcDraggingReady = 'true';
    var extraDragHeight = 24;
    var interactiveSelector = [
      '#omc-window-controls',
      'a',
      'button',
      'input',
      'textarea',
      'select',
      'option',
      'label',
      '[role="button"]',
      '[role="link"]',
      '[contenteditable="true"]',
      '[tabindex]:not([tabindex="-1"])',
      '[title]'
    ].join(',');

    function isDraggableTarget(target) {
      if (!target || target.nodeType !== Node.ELEMENT_NODE) return false;
      var interactive = target.closest(interactiveSelector);
      var nav = document.getElementById('page_pc_main_nav');
      // Some themes mark the navbar container itself as focusable/clickable.
      // Only descendants that are actual controls should block dragging.
      return !interactive || interactive === nav;
    }

    function isInDragBand(e) {
      var nav = document.getElementById('page_pc_main_nav');
      if (!nav) return e.clientY >= 0 && e.clientY <= 56;
      var bounds = nav.getBoundingClientRect();
      return e.clientY >= bounds.top && e.clientY <= bounds.bottom + extraDragHeight;
    }

    document.addEventListener('pointerdown', function (e) {
      if (e.button !== 0 || !isInDragBand(e) || !isDraggableTarget(e.target)) return;
      e.preventDefault();
      appWin.startDragging();
    }, true);

    document.addEventListener('dblclick', function (e) {
      if (!isInDragBand(e) || !isDraggableTarget(e.target)) return;
      e.preventDefault();
      appWin.isMaximized().then(function (isMaximized) {
        return isMaximized ? appWin.unmaximize() : appWin.maximize();
      });
    }, true);
  }

  // ── MediaSession: no monkey-patching, use polling to read state ──
  // WebView2 crashes if we patch HTMLAudioElement.prototype or MediaSession.prototype
  // Instead, poll navigator.mediaSession for metadata changes
  function setupMediaPolling(T, miniPlayer, relay) {
    var invoke = T && T.core.invoke;
    var lastMetadata = '';
    var lastPlaying = null;
    window.__omc_media_handlers = {};

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
        if (!meta && !audio && !domState) return;

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

        var metadataKey = metadata ? JSON.stringify(metadata) : '';
        var metadataChanged = !!metadata && metadataKey !== lastMetadata;
        var playingChanged = playing !== lastPlaying;
        if (relay && (metadataChanged || playingChanged)) relay(metadata, playing);
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
        if (metadata) lastMetadata = metadataKey;
        lastPlaying = playing;
      } catch (e) {}
    }

    document.addEventListener('play', update, true);
    document.addEventListener('pause', update, true);
    document.addEventListener('ended', update, true);
    document.addEventListener('loadedmetadata', update, true);
    setInterval(update, 250);
  }

  // ── Simple waitFor ──
  function waitFor(sel, ok, fail) {
    var el = document.querySelector(sel);
    if (el) return ok(el);
    var tries = 0;
    var id = setInterval(function () {
      tries++;
      var found = document.querySelector(sel);
      if (found) { clearInterval(id); ok(found); }
      else if (tries > 100) { clearInterval(id); if (fail) fail(); }
    }, 150);
  }
})();

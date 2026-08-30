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
    '#omc-mini-player{position:fixed;inset:0;z-index:2147483647;display:none;overflow:hidden;background:#171719;color:#f5f5f5;font-family:"Microsoft YaHei UI","Segoe UI",sans-serif}' +
    '.omc-mini-active #omc-mini-player{display:block}' +
    '.omc-mini-active #omc-window-controls{display:none}' +
    '#omc-mini-art{position:absolute;inset:0;overflow:hidden;background:linear-gradient(145deg,#29292d,#111);-webkit-app-region:no-drag}' +
    '#omc-mini-cover{width:100%;height:100%;display:block;object-fit:cover;user-select:none;-webkit-user-drag:none;-webkit-app-region:no-drag;transition:filter .32s ease,transform .32s ease,opacity .32s ease}' +
    '.omc-mini-lyrics #omc-mini-cover{filter:blur(18px) brightness(.42);transform:scale(1.16);opacity:.72}' +
    '#omc-mini-lyrics{position:absolute;inset:48px 18px 58px;z-index:2;display:flex;align-items:flex-start;overflow:hidden;opacity:0;pointer-events:none;transition:opacity .25s ease}' +
    '.omc-mini-lyrics #omc-mini-lyrics{opacity:1}' +
    '#omc-mini-lyric-list{width:100%;padding:110px 0;color:rgba(255,255,255,.48);text-align:center;font-size:13px;line-height:30px;transition:transform .34s cubic-bezier(.22,.72,.25,1)}' +
    '.omc-mini-lyric-line{min-height:30px;overflow:hidden;text-overflow:ellipsis;white-space:nowrap;transition:color .2s ease,font-size .2s ease,font-weight .2s ease}' +
    '.omc-mini-lyric-line.active{color:#fff;font-size:15px;font-weight:700;text-shadow:0 1px 9px rgba(255,255,255,.3)}' +
    '.omc-mini-toolbar{position:absolute;left:0;right:0;z-index:5;color:#303238;background:rgba(250,250,249,.965);backdrop-filter:blur(18px);opacity:0;pointer-events:none;transition:opacity .16s ease,transform .18s ease}' +
    '#omc-mini-player.omc-mini-cover-hover .omc-mini-toolbar{opacity:1;transform:translateY(0);pointer-events:auto}' +
    '#omc-mini-top{top:0;height:50px;display:grid;grid-template-columns:42px 1fr 42px;align-items:center;transform:translateY(-100%);-webkit-app-region:drag}' +
    '#omc-mini-window-actions{display:flex;align-items:center;padding-left:6px;-webkit-app-region:no-drag}' +
    '#omc-mini-player:not(.omc-mini-compact) #omc-mini-window-actions{height:46px;padding:2px 0 2px 6px;flex-direction:column;align-items:flex-start;justify-content:center}' +
    '#omc-mini-player:not(.omc-mini-compact) #omc-mini-window-actions .omc-mini-button{width:20px;height:20px}' +
    '#omc-mini-heading{min-width:0;text-align:center;line-height:1.25}' +
    '#omc-mini-title{overflow:hidden;text-overflow:ellipsis;white-space:nowrap;font-size:12px;font-weight:500;color:#303238}' +
    '#omc-mini-artist{overflow:hidden;text-overflow:ellipsis;white-space:nowrap;margin-top:2px;font-size:11px;color:#898b91}' +
    '#omc-mini-more{justify-self:center;letter-spacing:2px;color:#92949a;font-size:15px;-webkit-app-region:no-drag}' +
    '#omc-mini-bottom{bottom:0;height:58px;padding:5px 8px 10px;display:flex;align-items:center;gap:6px;transform:translateY(100%);-webkit-app-region:no-drag}' +
    '#omc-mini-thumb{width:36px;height:36px;flex:0 0 auto;border-radius:3px;object-fit:cover;background:#ddd}' +
    '#omc-mini-transport{position:absolute;left:50%;top:50%;display:flex;align-items:center;gap:2px;transform:translate(-50%,-50%)}' +
    '#omc-mini-tools{margin-left:auto;display:flex;align-items:center;gap:1px}' +
    '.omc-mini-button{appearance:none;width:28px;height:28px;padding:0;display:grid;place-items:center;border:0;border-radius:50%;background:transparent;color:#73767e;cursor:default;-webkit-app-region:no-drag;transition:color .12s ease,background-color .12s ease,transform .1s ease}' +
    '.omc-mini-button:hover{color:#292b31;background:#ececeb}' +
    '.omc-mini-button:active{transform:scale(.9)}' +
    '#omc-mini-play{width:31px;height:31px;background:#df3b3b;color:#fff}' +
    '#omc-mini-play:hover{background:#d33333;color:#fff}' +
    '#omc-mini-play .omc-pause-icon{display:none}' +
    '#omc-mini-play[data-playing="true"] .omc-play-icon{display:none}' +
    '#omc-mini-play[data-playing="true"] .omc-pause-icon{display:block}' +
    '#omc-mini-like.liked{color:#ec4141}' +
    '#omc-mini-like.liked svg{fill:currentColor}' +
    '#omc-mini-volume.muted{color:#b2b3b7}' +
    '#omc-mini-progress{position:absolute;left:54px;right:10px;bottom:5px;height:3px;border-radius:2px;background:#c9c9c9;cursor:pointer;-webkit-app-region:no-drag}' +
    '#omc-mini-progress-fill{display:block;width:0;height:100%;border-radius:inherit;background:#df3b3b}' +
    '#omc-mini-progress-thumb{position:absolute;top:50%;left:0;width:8px;height:8px;border-radius:50%;background:#df3b3b;transform:translate(-50%,-50%)}' +
    '.omc-mini-compact #omc-mini-art,.omc-mini-compact #omc-mini-lyrics{display:none}' +
    '.omc-mini-compact #omc-mini-top{left:0;right:auto;z-index:7;width:26px;height:58px;display:block;opacity:1;transform:none;pointer-events:auto;background:rgba(250,250,249,.98)}' +
    '.omc-mini-compact #omc-mini-window-actions{height:58px;padding:4px 0;flex-direction:column;justify-content:center}' +
    '.omc-mini-compact #omc-mini-window-actions .omc-mini-button{width:20px;height:20px}' +
    '.omc-mini-compact #omc-mini-heading,.omc-mini-compact #omc-mini-more{display:none}' +
    '.omc-mini-compact #omc-mini-bottom{left:0;height:58px;padding-left:28px;opacity:1;transform:none;pointer-events:auto;-webkit-app-region:drag}' +
    '#omc-mini-thumb-toggle{position:relative;width:36px;height:36px;padding:0;flex:0 0 auto;overflow:hidden;border:0;border-radius:3px;background:#292b31;color:#fff;cursor:pointer}' +
    '#omc-mini-thumb-toggle::after{content:"◆";position:absolute;inset:0;display:grid;place-items:center;background:rgba(25,27,31,.72);font-size:12px;opacity:0;transition:opacity .12s ease}' +
    '#omc-mini-thumb-toggle:hover::after{opacity:1}' +
    '.omc-mini-compact #omc-mini-thumb-toggle::after{content:"↕";opacity:1;font-size:17px;font-weight:600}' +
    '.omc-mini-compact #omc-mini-thumb-toggle:hover::after{background:rgba(25,27,31,.86)}' +
    '#omc-mini-queue-view{position:absolute;left:0;right:0;bottom:0;z-index:4;display:none;top:100vw;height:auto;overflow:hidden;background:#fafafa;color:#27292e;border-top:1px solid rgba(0,0,0,.08);opacity:0;transition:opacity .14s ease}' +
    '.omc-mini-queue-open #omc-mini-art{bottom:auto;height:100vw}' +
    '.omc-mini-queue-open .omc-mini-toolbar{transform:none}' +
    '.omc-mini-queue-open #omc-mini-bottom{top:calc(100vw - 58px);bottom:auto;transform:none}' +
    '.omc-mini-queue-open #omc-mini-queue-view{display:block;opacity:1}' +
    '#omc-mini-queue-list{height:100%;overflow-y:auto;scrollbar-width:none}' +
    '#omc-mini-queue-list::-webkit-scrollbar{display:none;width:0;height:0}' +
    '#omc-mini-queue-scrollbar{position:absolute;top:3px;right:2px;bottom:3px;width:5px}' +
    '#omc-mini-queue-scroll-thumb{position:absolute;top:0;right:0;width:4px;min-height:22px;border-radius:4px;background:#b7b7b7;opacity:.82;cursor:default}' +
    '.omc-mini-queue-row{height:34px;padding:0 22px;display:flex;align-items:center;gap:8px;cursor:default;font-size:12px;background:#fafafa}' +
    '.omc-mini-queue-row:nth-child(odd){background:#f4f4f4}' +
    '.omc-mini-queue-row:hover{background:#ececec}' +
    '.omc-mini-queue-row.active{color:#df3b3b}' +
    '.omc-mini-queue-title{min-width:0;overflow:hidden;text-overflow:ellipsis;white-space:nowrap}' +
    '.omc-mini-queue-artist{margin-left:auto;max-width:34%;overflow:hidden;text-overflow:ellipsis;white-space:nowrap;color:#97999e;font-size:10px}' +
    '.omc-mini-queue-row.active .omc-mini-queue-artist{color:#df7777}' +
    '#omc-mini-context{position:fixed;z-index:12;display:none;width:112px;padding:4px;border:1px solid rgba(0,0,0,.12);border-radius:5px;background:rgba(250,250,249,.98);box-shadow:0 5px 18px rgba(0,0,0,.22);color:#303238;font-size:12px;backdrop-filter:blur(16px);-webkit-app-region:no-drag}' +
    '#omc-mini-context.open{display:block}' +
    '.omc-mini-context-item{appearance:none;width:100%;height:28px;padding:0 8px;display:flex;align-items:center;gap:7px;border:0;border-radius:3px;background:transparent;color:inherit;text-align:left;font:inherit;cursor:default}' +
    '.omc-mini-context-item:hover{background:#e8e8e7}' +
    '.omc-mini-context-check{width:12px;text-align:center;visibility:hidden}' +
    '#omc-mini-context-topmost[aria-checked="true"] .omc-mini-context-check{visibility:visible}' +
    '@media(max-width:300px){#omc-mini-thumb-toggle,#omc-mini-like{display:none}#omc-mini-progress{left:10px}}' +
    '@media(hover:none){.omc-mini-toolbar{opacity:1!important;transform:none!important;pointer-events:auto!important}}';

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
    setupMediaPolling(null, null, function (metadata, playing, timeline) {
      window.top.postMessage({
        type: 'omc-media-state',
        metadata: metadata,
        playing: playing,
        timeline: timeline
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
      miniPlayer.updatePlayback(playing, true);
      miniPlayer.updateTimeline(event.data.timeline);
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
    var restoreWindow = Promise.resolve();
    try {
      var s = JSON.parse(localStorage.getItem('omc-ws'));
      if (s) {
        if (s.m) {
          restoreWindow = appWin.maximize();
        } else {
          if (s.w && s.h) {
            restoreWindow = restoreWindow.then(function () {
              return appWin.setSize(new T.window.LogicalSize(s.w, s.h));
            });
          }
          if (s.x != null && s.y != null) {
            restoreWindow = restoreWindow.then(function () {
              return appWin.setPosition(new T.window.LogicalPosition(s.x, s.y));
            });
          }
        }
      }
    } catch (x) {}
    restoreWindow.catch(function (error) {
      console.error('[omc] failed to restore window state', error);
    }).then(function () {
      return appWin.show();
    }).then(function () {
      return appWin.setFocus();
    }).catch(function (error) {
      console.error('[omc] failed to show main window', error);
    });
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
    var lyricMode = false;
    var compactMode = false;
    var queueMode = false;
    var queueRenderKey = '';
    var preQueueHeight = 336;
    var miniDragCandidate = null;
    var queueScrollDrag = null;
    var alwaysOnTop = true;
    var syncedTimeline = null;
    var syncedTimelineAt = 0;
    var bridgedPlaybackAt = 0;
    var liveInternalProgress = null;
    var internalProgressSubscribed = false;
    var lyricTrackId = null;
    var lyricLines = [];
    var activeLyricIndex = -1;

    function finishTransition(errorMessage, error) {
      if (error) console.error(errorMessage, error);
      return appWin.show().then(function () {
        return appWin.setFocus();
      }).catch(function (showError) {
        console.error('[omc] failed to reveal window after Mini transition', showError);
      }).then(function () { transitioning = false; });
    }

    function mount() {
      if (!document.documentElement || document.getElementById('omc-mini-player')) return;
      var player = document.createElement('section');
      player.id = 'omc-mini-player';
      player.setAttribute('aria-label', 'Mini 播放器');
      player.innerHTML =
        '<div id="omc-mini-art"><img id="omc-mini-cover" alt="专辑封面" draggable="false"></div>' +
        '<div id="omc-mini-lyrics"><div id="omc-mini-lyric-list"><div class="omc-mini-lyric-line">暂无歌词</div></div></div>' +
        '<header class="omc-mini-toolbar" id="omc-mini-top" data-tauri-drag-region>' +
          '<div id="omc-mini-window-actions"><button class="omc-mini-button" id="omc-mini-hide" title="隐藏" aria-label="隐藏"><svg viewBox="0 0 16 16" width="12" height="12" fill="none" stroke="currentColor" stroke-width="1"><path d="M3.5 3.5l9 9m0-9l-9 9"/></svg></button><button class="omc-mini-button" id="omc-mini-exit" title="恢复主窗口" aria-label="恢复主窗口"><svg viewBox="0 0 16 16" width="11" height="11" fill="none" stroke="currentColor" stroke-width="1"><rect x="3.5" y="3.5" width="9" height="9"/></svg></button></div>' +
          '<div id="omc-mini-heading" data-tauri-drag-region><div id="omc-mini-title">网易云音乐</div><div id="omc-mini-artist">等待播放</div></div>' +
          '<button class="omc-mini-button" id="omc-mini-more" title="播放队列" aria-label="播放队列">•••</button>' +
        '</header>' +
        '<footer class="omc-mini-toolbar" id="omc-mini-bottom">' +
          '<button id="omc-mini-thumb-toggle" title="切换 Mini 布局" aria-label="切换 Mini 布局"><img id="omc-mini-thumb" alt="专辑封面缩略图"></button>' +
          '<div id="omc-mini-transport">' +
            '<button class="omc-mini-button" id="omc-mini-prev" title="上一首" aria-label="上一首"><svg viewBox="0 0 20 20" width="15" height="15" fill="currentColor"><path d="M4 4h2v12H4zm3 6 9-6v12z"/></svg></button>' +
            '<button class="omc-mini-button" id="omc-mini-play" title="播放/暂停" aria-label="播放/暂停"><svg class="omc-play-icon" viewBox="0 0 20 20" width="15" height="15" fill="currentColor"><path d="M6 3.8v12.4L16 10z"/></svg><svg class="omc-pause-icon" viewBox="0 0 20 20" width="14" height="14" fill="currentColor"><path d="M5 4h3v12H5zm7 0h3v12h-3z"/></svg></button>' +
            '<button class="omc-mini-button" id="omc-mini-next" title="下一首" aria-label="下一首"><svg viewBox="0 0 20 20" width="15" height="15" fill="currentColor"><path d="M14 4h2v12h-2zM4 4l9 6-9 6z"/></svg></button>' +
          '</div>' +
          '<div id="omc-mini-tools">' +
            '<button class="omc-mini-button" id="omc-mini-like" title="喜欢" aria-label="喜欢"><svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" stroke-width="1.6"><path d="M20.8 5.8a5.4 5.4 0 0 0-7.7 0L12 7l-1.1-1.2a5.4 5.4 0 0 0-7.7 7.7L12 22l8.8-8.5a5.4 5.4 0 0 0 0-7.7z"/></svg></button>' +
            '<button class="omc-mini-button" id="omc-mini-queue" title="播放列表" aria-label="播放列表"><svg viewBox="0 0 20 20" width="17" height="17" fill="none" stroke="currentColor" stroke-width="1.3"><path d="M7 5h9M7 10h9M7 15h9M3.5 5h.1M3.5 10h.1M3.5 15h.1" stroke-linecap="round"/></svg></button>' +
            '<button class="omc-mini-button" id="omc-mini-volume" title="静音" aria-label="静音"><svg viewBox="0 0 20 20" width="17" height="17" fill="none" stroke="currentColor" stroke-width="1.3"><path d="M3 8h3l4-3v10l-4-3H3zM13 7.2c1.4 1.5 1.4 4.1 0 5.6M15.2 5c2.6 2.8 2.6 7.2 0 10" stroke-linecap="round" stroke-linejoin="round"/></svg></button>' +
          '</div>' +
          '<div id="omc-mini-progress"><span id="omc-mini-progress-fill"></span><span id="omc-mini-progress-thumb"></span></div>' +
        '</footer>' +
        '<section id="omc-mini-queue-view"><div id="omc-mini-queue-list"></div><div id="omc-mini-queue-scrollbar"><div id="omc-mini-queue-scroll-thumb" role="scrollbar" aria-label="播放队列滚动条"></div></div></section>' +
        '<div id="omc-mini-context" role="menu"><button class="omc-mini-context-item" id="omc-mini-context-restore" role="menuitem"><span class="omc-mini-context-check"></span><span>回到主界面</span></button><button class="omc-mini-context-item" id="omc-mini-context-topmost" role="menuitemcheckbox" aria-checked="true"><span class="omc-mini-context-check">✓</span><span>总在最前</span></button></div>';
      document.documentElement.appendChild(player);

      player.querySelectorAll('button').forEach(function (button) {
        button.addEventListener('pointerdown', function (e) { e.stopPropagation(); });
      });
      document.getElementById('omc-mini-hide').addEventListener('click', function () { appWin.hide(); });
      document.getElementById('omc-mini-exit').addEventListener('click', exit);
      document.getElementById('omc-mini-prev').addEventListener('click', function () { performMediaAction('previoustrack'); });
      document.getElementById('omc-mini-next').addEventListener('click', function () { performMediaAction('nexttrack'); });
      document.getElementById('omc-mini-play').addEventListener('click', function () {
        performMediaAction(lastPlaying ? 'pause' : 'play');
      });
      document.getElementById('omc-mini-like').addEventListener('click', function () { performMediaAction('like'); });
      document.getElementById('omc-mini-queue').addEventListener('click', toggleQueue);
      document.getElementById('omc-mini-more').addEventListener('click', toggleQueue);
      document.getElementById('omc-mini-queue-list').addEventListener('scroll', updateQueueScrollbar);
      document.getElementById('omc-mini-queue-scrollbar').addEventListener('pointerdown', jumpQueueScrollbar);
      document.getElementById('omc-mini-queue-scroll-thumb').addEventListener('pointerdown', startQueueScrollbarDrag);
      document.addEventListener('pointermove', dragQueueScrollbar);
      document.addEventListener('pointerup', stopQueueScrollbarDrag);
      document.addEventListener('pointercancel', stopQueueScrollbarDrag);
      document.getElementById('omc-mini-volume').addEventListener('click', toggleMute);
      document.getElementById('omc-mini-thumb-toggle').addEventListener('click', toggleCompact);
      document.getElementById('omc-mini-art').addEventListener('dblclick', toggleLyrics);
      document.getElementById('omc-mini-art').addEventListener('contextmenu', showContextMenu);
      document.getElementById('omc-mini-progress').addEventListener('pointerdown', seek);
      document.getElementById('omc-mini-context-restore').addEventListener('click', function () {
        hideContextMenu();
        exit();
      });
      document.getElementById('omc-mini-context-topmost').addEventListener('click', toggleAlwaysOnTop);
      player.addEventListener('pointerdown', prepareMiniWindowDrag);
      player.addEventListener('pointermove', continueMiniWindowDrag);
      player.addEventListener('pointerup', cancelMiniWindowDrag);
      player.addEventListener('pointercancel', cancelMiniWindowDrag);
      player.addEventListener('pointermove', updateMiniHover);
      player.addEventListener('pointerleave', function () { player.classList.remove('omc-mini-cover-hover'); });
      document.addEventListener('pointerdown', function (event) {
        if (!event.target.closest('#omc-mini-context')) hideContextMenu();
      });
      document.addEventListener('keydown', function (event) {
        if (event.key === 'Escape') hideContextMenu();
      });
      updateMetadata(lastMetadata);
      updatePlayback(lastPlaying);
      subscribeInternalProgress();
      setTimeout(function () { renderQueue(false, true); }, 800);
      setInterval(function () { if (!queueMode) renderQueue(false, true); }, 2000);
    }

    function subscribeInternalProgress() {
      if (internalProgressSubscribed) return;
      var attempts = 0;
      var timer = setInterval(function () {
        attempts += 1;
        try {
          readInternalPlayerState(window);
          var require = window.__omcWebpackRequire;
          var progressStream = require && require(167).e;
          if (!progressStream || typeof progressStream.subscribe !== 'function') throw new Error('progress stream unavailable');
          progressStream.subscribe(function (progress) {
            liveInternalProgress = Array.isArray(progress) ? progress[0] : progress;
            updateTimeline();
          });
          internalProgressSubscribed = true;
          clearInterval(timer);
        } catch (error) {
          if (attempts >= 100) clearInterval(timer);
        }
      }, 100);
    }

    function updateMiniHover(event) {
      var coverHeight = queueMode ? Math.min(window.innerWidth, window.innerHeight) : window.innerHeight;
      event.currentTarget.classList.toggle('omc-mini-cover-hover', event.clientY >= 0 && event.clientY <= coverHeight);
    }

    function prepareMiniWindowDrag(event) {
      if (event.button !== 0 || mode === 'normal') return;
      if (event.target.closest('button,#omc-mini-progress,#omc-mini-queue-view,#omc-mini-context,.omc-mini-toolbar')) return;
      hideContextMenu();
      miniDragCandidate = { pointerId: event.pointerId, x: event.clientX, y: event.clientY };
    }

    function continueMiniWindowDrag(event) {
      if (!miniDragCandidate || miniDragCandidate.pointerId !== event.pointerId || !(event.buttons & 1)) return;
      var x = event.clientX - miniDragCandidate.x;
      var y = event.clientY - miniDragCandidate.y;
      if (x * x + y * y < 16) return;
      miniDragCandidate = null;
      event.preventDefault();
      appWin.startDragging().catch(function (error) {
        console.error('[omc] failed to drag Mini window', error);
      });
    }

    function cancelMiniWindowDrag(event) {
      if (miniDragCandidate && miniDragCandidate.pointerId === event.pointerId) miniDragCandidate = null;
    }

    function showContextMenu(event) {
      if (mode === 'normal') return;
      event.preventDefault();
      event.stopPropagation();
      var menu = document.getElementById('omc-mini-context');
      menu.style.left = Math.max(4, Math.min(event.clientX, window.innerWidth - 120)) + 'px';
      menu.style.top = Math.max(4, Math.min(event.clientY, window.innerHeight - 68)) + 'px';
      menu.classList.add('open');
    }

    function hideContextMenu() {
      var menu = document.getElementById('omc-mini-context');
      if (menu) menu.classList.remove('open');
    }

    function toggleAlwaysOnTop() {
      var next = !alwaysOnTop;
      appWin.setAlwaysOnTop(next).then(function () {
        alwaysOnTop = next;
        document.getElementById('omc-mini-context-topmost').setAttribute('aria-checked', String(next));
        hideContextMenu();
      }).catch(function (error) {
        console.error('[omc] failed to change always-on-top state', error);
      });
    }

    function getAudio() {
      var audio = document.querySelector('audio');
      try {
        var frame = document.querySelector('#g_iframe,iframe[name="contentFrame"]');
        if (!audio && frame && frame.contentDocument) audio = frame.contentDocument.querySelector('audio');
      } catch (error) {}
      return audio;
    }

    function toggleLyrics() {
      lyricMode = !lyricMode;
      var player = document.getElementById('omc-mini-player');
      if (player) player.classList.toggle('omc-mini-lyrics', lyricMode);
      if (lyricMode) loadLyrics();
    }

    function toggleMute() {
      var audio = getAudio();
      if (!audio) return;
      audio.muted = !audio.muted;
      document.getElementById('omc-mini-volume').classList.toggle('muted', audio.muted);
    }

    function toggleCompact() {
      if (mode === 'normal' || transitioning) return;
      transitioning = true;
      compactMode = !compactMode;
      queueMode = false;
      var width = compactMode ? 440 : 336;
      var height = compactMode ? 58 : 336;
      var minWidth = compactMode ? 340 : 240;
      var minHeight = compactMode ? 45 : 240;
      appWin.hide()
        .then(function () { return appWin.setMinSize(new T.window.LogicalSize(minWidth, minHeight)); })
        .then(function () { return appWin.setSize(new T.window.LogicalSize(width, height)); })
        .then(function () {
          var player = document.getElementById('omc-mini-player');
          player.classList.toggle('omc-mini-compact', compactMode);
          player.classList.remove('omc-mini-queue-open');
          return finishTransition();
        }, function (error) {
          return finishTransition('[omc] failed to switch Mini layout', error);
        });
    }

    function toggleQueue() {
      if (mode === 'normal' || transitioning) return;
      transitioning = true;
      var wasCompact = compactMode;
      queueMode = !queueMode;
      compactMode = false;
      if (queueMode && lyricMode) toggleLyrics();
      var player = document.getElementById('omc-mini-player');
      player.classList.remove('omc-mini-compact');
      if (queueMode) {
        player.classList.add('omc-mini-queue-open');
      }
      Promise.all([appWin.scaleFactor(), appWin.innerSize()]).then(function (state) {
        var from = {
          width: Math.round(state[1].width / state[0]),
          height: Math.round(state[1].height / state[0])
        };
        if (queueMode) {
          preQueueHeight = wasCompact ? Math.max(240, from.width) : from.height;
        }
        var target = {
          width: from.width,
          height: queueMode ? from.width + Math.max(150, Math.round(from.width * 0.48)) : preQueueHeight
        };
        var prepare = queueMode
          ? Promise.resolve()
          : appWin.setMinSize(new T.window.LogicalSize(240, 240));
        return prepare.then(function () { return animateMiniSize(from, target, 135); }).then(function () {
          if (queueMode) return appWin.setMinSize(new T.window.LogicalSize(240, from.width + 100));
        });
      }).then(function () {
        if (!queueMode) player.classList.remove('omc-mini-queue-open');
        transitioning = false;
        if (queueMode) {
          renderQueue(false);
          requestAnimationFrame(function () {
            var active = document.querySelector('#omc-mini-queue-list .active');
            if (active) active.scrollIntoView({ block: 'center' });
            updateQueueScrollbar();
          });
        }
      }, function (error) {
        console.error('[omc] failed to switch queue layout', error);
        player.classList.toggle('omc-mini-queue-open', queueMode);
        transitioning = false;
      });
    }

    function animateMiniSize(from, target, duration) {
      return new Promise(function (resolve, reject) {
        var step = 0;
        var steps = 5;
        function frame() {
          step += 1;
          var progress = step / steps;
          var eased = progress * progress * (3 - 2 * progress);
          var width = Math.round(from.width + (target.width - from.width) * eased);
          var height = Math.round(from.height + (target.height - from.height) * eased);
          appWin.setSize(new T.window.LogicalSize(width, height)).then(function () {
            if (step < steps) setTimeout(frame, duration / steps);
            else resolve();
          }).catch(reject);
        }
        frame();
      });
    }

    function renderQueue(force, allowHidden) {
      if (!queueMode && !allowHidden) return;
      var queue = readPlayingQueue(window);
      var key = queue.currentId + '|' + queue.items.map(function (item) { return item.id; }).join(',');
      if (!force && key === queueRenderKey) return;
      queueRenderKey = key;
      var list = document.getElementById('omc-mini-queue-list');
      if (!list) return;
      list.innerHTML = '';
      if (!queue.items.length) {
        var empty = document.createElement('div');
        empty.className = 'omc-mini-queue-row';
        empty.textContent = '播放队列为空';
        list.appendChild(empty);
        updateQueueScrollbar();
        return;
      }
      var fragment = document.createDocumentFragment();
      queue.items.forEach(function (item) {
        var row = document.createElement('div');
        row.className = 'omc-mini-queue-row';
        row.classList.toggle('active', item.id === queue.currentId);
        row.innerHTML = '<span class="omc-mini-queue-title"></span><span class="omc-mini-queue-artist"></span>';
        row.querySelector('.omc-mini-queue-title').textContent = item.title;
        row.querySelector('.omc-mini-queue-artist').textContent = item.artist;
        row.addEventListener('click', function () { playQueueItem(window, item.id); });
        fragment.appendChild(row);
      });
      list.appendChild(fragment);
      var active = list.querySelector('.active');
      if (active) active.scrollIntoView({ block: 'center' });
      requestAnimationFrame(updateQueueScrollbar);
    }

    function updateQueueScrollbar() {
      var list = document.getElementById('omc-mini-queue-list');
      var track = document.getElementById('omc-mini-queue-scrollbar');
      var thumb = document.getElementById('omc-mini-queue-scroll-thumb');
      if (!list || !track || !thumb) return;
      var overflow = list.scrollHeight - list.clientHeight;
      track.style.display = overflow > 0 ? 'block' : 'none';
      if (overflow <= 0) return;
      var height = Math.max(22, Math.round(track.clientHeight * list.clientHeight / list.scrollHeight));
      var top = Math.round((track.clientHeight - height) * list.scrollTop / overflow);
      thumb.style.height = height + 'px';
      thumb.style.transform = 'translateY(' + top + 'px)';
    }

    function startQueueScrollbarDrag(event) {
      event.preventDefault();
      event.stopPropagation();
      var list = document.getElementById('omc-mini-queue-list');
      queueScrollDrag = { y: event.clientY, scrollTop: list.scrollTop };
    }

    function dragQueueScrollbar(event) {
      if (!queueScrollDrag || !(event.buttons & 1)) return;
      var list = document.getElementById('omc-mini-queue-list');
      var track = document.getElementById('omc-mini-queue-scrollbar');
      var thumb = document.getElementById('omc-mini-queue-scroll-thumb');
      var travel = track.clientHeight - thumb.offsetHeight;
      if (travel > 0) list.scrollTop = queueScrollDrag.scrollTop + (event.clientY - queueScrollDrag.y) * (list.scrollHeight - list.clientHeight) / travel;
    }

    function stopQueueScrollbarDrag() {
      queueScrollDrag = null;
    }

    function jumpQueueScrollbar(event) {
      if (event.target.id === 'omc-mini-queue-scroll-thumb') return;
      var list = document.getElementById('omc-mini-queue-list');
      var bounds = event.currentTarget.getBoundingClientRect();
      list.scrollTop = (event.clientY - bounds.top) / bounds.height * (list.scrollHeight - list.clientHeight);
    }

    function seek(event) {
      var audio = getAudio();
      var bounds = event.currentTarget.getBoundingClientRect();
      var ratio = Math.max(0, Math.min(1, (event.clientX - bounds.left) / bounds.width));
      if (audio && isFinite(audio.duration) && audio.duration) audio.currentTime = ratio * audio.duration;
      else seekInternalPlayback(window, ratio);
      updateTimeline();
    }

    function loadLyrics() {
      var playerState = readInternalPlayerState(window);
      var trackId = playerState && playerState.trackId;
      if (!trackId || trackId === lyricTrackId) return;
      lyricTrackId = trackId;
      lyricLines = [];
      activeLyricIndex = -1;
      fetch('/api/song/lyric?id=' + encodeURIComponent(trackId) + '&lv=-1&kv=-1&tv=-1', { credentials: 'include' })
        .then(function (response) { return response.json(); })
        .then(function (result) {
          var source = result && result.lrc && result.lrc.lyric || '';
          var offsetMatch = source.match(/\[offset:([+-]?\d+)\]/i);
          var lyricOffset = offsetMatch ? Number(offsetMatch[1]) / 1000 : 0;
          source.split(/\r?\n/).forEach(function (line) {
            var text = line.replace(/\[(\d+):(\d+(?:\.\d+)?)\]/g, '').trim();
            var match;
            var times = /\[(\d+):(\d+(?:\.\d+)?)\]/g;
            while ((match = times.exec(line))) {
              if (text) lyricLines.push({ time: Number(match[1]) * 60 + Number(match[2]) - lyricOffset, text: text });
            }
          });
          lyricLines.sort(function (a, b) { return a.time - b.time; });
          renderLyrics();
          updateTimeline();
        }).catch(function () {
          renderLyrics();
        });
    }

    function renderLyrics() {
      var list = document.getElementById('omc-mini-lyric-list');
      if (!list) return;
      list.innerHTML = '';
      var lines = lyricLines.length ? lyricLines : [{ time: 0, text: '暂无歌词' }];
      lines.forEach(function (line) {
        var node = document.createElement('div');
        node.className = 'omc-mini-lyric-line';
        node.textContent = line.text;
        list.appendChild(node);
      });
      list.style.transform = 'translateY(0)';
    }

    function updateTimeline() {
      if (mode === 'normal') return;
      var audio = getAudio();
      var internal = readInternalPlaybackState(window, liveInternalProgress);
      var useSyncedTimeline = syncedTimeline && Date.now() - syncedTimelineAt < 750;
      var currentTime = internal && internal.currentTime != null
        ? internal.currentTime
        : (useSyncedTimeline ? syncedTimeline.currentTime : audio && audio.currentTime || 0);
      var duration = internal && internal.duration
        ? internal.duration
        : (useSyncedTimeline ? syncedTimeline.duration : audio && audio.duration || 0);
      var ratio = isFinite(duration) && duration ? Math.max(0, Math.min(1, currentTime / duration)) : 0;
      if (internal && typeof internal.playing === 'boolean') updatePlayback(internal.playing, true);
      var fill = document.getElementById('omc-mini-progress-fill');
      var thumb = document.getElementById('omc-mini-progress-thumb');
      if (fill) fill.style.width = (ratio * 100) + '%';
      if (thumb) thumb.style.left = (ratio * 100) + '%';

      var state = readInternalPlayerState(window);
      var like = document.getElementById('omc-mini-like');
      if (like && state && typeof state.liked === 'boolean') like.classList.toggle('liked', state.liked);
      if (state && state.trackId !== lyricTrackId) loadLyrics();
      renderQueue(false);
      if (!lyricMode || !lyricLines.length) return;

      var index = -1;
      for (var i = 0; i < lyricLines.length && lyricLines[i].time <= currentTime; i++) index = i;
      activeLyricIndex = index;
      var list = document.getElementById('omc-mini-lyric-list');
      var viewport = document.getElementById('omc-mini-lyrics');
      if (!list || !viewport) return;
      Array.prototype.forEach.call(list.children, function (line, lineIndex) {
        line.classList.toggle('active', lineIndex === index);
      });
      var active = list.children[index];
      if (active) {
        var offset = viewport.clientHeight / 2 - active.offsetTop - active.offsetHeight / 2;
        list.style.transform = 'translateY(' + offset + 'px)';
      }
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
        return appWin.hide()
          .then(function () { return state[3] ? appWin.unmaximize() : Promise.resolve(); })
          .then(function () { return appWin.setMinSize(new T.window.LogicalSize(240, 240)); })
          .then(function () { return appWin.setSize(new T.window.LogicalSize(336, 336)); })
          .then(function () { return appWin.setAlwaysOnTop(true); });
      }).then(function () {
        alwaysOnTop = true;
        document.getElementById('omc-mini-context-topmost').setAttribute('aria-checked', 'true');
        mode = 'expanded';
        document.documentElement.classList.add('omc-mini-active');
        loadLyrics();
        return finishTransition();
      }, function (error) {
        return finishTransition('[omc] failed to enter Mini mode', error);
      });
    }

    function exit() {
      if (mode === 'normal' || transitioning) return;
      transitioning = true;
      var state = restoreState;
      appWin.hide()
        .then(function () {
          document.documentElement.classList.remove('omc-mini-active');
          document.getElementById('omc-mini-player').classList.remove('omc-mini-compact', 'omc-mini-lyrics', 'omc-mini-queue-open');
          compactMode = false;
          lyricMode = false;
          queueMode = false;
          alwaysOnTop = false;
          mode = 'normal';
          return appWin.setAlwaysOnTop(false);
        })
        .then(function () { return appWin.setMinSize(new T.window.LogicalSize(800, 600)); })
        .then(function () {
          if (!state) return;
          if (state.maximized) return appWin.maximize();
          return appWin.setSize(new T.window.LogicalSize(state.width, state.height)).then(function () {
            return appWin.setPosition(new T.window.LogicalPosition(state.x, state.y));
          });
        }).then(function () {
          return finishTransition();
        }, function (error) {
          return finishTransition('[omc] failed to exit Mini mode', error);
        });
    }

    function updateMetadata(metadata) {
      if (metadata) lastMetadata = metadata;
      var title = document.getElementById('omc-mini-title');
      if (!title) return;
      var artist = document.getElementById('omc-mini-artist');
      var cover = document.getElementById('omc-mini-cover');
      var thumb = document.getElementById('omc-mini-thumb');
      title.textContent = (lastMetadata && lastMetadata.title) || '网易云音乐';
      artist.textContent = (lastMetadata && lastMetadata.artist) || '等待播放';
      var artwork = lastMetadata && lastMetadata.artwork;
      if (artwork) {
        cover.src = artwork;
        thumb.src = artwork;
      }
    }

    function updatePlayback(playing, bridged) {
      if (bridged) bridgedPlaybackAt = Date.now();
      else if (Date.now() - bridgedPlaybackAt < 750) return;
      lastPlaying = !!playing;
      var play = document.getElementById('omc-mini-play');
      if (play) play.setAttribute('data-playing', String(lastPlaying));
    }

    function syncTimeline(timeline) {
      if (!timeline || !isFinite(timeline.currentTime) || !isFinite(timeline.duration)) return;
      syncedTimeline = timeline;
      syncedTimelineAt = Date.now();
    }

    if (document.documentElement) mount();
    else document.addEventListener('DOMContentLoaded', mount, { once: true });
    setInterval(updateTimeline, 250);

    return {
      enter: enter,
      updateMetadata: updateMetadata,
      updatePlayback: updatePlayback,
      updateTimeline: syncTimeline
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
        previoustrack: '[aria-label="pre"]',
        playlist: '#page_pc_mini_bar [aria-label="playlist"],#page_pc_minibar [aria-label="playlist"]'
      };
      var likeState = action === 'like' ? readLoggedLikeControl(document) || readInternalPlayerState(window) : null;
      var button = action === 'like' ? findLikeButton(document) : document.querySelector(selectors[action]);
      var audio = document.querySelector('audio');
      if (window === window.top) {
        var contentFrame = document.querySelector('#g_iframe,iframe[name="contentFrame"]');
        try {
          if (!button && contentFrame && contentFrame.contentDocument) {
            likeState = action === 'like'
              ? readLoggedLikeControl(contentFrame.contentDocument) || readInternalPlayerState(contentFrame.contentWindow)
              : null;
            button = action === 'like'
              ? findLikeButton(contentFrame.contentDocument)
              : contentFrame.contentDocument.querySelector(selectors[action]);
          }
          if (!audio && contentFrame && contentFrame.contentDocument) {
            audio = contentFrame.contentDocument.querySelector('audio');
          }
        } catch (error) {}
      }
      if (button) {
        if (button.tagName !== 'BUTTON') button = button.closest('button') || button;
        button.click();
        if (action === 'like') {
          window.dispatchEvent(new CustomEvent('omc-like-toggle', {
            detail: likeState ? { trackId: likeState.trackId, liked: !likeState.liked } : null
          }));
        }
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
      playing: stateLabel === 'pause' || (stateIcon && stateIcon.getAttribute('title') === '暂停'),
      liked: readLikeState(scope)
    };
  }

  function findLikeButton(scope) {
    if (!scope) return null;
    var likeIcons = scope.querySelectorAll('[class*="songPlayInfo"] .cmd-icon-like,#page_pc_mini_bar .cmd-icon-like');
    for (var iconIndex = likeIcons.length - 1; iconIndex >= 0; iconIndex--) {
      var iconButton = likeIcons[iconIndex].closest('button,[role="button"]') || likeIcons[iconIndex];
      if (iconButton.getClientRects().length) return iconButton;
    }
    if (likeIcons.length) {
      return likeIcons[likeIcons.length - 1].closest('button,[role="button"]') || likeIcons[likeIcons.length - 1];
    }
    var loggedControl = readLoggedLikeControl(scope);
    if (loggedControl && loggedControl.button) return loggedControl.button;
    var direct = scope.querySelector('#btn_pc_minibar_like,[id*="minibar_like"],[data-testid*="like"]');
    if (direct) return direct.closest('button,[role="button"]') || direct;

    var player = scope.querySelector('[class*="songPlayInfo"],#page_pc_minibar,[class*="PlayerBar"],[class*="playerBar"]');
    var candidates = (player || scope).querySelectorAll('button,[role="button"],[aria-label],[title]');
    for (var i = 0; i < candidates.length; i++) {
      var candidate = candidates[i];
      var label = ((candidate.getAttribute('aria-label') || '') + ' ' + (candidate.getAttribute('title') || '')).trim();
      if (/^(unlike|like|liked|取消喜欢|喜欢|已喜欢|从我喜欢移除)/i.test(label)) {
        return candidate.closest('button,[role="button"]') || candidate;
      }
    }
    return null;
  }

  function readLoggedLikeControl(scope) {
    if (!scope) return null;
    var player = scope.querySelector('#page_pc_mini_bar,#page_pc_minibar,[id*="page_pc_mini"]');
    var trackId = null;
    var button = null;
    var liked = null;
    var controls = Array.prototype.slice.call((player || scope).querySelectorAll('[data-log]'));
    if (player && player.hasAttribute('data-log')) controls.unshift(player);
    for (var i = 0; i < controls.length; i++) {
      try {
        var log = JSON.parse(controls[i].getAttribute('data-log') || '');
        var params = log && log.params;
        if (typeof params === 'string') params = JSON.parse(params);
        var rawTrackId = params && params.s_cid;
        if (/^[1-9]\d*$/.test(String(rawTrackId || ''))) trackId = String(rawTrackId);
        if (log && log.oid === 'btn_pc_like') {
          button = controls[i].closest('button,[role="button"]') || controls[i];
          liked = params ? String(params.type) === '0' : null;
        }
      } catch (error) {}
    }
    return button || trackId ? { button: button, liked: liked, trackId: trackId } : null;
  }

  function readCurrentTrackId(scope) {
    if (!scope) return null;
    var info = scope.querySelector('[class*="songPlayInfo"]');
    var player = scope.querySelector('#page_pc_mini_bar,#page_pc_minibar,[id*="page_pc_mini"]');
    var root = info || player;
    if (!root) return null;

    var linked = root.querySelector('a[href*="/song"],a[href*="song?id="]');
    if (linked) {
      try {
        var linkedId = new URL(linked.href, window.location.href).searchParams.get('id');
        if (/^[1-9]\d*$/.test(linkedId || '')) return linkedId;
      } catch (error) {}
    }

    var nodes = [root].concat(Array.prototype.slice.call(root.querySelectorAll('[data-song-id],[data-track-id],[data-id],[data-log]')));
    for (var i = 0; i < nodes.length; i++) {
      var directId = nodes[i].getAttribute('data-song-id') || nodes[i].getAttribute('data-track-id') || nodes[i].getAttribute('data-id');
      if (/^[1-9]\d*$/.test(directId || '')) return directId;
      try {
        var log = JSON.parse(nodes[i].getAttribute('data-log') || '');
        var params = log && log.params;
        if (typeof params === 'string') params = JSON.parse(params);
        var loggedId = params && params.s_cid;
        if (/^[1-9]\d*$/.test(String(loggedId || ''))) return String(loggedId);
      } catch (error) {}
    }
    return null;
  }

  function readLikeState(scope) {
    var likeIcon = scope && scope.querySelector('[class*="songPlayInfo"] .cmd-icon-like,#page_pc_mini_bar .cmd-icon-like');
    if (likeIcon) {
      var likePath = likeIcon.querySelector('path');
      var pathFill = likePath && likePath.getAttribute('fill') || '';
      if (pathFill.indexOf('url(#') === 0) return true;
      if (likeIcon.className && String(likeIcon.className).indexOf('miniBarIconColorStyle_') !== -1) return false;
      var iconTitle = likeIcon.getAttribute('title') || '';
      if (iconTitle.indexOf('取消喜欢') === 0) return true;
      if (iconTitle.indexOf('喜欢') === 0) return false;
    }
    var loggedControl = readLoggedLikeControl(scope);
    if (loggedControl && typeof loggedControl.liked === 'boolean') return loggedControl.liked;
    var button = findLikeButton(scope);
    if (!button) return null;

    var stateNode = button.matches('[aria-pressed],[aria-checked],[data-liked],[data-state]')
      ? button
      : button.querySelector('[aria-pressed],[aria-checked],[data-liked],[data-state]') || button;
    var pressed = stateNode.getAttribute('aria-pressed');
    if (pressed === 'true' || pressed === 'false') return pressed === 'true';
    var checked = stateNode.getAttribute('aria-checked');
    if (checked === 'true' || checked === 'false') return checked === 'true';
    var dataLiked = stateNode.getAttribute('data-liked');
    if (dataLiked === 'true' || dataLiked === 'false') return dataLiked === 'true';
    var dataState = stateNode.getAttribute('data-state');
    if (/^(on|active|checked|liked|collected)$/i.test(dataState || '')) return true;
    if (/^(off|inactive|unchecked)$/i.test(dataState || '')) return false;

    var className = typeof button.className === 'string' ? button.className : '';
    if (button.querySelector('.likenumber-red,.color-red')) return true;
    if (/(^|[\s_-])(liked|selected|checked|active)([\s_-]|$)/i.test(className)) return true;
    var labelNode = button.querySelector('[aria-label],[title]');
    var label = (
      (button.getAttribute('aria-label') || '') + ' ' +
      (button.getAttribute('title') || '') + ' ' +
      (labelNode && labelNode !== button ? (labelNode.getAttribute('aria-label') || '') + ' ' + (labelNode.getAttribute('title') || '') : '')
    ).trim();
    if (/unlike|unfavorite|uncollect|取消喜欢|已喜欢|取消收藏|已收藏|从我喜欢移除|liked|favorited|collected/i.test(label)) return true;
    if (/like|favorite|collect|喜欢|收藏到我喜欢|收藏/i.test(label)) return false;
    return null;
  }

  function readInternalPlayerState(targetWindow) {
    try {
      if (!targetWindow.__omcWebpackRequire && targetWindow.webpackJsonp) {
        var moduleId = 900000 + Math.floor(Math.random() * 100000);
        var modules = {};
        modules[moduleId] = function (module, exports, require) {
          targetWindow.__omcWebpackRequire = require;
        };
        targetWindow.webpackJsonp.push([[moduleId], modules, [[moduleId]]]);
      }
      var require = targetWindow.__omcWebpackRequire;
      if (!require) return null;
      var appModule = require(14);
      var app = appModule && appModule.a;
      var state = app && app.getStore && app.getStore();
      var rawTrackId = state && state.playing && state.playing.onlineResourceId;
      if (!/^[1-9]\d*$/.test(String(rawTrackId || ''))) return null;
      var trackId = String(rawTrackId);
      var hostResource = state['async:hostResource'];
      var likeMap = hostResource && hostResource.likeTracksMap;
      return {
        trackId: trackId,
        liked: likeMap && typeof likeMap[trackId] === 'boolean' ? likeMap[trackId] : null
      };
    } catch (error) {
      return null;
    }
  }

  function readInternalPlaybackState(targetWindow, progressSnapshot) {
    try {
      readInternalPlayerState(targetWindow);
      var require = targetWindow.__omcWebpackRequire;
      var app = require && require(14).a;
      var state = app && app.getStore && app.getStore();
      var playing = state && state.playing;
      if (!playing) return null;
      var currentTime = null;
      var rawProgressMismatch = false;
      try {
        var rawProgress = progressSnapshot || require(167).b();
        var progressId = String(rawProgress && rawProgress.playId || '');
        var progressBaseId = progressId.split('_')[0];
        var currentItem = playing.curPlaying || {};
        var validIds = [
          playing.playId,
          playing.resourceTrackId,
          playing.onlineResourceId,
          currentItem.resourceId,
          currentItem.trackId
        ].filter(Boolean).map(function (id) { return String(id).split('_')[0]; });
        rawProgressMismatch = !progressId || validIds.indexOf(progressBaseId) === -1;
        if (!rawProgressMismatch) {
          currentTime = Number(rawProgress.current);
          var duration = Number(playing.resourceDuration) || 0;
          if (duration && currentTime > duration + Math.max(30, duration * 0.1) && currentTime / 1000 <= duration + 2) {
            currentTime /= 1000;
          }
          var trialStart = Number(playing.freeTrialInfo && playing.freeTrialInfo.start);
          if (isFinite(trialStart)) currentTime += trialStart;
        }
      } catch (error) {}
      if (!rawProgressMismatch && (currentTime == null || !isFinite(currentTime))) {
        try {
          var displayedTime = require(136).b;
          if (displayedTime && typeof displayedTime.getValue === 'function') currentTime = Number(displayedTime.getValue());
        } catch (error) {}
      }
      return {
        currentTime: currentTime != null && isFinite(currentTime) ? currentTime : null,
        duration: Number(playing.resourceDuration) || 0,
        playing: Number(playing.playingState) === 2
      };
    } catch (error) {
      return null;
    }
  }

  function seekInternalPlayback(targetWindow, ratio) {
    try {
      readInternalPlayerState(targetWindow);
      var require = targetWindow.__omcWebpackRequire;
      var app = require && require(14).a;
      var state = app && app.getStore && app.getStore();
      var duration = Number(state && state.playing && state.playing.resourceDuration);
      var dispatch = app && app.getDispatch && app.getDispatch();
      if (!duration || !dispatch) return;
      dispatch({ type: 'playing/setPlayingPosition', payload: { duration: duration * ratio } });
    } catch (error) {}
  }

  function readPlayingQueue(targetWindow) {
    try {
      readInternalPlayerState(targetWindow);
      var require = targetWindow.__omcWebpackRequire;
      var app = require && require(14).a;
      var state = app && app.getStore && app.getStore();
      var items = state && state.playingList && state.playingList.curPlayingList || [];
      var current = state && state.playing && state.playing.curPlaying;
      var currentId = current && current.resourceId || state && state.playing && state.playing.onlineResourceId;
      return {
        currentId: currentId == null ? '' : String(currentId),
        items: items.slice().sort(function (a, b) {
          return Number(a.displayOrder || 0) - Number(b.displayOrder || 0);
        }).map(function (item) {
          var track = item.track || item.localTrack || {};
          var artists = track.artists || [];
          return {
            id: String(item.resourceId || item.trackId || track.id || ''),
            title: track.name || item.text || '未知歌曲',
            artist: artists.map(function (artist) { return artist.name; }).filter(Boolean).join(' / '),
            cover: track.coverUrl || track.album && track.album.picUrl || ''
          };
        })
      };
    } catch (error) {
      return { currentId: '', items: [] };
    }
  }

  function playQueueItem(targetWindow, trackId) {
    try {
      readInternalPlayerState(targetWindow);
      var require = targetWindow.__omcWebpackRequire;
      var app = require && require(14).a;
      var state = app && app.getStore && app.getStore();
      var items = state && state.playingList && state.playingList.curPlayingList || [];
      var wanted = String(trackId);
      var item = items.find(function (entry) {
        return String(entry.resourceId || entry.trackId || entry.track && entry.track.id || '') === wanted;
      });
      var dispatch = app && app.getDispatch && app.getDispatch();
      if (!item || !dispatch) return;
      dispatch({
        type: 'playing/playOneTrackInPlayingList',
        payload: { item: item, flag: 0, switchType: 'call', triggerScene: 'playingList' }
      });
    } catch (error) {}
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
      if (document.documentElement.classList.contains('omc-mini-active')) return;
      if (e.button !== 0 || !isInDragBand(e) || !isDraggableTarget(e.target)) return;
      e.preventDefault();
      appWin.startDragging();
    }, true);

    document.addEventListener('dblclick', function (e) {
      if (document.documentElement.classList.contains('omc-mini-active')) return;
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
    var lastLiked;
    var observedLikePlayer = null;
    var likeObserver = null;
    var likedTrackIds = null;
    var likedTracksLoading = false;
    var likedTracksRetryAt = 0;
    window.__omc_media_handlers = {};

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

(function () {
  'use strict';
  var OMC = window.__OMC__ = window.__OMC__ || {};
  if (OMC.injected) return;
  OMC.injected = true;

  if (!OMC.styles.mount()) {
    document.addEventListener('DOMContentLoaded', OMC.styles.mount, { once: true });
  }

  if (window !== window.top) {
    OMC.mediaController.setupFrameRelay();
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
    var miniPlayer = OMC.miniPlayer.setup(T, appWin);
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
    OMC.mediaController.setupMediaPolling(T, miniPlayer);

    // ── Media control from Rust (shortcuts/tray) ──
    listen('media-control', function (ev) {
      OMC.neteaseAdapter.performMediaAction(ev.payload);
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
      return miniPlayer.restoreSavedState();
    }).then(function (restoredMini) {
      if (restoredMini) return;
      return appWin.show().then(function () { return appWin.setFocus(); });
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

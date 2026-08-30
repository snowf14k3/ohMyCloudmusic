(function () {
  'use strict';
  var OMC = window.__OMC__ = window.__OMC__ || {};
  var adapter = OMC.neteaseAdapter;
  var performMediaAction = adapter.performMediaAction;
  var readInternalPlayerState = adapter.readInternalPlayerState;
  var readInternalPlaybackState = adapter.readInternalPlaybackState;
  var seekInternalPlayback = adapter.seekInternalPlayback;
  var readPlayingQueue = adapter.readPlayingQueue;
  var playQueueItem = adapter.playQueueItem;
  var subscribeToInternalProgress = adapter.subscribeInternalProgress;
  function setupMiniPlayer(T, appWin) {
    var MINI_STATE_KEY = 'omc-mini-state';
    var COMPACT_HEIGHT = 60;
    var mode = 'normal';
    var transitioning = false;
    var restoreState = null;
    var lastMetadata = null;
    var lastPlaying = false;
    var lyricMode = false;
    var compactMode = false;
    var queueMode = false;
    var queueRenderKey = '';
    var queueSnapshot = { currentId: '', items: [] };
    var queueLastRefresh = 0;
    var queueVisibleKey = '';
    var QUEUE_ROW_HEIGHT = 34;
    var QUEUE_OVERSCAN = 6;
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
    var saveStateTimer = null;
    var compactLockedHeight = COMPACT_HEIGHT;
    var compactResizeAdjusting = false;
    var pendingCompactSize = null;
    var coverAspectTimer = null;
    var suppressMiniHover = false;

    function readSavedMiniState() {
      try {
        return JSON.parse(localStorage.getItem(MINI_STATE_KEY)) || null;
      } catch (error) {
        return null;
      }
    }

    function writeSavedMiniState(state) {
      try {
        localStorage.setItem(MINI_STATE_KEY, JSON.stringify(state));
      } catch (error) {}
    }

    function persistMiniState() {
      if (mode === 'normal' || transitioning) return Promise.resolve();
      return Promise.all([appWin.scaleFactor(), appWin.innerSize(), appWin.innerPosition()]).then(function (values) {
        var scale = values[0];
        var width = Math.round(values[1].width / scale);
        var height = Math.round(values[1].height / scale);
        var previous = readSavedMiniState() || {};
        var layouts = previous.layouts || {};
        var queueHeights = previous.queueHeights || {};
        layouts[compactMode ? 'compact' : 'cover'] = {
          width: width,
          height: compactMode ? COMPACT_HEIGHT : width
        };
        if (queueMode) {
          queueHeights[compactMode ? 'compact' : 'cover'] = Math.max(
            100,
            height - (compactMode ? COMPACT_HEIGHT : width)
          );
        }
        writeSavedMiniState({
          active: true,
          compact: compactMode,
          queue: queueMode,
          lyrics: lyricMode,
          preQueueHeight: preQueueHeight,
          alwaysOnTop: alwaysOnTop,
          width: width,
          height: height,
          x: Math.round(values[2].x / scale),
          y: Math.round(values[2].y / scale),
          sharedWidth: width,
          layouts: layouts,
          queueHeights: queueHeights
        });
      }).catch(function () {});
    }

    function scheduleMiniStateSave() {
      if (mode === 'normal' || transitioning) return;
      clearTimeout(saveStateTimer);
      saveStateTimer = setTimeout(persistMiniState, 250);
    }

    function markMiniInactive() {
      var state = readSavedMiniState() || {};
      state.active = false;
      writeSavedMiniState(state);
    }

    function rememberQueueHeight(key, height) {
      if (!isFinite(height) || height < 100) return;
      var saved = readSavedMiniState() || {};
      var queueHeights = saved.queueHeights || {};
      queueHeights[key] = Math.round(height);
      saved.queueHeights = queueHeights;
      writeSavedMiniState(saved);
    }

    function lockCompactHeight(height) {
      compactLockedHeight = height;
      return appWin.setMinSize(new T.window.LogicalSize(240, 45));
    }

    function enforceCompactHeight(event) {
      if (mode === 'normal' || transitioning || !compactMode) return;
      var size = event && (event.payload || event);
      if (!size || !isFinite(size.width) || !isFinite(size.height)) return;
      pendingCompactSize = { width: size.width, height: size.height };
      if (compactResizeAdjusting) return;
      compactResizeAdjusting = true;

      function applyLatestSize() {
        var latest = pendingCompactSize;
        pendingCompactSize = null;
        appWin.scaleFactor().then(function (scale) {
          var targetHeight = Math.round(compactLockedHeight * scale);
          if (Math.abs(latest.height - targetHeight) <= 1) return;
          return appWin.setSize(new T.window.PhysicalSize(latest.width, targetHeight));
        }).catch(function () {}).then(function () {
          if (pendingCompactSize) applyLatestSize();
          else compactResizeAdjusting = false;
        });
      }

      applyLatestSize();
    }

    function enforceCoverAspect(event) {
      if (mode === 'normal' || transitioning || compactMode) return;
      var size = event && (event.payload || event);
      if (!size || !isFinite(size.width) || !isFinite(size.height)) return;
      preQueueHeight = window.innerWidth;
      clearTimeout(coverAspectTimer);
      coverAspectTimer = setTimeout(function () {
        if (mode === 'normal' || transitioning || compactMode) return;
        Promise.all([appWin.scaleFactor(), appWin.innerSize()]).then(function (state) {
          var width = Math.round(state[1].width / state[0]);
          var height = Math.round(state[1].height / state[0]);
          preQueueHeight = width;
          if (queueMode) {
            var minimumHeight = width + 100;
            return appWin.setMinSize(new T.window.LogicalSize(240, minimumHeight)).then(function () {
              if (height >= minimumHeight) return;
              return appWin.setSize(new T.window.LogicalSize(width, minimumHeight));
            });
          }
          if (Math.abs(height - width) <= 1) return;
          return appWin.setSize(new T.window.LogicalSize(width, width));
        }).catch(function () {});
      }, 120);
    }

    function syncMiniLayoutAfterResize() {
      if (mode === 'normal' || transitioning || !queueMode) return;
      requestAnimationFrame(function () {
        if (mode === 'normal' || transitioning || !queueMode) return;
        var player = document.getElementById('omc-mini-player');
        var contentHeight = compactMode ? COMPACT_HEIGHT : window.innerWidth;
        var queueHeight = Math.max(100, window.innerHeight - contentHeight);
        preQueueHeight = contentHeight;
        player.style.setProperty('--omc-mini-cover-height', contentHeight + 'px');
        player.style.setProperty('--omc-mini-queue-height', queueHeight + 'px');
        player.style.setProperty('--omc-mini-shell-height', window.innerHeight + 'px');
        renderVisibleQueue(true);
        updateQueueScrollbar();
      });
    }

    function finishTransition(errorMessage, error) {
      if (error) console.error(errorMessage, error);
      return appWin.show().then(function () {
        return appWin.setFocus();
      }).catch(function (showError) {
        console.error('[omc] failed to reveal window after Mini transition', showError);
      }).then(function () {
        transitioning = false;
        return persistMiniState();
      });
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
        '<section id="omc-mini-queue-view"><div id="omc-mini-queue-list"><div id="omc-mini-queue-content"></div></div><div id="omc-mini-queue-scrollbar"><div id="omc-mini-queue-scroll-thumb" role="scrollbar" aria-label="播放队列滚动条"></div></div></section>' +
        '<div id="omc-mini-context" role="menu"><button class="omc-mini-context-item" id="omc-mini-context-restore" role="menuitem"><span class="omc-mini-context-check"></span><span>回到主界面</span></button><button class="omc-mini-context-item" id="omc-mini-context-topmost" role="menuitemcheckbox" aria-checked="true"><span class="omc-mini-context-check">✓</span><span>总在最前</span></button></div>';
      document.documentElement.appendChild(player);

      player.querySelectorAll('button').forEach(function (button) {
        button.addEventListener('pointerdown', function (e) { e.stopPropagation(); });
      });
      player.addEventListener('dblclick', function (event) {
        if (!event.target.closest('.omc-mini-toolbar')) return;
        event.preventDefault();
        event.stopImmediatePropagation();
      }, true);
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
      document.getElementById('omc-mini-queue-list').addEventListener('scroll', function () {
        renderVisibleQueue(false);
        updateQueueScrollbar();
      });
      document.getElementById('omc-mini-queue-scrollbar').addEventListener('pointerdown', jumpQueueScrollbar);
      document.getElementById('omc-mini-queue-scroll-thumb').addEventListener('pointerdown', startQueueScrollbarDrag);
      document.addEventListener('pointermove', dragQueueScrollbar);
      document.addEventListener('pointerup', stopQueueScrollbarDrag);
      document.addEventListener('pointercancel', stopQueueScrollbarDrag);
      document.getElementById('omc-mini-volume').addEventListener('click', toggleMute);
      document.getElementById('omc-mini-thumb-toggle').addEventListener('pointerdown', function () {
        suppressMiniHover = true;
        player.classList.add('omc-mini-top-suppressed');
        setTimeout(function () {
          if (transitioning) return;
          suppressMiniHover = false;
          player.classList.remove('omc-mini-top-suppressed');
        }, 500);
      });
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
      setTimeout(function () { renderQueue(true, true); }, 800);
    }

    function subscribeInternalProgress() {
      if (internalProgressSubscribed) return;
      var attempts = 0;
      var timer = setInterval(function () {
        attempts += 1;
        try {
          subscribeToInternalProgress(window, function (progress) {
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
      if (transitioning || suppressMiniHover) {
        return;
      }
      var coverHeight = queueMode
        ? (compactMode ? COMPACT_HEIGHT : Math.min(window.innerWidth, window.innerHeight))
        : window.innerHeight;
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
        scheduleMiniStateSave();
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
      scheduleMiniStateSave();
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
      document.getElementById('omc-mini-player').classList.add('omc-mini-actions-settling');
      document.getElementById('omc-mini-player').classList.remove('omc-mini-cover-hover');
      var nextCompactMode = !compactMode;
      var player = document.getElementById('omc-mini-player');
      Promise.all([appWin.scaleFactor(), appWin.innerSize()]).then(function (state) {
        var currentWidth = Math.round(state[1].width / state[0]);
        var currentHeight = Math.round(state[1].height / state[0]);
        var width = currentWidth;
        var currentContentHeight = compactMode ? COMPACT_HEIGHT : currentWidth;
        var queueHeight = queueMode ? Math.max(100, currentHeight - currentContentHeight) : 0;
        if (queueMode) player.style.setProperty('--omc-mini-queue-height', queueHeight + 'px');
        var from = {
          width: currentWidth,
          height: currentHeight
        };
        var targetContentHeight = nextCompactMode ? COMPACT_HEIGHT : width;
        var target = {
          width: width,
          height: targetContentHeight + queueHeight
        };
        player.style.setProperty('--omc-mini-shell-height', from.height + 'px');
        if (nextCompactMode) {
          player.classList.add('omc-mini-compacting');
        } else {
          player.classList.add('omc-mini-expanding');
          player.classList.remove('omc-mini-compact');
          requestAnimationFrame(function () {
            requestAnimationFrame(function () {
              player.classList.add('omc-mini-expanding-active');
            });
          });
        }
        return appWin.setMinSize(new T.window.LogicalSize(240, 45))
          .then(function () { return animateMiniSize(from, target, 160, true); })
          .then(function () {
            compactMode = nextCompactMode;
            preQueueHeight = targetContentHeight;
            player.style.setProperty('--omc-mini-shell-height', target.height + 'px');
            player.classList.toggle('omc-mini-compact', compactMode);
            player.classList.remove('omc-mini-compacting', 'omc-mini-expanding', 'omc-mini-expanding-active');
            if (compactMode) {
              return nextPaint().then(function () {
                return T.core.invoke('finish_window_region_animation', target);
              }).then(function () {
                return lockCompactHeight(target.height);
              });
            }
            return appWin.setMinSize(new T.window.LogicalSize(240, queueMode ? width + 100 : 240));
          })
          .then(function () {
            if (queueMode) {
              renderVisibleQueue(true);
              updateQueueScrollbar();
            }
          });
      }).then(function () {
        transitioning = false;
        suppressMiniHover = false;
        player.classList.remove('omc-mini-actions-settling', 'omc-mini-top-suppressed');
        if (queueMode) {
          renderVisibleQueue(true);
          updateQueueScrollbar();
        }
        persistMiniState();
      }, function (error) {
        console.error('[omc] failed to switch Mini layout', error);
        player.classList.toggle('omc-mini-compact', compactMode);
        player.classList.remove('omc-mini-compacting', 'omc-mini-expanding', 'omc-mini-expanding-active', 'omc-mini-actions-settling', 'omc-mini-top-suppressed');
        T.core.invoke('finish_window_region_animation', {
          width: window.innerWidth,
          height: compactMode ? COMPACT_HEIGHT : window.innerHeight
        }).catch(function () {});
        transitioning = false;
        suppressMiniHover = false;
      });
    }

    function toggleQueue() {
      if (mode === 'normal' || transitioning) return;
      transitioning = true;
      var wasCompact = compactMode;
      var wasQueueOpen = queueMode;
      queueMode = !queueMode;
      if (queueMode && lyricMode) toggleLyrics();
      var player = document.getElementById('omc-mini-player');
      player.classList.add('omc-mini-queue-transition');
      if (queueMode) {
        preQueueHeight = wasCompact ? COMPACT_HEIGHT : window.innerWidth;
        player.style.setProperty('--omc-mini-cover-height', preQueueHeight + 'px');
        if (queueSnapshot.items.length) queueLastRefresh = Date.now();
        setTimeout(function () { renderQueue(false); }, 0);
      }
      Promise.all([appWin.scaleFactor(), appWin.innerSize()]).then(function (state) {
        var from = {
          width: Math.round(state[1].width / state[0]),
          height: Math.round(state[1].height / state[0])
        };
        if (queueMode) {
          preQueueHeight = wasCompact ? COMPACT_HEIGHT : from.width;
          player.style.setProperty('--omc-mini-cover-height', preQueueHeight + 'px');
        } else if (wasQueueOpen) {
          rememberQueueHeight(wasCompact ? 'compact' : 'cover', from.height - preQueueHeight);
        }
        var contentHeight = wasCompact ? COMPACT_HEIGHT : from.width;
        var saved = readSavedMiniState();
        var savedQueueHeight = saved && saved.queueHeights && Number(saved.queueHeights[wasCompact ? 'compact' : 'cover']);
        var queueHeight = savedQueueHeight || Math.max(150, Math.round(from.width * 0.48));
        player.style.setProperty('--omc-mini-queue-height', queueHeight + 'px');
        if (queueMode) player.classList.add('omc-mini-queue-open');
        var target = {
          width: from.width,
          height: queueMode ? contentHeight + queueHeight : contentHeight
        };
        var prepare = compactMode
          ? appWin.setMinSize(new T.window.LogicalSize(240, 45))
          : (queueMode
            ? Promise.resolve()
            : appWin.setMinSize(new T.window.LogicalSize(240, 240)));
        return prepare.then(function () { return animateMiniSize(from, target, 135); }).then(function () {
          if (compactMode) return lockCompactHeight(target.height);
          if (queueMode) return appWin.setMinSize(new T.window.LogicalSize(240, contentHeight + 100));
        });
      }).then(function () {
        if (!queueMode) player.classList.remove('omc-mini-queue-open');
        player.classList.remove('omc-mini-queue-transition');
        transitioning = false;
        if (queueMode) {
          renderQueue(false);
          requestAnimationFrame(function () {
            centerCurrentQueueItem();
            renderVisibleQueue(true);
            updateQueueScrollbar();
          });
          setTimeout(function () { if (queueMode) renderQueue(true); }, 200);
        }
        persistMiniState();
      }, function (error) {
        console.error('[omc] failed to switch queue layout', error);
        player.classList.toggle('omc-mini-queue-open', queueMode);
        player.classList.remove('omc-mini-queue-transition');
        transitioning = false;
      });
    }

    function animateMiniSize(from, target, duration, anchorBottom) {
      if (anchorBottom) {
        return T.core.invoke('animate_window_size_anchored_bottom', {
          width: target.width,
          height: target.height,
          duration: duration
        });
      }
      return new Promise(function (resolve, reject) {
        var step = 0;
        var steps = 5;
        function frame() {
          step += 1;
          var progress = step / steps;
          var eased = progress * progress * (3 - 2 * progress);
          var width = Math.round(from.width + (target.width - from.width) * eased);
          var height = Math.round(from.height + (target.height - from.height) * eased);
          var resize = appWin.setSize(new T.window.LogicalSize(width, height));
          resize.then(function () {
            if (step < steps) setTimeout(frame, duration / steps);
            else resolve();
          }).catch(reject);
        }
        frame();
      });
    }

    function nextPaint() {
      return new Promise(function (resolve) {
        requestAnimationFrame(function () {
          requestAnimationFrame(resolve);
        });
      });
    }

    function renderQueue(force, allowHidden) {
      if (!queueMode && !allowHidden) return;
      if (!force && queueSnapshot.items.length && Date.now() - queueLastRefresh < 1000) {
        if (queueMode) renderVisibleQueue(false);
        return;
      }
      var previousCurrentId = queueSnapshot.currentId;
      var queue = readPlayingQueue(window);
      var key = queue.currentId + '|' + queue.items.map(function (item) { return item.id; }).join(',');
      queueLastRefresh = Date.now();
      queueSnapshot = queue;
      var changed = key !== queueRenderKey;
      queueRenderKey = key;
      var list = document.getElementById('omc-mini-queue-list');
      var content = document.getElementById('omc-mini-queue-content');
      if (!list || !content) return;
      content.style.height = Math.max(queue.items.length * QUEUE_ROW_HEIGHT, list.clientHeight) + 'px';
      if (changed) queueVisibleKey = '';
      if (!queueMode) return;
      if (force || previousCurrentId !== queue.currentId) centerCurrentQueueItem();
      renderVisibleQueue(changed || force);
      requestAnimationFrame(updateQueueScrollbar);
    }

    function centerCurrentQueueItem() {
      var list = document.getElementById('omc-mini-queue-list');
      if (!list || !queueSnapshot.items.length) return;
      var index = queueSnapshot.items.findIndex(function (item) { return item.id === queueSnapshot.currentId; });
      if (index < 0) return;
      list.scrollTop = Math.max(0, index * QUEUE_ROW_HEIGHT - (list.clientHeight - QUEUE_ROW_HEIGHT) / 2);
    }

    function renderVisibleQueue(force) {
      var list = document.getElementById('omc-mini-queue-list');
      var content = document.getElementById('omc-mini-queue-content');
      if (!list || !content || !queueMode || !list.clientHeight) return;
      if (!queueSnapshot.items.length) {
        if (queueVisibleKey === 'empty' && !force) return;
        queueVisibleKey = 'empty';
        content.innerHTML = '<div class="omc-mini-queue-row">播放队列为空</div>';
        return;
      }
      var start = Math.max(0, Math.floor(list.scrollTop / QUEUE_ROW_HEIGHT) - QUEUE_OVERSCAN);
      var end = Math.min(
        queueSnapshot.items.length,
        Math.ceil((list.scrollTop + list.clientHeight) / QUEUE_ROW_HEIGHT) + QUEUE_OVERSCAN
      );
      var visibleKey = queueRenderKey + '|' + start + ':' + end;
      if (!force && visibleKey === queueVisibleKey) return;
      queueVisibleKey = visibleKey;
      content.innerHTML = '';
      var fragment = document.createDocumentFragment();
      for (var index = start; index < end; index++) {
        var item = queueSnapshot.items[index];
        var row = document.createElement('div');
        row.className = 'omc-mini-queue-row';
        row.classList.toggle('odd', index % 2 === 0);
        row.classList.toggle('active', item.id === queueSnapshot.currentId);
        row.style.top = (index * QUEUE_ROW_HEIGHT) + 'px';
        row.innerHTML = '<span class="omc-mini-queue-title"></span><span class="omc-mini-queue-artist"></span>';
        row.querySelector('.omc-mini-queue-title').textContent = item.title;
        row.querySelector('.omc-mini-queue-artist').textContent = item.artist;
        row.setAttribute('data-track-id', item.id);
        row.addEventListener('click', function (event) {
          playQueueItem(window, event.currentTarget.getAttribute('data-track-id'));
        });
        fragment.appendChild(row);
      }
      content.appendChild(fragment);
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
      var saved = readSavedMiniState() || {};
      var coverLayout = saved.layouts && saved.layouts.cover;
      var miniWidth = Number(saved.sharedWidth) || Number(saved.width) || Number(coverLayout && coverLayout.width) || 336;
      var miniHeight = miniWidth;
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
          .then(function () { return appWin.setMaximizable(false); })
          .then(function () { return appWin.setMinSize(new T.window.LogicalSize(240, 240)); })
          .then(function () { return appWin.setSize(new T.window.LogicalSize(miniWidth, miniHeight)); })
          .then(function () {
            if (!isFinite(saved.x) || !isFinite(saved.y)) return;
            return appWin.setPosition(new T.window.LogicalPosition(Number(saved.x), Number(saved.y)));
          })
          .then(function () { return appWin.setAlwaysOnTop(saved.alwaysOnTop !== false); });
      }).then(function () {
        compactMode = false;
        queueMode = false;
        lyricMode = false;
        alwaysOnTop = saved.alwaysOnTop !== false;
        document.getElementById('omc-mini-player').classList.remove('omc-mini-compact', 'omc-mini-lyrics', 'omc-mini-queue-open');
        document.getElementById('omc-mini-context-topmost').setAttribute('aria-checked', String(alwaysOnTop));
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
          markMiniInactive();
          return appWin.setAlwaysOnTop(false);
        })
        .then(function () { return appWin.setMaximizable(true); })
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
        document.documentElement.style.setProperty('--omc-mini-cover', 'url(' + JSON.stringify(artwork) + ')');
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

    function waitForMount() {
      return new Promise(function (resolve) {
        var attempts = 0;
        var timer = setInterval(function () {
          attempts += 1;
          if (document.getElementById('omc-mini-player') || attempts >= 100) {
            clearInterval(timer);
            resolve(!!document.getElementById('omc-mini-player'));
          }
        }, 50);
      });
    }

    function restoreSavedState() {
      var saved = readSavedMiniState();
      if (!saved || !saved.active) return Promise.resolve(false);
      var restoredMiniHeight = 0;
      var restoredQueueHeight = 0;
      transitioning = true;
      return waitForMount().then(function (mounted) {
        if (!mounted) throw new Error('Mini player did not mount');
        return Promise.all([appWin.scaleFactor(), appWin.innerSize(), appWin.innerPosition(), appWin.isMaximized()]);
      }).then(function (state) {
        restoreState = {
          width: Math.round(state[1].width / state[0]),
          height: Math.round(state[1].height / state[0]),
          x: Math.round(state[2].x / state[0]),
          y: Math.round(state[2].y / state[0]),
          maximized: state[3]
        };
        compactMode = !!saved.compact;
        queueMode = !!saved.queue;
        lyricMode = !compactMode && !!saved.lyrics;
        alwaysOnTop = saved.alwaysOnTop !== false;
        var width = Number(saved.sharedWidth) || Number(saved.width) || (compactMode ? 440 : 336);
        preQueueHeight = compactMode ? COMPACT_HEIGHT : width;
        var savedQueueHeight = Number(saved.queueHeights && saved.queueHeights[compactMode ? 'compact' : 'cover']);
        var defaultQueueHeight = savedQueueHeight || Math.max(150, Math.round(width * 0.48));
        restoredQueueHeight = defaultQueueHeight;
        var height = compactMode
          ? (queueMode ? COMPACT_HEIGHT + defaultQueueHeight : COMPACT_HEIGHT)
          : (queueMode ? width + defaultQueueHeight : width);
        restoredMiniHeight = height;
        var minWidth = 240;
        var minHeight = compactMode ? 45 : (queueMode ? width + 100 : 240);
        return appWin.hide()
          .then(function () { return state[3] ? appWin.unmaximize() : Promise.resolve(); })
          .then(function () { return appWin.setMaximizable(false); })
          .then(function () { return appWin.setMinSize(new T.window.LogicalSize(minWidth, minHeight)); })
          .then(function () { return appWin.setSize(new T.window.LogicalSize(width, height)); })
          .then(function () {
            if (!isFinite(saved.x) || !isFinite(saved.y)) return;
            return appWin.setPosition(new T.window.LogicalPosition(Number(saved.x), Number(saved.y)));
          })
          .then(function () { return appWin.setAlwaysOnTop(alwaysOnTop); })
          .then(function () { if (compactMode) return lockCompactHeight(height); });
      }).then(function () {
        var player = document.getElementById('omc-mini-player');
        player.style.setProperty('--omc-mini-shell-height', restoredMiniHeight + 'px');
        player.style.setProperty('--omc-mini-cover-height', (compactMode ? COMPACT_HEIGHT : preQueueHeight) + 'px');
        player.style.setProperty('--omc-mini-queue-height', restoredQueueHeight + 'px');
        player.classList.toggle('omc-mini-compact', compactMode);
        player.classList.toggle('omc-mini-queue-open', queueMode);
        player.classList.toggle('omc-mini-lyrics', lyricMode);
        document.getElementById('omc-mini-context-topmost').setAttribute('aria-checked', String(alwaysOnTop));
        mode = 'expanded';
        document.documentElement.classList.add('omc-mini-active');
        loadLyrics();
        if (queueMode) renderQueue(true);
        return appWin.show().then(function () { return appWin.setFocus(); });
      }).then(function () {
        transitioning = false;
        persistMiniState();
        return true;
      }).catch(function (error) {
        console.error('[omc] failed to restore Mini state', error);
        transitioning = false;
        markMiniInactive();
        return false;
      });
    }

    if (document.documentElement) mount();
    else document.addEventListener('DOMContentLoaded', mount, { once: true });
    setInterval(updateTimeline, 250);
    appWin.onMoved(scheduleMiniStateSave);
    appWin.onResized(scheduleMiniStateSave);
    appWin.onResized(enforceCompactHeight);
    appWin.onResized(enforceCoverAspect);
    appWin.onResized(syncMiniLayoutAfterResize);

    return {
      enter: enter,
      restoreSavedState: restoreSavedState,
      updateMetadata: updateMetadata,
      updatePlayback: updatePlayback,
      updateTimeline: syncTimeline
    };
  }
  OMC.miniPlayer = { setup: setupMiniPlayer };
})();

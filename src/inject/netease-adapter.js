(function () {
  'use strict';
  var OMC = window.__OMC__ = window.__OMC__ || {};
  function performMediaAction(action) {
    try {
      var handler = OMC.mediaHandlers && OMC.mediaHandlers[action];
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
      var targetOMC = targetWindow.__OMC__ = targetWindow.__OMC__ || {};
      if (!targetOMC.webpackRequire && targetWindow.webpackJsonp) {
        var moduleId = 900000 + Math.floor(Math.random() * 100000);
        var modules = {};
        modules[moduleId] = function (module, exports, require) {
          targetOMC.webpackRequire = require;
        };
        targetWindow.webpackJsonp.push([[moduleId], modules, [[moduleId]]]);
      }
      var require = targetOMC.webpackRequire;
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
      var require = targetWindow.__OMC__ && targetWindow.__OMC__.webpackRequire;
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
      var require = targetWindow.__OMC__ && targetWindow.__OMC__.webpackRequire;
      var app = require && require(14).a;
      var state = app && app.getStore && app.getStore();
      var duration = Number(state && state.playing && state.playing.resourceDuration);
      var dispatch = app && app.getDispatch && app.getDispatch();
      if (!duration || !dispatch) return;
      dispatch({ type: 'playing/setPlayingPosition', payload: { duration: duration * ratio } });
    } catch (error) {}
  }

  function readInternalVolume(targetWindow) {
    try {
      readInternalPlayerState(targetWindow);
      var require = targetWindow.__OMC__ && targetWindow.__OMC__.webpackRequire;
      var app = require && require(14).a;
      var state = app && app.getStore && app.getStore();
      var volume = Number(state && state.playing && state.playing.playingVolume);
      return isFinite(volume) ? Math.max(0, Math.min(1, volume)) : null;
    } catch (error) {
      return null;
    }
  }

  function setInternalVolume(targetWindow, value) {
    try {
      readInternalPlayerState(targetWindow);
      var require = targetWindow.__OMC__ && targetWindow.__OMC__.webpackRequire;
      var app = require && require(14).a;
      var dispatch = app && app.getDispatch && app.getDispatch();
      if (!dispatch) return false;
      dispatch({
        type: 'playing/setVolume',
        payload: { volume: Math.max(0, Math.min(1, Number(value))) }
      });
      return true;
    } catch (error) {
      return false;
    }
  }

  function readPlayingQueue(targetWindow) {
    try {
      readInternalPlayerState(targetWindow);
      var require = targetWindow.__OMC__ && targetWindow.__OMC__.webpackRequire;
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
          var album = track.album || {};
          return {
            id: String(item.resourceId || item.trackId || track.id || ''),
            title: track.name || item.text || '未知歌曲',
            artist: artists.map(function (artist) { return artist.name; }).filter(Boolean).join(' / '),
            artistId: String(artists[0] && artists[0].id || ''),
            album: album.name || album.albumName || '',
            albumId: String(album.id || ''),
            source: item.text || '',
            sourceHref: item.href || '',
            cover: track.coverUrl || album.picUrl || ''
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
      var require = targetWindow.__OMC__ && targetWindow.__OMC__.webpackRequire;
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

  function removeQueueItem(targetWindow, trackId) {
    try {
      readInternalPlayerState(targetWindow);
      var require = targetWindow.__OMC__ && targetWindow.__OMC__.webpackRequire;
      var app = require && require(14).a;
      var state = app && app.getStore && app.getStore();
      var items = state && state.playingList && state.playingList.curPlayingList || [];
      var wanted = String(trackId);
      var item = items.find(function (entry) {
        return String(entry.resourceId || entry.trackId || entry.track && entry.track.id || '') === wanted;
      });
      var dispatch = app && app.getDispatch && app.getDispatch();
      if (!item || !dispatch) return false;
      dispatch({
        type: 'playingList/removeItemFromCurPlayingListByIds',
        payload: {
          removeIds: [{ id: item.id, resourceId: item.resourceId }],
          triggerScene: 'playingList'
        }
      });
      return true;
    } catch (error) {
      return false;
    }
  }

  function subscribeInternalProgress(targetWindow, callback) {
    readInternalPlayerState(targetWindow);
    var require = targetWindow.__OMC__ && targetWindow.__OMC__.webpackRequire;
    var progressStream = require && require(167).e;
    if (!progressStream || typeof progressStream.subscribe !== 'function') {
      throw new Error('progress stream unavailable');
    }
    progressStream.subscribe(callback);
  }

  OMC.neteaseAdapter = {
    performMediaAction: performMediaAction,
    getBestArtwork: getBestArtwork,
    readDomMediaState: readDomMediaState,
    readLoggedLikeControl: readLoggedLikeControl,
    readCurrentTrackId: readCurrentTrackId,
    readLikeState: readLikeState,
    readInternalPlayerState: readInternalPlayerState,
    readInternalPlaybackState: readInternalPlaybackState,
    seekInternalPlayback: seekInternalPlayback,
    readInternalVolume: readInternalVolume,
    setInternalVolume: setInternalVolume,
    readPlayingQueue: readPlayingQueue,
    playQueueItem: playQueueItem,
    removeQueueItem: removeQueueItem,
    subscribeInternalProgress: subscribeInternalProgress
  };
})();

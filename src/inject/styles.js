(function () {
  'use strict';
  var OMC = window.__OMC__ = window.__OMC__ || {};
  // ── CSS ──
  var css;

  function createStyles() {
    var style = document.createElement('style');
    style.id = 'omc-styles';
    style.textContent =
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
    'html.omc-mini-active,html.omc-mini-active body,#omc-mini-player{background:#171719}' +
    '#omc-mini-player{position:fixed;inset:0;z-index:2147483647;display:none;overflow:hidden;isolation:isolate;color:#f5f5f5}' +
    '.omc-mini-active #omc-mini-player{display:block}' +
    '.omc-mini-active #omc-window-controls{display:none}' +
    '#omc-mini-art{position:absolute;inset:0;z-index:1;overflow:hidden;background:linear-gradient(145deg,#29292d,#111);-webkit-app-region:no-drag}' +
    '#omc-mini-cover{width:100%;height:100%;display:block;object-fit:cover;user-select:none;-webkit-user-drag:none;-webkit-app-region:no-drag;transition:filter .32s ease,transform .32s ease,opacity .32s ease}' +
    '.omc-mini-lyrics #omc-mini-cover{filter:blur(18px) brightness(.42);transform:scale(1.16);opacity:.72}' +
    '#omc-mini-lyrics{position:absolute;inset:24px 14px;z-index:2;display:flex;align-items:flex-start;overflow:hidden;opacity:0;pointer-events:none;transition:opacity .25s ease}' +
    '.omc-mini-queue-open #omc-mini-lyrics{bottom:auto;height:calc(var(--omc-mini-cover-height, 100vw) - 48px)}' +
    '.omc-mini-lyrics #omc-mini-lyrics{opacity:1}' +
    '#omc-mini-lyric-list{width:100%;padding:110px 0;color:rgba(255,255,255,.48);text-align:center;font-size:13px;line-height:30px;transition:transform .34s cubic-bezier(.22,.72,.25,1)}' +
    '.omc-mini-lyric-line{min-height:30px;padding:4px 8px;white-space:normal;overflow-wrap:anywhere;word-break:break-word;line-height:22px;transition:color .2s ease,font-size .2s ease,font-weight .2s ease}' +
    '.omc-mini-lyric-line.active{color:#fff;font-size:15px;font-weight:700;text-shadow:0 1px 9px rgba(255,255,255,.3)}' +
    '.omc-mini-toolbar{position:absolute;left:0;right:0;z-index:5;color:#303238;background:rgba(250,250,249,.965);backdrop-filter:blur(18px);opacity:0;pointer-events:none;transition:opacity .16s ease,transform .18s ease}' +
    '#omc-mini-player.omc-mini-cover-hover .omc-mini-toolbar{opacity:1;transform:translateY(0);pointer-events:auto}' +
    '#omc-mini-top{top:0;height:50px;display:grid;grid-template-columns:42px 1fr 42px;align-items:center;transform:translateY(-100%);-webkit-app-region:drag}' +
    '#omc-mini-window-actions{display:flex;align-items:center;padding-left:6px;transition:opacity .1s ease;-webkit-app-region:no-drag}' +
    '#omc-mini-player:not(.omc-mini-compact) #omc-mini-window-actions{height:50px;padding:2px 0 2px 6px;flex-direction:column;align-items:flex-start;justify-content:center}' +
    '#omc-mini-player:not(.omc-mini-compact) #omc-mini-window-actions .omc-mini-button{width:16px;height:16px}' +
    '#omc-mini-heading{min-width:0;text-align:center;line-height:1.25}' +
    '#omc-mini-title{overflow:hidden;text-overflow:ellipsis;white-space:nowrap;font-size:12px;font-weight:500;color:#303238}' +
    '#omc-mini-artist{overflow:hidden;text-overflow:ellipsis;white-space:nowrap;margin-top:2px;font-size:11px;color:#898b91}' +
    '#omc-mini-more{justify-self:center;width:24px;height:24px;letter-spacing:1px;color:#8b8d92;font-size:10px;line-height:1;-webkit-app-region:no-drag}' +
    '#omc-mini-more:hover{background:transparent;color:#55585f}' +
    '#omc-mini-bottom{bottom:0;height:60px;padding:3px 8px 4px 28px;display:flex;align-items:center;gap:5px;transform:translateY(100%);-webkit-app-region:no-drag}' +
    '#omc-mini-thumb{width:36px;height:36px;flex:0 0 auto;border-radius:3px;object-fit:cover;background:#ddd}' +
    '#omc-mini-transport{position:absolute;left:50%;top:50%;display:flex;align-items:center;gap:11px;transform:translate(-50%,-50%) translateY(-3px)}' +
    '#omc-mini-prev,#omc-mini-next{color:#df3b3b}' +
    '#omc-mini-prev:hover,#omc-mini-next:hover{background:transparent;color:#c92f2f}' +
    '#omc-mini-tools{margin-left:auto;display:flex;align-items:center;gap:1px;transform:translateY(-3px)}' +
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
    '#omc-mini-progress{position:absolute;left:68px;right:10px;bottom:11px;height:3px;border-radius:2px;background:#c9c9c9;cursor:pointer;-webkit-app-region:no-drag}' +
    '#omc-mini-progress-fill{display:block;width:0;height:100%;border-radius:inherit;background:#df3b3b}' +
    '#omc-mini-progress-thumb{position:absolute;top:50%;left:0;width:8px;height:8px;border-radius:50%;background:#df3b3b;transform:translate(-50%,-50%)}' +
    '.omc-mini-compact #omc-mini-art,.omc-mini-compact #omc-mini-lyrics{display:none}' +
    ':is(.omc-mini-compact,.omc-mini-compacting,.omc-mini-expanding) #omc-mini-top{left:0;right:auto;z-index:7;width:26px;height:50px;display:block;opacity:1;pointer-events:auto;background:transparent;backdrop-filter:none}' +
    '.omc-mini-compact #omc-mini-top{transform:none}' +
    ':is(.omc-mini-compact,.omc-mini-compacting,.omc-mini-expanding) #omc-mini-window-actions{height:50px;padding:2px 0 2px 6px;flex-direction:column;justify-content:center}' +
    ':is(.omc-mini-compact,.omc-mini-compacting,.omc-mini-expanding) #omc-mini-window-actions .omc-mini-button{width:16px;height:16px}' +
    ':is(.omc-mini-compact,.omc-mini-compacting,.omc-mini-expanding) #omc-mini-heading,:is(.omc-mini-compact,.omc-mini-compacting,.omc-mini-expanding) #omc-mini-more{display:none}' +
    ':is(.omc-mini-compact,.omc-mini-compacting,.omc-mini-expanding) #omc-mini-bottom{left:0;opacity:1;transform:none;transition:none;pointer-events:auto;-webkit-app-region:drag}' +
    ':is(.omc-mini-compacting,.omc-mini-expanding) #omc-mini-top{opacity:0;pointer-events:none;transition:none}' +
    '.omc-mini-actions-settling #omc-mini-top{opacity:0;pointer-events:none;transition:none}' +
    '.omc-mini-top-suppressed #omc-mini-top{opacity:0;pointer-events:none;transition:none}' +
    '#omc-mini-thumb-toggle{position:relative;width:36px;height:36px;padding:0;flex:0 0 auto;overflow:hidden;border:0;border-radius:3px;background:#292b31;color:#fff;cursor:pointer}' +
    '#omc-mini-thumb-toggle::after{content:"◆";position:absolute;inset:0;display:grid;place-items:center;background:rgba(25,27,31,.72);font-size:12px;opacity:0;transition:opacity .12s ease}' +
    '#omc-mini-thumb-toggle:hover::after{opacity:1}' +
    ':is(.omc-mini-compact,.omc-mini-compacting,.omc-mini-expanding) #omc-mini-thumb-toggle::after{content:"↕";opacity:0;font-size:17px;font-weight:600}' +
    ':is(.omc-mini-compact,.omc-mini-compacting,.omc-mini-expanding) #omc-mini-thumb-toggle:hover::after{background:rgba(25,27,31,.86);opacity:1}' +
    '#omc-mini-queue-view{position:absolute;left:0;right:0;bottom:0;z-index:4;display:none;height:var(--omc-mini-queue-height,150px);overflow:hidden;background:#fafafa;color:#27292e;border-top:1px solid rgba(0,0,0,.08);opacity:0;transition:opacity .14s ease}' +
    '.omc-mini-queue-open #omc-mini-art{bottom:auto;height:100vw}' +
    '.omc-mini-queue-open .omc-mini-toolbar{transform:none}' +
    '.omc-mini-queue-open #omc-mini-bottom{top:auto;bottom:var(--omc-mini-queue-height,150px);transform:none}' +
    '.omc-mini-queue-open #omc-mini-queue-view{display:block;opacity:1}' +
    '.omc-mini-queue-transition.omc-mini-queue-open #omc-mini-bottom{top:calc(var(--omc-mini-cover-height,60px) - 60px);bottom:auto}' +
    '.omc-mini-queue-transition.omc-mini-queue-open #omc-mini-queue-view{top:var(--omc-mini-cover-height,60px);bottom:0;height:auto}' +
    '#omc-mini-queue-list{position:relative;height:100%;overflow-y:auto;overflow-anchor:none;scrollbar-width:none}' +
    '#omc-mini-queue-list::-webkit-scrollbar{display:none;width:0;height:0}' +
    '#omc-mini-queue-content{position:relative;width:100%;min-height:100%}' +
    '#omc-mini-queue-scrollbar{position:absolute;top:3px;right:2px;bottom:3px;width:5px}' +
    '#omc-mini-queue-scroll-thumb{position:absolute;top:0;right:0;width:4px;min-height:22px;border-radius:4px;background:#b7b7b7;opacity:.82;cursor:default}' +
    '.omc-mini-queue-row{position:absolute;left:0;right:0;height:34px;padding:0 38px 0 22px;box-sizing:border-box;display:flex;align-items:center;gap:8px;cursor:default;font-size:12px;background:#fafafa}' +
    '.omc-mini-queue-row.odd{background:#f4f4f4}' +
    '.omc-mini-queue-row:hover{background:#ececec}' +
    '.omc-mini-queue-row.active{color:#df3b3b}' +
    '.omc-mini-queue-title{min-width:0;flex:1;overflow:hidden;text-overflow:ellipsis;white-space:nowrap}' +
    '.omc-mini-queue-more{position:absolute;right:8px;top:50%;width:24px;height:24px;padding:0;border:0;border-radius:4px;background:transparent;color:#85878c;font-size:10px;line-height:1;letter-spacing:1px;opacity:0;transform:translateY(-50%);cursor:default}' +
    '.omc-mini-queue-row:hover .omc-mini-queue-more,.omc-mini-queue-more:focus-visible{opacity:1}' +
    '.omc-mini-queue-more:hover{background:#dedede;color:#4c4e53}' +
    '#omc-mini-context{position:fixed;z-index:12;display:none;width:112px;padding:4px;border:1px solid rgba(0,0,0,.12);border-radius:5px;background:rgba(250,250,249,.98);box-shadow:0 5px 18px rgba(0,0,0,.22);color:#303238;font-size:12px;backdrop-filter:blur(16px);-webkit-app-region:no-drag}' +
    '#omc-mini-context.open{display:block}' +
    '.omc-mini-context-item{appearance:none;width:100%;height:28px;padding:0 8px;display:flex;align-items:center;gap:7px;border:0;border-radius:3px;background:transparent;color:inherit;text-align:left;font:inherit;cursor:default}' +
    '.omc-mini-context-item:hover{background:#e8e8e7}' +
    '.omc-mini-context-check{width:12px;text-align:center;visibility:hidden}' +
    '#omc-mini-context-topmost[aria-checked="true"] .omc-mini-context-check{visibility:visible}' +
    '@media(max-width:300px){#omc-mini-thumb-toggle,#omc-mini-like{display:none}#omc-mini-progress{left:10px}}' +
    '@media(hover:none){.omc-mini-toolbar{opacity:1!important;transform:none!important;pointer-events:auto!important}}';
    return style;
  }

  function mountStyles() {
    if (!css) css = createStyles();
    var root = document.head || document.documentElement;
    if (!root) return false;
    if (!document.getElementById(css.id)) root.appendChild(css);
    return true;
  }
  OMC.styles = { mount: mountStyles };
})();

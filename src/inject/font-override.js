(function () {
  'use strict';

  var OMC = window.__OMC__ = window.__OMC__ || {};
  var STYLE_ID = 'omc-font-override';
  var FONT_STACK = '"OMC Unified UI","PingFang SC","Microsoft YaHei UI","Segoe UI",sans-serif';
  var FONT_BASE = 'http://omc-font.localhost/';
  var css =
    '@font-face{font-family:"OMC Unified UI";src:url("' + FONT_BASE + 'PingFangSC-Medium-Full.woff2") format("woff2");font-weight:400;font-style:normal;font-display:swap}' +
    '@font-face{font-family:"OMC Unified UI";src:url("' + FONT_BASE + 'PingFangSC-Semibold-Full.woff2") format("woff2");font-weight:500 900;font-style:normal;font-display:swap}' +
    'html,body,body *:not(svg):not(svg *){font-family:' + FONT_STACK + '!important;text-rendering:optimizeLegibility}';

  function refresh() {
    var root = document.head || document.documentElement;
    if (!root || document.getElementById(STYLE_ID)) return false;
    var style = document.createElement('style');
    style.id = STYLE_ID;
    style.textContent = css;
    root.appendChild(style);
    return true;
  }

  function start() {
    if (!document.documentElement) {
      setTimeout(start, 0);
      return;
    }
    refresh();
  }

  start();

  OMC.fontOverride = { refresh: refresh };
})();

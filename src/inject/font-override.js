(function () {
  'use strict';

  var OMC = window.__OMC__ = window.__OMC__ || {};
  var STYLE_ID = 'omc-font-override';
  var FONT_STACK = '"OMC Apple UI","PingFang SC","Microsoft YaHei UI","Segoe UI Variable Text","Segoe UI",sans-serif';
  var FONT_BASE = 'http://omc-font.localhost/';
  var LATIN_RANGE = 'U+0000-024F,U+1E00-1EFF,U+2000-206F,U+20A0-20CF,U+2100-214F,U+2190-21FF';
  var CJK_RANGE = 'U+2E80-2EFF,U+3000-30FF,U+31C0-31EF,U+3400-4DBF,U+4E00-9FFF,U+F900-FAFF,U+FF00-FFEF';
  var css =
    '@font-face{font-family:"OMC Apple UI";src:url("' + FONT_BASE + 'SF-Pro-Text-Regular.otf") format("opentype");font-weight:400;font-style:normal;font-display:swap;unicode-range:' + LATIN_RANGE + '}' +
    '@font-face{font-family:"OMC Apple UI";src:url("' + FONT_BASE + 'SF-Pro-Text-Medium.otf") format("opentype");font-weight:500;font-style:normal;font-display:swap;unicode-range:' + LATIN_RANGE + '}' +
    '@font-face{font-family:"OMC Apple UI";src:url("' + FONT_BASE + 'SF-Pro-Text-Semibold.otf") format("opentype");font-weight:600;font-style:normal;font-display:swap;unicode-range:' + LATIN_RANGE + '}' +
    '@font-face{font-family:"OMC Apple UI";src:url("' + FONT_BASE + 'SF-Pro-Text-Bold.otf") format("opentype");font-weight:700;font-style:normal;font-display:swap;unicode-range:' + LATIN_RANGE + '}' +
    '@font-face{font-family:"OMC Apple UI";src:url("' + FONT_BASE + 'PingFangSC-Medium.woff2") format("woff2");font-weight:400;font-style:normal;font-display:swap;unicode-range:' + CJK_RANGE + '}' +
    '@font-face{font-family:"OMC Apple UI";src:url("' + FONT_BASE + 'PingFangSC-Semibold.woff2") format("woff2");font-weight:500 700;font-style:normal;font-display:swap;unicode-range:' + CJK_RANGE + '}' +
    'html,body,body *:not(svg):not(svg *){font-family:' + FONT_STACK + '!important;font-optical-sizing:auto;text-rendering:optimizeLegibility}';

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

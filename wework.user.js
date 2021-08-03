// ==UserScript==
// @name         weworkjs
// @namespace    http://tampermonkey.net/
// @version      0.3
// @description  try to take over the world!
// @author       Azeroding
// @match        https://work.weixin.qq.com/wework_admin/frame
// @icon         https://www.google.com/s2/favicons?domain=qq.com
// @updateURL    https://raw.githubusercontent.com/Azero-NG/weworkjs/master/wework.user.js
// @downloadURL  https://raw.githubusercontent.com/Azero-NG/weworkjs/master/wework.user.js
// @run-at      document-start
// @grant        none
// @grant unsafeWindow
// ==/UserScript==

// Library code, licensed under MIT
(() => {
  "use strict";
  const Event = class {
    constructor(script, target) {
      this.script = script;
      this.target = target;

      this._cancel = false;
      this._replace = null;
      this._stop = false;
    }

    preventDefault() {
      this._cancel = true;
    }
    stopPropagation() {
      this._stop = true;
    }
    replacePayload(payload) {
      this._replace = payload;
    }
  };

  let callbacks = [];
  window.addBeforeScriptExecuteListener = (f) => {
    if (typeof f !== "function") {
      throw new Error("Event handler must be a function.");
    }
    callbacks.push(f);
  };
  window.removeBeforeScriptExecuteListener = (f) => {
    let i = callbacks.length;
    while (i--) {
      if (callbacks[i] === f) {
        callbacks.splice(i, 1);
      }
    }
  };

  const dispatch = (script, target) => {
    if (script.tagName !== "SCRIPT") {
      return;
    }
    // console.log(script.src, script);

    const e = new Event(script, target);

    if (typeof window.onbeforescriptexecute === "function") {
      try {
        window.onbeforescriptexecute(e);
      } catch (err) {
        console.error(err);
      }
    }

    for (const func of callbacks) {
      if (e._stop) {
        break;
      }
      try {
        func(e);
      } catch (err) {
        console.error(err);
      }
    }

    if (e._cancel) {
      script.textContent = "";
      script.remove();
    } else if (typeof e._replace === "string") {
      script.textContent = e._replace;
    }
  };
  const observer = new MutationObserver((mutations) => {
    for (const m of mutations) {
      for (const n of m.addedNodes) {
        dispatch(n, m.target);
      }
    }
  });
  observer.observe(document, {
    childList: true,
    subtree: true,
  });
})();

// Only works for hard coded scripts, dynamically inserted scripts
// will execute before it can be cancelled
//
// You can patch `Element.prototype.prepend`,
// `Element.prototype.append`, and related functions to interfere with
// dynamically inserted scripts
//
// Also, textContent is not always set properly, especially when the
// script is big

// Compatibility:
//
// Browser    - Cancel Script - Change Script
// Chrome 67  - Yes           - Yes
// Edge 41    - Yes           - Yes
// Firefox 60 - Partially     - Yes
//
// Only inline scripts can be cancelled on Firefox

// Example code, licensed under CC0-1.0

function CheckIfHack() {
  return (
    localStorage.getItem("hackwework") == "true" &&
    localStorage.getItem(
      "la:https://wwcdn.weixin.qq.com/node/wwmng/wwmng/js/customer/csMessage/csMessageListView"
    ) == localStorage.getItem("hackwework_version")
  );
}

function UseHack(version) {
  localStorage.setItem("hackwework_version", version);
  localStorage.setItem("hackwework", "true");
}

function HackCode(code) {
  //   code = code.replace(
  //     "var e=this;",
  //     "var e=this;console.log(e);window.hihi=e;e.filterModel.limit = 100;"
  //   );
  code = code.replace("limit:10,", "limit:100,");
  return code;
}

function csMessage_CheckAndHask() {
  if (/#csMessage\/list/.test(location.href)) {
    if (!CheckIfHack()) {
      let code = localStorage.getItem(
        "lz:https://wwcdn.weixin.qq.com/node/wwmng/wwmng/js/customer/csMessage/csMessageListView"
      );
      if (code.length > 0) {
        let version = localStorage.getItem(
          "la:https://wwcdn.weixin.qq.com/node/wwmng/wwmng/js/customer/csMessage/csMessageListView"
        );
        code = HackCode(code);
        localStorage.setItem(
          "lz:https://wwcdn.weixin.qq.com/node/wwmng/wwmng/js/customer/csMessage/csMessageListView",
          code
        );
        // window.eval(code);
        UseHack(version);
        location.reload();
      }
    }
  }
}

(() => {
  "use strict";
  csMessage_CheckAndHask();
  window.addEventListener("locationchange", function () {
    csMessage_CheckAndHask();
  });
  window.onbeforescriptexecute = (e) => {
    if (e.script.src.indexOf("csMessageListView") >= 0) {
      let bak = e.script.onload;
      e.script.onload = (r) => {
        csMessage_CheckAndHask();
        bak(r);
      };
    }
  };
})();

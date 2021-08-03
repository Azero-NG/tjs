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
    if (
      !(
        script.tagName === "SCRIPT" ||
        (script.tagName === "LINK" && script.as === "script")
      )
    ) {
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

// Library code, licensed under MIT

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

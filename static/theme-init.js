/* Production multi-theme boot + API (load beforeInteractive) */
(function () {
  var KEY = "trackit-theme";
  var THEMES = ["light", "dark", "dim", "contrast", "brand-acme"];
  var root = document.documentElement;
  var mql;
  var STYLE_TAG_PREFIX = "trackit-theme-vars-";

  function safeGet(k) { try { return localStorage.getItem(k); } catch (_) { return null; } }
  function safeSet(k, v) { try { localStorage.setItem(k, v); } catch (_) {} }
  function isKnown(t) { return typeof t === "string" && THEMES.indexOf(t) !== -1; }
  function systemTheme() {
    try {
      mql = mql || window.matchMedia("(prefers-color-scheme: dark)");
      return mql.matches ? "dark" : "light";
    } catch (_) { return "light"; }
  }

  function removeThemeClasses() {
    for (var i = 0; i < THEMES.length; i++) root.classList.remove(THEMES[i]);
  }

  function applyThemeName(name, animate) {
    var t = name === "system" ? systemTheme() : name;
    removeThemeClasses();
    if (isKnown(t)) root.classList.add(t);
    root.setAttribute("data-theme", t);
    root.style.colorScheme = t === "light" ? "light" : "dark";
    if (animate) root.classList.add("theme-animate");
  }

  // Prevent flashes and disable transitions until fully initialized
  root.classList.add("theme-no-transitions");

  var saved = safeGet(KEY) || "system";
  applyThemeName(saved, false);

  if (!mql) {
    try { mql = window.matchMedia("(prefers-color-scheme: dark)"); } catch (_) {}
  }
  if (mql && typeof mql.addEventListener === "function") {
    mql.addEventListener("change", function () {
      var current = safeGet(KEY) || "system";
      if (current === "system") applyThemeName("system", true);
    });
  }

  function init() {
    root.classList.remove("theme-no-transitions");
    root.classList.add("theme-animate");
    window.Theme = {
      set: function (t) {
        if (t !== "system" && !isKnown(t)) return;
        safeSet(KEY, t);
        applyThemeName(t, true);
      },
      get: function () {
        return safeGet(KEY) || "system";
      },
      register: function (names) {
        if (!Array.isArray(names)) return;
        for (var i = 0; i < names.length; i++) {
          if (typeof names[i] === "string" && THEMES.indexOf(names[i]) === -1) {
            THEMES.push(names[i]);
          }
        }
      },
      define: function (name, vars) {
        if (typeof name !== "string" || !name) return;
        var cls = name.trim();
        // sanitize to a valid CSS class token (basic)
        cls = cls.replace(/[^a-zA-Z0-9_-]/g, "-");
        if (THEMES.indexOf(cls) === -1) THEMES.push(cls);
        if (!vars || typeof vars !== "object") return;
        try {
          var id = STYLE_TAG_PREFIX + cls;
          var tag = document.getElementById(id);
          if (!tag) {
            tag = document.createElement("style");
            tag.id = id;
            document.head.appendChild(tag);
          }
          var css = "." + cls + "{";
          for (var k in vars) {
            if (!Object.prototype.hasOwnProperty.call(vars, k)) continue;
            var key = String(k).trim();
            var val = String(vars[k]).trim();
            if (!key.startsWith("--")) key = "--" + key;
            css += key + ":" + val + ";";
          }
          css += "}";
          tag.textContent = css;
        } catch (_) {}
      },
      list: function () { return ["system"].concat(THEMES.slice()); }
    };
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", init);
  } else {
    init();
  }
})();

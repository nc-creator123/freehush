/* GA4 behind a consent banner, for the hand-built static sites. Plain-JS port of tools/ga4/Analytics.tsx
 * (same behaviour, banner, text, styles); edit it in tools/ga4/ and re-copy, never per site.
 *
 * Page tag:  <script src="/analytics.js?v=1" data-ga4="" data-privacy="/privacy/" defer></script>
 *   data-ga4      GA4 measurement ID; empty = analytics off (nothing renders, nothing is sent).
 *                 Set it for a whole site with tools/ga4/nc_set_id.py.
 *   data-privacy  path of the site's privacy page for the banner link (default /privacy/).
 *
 * Basic consent mode: gtag.js is never fetched until analytics is granted, so a visitor who declines
 * (or hasn't answered) sends nothing to Google. Visitors whose clock is in a European time zone are
 * asked first (EEA/UK/CH rules); everyone else is opted in with a way out via any link to
 * #cookie-settings (the privacy page has one). A browser sending Global Privacy Control is treated
 * as a "no" unless the visitor explicitly accepts. ES2017, no dependencies, defer-safe. */
(function () {
  "use strict";
  var KEY = "analytics-consent";
  var ASK_TZ = /^(Europe\/|Atlantic\/(Reykjavik|Canary|Madeira|Azores|Faroe))/;

  var me = document.currentScript || document.querySelector('script[src*="/analytics.js"][data-ga4]');
  if (!me) return;
  var GA4_ID = (me.getAttribute("data-ga4") || "").trim();
  var PRIVACY = me.getAttribute("data-privacy") || "/privacy/";
  if (!GA4_ID) return;

  function stored() {
    try { return localStorage.getItem(KEY); } catch (e) { return null; }
  }
  function store(v) {
    try { localStorage.setItem(KEY, v); } catch (e) { /* private mode: choice lasts this page only */ }
  }

  // GA sets _ga / _ga_<ID> on the registrable domain; expire them under every plausible scope
  function clearGaCookies() {
    var host = location.hostname;
    var scopes = ["", host, "." + host, "." + host.split(".").slice(-2).join(".")];
    document.cookie.split(";").forEach(function (c) {
      var name = c.split("=")[0].trim();
      if (name !== "_ga" && name.indexOf("_ga_") !== 0) return;
      scopes.forEach(function (d) {
        document.cookie = name + "=; expires=Thu, 01 Jan 1970 00:00:00 GMT; path=/" + (d ? "; domain=" + d : "");
      });
    });
  }

  function start(id) {
    var w = window;
    if (w.__ga4Loaded) {
      if (w.gtag) w.gtag("consent", "update", { analytics_storage: "granted" });
      return;
    }
    w.__ga4Loaded = true;
    w.dataLayer = w.dataLayer || [];
    // gtag must push the arguments object itself, not an array copy
    w.gtag = function () { w.dataLayer.push(arguments); };
    w.gtag("consent", "default", {
      analytics_storage: "granted",
      ad_storage: "denied",
      ad_user_data: "denied",
      ad_personalization: "denied"
    });
    w.gtag("js", new Date());
    w.gtag("config", id, { anonymize_ip: true });
    var load = function () {
      var s = document.createElement("script");
      s.async = true;
      s.src = "https://www.googletagmanager.com/gtag/js?id=" + encodeURIComponent(id);
      document.head.appendChild(s);
    };
    // after the page has settled, so the tag never competes with first paint
    if (document.readyState === "complete") setTimeout(load, 1200);
    else window.addEventListener("load", function () { setTimeout(load, 1200); }, { once: true });
  }

  var banner = null;

  function btn(primary) {
    return "font:inherit;font-weight:600;padding:8px 16px;border-radius:8px;cursor:pointer;" +
      "min-height:40px;border:1px solid #1a1a1a;" +
      "background:" + (primary ? "#1a1a1a" : "#fff") + ";color:" + (primary ? "#fff" : "#1a1a1a");
  }

  function decide(v) {
    store(v);
    if (v === "granted") start(GA4_ID);
    else {
      if (window.gtag) window.gtag("consent", "update", { analytics_storage: "denied" });
      clearGaCookies();
    }
    close();
    if (location.hash === "#cookie-settings") history.replaceState(null, "", location.pathname + location.search);
  }

  function close() {
    if (banner && banner.parentNode) banner.parentNode.removeChild(banner);
    banner = null;
  }

  function open() {
    if (banner) return;
    if (!document.body) { document.addEventListener("DOMContentLoaded", open, { once: true }); return; }
    var d = document.createElement("div");
    d.setAttribute("role", "dialog");
    d.setAttribute("aria-label", "Analytics cookies");
    d.style.cssText = "position:fixed;inset-inline:12px;bottom:12px;z-index:60;margin:0 auto;" +
      "max-width:34rem;padding:14px 16px;border-radius:12px;" +
      "background:#fff;color:#1a1a1a;border:1px solid rgba(0,0,0,.14);" +
      "box-shadow:0 8px 28px rgba(0,0,0,.18);font-size:14px;line-height:1.45";

    var p = document.createElement("p");
    p.style.cssText = "margin:0";
    p.appendChild(document.createTextNode(
      "We’d like to use Google Analytics cookies to see which pages are useful. No ads, no selling data. "));
    var a = document.createElement("a");
    a.setAttribute("href", PRIVACY);
    a.style.cssText = "color:inherit;text-decoration:underline";
    a.textContent = "Privacy";
    p.appendChild(a);

    var row = document.createElement("div");
    row.style.cssText = "display:flex;gap:8px;margin-top:10px;justify-content:flex-end";
    [["Decline", "denied", false], ["Accept", "granted", true]].forEach(function (b) {
      var el = document.createElement("button");
      el.type = "button";
      el.textContent = b[0];
      el.style.cssText = btn(b[2]);
      el.addEventListener("click", function () { decide(b[1]); });
      row.appendChild(el);
    });

    d.appendChild(p);
    d.appendChild(row);
    banner = d;
    document.body.appendChild(d);
  }

  var choice = stored();
  var tz = "";
  try { tz = Intl.DateTimeFormat().resolvedOptions().timeZone || ""; } catch (e) { /* very old engine */ }
  var gpc = navigator.globalPrivacyControl === true;
  if (choice === "granted") start(GA4_ID);
  else if (!choice && ASK_TZ.test(tz)) open();
  else if (!choice && !gpc) start(GA4_ID);

  function onHash() { if (location.hash === "#cookie-settings") open(); }
  onHash();
  window.addEventListener("hashchange", onHash);
  // catch the click too, so the link works even when the hash is already #cookie-settings
  document.addEventListener("click", function (e) {
    var t = e.target;
    var a = t && t.closest ? t.closest('a[href$="#cookie-settings"]') : null;
    if (a) { e.preventDefault(); open(); }
  }, true);
})();

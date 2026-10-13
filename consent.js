// consent.js: asks before any advertising cookie is set (UK PECR / GDPR), then loads the Google Ads
// tag only if the visitor said yes. Until ADS_ID is filled in, this file does nothing at all: no
// banner, no script, no cookie.
//
// The answer is kept in a cookie on .bidalize.com (bdl_consent = granted | denied, 180 days), so the
// app at app.bidalize.com can read it and report a sign-up to Google Ads only for people who agreed.
// Remarketing (ad_personalization) and analytics stay off either way.
(function () {
  var ADS_ID = 'AW-18510192844' // Google Ads tag for the Bidalize ads account (Vorapure UK Ltd)
  if (!ADS_ID) return

  var NAME = 'bdl_consent'
  var onOurDomain = /(^|\.)bidalize\.com$/.test(location.hostname)
  function get() { var m = document.cookie.match(/(?:^|; )bdl_consent=([^;]*)/); return m ? m[1] : null }
  function set(v) {
    document.cookie = NAME + '=' + v + '; Max-Age=' + 180 * 86400 + '; Path=/; SameSite=Lax; Secure' + (onOurDomain ? '; Domain=.bidalize.com' : '')
  }
  function clear() {
    document.cookie = NAME + '=; Max-Age=0; Path=/; SameSite=Lax; Secure' + (onOurDomain ? '; Domain=.bidalize.com' : '')
  }
  function load() {
    if (window.__bdlAds) return
    window.__bdlAds = true
    window.dataLayer = window.dataLayer || []
    window.gtag = function () { window.dataLayer.push(arguments) }
    window.gtag('consent', 'default', { ad_storage: 'granted', ad_user_data: 'granted', ad_personalization: 'denied', analytics_storage: 'denied' })
    window.gtag('js', new Date())
    window.gtag('config', ADS_ID)
    var s = document.createElement('script'); s.async = true
    s.src = 'https://www.googletagmanager.com/gtag/js?id=' + encodeURIComponent(ADS_ID)
    document.head.appendChild(s)
  }

  function banner() {
    if (document.getElementById('bdl-consent')) return
    var b = document.createElement('div')
    b.id = 'bdl-consent'
    b.setAttribute('role', 'dialog'); b.setAttribute('aria-label', 'Cookies')
    b.style.cssText = 'position:fixed;left:16px;right:16px;bottom:16px;z-index:50;max-width:560px;margin:0 auto;background:#fff;color:#14171f;' +
      'border:1px solid #e4e6ec;border-radius:12px;box-shadow:0 18px 50px -20px rgba(20,23,31,.35);padding:16px 18px;font:14px/1.5 Inter,system-ui,sans-serif'
    b.innerHTML = '<div style="margin-bottom:10px">May we use Google Ads cookies? They only tell us which of our ads lead to a sign-up. ' +
      'No other tracking, and nothing is set if you say no. <a href="/cookies" style="color:#1b3a8c">Cookie policy</a></div>' +
      '<div style="display:flex;gap:8px;flex-wrap:wrap">' +
      '<button type="button" data-v="granted" style="padding:8px 16px;border-radius:8px;border:none;background:#1b3a8c;color:#fff;font:inherit;font-weight:600;cursor:pointer">Accept</button>' +
      '<button type="button" data-v="denied" style="padding:8px 16px;border-radius:8px;border:1px solid #e4e6ec;background:#fff;color:#1b3a8c;font:inherit;font-weight:600;cursor:pointer">No thanks</button></div>'
    b.addEventListener('click', function (e) {
      var v = e.target && e.target.getAttribute && e.target.getAttribute('data-v')
      if (!v) return
      set(v); b.remove()
      if (v === 'granted') load()
    })
    document.body.appendChild(b)
  }

  function settingsLink() {
    var f = document.querySelector('.footlinks')
    if (!f || document.getElementById('bdl-cookie-settings')) return
    var a = document.createElement('a')
    a.id = 'bdl-cookie-settings'; a.href = '#'; a.textContent = 'Cookie settings'
    a.addEventListener('click', function (e) {
      e.preventDefault()
      var was = get()
      clear()                         // forget the answer; the banner asks again
      if (was === 'granted') { location.reload(); return } // a reload stops the tag that is already running
      banner()
    })
    f.appendChild(a)
  }

  function start() {
    var c = get()
    if (c === 'granted') load()
    else if (c !== 'denied') banner()
    settingsLink()
  }
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', start)
  else start()
})()

// nav.js: a Menu button for narrow screens. Each page hides some header links on small screens
// (class "hide"); without this there was no way to reach them except scrolling. When those links
// are hidden, the header keeps the logo, Start free (if the page has it) and a Menu button; the
// button opens a panel under the header with every other header link. Desktop is unchanged.
// Tester strip (13 Oct 2026): one line above the header on every page except /testers itself, linking
// to the tester programme. It can be closed; the choice is kept in this browser only (localStorage, no
// cookie, nothing sent anywhere). To take it down when the places are full, set TESTER_STRIP to false.
(function () {
  var TESTER_STRIP = true
  if (!TESTER_STRIP) return
  if (/^\/testers(\.html)?\/?$/.test(location.pathname)) return
  var KEY = 'bdl_tester_strip_closed'
  try { if (localStorage.getItem(KEY)) return } catch (e) { /* storage blocked: show it */ }
  var nav = document.querySelector('nav')
  if (!nav || !nav.parentNode) return

  var css = document.createElement('style')
  css.textContent =
    '.bdl-strip{position:relative;background:#1b3a8c;color:#fff;font:500 13.5px/1.45 Inter,system-ui,sans-serif;text-align:center;padding:9px 44px}' +
    '.bdl-strip a{color:#fff;text-decoration:underline;text-underline-offset:2px;font-weight:600;white-space:nowrap}' +
    '.bdl-strip button{position:absolute;right:8px;top:50%;transform:translateY(-50%);width:30px;height:30px;border:0;border-radius:6px;' +
    'background:transparent;color:#c3cdea;font-size:20px;line-height:1;cursor:pointer}' +
    '.bdl-strip button:hover{background:rgba(255,255,255,.12);color:#fff}' +
    '@media(max-width:560px){.bdl-strip{font-size:13px;padding:8px 40px 8px 14px;text-align:left}}'
  document.head.appendChild(css)

  var bar = document.createElement('div')
  bar.className = 'bdl-strip'; bar.setAttribute('role', 'region'); bar.setAttribute('aria-label', 'Tester programme')
  bar.innerHTML = 'Testers wanted: 45 days free, up to 20 organisations. <a href="/testers">See the terms &rarr;</a>' +
    '<button type="button" aria-label="Close this message">&times;</button>'
  bar.querySelector('button').addEventListener('click', function () {
    try { localStorage.setItem(KEY, String(Date.now())) } catch (e) { /* closes for this page view only */ }
    bar.remove()
  })
  nav.parentNode.insertBefore(bar, nav)
})();

(function () {
  var nav = document.querySelector('nav')
  var bar = nav && nav.querySelector('.navlinks')
  if (!bar) return
  var hidden = bar.querySelectorAll('a.hide')
  if (!hidden.length) return

  var css = document.createElement('style')
  css.textContent =
    '.bdl-menu-btn{display:none;align-items:center;gap:6px;padding:8px 12px;border:1px solid var(--line,#e4e6ec);border-radius:8px;background:#fff;' +
    'color:var(--ink,#14171f);font:inherit;font-size:14px;font-weight:600;cursor:pointer;line-height:1}' +
    '.bdl-narrow .bdl-menu-btn{display:inline-flex}' +
    '.bdl-narrow .navlinks{gap:10px}' +
    '.bdl-narrow .navlinks .btn{white-space:nowrap;padding-left:14px;padding-right:14px}' +
    '.bdl-narrow .navlinks>a:not(.btn){display:none!important}' +
    '.bdl-menu{position:absolute;left:0;right:0;top:100%;background:#fff;border-bottom:1px solid var(--line,#e4e6ec);' +
    'box-shadow:0 18px 40px -24px rgba(20,23,31,.35);padding:6px 16px 12px;z-index:30}' +
    '.bdl-menu[hidden]{display:none}' +
    '.bdl-menu a{display:block;padding:12px 4px;font-size:16px;color:var(--ink,#14171f);text-decoration:none;border-bottom:1px solid var(--line,#e4e6ec)}' +
    '.bdl-menu a:last-child{border-bottom:none}'
  document.head.appendChild(css)

  if (getComputedStyle(nav).position === 'static') nav.style.position = 'relative'

  var panel = document.createElement('div')
  panel.className = 'bdl-menu'; panel.id = 'bdl-menu'; panel.hidden = true
  Array.prototype.forEach.call(bar.querySelectorAll('a'), function (a) {
    if (a.classList.contains('btn')) return
    var c = document.createElement('a')
    c.href = a.getAttribute('href'); c.textContent = a.textContent
    if (a.target) c.target = a.target
    panel.appendChild(c)
  })
  nav.appendChild(panel)

  var btn = document.createElement('button')
  btn.type = 'button'; btn.className = 'bdl-menu-btn'
  btn.setAttribute('aria-expanded', 'false'); btn.setAttribute('aria-controls', 'bdl-menu')
  btn.innerHTML = '<span aria-hidden="true" style="font-size:16px">&#9776;</span>Menu'
  bar.appendChild(btn)

  function close() { panel.hidden = true; btn.setAttribute('aria-expanded', 'false') }
  btn.addEventListener('click', function (e) {
    e.stopPropagation()
    var open = panel.hidden
    panel.hidden = !open; btn.setAttribute('aria-expanded', open ? 'true' : 'false')
  })
  panel.addEventListener('click', function (e) { if (e.target.tagName === 'A') close() })
  document.addEventListener('click', function (e) { if (!panel.hidden && !panel.contains(e.target)) close() })
  document.addEventListener('keydown', function (e) { if (e.key === 'Escape' && !panel.hidden) { close(); btn.focus() } })

  // narrow = the page's own CSS has hidden its "hide" links (each page sets its own breakpoint)
  function check() {
    nav.classList.remove('bdl-narrow')   // measure the page's own rule, not ours
    var narrow = getComputedStyle(hidden[0]).display === 'none'
    nav.classList.toggle('bdl-narrow', narrow)
    if (!narrow) close()
  }
  check()
  window.addEventListener('resize', check)
})()

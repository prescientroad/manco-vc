/* Client-side access gate for manco.vc.
   Casual-visitor deterrent only: the check runs in the browser and can be bypassed
   by a technical visitor. Do not put anything sensitive behind this gate. */
(function () {
  var EXPECTED_SHA256 = '2e9fc6eabc92b2782ff83a813ef007faa58880ab2b387a20ee6cee1937e5eb5a'; // sha256 of the lowercase password
  if (sessionStorage.getItem('manco_gate') === '1') return;

  var hide = document.createElement('style');
  hide.id = 'manco-gate-hide';
  hide.textContent = 'body{visibility:hidden!important}';
  document.head.appendChild(hide);

  function sha256(text) {
    return crypto.subtle.digest('SHA-256', new TextEncoder().encode(text)).then(function (buf) {
      return Array.prototype.map.call(new Uint8Array(buf), function (b) {
        return ('0' + b.toString(16)).slice(-2);
      }).join('');
    });
  }

  function unlock() {
    sessionStorage.setItem('manco_gate', '1');
    var overlay = document.getElementById('manco-gate');
    if (overlay) overlay.remove();
    var h = document.getElementById('manco-gate-hide');
    if (h) h.remove();
  }

  function build() {
    var overlay = document.createElement('div');
    overlay.id = 'manco-gate';
    overlay.setAttribute('style',
      'position:fixed;top:0;left:0;right:0;bottom:0;z-index:2147483647;background:#FBF7F4;' +
      'display:flex;align-items:center;justify-content:center;padding:32px;' +
      'font-family:Inter,-apple-system,sans-serif;');
    overlay.innerHTML =
      '<div style="max-width:360px;width:100%;text-align:center;">' +
        '<p style="font-family:Cinzel,serif;letter-spacing:.32em;text-transform:uppercase;' +
          'font-size:13px;color:#1B2F4B;font-weight:500;margin:0 0 40px;">The Management Company</p>' +
        '<p style="color:#7C7668;font-size:14px;font-weight:300;line-height:1.7;margin:0 0 24px;">This site is private. Enter the password to continue.</p>' +
        '<form id="manco-gate-form" novalidate>' +
          '<input id="manco-gate-input" type="password" autocomplete="off" placeholder="Password" ' +
            'style="width:100%;padding:14px 16px;font-size:15px;border:1px solid #E2DACB;background:#FFFFFF;' +
            'color:#26313F;outline:none;text-align:center;letter-spacing:.05em;" />' +
          '<button type="submit" style="display:inline-block;width:100%;margin-top:12px;padding:14px 0;' +
            'font-size:12px;letter-spacing:.22em;text-transform:uppercase;font-weight:500;background:#1B2F4B;' +
            'color:#FBF7F4;border:0;cursor:pointer;">Enter</button>' +
          '<p id="manco-gate-error" style="color:#A33;font-size:13px;margin:14px 0 0;visibility:hidden;">Incorrect password.</p>' +
        '</form>' +
      '</div>';
    document.documentElement.appendChild(overlay);
    var input = document.getElementById('manco-gate-input');
    input.focus();
    document.getElementById('manco-gate-form').addEventListener('submit', function (e) {
      e.preventDefault();
      sha256(input.value.trim().toLowerCase()).then(function (hex) {
        if (hex === EXPECTED_SHA256) {
          unlock();
        } else {
          document.getElementById('manco-gate-error').style.visibility = 'visible';
          input.value = '';
          input.focus();
        }
      });
    });
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', build);
  } else {
    build();
  }
})();

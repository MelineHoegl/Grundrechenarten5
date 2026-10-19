/* Rechen-Gipfel – kleine Hilfsfunktionen */
window.RG = window.RG || {};
(function (RG) {
  RG.rnd = function (a, b) { return a + Math.floor(Math.random() * (b - a + 1)); };
  RG.pick = function (arr) { return arr[Math.floor(Math.random() * arr.length)]; };
  RG.shuffle = function (arr) {
    var a = arr.slice();
    for (var i = a.length - 1; i > 0; i--) {
      var j = Math.floor(Math.random() * (i + 1));
      var t = a[i]; a[i] = a[j]; a[j] = t;
    }
    return a;
  };
  /* Tausendergruppen mit schmalem Leerzeichen: 12 345 */
  RG.fmt = function (n) { return String(n).replace(/\B(?=(\d{3})+(?!\d))/g, ' '); };
  RG.len = function (n) { return String(n).length; };
  RG.digitsOf = function (n) { return String(n).split('').map(Number); };
  /* Stellenwert-Zerlegung: 285 -> [200, 80, 5] (Nullen fallen weg) */
  RG.placeParts = function (n) {
    var s = String(n), out = [];
    for (var i = 0; i < s.length; i++) {
      var d = Number(s[i]);
      if (d) out.push(d * Math.pow(10, s.length - 1 - i));
    }
    return out;
  };
  /* Stellenwert-Namen von rechts: E, Z, H, T, ZT, HT */
  RG.PLACE = ['E', 'Z', 'H', 'T', 'ZT', 'HT', 'M'];
  RG.PLACE_LONG = ['Einer', 'Zehner', 'Hunderter', 'Tausender', 'Zehntausender', 'Hunderttausender', 'Millionen'];

  /* Überschlag: auf die höchste Stelle runden */
  RG.roundLead = function (n) {
    var p = Math.pow(10, String(n).length - 1);
    return Math.round(n / p) * p;
  };

  /* Speicher (nur in diesem Browser) */
  var KEY = 'rechengipfel-v1';
  RG.store = {
    load: function () { try { return JSON.parse(localStorage.getItem(KEY)) || null; } catch (e) { return null; } },
    save: function (d) { try { localStorage.setItem(KEY, JSON.stringify(d)); } catch (e) { /* ohne Speicher weiter */ } },
    clear: function () { try { localStorage.removeItem(KEY); } catch (e) { /* egal */ } }
  };

  /* DOM-Helfer */
  RG.el = function (tag, attrs, children) {
    var e = document.createElement(tag);
    if (attrs) {
      Object.keys(attrs).forEach(function (k) {
        var v = attrs[k];
        if (v === undefined || v === null || v === false) return;
        if (k === 'text') e.textContent = v;
        else if (k === 'html') e.innerHTML = v;
        else if (k.slice(0, 2) === 'on') e.addEventListener(k.slice(2), v);
        else e.setAttribute(k, v === true ? '' : v);
      });
    }
    (children || []).forEach(function (c) {
      if (c === null || c === undefined || c === false) return;
      e.appendChild(typeof c === 'string' ? document.createTextNode(c) : c);
    });
    return e;
  };
})(window.RG);

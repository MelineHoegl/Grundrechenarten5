/* Rechen-Gipfel – Aufbau und Prüfung der Übungen (ohne Bildschirm-Code, damit es testbar bleibt) */
(function (RG) {
  var F = RG.fmt, len = RG.len, P = RG.PLACE;

  function range(a, b) { var r = []; for (var i = a; i <= b; i++) r.push(i); return r; }
  /* Zahl rechtsbündig auf die gegebenen Spalten legen -> {spalte: ziffer} */
  function alignRight(value, cols) {
    var s = String(value), out = {};
    for (var i = 0; i < s.length && i < cols.length; i++) out[cols[cols.length - 1 - i]] = s[s.length - 1 - i];
    return out;
  }
  RG.alignRight = alignRight;

  RG.title = function (t) {
    if (t.kind === 'add') return t.terms.map(F).join(' + ');
    if (t.kind === 'sub') return F(t.a) + ' − ' + F(t.b);
    if (t.kind === 'mul') return F(t.n) + ' · ' + F(t.f);
    return F(t.D) + ' : ' + F(t.d);
  };
  RG.resultText = function (t) {
    if (t.kind === 'div' && t.r) return F(t.q) + ' Rest ' + t.r;
    return F(t.answer);
  };

  /* Schritte für „Zahl mal einstellige Zahl“ wie auf dem Plakat */
  function mulSteps(n, f) {
    var ds = String(n).split('').reverse().map(Number), c = 0, out = [];
    ds.forEach(function (x, i) {
      var pr = f * x, tot = pr + c, last = i === ds.length - 1;
      var s = f + ' mal ' + x + ' ist ' + pr + (c ? ', plus ' + c + ' gemerkt ist ' + tot : '');
      if (last) s += ', ' + tot + ' an';
      else s += ', ' + (tot % 10) + ' an' + (tot >= 10 ? ', ' + Math.floor(tot / 10) + ' gemerkt' : '');
      out.push(s);
      c = Math.floor(tot / 10);
    });
    return out;
  }
  /* Überträge beim Malnehmen: {stelle: übertrag} */
  function mulCarries(n, f) {
    var ds = String(n).split('').reverse().map(Number), c = 0, res = {};
    ds.forEach(function (x, i) {
      var tot = f * x + c;
      c = Math.floor(tot / 10);
      if (c && i < ds.length - 1) res[i + 1] = c;
    });
    return res;
  }
  function addCarries(nums) {
    var L = Math.max.apply(null, nums.map(len)), c = 0, res = {};
    for (var i = 0; i < L; i++) {
      var s = c;
      nums.forEach(function (n) { s += Math.floor(n / Math.pow(10, i)) % 10; });
      c = Math.floor(s / 10);
      if (c && i < L - 1) res[i + 1] = c;
    }
    return res;
  }
  function overschlag(t) {
    if (t.kind === 'add') { var r = t.terms.map(RG.roundLead); return r.map(F).join(' + ') + ' = ' + F(r.reduce(function (a, b) { return a + b; }, 0)); }
    if (t.kind === 'sub') { var a = RG.roundLead(t.a), b = RG.roundLead(t.b); return F(a) + ' − ' + F(b) + ' = ' + F(a - b); }
    if (t.kind === 'mul') { var n = RG.roundLead(t.n), f = t.f < 10 ? t.f : RG.roundLead(t.f); return F(n) + ' · ' + f + ' = ' + F(n * f); }
    return '';
  }
  RG.overschlag = overschlag;

  /* =================== Schriftlich: Rechenkästchen =================== */
  RG.buildGrid = function (t, stufe) {
    var spec;
    if (t.kind === 'add') spec = gridAdd(t);
    else if (t.kind === 'sub') spec = gridSub(t);
    else spec = stufe === 2 ? gridMul2(t) : gridMul1(t);
    spec.title = RG.title(t);
    return spec;
  };

  function gridAdd(t) {
    var W = Math.max(len(t.answer), Math.max.apply(null, t.terms.map(len)));
    var cols = range(1, W), rows = [];
    t.terms.forEach(function (x, j) {
      rows.push({ type: 'static', cells: alignRight(x, cols), sign: j === t.terms.length - 1 ? '+' : '' });
    });
    rows.push({ type: 'helper', key: 'c', cols: cols, mode: 'digit', small: true, label: 'Merkzahl' });
    rows.push({ type: 'input', key: 'res', cols: cols, ruleTop: true, label: 'Summe' });
    var carry = addCarries(t.terms), solC = {};
    /* Stelle p (0 = Einer) liegt in Spalte W - p */
    Object.keys(carry).forEach(function (p) { solC[W - Number(p)] = String(carry[p]); });
    var steps = [], c = 0;
    for (var i = 0; i < len(t.answer); i++) {
      var ds = t.terms.map(function (n) { return Math.floor(n / Math.pow(10, i)) % 10; }).filter(function (d, k) { return Math.pow(10, i) <= t.terms[k]; });
      var s = ds.reduce(function (a, b) { return a + b; }, 0) + c;
      if (!ds.length && !c) break;
      var txt = (P[i] || '') + ': ' + (ds.length ? ds.join(' + ') : '0') + (c ? ' + ' + c + ' gemerkt' : '') + ' = ' + s;
      var lastPlace = i === len(t.answer) - 1;
      if (lastPlace || s < 10) txt += ', ' + (lastPlace ? s : s % 10) + ' an';
      else txt += ', ' + (s % 10) + ' an, ' + Math.floor(s / 10) + ' gemerkt';
      steps.push(txt);
      c = Math.floor(s / 10);
      if (lastPlace) break;
    }
    return {
      C: W, rows: rows,
      check: function (read) {
        var r = read('res'), ok = r === t.answer;
        return { ok: ok, rows: { res: ok }, msg: ok ? '' : 'Die Summe stimmt noch nicht. Fang rechts bei den Einern an und denk an die Merkzahlen.' };
      },
      solution: { res: alignRight(t.answer, cols), c: solC },
      hint: 'Schreib Stelle unter Stelle und beginne rechts bei den Einern. ' + steps[0] + '. Überschlag: ' + overschlag(t),
      steps: steps
    };
  };

  /* Bayerisches Verfahren: Abziehen mit Entbündeln, Strich unter der entbündelten Stelle */
  RG.subBavaria = function (a, b) {
    var A = String(a).split('').reverse().map(Number), B = String(b).split('').reverse().map(Number);
    var avail = A.slice(), taken = {}, chain = {}, steps = [];
    for (var i = 0; i < A.length; i++) {
      var y = B[i] || 0;
      if (i >= B.length) {
        /* Oben steht nur noch die Zahl des Minuenden: übernehmen */
        if (avail[i] > 0) steps.push(taken[i] && !chain[i] ? A[i] + ' ' + P[i] + ' − | = ' + avail[i] + ' ' + P[i] + ', übernehmen' : avail[i] + ' ' + P[i] + ' übernehmen');
        continue;
      }
      var label = chain[i] ? '9 ' + P[i] + ' (nach dem Entbündeln)' : (taken[i] ? A[i] + ' ' + P[i] + ' − |' : avail[i] + ' ' + P[i]);
      if (avail[i] < y) {
        var j = i + 1;
        while (avail[j] === 0) j++;
        avail[j] -= 1; taken[j] = true;
        for (var k = j - 1; k > i; k--) { avail[k] = 9; chain[k] = true; taken[k] = true; }
        avail[i] += 10;
        var txt = label + ' − ' + y + ' ' + P[i] + ' geht nicht. Ich entbündele 1 ' + P[j] + ' (|)';
        if (j > i + 1) txt += ' und tausche weiter, bis ich 10 ' + P[i] + ' mehr habe';
        txt += '. ' + avail[i] + ' ' + P[i] + ' − ' + y + ' ' + P[i] + ' = ' + (avail[i] - y) + ' ' + P[i];
        steps.push(txt);
      } else {
        steps.push(label + ' − ' + y + ' ' + P[i] + ' = ' + (avail[i] - y) + ' ' + P[i]);
      }
    }
    return { steps: steps, marks: Object.keys(taken).map(Number) };
  };

  function gridSub(t) {
    var W = len(t.a), cols = range(1, W);
    var bav = RG.subBavaria(t.a, t.b), marks = {};
    bav.marks.forEach(function (p) { marks[W - p] = '|'; });
    var rows = [
      { type: 'static', cells: alignRight(t.a, cols) },
      { type: 'helper', key: 'm', cols: cols, mode: 'mark', small: true, label: 'Entbündel-Strich' },
      { type: 'static', cells: alignRight(t.b, cols), sign: '−' },
      { type: 'input', key: 'res', cols: cols, ruleTop: true, label: 'Differenz' }
    ];
    return {
      C: W, rows: rows,
      check: function (read) {
        var r = read('res'), ok = r === t.answer;
        return { ok: ok, rows: { res: ok }, msg: ok ? '' : 'Die Differenz stimmt noch nicht. Wenn oben zu wenig ist: entbündeln und einen Strich machen.' };
      },
      solution: { res: alignRight(t.answer, cols), m: marks },
      hint: 'Beginne rechts bei den Einern. ' + bav.steps[0] + '. Tipp: Tippe in die Strich-Zeile, wenn du entbündelst.',
      steps: bav.steps
    };
  }

  function gridMul1(t) {
    var Ln = len(t.n), W = Ln + 2, cells = alignRight(t.n, range(1, Ln));
    cells[Ln + 1] = '·'; cells[Ln + 2] = String(t.f);
    var resCols = range(W - Ln, W);
    var carry = mulCarries(t.n, t.f), solC = {};
    Object.keys(carry).forEach(function (p) { solC[W - Number(p)] = String(carry[p]); });
    var rows = [
      { type: 'static', cells: cells },
      { type: 'helper', key: 'c', cols: range(1, W), mode: 'digit', small: true, ruleTop: true, label: 'Merkzahl' },
      { type: 'input', key: 'res', cols: resCols, label: 'Ergebnis' }
    ];
    var steps = ['Von rechts nach links:'].concat(mulSteps(t.n, t.f));
    return {
      C: W, rows: rows,
      check: function (read) {
        var r = read('res'), ok = r === t.answer;
        return { ok: ok, rows: { res: ok }, msg: ok ? '' : 'Das Ergebnis stimmt noch nicht. Rechne von rechts nach links und addiere die Merkzahl.' };
      },
      solution: { res: alignRight(t.answer, resCols), c: solC },
      hint: 'Beginne ganz rechts: ' + mulSteps(t.n, t.f)[0] + '. Überschlag: ' + overschlag(t),
      steps: steps
    };
  }

  function gridMul2(t) {
    var Ln = len(t.n), W = Ln + 3, T = Math.floor(t.f / 10), E = t.f % 10;
    var cells = alignRight(t.n, range(1, Ln));
    cells[Ln + 1] = '·'; cells[Ln + 2] = String(T); cells[Ln + 3] = String(E);
    var wide = range(W - Ln - 1, W), narrow = range(W - Ln, W);
    var A = t.n * T * 10, B = t.n * E;
    var carry = addCarries([A, B]), solC = {};
    Object.keys(carry).forEach(function (p) { solC[W - Number(p)] = String(carry[p]); });
    var rows = [
      { type: 'static', cells: cells },
      { type: 'input', key: 'r1', cols: wide, ruleTop: true, label: '1. Zwischenergebnis' },
      { type: 'input', key: 'r2', cols: narrow, label: '2. Zwischenergebnis' },
      { type: 'helper', key: 'c', cols: range(1, W), mode: 'digit', small: true, sign: '+', label: 'Merkzahl' },
      { type: 'input', key: 'res', cols: wide, ruleTop: true, label: 'Ergebnis' }
    ];
    var steps = ['Erst mit der ' + T + '0: 0 nach unten, dann ' + T + ' mal …'].concat(mulSteps(t.n, T).map(function (s) { return '   ' + s; }))
      .concat(['Dann mit der ' + E + ':']).concat(E ? mulSteps(t.n, E).map(function (s) { return '   ' + s; }) : ['   ' + E + ' mal ' + F(t.n) + ' ist 0'])
      .concat(['Zum Schluss die Zwischenergebnisse addieren: ' + F(A) + ' + ' + F(B) + ' = ' + F(t.answer)]);
    return {
      C: W, rows: rows,
      check: function (read) {
        var v1 = read('r1'), v2 = read('r2'), r = read('res');
        var a = v1 === null ? -1 : v1, b = v2 === null ? 0 : v2;
        var ok1 = a === A || a === B;
        var ok2 = a === A ? b === B : (a === B ? b === A : (b === A || b === B));
        if (v1 === null && v2 === null) { ok1 = false; ok2 = false; }
        var ok3 = r === t.answer, msg = '';
        if (!(ok1 && ok2) && ok3) msg = 'Das Ergebnis stimmt. Schreib aber auch die Zwischenergebnisse richtig hin.';
        else if (ok1 && ok2 && !ok3) msg = 'Die Zwischenergebnisse stimmen. Rechne die Addition unten nochmal nach.';
        else if (!(ok1 && ok2 && ok3)) msg = 'Die rot markierten Zeilen stimmen noch nicht. Erst mit der ' + T + '0, dann mit der ' + E + '.';
        return { ok: ok1 && ok2 && ok3, rows: { r1: ok1, r2: ok2, res: ok3 }, msg: msg };
      },
      solution: { r1: alignRight(A, wide), r2: alignRight(B, narrow), res: alignRight(t.answer, wide), c: solC },
      hint: 'Erst mit der ' + T + '0: Schreib rechts eine 0 und rechne dann ' + T + ' mal ' + F(t.n) + '. Danach mit der ' + E + '. Überschlag: ' + overschlag(t),
      steps: steps
    };
  }

  /* =================== Halbschriftlich: Rechnen in Schritten =================== */
  function x(v) { return { t: 'x', v: String(v) }; }
  function s(id) { return { t: 's', id: id }; }
  function ref(id) { return { t: 'r', id: id }; }

  RG.buildSteps = function (t, stufe) {
    var spec;
    if (t.kind === 'add' || t.kind === 'sub') spec = stepsAddSub(t, stufe);
    else if (t.kind === 'mul') spec = stepsMul(t, stufe);
    else spec = stepsDiv(t, stufe);
    spec.title = RG.title(t);
    return spec;
  };

  function stepsAddSub(t, stufe) {
    var add = t.kind === 'add', a = add ? t.terms[0] : t.a, b = add ? t.terms[1] : t.b;
    var sym = add ? '+' : '−', parts = RG.placeParts(b), given = stufe === 1;
    var wR = Math.max(len(a), len(t.answer)), rows = [], slots = [], sol = {};
    var prev = a;
    parts.forEach(function (p, i) {
      rows.push([i === 0 ? x(F(a)) : ref('r' + (i - 1)), x(sym), s('p' + i), x('='), s('r' + i)]);
      slots.push({ id: 'p' + i, w: len(b), given: given ? p : null });
      slots.push({ id: 'r' + i, w: wR });
      prev = add ? prev + p : prev - p;
      sol['p' + i] = p; sol['r' + i] = prev;
    });
    rows.push([x(F(a) + ' ' + sym + ' ' + F(b) + ' ='), s('res')]);
    slots.push({ id: 'res', w: wR, final: true });
    sol.res = t.answer;
    var steps = parts.map(function (p, i) { return F(i ? sol['r' + (i - 1)] : a) + ' ' + sym + ' ' + F(p) + ' = ' + F(sol['r' + i]); });
    return {
      rows: rows, slots: slots, solution: sol, steps: steps,
      hint: given
        ? 'Rechne Schritt für Schritt: zuerst ' + F(a) + ' ' + sym + ' ' + F(parts[0]) + '. Das Ergebnis ist der Anfang der nächsten Zeile.'
        : 'Zerlege ' + F(b) + ' nach Stellenwerten in ' + parts.length + ' Teile und ' + (add ? 'addiere' : 'subtrahiere') + ' sie nacheinander.',
      check: function (read) {
        var bad = [], cur = a, sum = 0, msg = '';
        parts.forEach(function (_, i) {
          var p = read('p' + i), r = read('r' + i);
          if (p === null) bad.push('p' + i);
          var exp = add ? cur + (p || 0) : cur - (p || 0);
          if (r === null || r !== exp) bad.push('r' + i);
          cur = r === null ? exp : r;
          sum += p || 0;
        });
        if (!given && sum !== b) {
          parts.forEach(function (_, i) { if (bad.indexOf('p' + i) < 0) bad.push('p' + i); });
          msg = 'Deine Teile ergeben zusammen ' + F(sum) + ', nicht ' + F(b) + '.';
        }
        if (read('res') !== t.answer) bad.push('res');
        if (bad.length && !msg) msg = 'Die rot markierten Felder stimmen noch nicht. Prüfe jede Zeile einzeln.';
        return { ok: bad.length === 0, bad: bad, msg: msg };
      }
    };
  }

  function stepsMul(t, stufe) {
    var decN = t.dec !== 'f', parts = RG.placeParts(decN ? t.n : t.f), fixed = decN ? t.f : t.n;
    var whole = decN ? t.n : t.f, given = stufe === 1, rows = [], slots = [], sol = {};
    var wX = len(t.answer);
    parts.forEach(function (p, i) {
      rows.push(decN ? [s('p' + i), x('·'), x(F(fixed)), x('='), s('x' + i)] : [x(F(fixed)), x('·'), s('p' + i), x('='), s('x' + i)]);
      slots.push({ id: 'p' + i, w: len(whole), given: given ? p : null });
      slots.push({ id: 'x' + i, w: wX });
      sol['p' + i] = p; sol['x' + i] = p * fixed;
    });
    var sumRow = [];
    parts.forEach(function (_, i) { if (i) sumRow.push(x('+')); sumRow.push(ref('x' + i)); });
    sumRow.push(x('=')); sumRow.push(s('res'));
    rows.push(sumRow);
    slots.push({ id: 'res', w: wX, final: true });
    sol.res = t.answer;
    var steps = parts.map(function (p) { return (decN ? F(p) + ' · ' + F(fixed) : F(fixed) + ' · ' + F(p)) + ' = ' + F(p * fixed); })
      .concat([parts.map(function (p) { return F(p * fixed); }).join(' + ') + ' = ' + F(t.answer)]);
    return {
      rows: rows, slots: slots, solution: sol, steps: steps,
      hint: given
        ? 'Rechne jede Zeile mit dem Einmaleins: ' + steps[0] + '. Zum Schluss addierst du alles.'
        : 'Zerlege ' + F(whole) + ' in ' + parts.map(F).join(' + ') + '. Nimm jeden Teil mal ' + F(fixed) + ' und addiere am Ende.',
      check: function (read) {
        var bad = [], sum = 0, msg = '';
        parts.forEach(function (_, i) {
          var p = read('p' + i), v = read('x' + i);
          if (p === null) bad.push('p' + i);
          if (v === null || p === null || v !== p * fixed) bad.push('x' + i);
          sum += p || 0;
        });
        if (!given && sum !== whole) {
          parts.forEach(function (_, i) { if (bad.indexOf('p' + i) < 0) bad.push('p' + i); });
          msg = 'Deine Teile ergeben zusammen ' + F(sum) + ', nicht ' + F(whole) + '.';
        }
        if (read('res') !== t.answer) bad.push('res');
        if (bad.length && !msg) msg = 'Die rot markierten Felder stimmen noch nicht.';
        return { ok: bad.length === 0, bad: bad, msg: msg };
      }
    };
  }

  function stepsDiv(t, stufe) {
    var given = stufe === 1, qp = RG.placeParts(t.q);
    if (!given && qp.length > 3) qp = [qp[0], qp[1], qp.slice(2).reduce(function (a, b) { return a + b; }, 0)];
    var k = given ? qp.length : 3, rows = [], slots = [], sol = {};
    var wP = len(t.D), wQ = len(t.q);
    for (var i = 0; i < k; i++) {
      rows.push([s('p' + i), x(':'), x(F(t.d)), x('='), s('q' + i)]);
      slots.push({ id: 'p' + i, w: wP, given: given ? qp[i] * t.d : null });
      slots.push({ id: 'q' + i, w: wQ });
      if (i < qp.length) { sol['p' + i] = qp[i] * t.d; sol['q' + i] = qp[i]; }
    }
    if (given) {
      var sumRow = [];
      for (var j = 0; j < k; j++) { if (j) sumRow.push(x('+')); sumRow.push(ref('q' + j)); }
      sumRow.push(x('=')); sumRow.push(s('res'));
      rows.push(sumRow);
    } else {
      rows.push([x(F(t.D) + ' : ' + F(t.d) + ' ='), s('res')]);
    }
    slots.push({ id: 'res', w: wQ, final: true });
    sol.res = t.q;
    var steps = qp.map(function (q) { return F(q * t.d) + ' : ' + F(t.d) + ' = ' + F(q); })
      .concat([qp.map(F).join(' + ') + ' = ' + F(t.q)]);
    return {
      rows: rows, slots: slots, solution: sol, steps: steps,
      hint: given
        ? 'Teile jede Zeile einzeln: ' + steps[0] + '. Danach addierst du die Ergebnisse.'
        : 'Zerlege ' + F(t.D) + ' in Zahlen, die sich gut durch ' + F(t.d) + ' teilen lassen, zum Beispiel ' + F(qp[0] * t.d) + '.',
      check: function (read) {
        var bad = [], sum = 0, used = 0, msg = '';
        for (var i = 0; i < k; i++) {
          var p = read('p' + i), q = read('q' + i);
          if (!given && p === null && q === null) continue;
          used++;
          if (p === null || p % t.d !== 0) {
            bad.push('p' + i);
            if (p !== null && !msg) msg = F(p) + ' lässt sich nicht ohne Rest durch ' + F(t.d) + ' teilen.';
          }
          if (q === null || p === null || q * t.d !== p) bad.push('q' + i);
          sum += p || 0;
        }
        if (!given && used < 2) { msg = 'Zerlege ' + F(t.D) + ' in mindestens zwei Teile.'; bad.push('p0', 'p1'); }
        else if (!given && sum !== t.D) {
          for (var j = 0; j < k; j++) if (read('p' + j) !== null && bad.indexOf('p' + j) < 0) bad.push('p' + j);
          msg = 'Deine Teile ergeben zusammen ' + F(sum) + ', nicht ' + F(t.D) + '.';
        }
        if (read('res') !== t.q) bad.push('res');
        if (bad.length && !msg) msg = 'Die rot markierten Felder stimmen noch nicht.';
        return { ok: bad.length === 0, bad: bad, msg: msg };
      }
    };
  }

  /* =================== Schriftliche Division: Schritte berechnen =================== */
  RG.divSteps = function (D, d) {
    var ds = RG.digitsOf(D), i = 0, cur = ds[0], out = [];
    while (cur < d && i < ds.length - 1) { i++; cur = cur * 10 + ds[i]; }
    for (;;) {
      var q = Math.floor(cur / d), prod = q * d, rem = cur - prod;
      var step = { cur: cur, end: i, q: q, prod: prod, rem: rem };
      out.push(step);
      if (i < ds.length - 1) { i++; step.down = ds[i]; cur = rem * 10 + ds[i]; step.next = cur; }
      else break;
    }
    return out;
  };
})(window.RG);

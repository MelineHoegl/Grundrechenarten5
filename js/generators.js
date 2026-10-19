/* Rechen-Gipfel – Aufgaben erzeugen
   Pfad = Rechenart (add, sub, mul, div) + Verfahren (hs = halbschriftlich, sch = schriftlich)
          + Stufe (1, 2). Innerhalb einer Stufe gibt es 5 Level (Hütten), die schwerer werden. */
(function (RG) {
  var rnd = RG.rnd, pick = RG.pick, len = RG.len;

  function retry(make, ok) {
    var x;
    for (var i = 0; i < 500; i++) { x = make(); if (ok(x)) return x; }
    return x;
  }
  /* Anzahl der Überträge beim Addieren */
  function carries(nums) {
    var c = 0, cnt = 0, L = Math.max.apply(null, nums.map(len));
    for (var i = 0; i < L; i++) {
      var s = c;
      nums.forEach(function (n) { s += Math.floor(n / Math.pow(10, i)) % 10; });
      c = Math.floor(s / 10);
      if (c) cnt++;
    }
    return cnt;
  }
  /* Anzahl der Stellen, an denen entbündelt werden muss */
  function borrows(a, b) {
    var A = String(a).split('').reverse().map(Number);
    var B = String(b).split('').reverse().map(Number);
    var c = 0, cnt = 0;
    for (var i = 0; i < A.length; i++) {
      var x = A[i] - c, y = B[i] || 0;
      if (x < y) { cnt++; c = 1; } else c = 0;
    }
    return cnt;
  }
  function innerZero(n) { return String(n).slice(1).indexOf('0') >= 0; }
  RG.carries = carries;
  RG.borrows = borrows;

  /* ---------- Addition ---------- */
  function genAdd(mode, s, L) {
    if (mode === 'hs') {
      var R1 = [[21, 69, 11, 29], [25, 89, 13, 49], [120, 480, 21, 89], [150, 750, 110, 249], [250, 899, 120, 399]];
      var R2 = [[200, 600, 110, 299], [300, 800, 150, 499], [1200, 4500, 210, 899], [1500, 5000, 1100, 3999], [2500, 6999, 1200, 2999]];
      var r = (s === 1 ? R1 : R2)[L - 1];
      var t = retry(function () { return [rnd(r[0], r[1]), rnd(r[2], r[3])]; }, function (t) {
        if (RG.placeParts(t[1]).length < 2) return false;
        if (s === 1 && L === 1) return carries(t) === 0;
        if (s === 1 && L === 2) return carries(t) >= 1;
        return true;
      });
      return { kind: 'add', terms: t, answer: t[0] + t[1] };
    }
    var make;
    if (s === 1) {
      make = [
        function () { return retry(function () { return [rnd(100, 499), rnd(100, 499)]; }, function (t) { return carries(t) === 0; }); },
        function () { return retry(function () { return [rnd(100, 899), rnd(100, 899)]; }, function (t) { return carries(t) >= 1; }); },
        function () { return [rnd(1000, 8999), rnd(100, 999)]; },
        function () { return retry(function () { return [rnd(1000, 8999), rnd(1000, 8999)]; }, function (t) { return carries(t) >= 2; }); },
        function () { return [rnd(100, 999), rnd(1000, 4999), rnd(100, 999)]; }
      ][L - 1];
    } else {
      make = [
        function () { return [rnd(1000, 4999), rnd(100, 999), rnd(1000, 3999)]; },
        function () { return retry(function () { return [rnd(10000, 59999), rnd(1000, 9999)]; }, function (t) { return carries(t) >= 2; }); },
        function () { return [rnd(1000, 9999), rnd(1000, 9999), rnd(1000, 9999)]; },
        function () { return [rnd(10000, 49999), rnd(100, 999), rnd(1000, 9999), rnd(10, 99)]; },
        function () { return [rnd(10000, 99999), rnd(10000, 59999), rnd(1000, 9999), rnd(1000, 9999)]; }
      ][L - 1];
    }
    var terms = make();
    return { kind: 'add', terms: terms, answer: terms.reduce(function (x, y) { return x + y; }, 0) };
  }

  /* ---------- Subtraktion ---------- */
  function genSub(mode, s, L) {
    var p;
    if (mode === 'hs') {
      if (s === 1) {
        p = [
          function () { return retry(function () { return [rnd(40, 99), rnd(11, 39)]; }, function (t) { return t[0] > t[1] + 5 && borrows(t[0], t[1]) === 0; }); },
          function () { return retry(function () { return [rnd(41, 99), rnd(12, 39)]; }, function (t) { return t[0] > t[1] && borrows(t[0], t[1]) >= 1; }); },
          function () { return retry(function () { return [rnd(120, 599), rnd(21, 89)]; }, function (t) { return borrows(t[0], t[1]) >= 1; }); },
          function () { return [rnd(400, 899), rnd(120, 399)]; },
          function () { return retry(function () { return [rnd(500, 999), rnd(150, 499)]; }, function (t) { return innerZero(t[0]) && borrows(t[0], t[1]) >= 2; }); }
        ][L - 1];
      } else {
        p = [
          function () { return [rnd(1000, 4999), rnd(210, 899)]; },
          function () { return [rnd(2000, 8999), rnd(1100, 1999)]; },
          function () { return retry(function () { return [rnd(2, 9) * 1000 + pick([rnd(1, 9), rnd(1, 9) * 10, rnd(1, 9) * 100 + rnd(1, 9)]), rnd(1110, 1999)]; }, function (t) { return t[0] > t[1] && borrows(t[0], t[1]) >= 2; }); },
          function () { return [rnd(10000, 49999), rnd(1100, 9999)]; },
          function () { return [rnd(20000, 99999), rnd(10000, 19999)]; }
        ][L - 1];
      }
      var t = retry(p, function (t) { return t[0] > t[1] && RG.placeParts(t[1]).length >= 2; });
      return { kind: 'sub', a: t[0], b: t[1], answer: t[0] - t[1] };
    }
    if (s === 1) {
      p = [
        function () { return retry(function () { return [rnd(400, 999), rnd(100, 399)]; }, function (t) { return borrows(t[0], t[1]) === 0; }); },
        function () { return retry(function () { return [rnd(400, 999), rnd(100, 399)]; }, function (t) { return borrows(t[0], t[1]) === 1; }); },
        function () { return retry(function () { return [rnd(400, 999), rnd(100, 399)]; }, function (t) { return borrows(t[0], t[1]) === 2; }); },
        function () { return retry(function () { return [rnd(1000, 9999), rnd(100, 999)]; }, function (t) { return borrows(t[0], t[1]) >= 1; }); },
        function () { return retry(function () { return [rnd(2000, 9999), rnd(1000, 1999)]; }, function (t) { return innerZero(t[0]) && borrows(t[0], t[1]) >= 2; }); }
      ][L - 1];
    } else {
      p = [
        function () { return retry(function () { return [rnd(3000, 9999), rnd(1000, 2999)]; }, function (t) { return borrows(t[0], t[1]) >= 2; }); },
        function () { return retry(function () { return [rnd(10000, 99999), rnd(1000, 9999)]; }, function (t) { return borrows(t[0], t[1]) >= 2; }); },
        function () { return retry(function () { var a = rnd(2, 9) * 1000 + rnd(1, 9); return [a, rnd(1000, a - 1)]; }, function (t) { return borrows(t[0], t[1]) >= 2; }); },
        function () { return retry(function () { var a = rnd(2, 9) * 10000 + rnd(0, 9) * 100 + rnd(1, 9); return [a, rnd(10000, a - 1)]; }, function (t) { return borrows(t[0], t[1]) >= 2; }); },
        function () { return retry(function () { var a = rnd(3, 9) * 10000 + rnd(1, 8); return [a, rnd(10000, a - 1)]; }, function (t) { return borrows(t[0], t[1]) >= 3; }); }
      ][L - 1];
    }
    var u = retry(p, function (t) { return t[0] > t[1]; });
    return { kind: 'sub', a: u[0], b: u[1], answer: u[0] - u[1] };
  }

  /* ---------- Multiplikation ---------- */
  function genMul(mode, s, L) {
    var n, f, dec = 'n';
    function noCarry() {
      f = 2;
      var a = rnd(1, 4), b = rnd(1, 4);
      return a * 10 + b;
    }
    if (mode === 'hs') {
      if (s === 1) {
        if (L === 1) { n = noCarry(); }
        else if (L === 2) { n = rnd(23, 98); f = rnd(3, 9); }
        else if (L === 3) { n = rnd(102, 329); f = rnd(2, 4); }
        else if (L === 4) { n = rnd(120, 699); f = rnd(4, 9); }
        else { n = rnd(300, 999); f = rnd(6, 9); }
      } else {
        if (L === 1) { n = rnd(1001, 2999); f = rnd(2, 5); }
        else if (L === 2) { n = rnd(1200, 4999); f = rnd(6, 9); }
        else if (L === 3) { n = rnd(21, 69); f = rnd(11, 19); dec = 'f'; }
        else if (L === 4) { n = rnd(21, 89); f = rnd(21, 49); dec = 'f'; }
        else { n = rnd(102, 299); f = rnd(21, 89); dec = 'f'; }
      }
      if (dec === 'n' && RG.placeParts(n).length < 2) n += 11;
      if (dec === 'f' && f % 10 === 0) f += 1;
      return { kind: 'mul', n: n, f: f, dec: dec, answer: n * f };
    }
    if (s === 1) {
      if (L === 1) { n = noCarry(); }
      else if (L === 2) { n = rnd(102, 499); f = rnd(2, 5); }
      else if (L === 3) { n = rnd(120, 989); f = rnd(6, 9); }
      else if (L === 4) { n = rnd(1023, 4999); f = rnd(3, 9); }
      else { n = rnd(2000, 9989); f = rnd(6, 9); }
    } else {
      if (L === 1) { n = rnd(12, 48); f = rnd(11, 19); }
      else if (L === 2) { n = rnd(102, 399); f = rnd(12, 29); }
      else if (L === 3) { n = rnd(112, 899); f = Math.random() < 0.3 ? rnd(2, 9) * 10 : rnd(21, 99); }
      else if (L === 4) { n = rnd(1012, 3999); f = rnd(21, 99); }
      else { n = rnd(2000, 9899); f = rnd(41, 99); }
    }
    return { kind: 'mul', n: n, f: f, answer: n * f };
  }

  /* ---------- Division ---------- */
  function genDiv(mode, s, L) {
    var d, q, r = 0;
    if (mode === 'hs') {
      if (s === 1) {
        if (L === 1) { d = rnd(2, 4); q = rnd(11, 23); }
        else if (L === 2) { d = rnd(3, 6); q = rnd(12, 19); }
        else if (L === 3) { d = rnd(2, 4); q = rnd(101, 233); }
        else if (L === 4) { d = rnd(4, 9); q = rnd(21, 99); }
        else { d = rnd(6, 9); q = rnd(102, 169); }
      } else {
        if (L === 1) { d = rnd(3, 5); q = rnd(102, 299); }
        else if (L === 2) { d = rnd(6, 9); q = rnd(112, 399); }
        else if (L === 3) { d = rnd(2, 9); q = rnd(1001, 1499); }
        else if (L === 4) { d = rnd(11, 15); q = rnd(12, 49); }
        else { d = rnd(12, 25); q = rnd(21, 79); }
      }
      if (RG.placeParts(q).length < 2) q += 1;
      return { kind: 'div', D: d * q, d: d, q: q, r: 0, answer: q };
    }
    if (s === 1) {
      if (L === 1) { d = rnd(2, 3); q = rnd(101, 333); }
      else if (L === 2) { d = rnd(4, 6); q = rnd(102, 199); }
      else if (L === 3) { d = rnd(6, 9); q = rnd(21, 99); }
      else if (L === 4) { d = rnd(3, 9); q = retry(function () { return rnd(201, 1999); }, function (x) { return x * d >= 1000; }); }
      else { d = rnd(3, 9); q = pick([rnd(1, 9) * 100 + rnd(1, 9), rnd(1, 4) * 1000 + rnd(1, 9) * 100 + rnd(1, 9)]); }
    } else {
      if (L === 1) { d = rnd(4, 9); q = rnd(1, 2) * 1000 + rnd(0, 9) * 10 + rnd(1, 9); }
      else if (L === 2) { d = rnd(3, 9); q = rnd(201, 999); r = rnd(1, d - 1); }
      else if (L === 3) { d = rnd(4, 9); q = rnd(2000, 9999); r = Math.random() < 0.5 ? rnd(1, d - 1) : 0; }
      else if (L === 4) { d = rnd(12, 19); q = rnd(21, 89); r = rnd(0, d - 1); }
      else { d = rnd(12, 25); q = rnd(101, 399); r = rnd(0, d - 1); }
    }
    return { kind: 'div', D: d * q + r, d: d, q: q, r: r, answer: q };
  }

  RG.generate = function (op, mode, s, L) {
    L = Math.max(1, Math.min(5, L));
    if (op === 'add') return genAdd(mode, s, L);
    if (op === 'sub') return genSub(mode, s, L);
    if (op === 'mul') return genMul(mode, s, L);
    return genDiv(mode, s, L);
  };

  /* ---------- Sachaufgaben (Alltag in Bayern, 5. Klasse) ---------- */
  var F = RG.fmt;
  var SACH = {
    add: [
      { ok: function (t) { return t.terms[0] < 10000; }, text: function (t) { return 'Beim Schulfest verkauft die Klasse 5a am Vormittag ' + F(t.terms[0]) + ' Lose und am Nachmittag ' + F(t.terms[1]) + ' Lose. Wie viele Lose verkauft sie insgesamt?'; }, ans: function (t) { return 'Die Klasse 5a verkauft insgesamt ' + F(t.answer) + ' Lose.'; } },
      { ok: function (t) { return t.terms[0] < 1000 && t.terms[1] < 1000; }, text: function (t) { return 'Familie Huber fährt in den Urlaub nach Südtirol und weiter ans Meer. Am ersten Tag fährt sie ' + F(t.terms[0]) + ' km, am zweiten Tag ' + F(t.terms[1]) + ' km. Wie viele Kilometer sind das zusammen?'; }, ans: function (t) { return 'Familie Huber fährt zusammen ' + F(t.answer) + ' km.'; } },
      { ok: function () { return true; }, text: function (t) { return 'Im Freibad waren am Samstag ' + F(t.terms[0]) + ' Gäste und am Sonntag ' + F(t.terms[1]) + ' Gäste. Wie viele Gäste waren es am ganzen Wochenende?'; }, ans: function (t) { return 'Am Wochenende waren ' + F(t.answer) + ' Gäste im Freibad.'; } },
      { ok: function () { return true; }, text: function (t) { return 'Auf dem Volksfest werden am Freitag ' + F(t.terms[0]) + ' Brezen verkauft und am Samstag ' + F(t.terms[1]) + ' Brezen. Wie viele Brezen sind das zusammen?'; }, ans: function (t) { return 'Zusammen werden ' + F(t.answer) + ' Brezen verkauft.'; } }
    ],
    addMany: [
      { ok: function () { return true; }, text: function (t) { var days = ['Montag', 'Dienstag', 'Mittwoch', 'Donnerstag']; return 'Der Tierpark zählt seine Besucher: ' + t.terms.map(function (x, i) { return days[i] + ' ' + F(x); }).join(', ') + '. Wie viele Besucher waren es insgesamt?'; }, ans: function (t) { return 'Insgesamt waren ' + F(t.answer) + ' Besucher im Tierpark.'; } },
      { ok: function () { return true; }, text: function (t) { return 'Eine Brauerei füllt in einer Woche Flaschen ab. Die Zähler zeigen: ' + t.terms.map(F).join(' Flaschen, ') + ' Flaschen. Wie viele Flaschen sind das zusammen?'; }, ans: function (t) { return 'Zusammen sind es ' + F(t.answer) + ' Flaschen.'; } }
    ],
    sub: [
      { ok: function () { return true; }, text: function (t) { return 'Ein Fußballstadion hat ' + F(t.a) + ' Plätze. ' + F(t.b) + ' Karten sind schon verkauft. Wie viele Plätze sind noch frei?'; }, ans: function (t) { return 'Es sind noch ' + F(t.answer) + ' Plätze frei.'; } },
      { ok: function (t) { return t.a <= 5000; }, text: function (t) { return 'Lena spart für ein neues Fahrrad. Es kostet ' + F(t.a) + ' €. Sie hat schon ' + F(t.b) + ' € gespart. Wie viel Geld fehlt ihr noch?'; }, ans: function (t) { return 'Lena fehlen noch ' + F(t.answer) + ' €.'; } },
      { ok: function () { return true; }, text: function (t) { return 'Eine Bäckerei backt am Morgen ' + F(t.a) + ' Semmeln. Bis zum Abend verkauft sie ' + F(t.b) + ' Semmeln. Wie viele Semmeln bleiben übrig?'; }, ans: function (t) { return 'Es bleiben ' + F(t.answer) + ' Semmeln übrig.'; } },
      { ok: function (t) { return t.a <= 20000; }, text: function (t) { return 'Die Stadtbücherei hat ' + F(t.a) + ' Bücher. ' + F(t.b) + ' Bücher sind gerade ausgeliehen. Wie viele Bücher stehen im Regal?'; }, ans: function (t) { return 'Im Regal stehen ' + F(t.answer) + ' Bücher.'; } }
    ],
    mul: [
      { ok: function (t) { return t.f <= 31; }, text: function (t) { return 'Eine Bäckerei backt jeden Tag ' + F(t.n) + ' Brezen. Wie viele Brezen sind das in ' + t.f + ' Tagen?'; }, ans: function (t) { return 'In ' + t.f + ' Tagen sind das ' + F(t.answer) + ' Brezen.'; } },
      { ok: function () { return true; }, text: function (t) { return 'Im Stadion gibt es ' + t.f + ' Blöcke mit je ' + F(t.n) + ' Sitzplätzen. Wie viele Sitzplätze sind das insgesamt?'; }, ans: function (t) { return 'Das Stadion hat ' + F(t.answer) + ' Sitzplätze.'; } },
      { ok: function (t) { return t.n <= 900 && t.f <= 31; }, text: function (t) { return 'Ein Lastwagen fährt jeden Tag ' + F(t.n) + ' km. Wie viele Kilometer fährt er in ' + t.f + ' Tagen?'; }, ans: function (t) { return 'Er fährt ' + F(t.answer) + ' km.'; } },
      { ok: function (t) { return t.f <= 24; }, text: function (t) { return 'Ein Getränkemarkt bekommt ' + F(t.n) + ' Kästen Apfelschorle. In jedem Kasten sind ' + t.f + ' Flaschen. Wie viele Flaschen sind das?'; }, ans: function (t) { return 'Das sind ' + F(t.answer) + ' Flaschen.'; } },
      { ok: function (t) { return t.n <= 60; }, text: function (t) { return 'Eine Karte für den Freizeitpark kostet ' + t.n + ' €. Die Schule kauft ' + t.f + ' Karten. Wie viel muss sie bezahlen?'; }, ans: function (t) { return 'Die Schule bezahlt ' + F(t.answer) + ' €.'; } }
    ],
    div: [
      { ok: function (t) { return t.D <= 3000; }, text: function (t) { return F(t.D) + ' Kinder kommen zum Sportfest. Sie werden in Mannschaften zu je ' + t.d + ' Kindern eingeteilt. Wie viele Mannschaften gibt es' + (t.r ? ' und wie viele Kinder bleiben übrig?' : '?'); }, ans: function (t) { return 'Es gibt ' + F(t.q) + ' Mannschaften' + (t.r ? '. ' + t.r + (t.r === 1 ? ' Kind bleibt' : ' Kinder bleiben') + ' übrig.' : '.'); } },
      { ok: function (t) { return t.r === 0; }, text: function (t) { return 'Ein Bauer verteilt ' + F(t.D) + ' kg Äpfel gleichmäßig auf ' + t.d + ' Kisten. Wie viele Kilogramm kommen in jede Kiste?'; }, ans: function (t) { return 'In jede Kiste kommen ' + F(t.q) + ' kg Äpfel.'; } },
      { ok: function (t) { return t.r === 0; }, text: function (t) { return 'Beim Flohmarkt nimmt die Klasse 5b ' + F(t.D) + ' € ein. Das Geld wird gerecht auf ' + t.d + ' Projekte verteilt. Wie viel Euro bekommt jedes Projekt?'; }, ans: function (t) { return 'Jedes Projekt bekommt ' + F(t.q) + ' €.'; } },
      { ok: function () { return true; }, text: function (t) { return 'Ein Hühnerhof verpackt ' + F(t.D) + ' Eier in Schachteln zu je ' + t.d + ' Stück. Wie viele Schachteln werden voll' + (t.r ? ' und wie viele Eier bleiben übrig?' : '?'); }, ans: function (t) { return F(t.q) + ' Schachteln werden voll' + (t.r ? '. ' + t.r + (t.r === 1 ? ' Ei bleibt' : ' Eier bleiben') + ' übrig.' : '.'); } }
    ]
  };

  function calcLabel(t, op) {
    var A, B;
    if (t.kind === 'add') { A = t.terms[0]; B = t.terms[1]; }
    else if (t.kind === 'sub') { A = t.a; B = t.b; }
    else if (t.kind === 'mul') { A = t.n; B = t.f; }
    else { A = t.D; B = t.d; }
    var sym = { add: ' + ', sub: ' − ', mul: ' · ', div: ' : ' }[op];
    if (t.kind === 'add' && t.terms.length > 2 && op === 'add') return t.terms.map(F).join(' + ');
    return F(A) + sym + F(B);
  }

  /* Sachaufgabe zu einer erzeugten Aufgabe. Liefert Text, Antwortsatz und drei Rechnungen zur Auswahl. */
  RG.makeSach = function (task) {
    var list = task.kind === 'add' && task.terms.length > 2 ? SACH.addMany : SACH[task.kind];
    var fits = list.filter(function (s) { return s.ok(task); });
    var tpl = pick(fits.length ? fits : list);
    var wrongOps = ['add', 'sub', 'mul', 'div'].filter(function (o) { return o !== task.kind; });
    var options;
    if (task.kind === 'add' && task.terms.length > 2) {
      options = [
        { label: calcLabel(task, 'add'), correct: true },
        { label: F(task.terms[0]) + ' + ' + F(task.terms[1]), correct: false },
        { label: task.terms.map(F).join(' − '), correct: false }
      ];
    } else {
      options = [{ label: calcLabel(task, task.kind), correct: true }];
      RG.shuffle(wrongOps).slice(0, 2).forEach(function (o) { options.push({ label: calcLabel(task, o), correct: false }); });
    }
    return { text: tpl.text(task), answer: tpl.ans(task), options: RG.shuffle(options) };
  };
})(window.RG);

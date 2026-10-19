/* Rechen-Gipfel – Ablauf: Rechenart → Verfahren → Stufe → Runden mit 5 Aufgaben */
(function (RG) {
  var el = RG.el, F = RG.fmt;
  var $ = function (id) { return document.getElementById(id); };

  var OPS = {
    add: { name: 'Plus-Alm', verb: 'Addieren', sym: '+' },
    sub: { name: 'Minus-Spitz', verb: 'Subtrahieren', sym: '−' },
    mul: { name: 'Mal-Horn', verb: 'Multiplizieren', sym: '·' },
    div: { name: 'Teil-Kogel', verb: 'Dividieren', sym: ':' }
  };
  var MODES = {
    hs: { name: 'Halbschriftlich', desc: 'Rechnen in Schritten: Du zerlegst eine Zahl und rechnest Zeile für Zeile.' },
    sch: { name: 'Schriftlich', desc: 'Untereinander in Rechenkästchen, Stelle für Stelle von rechts nach links.' }
  };
  var EXAMPLES = {
    'add-hs': '347 + 285\n= 347 + 200 + 80 + 5', 'add-sch': '  254\n+ 583\n─────\n  837',
    'sub-hs': '734 − 258\n= 734 − 200 − 50 − 8', 'sub-sch': '  5 2 7\n    |\n− 3 6 3\n───────\n  1 6 4',
    'mul-hs': '236 · 7\n= 200·7 + 30·7 + 6·7', 'mul-sch': '123 · 32\n──────────\n  3690\n+  246\n──────────\n  3936',
    'div-hs': '856 : 4\n= 800 : 4 + 56 : 4', 'div-sch': '635 : 5 = 127\n−5\n 13\n−10\n  35 …'
  };
  var STUFE = {
    'add-hs-1': 'Zahlen bis 1 000. Die Zerlegung ist vorgegeben.',
    'add-hs-2': 'Zahlen bis 10 000. Du zerlegst selbst.',
    'add-sch-1': 'Zwei Zahlen untereinander, mit Merkzahlen.',
    'add-sch-2': 'Drei oder vier Zahlen und große Zahlen bis 100 000.',
    'sub-hs-1': 'Zahlen bis 1 000. Die Zerlegung ist vorgegeben.',
    'sub-hs-2': 'Zahlen bis 100 000. Du zerlegst selbst.',
    'sub-sch-1': 'Bayerisches Verfahren: abziehen und entbündeln.',
    'sub-sch-2': 'Große Zahlen und Nullen: über mehrere Stellen entbündeln.',
    'mul-hs-1': 'Einstelliger Faktor. Die Zerlegung ist vorgegeben.',
    'mul-hs-2': 'Größere Zahlen und zweistellige Faktoren. Du zerlegst selbst.',
    'mul-sch-1': 'Einstelliger Faktor.',
    'mul-sch-2': 'Zweistelliger Faktor mit Zwischenergebnissen.',
    'div-hs-1': 'Die Zerlegung ist vorgegeben.',
    'div-hs-2': 'Du zerlegst selbst, auch durch zweistellige Zahlen.',
    'div-sch-1': 'Schritt für Schritt mit allen Hilfen.',
    'div-sch-2': 'Weniger Hilfen, mit Rest und großen Zahlen.'
  };
  var SIGNAL = {
    add: 'Achte auf Wörter wie „insgesamt“ oder „zusammen“.',
    sub: 'Achte auf Wörter wie „übrig“, „fehlt noch“ oder „noch frei“.',
    mul: 'Achte auf Wörter wie „je“, „jeden Tag“ oder „in jedem“.',
    div: 'Achte auf Wörter wie „verteilt“, „gerecht“ oder „zu je“.'
  };
  var PRAISE = ['Klasse!', 'Super gerechnet!', 'Stark!', 'Richtig!', 'Bärig!', 'Spitze!', 'Genau so!'];

  /* ---------- Speicher ---------- */
  var save = RG.store.load() || { points: 0, paths: {} };
  if (!save.paths) save.paths = {};
  function path(id) {
    if (!save.paths[id]) save.paths[id] = { level: 1, stars: [0, 0, 0, 0, 0], done: false };
    return save.paths[id];
  }
  function persist() { RG.store.save(save); }

  /* ---------- Grafik ---------- */
  function mascot(mood) {
    var mouth = mood === 'happy' ? '<path d="M50 88 Q60 97 70 88" fill="none" stroke="#3a2a1e" stroke-width="3" stroke-linecap="round"/>'
      : mood === 'wow' ? '<ellipse cx="60" cy="90" rx="6" ry="7" fill="#3a2a1e"/>'
      : '<path d="M52 90 L68 89" stroke="#3a2a1e" stroke-width="3" stroke-linecap="round"/>';
    return '<svg viewBox="0 0 120 120" role="img" aria-label="Gamsi, die Gämse">' +
      '<path d="M44 40 C38 20 42 8 52 7 C58 7 59 13 54 15 C49 17 49 27 52 40Z" fill="#2c211a"/>' +
      '<path d="M76 40 C82 20 78 8 68 7 C62 7 61 13 66 15 C71 17 71 27 68 40Z" fill="#2c211a"/>' +
      '<ellipse cx="30" cy="48" rx="13" ry="7" transform="rotate(-25 30 48)" fill="#b8804c"/>' +
      '<ellipse cx="90" cy="48" rx="13" ry="7" transform="rotate(25 90 48)" fill="#b8804c"/>' +
      '<path d="M60 34 C82 34 92 52 90 72 C88 92 76 106 60 106 C44 106 32 92 30 72 C28 52 38 34 60 34Z" fill="#f2e3c9"/>' +
      '<path d="M38 48 C42 60 46 74 54 84 L50 86 C40 76 34 62 33 52Z" fill="#4a3526"/>' +
      '<path d="M82 48 C78 60 74 74 66 84 L70 86 C80 76 86 62 87 52Z" fill="#4a3526"/>' +
      '<circle cx="47" cy="62" r="5" fill="#1d1510"/><circle cx="73" cy="62" r="5" fill="#1d1510"/>' +
      '<circle cx="48.5" cy="60.5" r="1.6" fill="#fff"/><circle cx="74.5" cy="60.5" r="1.6" fill="#fff"/>' +
      '<ellipse cx="60" cy="80" rx="7" ry="4.5" fill="#3a2a1e"/>' + mouth + '</svg>';
  }
  function setMascot(id, mood, hop) {
    var m = $(id); if (!m) return;
    m.innerHTML = mascot(mood);
    if (hop) { m.classList.remove('hop'); void m.offsetWidth; m.classList.add('hop'); }
  }
  function mountain(op) {
    var symbol = op === 'mul' ? '<circle cx="36" cy="34" r="7" fill="var(--accent)"/>'
      : op === 'div' ? '<circle cx="36" cy="24" r="6" fill="var(--accent)"/><circle cx="36" cy="44" r="6" fill="var(--accent)"/>'
      : '<text x="36" y="45" text-anchor="middle" font-family="Baloo 2, sans-serif" font-weight="800" font-size="34" fill="var(--accent)">' + OPS[op].sym + '</text>';
    return '<svg viewBox="0 0 240 120" aria-hidden="true">' +
      '<polygon points="0,120 70,46 104,74 150,18 240,120" fill="var(--accent)"/>' +
      '<polygon points="150,18 168,40 158,36 148,46 138,36 132,40" fill="var(--snow)"/>' +
      '<polygon points="70,46 82,59 74,56 66,62 60,56" fill="var(--snow)"/>' +
      '<line x1="150" y1="18" x2="150" y2="2" stroke="var(--fg)" stroke-width="2"/><polygon points="150,2 164,6 150,10" fill="var(--sun)"/>' +
      '<circle cx="36" cy="34" r="24" fill="var(--card)"/>' + symbol + '</svg>';
  }
  function star(on, size) {
    size = size || 16;
    return '<svg viewBox="0 0 24 24" width="' + size + '" height="' + size + '" aria-hidden="true"><path d="M12 2.5l2.9 6.2 6.6.7-5 4.5 1.4 6.6L12 17.2l-5.9 3.3 1.4-6.6-5-4.5 6.6-.7z" fill="' + (on ? 'var(--sun)' : 'none') + '" stroke="' + (on ? 'var(--sun)' : 'var(--line)') + '" stroke-width="1.6" stroke-linejoin="round"/></svg>';
  }
  function trail(id) {
    var p = path(id), box = el('div', { class: 'trail' });
    for (var i = 0; i < 5; i++) {
      var reached = p.done || p.level > i + 1, current = !p.done && p.level === i + 1;
      var fill = reached ? 'var(--accent)' : current ? 'var(--sun)' : 'var(--card)';
      var hut = el('div', { class: 'hut' });
      hut.innerHTML = '<svg viewBox="0 0 40 34" aria-hidden="true"><path d="M4 16 L20 3 L36 16" fill="none" stroke="var(--fg)" stroke-width="2.5" stroke-linejoin="round"/><rect x="8" y="15" width="24" height="16" rx="2" fill="' + fill + '" stroke="var(--fg)" stroke-width="2"/><rect x="17" y="21" width="6" height="10" fill="var(--card)" stroke="var(--fg)" stroke-width="1.5"/></svg>' +
        '<span>' + star(p.stars[i] >= 1, 11) + star(p.stars[i] >= 2, 11) + star(p.stars[i] >= 3, 11) + '</span><span>Hütte ' + (i + 1) + '</span>';
      box.appendChild(hut);
    }
    return box;
  }

  /* ---------- Bildschirme ---------- */
  var G = { op: null, mode: null, stufe: null };
  function show(name) {
    ['home', 'mode', 'stufe', 'play', 'done'].forEach(function (s) { $('screen-' + s).hidden = s !== name; });
    document.querySelector('.app').setAttribute('data-op', G.op || 'add');
    window.scrollTo(0, 0);
  }

  function renderHome() {
    G.op = null;
    setMascot('home-mascot', 'happy');
    $('home-points').textContent = F(save.points) + ' Punkte';
    var grid = $('op-grid');
    grid.replaceChildren();
    Object.keys(OPS).forEach(function (op) {
      var huts = 0;
      ['hs', 'sch'].forEach(function (m) { [1, 2].forEach(function (s) { var p = path(op + '-' + m + '-' + s); huts += p.done ? 5 : p.level - 1; }); });
      var card = el('button', { type: 'button', class: 'op-card', 'data-op': op, onclick: function () { G.op = op; renderMode(); } }, [
        el('div', { html: mountain(op) }),
        el('span', { class: 'op-name', text: OPS[op].verb }),
        el('span', { class: 'op-sub', text: OPS[op].name }),
        el('span', { class: 'op-progress', text: huts + ' von 20 Hütten geschafft' })
      ]);
      grid.appendChild(card);
    });
    show('home');
  }

  function renderMode() {
    $('mode-crumb').textContent = OPS[G.op].verb;
    var grid = $('mode-grid');
    grid.replaceChildren();
    ['hs', 'sch'].forEach(function (m) {
      grid.appendChild(el('button', { type: 'button', class: 'choice', onclick: function () { G.mode = m; renderStufe(); } }, [
        el('h3', { text: MODES[m].name }),
        el('p', { text: MODES[m].desc }),
        el('div', { class: 'example' }, [el('pre', { text: EXAMPLES[G.op + '-' + m] })])
      ]));
    });
    show('mode');
  }

  function renderStufe() {
    $('stufe-crumb').textContent = OPS[G.op].verb + ' · ' + MODES[G.mode].name;
    var grid = $('stufe-grid');
    grid.replaceChildren();
    [1, 2].forEach(function (s) {
      var id = G.op + '-' + G.mode + '-' + s, p = path(id);
      grid.appendChild(el('button', { type: 'button', class: 'choice', onclick: function () { G.stufe = s; startRound(); } }, [
        el('h3', { text: 'Stufe ' + s }),
        el('p', { text: STUFE[id] }),
        trail(id),
        el('span', { class: 'trail-note', text: p.done ? 'Gipfel erreicht! Du kannst weiter üben.' : 'Weiter bei Hütte ' + p.level })
      ]));
    });
    show('stufe');
  }

  /* ---------- Runde ---------- */
  function pathId() { return G.op + '-' + G.mode + '-' + G.stufe; }
  function startRound() {
    var p = path(pathId());
    G.level = p.done ? 5 : p.level;
    G.tasks = []; G.results = []; G.idx = 0; G.streak = 0; G.roundPoints = 0;
    for (var i = 0; i < 5; i++) {
      var lvl = i === 4 ? Math.min(5, G.level + 1) : G.level;
      var t = RG.generate(G.op, G.mode, G.stufe, lvl);
      t.bonus = i === 4;
      if ((i === 3 && (G.level >= 2 || G.stufe === 2)) || (i === 1 && G.level >= 4)) t.sach = RG.makeSach(t);
      G.tasks.push(t);
    }
    $('play-path').textContent = OPS[G.op].verb + ' · ' + MODES[G.mode].name + ' · Stufe ' + G.stufe;
    $('play-level').textContent = 'Hütte ' + G.level + ' von 5';
    show('play');
    showTask();
  }

  function dots() {
    var box = $('play-dots');
    box.replaceChildren();
    G.tasks.forEach(function (t, i) {
      var cls = 'dot' + (G.results[i] === 'ok' ? ' ok' : G.results[i] === 'meh' ? ' meh' : i === G.idx ? ' now' : '') + (t.bonus ? ' bonus' : '');
      box.appendChild(el('span', { class: cls, title: t.bonus ? 'Gipfelaufgabe' : 'Aufgabe ' + (i + 1) }));
    });
    $('play-points').textContent = F(save.points) + ' Punkte';
  }

  function bubble(kind, text, list) {
    var b = $('bubble');
    b.className = 'bubble' + (kind ? ' ' + kind : '');
    b.replaceChildren(el('span', { text: text }));
    if (list && list.length) b.appendChild(el('ol', null, list.map(function (s) { return el('li', { text: s }); })));
  }

  function showTask() {
    var t = G.tasks[G.idx];
    G.task = t; G.tries = 0; G.hintUsed = false; G.phase = t.sach ? 'sach' : 'work'; G.widget = null;
    $('play-kicker').textContent = (t.bonus ? 'Gipfelaufgabe · doppelte Punkte' : 'Aufgabe ' + (G.idx + 1) + ' von 5') + (t.sach ? ' · Sachaufgabe' : '');
    $('answer-box').hidden = true;
    $('work').replaceChildren();
    $('check-btn').textContent = 'Prüfen';
    $('hint-btn').disabled = false;
    setMascot('play-mascot', 'think');
    dots();
    var sb = $('sach-box');
    if (t.sach) {
      $('play-title').textContent = 'Lies genau.';
      sb.hidden = false;
      var opts = el('div', { class: 'opt-row' });
      t.sach.options.forEach(function (o) {
        var b = el('button', { type: 'button', class: 'opt', text: o.label, onclick: function () { chooseCalc(o, b, opts); } });
        opts.appendChild(b);
      });
      sb.replaceChildren(el('p', { text: t.sach.text }), el('p', { class: 'q', text: 'Welche Rechnung passt?' }), opts);
      bubble('', 'Lies die Sachaufgabe und tippe auf die passende Rechnung.');
    } else {
      sb.hidden = true;
      buildWork();
    }
    renderPad();
  }

  function chooseCalc(o, b, opts) {
    if (G.phase !== 'sach') return;
    if (!o.correct) {
      b.classList.remove('wrong'); void b.offsetWidth; b.classList.add('wrong');
      G.hintUsed = true;
      bubble('oops', 'Das passt nicht. ' + SIGNAL[G.op]);
      return;
    }
    b.classList.add('right');
    Array.prototype.forEach.call(opts.children, function (x) { x.disabled = true; });
    G.phase = 'work';
    buildWork();
  }

  function buildWork() {
    var t = G.task;
    $('play-title').textContent = RG.title(t) + ' = ?';
    if (G.mode === 'hs') G.widget = new RG.StepsWidget(RG.buildSteps(t, G.stufe));
    else if (t.kind === 'div') G.widget = new RG.DivWidget(t, G.stufe);
    else G.widget = new RG.GridWidget(RG.buildGrid(t, G.stufe));
    $('work').replaceChildren(G.widget.el);
    bubble('', (t.sach ? 'Richtig gewählt! ' : '') + G.widget.intro);
  }

  function renderPad() {
    var pad = $('pad');
    pad.replaceChildren();
    var keys = ['7', '8', '9', 'back', '4', '5', '6', 'left', '1', '2', '3', 'right', '0', 'up', 'down'];
    var label = { back: '⌫', left: '◀', right: '▶', up: '▲', down: '▼' };
    var aria = { back: 'Löschen', left: 'Nach links', right: 'Nach rechts', up: 'Nach oben', down: 'Nach unten' };
    keys.forEach(function (k) {
      var isDigit = /\d/.test(k);
      pad.appendChild(el('button', {
        type: 'button', class: 'key' + (k === '0' ? ' wide' : '') + (isDigit ? '' : ' fn'), text: label[k] || k,
        'aria-label': aria[k] || k, onclick: function () { press(k); }
      }));
    });
  }

  function press(k) {
    if (!G.widget || G.phase !== 'work') {
      if (G.phase === 'sach') bubble('tip', 'Wähle zuerst oben die passende Rechnung.');
      return;
    }
    if (/^\d$/.test(k)) G.widget.type(k);
    else if (k === 'back') G.widget.back();
    else G.widget.move(k);
  }

  function onCheck() {
    if (G.phase === 'solved') { next(); return; }
    if (G.phase === 'sach') { bubble('tip', 'Wähle zuerst die passende Rechnung.'); return; }
    var w = G.widget;
    if (w.guided) {
      var r = w.submit();
      if (r.state === 'empty') { bubble('tip', r.msg); return; }
      if (r.state === 'retry') { bubble('oops', r.msg); setMascot('play-mascot', 'think'); return; }
      if (r.state === 'next') { bubble(r.wrong ? 'oops' : 'good', r.msg); setMascot('play-mascot', r.wrong ? 'think' : 'happy'); return; }
      solved(r.ok && !G.hintUsed ? 'first' : (r.ok ? 'first' : 'second'), r.msg);
      return;
    }
    var res = w.check();
    if (res.ok) { solved(G.tries === 0 ? 'first' : 'second'); return; }
    G.tries++;
    if (G.tries >= 2) {
      w.reveal();
      solved('shown');
      return;
    }
    setMascot('play-mascot', 'think');
    bubble('oops', res.msg + ' Du hast noch einen Versuch. Brauchst du einen Tipp?');
  }

  function solved(how, extraMsg) {
    var t = G.task;
    G.phase = 'solved';
    if (G.widget.lock) G.widget.lock();
    var pts = how === 'first' ? (G.hintUsed ? 6 : 10) : how === 'second' ? 5 : 0;
    if (t.bonus) pts *= 2;
    G.streak = how === 'first' ? G.streak + 1 : 0;
    if (how === 'first' && G.streak >= 3) pts += 2;
    G.results[G.idx] = how === 'first' ? 'ok' : 'meh';
    save.points += pts; G.roundPoints += pts;
    var p = path(pathId()); p.played = (p.played || 0) + 1;
    persist();
    if (how === 'shown') {
      setMascot('play-mascot', 'think');
      bubble('tip', 'Schau dir die Lösung in Rot an. So geht es:', G.widget.steps ? (typeof G.widget.steps === 'function' ? G.widget.steps() : []) : []);
    } else if (how === 'first') {
      setMascot('play-mascot', 'happy', true);
      bubble('good', (extraMsg && G.widget.guided ? '' : '') + RG.pick(PRAISE) + ' +' + pts + ' Punkte' + (G.streak >= 3 ? ' · Serie: ' + G.streak + ' richtig hintereinander' : '') + '.');
      confetti();
    } else {
      setMascot('play-mascot', 'happy', true);
      bubble('good', 'Geschafft! +' + pts + ' Punkte. Beim nächsten Mal klappt es auf Anhieb.');
    }
    if (t.sach) {
      var ab = $('answer-box');
      ab.hidden = false;
      ab.replaceChildren(el('b', { text: 'Antwort: ' }), document.createTextNode(t.sach.answer));
    }
    $('check-btn').textContent = G.idx < 4 ? 'Nächste Aufgabe' : 'Runde beenden';
    $('hint-btn').disabled = true;
    dots();
  }

  function next() {
    G.idx++;
    if (G.idx >= 5) endRound(); else showTask();
  }

  function onHint() {
    if (G.phase === 'sach') { bubble('tip', SIGNAL[G.op]); G.hintUsed = true; return; }
    if (G.phase !== 'work' || !G.widget) return;
    G.hintUsed = true;
    bubble('tip', 'Tipp: ' + G.widget.hint());
  }

  function endRound() {
    var p = path(pathId());
    var good = G.results.filter(function (r) { return r === 'ok'; }).length;
    var stars = good >= 5 ? 3 : good >= 4 ? 2 : good >= 2 ? 1 : 0;
    var lvl = G.level, title, text;
    p.stars[lvl - 1] = Math.max(p.stars[lvl - 1] || 0, stars);
    if (good >= 4) {
      if (!p.done && p.level < 5) { p.level++; title = 'Neue Hütte erreicht!'; text = good + ' von 5 Aufgaben auf Anhieb richtig. Ab jetzt geht es auf Hütte ' + p.level + ' weiter, dort werden die Zahlen größer.'; }
      else if (!p.done) { p.done = true; title = 'Gipfel erreicht!'; text = 'Du hast alle 5 Hütten geschafft. Du kannst hier weiter üben und Punkte sammeln.'; }
      else { title = 'Gipfelrunde geschafft!'; text = good + ' von 5 Aufgaben auf Anhieb richtig.'; }
      confetti();
    } else {
      title = good >= 2 ? 'Gut gekämpft!' : 'Weiter üben!';
      text = good + ' von 5 Aufgaben auf Anhieb richtig. Ab 4 richtigen geht es zur nächsten Hütte. Probier es gleich noch einmal!';
    }
    persist();
    $('done-title').textContent = title;
    $('done-text').textContent = text + ' In dieser Runde: +' + G.roundPoints + ' Punkte.';
    $('done-stars').innerHTML = star(stars >= 1, 56) + star(stars >= 2, 56) + star(stars >= 3, 56);
    $('done-trail').replaceChildren(trail(pathId()));
    setMascot('done-mascot', good >= 4 ? 'wow' : 'happy', true);
    show('done');
  }

  /* ---------- Konfetti ---------- */
  var reduce = window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  function confetti() {
    if (reduce) return;
    var cv = $('confetti'), ctx = cv.getContext && cv.getContext('2d');
    if (!ctx) return;
    cv.width = window.innerWidth; cv.height = window.innerHeight;
    var css = getComputedStyle(document.documentElement);
    var colors = ['--add', '--sub', '--mul', '--div', '--sun'].map(function (v) { return css.getPropertyValue(v).trim() || '#f2ad00'; });
    var parts = [];
    for (var i = 0; i < 90; i++) parts.push({ x: cv.width / 2 + (Math.random() - .5) * 200, y: cv.height * .35, vx: (Math.random() - .5) * 12, vy: -Math.random() * 12 - 4, s: 5 + Math.random() * 6, c: colors[i % colors.length], r: Math.random() * 6 });
    var start = performance.now();
    (function frame(now) {
      var dt = now - start;
      ctx.clearRect(0, 0, cv.width, cv.height);
      parts.forEach(function (p) { p.vy += .4; p.x += p.vx; p.y += p.vy; p.r += .2; ctx.save(); ctx.translate(p.x, p.y); ctx.rotate(p.r); ctx.fillStyle = p.c; ctx.fillRect(-p.s / 2, -p.s / 4, p.s, p.s / 2); ctx.restore(); });
      if (dt < 1400) requestAnimationFrame(frame); else ctx.clearRect(0, 0, cv.width, cv.height);
    })(start);
  }

  /* ---------- Ereignisse ---------- */
  document.querySelectorAll('.back-btn[data-go]').forEach(function (b) {
    b.addEventListener('click', function () { if (b.getAttribute('data-go') === 'home') renderHome(); else renderMode(); });
  });
  $('play-back').addEventListener('click', renderStufe);
  $('check-btn').addEventListener('click', onCheck);
  $('hint-btn').addEventListener('click', onHint);
  $('again-btn').addEventListener('click', startRound);
  $('to-stufe-btn').addEventListener('click', renderStufe);
  $('to-home-btn').addEventListener('click', renderHome);
  $('reset-btn').addEventListener('click', function () { $('reset-confirm').hidden = false; });
  $('reset-no').addEventListener('click', function () { $('reset-confirm').hidden = true; });
  $('reset-yes').addEventListener('click', function () {
    save = { points: 0, paths: {} }; RG.store.clear(); $('reset-confirm').hidden = true; renderHome();
  });

  document.addEventListener('keydown', function (e) {
    if ($('screen-play').hidden || e.altKey || e.ctrlKey || e.metaKey) return;
    var k = e.key, map = { ArrowLeft: 'left', ArrowRight: 'right', ArrowUp: 'up', ArrowDown: 'down', Backspace: 'back', Delete: 'back' };
    if (k === 'Enter') {
      if (e.target && e.target.tagName === 'BUTTON' && e.target.id !== 'check-btn' && G.phase !== 'work') return;
      e.preventDefault();
      if (G.phase === 'work' && G.widget && G.widget.nextEmpty && G.widget.nextEmpty()) return;
      onCheck();
      return;
    }
    if (/^\d$/.test(k)) { e.preventDefault(); press(k); return; }
    if (map[k]) { e.preventDefault(); press(map[k]); }
  });

  renderHome();
})(window.RG);

/* Rechen-Gipfel – die drei Übungsformen auf dem Bildschirm
   GridWidget  : schriftlich in Rechenkästchen (Addition, Subtraktion, Multiplikation)
   StepsWidget : halbschriftlich, Rechnen in Schritten
   DivWidget   : schriftliche Division Schritt für Schritt */
(function (RG) {
  var el = RG.el, F = RG.fmt;

  /* =================== Rechenkästchen =================== */
  function GridWidget(spec) {
    var self = this;
    this.spec = spec; this.vals = {}; this.state = {}; this.shown = {}; this.locked = false;
    spec.rows.forEach(function (r) { if (r.key) self.vals[r.key] = {}; });
    var first = spec.rows.filter(function (r) { return r.type === 'input'; })[0];
    this.sel = { key: first.key, col: first.cols[first.cols.length - 1] };
    this.supportsMark = spec.rows.some(function (r) { return r.mode === 'mark'; });
    this.el = el('div', { class: 'grid-wrap' });
    this.render();
  }
  GridWidget.prototype.row = function (key) { return this.spec.rows.filter(function (r) { return r.key === key; })[0]; };
  GridWidget.prototype.editableRows = function () { return this.spec.rows.filter(function (r) { return r.key; }); };
  GridWidget.prototype.render = function () {
    var self = this, C = this.spec.C;
    var g = el('div', { class: 'grid', style: '--cols:' + (C + 1), role: 'group', 'aria-label': 'Rechenkästchen' });
    this.spec.rows.forEach(function (r, ri) {
      for (var c = 0; c <= C; c++) {
        var cls = ['cell'], node;
        if (c === 0) cls.push('first');
        if (ri === 0) cls.push('top');
        if (r.ruleTop) cls.push('rule');
        if (r.small) cls.push('small');
        if (c === 0 && r.sign) {
          cls.push('sign');
          node = el('div', { class: cls.join(' '), text: r.sign });
        } else if (r.type === 'static') {
          node = el('div', { class: cls.join(' '), text: r.cells[c] || '' });
        } else if (r.cols.indexOf(c) >= 0) {
          cls.push('in');
          if (r.mode === 'mark') cls.push('mark');
          if (!self.locked && self.sel && self.sel.key === r.key && self.sel.col === c) cls.push('sel');
          if (self.state[r.key]) cls.push(self.state[r.key]);
          if (self.shown[r.key] && self.shown[r.key][c]) cls.push('shown');
          var v = self.vals[r.key][c] || '';
          node = el('button', {
            type: 'button', class: cls.join(' '), text: v,
            'aria-label': r.label + ', Kästchen ' + c + (v ? ': ' + v : ', leer'),
            onclick: (function (k, cc) { return function () { self.select(k, cc); }; })(r.key, c)
          });
        } else {
          node = el('div', { class: cls.join(' ') });
        }
        g.appendChild(node);
      }
    });
    var notes = [];
    if (this.spec.rows.some(function (r) { return r.key === 'c'; })) notes.push('Kleine Kästchen: Platz für Merkzahlen (freiwillig).');
    if (this.supportsMark) notes.push('Strich-Zeile: Tippe unter die Stelle, die du entbündelst.');
    this.el.replaceChildren(g, notes.length ? el('p', { class: 'grid-legend', text: notes.join(' ') }) : '');
  };
  GridWidget.prototype.select = function (key, col) {
    if (this.locked) return;
    this.sel = { key: key, col: col };
    if (this.row(key).mode === 'mark') this.toggle();
    else this.render();
  };
  GridWidget.prototype.toggle = function () {
    var v = this.vals[this.sel.key];
    v[this.sel.col] = v[this.sel.col] ? '' : '|';
    this.render();
  };
  GridWidget.prototype.type = function (d) {
    if (this.locked || !this.sel) return;
    var r = this.row(this.sel.key);
    if (r.mode === 'mark') { this.toggle(); return; }
    this.vals[r.key][this.sel.col] = String(d);
    this.state[r.key] = null;
    var i = r.cols.indexOf(this.sel.col);
    if (i > 0) this.sel = { key: r.key, col: r.cols[i - 1] };
    this.render();
  };
  GridWidget.prototype.back = function () {
    if (this.locked || !this.sel) return;
    var r = this.row(this.sel.key), v = this.vals[r.key];
    if (v[this.sel.col]) { v[this.sel.col] = ''; }
    else {
      var i = r.cols.indexOf(this.sel.col);
      if (i < r.cols.length - 1) { this.sel = { key: r.key, col: r.cols[i + 1] }; v[this.sel.col] = ''; }
    }
    this.state[r.key] = null;
    this.render();
  };
  GridWidget.prototype.move = function (dir) {
    if (this.locked || !this.sel) return;
    var r = this.row(this.sel.key), i = r.cols.indexOf(this.sel.col);
    if (dir === 'left' && i > 0) this.sel.col = r.cols[i - 1];
    else if (dir === 'right' && i < r.cols.length - 1) this.sel.col = r.cols[i + 1];
    else if (dir === 'up' || dir === 'down') {
      var rows = this.editableRows(), k = rows.indexOf(r) + (dir === 'up' ? -1 : 1);
      if (k >= 0 && k < rows.length) {
        var nr = rows[k], col = this.sel.col;
        if (nr.cols.indexOf(col) < 0) col = col < nr.cols[0] ? nr.cols[0] : nr.cols[nr.cols.length - 1];
        this.sel = { key: nr.key, col: col };
      }
    }
    this.render();
  };
  GridWidget.prototype.read = function (key) {
    var r = this.row(key), v = this.vals[key];
    var chars = r.cols.map(function (c) { return v[c] || ''; });
    if (chars.every(function (c) { return c === ''; })) return null;
    return Number(chars.map(function (c) { return c === '' ? '0' : c; }).join(''));
  };
  GridWidget.prototype.check = function () {
    var self = this, res = this.spec.check(function (k) { return self.read(k); });
    Object.keys(res.rows).forEach(function (k) { self.state[k] = res.rows[k] ? 'ok' : 'bad'; });
    this.render();
    return res;
  };
  GridWidget.prototype.reveal = function () {
    var self = this, sol = this.spec.solution;
    Object.keys(sol).forEach(function (k) {
      if (!self.vals[k]) return;
      self.shown[k] = {};
      var row = self.row(k);
      row.cols.forEach(function (c) {
        var want = sol[k][c] || '';
        if ((self.vals[k][c] || '') !== want) { self.vals[k][c] = want; if (want) self.shown[k][c] = true; }
      });
      self.state[k] = row.type === 'input' ? null : self.state[k];
    });
    this.locked = true;
    this.render();
  };
  GridWidget.prototype.lock = function () { this.locked = true; this.render(); };
  GridWidget.prototype.hint = function () { return this.spec.hint; };
  GridWidget.prototype.steps = function () { return this.spec.steps; };
  GridWidget.prototype.intro = 'Tippe ein Kästchen an und gib die Ziffern ein. Du rechnest von rechts nach links, darum springt der Rahmen nach links.';

  /* =================== Rechnen in Schritten =================== */
  function StepsWidget(spec) {
    var self = this;
    this.spec = spec; this.vals = {}; this.state = {}; this.shown = {}; this.locked = false;
    this.slots = {}; spec.slots.forEach(function (s) { self.slots[s.id] = s; });
    this.order = spec.slots.filter(function (s) { return s.given === null || s.given === undefined; }).map(function (s) { return s.id; });
    this.sel = this.order[0];
    this.el = el('div', { class: 'steps' });
    this.render();
  }
  StepsWidget.prototype.render = function () {
    var self = this;
    var rows = this.spec.rows.map(function (row) {
      var isFinal = row.some(function (t) { return t.t === 's' && self.slots[t.id].final; });
      return el('div', { class: 'hs-row' + (isFinal ? ' final' : '') }, row.map(function (t) {
        if (t.t === 'x') return el('span', { text: t.v });
        if (t.t === 'r') return el('span', { class: 'ref', text: self.vals[t.id] ? F(Number(self.vals[t.id])) : '…' });
        var sl = self.slots[t.id];
        if (sl.given !== null && sl.given !== undefined) return el('span', { class: 'slot given', style: '--w:' + sl.w, text: F(sl.given) });
        var cls = ['slot'];
        if (!self.locked && self.sel === t.id) cls.push('sel');
        if (self.state[t.id]) cls.push(self.state[t.id]);
        if (self.shown[t.id]) cls.push('shown');
        var v = self.vals[t.id];
        return el('button', {
          type: 'button', class: cls.join(' '), style: '--w:' + sl.w, text: v ? F(Number(v)) : '',
          'aria-label': 'Eingabefeld' + (v ? ': ' + v : ', leer'),
          onclick: function () { if (!self.locked) { self.sel = t.id; self.render(); } }
        });
      }));
    });
    this.el.replaceChildren.apply(this.el, rows);
  };
  StepsWidget.prototype.type = function (d) {
    if (this.locked || !this.sel) return;
    var cur = this.vals[this.sel] || '';
    if (cur.length >= 7) return;
    this.vals[this.sel] = cur === '0' ? String(d) : cur + d;
    this.state[this.sel] = null;
    this.render();
  };
  StepsWidget.prototype.back = function () {
    if (this.locked || !this.sel) return;
    var cur = this.vals[this.sel] || '';
    if (cur) this.vals[this.sel] = cur.slice(0, -1);
    else this.move('left');
    this.state[this.sel] = null;
    this.render();
  };
  StepsWidget.prototype.move = function (dir) {
    if (this.locked) return;
    var i = this.order.indexOf(this.sel);
    if ((dir === 'left' || dir === 'up') && i > 0) this.sel = this.order[i - 1];
    if ((dir === 'right' || dir === 'down') && i < this.order.length - 1) this.sel = this.order[i + 1];
    this.render();
  };
  /* Enter: zum nächsten leeren Feld springen; wenn alles ausgefüllt ist, prüfen */
  StepsWidget.prototype.nextEmpty = function () {
    var self = this, i = this.order.indexOf(this.sel);
    var rest = this.order.slice(i + 1).concat(this.order.slice(0, i + 1));
    var nxt = rest.filter(function (id) { return !self.vals[id]; })[0];
    if (nxt && this.vals[this.sel]) { this.sel = nxt; this.render(); return true; }
    return false;
  };
  StepsWidget.prototype.read = function (id) {
    var s = this.slots[id];
    if (s && s.given !== null && s.given !== undefined) return s.given;
    return this.vals[id] ? Number(this.vals[id]) : null;
  };
  StepsWidget.prototype.check = function () {
    var self = this, res = this.spec.check(function (id) { return self.read(id); });
    this.order.forEach(function (id) {
      if (res.bad.indexOf(id) >= 0) self.state[id] = 'bad';
      else if (self.vals[id]) self.state[id] = 'ok';
      else self.state[id] = null;
    });
    this.render();
    return res;
  };
  StepsWidget.prototype.reveal = function () {
    var self = this, sol = this.spec.solution;
    this.order.forEach(function (id) {
      if (sol[id] === undefined) { self.vals[id] = ''; self.state[id] = null; return; }
      if (Number(self.vals[id]) !== sol[id] || !self.vals[id]) { self.vals[id] = String(sol[id]); self.shown[id] = true; }
      self.state[id] = null;
    });
    this.locked = true;
    this.render();
  };
  StepsWidget.prototype.lock = function () { this.locked = true; this.render(); };
  StepsWidget.prototype.hint = function () { return this.spec.hint; };
  StepsWidget.prototype.steps = function () { return this.spec.steps; };
  StepsWidget.prototype.intro = 'Tippe ein Feld an und gib die Zahl ein. Mit ▶ oder der Eingabetaste kommst du ins nächste Feld.';

  /* =================== Division Schritt für Schritt =================== */
  function DivWidget(task, stufe) {
    this.t = task; this.stufe = stufe; this.guided = true;
    this.steps = RG.divSteps(task.D, task.d);
    var self = this;
    this.prompts = [];
    this.steps.forEach(function (s, k) {
      self.prompts.push({ k: k, type: 'q' });
      if (s.q > 0) {
        if (stufe === 1) self.prompts.push({ k: k, type: 'prod' });
        self.prompts.push({ k: k, type: 'rem' });
      }
    });
    this.shown = this.steps.map(function () { return {}; });
    this.red = this.steps.map(function () { return {}; });
    this.pi = 0; this.typed = ''; this.mistakes = 0; this.miss = 0; this.done = false;
    this.el = el('div', { class: 'div-wrap' });
    this.render();
  }
  DivWidget.prototype.cur = function () { return this.prompts[this.pi]; };
  DivWidget.prototype.expected = function (p) { var s = this.steps[p.k]; return p.type === 'q' ? s.q : (p.type === 'prod' ? s.prod : s.rem); };
  DivWidget.prototype.question = function (p) {
    var s = this.steps[p.k], d = this.t.d;
    if (p.type === 'q') return 'Wie oft passt ' + F(d) + ' in ' + F(s.cur) + '?';
    if (p.type === 'prod') return s.q + ' · ' + F(d) + ' =';
    return this.stufe === 1 ? F(s.cur) + ' − ' + F(s.prod) + ' =' : 'Wie viel bleibt übrig?';
  };
  DivWidget.prototype.render = function () {
    var t = this.t, N = RG.len(t.D), qs = String(t.q), ds = String(t.d), self = this;
    var Dcols = N, extra = 1 + ds.length + 1 + qs.length + (t.r ? 1 + String(t.r).length : 0);
    var C = Dcols + extra; /* Spalte 0 für Minuszeichen */
    var rows = [];
    function blank() { var a = []; for (var i = 0; i <= C; i++) a.push({ v: '', c: [] }); return a; }
    /* Kopfzeile */
    var top = blank(), Ds = String(t.D);
    for (var i = 0; i < N; i++) top[i + 1].v = Ds[i];
    var c = N + 1;
    top[c++].v = ':';
    for (i = 0; i < ds.length; i++) top[c++].v = ds[i];
    top[c++].v = '=';
    var qStart = c;
    this.steps.forEach(function (s, k) {
      if (self.shown[k].q) { top[qStart + k].v = String(s.q); if (self.red[k].q) top[qStart + k].c.push('shown'); }
    });
    if (this.done && t.r) {
      c = qStart + qs.length;
      top[c++].v = 'R';
      String(t.r).split('').forEach(function (ch) { top[c].v = ch; top[c].c.push('down'); c++; });
    }
    rows.push(top);
    var p = this.cur();
    /* curRow[k] = Zeile, in der die Zahl von Schritt k steht */
    var curRow = { 0: top };
    function put(row, txt, endc, red, down) {
      var st = endc - txt.length + 1;
      for (var m = 0; m < txt.length; m++) {
        row[st + m].v = txt[m];
        if (red) row[st + m].c.push('shown');
        if (down && m === txt.length - 1) row[st + m].c.push('down');
      }
    }
    /* Rechenschritte darunter */
    this.steps.forEach(function (s, k) {
      if (self.shown[k].prod && s.q > 0) {
        var r = blank(), ps = String(s.prod), start = s.end + 1 - ps.length + 1;
        for (var j = 0; j < ps.length; j++) {
          r[start + j].v = ps[j]; r[start + j].c.push('ul');
          if (self.red[k].prod) r[start + j].c.push('shown');
        }
        r[start - 1].v = '−';
        rows.push(r);
      }
      if (!self.shown[k].rem) return;
      if (s.q === 0) {
        /* „0 an“: nichts abziehen, die nächste Ziffer kommt in dieselbe Zeile */
        var same = curRow[k];
        if (s.down !== undefined && same && same !== top) {
          put(same, String(s.down), s.end + 2, false, true);
          curRow[k + 1] = same;
        } else if (s.down !== undefined) {
          var r0 = blank(); put(r0, String(s.next), s.end + 2, false, true); rows.push(r0); curRow[k + 1] = r0;
        }
        return;
      }
      var r2 = blank();
      if (s.down !== undefined) put(r2, String(s.next), s.end + 2, self.red[k].rem, true);
      else put(r2, String(s.rem), s.end + 1, self.red[k].rem, false);
      rows.push(r2);
      curRow[k + 1] = r2;
    });
    /* aktuelle Zahl gelb markieren */
    if (p) {
      var hs = this.steps[p.k], row = curRow[p.k];
      if (row) {
        var from = p.k === 0 ? 1 : hs.end + 1 - String(hs.cur).length + 1;
        for (i = from; i <= hs.end + 1; i++) if (row[i]) row[i].c.push('hl');
      }
    }
    var g = el('div', { class: 'grid', style: '--cols:' + (C + 1), role: 'group', 'aria-label': 'Schriftliche Division' });
    rows.forEach(function (r, ri) {
      r.forEach(function (cell, ci) {
        var cls = ['cell'].concat(cell.c);
        if (ci === 0) cls.push('first');
        if (ri === 0) cls.push('top');
        g.appendChild(el('div', { class: cls.join(' '), text: cell.v }));
      });
    });
    var prompt;
    if (this.done) {
      prompt = el('div', { class: 'div-prompt div-done' }, [el('span', { text: 'Fertig: ' + F(t.D) + ' : ' + F(t.d) + ' = ' + RG.resultText(t) })]);
    } else {
      prompt = el('div', { class: 'div-prompt' }, [
        el('span', { text: this.question(p) }),
        el('span', { class: 'slot sel', style: '--w:3', text: this.typed, 'aria-label': 'Deine Antwort' + (this.typed ? ': ' + this.typed : ', leer') })
      ]);
    }
    this.el.replaceChildren(g, prompt);
  };
  DivWidget.prototype.type = function (d) { if (!this.done && this.typed.length < 6) { this.typed = this.typed === '0' ? String(d) : this.typed + d; this.render(); } };
  DivWidget.prototype.back = function () { if (!this.done) { this.typed = this.typed.slice(0, -1); this.render(); } };
  DivWidget.prototype.move = function () {};
  DivWidget.prototype.markDone = function (p, red) {
    var s = this.steps[p.k];
    this.shown[p.k][p.type] = true;
    if (red) this.red[p.k][p.type] = true;
    if (p.type === 'q') {
      if (s.q === 0) { this.shown[p.k].rem = true; }
      else if (this.stufe === 2) { this.shown[p.k].prod = true; }
    }
  };
  DivWidget.prototype.afterMsg = function (p) {
    var s = this.steps[p.k];
    if ((p.type === 'rem' || (p.type === 'q' && s.q === 0)) && s.down !== undefined) {
      return (s.q === 0 ? F(this.t.d) + ' passt nicht in ' + F(s.cur) + ', also 0 an. ' : '') + 'Die ' + s.down + ' kommt nach unten. Jetzt rechnest du mit ' + F(s.next) + '.';
    }
    return '';
  };
  DivWidget.prototype.submit = function () {
    if (this.done) return { state: 'done', ok: this.mistakes === 0 };
    if (this.typed === '') return { state: 'empty', msg: 'Tippe zuerst eine Zahl ein.' };
    var p = this.cur(), exp = this.expected(p), val = Number(this.typed), s = this.steps[p.k], d = this.t.d;
    this.typed = '';
    var msg, wrong = false;
    if (val === exp) {
      this.miss = 0;
      this.markDone(p, false);
      msg = RG.pick(['Richtig!', 'Stimmt!', 'Genau!', 'Super!']) + ' ' + this.afterMsg(p);
    } else {
      this.mistakes++; this.miss++;
      if (this.miss < 2) {
        var h;
        if (p.type === 'q') h = F(d) + ' · ' + val + ' = ' + F(d * val) + '. ' + (d * val > s.cur ? 'Das ist mehr als ' + F(s.cur) + '. Nimm weniger.' : 'Da passt noch mehr hinein.');
        else if (p.type === 'prod') h = 'Rechne mit dem Einmaleins: ' + s.q + ' mal ' + F(d) + '.';
        else h = 'Ziehe ab: ' + F(s.cur) + ' − ' + F(s.prod) + '.';
        this.render();
        return { state: 'retry', msg: 'Noch nicht. ' + h };
      }
      this.miss = 0; wrong = true;
      this.markDone(p, true);
      msg = 'Richtig ist ' + F(exp) + ' (rot eingetragen). ' + this.afterMsg(p);
    }
    this.pi++;
    if (this.pi >= this.prompts.length) {
      this.done = true;
      this.render();
      return { state: 'done', ok: this.mistakes === 0, wrong: wrong, msg: msg };
    }
    this.render();
    return { state: 'next', wrong: wrong, msg: msg };
  };
  DivWidget.prototype.hint = function () {
    var p = this.cur(); if (!p) return '';
    var s = this.steps[p.k], d = this.t.d;
    if (p.type === 'q') return 'Sag die ' + F(d) + 'er-Reihe auf: ' + [1, 2, 3, 4].map(function (k) { return F(k * d); }).join(', ') + ', … Welche Zahl ist am nächsten an ' + F(s.cur) + ', aber nicht größer?';
    if (p.type === 'prod') return 'Einmaleins: ' + s.q + ' mal ' + F(d) + '.';
    return 'Ziehe ab: ' + F(s.cur) + ' − ' + F(s.prod) + '.';
  };
  DivWidget.prototype.lock = function () { this.done = true; this.render(); };
  DivWidget.prototype.intro = 'Beantworte die Fragen Schritt für Schritt. Das Rechenkästchen-Bild wächst dabei mit.';

  RG.GridWidget = GridWidget;
  RG.StepsWidget = StepsWidget;
  RG.DivWidget = DivWidget;
})(window.RG);

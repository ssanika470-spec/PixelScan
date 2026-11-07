/* ==========================================================================
   PixelScan – dashboard.js (Week 5)
   Loads data/scans.json with fetch(), merges files analysed on this device
   (localStorage), then renders: summary cards, a bar chart (plain HTML/CSS –
   no chart library, so no extra download) and a filterable, sortable table.
   Accessibility: aria-sort on headers, live region for result counts,
   status messages for loading/errors, real <table> markup.
   ========================================================================== */
(function () {
  'use strict';
  var $ = function (id) { return document.getElementById(id); };
  var rows = [], sortKey = 'date', sortDir = -1;

  function esc(s) { return String(s).replace(/[&<>"]/g, function (c) { return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]; }); }

  function load() {
    fetch('data/scans.json')
      .then(function (r) { if (!r.ok) throw new Error('HTTP ' + r.status); return r.json(); })
      .then(ready)
      .catch(function () {
        // fetch() is blocked when opening index files via file:// in some browsers -> use a tiny built-in sample
        ready(null);
      });
  }

  function ready(data) {
    var fallback = !data;
    rows = data || [{ id: 1, name: 'sample.jpg', type: 'Image', sizeKB: 120, date: '2026-10-01', status: 'Clear' }];
    try { rows = rows.concat(JSON.parse(localStorage.getItem('pixelscan.history') || '[]')); } catch (x) { /* ignore */ }
    $('status').textContent = fallback
      ? 'Could not load data/scans.json (open the site through a local server, e.g. "python -m http.server"). Showing a small sample instead.'
      : 'Loaded ' + rows.length + ' inspections.';
    if (fallback) $('status').className = 'error';
    renderStats(); sortRows(); render();
  }

  function renderStats() {
    var c = function (s) { return rows.filter(function (r) { return r.status === s; }).length; };
    var total = rows.reduce(function (a, r) { return a + r.sizeKB; }, 0);
    $('stats').innerHTML = [['Files', rows.length], ['Clear', c('Clear')], ['Needs review', c('Review') + c('Mismatch')], ['Total size (MB)', (total / 1024).toFixed(1)]]
      .map(function (s) { return '<li><strong>' + s[1] + '</strong>' + s[0] + '</li>'; }).join('');
    var types = {}; rows.forEach(function (r) { types[r.type] = (types[r.type] || 0) + 1; });
    var max = Math.max.apply(null, Object.keys(types).map(function (k) { return types[k]; }));
    $('chart').innerHTML = Object.keys(types).map(function (k) {
      return '<div class="bar-row"><span>' + esc(k) + '</span><span class="bar" style="width:' + (types[k] / max * 100) + '%"></span><span>' + types[k] + '</span></div>';
    }).join('');
    $('chart').setAttribute('aria-label', 'Bar chart of files by type: ' + Object.keys(types).map(function (k) { return k + ' ' + types[k]; }).join(', '));
  }

  function filtered() {
    var q = $('f-q').value.trim().toLowerCase(), t = $('f-type').value, s = $('f-status').value;
    return rows.filter(function (r) {
      return (!q || r.name.toLowerCase().indexOf(q) > -1) && (!t || r.type === t) && (!s || r.status === s);
    });
  }
  function sortRows() {
    rows.sort(function (a, b) {
      var x = a[sortKey], y = b[sortKey];
      return (typeof x === 'number' ? x - y : String(x).localeCompare(String(y))) * sortDir;
    });
  }
  function render() {
    var list = filtered();
    $('table').querySelector('tbody').innerHTML = list.length ? list.map(function (r) {
      var cls = r.status === 'Clear' ? 'ok' : r.status === 'Review' ? 'warn' : 'bad';
      return '<tr><th scope="row">' + esc(r.name) + '</th><td>' + esc(r.type) + '</td><td>' + r.sizeKB.toLocaleString() + '</td><td>' + esc(r.date) + '</td><td><span class="badge ' + cls + '">' + esc(r.status) + '</span></td></tr>';
    }).join('') : '<tr><td colspan="5">No inspections match these filters.</td></tr>';
    $('count').textContent = 'Showing ' + list.length + ' of ' + rows.length + ' inspections.';
    document.querySelectorAll('#table thead th').forEach(function (th) {
      th.setAttribute('aria-sort', th.dataset.key === sortKey ? (sortDir === 1 ? 'ascending' : 'descending') : 'none');
    });
  }

  document.querySelectorAll('#table thead th button').forEach(function (b) {
    b.addEventListener('click', function () {
      var key = b.parentNode.dataset.key;
      sortDir = key === sortKey ? -sortDir : 1; sortKey = key; sortRows(); render();
    });
  });
  ['f-q', 'f-type', 'f-status'].forEach(function (id) { $(id).addEventListener('input', render); });
  load();
})();

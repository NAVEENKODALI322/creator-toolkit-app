/* Creator Toolkit app. Plain JavaScript, no build step. */
(function () {
  'use strict';

  var VERSION = '1.0.0';
  var SITE = 'https://www.creatortoolkits.in';
  var CONTACT = 'naveenkodali322@gmail.com';
  var HISTORY_LIMIT = 50;
  var FAVORITE_LIMIT = 200;
  var STORAGE_KEY = 'ctk.app.v1';

  /* ---------------------------------------------------------------- storage */

  function emptyState() {
    return { history: [], favorites: [], checklist: {}, prefs: {} };
  }

  var memoryCopy = null; // used when localStorage is blocked

  function loadState() {
    var base = emptyState();
    try {
      var raw = window.localStorage.getItem(STORAGE_KEY);
      if (!raw) return base;
      var data = JSON.parse(raw);
      if (data && typeof data === 'object') {
        if (Array.isArray(data.history)) base.history = data.history;
        if (Array.isArray(data.favorites)) base.favorites = data.favorites;
        if (data.checklist && typeof data.checklist === 'object') base.checklist = data.checklist;
        if (data.prefs && typeof data.prefs === 'object') base.prefs = data.prefs;
      }
    } catch (e) {
      if (memoryCopy) return memoryCopy;
    }
    return base;
  }

  var state = loadState();

  function saveState() {
    memoryCopy = state;
    try {
      window.localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
    } catch (e) {
      /* storage blocked or full: the app keeps working for this session */
    }
  }

  /* ---------------------------------------------------------------- helpers */

  function h(tag, props) {
    var el = document.createElement(tag);
    if (props) {
      Object.keys(props).forEach(function (key) {
        var value = props[key];
        if (value === null || value === undefined || value === false) return;
        if (key === 'class') el.className = value;
        else if (key === 'text') el.textContent = value;
        else if (key.indexOf('on') === 0) el.addEventListener(key.slice(2), value);
        else el.setAttribute(key, value === true ? '' : value);
      });
    }
    for (var i = 2; i < arguments.length; i++) append(el, arguments[i]);
    return el;
  }

  function append(el, child) {
    if (child === null || child === undefined || child === false) return;
    if (Array.isArray(child)) {
      child.forEach(function (c) { append(el, c); });
    } else if (child.nodeType) {
      el.appendChild(child);
    } else {
      el.appendChild(document.createTextNode(String(child)));
    }
  }

  var ICONS = {
    title: '<path d="M4 7V4h16v3M9 20h6M12 4v16"/>',
    hooks: '<path d="M13 2L4 14h7l-1 8 9-12h-7z"/>',
    tags: '<path d="M20.6 13.4l-7.2 7.2a2 2 0 0 1-2.8 0L3 13V3h10l7.6 7.6a2 2 0 0 1 0 2.8z"/><circle cx="7.5" cy="7.5" r="1.2"/>',
    hashtags: '<path d="M5 9h15M4 15h15M10 3L8 21M16 3l-2 18"/>',
    description: '<path d="M6 3h9l4 4v14H6zM14 3v5h5M9 13h7M9 17h7"/>',
    checklist: '<path d="M9 6h11M9 12h11M9 18h11M3.5 6l1.5 1.5L7.5 5M3.5 12l1.5 1.5L7.5 11M3.5 18l1.5 1.5L7.5 17"/>',
    copy: '<rect x="9" y="9" width="11" height="11" rx="2"/><path d="M5 15V6a2 2 0 0 1 2-2h9"/>',
    star: '<path d="M12 3l2.7 5.6 6.1.9-4.4 4.3 1 6.1L12 17l-5.4 2.9 1-6.1L3.2 9.5l6.1-.9z"/>',
    share: '<circle cx="18" cy="5" r="2.5"/><circle cx="6" cy="12" r="2.5"/><circle cx="18" cy="19" r="2.5"/><path d="M8.2 10.8l7.6-4.4M8.2 13.2l7.6 4.4"/>',
    back: '<path d="M15 5l-7 7 7 7"/>',
    trash: '<path d="M4 7h16M9 7V4h6v3M6 7l1 13h10l1-13"/>',
    forward: '<path d="M9 5l7 7-7 7"/>',
    flag: '<path d="M5 21V4M5 4h11l-2 4 2 4H5"/>',
    external: '<path d="M14 4h6v6M20 4l-9 9M18 14v5a1 1 0 0 1-1 1H5a1 1 0 0 1-1-1V7a1 1 0 0 1 1-1h5"/>',
    check: '<path d="M5 12.5l4.5 4.5L19 7.5"/>'
  };

  function icon(name, cls) {
    var svg = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
    svg.setAttribute('viewBox', '0 0 24 24');
    svg.setAttribute('aria-hidden', 'true');
    svg.setAttribute('class', cls || 'ic');
    svg.innerHTML = ICONS[name] || ''; // fixed markup from the table above, never user text
    return svg;
  }

  var toastTimer = null;
  function toast(message) {
    var el = document.getElementById('toast');
    el.textContent = message;
    el.classList.add('show');
    clearTimeout(toastTimer);
    toastTimer = setTimeout(function () { el.classList.remove('show'); }, 2200);
  }

  function copyText(text) {
    function fallback() {
      try {
        var area = document.createElement('textarea');
        area.value = text;
        area.setAttribute('readonly', '');
        area.style.position = 'fixed';
        area.style.opacity = '0';
        document.body.appendChild(area);
        area.select();
        var ok = document.execCommand('copy');
        document.body.removeChild(area);
        return Promise.resolve(ok);
      } catch (e) {
        return Promise.resolve(false);
      }
    }
    if (navigator.clipboard && window.isSecureContext) {
      return navigator.clipboard.writeText(text).then(function () { return true; }, fallback);
    }
    return fallback();
  }

  function copyWithToast(text, label) {
    copyText(text).then(function (ok) {
      toast(ok ? (label || 'Copied') : 'Could not copy. Select the text and copy it.');
    });
  }

  function shareText(text) {
    if (navigator.share) {
      navigator.share({ text: text }).catch(function () { /* cancelled */ });
    } else {
      copyWithToast(text, 'Copied (sharing is not available here)');
    }
  }

  function newId() {
    return Date.now().toString(36) + Math.random().toString(36).slice(2, 6);
  }

  function formatDate(ts) {
    try {
      return new Date(ts).toLocaleString([], { day: 'numeric', month: 'short', hour: '2-digit', minute: '2-digit' });
    } catch (e) {
      return '';
    }
  }

  function charCount(text) {
    try {
      if (window.Intl && Intl.Segmenter) {
        // Count what a person sees as one letter, so Telugu letters match what YouTube shows.
        var count = 0;
        var it = new Intl.Segmenter(undefined, { granularity: 'grapheme' }).segment(text)[Symbol.iterator]();
        while (!it.next().done) count++;
        return count;
      }
    } catch (e) { /* fall through */ }
    return Array.from(text).length;
  }

  /* -------------------------------------------------------------- tool data */

  function lines(text) {
    var seen = {};
    return String(text || '')
      .split('\n')
      .map(function (l) {
        return l.replace(/^(?:\s*(?:[-*•]+|\d+[.)])\s*)+/, '').replace(/^["“]|["”]$/g, '').trim();
      })
      .filter(function (l) {
        if (!l) return false;
        var key = l.toLowerCase();
        if (seen[key]) return false;
        seen[key] = true;
        return true;
      });
  }

  var TOOLS = {
    title: {
      name: 'Title Generator',
      desc: 'Titles that get found and clicked',
      grad: 'g1',
      endpoint: '/api/title',
      kind: 'list',
      copyAllJoin: '\n',
      hint: 'Be specific. "Fiverr gig for beginners" gives better titles than "Fiverr". Titles over 60 characters may be cut off on YouTube.',
      fields: [
        { id: 'topic', label: 'Video topic', type: 'text', required: true, placeholder: 'e.g. how to create a Fiverr gig for beginners' },
        { id: 'language', label: 'Language', type: 'select', def: 'mix', options: [['mix', 'Telugu + English mix'], ['english', 'English'], ['telugu', 'Telugu']] }
      ],
      build: function (v) { return { topic: v.topic, language: v.language }; },
      parse: function (data) { return { items: lines(data.titles) }; }
    },
    hooks: {
      name: 'Hook Generator',
      desc: 'Opening lines for the first 5 seconds',
      grad: 'g2',
      endpoint: '/api/hooks',
      kind: 'list',
      copyAllJoin: '\n',
      hint: 'Hooks are drafts. Only use a line your video can really deliver, and rewrite it in your own voice.',
      fields: [
        { id: 'topic', label: 'Video topic', type: 'text', required: true, placeholder: 'e.g. Canva earning tips' }
      ],
      build: function (v) { return { topic: v.topic }; },
      parse: function (data) { return { items: lines(data.hooks) }; }
    },
    tags: {
      name: 'Tags Generator',
      desc: 'Search tags for your video',
      grad: 'g3',
      endpoint: '/api/tags',
      kind: 'chips',
      copyAllJoin: ', ',
      limit: 500,
      hint: 'YouTube allows about 500 characters of tags in total.',
      fields: [
        { id: 'topic', label: 'Video topic', type: 'text', required: true, placeholder: 'e.g. how to create a Fiverr gig' }
      ],
      build: function (v) { return { topic: v.topic }; },
      parse: function (data) {
        var seen = {};
        var items = String(data.tags || '').split(',').map(function (t) { return t.trim(); }).filter(function (t) {
          if (!t) return false;
          var k = t.toLowerCase();
          if (seen[k]) return false;
          seen[k] = true;
          return true;
        });
        return { items: items };
      }
    },
    hashtags: {
      name: 'Hashtag Generator',
      desc: 'Hashtags for YouTube, Instagram, TikTok',
      grad: 'g4',
      endpoint: '/api/hashtags',
      kind: 'chips',
      copyAllJoin: ' ',
      hint: 'Three to five hashtags that really describe the video usually work better than a long list.',
      fields: [
        { id: 'topic', label: 'Topic', type: 'text', required: true, placeholder: 'e.g. Canva tutorial for beginners' },
        {
          type: 'row',
          fields: [
            { id: 'platform', label: 'Platform', type: 'select', def: 'YouTube', options: [['YouTube', 'YouTube'], ['Instagram', 'Instagram'], ['TikTok', 'TikTok']] },
            { id: 'count', label: 'How many', type: 'select', def: '20', options: [['15', '15'], ['20', '20'], ['30', '30']] }
          ]
        }
      ],
      build: function (v) { return { topic: v.topic, platform: v.platform, hashtagCount: v.count }; },
      parse: function (data, values) {
        var seen = {};
        var found = String(data.hashtags || '').match(/#[^\s#]+/g) || [];
        var items = found.filter(function (t) {
          var k = t.toLowerCase();
          if (seen[k]) return false;
          seen[k] = true;
          return true;
        });
        var max = parseInt(values.count, 10);
        return { items: max ? items.slice(0, max) : items };
      }
    },
    description: {
      name: 'Description Generator',
      desc: 'A first draft for your video description',
      grad: 'g5',
      endpoint: '/api/description',
      kind: 'text',
      hint: 'The draft does not know what is in your video. Edit it, then add real timestamps.',
      fields: [
        { id: 'topic', label: 'Video topic', type: 'text', required: true, placeholder: 'e.g. how to create a Fiverr gig for beginners' },
        { id: 'channel', label: 'Channel name', type: 'text', optional: true, placeholder: 'Your channel name' },
        { id: 'keywords', label: 'Keywords', type: 'text', optional: true, placeholder: 'fiverr gig, freelancing' },
        { id: 'language', label: 'Language', type: 'select', def: 'english', options: [['english', 'English'], ['mix', 'Telugu + English mix'], ['telugu', 'Telugu']] }
      ],
      build: function (v) { return { topic: v.topic, channel: v.channel, keywords: v.keywords, language: v.language }; },
      parse: function (data) { return { text: String(data.description || '').trim() }; }
    }
  };
  var TOOL_ORDER = ['title', 'hooks', 'tags', 'hashtags', 'description'];

  var CHECKLIST = [
    { id: 'title', title: 'Title is clear', desc: 'Main keyword near the start and under about 60 characters.' },
    { id: 'hook', title: 'Hook is honest', desc: 'The first 5 seconds promise only what the video delivers.' },
    { id: 'desc-top', title: 'First two lines of the description', desc: 'They say what the video is, in plain words.' },
    { id: 'chapters', title: 'Timestamps added', desc: 'The first one is 00:00, then at least two more, each chapter at least 10 seconds.' },
    { id: 'hashtags', title: '3 to 5 relevant hashtags', desc: 'Every hashtag really describes this video.' },
    { id: 'tags', title: 'Tags added', desc: 'Relevant tags, within the 500 character limit.' },
    { id: 'thumb', title: 'Thumbnail readable when small', desc: 'Check it at phone size. Few words, strong contrast.' },
    { id: 'links', title: 'Links and call to action', desc: 'Related videos or your links go below the summary, not in the first lines.' }
  ];

  /* ------------------------------------------------------------------- api */

  function callApi(path, body) {
    if (navigator.onLine === false) {
      return Promise.reject(new Error('You are offline. Connect to the internet to generate. Saved items still work.'));
    }
    var controller = new AbortController();
    var timer = setTimeout(function () { controller.abort(); }, 40000);
    return fetch(path, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(body),
      signal: controller.signal
    }).then(function (res) {
      return res.json().catch(function () { return null; }).then(function (data) {
        if (!res.ok) {
          var message = '';
          if (data && data.error) message = typeof data.error === 'string' ? data.error : data.error.message;
          throw new Error(message || 'Something went wrong. Please try again.');
        }
        return data || {};
      });
    }, function (err) {
      throw new Error(err && err.name === 'AbortError'
        ? 'This is taking too long. Please try again.'
        : 'Could not reach the server. Check your internet and try again.');
    }).then(function (data) {
      clearTimeout(timer);
      return data;
    }, function (err) {
      clearTimeout(timer);
      throw err;
    });
  }

  /* --------------------------------------------------------------- favorites */

  function findFavorite(tool, text) {
    for (var i = 0; i < state.favorites.length; i++) {
      var f = state.favorites[i];
      if (f.tool === tool && f.text === text) return f;
    }
    return null;
  }

  function toggleFavorite(tool, text) {
    var existing = findFavorite(tool, text);
    if (existing) {
      state.favorites = state.favorites.filter(function (f) { return f !== existing; });
      saveState();
      return false;
    }
    state.favorites.unshift({ id: newId(), tool: tool, text: text, ts: Date.now() });
    if (state.favorites.length > FAVORITE_LIMIT) state.favorites.length = FAVORITE_LIMIT;
    saveState();
    return true;
  }

  function starButton(tool, text) {
    var btn = h('button', { class: 'icon-btn star', type: 'button', 'aria-label': 'Save to favorites' });
    function paint() {
      var on = !!findFavorite(tool, text);
      btn.classList.toggle('on', on);
      btn.setAttribute('aria-pressed', on ? 'true' : 'false');
    }
    btn.appendChild(icon('star'));
    btn.addEventListener('click', function () {
      var on = toggleFavorite(tool, text);
      paint();
      toast(on ? 'Saved to favorites' : 'Removed from favorites');
    });
    paint();
    return btn;
  }

  function copyButton(text, label) {
    return h('button', { class: 'icon-btn', type: 'button', 'aria-label': label || 'Copy', onclick: function () { copyWithToast(text); } }, icon('copy'));
  }

  /* ----------------------------------------------------------------- views */

  var view = document.getElementById('view');
  var topbar = document.getElementById('topbar');

  function setTopbar(title, backHash) {
    topbar.textContent = '';
    if (backHash) {
      topbar.appendChild(h('button', { class: 'icon-btn', type: 'button', 'aria-label': 'Back', onclick: function () { location.hash = backHash; } }, icon('back')));
      topbar.appendChild(h('h1', { text: title }));
    } else {
      topbar.appendChild(h('div', { class: 'brand' },
        h('img', { src: '/icons/icon-48.png', alt: '', width: '30', height: '30' }),
        h('h1', { text: title })));
    }
  }

  function toolIconBox(id) {
    var tool = TOOLS[id];
    return h('div', { class: 'tool-icon ' + tool.grad }, icon(id, ''));
  }

  function renderHome() {
    setTopbar('Creator Toolkit');
    var grid = h('div', { class: 'grid' });
    TOOL_ORDER.forEach(function (id) {
      var tool = TOOLS[id];
      grid.appendChild(h('a', { class: 'tool-card', href: '#/tool/' + id },
        toolIconBox(id),
        h('strong', { text: tool.name }),
        h('span', { class: 'd', text: tool.desc })));
    });
    grid.appendChild(h('a', { class: 'tool-card wide', href: '#/checklist' },
      h('div', { class: 'tool-icon g6' }, icon('checklist', '')),
      h('div', { class: 'txt' }, h('strong', { text: 'Upload Checklist' }), h('span', { class: 'd', text: 'Check every step before you publish. Works offline.' }))));

    view.appendChild(h('div', { class: 'hero' },
      h('h2', { text: 'Make your next upload easier' }),
      h('p', { text: 'Five AI helpers for titles, hooks, tags, hashtags and descriptions. Telugu and English.' })));
    view.appendChild(grid);

    if (state.history.length) {
      view.appendChild(h('h2', { text: 'Recent' }));
      var list = h('div', { class: 'list' });
      state.history.slice(0, 3).forEach(function (entry) { list.appendChild(historyRow(entry, false)); });
      view.appendChild(list);
    }
  }

  function renderTool(id) {
    var tool = TOOLS[id];
    if (!tool) { location.hash = '#/'; return; }
    setTopbar(tool.name, '#/');
    var prefs = state.prefs[id] || {};
    var inputs = {};
    var busy = false;

    function buildField(field) {
      if (field.type === 'row') {
        return h('div', { class: 'row' }, field.fields.map(buildField));
      }
      var control;
      var inputId = 'f-' + id + '-' + field.id;
      if (field.type === 'select') {
        control = h('select', { class: 'select', id: inputId });
        field.options.forEach(function (o) { control.appendChild(h('option', { value: o[0], text: o[1] })); });
        control.value = prefs[field.id] || field.def;
      } else {
        control = h('input', {
          class: 'input', id: inputId, type: 'text', maxlength: '200',
          placeholder: field.placeholder || '', autocomplete: 'off', enterkeyhint: 'go'
        });
      }
      inputs[field.id] = control;
      return h('div', { class: 'field' },
        h('label', { for: inputId }, field.label, field.optional ? h('span', { class: 'opt', text: ' (optional)' }) : null),
        control);
    }

    var errorBox = h('div', { class: 'error-text', role: 'alert' });
    var button = h('button', { class: 'btn primary', type: 'submit' }, 'Generate');
    var resultsBox = h('div', { class: 'results' });
    var form = h('form', { class: 'card', novalidate: true }, tool.fields.map(buildField), errorBox, button);

    function setBusy(on) {
      busy = on;
      button.disabled = on;
      button.textContent = '';
      if (on) button.appendChild(h('span', { class: 'spinner' }));
      button.appendChild(document.createTextNode(on ? 'Generating...' : 'Generate'));
    }

    // After a result the label returns at once, but the button stays off for a moment
    // so the free AI service is not hit again and again.
    function cooldown() {
      setBusy(false);
      button.disabled = true;
      setTimeout(function () { button.disabled = false; }, 1500);
    }

    form.addEventListener('submit', function (ev) {
      ev.preventDefault();
      if (busy) return;
      errorBox.textContent = '';
      var values = {};
      Object.keys(inputs).forEach(function (key) { values[key] = String(inputs[key].value || '').replace(/\s+/g, ' ').trim(); });
      if (!values.topic || values.topic.length < 3) {
        errorBox.textContent = 'Please type your video topic (at least 3 letters).';
        inputs.topic.focus();
        return;
      }
      state.prefs[id] = {};
      Object.keys(values).forEach(function (key) { if (key !== 'topic' && key !== 'channel' && key !== 'keywords') state.prefs[id][key] = values[key]; });
      saveState();

      setBusy(true);
      resultsBox.textContent = '';
      callApi(tool.endpoint, tool.build(values)).then(function (data) {
        var parsed = tool.parse(data, values);
        var empty = tool.kind === 'text' ? !parsed.text : !(parsed.items && parsed.items.length);
        if (empty) throw new Error('No results this time. Please try again.');
        var entry = { id: newId(), tool: id, topic: values.topic, ts: Date.now(), items: parsed.items || null, text: parsed.text || null };
        state.history.unshift(entry);
        if (state.history.length > HISTORY_LIMIT) state.history.length = HISTORY_LIMIT;
        saveState();
        resultsBox.textContent = '';
        resultsBox.appendChild(renderResults(entry));
        resultsBox.scrollIntoView({ behavior: window.matchMedia('(prefers-reduced-motion: reduce)').matches ? 'auto' : 'smooth', block: 'start' });
      }).catch(function (err) {
        resultsBox.textContent = '';
        resultsBox.appendChild(h('div', { class: 'alert', role: 'alert' }, err.message || 'Something went wrong. Please try again.'));
      }).then(function () {
        cooldown();
      });
    });

    view.appendChild(h('p', { class: 'muted', text: tool.hint }));
    view.appendChild(form);
    view.appendChild(resultsBox);
    if (inputs.topic) inputs.topic.focus({ preventScroll: true });
  }

  // "Report a problem": Google Play asks apps that show AI text to let people flag bad results inside the app.
  function reportBox(entry) {
    var box = h('div', { class: 'report' });
    function showButton() {
      box.textContent = '';
      box.appendChild(h('button', { class: 'link-btn', type: 'button', onclick: showPanel }, icon('flag'), 'Report a problem with these results'));
    }
    function showPanel() {
      box.textContent = '';
      var reason = h('select', { class: 'select', 'aria-label': 'What is wrong?' },
        h('option', { value: 'offensive', text: 'Offensive or unsafe' }),
        h('option', { value: 'misleading', text: 'Wrong or misleading' }),
        h('option', { value: 'other', text: 'Something else' }));
      var send = h('button', { class: 'btn small-btn primary-ish', type: 'button' }, 'Send report');
      var cancel = h('button', { class: 'btn small-btn', type: 'button', onclick: showButton }, 'Cancel');
      send.addEventListener('click', function () {
        var content = entry.items ? entry.items.join('\n') : String(entry.text || '');
        send.disabled = true;
        callApi('/api/report', { tool: entry.tool, topic: entry.topic, reason: reason.value, content: content }).then(function () {
          toast('Thank you. Your report was sent.');
          box.textContent = '';
          box.appendChild(h('p', { class: 'small', text: 'Report sent. Thank you, it helps us improve the results.' }));
        }, function (err) {
          send.disabled = false;
          toast(err.message || 'Could not send the report. Please try again.');
        });
      });
      box.appendChild(h('div', { class: 'card report-panel' },
        h('p', { class: 'small', text: 'What is wrong with these results? We receive your topic and the results, nothing else.' }),
        reason,
        h('div', { class: 'actions' }, send, cancel)));
    }
    showButton();
    return box;
  }

  function renderResults(entry) {
    var tool = TOOLS[entry.tool];
    var wrap = h('div');

    if (tool.kind === 'list') {
      var all = entry.items.join(tool.copyAllJoin);
      wrap.appendChild(h('div', { class: 'results-head' },
        h('h2', { text: entry.items.length + ' ideas' }),
        h('button', { class: 'btn small-btn', type: 'button', onclick: function () { copyWithToast(all, 'All copied'); } }, icon('copy'), 'Copy all')));
      var list = h('ul', { class: 'list' });
      entry.items.forEach(function (text) {
        var body = h('div', { class: 'body' }, h('div', { class: 'item-text t', text: text }));
        if (entry.tool === 'title') {
          var n = charCount(text);
          body.appendChild(h('span', { class: 'badge' + (n > 60 ? ' warn' : ''), text: n + ' characters' + (n > 60 ? ' (may be cut off)' : '') }));
        }
        list.appendChild(h('li', { class: 'item' }, body, copyButton(text), starButton(entry.tool, text)));
      });
      wrap.appendChild(list);
    } else if (tool.kind === 'chips') {
      var joined = entry.items.join(tool.copyAllJoin);
      wrap.appendChild(h('div', { class: 'results-head' }, h('h2', { text: entry.items.length + (entry.tool === 'tags' ? ' tags' : ' hashtags') })));
      var chips = h('div', { class: 'chips' });
      entry.items.forEach(function (t) { chips.appendChild(h('span', { class: 'chip', text: t })); });
      wrap.appendChild(chips);
      if (tool.limit) {
        var used = charCount(joined);
        var pct = Math.min(100, Math.round(used / tool.limit * 100));
        wrap.appendChild(h('div', { class: 'meter' },
          h('div', { class: 'small', text: used + ' of ' + tool.limit + ' characters' }),
          h('div', { class: 'bar' }, h('div', { class: 'fill' + (used > tool.limit ? ' over' : ''), style: null }))));
        var fill = wrap.querySelector('.fill');
        fill.style.width = pct + '%';
      }
      var saveBtn = h('button', { class: 'btn small-btn', type: 'button' }, icon('star'), findFavorite(entry.tool, joined) ? 'Saved' : 'Save set');
      saveBtn.addEventListener('click', function () {
        var on = toggleFavorite(entry.tool, joined);
        saveBtn.lastChild.textContent = on ? 'Saved' : 'Save set';
        toast(on ? 'Saved to favorites' : 'Removed from favorites');
      });
      wrap.appendChild(h('div', { class: 'actions' },
        h('button', { class: 'btn small-btn', type: 'button', onclick: function () { copyWithToast(joined, 'All copied'); } }, icon('copy'), 'Copy all'),
        saveBtn));
    } else {
      wrap.appendChild(h('div', { class: 'results-head' }, h('h2', { text: 'Your draft' })));
      var area = h('textarea', { class: 'textarea', 'aria-label': 'Description draft' });
      area.value = entry.text;
      var counter = h('div', { class: 'small', text: charCount(entry.text) + ' characters' });
      area.addEventListener('input', function () {
        entry.text = area.value;
        counter.textContent = charCount(area.value) + ' characters';
        saveState();
      });
      wrap.appendChild(area);
      wrap.appendChild(counter);
      var descSave = h('button', { class: 'btn small-btn', type: 'button' }, icon('star'), 'Save');
      descSave.addEventListener('click', function () {
        toggleFavorite(entry.tool, area.value);
        toast('Saved to favorites');
      });
      wrap.appendChild(h('div', { class: 'actions' },
        h('button', { class: 'btn small-btn', type: 'button', onclick: function () { copyWithToast(area.value); } }, icon('copy'), 'Copy'),
        h('button', { class: 'btn small-btn', type: 'button', onclick: function () { shareText(area.value); } }, icon('share'), 'Share'),
        descSave));
    }
    wrap.appendChild(reportBox(entry));
    return wrap;
  }

  function historyRow(entry, withDelete) {
    var tool = TOOLS[entry.tool];
    var count = entry.items ? entry.items.length + ' results' : 'Draft';
    var row = h('div', { class: 'entry' },
      h('a', { class: 'main', href: '#/history/' + entry.id },
        h('div', {},
          h('span', { class: 'badge tool', text: tool ? tool.name : entry.tool }),
          h('span', { class: 'small', text: formatDate(entry.ts) + ' · ' + count })),
        h('div', { class: 'topic', text: entry.topic })));
    if (withDelete) {
      row.appendChild(h('button', {
        class: 'icon-btn', type: 'button', 'aria-label': 'Delete this entry',
        onclick: function () {
          state.history = state.history.filter(function (e) { return e !== entry; });
          saveState();
          toast('Deleted');
          route();
        }
      }, icon('trash')));
    }
    return row;
  }

  function renderSaved() {
    setTopbar('Saved');
    var tab = state.prefs.savedTab === 'history' ? 'history' : 'favorites';
    function pick(next) { state.prefs.savedTab = next; saveState(); route(); }
    view.appendChild(h('div', { class: 'seg', role: 'tablist' },
      h('button', { class: tab === 'favorites' ? 'on' : '', type: 'button', role: 'tab', 'aria-selected': tab === 'favorites' ? 'true' : 'false', onclick: function () { pick('favorites'); } }, 'Favorites (' + state.favorites.length + ')'),
      h('button', { class: tab === 'history' ? 'on' : '', type: 'button', role: 'tab', 'aria-selected': tab === 'history' ? 'true' : 'false', onclick: function () { pick('history'); } }, 'History (' + state.history.length + ')')));

    if (tab === 'favorites') {
      if (!state.favorites.length) {
        view.appendChild(h('div', { class: 'empty' }, h('p', { text: 'No favorites yet.' }), h('p', { class: 'small', text: 'Tap the star on any result to keep it here.' })));
        return;
      }
      var list = h('div', { class: 'list' });
      state.favorites.forEach(function (fav) {
        var tool = TOOLS[fav.tool];
        list.appendChild(h('div', { class: 'item' },
          h('div', { class: 'body' },
            h('span', { class: 'badge tool', text: tool ? tool.name : fav.tool }),
            h('div', { class: 'item-text t', text: fav.text, style: null })),
          copyButton(fav.text),
          h('button', {
            class: 'icon-btn', type: 'button', 'aria-label': 'Remove from favorites',
            onclick: function () {
              state.favorites = state.favorites.filter(function (f) { return f !== fav; });
              saveState();
              route();
            }
          }, icon('trash'))));
      });
      view.appendChild(list);
      view.appendChild(h('div', { class: 'actions' }, confirmButton('Clear favorites', function () { state.favorites = []; saveState(); route(); })));
    } else {
      if (!state.history.length) {
        view.appendChild(h('div', { class: 'empty' }, h('p', { text: 'Nothing here yet.' }), h('p', { class: 'small', text: 'Every result you generate is kept on this phone, so you can come back to it.' })));
        return;
      }
      var hist = h('div', { class: 'list' });
      state.history.forEach(function (entry) { hist.appendChild(historyRow(entry, true)); });
      view.appendChild(hist);
      view.appendChild(h('div', { class: 'actions' }, confirmButton('Clear history', function () { state.history = []; saveState(); route(); })));
    }
  }

  // Two-step button: first tap asks, second tap does it.
  function confirmButton(label, action) {
    var armed = false;
    var timer = null;
    var btn = h('button', { class: 'btn small-btn danger', type: 'button' }, icon('trash'), label);
    btn.addEventListener('click', function () {
      if (!armed) {
        armed = true;
        btn.lastChild.textContent = 'Tap again to confirm';
        timer = setTimeout(function () { armed = false; btn.lastChild.textContent = label; }, 3500);
      } else {
        clearTimeout(timer);
        action();
      }
    });
    return btn;
  }

  function renderHistoryDetail(id) {
    var entry = null;
    state.history.forEach(function (e) { if (e.id === id) entry = e; });
    setTopbar('Saved result', '#/saved');
    if (!entry) {
      view.appendChild(h('div', { class: 'empty' }, h('p', { text: 'This item is no longer here.' }), h('a', { href: '#/saved', text: 'Back to Saved' })));
      return;
    }
    var tool = TOOLS[entry.tool];
    view.appendChild(h('p', { class: 'muted' }, h('strong', { text: tool ? tool.name : entry.tool }), ' · ' + formatDate(entry.ts)));
    view.appendChild(h('div', { class: 'card' }, h('div', { class: 'small', text: 'Topic' }), h('div', { text: entry.topic })));
    var box = h('div', { class: 'results' });
    box.appendChild(renderResults(entry));
    view.appendChild(box);
    if (tool) view.appendChild(h('div', { class: 'actions' }, h('a', { class: 'btn small-btn', href: '#/tool/' + entry.tool, text: 'Use ' + tool.name + ' again' })));
  }

  function renderChecklist() {
    setTopbar('Upload Checklist');
    var done = CHECKLIST.filter(function (c) { return state.checklist[c.id]; }).length;
    var summary = h('p', { class: 'muted', text: done + ' of ' + CHECKLIST.length + ' done' });
    view.appendChild(h('p', { text: 'Go through this before you press Publish. Your ticks stay on this phone.' }));
    view.appendChild(summary);
    var list = h('div', { class: 'list' });
    CHECKLIST.forEach(function (c) {
      var btn = h('button', { class: 'check' + (state.checklist[c.id] ? ' on' : ''), type: 'button', role: 'checkbox', 'aria-checked': state.checklist[c.id] ? 'true' : 'false' },
        h('span', { class: 'box' }, icon('check', '')),
        h('span', {}, h('strong', { text: c.title }), h('span', { class: 'd', text: c.desc })));
      btn.addEventListener('click', function () {
        state.checklist[c.id] = !state.checklist[c.id];
        saveState();
        btn.classList.toggle('on', !!state.checklist[c.id]);
        btn.setAttribute('aria-checked', state.checklist[c.id] ? 'true' : 'false');
        var n = CHECKLIST.filter(function (x) { return state.checklist[x.id]; }).length;
        summary.textContent = n + ' of ' + CHECKLIST.length + ' done';
        if (n === CHECKLIST.length) toast('All done. Ready to publish!');
      });
      list.appendChild(btn);
    });
    view.appendChild(list);
    view.appendChild(h('div', { class: 'actions' }, confirmButton('Reset checklist', function () { state.checklist = {}; saveState(); route(); })));
  }

  function linkRow(label, href, external) {
    return h('a', { class: 'link-row', href: href, target: external ? '_blank' : null, rel: external ? 'noopener' : null }, h('span', { text: label }), icon('external'));
  }

  function renderAbout() {
    setTopbar('About');
    view.appendChild(h('div', { class: 'card' },
      h('h2', { text: 'Creator Toolkit' }),
      h('p', { text: 'Free AI helpers for YouTube creators, made for Telugu and English channels. Created by Naveen Kodali.' }),
      h('p', { class: 'small', text: 'Version ' + VERSION })));
    view.appendChild(h('p', { class: 'muted', style: null }, 'The AI gives drafts, not promises. Check every title, hook and description before you publish. Nothing here guarantees views, subscribers or income.'));
    view.appendChild(h('div', { class: 'links' },
      linkRow('Website: creatortoolkits.in', SITE, true),
      linkRow('How the title checks work', SITE + '/blog/how-the-title-generator-works.html', true),
      h('a', { class: 'link-row', href: '/privacy.html' }, h('span', { text: 'Privacy Policy' }), icon('forward')),
      linkRow('Contact: ' + CONTACT, 'mailto:' + CONTACT, false)));
    view.appendChild(h('h2', { text: 'Your data on this phone' }));
    view.appendChild(h('p', { class: 'muted', text: 'History, favorites and checklist ticks are stored only on this phone. You can remove them here at any time.' }));
    view.appendChild(h('div', { class: 'actions' }, confirmButton('Clear all saved data', function () {
      state = emptyState();
      saveState();
      toast('All saved data cleared');
      route();
    })));
  }

  /* ---------------------------------------------------------------- router */

  var ROUTES = [
    [/^#\/?$/, renderHome, 'home'],
    [/^#\/tool\/(\w+)$/, renderTool, 'home'],
    [/^#\/saved$/, renderSaved, 'saved'],
    [/^#\/history\/([\w-]+)$/, renderHistoryDetail, 'saved'],
    [/^#\/checklist$/, renderChecklist, 'checklist'],
    [/^#\/about$/, renderAbout, 'about']
  ];

  function route() {
    var hash = location.hash || '#/';
    var match = null;
    var tab = 'home';
    var handler = null;
    ROUTES.forEach(function (r) {
      if (match) return;
      var m = hash.match(r[0]);
      if (m) { match = m; handler = r[1]; tab = r[2]; }
    });
    view.textContent = '';
    if (!handler) { location.hash = '#/'; return; }
    handler(match[1]);
    Array.prototype.forEach.call(document.querySelectorAll('#tabbar a'), function (a) {
      a.classList.toggle('active', a.getAttribute('data-tab') === tab);
      if (a.getAttribute('data-tab') === tab) a.setAttribute('aria-current', 'page'); else a.removeAttribute('aria-current');
    });
    window.scrollTo(0, 0);
  }

  window.addEventListener('hashchange', route);
  route();

  if ('serviceWorker' in navigator) {
    window.addEventListener('load', function () {
      navigator.serviceWorker.register('/sw.js').catch(function () { /* the app works without it */ });
    });
  }
})();

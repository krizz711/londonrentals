/* ============================================================
   LondonRental.ca — Admin panel
   CRUD for listings via LR_Store. The admin signs in against the
   server (api/login.php) so every change is saved to the website
   and shown to all visitors. If the server/API isn't reachable
   (opened locally, or a host without PHP) it falls back to a
   built-in password + localStorage for offline editing.
   ============================================================ */
(function () {
  const API = 'api/';
  const PASSWORD = '';              // offline fallback disabled — the live site always uses the server password (api/config.php)
  const SESSION = 'lr_admin_ok';

  async function apiPost(path, body) {
    const r = await fetch(API + path, {
      method: 'POST', credentials: 'same-origin',
      headers: { 'Content-Type': 'application/json', 'X-Requested-With': 'fetch' },
      body: JSON.stringify(body),
    });
    let d = {}; try { d = await r.json(); } catch (e) { }
    return { ok: r.ok && d && d.ok === true, status: r.status, data: d };
  }

  const svg = (p, s) => '<svg width="' + (s || 18) + '" height="' + (s || 18) + '" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.7" stroke-linecap="round" stroke-linejoin="round">' + p + '</svg>';
  const IC = {
    lock: '<rect x="5" y="11" width="14" height="9" rx="2"/><path d="M8 11V8a4 4 0 0 1 8 0v3"/>',
    plus: '<path d="M12 5v14M5 12h14"/>',
    edit: '<path d="M12 20h9M16.5 3.5a2.1 2.1 0 0 1 3 3L7 19l-4 1 1-4z"/>',
    trash: '<path d="M3 6h18M8 6V4h8v2M19 6l-1 14H6L5 6"/>',
    close: '<path d="M6 6l12 12M18 6L6 18"/>',
  };
  const esc = (s) => String(s == null ? '' : s).replace(/[&<>"]/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]));

  const scrim = document.createElement('div');
  scrim.id = 'admin-scrim';
  document.body.appendChild(scrim);

  let editIndex = -1;     // -1 = adding
  let draftMedia = [];    // array of strings (URLs or data URIs)
  let draftVideo = '';

  async function open() {
    scrim.classList.add('open');
    document.body.style.overflow = 'hidden';
    if (await isAuthed()) renderList();
    else renderGate();
  }
  async function isAuthed() {
    try {
      const r = await fetch(API + 'login.php?t=' + Date.now(), { credentials: 'same-origin', cache: 'no-store' });
      if (r.ok) { const d = await r.json().catch(() => ({})); return !!(d && d.admin); }
      throw 0;
    } catch (e) {
      return sessionStorage.getItem(SESSION) === '1';   // server unreachable → local gate
    }
  }
  function close() {
    scrim.classList.remove('open'); document.body.style.overflow = '';
    try { history.replaceState(null, '', location.pathname + location.search); } catch (e) { }
  }
  window.LR_closeAdmin = close;

  /* ---------------- gate ---------------- */
  function renderGate() {
    scrim.innerHTML =
      '<div class="admin-shell"><div class="admin-gate">' +
      '<div class="lock">' + svg(IC.lock, 26) + '</div>' +
      '<span class="eyebrow">Admin Access</span>' +
      '<h2 class="playfair">Manage Listings</h2>' +
      '<p>Enter your admin password to add, edit, or remove rental listings.</p>' +
      '<div class="lr-field"><input id="admin-pass" type="password" placeholder="Password" autocomplete="current-password" onkeydown="if(event.key===\'Enter\')LR_adminLogin()"></div>' +
      '<div class="lr-actions" style="margin-top:14px">' +
      '<button class="btn btn-ghost" onclick="LR_closeAdmin()">Cancel</button>' +
      '<button class="btn btn-gold grow" onclick="LR_adminLogin()">Unlock <span class="arr">→</span></button>' +
      '</div>' +
      '<div id="admin-err" style="color:var(--red-300);font-size:13px;margin-top:14px;min-height:18px"></div>' +
      '</div></div>';
    setTimeout(() => { const i = document.getElementById('admin-pass'); if (i) i.focus(); }, 50);
  }
  window.LR_adminLogin = async function () {
    const err = document.getElementById('admin-err');
    const pass = (document.getElementById('admin-pass') || {}).value || '';
    if (!pass) { if (err) err.textContent = 'Please enter your password.'; return; }
    if (err) err.textContent = 'Checking…';
    let reachable = true, success = false;
    try {
      const r = await fetch(API + 'login.php', {
        method: 'POST', credentials: 'same-origin',
        headers: { 'Content-Type': 'application/json', 'X-Requested-With': 'fetch' },
        body: JSON.stringify({ password: pass }),
      });
      const d = await r.json().catch(() => ({}));
      success = r.ok && d && d.ok === true;
    } catch (e) { reachable = false; }   // network error → server not present
    if (success) { sessionStorage.setItem(SESSION, '1'); renderList(); return; }
    if (reachable) { if (err) err.textContent = 'Incorrect password. Please try again.'; return; }
    // server unreachable (opened locally / host without PHP) → built-in fallback password
    if (pass === PASSWORD) { sessionStorage.setItem(SESSION, '1'); renderList(); }
    else if (err) err.textContent = 'Incorrect password. Please try again.';
  };
  window.LR_adminLogout = async function () {
    try { await apiPost('login.php', { action: 'logout' }); } catch (e) { }
    sessionStorage.removeItem(SESSION);
    renderGate();
  };

  /* ---------------- list ---------------- */
  function renderList() {
    const items = window.LR_Store ? LR_Store.all() : [];
    let cards = items.map((l, i) =>
      '<div class="admin-card">' +
      '<div class="ph"><img src="' + esc(l.img) + '" alt="" onerror="this.style.opacity=0">' +
      '<span class="st ' + (l.status === 'Rented' ? 'rented' : '') + '">' + esc(l.status) + '</span></div>' +
      '<div class="ab"><div class="pr">$' + Number(l.price).toLocaleString() + ' <span style="font-size:12px;color:var(--text-tertiary)">/mo</span></div>' +
      '<div class="tt">' + esc(l.title) + '</div>' +
      '<div class="ad">' + esc(l.type) + ' · ' + esc(l.addr) + ' · ' + esc(l.hood) + '</div></div>' +
      '<div class="acts">' +
      '<button class="btn btn-outline" onclick="LR_adminEdit(' + i + ')">' + svg(IC.edit, 15) + ' Edit</button>' +
      '<button class="btn btn-danger" onclick="LR_adminDelete(' + i + ')">' + svg(IC.trash, 15) + ' Delete</button>' +
      '</div></div>'
    ).join('');
    if (!items.length) cards = '<div class="admin-empty">No listings yet. Click “Add Listing” to create your first one.</div>';

    scrim.innerHTML =
      '<div class="admin-shell">' +
      '<div class="admin-top"><div><span class="eyebrow">Admin · ' + items.length + ' listing' + (items.length === 1 ? '' : 's') + '</span>' +
      '<h2 class="playfair">Manage Listings</h2></div>' +
      '<div style="display:flex;gap:10px;flex-wrap:wrap">' +
      '<button class="btn btn-ghost" onclick="LR_adminReset()">Reset to defaults</button>' +
      '<button class="btn btn-ghost" onclick="LR_adminLogout()">Sign out</button>' +
      '<button class="btn btn-ghost" onclick="LR_closeAdmin()">' + svg(IC.close, 15) + ' Close</button>' +
      '<button class="btn btn-gold" onclick="LR_adminEdit(-1)">' + svg(IC.plus, 16) + ' Add Listing</button>' +
      '</div></div>' +
      '<p class="admin-sub">Add, edit, or remove the rentals shown on your public site. Changes are saved to your website and appear for every visitor. Visitors can inquire on any “Available” listing.</p>' +
      '<div class="admin-grid">' + cards + '</div>' +
      '</div>';
  }
  window.LR_renderAdmin = function () {
    if (!scrim.classList.contains('open')) return;
    if (scrim.querySelector('.admin-gate') || scrim.querySelector('.admin-editor')) return; // don't disrupt sign-in or editing
    if (scrim.querySelector('.admin-top')) renderList(); // on the list view → refresh with the latest data
  };

  window.LR_adminDelete = function (i) {
    const items = LR_Store.all();
    if (confirm('Delete “' + (items[i] ? items[i].title : 'this listing') + '”? This cannot be undone.')) {
      LR_Store.remove(i); renderList();
    }
  };
  window.LR_adminReset = function () {
    if (confirm('Reset all listings back to the original sample set? Your changes will be lost.')) { LR_Store.reset(); renderList(); }
  };

  /* ---------------- editor ---------------- */
  function field(label, id, val, ph, type) {
    return '<div><label>' + label + '</label><input id="' + id + '" type="' + (type || 'text') + '" placeholder="' + (ph || '') + '" value="' + esc(val) + '"></div>';
  }
  function sel(label, id, options, val) {
    return '<div><label>' + label + '</label><select id="' + id + '">' +
      options.map((o) => '<option' + (String(o) === String(val) ? ' selected' : '') + '>' + o + '</option>').join('') + '</select></div>';
  }

  window.LR_adminEdit = function (i) {
    editIndex = i;
    const l = i >= 0 ? LR_Store.all()[i] : { type: 'House', price: '', status: 'Available', title: '', hood: '', addr: '', beds: '', baths: '', parking: '0', pets: false, img: '', images: [], video: '', desc: '' };

    draftMedia = (l.images && l.images.length) ? l.images.slice() : (l.img ? [l.img] : []);
    draftVideo = l.video || '';

    scrim.innerHTML =
      '<div class="admin-shell admin-editor">' +
      '<div class="admin-top"><div><span class="eyebrow">' + (i >= 0 ? 'Edit Listing' : 'New Listing') + '</span>' +
      '<h2 class="playfair">' + (i >= 0 ? 'Edit Rental' : 'Add a Rental') + '</h2></div>' +
      '<button class="btn btn-ghost" onclick="LR_adminBack()">' + svg(IC.close, 15) + ' Cancel</button></div>' +
      '<div style="max-width:680px">' +
      '<div class="lr-field"><label>Listing Title *</label><input id="a-title" placeholder="e.g. Bright 2-Bed Apartment" value="' + esc(l.title) + '"></div>' +
      '<div class="lr-grid2">' +
      sel('Property Type', 'a-type', ['House', 'Apartment', 'Condo', 'Townhome', 'Private Room', 'Basement'], l.type) +
      sel('Status', 'a-status', ['Available', 'Rented'], l.status) +
      field('Monthly Rent ($) *', 'a-price', l.price, '1800', 'number') +
      sel('Pets', 'a-pets', ['No Pets', 'Pets OK'], l.pets ? 'Pets OK' : 'No Pets') +
      sel('Bedrooms', 'a-beds', ['0', '1', '2', '3', '4', '5', '6'], l.beds) +
      sel('Bathrooms', 'a-baths', ['1', '1.5', '2', '2.5', '3', '3.5'], l.baths) +
      sel('Parking spots', 'a-parking', ['0', '1', '2', '3', '4'], l.parking) +
      '</div>' +
      '<div class="lr-grid2">' +
      field('Street Address *', 'a-addr', l.addr, '12 Wharncliffe Rd N') +
      field('Neighbourhood', 'a-hood', l.hood, 'Old North') +
      '</div>' +
      '<div class="lr-field"><label>Property Description</label><textarea id="a-desc" placeholder="Describe the property...">' + esc(l.desc) + '</textarea></div>' +
      '<div class="lr-field"><label>Media (Photos & Video)</label>' +
      '<div class="lr-media-tabs"><div class="tab on" id="tab-img" onclick="LR_adminTab(\'img\')">Photos</div><div class="tab" id="tab-vid" onclick="LR_adminTab(\'vid\')">Video Link</div></div>' +

      '<div id="sec-img">' +
      '<div class="lr-drop" onclick="document.getElementById(\'a-file\').click()"><div class="di">' + svg(IC.plus, 24) + '</div><div class="dt">Click to upload photos</div><div class="dh">or paste an image URL below</div></div>' +
      '<input id="a-file" type="file" accept="image/*" multiple style="display:none" onchange="LR_adminPhoto(this)">' +
      '<div class="lr-thumbs" id="a-thumb"></div>' +
      '<div style="display:flex;gap:10px;margin-top:10px"><input id="a-img" style="flex:1" placeholder="https://…image.jpg" onkeydown="if(event.key===\'Enter\'){LR_adminAddImgUrl();event.preventDefault();}"><button class="btn btn-outline" style="padding:0 16px" type="button" onclick="LR_adminAddImgUrl()">Add</button></div>' +
      '</div>' +

      '<div id="sec-vid" style="display:none">' +
      '<input id="a-vid" placeholder="https://...video.mp4" value="' + esc(draftVideo) + '" oninput="LR_adminVideoUrl(this.value)">' +
      '<div class="lr-media-hint">Direct link to an MP4 video file.</div>' +
      '<div class="lr-thumbs" id="a-thumb-vid"></div>' +
      '</div>' +
      '</div>' +
      '<div class="lr-actions" style="margin-top:8px;max-width:420px">' +
      '<button class="btn btn-outline" onclick="LR_adminBack()">Cancel</button>' +
      '<button class="btn btn-gold grow" onclick="LR_adminSave()">' + (i >= 0 ? 'Save Changes' : 'Add Listing') + ' <span class="arr">→</span></button>' +
      '</div>' +
      '</div>' +
      '</div>';
    drawThumb();
    window.scrollTo(0, 0);
  };

  window.LR_adminTab = function (t) {
    document.getElementById('tab-img').className = 'tab' + (t === 'img' ? ' on' : '');
    document.getElementById('tab-vid').className = 'tab' + (t === 'vid' ? ' on' : '');
    document.getElementById('sec-img').style.display = t === 'img' ? 'block' : 'none';
    document.getElementById('sec-vid').style.display = t === 'vid' ? 'block' : 'none';
  };

  function drawThumb() {
    const t = document.getElementById('a-thumb');
    if (t) {
      t.innerHTML = draftMedia.map((m, idx) =>
        '<div class="th"><img src="' + esc(m) + '" alt="" onerror="this.style.opacity=0">' +
        '<button onclick="LR_adminRemoveImg(' + idx + ')">' + svg(IC.close, 14) + '</button></div>'
      ).join('');
    }
    const tv = document.getElementById('a-thumb-vid');
    if (tv) {
      tv.innerHTML = draftVideo ? '<div class="th"><video src="' + esc(draftVideo) + '" muted></video><div class="vid-badge">VIDEO</div><button onclick="LR_adminRemoveVid()">' + svg(IC.close, 14) + '</button></div>' : '';
    }
  }

  window.LR_adminRemoveImg = function (idx) {
    draftMedia.splice(idx, 1);
    drawThumb();
  };
  window.LR_adminRemoveVid = function () {
    draftVideo = '';
    const v = document.getElementById('a-vid');
    if (v) v.value = '';
    drawThumb();
  };

  window.LR_adminPhoto = function (input) {
    const files = input.files;
    if (!files || !files.length) return;
    for (let i = 0; i < files.length; i++) {
      const r = new FileReader();
      r.onload = () => {
        draftMedia.push(r.result);
        drawThumb();
      };
      r.readAsDataURL(files[i]);
    }
    input.value = ''; // clear
  };

  window.LR_adminAddImgUrl = function () {
    const i = document.getElementById('a-img');
    if (i && i.value.trim()) {
      draftMedia.push(i.value.trim());
      i.value = '';
      drawThumb();
    }
  };

  window.LR_adminVideoUrl = function (v) {
    draftVideo = v.trim();
    drawThumb();
  };

  window.LR_adminBack = function () { renderList(); window.scrollTo(0, 0); };

  window.LR_adminSave = async function () {
    const g = (id) => (document.getElementById(id) || {}).value || '';
    const title = g('a-title').trim();
    const addr = g('a-addr').trim();
    const price = parseInt(g('a-price'), 10);
    if (!title || !addr || !price) { alert('Please fill in at least a title, address and rent.'); return; }
    const saveBtn = scrim.querySelector('.admin-editor .btn-gold');
    if (saveBtn) { saveBtn.textContent = 'Saving…'; saveBtn.disabled = true; }

    const finalMedia = [];
    if (window.LR_Store && LR_Store.uploadImage) {
      for (let m of draftMedia) {
        finalMedia.push(await LR_Store.uploadImage(m));
      }
    } else {
      finalMedia.push(...draftMedia);
    }

    const item = {
      type: g('a-type'), status: g('a-status'), title: title, hood: g('a-hood').trim() || 'London',
      addr: addr, price: price, beds: parseFloat(g('a-beds')) || 0, baths: parseFloat(g('a-baths')) || 1,
      parking: parseInt(g('a-parking'), 10) || 0, pets: g('a-pets') === 'Pets OK',
      images: finalMedia,
      img: finalMedia.length ? finalMedia[0] : 'https://images.unsplash.com/photo-1560448204-e02f11c3d0e2?auto=format&fit=crop&w=800&q=80',
      video: draftVideo,
      desc: g('a-desc').trim(),
    };
    if (editIndex >= 0) LR_Store.update(editIndex, item); else LR_Store.add(item);
    renderList();
    window.scrollTo(0, 0);
  };

  /* ---------------- triggers ----------------
     ADMIN IS PRIVATE: there is no visible link. It opens ONLY when the
     URL ends with the secret fragment below, then asks for the password.
     Change BOTH the secret fragment and the PASSWORD (top of file) to
     your own values, and don't share them.                              */
  const SECRET_HASH = '#admin-kunal';
  function checkHash() { if (location.hash === SECRET_HASH) open(); }
  checkHash();
  window.addEventListener('hashchange', checkHash);
  // discreet lock button in the footer (still password-gated)
  const link = document.getElementById('admin-open');
  if (link) link.addEventListener('click', (e) => { e.preventDefault(); open(); });
  document.addEventListener('keydown', (e) => { if (e.key === 'Escape' && scrim.classList.contains('open')) close(); });
})();

/* ============================================================
   LondonRental.ca — Admin panel
   Password-gated CRUD for listings. Data lives in localStorage
   (via LR_Store), so changes show on the public grid instantly.
   NOTE: this is client-side only — fine for a static marketing
   site, but it is not real server security. Change PASSWORD below.
   ============================================================ */
(function () {
  const PASSWORD = 'kunal2025';
  const SESSION = 'lr_admin_ok';

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
  let draftImg = '';      // dataURL or url for the editor

  function open() {
    scrim.classList.add('open');
    document.body.style.overflow = 'hidden';
    if (sessionStorage.getItem(SESSION) === '1') renderList();
    else renderGate();
  }
  function close() { scrim.classList.remove('open'); document.body.style.overflow = '';
    try { history.replaceState(null, '', location.pathname + location.search); } catch (e) {} }
  window.LR_closeAdmin = close;

  /* ---------------- gate ---------------- */
  function renderGate() {
    scrim.innerHTML =
      '<div class="admin-shell"><div class="admin-gate">' +
        '<div class="lock">' + svg(IC.lock, 26) + '</div>' +
        '<span class="eyebrow">Admin Access</span>' +
        '<h2 class="playfair">Manage Listings</h2>' +
        '<p>Enter your admin password to add, edit, or remove rental listings.</p>' +
        '<div class="lr-field"><input id="admin-pass" type="password" placeholder="Password" onkeydown="if(event.key===\'Enter\')LR_adminLogin()"></div>' +
        '<div class="lr-actions" style="margin-top:14px">' +
          '<button class="btn btn-ghost" onclick="LR_closeAdmin()">Cancel</button>' +
          '<button class="btn btn-gold grow" onclick="LR_adminLogin()">Unlock <span class="arr">→</span></button>' +
        '</div>' +
        '<div id="admin-err" style="color:var(--red-300);font-size:13px;margin-top:14px;min-height:18px"></div>' +
      '</div></div>';
    setTimeout(() => { const i = document.getElementById('admin-pass'); if (i) i.focus(); }, 50);
  }
  window.LR_adminLogin = function () {
    const v = (document.getElementById('admin-pass') || {}).value || '';
    if (v === PASSWORD) { sessionStorage.setItem(SESSION, '1'); renderList(); }
    else document.getElementById('admin-err').textContent = 'Incorrect password. Please try again.';
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
            '<button class="btn btn-ghost" onclick="LR_closeAdmin()">' + svg(IC.close, 15) + ' Close</button>' +
            '<button class="btn btn-gold" onclick="LR_adminEdit(-1)">' + svg(IC.plus, 16) + ' Add Listing</button>' +
          '</div></div>' +
        '<p class="admin-sub">Add, edit, or remove the rentals shown on your public site. Changes save to this browser instantly. Visitors can inquire on any “Available” listing.</p>' +
        '<div class="admin-grid">' + cards + '</div>' +
      '</div>';
  }
  window.LR_renderAdmin = function () { if (scrim.classList.contains('open') && sessionStorage.getItem(SESSION) === '1' && !scrim.querySelector('.admin-editor')) renderList(); };

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
    const l = i >= 0 ? LR_Store.all()[i] : { type: 'House', price: '', status: 'Available', title: '', hood: '', addr: '', beds: '', baths: '', parking: '0', pets: false, img: '' };
    draftImg = l.img || '';
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
          '<div class="lr-field"><label>Photo</label>' +
            '<div class="lr-drop" onclick="document.getElementById(\'a-file\').click()"><div class="di">' + svg(IC.plus, 24) + '</div><div class="dt">Click to upload a photo</div><div class="dh">or paste an image URL below</div></div>' +
            '<input id="a-file" type="file" accept="image/*" style="display:none" onchange="LR_adminPhoto(this)">' +
            '<div class="lr-thumbs" id="a-thumb"></div>' +
            '<input id="a-img" style="margin-top:10px" placeholder="https://…image.jpg" value="' + esc(l.img) + '" oninput="LR_adminImgUrl(this.value)"></div>' +
          '<div class="lr-actions" style="margin-top:8px;max-width:420px">' +
            '<button class="btn btn-outline" onclick="LR_adminBack()">Cancel</button>' +
            '<button class="btn btn-gold grow" onclick="LR_adminSave()">' + (i >= 0 ? 'Save Changes' : 'Add Listing') + ' <span class="arr">→</span></button>' +
          '</div>' +
        '</div>' +
      '</div>';
    drawThumb();
    window.scrollTo(0, 0);
  };
  function drawThumb() {
    const t = document.getElementById('a-thumb');
    if (!t) return;
    t.innerHTML = draftImg ? '<div class="th"><img src="' + esc(draftImg) + '" alt="" onerror="this.style.opacity=0"></div>' : '';
  }
  window.LR_adminPhoto = function (input) {
    const f = (input.files || [])[0];
    if (!f) return;
    const r = new FileReader();
    r.onload = () => { draftImg = r.result; const u = document.getElementById('a-img'); if (u) u.value = ''; drawThumb(); };
    r.readAsDataURL(f);
  };
  window.LR_adminImgUrl = function (v) { if (v) { draftImg = v; drawThumb(); } };
  window.LR_adminBack = function () { renderList(); window.scrollTo(0, 0); };

  window.LR_adminSave = function () {
    const g = (id) => (document.getElementById(id) || {}).value || '';
    const title = g('a-title').trim();
    const addr = g('a-addr').trim();
    const price = parseInt(g('a-price'), 10);
    if (!title || !addr || !price) { alert('Please fill in at least a title, address and rent.'); return; }
    const item = {
      type: g('a-type'), status: g('a-status'), title: title, hood: g('a-hood').trim() || 'London',
      addr: addr, price: price, beds: parseFloat(g('a-beds')) || 0, baths: parseFloat(g('a-baths')) || 1,
      parking: parseInt(g('a-parking'), 10) || 0, pets: g('a-pets') === 'Pets OK',
      img: draftImg || 'https://images.unsplash.com/photo-1560448204-e02f11c3d0e2?auto=format&fit=crop&w=800&q=80',
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

/* ============================================================
   LondonRental.ca — Modals
   • Landlord multi-step flow: Services → What's Included → Fees →
     Submit Property form  (Next / Back between popups)
   • Tenant inquiry flow from each listing card
   Both build a pre-filled email to info@londonrental.ca on submit.
   ============================================================ */
(function () {
  const TO = 'info@londonrental.ca';

  /* ---------- tiny inline icons (gold line, currentColor) ---------- */
  const I = {
    megaphone: '<path d="M3 11v2a1 1 0 0 0 1 1h2l4 4V6L6 10H4a1 1 0 0 0-1 1z"/><path d="M14 8a4 4 0 0 1 0 8M14 5a7 7 0 0 1 0 14"/>',
    target: '<circle cx="12" cy="12" r="8"/><circle cx="12" cy="12" r="4"/><circle cx="12" cy="12" r="1"/>',
    briefcase: '<rect x="3" y="7" width="18" height="13" rx="2"/><path d="M8 7V5a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2M3 13h18"/>',
    camera: '<rect x="2.5" y="6" width="19" height="13" rx="2"/><circle cx="12" cy="12.5" r="3.3"/><path d="M8 6l1.5-2h5L16 6"/>',
    inbox: '<path d="M4 13l2.5 5h11L20 13M4 13V6a2 2 0 0 1 2-2h12a2 2 0 0 1 2 2v7M4 13h4l1.5 2h5L16 13h4"/>',
    calendar: '<rect x="3" y="4.5" width="18" height="16" rx="2"/><path d="M3 9h18M8 2.5v4M16 2.5v4"/>',
    folder: '<path d="M3 7a2 2 0 0 1 2-2h4l2 2h8a2 2 0 0 1 2 2v8a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/>',
    money: '<rect x="2.5" y="6" width="19" height="12" rx="2"/><circle cx="12" cy="12" r="2.6"/><path d="M6 9.5v5M18 9.5v5"/>',
    lock: '<rect x="5" y="11" width="14" height="9" rx="2"/><path d="M8 11V8a4 4 0 0 1 8 0v3"/>',
    check: '<path d="M5 13l4 4L19 7"/>',
  };
  function svg(name, size) {
    size = size || 20;
    return '<svg width="' + size + '" height="' + size + '" viewBox="0 0 24 24" fill="none" stroke="currentColor" ' +
      'stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round">' + I[name] + '</svg>';
  }
  const esc = (s) => String(s == null ? '' : s).replace(/[&<>"]/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]));

  /* ---------- scrim + dialog scaffold ---------- */
  const scrim = document.createElement('div');
  scrim.className = 'lr-scrim';
  scrim.innerHTML = '<div class="lr-dialog" role="dialog" aria-modal="true"></div>';
  document.body.appendChild(scrim);
  const dialog = scrim.querySelector('.lr-dialog');

  function openScrim() {
    scrim.classList.add('open');
    document.body.style.overflow = 'hidden';
    dialog.scrollTop = 0;
  }
  function closeModal() {
    scrim.classList.remove('open');
    document.body.style.overflow = '';
    dialog.innerHTML = '';
  }
  scrim.addEventListener('click', (e) => { if (e.target === scrim) closeModal(); });
  document.addEventListener('keydown', (e) => { if (e.key === 'Escape' && scrim.classList.contains('open')) closeModal(); });

  function shell(eyebrow, title, wide) {
    dialog.className = 'lr-dialog' + (wide ? ' wide' : '');
    return '<button class="lr-close" aria-label="Close" onclick="LR_close()">' +
      '<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"><path d="M6 6l12 12M18 6L6 18"/></svg></button>' +
      '<div class="lr-head"><span class="eyebrow">' + esc(eyebrow) + '</span><h3>' + esc(title) + '</h3></div>' +
      '<div class="lr-body" id="lr-body"></div>';
  }
  function body() { return dialog.querySelector('#lr-body'); }
  window.LR_close = closeModal;

  function mailto(subject, lines) {
    const b = lines.join('\n');
    window.location.href = 'mailto:' + TO + '?subject=' + encodeURIComponent(subject) + '&body=' + encodeURIComponent(b);
  }

  /* =========================================================
     LANDLORD MULTI-STEP MODAL
     ========================================================= */
  const STEPS = ['Our Services', "What's Included", 'Our Fees', 'Submit Property'];
  let llStep = 1;
  const llForm = { address: '', postal: '', type: 'House', beds: '', baths: '', rent: '', parking: 'No', description: '', name: '', phone: '', email: '' };

  function stepBar(current) {
    let h = '<div class="lr-steps">';
    STEPS.forEach((s, i) => {
      const n = i + 1;
      const cls = n < current ? 'done' : n === current ? 'active' : '';
      h += '<div class="st ' + cls + '"><div class="dot">' + (n < current ? svg('check', 16) : n) + '</div><div class="lbl">' + s + '</div></div>';
      if (i < STEPS.length - 1) h += '<div class="bar ' + (n < current ? 'filled' : '') + '"></div>';
    });
    return h + '</div>';
  }
  function feat(icon, title, desc, gold) {
    return '<div class="lr-feat' + (gold ? ' gold' : '') + '"><span class="fi">' + svg(icon) + '</span>' +
      '<div><h5>' + title + '</h5><p>' + desc + '</p></div></div>';
  }

  function renderLandlord() {
    const el = body();
    let h = stepBar(llStep);

    if (llStep === 1) {
      h += '<div class="lr-step">';
      h += '<p class="lr-lead">LondonRental.ca is the dedicated rental marketplace for <strong>London, Ontario only</strong>. One market means deeper connections, faster results, and truly local service.</p>';
      h += feat('megaphone', 'Massive Local Reach', 'Full promotion on Kijiji, Facebook Marketplace, and student groups 20,000+ strong across London.', true);
      h += feat('target', 'London-Focused Only', '100% of our energy goes to London — your listing gets the attention it deserves.');
      h += feat('briefcase', 'Professional Representation', 'Quality photos, detailed descriptions, and a fast response to every inquiry.');
      h += '<div class="lr-actions"><button class="btn btn-gold grow" onclick="LR_llNext(2)">Next: What\'s Included <span class="arr">→</span></button></div>';
      h += '</div>';
    } else if (llStep === 2) {
      h += '<div class="lr-step">';
      h += '<p class="lr-lead">Here\'s exactly what we handle on your behalf — from the first photo to the signed lease.</p>';
      h += '<div class="lr-inc">' +
        '<div class="cell"><span class="fi">' + svg('camera') + '</span><span>Property Promotion</span></div>' +
        '<div class="cell"><span class="fi">' + svg('inbox') + '</span><span>Handling Inquiries</span></div>' +
        '<div class="cell"><span class="fi">' + svg('calendar') + '</span><span>Scheduling Showings</span></div>' +
        '<div class="cell"><span class="fi">' + svg('folder') + '</span><span>Document Collection</span></div></div>';
      h += '<div class="lr-control-note"><h5>You stay in control</h5><p>Lease signing and rent collection stay with you. You review documents, verify applicants, and collect rent directly.</p></div>';
      h += '<div class="lr-actions"><button class="btn btn-outline" onclick="LR_llNext(1)"><span class="arr" style="transform:rotate(180deg)">→</span> Back</button>' +
        '<button class="btn btn-gold grow" onclick="LR_llNext(3)">Next: Our Fees <span class="arr">→</span></button></div>';
      h += '</div>';
    } else if (llStep === 3) {
      h += '<div class="lr-step">';
      h += '<div class="lr-fee"><div class="big">40%</div><div class="s1">of first month\'s rent</div><div class="s2">One-time fee — only after the lease is signed</div></div>';
      h += feat('money', 'No Money Upfront', 'You pay nothing until the lease is signed and your property is rented. Zero financial risk.');
      h += feat('lock', 'No Hidden Charges', '40% of the first month is all you pay. No monthly fees, no renewal fees, ever.');
      h += '<div class="lr-note"><strong>Example:</strong> If rent is $1,800/month, our one-time fee after signing is <strong>$720</strong>. That\'s it — forever.</div>';
      h += '<div class="lr-actions"><button class="btn btn-outline" onclick="LR_llNext(2)"><span class="arr" style="transform:rotate(180deg)">→</span> Back</button>' +
        '<button class="btn btn-gold grow" onclick="LR_llNext(4)">Submit My Property <span class="arr">→</span></button></div>';
      h += '</div>';
    } else if (llStep === 4) {
      h += '<div class="lr-step">';
      h += '<p class="lr-lead" style="font-size:14px">Fill in your property details. We\'ll review and contact you within 24 hours.</p>';
      h += '<div class="lr-sub-label">Property Details</div>';
      h += '<div class="lr-field"><label>Street Address *</label><input id="f-address" placeholder="e.g. 245 Commissioners Rd W" value="' + esc(llForm.address) + '"></div>';
      h += '<div class="lr-grid2">' +
        '<div><label>Postal Code</label><input id="f-postal" placeholder="N6J 1Y4" value="' + esc(llForm.postal) + '"></div>' +
        '<div><label>Property Type *</label><select id="f-type">' + opts(['House', 'Apartment', 'Condo', 'Townhome', 'Private Room', 'Basement', 'Studio'], llForm.type) + '</select></div>' +
        '<div><label>Bedrooms *</label><select id="f-beds">' + opts(['', 'Studio', '1', '2', '3', '4', '5+'], llForm.beds, 'Select') + '</select></div>' +
        '<div><label>Bathrooms *</label><select id="f-baths">' + opts(['', '1', '1.5', '2', '2.5', '3+'], llForm.baths, 'Select') + '</select></div>' +
        '<div><label>Monthly Rent ($) *</label><input id="f-rent" type="number" placeholder="1800" value="' + esc(llForm.rent) + '"></div>' +
        '<div><label>Parking</label><select id="f-parking">' + opts(['No', 'Yes', 'Street'], llForm.parking) + '</select></div>' +
        '</div>';
      h += '<div class="lr-field"><label>Property Description</label><textarea id="f-description" placeholder="Describe your property…">' + esc(llForm.description) + '</textarea></div>';
      h += '<div class="lr-sub-label" style="margin-top:8px">Your Contact Details</div>';
      h += '<div class="lr-field"><label>Full Name *</label><input id="f-name" placeholder="Your full name" value="' + esc(llForm.name) + '"></div>';
      h += '<div class="lr-grid2">' +
        '<div><label>Phone Number *</label><input id="f-phone" placeholder="519-555-0100" value="' + esc(llForm.phone) + '"></div>' +
        '<div><label>Email Address *</label><input id="f-email" type="email" placeholder="you@email.com" value="' + esc(llForm.email) + '"></div>' +
        '</div>';
      h += '<div class="lr-note">Your submission is sent directly to <strong>' + TO + '</strong>. We\'ll review and contact you within 24 hours.</div>';
      h += '<div class="lr-actions"><button class="btn btn-outline" onclick="LR_llSave();LR_llNext(3)"><span class="arr" style="transform:rotate(180deg)">→</span> Back</button>' +
        '<button class="btn btn-gold grow" onclick="LR_llSubmit()">Submit Property <span class="arr">→</span></button></div>';
      h += '</div>';
    }
    el.innerHTML = h;
  }

  function opts(arr, sel, ph) {
    return arr.map((o) => {
      if (o === '' && ph) return '<option value="" ' + (sel === '' ? 'selected' : '') + '>' + ph + '</option>';
      return '<option' + (o === sel ? ' selected' : '') + '>' + o + '</option>';
    }).join('');
  }

  window.LR_llSave = function () {
    if (!body() || llStep !== 4) return;
    ['address', 'postal', 'type', 'beds', 'baths', 'rent', 'parking', 'description', 'name', 'phone', 'email'].forEach((k) => {
      const f = document.getElementById('f-' + k);
      if (f) llForm[k] = f.value;
    });
  };
  window.LR_llNext = function (n) { if (n === 4 || llStep === 4) LR_llSave(); llStep = n; renderLandlord(); dialog.scrollTop = 0; body().scrollTop = 0; };

  window.LR_llSubmit = function () {
    LR_llSave();
    if (!llForm.address || !llForm.name || !llForm.email) {
      alert('Please fill in your address, name and email so we can reach you.');
      return;
    }
    const lines = [
      'NEW PROPERTY LISTING — LondonRental.ca', '',
      '=========================================',
      '>>  ATTACH YOUR PROPERTY PHOTOS HERE  <<',
      '    (add the photo files to this email before you send it)',
      '=========================================', '',
      'PROPERTY DETAILS',
      'Street Address: ' + llForm.address,
      'Postal Code: ' + (llForm.postal || '—'),
      'Property Type: ' + llForm.type,
      'Bedrooms: ' + (llForm.beds || '—'),
      'Bathrooms: ' + (llForm.baths || '—'),
      'Monthly Rent: $' + (llForm.rent || '—'),
      'Parking: ' + llForm.parking,
      'Description: ' + (llForm.description || '—'), '',
      'CONTACT',
      'Name: ' + llForm.name,
      'Phone: ' + (llForm.phone || '—'),
      'Email: ' + llForm.email,
    ];
    mailto('New Property Listing — ' + llForm.address, lines);
    llConfirm();
  };

  function llConfirm() {
    body().innerHTML = '<div class="lr-done"><div class="ring">' + svg('check', 34) + '</div>' +
      '<h3>Property Submitted!</h3>' +
      '<p>Your details have been prepared as an email to <strong>' + TO + '</strong>.</p>' +
      '<p style="font-weight:700;font-size:15px;color:#C9922A;margin:8px 0 4px">📎 Attach your property photos to that email before you hit send.</p>' +
      '<p style="font-size:13px">Then just hit send in your mail app — we\'ll get back to you within 24 hours.</p>' +
      '<button class="btn btn-gold" style="margin:0 auto" onclick="LR_close()">Done <span class="arr">→</span></button></div>';
  }

  window.LR_openLandlord = function () {
    llStep = 1;
    dialog.innerHTML = shell('For Landlords', 'Welcome to LondonRental.ca');
    openScrim();
    renderLandlord();
  };

  /* =========================================================
     TENANT INQUIRY MODAL
     ========================================================= */
  let inq = null;
  const inqForm = { name: '', email: '', phone: '', people: '1', credit: '', pets: 'No', cars: '0', lease: '12 months', readyFL: 'Yes', message: '' };

  window.LR_openInquiry = function (listing) {
    inq = listing;
    Object.assign(inqForm, { name: '', email: '', phone: '', people: '1', credit: '', pets: 'No', cars: '0', lease: '12 months', readyFL: 'Yes', message: '' });
    dialog.innerHTML = shell('Tenant Inquiry', listing.addr, true);
    openScrim();
    renderInquiry();
  };

  function renderInquiry() {
    const l = inq;
    let h = '<div class="lr-step">';
    h += '<p class="lr-lead" style="font-size:14px">$' + l.price.toLocaleString() + '/mo · ' + l.type + ' · ' + (l.beds === 0 ? 'Studio' : l.beds + ' bed') + ' · ' + l.hood + '. Tell us about yourself and we\'ll be in touch.</p>';
    h += '<div class="lr-grid2">' +
      '<div class="lr-span2"><label>Full Name *</label><input id="i-name"  placeholder="Your full name"></div>' +
      '<div><label>Email *</label><input id="i-email" type="email" placeholder="you@email.com"></div>' +
      '<div><label>Phone</label><input id="i-phone" placeholder="519-555-0100"></div>' +
      '<div><label>Number of People</label><select id="i-people">' + opts(['1', '2', '3', '4', '5+'], '1') + '</select></div>' +
      '<div><label>Credit Score</label><select id="i-credit">' + opts(['', 'Below 600', '600–650', '650–700', '700–750', '750–800', '800+'], '', 'Select range') + '</select></div>' +
      '<div><label>Pets?</label><select id="i-pets">' + opts(['No', 'Yes - Cat', 'Yes - Dog', 'Yes - Other'], 'No') + '</select></div>' +
      '<div><label>Number of Cars</label><select id="i-cars">' + opts(['0', '1', '2', '3+'], '0') + '</select></div>' +
      '<div class="lr-span2"><label>Lease Length</label><select id="i-lease">' + opts(['12 months', '18 months', '24 months', 'Month-to-month (after 1yr)'], '12 months') + '</select></div>' +
      '</div>';
    h += '<div class="lr-field"><label>Ready to pay First + Last upfront after signing?</label><div class="lr-chiprow" id="i-fl">' +
      ['Yes', 'No', 'Need to Discuss'].map((o) => '<div class="c' + (o === 'Yes' ? ' on' : '') + '" data-fl="' + o + '">' + o + '</div>').join('') + '</div></div>';
    h += '<div class="lr-field"><label>Message / Additional Info</label><textarea id="i-message" placeholder="Any questions about the property…"></textarea></div>';
    h += '<div class="lr-note">Sent to <strong>' + TO + '</strong> with subject: <em>' + esc(l.addr) + '</em></div>';
    h += '<div class="lr-actions"><button class="btn btn-gold grow" onclick="LR_inqSubmit()">Send Inquiry <span class="arr">→</span></button></div>';
    h += '</div>';
    body().innerHTML = h;

    body().querySelector('#i-fl').addEventListener('click', (e) => {
      const c = e.target.closest('[data-fl]');
      if (!c) return;
      body().querySelectorAll('#i-fl .c').forEach((x) => x.classList.remove('on'));
      c.classList.add('on');
      inqForm.readyFL = c.dataset.fl;
    });
  }

  window.LR_inqSubmit = function () {
    ['name', 'email', 'phone', 'people', 'credit', 'pets', 'cars', 'lease', 'message'].forEach((k) => {
      const f = document.getElementById('i-' + k);
      if (f) inqForm[k] = f.value;
    });
    if (!inqForm.name || !inqForm.email) {
      alert('Please add your name and email so we can reach you.');
      return;
    }
    const l = inq;
    const lines = [
      'TENANT INQUIRY — LondonRental.ca', '',
      'PROPERTY: ' + l.addr + ' · ' + l.hood,
      'Listing: ' + l.title + ' — $' + l.price.toLocaleString() + '/mo · ' + l.type, '',
      'APPLICANT',
      'Name: ' + inqForm.name,
      'Email: ' + inqForm.email,
      'Phone: ' + (inqForm.phone || '—'),
      'Number of People: ' + inqForm.people,
      'Credit Score: ' + (inqForm.credit || '—'),
      'Pets: ' + inqForm.pets,
      'Cars: ' + inqForm.cars,
      'Lease Length: ' + inqForm.lease,
      'Ready for First + Last: ' + inqForm.readyFL,
      'Message: ' + (inqForm.message || '—'),
    ];
    mailto('Rental Inquiry — ' + l.addr, lines);
    body().innerHTML = '<div class="lr-done"><div class="ring">' + svg('check', 34) + '</div>' +
      '<h3>Inquiry Sent!</h3>' +
      '<p>Your inquiry for <strong>' + esc(l.addr) + '</strong> has been prepared as an email to <strong>' + TO + '</strong>.<br>Just hit send in your mail app — we\'ll be in touch shortly!</p>' +
      '<button class="btn btn-gold" style="margin:0 auto" onclick="LR_close()">Close</button></div>';
  };

  /* =========================================================
     LISTING DETAIL MODAL (with map)
     ========================================================= */
  const TYPE_COLOR = { House: '#C9922A', Apartment: '#5B8DEE', Condo: '#9B59B6', Townhome: '#1ABC9C', 'Private Room': '#E07A5F', Basement: '#7D8FB3' };
  const DI = {
    bed: '<path d="M3 18v-6a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2v6M3 14h18M3 18v2M21 18v2M7 10V8a1 1 0 0 1 1-1h3v3"/>',
    bath: '<path d="M4 12V6a2 2 0 0 1 3.5-1.3M3 12h18v2a4 4 0 0 1-4 4H7a4 4 0 0 1-4-4zM6 18l-1 2M18 18l1 2M7 6h.01"/>',
    car: '<path d="M5 13l1.5-4.5A2 2 0 0 1 8.4 7h7.2a2 2 0 0 1 1.9 1.5L19 13M5 13h14v4H5zM7 17v1.5M17 17v1.5M7.5 14.5h.01M16.5 14.5h.01"/>',
    paw: '<circle cx="6.5" cy="9" r="1.6"/><circle cx="11" cy="6.5" r="1.6"/><circle cx="16" cy="7.5" r="1.6"/><path d="M8 16c0-2.2 1.8-4 4-4s4 1.8 4 4c0 1.6-1.4 2.5-4 2.5S8 17.6 8 16z"/>',
  };
  function chip(icon, label) {
    return '<span class="lr-d-chip"><svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.7" stroke-linecap="round" stroke-linejoin="round">' + DI[icon] + '</svg>' + label + '</span>';
  }

  let activeMediaIndex = 0;
  let detailMedia = [];
  
  window.LR_galleryGo = function(idx) {
    if (!detailMedia.length) return;
    activeMediaIndex = (idx + detailMedia.length) % detailMedia.length;
    const g = dialog.querySelector('.lr-d-gallery');
    if (!g) return;
    g.querySelectorAll('video').forEach(v => { v.pause(); v.classList.remove('active'); });
    g.querySelectorAll('img').forEach(i => i.classList.remove('active'));
    g.querySelectorAll('.dot').forEach(d => d.classList.remove('active'));
    
    const m = detailMedia[activeMediaIndex];
    if (m.type === 'video') {
      const v = document.getElementById('g-vid-' + activeMediaIndex);
      if (v) { v.classList.add('active'); v.play().catch(e=>{}); }
    } else {
      const i = document.getElementById('g-img-' + activeMediaIndex);
      if (i) i.classList.add('active');
    }
    const c = document.getElementById('g-count');
    if (c) c.textContent = activeMediaIndex + 1;
    const dots = g.querySelectorAll('.dot');
    if (dots[activeMediaIndex]) dots[activeMediaIndex].classList.add('active');
  };
  window.LR_galleryNav = function(dir) { LR_galleryGo(activeMediaIndex + dir); };

  window.LR_openDetail = function (l) {
    const rented = l.status === 'Rented';
    const dot = TYPE_COLOR[l.type] || '#C9922A';
    const beds = l.beds === 0 ? 'Studio' : l.beds + ' Bed' + (l.beds > 1 ? 's' : '');
    const mapQ = encodeURIComponent(l.addr + ', London, Ontario, Canada');
    detailMedia = window.LR_Store ? LR_Store.getMedia(l) : [];
    activeMediaIndex = 0;
    
    let galleryHtml = '<div class="lr-d-gallery" style="background:var(--navy-600)"></div>';
    if (detailMedia.length > 0) {
      galleryHtml = '<div class="lr-d-gallery">';
      detailMedia.forEach((m, i) => {
        if (m.type === 'video') {
          galleryHtml += '<video id="g-vid-' + i + '" src="' + esc(m.src) + '" class="' + (i === 0 ? 'active' : '') + '" controls muted playsinline></video>';
        } else {
          galleryHtml += '<img id="g-img-' + i + '" src="' + esc(m.src) + '" class="' + (i === 0 ? 'active' : '') + '" alt="" onerror="this.style.display=\'none\'">';
        }
      });
      if (detailMedia.length > 1) {
        galleryHtml += '<button class="lr-d-nav prev" onclick="LR_galleryNav(-1)"><svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round"><path d="M15 18l-6-6 6-6"/></svg></button>';
        galleryHtml += '<button class="lr-d-nav next" onclick="LR_galleryNav(1)"><svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round"><path d="M9 18l6-6-6-6"/></svg></button>';
        galleryHtml += '<div class="lr-d-counter"><span id="g-count">1</span> / ' + detailMedia.length + '</div>';
        galleryHtml += '<div class="lr-d-dots">';
        detailMedia.forEach((m, i) => {
          galleryHtml += '<button class="dot ' + (i === 0 ? 'active' : '') + '" onclick="LR_galleryGo(' + i + ')"></button>';
        });
        galleryHtml += '</div>';
      }
      galleryHtml += '</div>';
    }

    dialog.className = 'lr-dialog wide';
    dialog.innerHTML =
      '<button class="lr-close" aria-label="Close" onclick="LR_close()"><svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"><path d="M6 6l12 12M18 6L6 18"/></svg></button>' +
      '<div class="lr-d-hero">' + galleryHtml +
        '<div class="lr-d-pills"><span class="lr-d-type"><span class="dot" style="background:' + dot + '"></span>' + esc(l.type) + '</span>' +
        '<span class="lr-d-status ' + (rented ? 'rented' : '') + '">' + esc(l.status) + '</span></div>' +
        '<div class="lr-d-price">$' + Number(l.price).toLocaleString() + '<span> /mo</span></div></div>' +
      '<div class="lr-body">' +
        '<h3 class="lr-d-title">' + esc(l.title) + '</h3>' +
        '<div class="lr-d-addr"><svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.7" stroke-linecap="round" stroke-linejoin="round"><path d="M12 21s7-6.2 7-11a7 7 0 0 0-14 0c0 4.8 7 11 7 11z"/><circle cx="12" cy="10" r="2.5"/></svg>' + esc(l.addr) + ' · ' + esc(l.hood) + '</div>' +
        '<div class="lr-d-chips">' + chip('bed', beds) + chip('bath', l.baths + ' Bath') + chip('car', l.parking + ' Parking') + chip('paw', l.pets ? 'Pets OK' : 'No Pets') + '</div>' +
        (l.desc ? '<div class="lr-d-sec"><div class="lr-sub-label">About this property</div><p class="lr-d-desc">' + esc(l.desc) + '</p></div>' : '') +
        '<div class="lr-d-sec"><div class="lr-sub-label">Location</div>' +
          '<div class="lr-map-wrap"><iframe class="lr-map" loading="lazy" referrerpolicy="no-referrer-when-downgrade" src="https://www.google.com/maps?q=' + mapQ + '&z=15&output=embed"></iframe></div>' +
          '<a class="lr-map-link" href="https://www.google.com/maps/search/?api=1&query=' + mapQ + '" target="_blank" rel="noopener">Open in Google Maps →</a></div>' +
        '<div class="lr-actions" style="margin-top:18px">' +
          (rented
            ? '<button class="btn btn-ghost grow" disabled>This property is rented</button>'
            : '<button class="btn btn-gold grow" onclick="LR_detailInquire()">Inquire About This Property <span class="arr">→</span></button>') +
        '</div>' +
      '</div>';
    detailListing = l;
    openScrim();
  };
  let detailListing = null;
  window.LR_detailInquire = function () { const l = detailListing; if (l) LR_openInquiry(l); };

  /* ---------- wire all landlord triggers ---------- */
  document.addEventListener('click', (e) => {
    const t = e.target.closest('[data-landlord]');
    if (t) { e.preventDefault(); LR_openLandlord(); }
  });
})();

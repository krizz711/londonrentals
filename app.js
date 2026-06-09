/* ============================================================
   LondonRental.ca — data, listings, filters, nav
   Listings persist in localStorage so the Admin panel can
   add / edit / delete them. Public grid renders from there.
   ============================================================ */
(function () {
  const STORE_KEY = 'lr_listings_v1';

  const DEFAULTS = [
    { type: 'House', price: 3200, status: 'Available', title: '5-Bedroom Student House', hood: 'Near Western University', addr: '12 Wharncliffe Rd N', beds: 5, baths: 2, parking: 4, pets: true, desc: 'A spacious five-bedroom student house steps from Western University. Bright, well-kept rooms, two full bathrooms, a large shared kitchen and a private driveway with parking for four. Ideal for a group of students looking to live close to campus.', img: 'https://images.unsplash.com/photo-1568605114967-8130f3a36994?auto=format&fit=crop&w=800&q=80' },
    { type: 'Condo', price: 1650, status: 'Available', title: 'Downtown Loft Condo', hood: 'Downtown · Richmond Row', addr: '88 Richmond St', beds: 1, baths: 1, parking: 1, pets: false, desc: 'Stylish one-bedroom loft in the heart of Richmond Row. Floor-to-ceiling windows, exposed finishes, in-suite laundry and one underground parking spot. Walk to restaurants, cafés and transit.', img: 'https://images.unsplash.com/photo-1502672260266-1c1ef2d93688?auto=format&fit=crop&w=800&q=80' },
    { type: 'Apartment', price: 1850, status: 'Available', title: 'Bright 2-Bed Apartment', hood: 'Westmount', addr: '245 Commissioners Rd W', beds: 2, baths: 1, parking: 1, pets: true, desc: 'A sunny two-bedroom apartment in quiet Westmount. Updated kitchen, generous closets, and a balcony with west-facing views. Pet-friendly building close to shopping and parks.', img: 'https://images.unsplash.com/photo-1522708323590-d24dbb6b0267?auto=format&fit=crop&w=800&q=80' },
    { type: 'Townhome', price: 2400, status: 'Available', title: 'Modern 3-Bed Townhome', hood: 'Byron', addr: '410 Wonderland Rd S', beds: 3, baths: 2.5, parking: 2, pets: true, desc: 'Contemporary three-bedroom townhome in family-friendly Byron. Open-concept main floor, 2.5 baths, attached garage and a fenced backyard. Close to trails, schools and the Westmount shopping district.', img: 'https://images.unsplash.com/photo-1576941089067-2de3c901e126?auto=format&fit=crop&w=800&q=80' },
    { type: 'Apartment', price: 1400, status: 'Rented', title: 'Heritage Studio Suite', hood: 'Old North', addr: '75 Ann St', beds: 0, baths: 1, parking: 0, pets: false, desc: 'A charming heritage studio in historic Old North. Original character details, a renovated bathroom and a compact kitchenette. Walkable to downtown and the university.', img: 'https://images.unsplash.com/photo-1493809842364-78817add7ffb?auto=format&fit=crop&w=800&q=80' },
    { type: 'Condo', price: 2100, status: 'Available', title: 'Riverside 2-Bed Condo', hood: 'Masonville', addr: '330 Oxford St E', beds: 2, baths: 2, parking: 1, pets: false, desc: 'A bright two-bedroom, two-bath condo near Masonville Place. In-suite laundry, a private balcony, secure entry and one parking spot. Steps from shopping, dining and bus routes.', img: 'https://images.unsplash.com/photo-1545324418-cc1a3fa10c00?auto=format&fit=crop&w=800&q=80' },
    { type: 'House', price: 2750, status: 'Available', title: 'Family Home with Yard', hood: 'Wortley Village', addr: '18 Bruce St', beds: 4, baths: 2, parking: 2, pets: true, desc: 'A warm four-bedroom family home in beloved Wortley Village. Hardwood floors, a renovated kitchen, two full baths and a large fenced yard. Pet-friendly and walkable to the village shops.', img: 'https://images.unsplash.com/photo-1570129477492-45c003edd2be?auto=format&fit=crop&w=800&q=80' },
    { type: 'Townhome', price: 2250, status: 'Rented', title: 'Hyde Park Townhome', hood: 'Hyde Park', addr: '92 Gainsborough Rd', beds: 3, baths: 2, parking: 2, pets: true, desc: 'A move-in-ready three-bedroom townhome in Hyde Park. Modern finishes, two baths, an attached garage and visitor parking. Minutes from big-box shopping and the 402.', img: 'https://images.unsplash.com/photo-1600585154340-be6161a56a0c?auto=format&fit=crop&w=800&q=80' },
    { type: 'Apartment', price: 1550, status: 'Available', title: 'Cozy 1-Bed near Fanshawe', hood: 'Whitehills', addr: '501 Huron St', beds: 1, baths: 1, parking: 1, pets: false, desc: 'A cozy one-bedroom apartment a short ride from Fanshawe College. Clean, efficient layout, on-site laundry and one parking spot. Great first rental for a student or young professional.', img: 'https://images.unsplash.com/photo-1560448204-e02f11c3d0e2?auto=format&fit=crop&w=800&q=80' },
  ];

  const TYPE_COLOR = { House: '#C9922A', Apartment: '#5B8DEE', Condo: '#9B59B6', Townhome: '#1ABC9C', 'Private Room': '#E07A5F', Basement: '#7D8FB3' };

  /* keep Available listings on top, Rented sink to the bottom (stable) */
  function sortList(l) {
    return l.slice().sort((a, b) => (a.status === 'Rented' ? 1 : 0) - (b.status === 'Rented' ? 1 : 0));
  }

  /* ---------- store ---------- */
  function load() {
    try { const raw = localStorage.getItem(STORE_KEY); if (raw) return sortList(JSON.parse(raw)); } catch (e) {}
    return sortList(DEFAULTS.map((d) => Object.assign({}, d)));
  }
  function save(list) { try { localStorage.setItem(STORE_KEY, JSON.stringify(sortList(list))); } catch (e) {} }

  const Store = {
    all() { return load(); },
    add(item) { const l = load(); l.unshift(item); save(l); render(); },
    update(i, item) { const l = load(); l[i] = item; save(l); render(); },
    remove(i) { const l = load(); l.splice(i, 1); save(l); render(); },
    reset() { save(DEFAULTS.map((d) => Object.assign({}, d))); render(); },
    typeColor: TYPE_COLOR,
  };
  window.LR_Store = Store;

  /* ---------- icons for meta row ---------- */
  const META = {
    bed: '<svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.7" stroke-linecap="round" stroke-linejoin="round"><path d="M3 18v-6a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2v6M3 14h18M3 18v2M21 18v2M7 10V8a1 1 0 0 1 1-1h3v3"/></svg>',
    bath: '<svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.7" stroke-linecap="round" stroke-linejoin="round"><path d="M4 12V6a2 2 0 0 1 3.5-1.3M3 12h18v2a4 4 0 0 1-4 4H7a4 4 0 0 1-4-4zM6 18l-1 2M18 18l1 2M7 6h.01"/></svg>',
    car: '<svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.7" stroke-linecap="round" stroke-linejoin="round"><path d="M5 13l1.5-4.5A2 2 0 0 1 8.4 7h7.2a2 2 0 0 1 1.9 1.5L19 13M5 13h14v4H5zM7 17v1.5M17 17v1.5M7.5 14.5h.01M16.5 14.5h.01"/></svg>',
    paw: '<svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.7" stroke-linecap="round" stroke-linejoin="round"><circle cx="6.5" cy="9" r="1.6"/><circle cx="11" cy="6.5" r="1.6"/><circle cx="16" cy="7.5" r="1.6"/><path d="M8 16c0-2.2 1.8-4 4-4s4 1.8 4 4c0 1.6-1.4 2.5-4 2.5S8 17.6 8 16z"/></svg>',
  };

  function bedLabel(n) { return n === 0 ? 'Studio' : n + ' Bed'; }

  function listingHTML(l, idx) {
    const dot = TYPE_COLOR[l.type] || '#C9922A';
    const rented = l.status === 'Rented';
    const fallback = 'linear-gradient(150deg,#112847,#091520)';
    return '' +
      '<article class="listing" data-type="' + l.type + '">' +
        '<div class="ph">' +
          '<img src="' + l.img + '" alt="' + l.title + '" loading="lazy" onerror="this.style.display=\'none\';this.parentElement.style.background=\'' + fallback + '\'" />' +
          '<div class="scrim"></div>' +
          '<div class="type-pill"><span class="dot" style="background:' + dot + '"></span>' + l.type + '</div>' +
          '<div class="status-pill ' + (rented ? 'rented' : '') + '">' + l.status + '</div>' +
        '</div>' +
        '<div class="body">' +
          '<div class="price">$' + Number(l.price).toLocaleString() + '<span> /mo</span></div>' +
          '<h4>' + l.title + '</h4>' +
          '<div class="addr"><svg width="13" height="13" fill="none" stroke="#8A9AB5" stroke-width="1.6"><path d="M6.5 1.2C4 1.2 2 3.1 2 5.5c0 3 4.5 6.3 4.5 6.3S11 8.5 11 5.5C11 3.1 9 1.2 6.5 1.2z"/><circle cx="6.5" cy="5.4" r="1.4"/></svg>' + l.addr + ' · ' + l.hood + '</div>' +
          (l.desc ? '<p class="ldesc">' + l.desc + '</p>' : '') +
          '<div class="meta">' +
            '<span>' + META.bed + bedLabel(l.beds) + '</span>' +
            '<span>' + META.bath + l.baths + ' Bath</span>' +
            '<span>' + META.car + l.parking + ' Park</span>' +
            '<span>' + META.paw + (l.pets ? 'Pets OK' : 'No Pets') + '</span>' +
          '</div>' +
          '<div class="listing-acts">' +
            '<button class="btn btn-ghost listing-cta" data-detail="' + idx + '">View Details</button>' +
            '<button class="btn ' + (rented ? 'btn-ghost' : 'btn-outline') + ' listing-cta" data-inquire="' + idx + '" ' + (rented ? 'disabled' : '') + '>' +
              (rented ? 'Rented' : 'Inquire <span class="arr">→</span>') +
            '</button>' +
          '</div>' +
        '</div>' +
      '</article>';
  }

  const grid = document.getElementById('list-grid');
  let current = [];

  function activeFilter() {
    const a = document.querySelector('#filters .chip.active');
    return a ? a.dataset.filter : 'All';
  }

  function render() {
    current = Store.all();
    if (!grid) return;
    grid.innerHTML = current.map(listingHTML).join('');
    applyFilter(activeFilter());
    if (window.LR_FX && window.LR_FX.refresh) window.LR_FX.refresh();
    if (window.LR_renderAdmin) window.LR_renderAdmin();
  }
  window.LR_render = render;

  function applyFilter(f) {
    if (!grid) return;
    grid.querySelectorAll('.listing').forEach((card) => {
      card.style.display = (f === 'All' || card.dataset.type === f) ? '' : 'none';
    });
  }

  if (grid) {
    grid.addEventListener('click', (e) => {
      const inq = e.target.closest('[data-inquire]');
      if (inq && !inq.disabled) {
        e.stopPropagation();
        const l = current[+inq.dataset.inquire];
        if (l && window.LR_openInquiry) window.LR_openInquiry(l);
        return;
      }
      const det = e.target.closest('[data-detail]');
      const card = e.target.closest('.listing');
      const idx = det ? +det.dataset.detail : (card ? [...grid.children].indexOf(card) : -1);
      if (idx >= 0 && current[idx] && window.LR_openDetail) window.LR_openDetail(current[idx]);
    });
  }

  const filterRow = document.getElementById('filters');
  if (filterRow) {
    filterRow.addEventListener('click', (e) => {
      const btn = e.target.closest('.chip');
      if (!btn) return;
      filterRow.querySelectorAll('.chip').forEach((c) => c.classList.remove('active'));
      btn.classList.add('active');
      applyFilter(btn.dataset.filter);
    });
  }

  /* ---------- nav scroll state ---------- */
  const nav = document.getElementById('nav');
  let ticking = false;
  window.addEventListener('scroll', () => {
    if (ticking) return; ticking = true;
    requestAnimationFrame(() => {
      if (window.scrollY > 40) nav.classList.add('scrolled'); else nav.classList.remove('scrolled');
      ticking = false;
    });
  }, { passive: true });

  /* ---------- mobile nav drawer ---------- */
  const navToggle = document.getElementById('navToggle');
  const navLinks = document.getElementById('navLinks');
  const navBackdrop = document.getElementById('navBackdrop');
  function setMenu(open) {
    if (!navLinks) return;
    navLinks.classList.toggle('open', open);
    navBackdrop.classList.toggle('open', open);
    navToggle.classList.toggle('open', open);
    navToggle.setAttribute('aria-expanded', open ? 'true' : 'false');
    document.body.style.overflow = open ? 'hidden' : '';
  }
  if (navToggle && navLinks) {
    navToggle.addEventListener('click', () => setMenu(!navLinks.classList.contains('open')));
    navBackdrop.addEventListener('click', () => setMenu(false));
    navLinks.querySelectorAll('a').forEach((a) => a.addEventListener('click', () => setMenu(false)));
    window.addEventListener('keydown', (e) => { if (e.key === 'Escape') setMenu(false); });
    window.addEventListener('resize', () => { if (window.innerWidth > 840) setMenu(false); });
  }

  /* ---------- count-up (called by fx reveals) ---------- */
  window.LR_countUp = function (el) {
    if (el.dataset.done) return; el.dataset.done = '1';
    const target = parseFloat(el.dataset.count); const suffix = el.dataset.suffix || '';
    const start = performance.now(); const dur = 1300;
    function tick(now) {
      const t = Math.min(1, (now - start) / dur);
      const e = 1 - Math.pow(1 - t, 3);
      el.textContent = Math.round(target * e) + suffix;
      if (t < 1) requestAnimationFrame(tick);
    }
    requestAnimationFrame(tick);
  };

  render();
})();

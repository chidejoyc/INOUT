// Business dashboard behaviors and CRUD using localStorage
(function(){
  // Utility helpers
  function getUser(){
    return JSON.parse(localStorage.getItem('inout_user') || 'null');
  }

  function saveUser(user){
    if(!user) return;
    // Update session
    const sessionUser = { ...user };
    delete sessionUser.password;
    localStorage.setItem('inout_user', JSON.stringify(sessionUser));

    // Update users store
    const users = JSON.parse(localStorage.getItem('inout_users') || '[]');
    const idx = users.findIndex(u => u.id === user.id);
    if(idx !== -1){
      users[idx] = { ...user, password: users[idx].password };
    } else {
      users.push(user);
    }
    localStorage.setItem('inout_users', JSON.stringify(users));

    // Refresh header + auth UI
    if(window.authInit) window.authInit();
  }

  function ensureArrays(user){
    if(!user.services) user.services = [];
    if(!user.prices) user.prices = {};
    if(!user.photos) user.photos = [];
    if(!user.openingHours) user.openingHours = {};
    if(!user.requests) user.requests = [];
    if(!user.bookings) user.bookings = [];
    if(!user.messages) user.messages = [];
    if(!user.reviews) user.reviews = [];
    if(!user.notifications) user.notifications = [];
  }

  // Render welcome banner (insert above main content sections)
  function renderWelcome(){
    const user = getUser();
    if(!user) return;
    const main = document.querySelector('.main-content');
    if(!main) return;

    // remove existing if present
    const existing = document.getElementById('bizWelcome');
    if(existing) existing.remove();

    const banner = document.createElement('div');
    banner.id = 'bizWelcome';
    banner.className = 'item-card';
    banner.style.marginBottom = '18px';
    banner.innerHTML = `
      <div style="display:flex;flex-direction:column">
        <div style="font-size:18px;font-weight:700">Welcome, ${escapeHtml(user.businessName || user.ownerName || user.email || '')}</div>
        <div class="item-meta">Manage your business profile, services, bookings and messages from here.</div>
      </div>
      <div style="display:flex;gap:8px;align-items:center">
        <button id="completeProfileCTA" class="btn primary">Complete Profile</button>
        <button id="viewProfileBtn" class="btn ghost">View Profile</button>
      </div>
    `;

    // insert at top of main-content (before first section)
    const firstSection = main.querySelector('.section');
    if(firstSection) main.insertBefore(banner, firstSection);

    // Hook buttons
    document.getElementById('completeProfileCTA').addEventListener('click', ()=>{
      // jump to profile section
      document.querySelectorAll('.section').forEach(s=>s.classList.remove('active'));
      const s = document.getElementById('profile');
      if(s) s.classList.add('active');
      // highlight nav
      document.querySelectorAll('.nav-item').forEach(n=>n.classList.remove('active'));
      const nav = document.querySelector('.nav-item[data-section="profile"]');
      if(nav) nav.classList.add('active');
      window.scrollTo({top:0,behavior:'smooth'});
    });

    document.getElementById('viewProfileBtn').addEventListener('click', ()=>{
      // simple focus on profile form
      const el = document.getElementById('bizName');
      if(el) el.focus();
    });
  }

  // Show complete profile card only if important fields are missing
  function checkProfileCompletion(){
    const user = getUser();
    if(!user) return;
    ensureArrays(user);

    const required = [ 'businessName', 'category', 'phone' ];
    const missing = required.filter(k => !user[k] || (typeof user[k] === 'string' && user[k].trim() === ''));
    const addrMissing = !(user.location && user.location.address && user.location.address.trim());
    const hasService = (user.services && user.services.length > 0);

    if(missing.length || addrMissing || !hasService){
      // ensure the welcome banner exists and shows CTA (renderWelcome already shows)
      renderWelcome();

      // insert a detailed 'Complete your profile' card below banner if not present
      const existing = document.getElementById('completeProfileCard');
      if(existing) return;

      const main = document.querySelector('.main-content');
      const card = document.createElement('div');
      card.id = 'completeProfileCard';
      card.className = 'item-card';
      card.style.marginBottom = '18px';
      card.innerHTML = `
        <div style="flex:1">
          <h4 style="margin:0 0 6px">Complete your business profile</h4>
          <p class="muted" style="margin:0">Your profile is missing the following: ${missing.concat(addrMissing?['address']:[]).concat(!hasService?['services']:[]).join(', ') || '—'}. Customers are more likely to book businesses with complete profiles.</p>
        </div>
        <div style="display:flex;flex-direction:column;gap:8px">
          <button id="completeProfileBtn" class="btn primary">Complete Profile</button>
          <button id="addServiceQuick" class="btn ghost">Add Service</button>
        </div>
      `;
      const ref = document.getElementById('profile');
      if(ref) ref.parentNode.insertBefore(card, ref);

      document.getElementById('completeProfileBtn').addEventListener('click', ()=>{
        document.querySelectorAll('.section').forEach(s=>s.classList.remove('active'));
        document.getElementById('profile').classList.add('active');
        document.querySelectorAll('.nav-item').forEach(n=>n.classList.remove('active'));
        document.querySelector('.nav-item[data-section="profile"]').classList.add('active');
      });

      document.getElementById('addServiceQuick').addEventListener('click', ()=>{
        document.querySelectorAll('.section').forEach(s=>s.classList.remove('active'));
        document.getElementById('services').classList.add('active');
        document.querySelectorAll('.nav-item').forEach(n=>n.classList.remove('active'));
        document.querySelector('.nav-item[data-section="services"]').classList.add('active');
      });
    } else {
      // remove card if it exists
      const existing = document.getElementById('completeProfileCard');
      if(existing) existing.remove();
    }
  }

  // Services CRUD
  function renderServices(){
    const user = getUser();
    if(!user) return;
    ensureArrays(user);
    const el = document.getElementById('servicesList');
    if(!el) return;
    el.innerHTML = '';
    if(user.services.length === 0){
      el.innerHTML = '<p class="muted">You have not added any services yet.</p>';
      return;
    }
    user.services.forEach(svc=>{
      const card = document.createElement('div');
      card.className = 'item-card';
      card.innerHTML = `
        <div style="display:flex;flex-direction:column">
          <div style="font-weight:600">${escapeHtml(svc.title)}</div>
          <div class="item-meta">${escapeHtml(svc.description||'')}</div>
        </div>
        <div style="display:flex;gap:8px">
          <button class="btn ghost edit-service" data-id="${svc.id}">Edit</button>
          <button class="btn danger delete-service" data-id="${svc.id}">Delete</button>
        </div>
      `;
      el.appendChild(card);
    });

    // bind events
    el.querySelectorAll('.edit-service').forEach(btn=>{
      btn.addEventListener('click', (e)=>{
        const id = btn.dataset.id;
        editService(id);
      });
    });
    el.querySelectorAll('.delete-service').forEach(btn=>{
      btn.addEventListener('click', (e)=>{
        const id = btn.dataset.id;
        if(!confirm('Delete this service?')) return;
        deleteService(id);
      });
    });
  }

  function addService(){
    const user = getUser();
    if(!user) return;
    ensureArrays(user);
    const title = prompt('Service title');
    if(!title) return;
    const description = prompt('Service description (optional)') || '';
    const duration = prompt('Estimated duration in minutes (optional)') || '';
    const svc = { id: 'svc_' + Date.now(), title: title.trim(), description: description.trim(), duration: duration.trim() };
    user.services.push(svc);
    saveUser(user);
    renderServices();
    checkProfileCompletion();
  }

  function editService(id){
    const user = getUser();
    if(!user) return;
    const svc = user.services.find(s=>s.id===id);
    if(!svc) return alert('Service not found');
    const title = prompt('Service title', svc.title);
    if(!title) return;
    const description = prompt('Service description (optional)', svc.description || '') || '';
    const duration = prompt('Estimated duration in minutes (optional)', svc.duration || '') || '';
    svc.title = title.trim();
    svc.description = description.trim();
    svc.duration = duration.trim();
    saveUser(user);
    renderServices();
  }

  function deleteService(id){
    const user = getUser();
    if(!user) return;
    user.services = user.services.filter(s=>s.id!==id);
    // Also remove any prices tied to this service
    if(user.prices && user.prices[id]) delete user.prices[id];
    saveUser(user);
    renderServices();
    renderPrices();
    checkProfileCompletion();
  }

  // Prices management
  function renderPrices(){
    const user = getUser();
    if(!user) return;
    ensureArrays(user);
    const el = document.getElementById('pricesList');
    if(!el) return;
    el.innerHTML = '';
    const svcIds = user.services.map(s=>s.id);
    if(svcIds.length === 0){
      el.innerHTML = '<p class="muted">Add services first to set prices.</p>';
      return;
    }
    const list = document.createElement('div');
    list.style.display = 'grid';
    list.style.gap = '8px';
    svcIds.forEach(id=>{
      const svc = user.services.find(s=>s.id===id);
      const price = user.prices && user.prices[id] ? user.prices[id] : null;
      const row = document.createElement('div');
      row.className = 'item-card';
      row.innerHTML = `
        <div style="display:flex;flex-direction:column">
          <div style="font-weight:600">${escapeHtml(svc.title)}</div>
          <div class="item-meta">${price? (price.currency+' '+price.amount) : 'No price set'}</div>
        </div>
        <div style="display:flex;gap:8px">
          <button class="btn ghost set-price" data-id="${id}">${price? 'Edit' : 'Set'} Price</button>
          ${price? `<button class="btn danger remove-price" data-id="${id}">Remove</button>` : ''}
        </div>
      `;
      list.appendChild(row);
    });
    el.appendChild(list);

    el.querySelectorAll('.set-price').forEach(btn=>{
      btn.addEventListener('click', ()=>{ setPrice(btn.dataset.id); });
    });
    el.querySelectorAll('.remove-price').forEach(btn=>{
      btn.addEventListener('click', ()=>{
        const id = btn.dataset.id;
        const user = getUser();
        if(user.prices && user.prices[id]) delete user.prices[id];
        saveUser(user);
        renderPrices();
      });
    });
  }

  function setPrice(serviceId){
    const user = getUser();
    if(!user) return;
    const svc = user.services.find(s=>s.id===serviceId);
    if(!svc) return alert('Service not found');
    const amount = prompt(`Enter price amount for ${svc.title} (numbers only, e.g. 25.00)`);
    if(!amount) return;
    const currency = prompt('Currency code (e.g. USD)', 'USD') || 'USD';
    if(!user.prices) user.prices = {};
    user.prices[serviceId] = { amount: amount.trim(), currency: currency.trim().toUpperCase() };
    saveUser(user);
    renderPrices();
  }

  // Photos upload and management
  function renderPhotos(){
    const user = getUser();
    if(!user) return;
    ensureArrays(user);
    const el = document.getElementById('photosList');
    if(!el) return;
    el.innerHTML = '';
    if(user.photos.length === 0){
      el.innerHTML = '<p class="muted">No photos uploaded yet.</p>';
      return;
    }
    const gallery = document.createElement('div');
    gallery.style.display = 'grid';
    gallery.style.gridTemplateColumns = 'repeat(auto-fill,minmax(120px,1fr))';
    gallery.style.gap = '8px';
    user.photos.forEach(p=>{
      const box = document.createElement('div');
      box.style.border = '1px solid rgba(15,23,42,0.06)';
      box.style.borderRadius = '8px';
      box.style.overflow = 'hidden';
      box.style.position = 'relative';
      box.innerHTML = `
        <img src="${p.url}" alt="photo" style="width:100%;height:100px;object-fit:cover;display:block">
        <div style="padding:6px;display:flex;gap:6px;justify-content:space-between;align-items:center">
          <small class="muted">${p.caption || ''}</small>
          <div>
            <button class="btn ghost set-logo" data-id="${p.id}">Logo</button>
            <button class="btn danger delete-photo" data-id="${p.id}">Delete</button>
          </div>
        </div>
      `;
      gallery.appendChild(box);
    });
    el.appendChild(gallery);

    el.querySelectorAll('.delete-photo').forEach(btn=>{
      btn.addEventListener('click', ()=>{
        const id = btn.dataset.id;
        const user = getUser();
        user.photos = user.photos.filter(p=>p.id!==id);
        // if logo was this, unset
        if(user.profile && user.profile.avatar && user.profile.avatar === id) user.profile.avatar = null;
        saveUser(user);
        renderPhotos();
      });
    });

    el.querySelectorAll('.set-logo').forEach(btn=>{
      btn.addEventListener('click', ()=>{
        const id = btn.dataset.id;
        const user = getUser();
        if(!user.profile) user.profile = {};
        user.profile.avatar = id;
        saveUser(user);
        alert('Logo updated');
        renderPhotos();
      });
    });
  }

  function handlePhotoUpload(){
    const input = document.getElementById('photoUpload');
    if(!input || !input.files || input.files.length === 0) return alert('Select a photo first');
    const file = input.files[0];
    const reader = new FileReader();
    reader.onload = function(e){
      const dataUrl = e.target.result;
      const user = getUser();
      ensureArrays(user);
      const photo = { id: 'ph_' + Date.now(), url: dataUrl, caption: '', uploadedAt: new Date().toISOString() };
      user.photos.push(photo);
      saveUser(user);
      renderPhotos();
      input.value = '';
    };
    reader.readAsDataURL(file);
  }

  // Opening hours
  function renderOpeningHours(){
    const user = getUser();
    if(!user) return;
    ensureArrays(user);
    const opens = Array.from(document.querySelectorAll('.day-open'));
    const closes = Array.from(document.querySelectorAll('.day-close'));
    const days = ['monday','tuesday','wednesday','thursday','friday','saturday','sunday'];
    opens.forEach((inp, idx)=>{
      const day = days[idx];
      const value = user.openingHours && user.openingHours[day] ? user.openingHours[day] : null;
      if(value){
        inp.value = value.open || '';
        if(closes[idx]) closes[idx].value = value.close || '';
      }
    });
  }

  function saveOpeningHours(e){
    e && e.preventDefault();
    const user = getUser();
    if(!user) return;
    ensureArrays(user);
    const opens = Array.from(document.querySelectorAll('.day-open'));
    const closes = Array.from(document.querySelectorAll('.day-close'));
    const days = ['monday','tuesday','wednesday','thursday','friday','saturday','sunday'];
    days.forEach((day, idx)=>{
      const openVal = opens[idx] ? opens[idx].value : '';
      const closeVal = closes[idx] ? closes[idx].value : '';
      if(openVal || closeVal){
        user.openingHours[day] = { open: openVal, close: closeVal };
      } else {
        // remove if empty
        if(user.openingHours && user.openingHours[day]) delete user.openingHours[day];
      }
    });
    saveUser(user);
    alert('Opening hours saved');
  }

  // Render generic lists with empty states
  function renderRequests(){
    const user = getUser();
    const el = document.getElementById('requestsList');
    if(!el) return;
    ensureArrays(user);
    el.innerHTML = '';
    if(user.requests.length === 0){
      el.innerHTML = '<p class="muted">No customer requests yet.</p>';
      return;
    }
    user.requests.forEach(r=>{
      const node = document.createElement('div');
      node.className = 'item-card';
      node.innerHTML = `
        <div>
          <div style="font-weight:600">${escapeHtml(r.title||'Request')}</div>
          <div class="item-meta">${escapeHtml(r.message||'')}</div>
          <div class="item-meta">Status: ${escapeHtml(r.status||'open')}</div>
        </div>
        <div style="display:flex;gap:8px">
          ${r.status==='open' ? '<button class="btn primary accept-request" data-id="'+r.id+'">Accept</button><button class="btn ghost reject-request" data-id="'+r.id+'">Reject</button>' : ''}
        </div>
      `;
      el.appendChild(node);
    });

    el.querySelectorAll('.accept-request').forEach(btn=>{
      btn.addEventListener('click', ()=>{
        const id = btn.dataset.id; const user = getUser();
        const req = user.requests.find(x=>x.id===id); if(req){ req.status='accepted'; saveUser(user); renderRequests(); }
      });
    });
    el.querySelectorAll('.reject-request').forEach(btn=>{
      btn.addEventListener('click', ()=>{
        const id = btn.dataset.id; const user = getUser();
        const req = user.requests.find(x=>x.id===id); if(req){ req.status='rejected'; saveUser(user); renderRequests(); }
      });
    });
  }

  function renderBookings(){
    const user = getUser();
    const el = document.getElementById('bookingsList');
    if(!el) return;
    ensureArrays(user);
    el.innerHTML = '';
    if(user.bookings.length === 0){
      el.innerHTML = '<p class="muted">No bookings yet.</p>';
      return;
    }
    user.bookings.forEach(b=>{
      const node = document.createElement('div');
      node.className = 'item-card';
      node.innerHTML = `
        <div>
          <div style="font-weight:600">${escapeHtml(b.serviceTitle || 'Booking')}</div>
          <div class="item-meta">${escapeHtml(b.start || '')} - ${escapeHtml(b.status||'')}</div>
        </div>
        <div style="display:flex;gap:8px">
          <button class="btn ghost cancel-booking" data-id="${b.id}">Cancel</button>
        </div>
      `;
      el.appendChild(node);
    });
    el.querySelectorAll('.cancel-booking').forEach(btn=>{
      btn.addEventListener('click', ()=>{
        if(!confirm('Cancel this booking?')) return;
        const id = btn.dataset.id; const user = getUser();
        const b = user.bookings.find(x=>x.id===id); if(b){ b.status='cancelled'; saveUser(user); renderBookings(); }
      });
    });
  }

  function renderMessages(){
    const user = getUser();
    const el = document.getElementById('messagesList');
    if(!el) return;
    ensureArrays(user);
    el.innerHTML = '';
    if(user.messages.length === 0){
      el.innerHTML = '<p class="muted">No messages yet.</p>';
      return;
    }
    user.messages.forEach(m=>{
      const node = document.createElement('div');
      node.className = 'item-card';
      node.innerHTML = `
        <div>
          <div style="font-weight:600">${escapeHtml(m.subject || 'Conversation')}</div>
          <div class="item-meta">${escapeHtml(m.preview || m.body || '')}</div>
        </div>
        <div style="display:flex;gap:8px">
          <button class="btn ghost view-message" data-id="${m.id}">Open</button>
        </div>
      `;
      el.appendChild(node);
    });
    // view-message could open a modal; for now just alert the message
    el.querySelectorAll('.view-message').forEach(btn=>{
      btn.addEventListener('click', ()=>{
        const id = btn.dataset.id; const user = getUser(); const msg = user.messages.find(x=>x.id===id);
        if(msg){ alert((msg.subject?msg.subject+"\n\n":'') + (msg.body||'')); }
      });
    });
  }

  function renderReviews(){
    const user = getUser();
    const el = document.getElementById('reviewsList');
    if(!el) return;
    ensureArrays(user);
    el.innerHTML = '';
    if(user.reviews.length === 0){
      el.innerHTML = '<p class="muted">No reviews yet.</p>';
      return;
    }
    user.reviews.forEach(r=>{
      const node = document.createElement('div');
      node.className = 'item-card';
      node.innerHTML = `
        <div>
          <div style="font-weight:600">${escapeHtml(r.author || 'Customer')} — ${escapeHtml(r.rating || '')}★</div>
          <div class="item-meta">${escapeHtml(r.body || '')}</div>
        </div>
      `;
      el.appendChild(node);
    });
  }

  function renderNotifications(){
    const user = getUser();
    const el = document.getElementById('notificationsList') || document.getElementById('notifications');
    if(!el) return;
    ensureArrays(user);
    // prefer a dedicated list element if present
    const listEl = document.getElementById('notificationsList') || el;
    listEl.innerHTML = '';
    if(user.notifications.length === 0){
      listEl.innerHTML = '<p class="muted">No notifications yet.</p>';
      return;
    }
    user.notifications.forEach(n=>{
      const item = document.createElement('div');
      item.className = 'item-card';
      item.innerHTML = `
        <div>
          <div style="font-weight:600">${escapeHtml(n.title||'Notification')}</div>
          <div class="item-meta">${escapeHtml(n.body||'')}</div>
        </div>
        <div style="display:flex;gap:8px">
          <button class="btn ghost mark-read" data-id="${n.id}">${n.read?'Read':'Mark read'}</button>
        </div>
      `;
      listEl.appendChild(item);
    });
    listEl.querySelectorAll('.mark-read').forEach(btn=>{
      btn.addEventListener('click', ()=>{
        const id = btn.dataset.id; const user = getUser(); const nt = user.notifications.find(x=>x.id===id); if(nt){ nt.read = true; saveUser(user); renderNotifications(); }
      });
    });
  }

  // Helpers
  function escapeHtml(s){ return String(s||'').replace(/[&<>"']/g, function(m){ return ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[m]); }); }

  // Wire up UI actions
  function init(){
    // Ensure user is business
    const user = getUser();
    if(!user) return;
    if(user.accountType !== 'business') return;
    ensureArrays(user);

    // Render welcome and complete profile
    renderWelcome();
    checkProfileCompletion();

    // Services
    const addServiceBtn = document.getElementById('addServiceBtn');
    if(addServiceBtn) addServiceBtn.addEventListener('click', addService);
    renderServices();

    // Prices
    const addPriceBtn = document.getElementById('addPriceBtn');
    if(addPriceBtn) addPriceBtn.addEventListener('click', ()=>{
      // prompt to select service if only one
      const user = getUser();
      if(user.services.length===0) return alert('Add a service first');
      const svc = user.services.length===1 ? user.services[0] : null;
      if(svc){ setPrice(svc.id); } else {
        const sid = prompt('Enter service id to set price. Use the service title exactly as shown on Services list.');
        if(!sid) return;
        // try to find by title
        const s = user.services.find(x=>x.title.toLowerCase()===sid.toLowerCase());
        if(s) setPrice(s.id); else alert('Service not found by title');
      }
    });
    renderPrices();

    // Photos
    const uploadBtn = document.getElementById('uploadPhotoBtn');
    if(uploadBtn) uploadBtn.addEventListener('click', handlePhotoUpload);
    renderPhotos();

    // Opening hours
    const hoursForm = document.getElementById('hoursForm');
    if(hoursForm) hoursForm.addEventListener('submit', saveOpeningHours);
    renderOpeningHours();

    // Requests / bookings / messages / reviews / notifications
    renderRequests();
    renderBookings();
    renderMessages();
    renderReviews();
    renderNotifications();

    // Make sure profile completion updates when profile saved (profile form in page already saves to localStorage)
    const profileForm = document.getElementById('profileForm');
    if(profileForm){
      profileForm.addEventListener('submit', ()=>{
        setTimeout(()=>{ checkProfileCompletion(); renderWelcome(); }, 250);
      });
    }

    const locationForm = document.getElementById('locationForm');
    if(locationForm){
      locationForm.addEventListener('submit', ()=>{ setTimeout(()=>{ checkProfileCompletion(); renderWelcome(); }, 250); });
    }

    // small accessibility: ensure nav links close mobile menus
    document.querySelectorAll('.sidebar-nav a').forEach(a=>a.addEventListener('click', ()=>window.scrollTo({top:0,behavior:'smooth'})));
  }

  // Run on DOM ready
  document.addEventListener('DOMContentLoaded', init);
})();

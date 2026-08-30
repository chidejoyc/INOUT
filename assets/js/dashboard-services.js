// Services management for business dashboard. Keeps services persisted on the user object in localStorage.
(function(){
  // get the active business user (auth helpers set in dashboard)
  function getCurrentUser(){
    try{
      if(window.authGetUser) return window.authGetUser();
      const raw = localStorage.getItem('inout_user');
      return raw ? JSON.parse(raw) : null;
    }catch(e){ return null; }
  }

  function saveUser(updated){
    // update inout_users and inout_user
    const raw = localStorage.getItem('inout_users') || '[]';
    let users = [];
    try{ users = JSON.parse(raw); }catch(e){}
    const idx = users.findIndex(u=>String(u.id)===String(updated.id));
    if(idx !== -1){
      // preserve password if exists in stored users
      const preserved = { ...users[idx], password: users[idx].password };
      users[idx] = { ...updated, password: preserved.password };
    } else {
      users.push(updated);
    }
    localStorage.setItem('inout_users', JSON.stringify(users));
    localStorage.setItem('inout_user', JSON.stringify(updated));
    // notify other tabs
    try{ localStorage.setItem('inout_users_sync', Date.now().toString()); }catch(e){}
  }

  function escapeHtml(s){ return String(s||'').replace(/[&<>\"']/g, function(m){ return ({'&':'&amp;','<':'&lt;','>':'&gt;','\"':'&quot;',"'":'&#39;'}[m]); }); }

  const addServiceBtn = document.getElementById('addServiceBtn');
  const servicesList = document.getElementById('servicesList');

  function renderServices(){
    const current = getCurrentUser();
    if(!current){ if(servicesList) servicesList.innerHTML = '<p class="muted">No services available.</p>'; return; }
    const services = Array.isArray(current.services) ? current.services : [];
    if(!servicesList) return;
    servicesList.innerHTML = '';
    if(services.length === 0){
      servicesList.innerHTML = '<p class="muted">No services added yet.</p>';
      return;
    }
    services.forEach((s, idx)=>{
      const card = document.createElement('div');
      card.className = 'item-card';
      card.innerHTML = `<div class="item-info">
        <h4>${escapeHtml(s.name)}</h4>
        <div class="item-meta">${escapeHtml(s.description||'')}</div>
      </div>
      <div style="display:flex;gap:8px;align-items:center">
        <div class="muted">${(current.currencySymbol||'')}${s.price||''} ${current.currency||''}</div>
        <button class="btn ghost edit" data-idx="${idx}">Edit</button>
        <button class="btn ghost remove" data-idx="${idx}">Remove</button>
      </div>`;
      servicesList.appendChild(card);
    });

    // attach handlers
    servicesList.querySelectorAll('.remove').forEach(btn=>{
      btn.addEventListener('click', ()=>{
        const idx = parseInt(btn.dataset.idx,10);
        if(!confirm('Remove this service?')) return;
        const current = getCurrentUser();
        if(!current) return;
        current.services = current.services || [];
        current.services.splice(idx,1);
        saveUser(current);
        renderServices();
        alert('Service removed.');
      });
    });

    servicesList.querySelectorAll('.edit').forEach(btn=>{
      btn.addEventListener('click', ()=>{
        const idx = parseInt(btn.dataset.idx,10);
        const current = getCurrentUser();
        const s = (current.services || [])[idx];
        if(!s) return;
        const name = prompt('Service name', s.name);
        if(name === null) return;
        const description = prompt('Service description', s.description || '');
        if(description === null) return;
        const price = prompt('Price', s.price || '');
        if(price === null) return;
        current.services[idx] = { name, description, price };
        saveUser(current);
        renderServices();
        alert('Service updated.');
      });
    });
  }

  addServiceBtn && addServiceBtn.addEventListener('click', ()=>{
    const name = prompt('Service name');
    if(!name) return alert('Name required');
    const description = prompt('Service description') || '';
    const price = prompt('Price (numeric)') || '';
    const current = getCurrentUser();
    if(!current) return alert('Unable to find your account.');
    current.services = current.services || [];
    current.services.push({ name, description, price });
    saveUser(current);
    renderServices();
    alert('Service added.');
  });

  document.addEventListener('DOMContentLoaded', renderServices);

  // react to storage changes to keep UI in sync across tabs
  window.addEventListener('storage', (ev)=>{
    if(ev.key === 'inout_users' || ev.key === 'inout_users_sync') renderServices();
  });

})();

// Shared request helpers for INOUT and page renderers
(function(){
  function readAll(){
    try{ return JSON.parse(localStorage.getItem('inout_users')||'[]'); }catch(e){ return []; }
  }
  function writeAll(all){
    try{ localStorage.setItem('inout_users', JSON.stringify(all));
      try{ localStorage.setItem('inout_users_sync', Date.now().toString()); }catch(e){}
      return true;
    }catch(e){ console.error('Failed to write users', e); return false; }
  }

  function findUserById(id){
    const all = readAll();
    return all.find(u => String(u.id) === String(id)) || null;
  }

  function getRequestsForBusiness(businessId){
    const biz = findUserById(businessId);
    return biz && Array.isArray(biz.requests) ? biz.requests.slice().sort((a,b)=> new Date(b.createdAt)-new Date(a.createdAt)) : [];
  }

  function getRequestsForCustomer(customerId){
    const cust = findUserById(customerId);
    return cust && Array.isArray(cust.requests) ? cust.requests.slice().sort((a,b)=> new Date(b.createdAt)-new Date(a.createdAt)) : [];
  }

  // Update a request status across both business and customer records
  function updateRequestStatus(requestId, businessId, customerId, newStatus, metaUpdates){
    const all = readAll();
    let changed = false;
    all.forEach(u => {
      if(String(u.id) === String(businessId) || String(u.id) === String(customerId)){
        if(!Array.isArray(u.requests)) u.requests = [];
        u.requests = u.requests.map(r => {
          if(String(r.id) === String(requestId)){
            const upd = { ...r, status: newStatus, updatedAt: new Date().toISOString(), ...(metaUpdates||{}) };
            changed = true;
            return upd;
          }
          return r;
        });
      }
    });
    if(changed){ writeAll(all); }
    // update session copy if it matches either user
    try{
      const sessionRaw = localStorage.getItem('inout_user');
      if(sessionRaw){
        const session = JSON.parse(sessionRaw);
        if(String(session.id) === String(customerId) || String(session.id) === String(businessId)){
          const u = all.find(x=>String(x.id)===String(session.id));
          if(u){ delete u.password; localStorage.setItem('inout_user', JSON.stringify(u)); }
        }
      }
    }catch(e){}
    return changed;
  }

  // Create a request and persist to both sides
  function createRequest(req){
    const all = readAll();
    // push to business
    const bizIdx = all.findIndex(u => String(u.id) === String(req.businessId));
    if(bizIdx !== -1){ if(!Array.isArray(all[bizIdx].requests)) all[bizIdx].requests = []; all[bizIdx].requests.push(req); }
    const custIdx = all.findIndex(u => String(u.id) === String(req.customerId));
    if(custIdx !== -1){ if(!Array.isArray(all[custIdx].requests)) all[custIdx].requests = []; all[custIdx].requests.push(req); }
    const ok = writeAll(all);
    // sync session if customer is current
    try{
      const sessionRaw = localStorage.getItem('inout_user');
      if(sessionRaw){
        const session = JSON.parse(sessionRaw);
        if(String(session.id) === String(req.customerId)){
          if(!Array.isArray(session.requests)) session.requests = [];
          session.requests.push(req);
          delete session.password;
          localStorage.setItem('inout_user', JSON.stringify(session));
        }
      }
    }catch(e){}
    return ok;
  }

  // simple escaper
  function escapeHtml(s){ return String(s||'').replace(/[&<>"']/g, function(m){ return ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[m]); }); }

  // Expose functions globally
  window.INOUTRequests = {
    getAllUsers: readAll,
    saveAllUsers: writeAll,
    findUserById,
    getRequestsForBusiness,
    getRequestsForCustomer,
    updateRequestStatus,
    createRequest
  };

  // Page rendering for dashboards (auto-run on DOMContentLoaded)
  document.addEventListener('DOMContentLoaded', function(){
    // Business Dashboard renderer
    (function(){
      const list = document.getElementById('requestsList');
      if(!list) return;
      // require business account
      if(window.authRequireAccountType && !window.authRequireAccountType('business')) return;
      const user = window.authGetUser && window.authGetUser();
      function renderBusinessRequests(){
        if(!list || !user) return;
        const reqs = window.INOUTRequests.getRequestsForBusiness(user.id) || [];
        list.innerHTML = '';
        if(reqs.length === 0){ list.innerHTML = '<p class="muted">No customer requests yet.</p>'; return; }
        reqs.forEach(r=>{
          const card = document.createElement('div');
          card.className = 'item-card';
          const customer = window.INOUTRequests.findUserById(r.customerId) || {};
          const custName = customer.fullName || customer.businessName || customer.email || 'Customer';
          const info = document.createElement('div'); info.className = 'item-info';
          info.innerHTML = `<h4>${escapeHtml(custName)}</h4><div class="item-meta">${escapeHtml(r.serviceName || '')} · ${escapeHtml(r.preferredDate||'')} ${escapeHtml(r.preferredTime||'')}</div><div style="margin-top:8px">${escapeHtml(r.description||'')}</div>`;
          const actions = document.createElement('div');
          actions.style.display = 'flex'; actions.style.gap = '8px'; actions.style.alignItems = 'center';
          const statusEl = document.createElement('div'); statusEl.className = 'muted'; statusEl.textContent = r.status || 'Pending';
          actions.appendChild(statusEl);

          if(r.status === 'Pending'){
            const accept = document.createElement('button'); accept.className = 'btn primary'; accept.textContent = 'Accept';
            accept.addEventListener('click', ()=>{
              if(!confirm('Accept this request?')) return;
              const ok = window.INOUTRequests.updateRequestStatus(r.id, user.id, r.customerId, 'Accepted');
              if(ok){ alert('Request accepted.'); renderBusinessRequests(); }
            });
            const decline = document.createElement('button'); decline.className = 'btn ghost'; decline.textContent = 'Decline';
            decline.addEventListener('click', ()=>{
              if(!confirm('Decline this request?')) return;
              const ok = window.INOUTRequests.updateRequestStatus(r.id, user.id, r.customerId, 'Declined');
              if(ok){ alert('Request declined.'); renderBusinessRequests(); }
            });
            actions.appendChild(accept);
            actions.appendChild(decline);
          }

          const reply = document.createElement('button'); reply.className = 'btn ghost'; reply.textContent = 'Reply';
          reply.addEventListener('click', ()=>{ alert('Messaging is coming soon.'); });
          actions.appendChild(reply);

          card.appendChild(info);
          card.appendChild(actions);
          list.appendChild(card);
        });
      }

      renderBusinessRequests();
      window.addEventListener('storage', (ev)=>{ if(ev.key === 'inout_users') renderBusinessRequests(); });
    })();

    // Customer Dashboard renderer
    (function(){
      const containerSection = document.querySelector('section#requests');
      if(!containerSection) return;
      // require login
      if(window.authRequireLogin) window.authRequireLogin();
      const user = window.authGetUser && window.authGetUser();
      if(!user) return;

      function renderMyRequests(){
        const reqs = window.INOUTRequests.getRequestsForCustomer(user.id) || [];
        // clear existing content inside section (keep header)
        // remove any previous dynamic children except the first h3
        // We'll replace the inner content after the h3
        while(containerSection.children.length>1) containerSection.removeChild(containerSection.lastChild);

        const wrapper = document.createElement('div');
        if(reqs.length === 0){
          wrapper.innerHTML = `<div class="card" style="flex-direction:column;align-items:flex-start;"><h4 style="margin:0 0 8px">No requests yet</h4><p class="muted" style="margin:0">Your requests will appear here.</p></div>`;
          containerSection.appendChild(wrapper);
          return;
        }

        reqs.forEach(r=>{
          const card = document.createElement('div'); card.className='card'; card.style.marginTop='8px';
          const biz = window.INOUTRequests.findUserById(r.businessId) || {};
          const bizName = biz.businessName || biz.name || 'Business';
          const inner = document.createElement('div');
          inner.innerHTML = `<div style="display:flex;justify-content:space-between;align-items:flex-start"><div><strong>${escapeHtml(bizName)}</strong><div class="muted" style="font-size:13px">${escapeHtml(r.serviceName||'')}</div><div style="margin-top:8px">${escapeHtml(r.description||'')}</div><div class="muted" style="margin-top:8px">${escapeHtml(r.preferredDate||'')} ${escapeHtml(r.preferredTime||'')}</div></div></div>`;
          const actions = document.createElement('div'); actions.style.marginTop='8px';
          const status = document.createElement('div'); status.className='muted'; status.textContent = r.status || 'Pending';
          actions.appendChild(status);
          if(r.status === 'Pending'){
            const cancel = document.createElement('button'); cancel.className='btn ghost'; cancel.style.marginLeft='8px'; cancel.textContent='Cancel';
            cancel.addEventListener('click', ()=>{
              if(!confirm('Cancel this pending request?')) return;
              const ok = window.INOUTRequests.updateRequestStatus(r.id, r.businessId, user.id, 'Cancelled');
              if(ok){ alert('Request cancelled.'); renderMyRequests(); }
            });
            actions.appendChild(cancel);
          }
          card.appendChild(inner);
          card.appendChild(actions);
          wrapper.appendChild(card);
        });

        containerSection.appendChild(wrapper);
      }

      renderMyRequests();
      window.addEventListener('storage', (ev)=>{ if(ev.key === 'inout_users') renderMyRequests(); });
    })();
  });

})();

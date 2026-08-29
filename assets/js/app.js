// Lightweight script to populate location/currency selects and handle empty-state rendering
(function(){
  // Country list (sample international list). No location-specific branding is shown.
  const countries = [
    {code:'NG', name:'Nigeria', currency:{code:'NGN', symbol:'₦'}},
    {code:'US', name:'United States', currency:{code:'USD', symbol:'$'}},
    {code:'GB', name:'United Kingdom', currency:{code:'GBP', symbol:'£'}},
    {code:'CA', name:'Canada', currency:{code:'CAD', symbol:'$'}},
    {code:'DE', name:'Germany', currency:{code:'EUR', symbol:'€'}},
    {code:'FR', name:'France', currency:{code:'EUR', symbol:'€'}},
    {code:'IN', name:'India', currency:{code:'INR', symbol:'₹'}},
    {code:'AU', name:'Australia', currency:{code:'AUD', symbol:'$'}},
    {code:'ZA', name:'South Africa', currency:{code:'ZAR', symbol:'R'}},
    {code:'BR', name:'Brazil', currency:{code:'BRL', symbol:'R$'}}
  ];

  // IMPORTANT: No fake businesses are included. If you later connect a backend, populate `businesses` from API.
  const businesses = []; // intentionally empty — show clean empty state when no businesses exist

  // Populate datalist for the "Where are you?" input and a default currency list
  const whereList = document.getElementById('whereList');
  const whereInput = document.getElementById('whereInput');
  const currencySelect = document.getElementById('currency');

  if(whereList && whereInput){
    whereList.innerHTML = countries.map(c => `<option value="${c.name}"></option>`).join('');
  }

  if(currencySelect){
    // default to the first country's currency, followed by others
    currencySelect.innerHTML = countries.map(c => `<option value="${c.currency.code}">${c.currency.symbol} ${c.currency.code}</option>`).join('');
  }

  // Keep header 'where' input in sync with hero location input (if present)
  const heroLocation = document.getElementById('locationInput');
  if(whereInput && heroLocation){
    // If the user previously chose a location, restore it
    const stored = localStorage.getItem('inout_location');
    if(stored){
      whereInput.value = stored;
      heroLocation.value = stored;
    }
    whereInput.addEventListener('input', (e) => {
      const v = e.target.value;
      localStorage.setItem('inout_location', v || '');
      heroLocation.value = v || '';
    });
    // If the hero location is changed, mirror back to header input
    heroLocation.addEventListener('input', (e) => {
      const v = e.target.value;
      localStorage.setItem('inout_location', v || '');
      whereInput.value = v || '';
    });
  }

  // Function to create a business card HTML (without ratings or reviews)
  function businessCardSimple(b){
    return `<article class="card" data-id="${b.id}">
      <div class="logo-sm" style="background:linear-gradient(135deg,#9CA3AF33,#6B728077);width:72px;height:72px;border-radius:12px;display:flex;align-items:center;justify-content:center;font-weight:700">${escapeHtml((b.name||'B').charAt(0))}</div>
      <div style="flex:1">
        <h4 style="margin:0 0 6px;font-size:16px">${escapeHtml(b.name)}</h4>
        <div class="meta">${escapeHtml(b.category || '—')} • ${escapeHtml(b.city || '—')}</div>
        <p class="muted" style="margin:8px 0 0">${escapeHtml(b.desc || '')}</p>
      </div>
      <div style="display:flex;flex-direction:column;gap:8px;align-items:flex-end">
        <a class="btn ghost" href="business-profile.html?id=${encodeURIComponent(b.id)}">View</a>
      </div>
    </article>`;
  }

  // Render featured businesses or a clean empty state
  const featuredList = document.getElementById('featuredList');
  if(featuredList){
    if(businesses.length === 0){
      featuredList.innerHTML = `
        <div class="card" style="flex-direction:column;align-items:flex-start;">
          <h4 style="margin:0 0 8px">No businesses found yet</h4>
          <p class="muted" style="margin:0 0 12px">We’re growing our network. Check back soon or invite a business to join INOUT.</p>
          <a href="signup.html" class="btn primary">List Your Business</a>
        </div>
      `;
    } else {
      featuredList.innerHTML = businesses.slice(0,3).map(b => businessCardSimple(b)).join('');
    }
  }

  // Render businesses page list
  const businessList = document.getElementById('businessList');
  if(businessList){
    if(businesses.length === 0){
      businessList.innerHTML = `
        <div class="card" style="flex-direction:column;align-items:flex-start;">
          <h3 style="margin:0 0 8px">No businesses found yet</h3>
          <p class="muted" style="margin:0 0 12px">We’re growing our network. Check back soon or invite a business to join INOUT.</p>
          <a href="signup.html" class="btn primary">List Your Business</a>
        </div>
      `;
    } else {
      businessList.innerHTML = businesses.map(b => businessCardSimple(b)).join('');
    }
  }

  // Explore results rendering from query params (filters by q and location)
  const resultsList = document.getElementById('resultsList');
  const resultsMeta = document.getElementById('resultsMeta');
  if(resultsList){
    const params = new URLSearchParams(location.search);
    const q = (params.get('q')||'').toLowerCase();
    const loc = (params.get('location')||localStorage.getItem('inout_location')||'').toLowerCase();

    // Filter businesses according to query and location (if any). With empty businesses we show the empty state below.
    const filtered = businesses.filter(b=>{
      if(q && !( (b.name||'').toLowerCase().includes(q) || (b.category||'').toLowerCase().includes(q) )) return false;
      if(loc && !( (b.city||'').toLowerCase().includes(loc) || (b.country||'').toLowerCase().includes(loc) )) return false;
      return true;
    });

    if(filtered.length === 0){
      resultsMeta.textContent = `0 result(s) ${q?`for "${q}"`:''} ${loc?`in ${loc}`:''}`;
      resultsList.innerHTML = `
        <div class="card" style="flex-direction:column;align-items:flex-start;">
          <h3 style="margin:0 0 8px">No businesses found yet</h3>
          <p class="muted" style="margin:0 0 12px">We’re growing our network. Check back soon or invite a business to join INOUT.</p>
          <a href="signup.html" class="btn primary">List Your Business</a>
        </div>
      `;
    } else {
      resultsMeta.textContent = `${filtered.length} result(s) ${q?`for "${q}"`:''} ${loc?`in ${loc}`:''}`;
      resultsList.innerHTML = filtered.map(b=>businessCardSimple(b)).join('');
    }
  }

  // Business profile page: if no real data, show a not-found / invite state
  if(location.pathname.endsWith('business-profile.html')){
    // If there's an id param, attempt to find it in businesses. Currently businesses=[] so we show not found.
    const params = new URLSearchParams(location.search);
    const id = params.get('id');
    const found = businesses.find(x => String(x.id) === String(id));
    const titleEl = document.getElementById('bpName');
    const catEl = document.getElementById('bpCategory');
    const descEl = document.getElementById('bpDesc');
    const servicesEl = document.getElementById('bpServices');

    if(!found){
      if(titleEl) titleEl.textContent = 'Business not found';
      if(catEl) catEl.textContent = '—';
      if(descEl) descEl.textContent = 'This business is not available on INOUT. Invite the business to join or return to Explore.';
      if(servicesEl) servicesEl.innerHTML = '<li><a href="signup.html" class="btn primary">List Your Business</a></li>';
    } else {
      // (If you later add real data, populate the profile here.)
      if(titleEl) titleEl.textContent = found.name;
      if(catEl) catEl.textContent = `${found.category} · ${found.city || ''}`;
      if(descEl) descEl.textContent = found.desc || '';
      if(servicesEl) servicesEl.innerHTML = '<li>Service 1</li><li>Service 2</li>';
    }
  }

  // Chips in the hero should submit searches
  document.querySelectorAll('.chip').forEach(btn=>{
    btn.addEventListener('click', e=>{
      const term = e.target.dataset.term;
      const qInput = document.getElementById('q');
      if(qInput) qInput.value = term;
      const searchForm = document.getElementById('searchForm');
      if(searchForm) searchForm.submit();
    });
  });

  // small helpers
  function escapeHtml(s){
    return String(s||'').replace(/[&<>\"']/g, function(m){ return ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[m]); });
  }

  // Insert current year where present
  document.querySelectorAll('[id^=year]').forEach(el => el.textContent = new Date().getFullYear().toString());

})();

// assets/js/explore.js
(function(){
  // Read only real business accounts created via signup (inout_users)
  function getBusinessesFromStorage(){
    try {
      const users = JSON.parse(localStorage.getItem('inout_users') || '[]');
      return users.filter(u => u && u.accountType === 'business');
    } catch (e) {
      return [];
    }
  }

  function derivePriceTier(b){
    if(!b) return '';
    if(b.prices && typeof b.prices.min === 'number'){
      const p = b.prices.min;
      if(p < 20) return '$';
      if(p < 100) return '$$';
      return '$$$';
    }
    return '';
  }

  function escapeHtml(s){ return String(s||'').replace(/[&<>"']/g, function(m){ return ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[m]); }); }

  function renderBusinessCard(b){
    const priceTier = derivePriceTier(b);
    const category = b.category || '';
    const city = b.city || (b.location && b.location.city) || '';
    const name = escapeHtml(b.businessName || b.fullName || b.email || 'Unnamed');
    const desc = escapeHtml((b.profile && b.profile.description) || '');
    const id = encodeURIComponent(b.id);
    return `
      <a class="card" href="business-profile.html?id=${id}" data-id="${id}" style="text-decoration:none;color:inherit;display:flex;gap:12px;align-items:flex-start;">
        <div class="logo-sm" style="background:linear-gradient(135deg,#9CA3AF33,#6B728077);width:72px;height:72px;border-radius:12px;display:flex;align-items:center;justify-content:center;font-weight:700;color:#111;">
          ${(b.businessName||'').slice(0,2).toUpperCase() || 'B'}
        </div>
        <div style="flex:1">
          <h3 style="margin:0 0 6px">${name} ${ priceTier ? `<small style="margin-left:8px;color:var(--muted);font-weight:600">${priceTier}</small>` : '' }</h3>
          <p class="muted" style="margin:0 0 8px">${escapeHtml(category)}${city?` · ${escapeHtml(city)}`:''}</p>
          <p class="muted" style="margin:0">${desc}</p>
        </div>
      </a>
    `;
  }

  function showNoBusinessesEmptyState(){
    return `
      <div class="card" style="flex-direction:column;align-items:flex-start;">
        <h3 style="margin:0 0 8px">No businesses found</h3>
        <p class="muted" style="margin:0 0 12px">Try another search or location, or invite a business to join INOUT.</p>
        <a class="btn primary" href="signup.html" style="margin-top:12px">List Your Business</a>
      </div>
    `;
  }

  function applyExploreFilters(){
    const q = (document.getElementById('q')?.value || '').toLowerCase().trim();
    const location = (document.getElementById('locationInput')?.value || '').toLowerCase().trim();
    const category = (document.getElementById('filterCategory')?.value || '').toLowerCase();
    const price = (document.getElementById('filterPrice')?.value || '');
    const sortBy = (document.getElementById('sortBy')?.value || 'relevance');

    const all = getBusinessesFromStorage();

    let filtered = all.filter(b => {
      if(q){
        const hay = ((b.businessName||'') + ' ' + (b.category||'') + ' ' + ((b.services||[]).join(' '))).toLowerCase();
        if(!hay.includes(q)) return false;
      }
      if(location){
        const lochay = ((b.city||'') + ' ' + (b.state||'') + ' ' + (b.country||'') + ' ' + ((b.location && b.location.address) || '')).toLowerCase();
        if(!lochay.includes(location)) return false;
      }
      if(category){
        if(((b.category||'').toLowerCase()) !== category) return false;
      }
      if(price){
        const tier = derivePriceTier(b);
        if(tier !== price) return false;
      }
      return true;
    });

    if(sortBy === 'name_asc'){
      filtered.sort((a,b)=> (a.businessName||'').localeCompare(b.businessName||''));
    } else if(sortBy === 'price_asc'){
      filtered.sort((a,b)=> ((a.prices&&a.prices.min)||Infinity) - ((b.prices&&b.prices.min)||Infinity));
    } else if(sortBy === 'price_desc'){
      filtered.sort((a,b)=> ((b.prices&&b.prices.min)||0) - ((a.prices&&a.prices.min)||0));
    }

    const resultsList = document.getElementById('resultsList');
    const resultsMeta = document.getElementById('resultsMeta');
    if(!resultsList || !resultsMeta) return;

    if(filtered.length === 0){
      resultsMeta.textContent = `0 result(s) ${q?`for "${q}"`:''} ${location?`in ${location}`:''}`;
      resultsList.innerHTML = showNoBusinessesEmptyState();
    } else {
      resultsMeta.textContent = `${filtered.length} result(s) ${q?`for "${q}"`:''} ${location?`in ${location}`:''}`;
      resultsList.innerHTML = filtered.map(renderBusinessCard).join('');
    }
  }

  document.addEventListener('DOMContentLoaded', function(){
    if(window.populateCountrySelects) window.populateCountrySelects();
    const btn = document.getElementById('searchBtn');
    if(btn) btn.addEventListener('click', applyExploreFilters);

    const params = new URLSearchParams(location.search);
    if(params.get('q')) document.getElementById('q').value = params.get('q');
    if(params.get('location')) document.getElementById('locationInput').value = params.get('location');
    applyExploreFilters();
  });
})();

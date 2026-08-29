// Lightweight script to populate location/country selects and handle empty-state rendering
(function(){
  // Full ISO 3166 country list (code, name)
  // Flag emojis are generated from the country code at runtime — no external assets required.
  const countries = [
    {code:'AF',name:'Afghanistan'},{code:'AX',name:'Åland Islands'},{code:'AL',name:'Albania'},{code:'DZ',name:'Algeria'},{code:'AS',name:'American Samoa'},{code:'AD',name:'Andorra'},{code:'AO',name:'Angola'},{code:'AI',name:'Anguilla'},{code:'AQ',name:'Antarctica'},{code:'AG',name:'Antigua and Barbuda'},{code:'AR',name:'Argentina'},{code:'AM',name:'Armenia'},{code:'AW',name:'Aruba'},{code:'AU',name:'Australia'},{code:'AT',name:'Austria'},{code:'AZ',name:'Azerbaijan'},{code:'BS',name:'Bahamas'},{code:'BH',name:'Bahrain'},{code:'BD',name:'Bangladesh'},{code:'BB',name:'Barbados'},{code:'BY',name:'Belarus'},{code:'BE',name:'Belgium'},{code:'BZ',name:'Belize'},{code:'BJ',name:'Benin'},{code:'BM',name:'Bermuda'},{code:'BT',name:'Bhutan'},{code:'BO',name:'Bolivia'},{code:'BQ',name:'Bonaire, Sint Eustatius and Saba'},{code:'BA',name:'Bosnia and Herzegovina'},{code:'BW',name:'Botswana'},{code:'BV',name:'Bouvet Island'},{code:'BR',name:'Brazil'},{code:'IO',name:'British Indian Ocean Territory'},{code:'BN',name:'Brunei Darussalam'},{code:'BG',name:'Bulgaria'},{code:'BF',name:'Burkina Faso'},{code:'BI',name:'Burundi'},{code:'CV',name:'Cabo Verde'},{code:'KH',name:'Cambodia'},{code:'CM',name:'Cameroon'},{code:'CA',name:'Canada'},{code:'KY',name:'Cayman Islands'},{code:'CF',name:'Central African Republic'},{code:'TD',name:'Chad'},{code:'CL',name:'Chile'},{code:'CN',name:'China'},{code:'CX',name:'Christmas Island'},{code:'CC',name:'Cocos (Keeling) Islands'},{code:'CO',name:'Colombia'},{code:'KM',name:'Comoros'},{code:'CG',name:'Congo'},{code:'CD',name:'Congo, Democratic Republic of the'},{code:'CK',name:'Cook Islands'},{code:'CR',name:'Costa Rica'},{code:'CI',name:'Côte d\'Ivoire'},{code:'HR',name:'Croatia'},{code:'CU',name:'Cuba'},{code:'CW',name:'Curaçao'},{code:'CY',name:'Cyprus'},{code:'CZ',name:'Czechia'},{code:'DK',name:'Denmark'},{code:'DJ',name:'Djibouti'},{code:'DM',name:'Dominica'},{code:'DO',name:'Dominican Republic'},{code:'EC',name:'Ecuador'},{code:'EG',name:'Egypt'},{code:'SV',name:'El Salvador'},{code:'GQ',name:'Equatorial Guinea'},{code:'ER',name:'Eritrea'},{code:'EE',name:'Estonia'},{code:'SZ',name:'Eswatini'},{code:'ET',name:'Ethiopia'},{code:'FK',name:'Falkland Islands (Malvinas)'},{code:'FO',name:'Faroe Islands'},{code:'FJ',name:'Fiji'},{code:'FI',name:'Finland'},{code:'FR',name:'France'},{code:'GF',name:'French Guiana'},{code:'PF',name:'French Polynesia'},{code:'TF',name:'French Southern Territories'},{code:'GA',name:'Gabon'},{code:'GM',name:'Gambia'},{code:'GE',name:'Georgia'},{code:'DE',name:'Germany'},{code:'GH',name:'Ghana'},{code:'GI',name:'Gibraltar'},{code:'GR',name:'Greece'},{code:'GL',name:'Greenland'},{code:'GD',name:'Grenada'},{code:'GP',name:'Guadeloupe'},{code:'GU',name:'Guam'},{code:'GT',name:'Guatemala'},{code:'GG',name:'Guernsey'},{code:'GN',name:'Guinea'},{code:'GW',name:'Guinea-Bissau'},{code:'GY',name:'Guyana'},{code:'HT',name:'Haiti'},{code:'HM',name:'Heard Island and McDonald Islands'},{code:'VA',name:'Holy See'},{code:'HN',name:'Honduras'},{code:'HK',name:'Hong Kong'},{code:'HU',name:'Hungary'},{code:'IS',name:'Iceland'},{code:'IN',name:'India'},{code:'ID',name:'Indonesia'},{code:'IR',name:'Iran'},{code:'IQ',name:'Iraq'},{code:'IE',name:'Ireland'},{code:'IM',name:'Isle of Man'},{code:'IL',name:'Israel'},{code:'IT',name:'Italy'},{code:'JM',name:'Jamaica'},{code:'JP',name:'Japan'},{code:'JE',name:'Jersey'},{code:'JO',name:'Jordan'},{code:'KZ',name:'Kazakhstan'},{code:'KE',name:'Kenya'},{code:'KI',name:'Kiribati'},{code:'KP',name:'Korea (Democratic People's Republic of)'},{code:'KR',name:'Korea (Republic of)'},{code:'KW',name:'Kuwait'},{code:'KG',name:'Kyrgyzstan'},{code:'LA',name:'Lao People\'s Democratic Republic'},{code:'LV',name:'Latvia'},{code:'LB',name:'Lebanon'},{code:'LS',name:'Lesotho'},{code:'LR',name:'Liberia'},{code:'LY',name:'Libya'},{code:'LI',name:'Liechtenstein'},{code:'LT',name:'Lithuania'},{code:'LU',name:'Luxembourg'},{code:'MO',name:'Macao'},{code:'MG',name:'Madagascar'},{code:'MW',name:'Malawi'},{code:'MY',name:'Malaysia'},{code:'MV',name:'Maldives'},{code:'ML',name:'Mali'},{code:'MT',name:'Malta'},{code:'MH',name:'Marshall Islands'},{code:'MQ',name:'Martinique'},{code:'MR',name:'Mauritania'},{code:'MU',name:'Mauritius'},{code:'YT',name:'Mayotte'},{code:'MX',name:'Mexico'},{code:'FM',name:'Micronesia (Federated States of)'},{code:'MD',name:'Moldova'},{code:'MC',name:'Monaco'},{code:'MN',name:'Mongolia'},{code:'ME',name:'Montenegro'},{code:'MS',name:'Montserrat'},{code:'MA',name:'Morocco'},{code:'MZ',name:'Mozambique'},{code:'MM',name:'Myanmar'},{code:'NA',name:'Namibia'},{code:'NR',name:'Nauru'},{code:'NP',name:'Nepal'},{code:'NL',name:'Netherlands'},{code:'NC',name:'New Caledonia'},{code:'NZ',name:'New Zealand'},{code:'NI',name:'Nicaragua'},{code:'NE',name:'Niger'},{code:'NG',name:'Nigeria'},{code:'NU',name:'Niue'},{code:'NF',name:'Norfolk Island'},{code:'MK',name:'North Macedonia'},{code:'MP',name:'Northern Mariana Islands'},{code:'NO',name:'Norway'},{code:'OM',name:'Oman'},{code:'PK',name:'Pakistan'},{code:'PW',name:'Palau'},{code:'PS',name:'Palestine, State of'},{code:'PA',name:'Panama'},{code:'PG',name:'Papua New Guinea'},{code:'PY',name:'Paraguay'},{code:'PE',name:'Peru'},{code:'PH',name:'Philippines'},{code:'PN',name:'Pitcairn'},{code:'PL',name:'Poland'},{code:'PT',name:'Portugal'},{code:'PR',name:'Puerto Rico'},{code:'QA',name:'Qatar'},{code:'RE',name:'Réunion'},{code:'RO',name:'Romania'},{code:'RU',name:'Russian Federation'},{code:'RW',name:'Rwanda'},{code:'BL',name:'Saint Barthélemy'},{code:'SH',name:'Saint Helena, Ascension and Tristan da Cunha'},{code:'KN',name:'Saint Kitts and Nevis'},{code:'LC',name:'Saint Lucia'},{code:'MF',name:'Saint Martin (French part)'},{code:'PM',name:'Saint Pierre and Miquelon'},{code:'VC',name:'Saint Vincent and the Grenadines'},{code:'WS',name:'Samoa'},{code:'SM',name:'San Marino'},{code:'ST',name:'Sao Tome and Principe'},{code:'SA',name:'Saudi Arabia'},{code:'SN',name:'Senegal'},{code:'RS',name:'Serbia'},{code:'SC',name:'Seychelles'},{code:'SL',name:'Sierra Leone'},{code:'SG',name:'Singapore'},{code:'SX',name:'Sint Maarten (Dutch part)'},{code:'SK',name:'Slovakia'},{code:'SI',name:'Slovenia'},{code:'SB',name:'Solomon Islands'},{code:'SO',name:'Somalia'},{code:'ZA',name:'South Africa'},{code:'GS',name:'South Georgia and the South Sandwich Islands'},{code:'SS',name:'South Sudan'},{code:'ES',name:'Spain'},{code:'LK',name:'Sri Lanka'},{code:'SD',name:'Sudan'},{code:'SR',name:'Suriname'},{code:'SJ',name:'Svalbard and Jan Mayen'},{code:'SE',name:'Sweden'},{code:'CH',name:'Switzerland'},{code:'SY',name:'Syrian Arab Republic'},{code:'TW',name:'Taiwan, Province of China'},{code:'TJ',name:'Tajikistan'},{code:'TZ',name:'Tanzania, United Republic of'},{code:'TH',name:'Thailand'},{code:'TL',name:'Timor-Leste'},{code:'TG',name:'Togo'},{code:'TK',name:'Tokelau'},{code:'TO',name:'Tonga'},{code:'TT',name:'Trinidad and Tobago'},{code:'TN',name:'Tunisia'},{code:'TR',name:'Turkey'},{code:'TM',name:'Turkmenistan'},{code:'TC',name:'Turks and Caicos Islands'},{code:'TV',name:'Tuvalu'},{code:'UG',name:'Uganda'},{code:'UA',name:'Ukraine'},{code:'AE',name:'United Arab Emirates'},{code:'GB',name:'United Kingdom'},{code:'UM',name:'United States Minor Outlying Islands'},{code:'US',name:'United States'},{code:'UY',name:'Uruguay'},{code:'UZ',name:'Uzbekistan'},{code:'VU',name:'Vanuatu'},{code:'VE',name:'Venezuela'},{code:'VN',name:'Viet Nam'},{code:'VG',name:'Virgin Islands (British)'},{code:'VI',name:'Virgin Islands (U.S.)'},{code:'WF',name:'Wallis and Futuna'},{code:'EH',name:'Western Sahara'},{code:'YE',name:'Yemen'},{code:'ZM',name:'Zambia'},{code:'ZW',name:'Zimbabwe'}
  ];

  // Helper: convert ISO country code to emoji flag
  function codeToFlagEmoji(cc){
    if(!cc) return '';
    const code = cc.toUpperCase();
    // Only A-Z letters supported
    return Array.from(code).map(ch => {
      const base = 0x1F1E6; // Regional Indicator Symbol Letter A
      return String.fromCodePoint(base + ch.charCodeAt(0) - 65);
    }).join('');
  }

  // Maintain a small set of example currencies for header (not exhaustive)
  const currencies = [
    {code:'USD',symbol:'$'},{code:'EUR',symbol:'€'},{code:'GBP',symbol:'£'},{code:'NGN',symbol:'₦'},{code:'INR',symbol:'₹'},{code:'AUD',symbol:'$'},{code:'CAD',symbol:'$'},{code:'ZAR',symbol:'R'},{code:'BRL',symbol:'R$'}
  ];

  // Expose populateCountrySelects globally (signup.html expects this)
  window.populateCountrySelects = function(){
    // Populate header 'where' datalist
    const whereList = document.getElementById('whereList');
    const whereInput = document.getElementById('whereInput');
    if(whereList){
      whereList.innerHTML = countries.map(c => `<option value="${escapeHtml(c.name)}"></option>`).join('');
    }

    // Populate currency select (header)
    const currencySelect = document.getElementById('currency');
    if(currencySelect){
      currencySelect.innerHTML = currencies.map(c=>`<option value="${c.code}">${c.symbol} ${c.code}</option>`).join('');
    }

    // Replace visible country <select> elements with an accessible custom picker while keeping the original <select> hidden
    const ids = ['custCountry','bizCountry'];
    ids.forEach(id=>{
      const sel = document.getElementById(id);
      if(!sel) return;

      // If we've already initialized for this select, skip
      if(sel.dataset.pickerInitialized) return;

      // Mark as initialized
      sel.dataset.pickerInitialized = '1';

      // Hide original select but keep it in DOM so existing form values/readers still work
      sel.style.display = 'none';

      // Create picker container
      const picker = document.createElement('div');
      picker.className = 'country-picker';

      // Create selected button
      const btn = document.createElement('button');
      btn.type = 'button';
      btn.className = 'country-selected';
      btn.setAttribute('aria-haspopup','listbox');
      btn.setAttribute('aria-expanded','false');
      btn.innerHTML = `<span class="country-flag"></span> <span class="country-name">Select country</span> <span class="caret">▾</span>`;

      // Dropdown
      const dropdown = document.createElement('div');
      dropdown.className = 'country-dropdown';
      dropdown.setAttribute('role','dialog');
      dropdown.hidden = true;

      // Search input
      const search = document.createElement('input');
      search.type = 'search';
      search.className = 'country-search';
      search.placeholder = 'Search country';
      search.setAttribute('aria-label','Search countries');

      // List
      const list = document.createElement('ul');
      list.className = 'country-list';
      list.setAttribute('role','listbox');
      list.tabIndex = -1;

      // Render list items
      list.innerHTML = countries.map(c=>{
        const flag = codeToFlagEmoji(c.code);
        return `<li role="option" data-code="${c.code}" data-name="${escapeHtml(c.name)}">${flag} <span class=\"name\">${escapeHtml(c.name)}</span></li>`;
      }).join('');

      dropdown.appendChild(search);
      dropdown.appendChild(list);

      // Insert picker before the original select
      sel.parentNode.insertBefore(picker, sel);
      picker.appendChild(btn);
      picker.appendChild(dropdown);

      // Click handlers
      function openDropdown(){
        dropdown.hidden = false;
        btn.setAttribute('aria-expanded','true');
        search.focus();
      }
      function closeDropdown(){
        dropdown.hidden = true;
        btn.setAttribute('aria-expanded','false');
      }

      btn.addEventListener('click', (e)=>{
        e.preventDefault();
        if(dropdown.hidden) openDropdown(); else closeDropdown();
      });

      // Filter function
      function filterList(q){
        const v = (q||'').toLowerCase().trim();
        Array.from(list.children).forEach(li=>{
          const name = li.dataset.name.toLowerCase();
          li.style.display = name.includes(v) ? '' : 'none';
        });
        // focus first visible
        const first = Array.from(list.children).find(li=>li.style.display!=='none');
        if(first) first.focus();
      }

      search.addEventListener('input', (e)=>{
        filterList(e.target.value);
      });

      // Click on list item
      list.addEventListener('click', (e)=>{
        const li = e.target.closest('li');
        if(!li) return;
        const code = li.dataset.code;
        const name = li.dataset.name;
        selectCountry(code,name);
        closeDropdown();
      });

      // Keyboard navigation
      list.addEventListener('keydown', (e)=>{
        const focused = document.activeElement;
        if(e.key === 'ArrowDown'){
          e.preventDefault();
          let next = focused.nextElementSibling;
          while(next && next.style.display==='none') next = next.nextElementSibling;
          if(next) next.focus();
        } else if(e.key === 'ArrowUp'){
          e.preventDefault();
          let prev = focused.previousElementSibling;
          while(prev && prev.style.display==='none') prev = prev.previousElementSibling;
          if(prev) prev.focus(); else search.focus();
        } else if(e.key === 'Enter' || e.key === ' '){
          e.preventDefault();
          const li = focused;
          if(li && li.dataset && li.dataset.code){
            selectCountry(li.dataset.code, li.dataset.name);
            closeDropdown();
          }
        } else if(e.key === 'Escape'){
          closeDropdown();
          btn.focus();
        }
      });

      // Close dropdown on outside click
      document.addEventListener('click', (ev)=>{
        if(!picker.contains(ev.target)) closeDropdown();
      });

      // Select country helper
      function selectCountry(code,name){
        // Update UI
        const flag = codeToFlagEmoji(code);
        btn.querySelector('.country-flag').textContent = flag;
        btn.querySelector('.country-name').textContent = name;

        // Update original select value to the country name (keeps form behavior stable)
        sel.value = name;

        // For accessibility, set aria-selected on matching option if one exists
        const opt = Array.from(sel.options).find(o => o.value === name);
        if(opt) opt.selected = true;

        // Dispatch change event so other listeners can react
        sel.dispatchEvent(new Event('change', {bubbles:true}));

        // Prepare State/Region and City to depend on selected country by tagging elements
        const state = document.getElementById(id==='custCountry' ? 'custState' : 'bizState');
        const city = document.getElementById(id==='custCountry' ? 'custCity' : 'bizCity');
        if(state) state.dataset.country = code;
        if(city) city.dataset.country = code;

        // Also set a data attribute on the picker for external tools
        picker.dataset.selectedCode = code;
        picker.dataset.selectedName = name;
      }

      // If the original select already has a value, set picker accordingly
      if(sel.value){
        // try to match by name
        const match = countries.find(c => c.name.toLowerCase() === sel.value.toLowerCase());
        if(match) selectCountry(match.code, match.name);
      }

    });
  };

  // Keep header hero sync (existing behavior) — this uses the whereInput datalist populated above
  const whereInput = document.getElementById('whereInput');
  const heroLocation = document.getElementById('locationInput');
  if(whereInput && heroLocation){
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
    heroLocation.addEventListener('input', (e) => {
      const v = e.target.value;
      localStorage.setItem('inout_location', v || '');
      whereInput.value = v || '';
    });
  }

  // Existing business listing logic kept as-is (no fake data added)
  const businesses = [];

  function businessCardSimple(b){
    return `<article class="card" data-id="${b.id}">\n      <div class="logo-sm" style="background:linear-gradient(135deg,#9CA3AF33,#6B728077);width:72px;height:72px;border-radius:12px;display:flex;align-items:center;justify-content:center;font-weight:600">${escapeHtml((b.name||'').charAt(0) || '')}</div>\n      <div style="flex:1">\n        <h4 style="margin:0 0 6px;font-size:16px">${escapeHtml(b.name)}</h4>\n        <div class="meta">${escapeHtml(b.category || '—')} • ${escapeHtml(b.city || '—')}</div>\n        <p class="muted" style="margin:8px 0 0">${escapeHtml(b.desc || '')}</p>\n      </div>\n      <div style="display:flex;flex-direction:column;gap:8px;align-items:flex-end">\n        <a class="btn ghost" href="business-profile.html?id=${encodeURIComponent(b.id)}">View</a>\n      </div>\n    </article>`;
  }

  // Render featured list
  const featuredList = document.getElementById('featuredList');
  if(featuredList){
    if(businesses.length === 0){
      featuredList.innerHTML = `\n        <div class="card" style="flex-direction:column;align-items:flex-start;">\n          <h4 style="margin:0 0 8px">No businesses found yet</h4>\n          <p class="muted" style="margin:0 0 12px">We’re growing our network. Check back soon or invite a business to join INOUT.</p>\n          <a href="signup.html" class="btn primary">List Your Business</a>\n        </div>\n      `;
    } else {
      featuredList.innerHTML = businesses.slice(0,3).map(b => businessCardSimple(b)).join('');
    }
  }

  // Explore results rendering (keeps original behavior)
  const resultsList = document.getElementById('resultsList');
  const resultsMeta = document.getElementById('resultsMeta');
  if(resultsList){
    const params = new URLSearchParams(location.search);
    const q = (params.get('q')||'').toLowerCase();
    const loc = (params.get('location')||localStorage.getItem('inout_location')||'').toLowerCase();

    const filtered = businesses.filter(b=>{
      if(q && !( (b.name||'').toLowerCase().includes(q) || (b.category||'').toLowerCase().includes(q) )) return false;
      if(loc && !( (b.city||'').toLowerCase().includes(loc) || (b.country||'').toLowerCase().includes(loc) )) return false;
      return true;
    });

    if(filtered.length === 0){
      resultsMeta.textContent = `0 result(s) ${q?`for "${q}"`:''} ${loc?`in ${loc}`:''}`;
      resultsList.innerHTML = `\n        <div class="card" style="flex-direction:column;align-items:flex-start;">\n          <h3 style="margin:0 0 8px">No businesses found yet</h3>\n          <p class="muted" style="margin:0 0 12px">We’re growing our network. Check back soon or invite a business to join INOUT.</p>\n          <a href="signup.html" class="btn primary">List Your Business</a>\n        </div>\n      `;
    } else {
      resultsMeta.textContent = `${filtered.length} result(s) ${q?`for "${q}"`:''} ${loc?`in ${loc}`:''}`;
      resultsList.innerHTML = filtered.map(b=>businessCardSimple(b)).join('');
    }
  }

  // Chips in hero
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

  // Insert current year
  document.querySelectorAll('[id^=year]').forEach(el => el.textContent = new Date().getFullYear().toString());

  // Initialize country selects on DOM ready
  document.addEventListener('DOMContentLoaded', ()=>{
    if(window.populateCountrySelects) window.populateCountrySelects();
  });

})();

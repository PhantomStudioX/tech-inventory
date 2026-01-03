// main.js - product listing, sorting, skeleton, search, color switching

// Helper: shuffle
function shuffle(array){ return array.sort(()=>Math.random()-0.5); }

function getQueryParam(name){
  const p = new URLSearchParams(window.location.search);
  return p.get(name);
}

// show skeleton
function showSkeleton(container, count=8){
  container.innerHTML = '';
  const wrapper = document.createElement('div');
  wrapper.className = 'skeleton-grid';
  for(let i=0;i<count;i++){
    const c = document.createElement('div'); c.className='skeleton-card';
    wrapper.appendChild(c);
  }
  container.appendChild(wrapper);
}

// parse price string like "$1,199" or "$999JMD" returning numeric (best effort)
function parsePrice(priceStr){
  if(!priceStr) return 0;
  const num = priceStr.replace(/[^0-9\.]/g,'');
  return Number(num) || 0;
}

function renderProducts(list, container){
  if(!list || list.length===0){
    container.innerHTML = '<p class="no-results">No results found.</p>';
    return;
  }

  container.innerHTML = list.map(p => `
    <div class="product-card">
      <img id="img-${p.id}" src="${p.image}" alt="${p.name}">
      <h3>${p.name}</h3>

      <div class="color-options">
        ${(p.colors||[]).map(c=>`
          <span class="color-dot" data-id="${p.id}" data-color="${c}" style="background:${c};"></span>
        `).join('')}
      </div>

      <p class="price">Price: ${p.price}</p>
      <p class="stock">${p.stock>0 ? 'In Stock' : 'Out of Stock'}</p>

      <div style="margin-top:8px">
        <button class="btn add-btn" data-id="${p.id}" ${p.stock===0?'disabled':''}>Add to cart</button>
      </div>
    </div>
  `).join('');
}

// enable color switching & add-to-cart buttons
function enableUI(){
  document.querySelectorAll('.color-dot').forEach(dot=>{
    dot.addEventListener('click', e=>{
      const id = dot.dataset.id;
      const color = dot.dataset.color;
      const img = document.getElementById(`img-${id}`);
      if(!img) return;
      const file = img.src.split('/').pop();
      const base = file.split('-')[0];
      const folder = img.src.replace(/\/[^\/]*$/, '/');
      img.src = `${folder}${base}-${color}.jpg`;
      dot.parentElement.querySelectorAll('.color-dot').forEach(d=>d.classList.remove('active-color'));
      dot.classList.add('active-color');
    });
  });

  document.querySelectorAll('.add-btn').forEach(btn=>{
    btn.addEventListener('click', ()=>{
      const id = Number(btn.dataset.id);
      const cart = JSON.parse(localStorage.getItem('cart')||'[]');
      const product = products.find(p => p.id === id);
      if(!product) return;
      const found = cart.find(i=>i.id===id);
      if(found) found.qty = Math.min(product.stock, found.qty+1);
      else cart.push({id, qty:1});
      localStorage.setItem('cart', JSON.stringify(cart));
      alert('Added to cart');
    });
  });
}

function applySort(list, mode){
  if(mode==='az') return list.slice().sort((a,b)=> a.name.localeCompare(b.name));
  if(mode==='za') return list.slice().sort((a,b)=> b.name.localeCompare(a.name));
  if(mode==='plh') return list.slice().sort((a,b)=> parsePrice(a.price)-parsePrice(b.price));
  if(mode==='phl') return list.slice().sort((a,b)=> parsePrice(b.price)-parsePrice(a.price));
  return list;
}

function loadProducts(){
  const category = getQueryParam('category');
  const container = document.getElementById('product-list') || document.getElementById('featured-products');
  const titleEl = document.getElementById('category-title');

  const initial = category ? products.filter(p=>p.category===category) : shuffle([...products]).slice(0, 10);

  if(titleEl && category) titleEl.textContent = category.charAt(0).toUpperCase()+category.slice(1);

  if(!container) return;

  // show skeleton while "loading"
  showSkeleton(container, 8);

  setTimeout(()=>{ // simulate loading time
    // replace skeleton with real content
    renderProducts(initial, container);
    enableUI();
  }, 500);
}

// SEARCH + SORT
function setupControls(){
  const search = document.getElementById('search');
  const sortSel = document.getElementById('sortSelect');

  function doFilter(){
    const q = search ? search.value.toLowerCase() : '';
    const category = getQueryParam('category');
    let filtered = products.slice();
    if(category) filtered = filtered.filter(p => p.category===category);
    if(q) filtered = filtered.filter(p => p.name.toLowerCase().includes(q));
    // sort
    const mode = sortSel ? sortSel.value : 'default';
    filtered = applySort(filtered, mode);
    const container = document.getElementById('product-list');
    if(container){
      container.innerHTML = '';
      renderProducts(filtered, container);
      enableUI();
    }
  }

  if(search) {
    search.addEventListener('input', doFilter);
  }
  if(sortSel) {
    sortSel.addEventListener('change', doFilter);
  }
}

// init
window.addEventListener('DOMContentLoaded', ()=>{
  loadProducts();
  setupControls();
});

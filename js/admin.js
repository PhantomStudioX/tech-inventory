// tech-inventory/js/admin.js

// Demo credentials (insecure: replace with server auth later)
const ADMIN_USER = 'admin';
const ADMIN_PASS = 'password123';

function $(id){ return document.getElementById(id); }

function isAdminAuth(){
  return localStorage.getItem('adminAuth') === 'true';
}

function setAdminAuth(val){
  if(val) localStorage.setItem('adminAuth','true');
  else localStorage.removeItem('adminAuth');
}

function showView(name){
  document.querySelectorAll('.admin-view').forEach(v=>v.classList.add('hidden'));
  const el = document.getElementById(name);
  if(el) el.classList.remove('hidden');
}

// Renders
function renderOverview(){
  const orders = JSON.parse(localStorage.getItem('orders')||'[]');
  const messages = JSON.parse(localStorage.getItem('ai_messages')||'[]');
  const productsCount = (window.products||[]).length;
  document.getElementById('overview').innerHTML = `
    <div>
      <h3>Overview</h3>
      <p>Products: <strong>${productsCount}</strong></p>
      <p>Orders: <strong>${orders.length}</strong></p>
      <p>Messages: <strong>${messages.length}</strong></p>
    </div>
  `;
}

function renderProductsAdmin(){
  const el = document.getElementById('products');
  const list = (window.products||[]).map(p=>`
    <div style="border-bottom:1px solid #eee;padding:8px 0">
      <strong>${p.name}</strong> — ${p.category} — ${p.price} — stock: ${p.stock}
    </div>
  `).join('');
  el.innerHTML = `<h3>Products</h3>${list}`;
}

function renderOrders(){
  const el = document.getElementById('orders');
  const orders = JSON.parse(localStorage.getItem('orders')||'[]').slice().reverse();
  if(orders.length===0){ el.innerHTML = '<p>No orders yet.</p>'; return; }
  el.innerHTML = orders.map(o=>`
    <div style="border-bottom:1px solid #ddd;padding:10px 0">
      <strong>Order ${o.id}</strong> — ${new Date(o.createdAt).toLocaleString()} — ${o.name || ''} <br/>
      Items: ${o.items.map(i=>{ const p=products.find(x=>x.id===i.id); return (p?p.name:'?') + ' x'+i.qty; }).join(', ')}
    </div>
  `).join('');
}

function renderMessages(){
  const el = document.getElementById('messages');
  const messages = JSON.parse(localStorage.getItem('ai_messages')||'[]').slice().reverse();
  if(messages.length===0){ el.innerHTML = '<p>No messages yet.</p>'; return; }
  el.innerHTML = messages.map(m=>`
    <div style="border-bottom:1px solid #ddd;padding:10px 0">
      <strong>${escapeHtml(m.question)}</strong><br/>
      <em>${escapeHtml(m.answer || '—')}</em><br/>
      ${new Date(m.createdAt).toLocaleString()}
    </div>
  `).join('');
}

// small helper to avoid basic HTML injection from stored messages
function escapeHtml(str){
  if(!str) return '';
  return String(str)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;');
}

// Initialize UI behaviors once DOM ready
document.addEventListener('DOMContentLoaded', ()=>{

  const loginSection = $('admin-login');
  const dashboardSection = $('admin-dashboard');

  // If already authenticated — show dashboard
  if(isAdminAuth()){
    if(loginSection) loginSection.classList.add('hidden');
    if(dashboardSection) dashboardSection.classList.remove('hidden');
    renderOverview(); renderProductsAdmin(); renderOrders(); renderMessages();
  } else {
    // ensure dashboard hidden
    if(dashboardSection) dashboardSection.classList.add('hidden');
    if(loginSection) loginSection.classList.remove('hidden');
  }

  // Login handler
  const loginBtn = $('admin-login-btn');
  if(loginBtn){
    loginBtn.addEventListener('click', ()=>{
      const u = $('admin-user').value.trim();
      const p = $('admin-pass').value;
      if(u === ADMIN_USER && p === ADMIN_PASS){
        setAdminAuth(true);
        if(loginSection) loginSection.classList.add('hidden');
        if(dashboardSection) dashboardSection.classList.remove('hidden');
        renderOverview(); renderProductsAdmin(); renderOrders(); renderMessages();
        // Optionally focus overview
        showView('overview');
      } else {
        alert('Invalid credentials (demo)');
      }
    });
  }

  // Sidebar triggers — require auth
  document.querySelectorAll('.admin-nav a').forEach(a=>{
    a.addEventListener('click', (e)=>{
      e.preventDefault();
      const view = a.dataset.view;
      // Logout link handled separately
      if(a.id === 'admin-logout') return;
      if(!isAdminAuth()){
        alert('Please login as admin to access this area.');
        if(loginSection) loginSection.classList.remove('hidden');
        if(dashboardSection) dashboardSection.classList.add('hidden');
        return;
      }
      if(!view) return;
      showView(view);
      if(view==='overview') renderOverview();
      if(view==='products') renderProductsAdmin();
      if(view==='orders') renderOrders();
      if(view==='messages') renderMessages();
    });
  });

  // Logout
  const logout = $('admin-logout');
  if(logout){
    logout.addEventListener('click', (e)=>{
      e.preventDefault();
      setAdminAuth(false);
      // Show login again
      if(loginSection) loginSection.classList.remove('hidden');
      if(dashboardSection) dashboardSection.classList.add('hidden');
      // Optionally clear sensitive UI
      document.getElementById('overview').innerHTML = '';
      document.getElementById('products').innerHTML = '';
      document.getElementById('orders').innerHTML = '';
      document.getElementById('messages').innerHTML = '';
      // reload to be safe
      location.reload();
    });
  }

});

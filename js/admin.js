// tech-inventory/js/admin.js

const ADMIN_USER = 'admin';
const ADMIN_PASS = 'password123';
const API_BASE = 'http://localhost:5000/api';

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

function safeProducts(){
  return Array.isArray(window.products) ? window.products : [];
}

// ---------- BACKEND FETCH HELPERS ----------

async function fetchOrders(){
  const res = await fetch(`${API_BASE}/orders`);
  return res.ok ? res.json() : [];
}

async function fetchMessages(){
  const res = await fetch(`${API_BASE}/messages`);
  return res.ok ? res.json() : [];
}

// ---------- RENDERS ----------

async function renderOverview(){
  const orders = await fetchOrders();
  const messages = await fetchMessages();

  document.getElementById('overview').innerHTML = `
    <h3>Overview</h3>
    <p>Products: <strong>${safeProducts().length}</strong></p>
    <p>Orders: <strong>${orders.length}</strong></p>
    <p>Messages: <strong>${messages.length}</strong></p>
  `;
}

function renderProductsAdmin(){
  const el = $('products');
  el.innerHTML = `<h3>Products</h3>` + safeProducts().map(p=>`
    <div style="border-bottom:1px solid #eee;padding:8px 0">
      <strong>${p.name}</strong> — ${p.category} — ${p.price} — stock: ${p.stock}
    </div>
  `).join('');
}

async function renderOrders(){
  const el = $('orders');
  const orders = (await fetchOrders()).slice().reverse();
  const products = safeProducts();

  if(!orders.length){
    el.innerHTML = '<p>No orders yet.</p>';
    return;
  }

  el.innerHTML = orders.map(o=>`
    <div style="border-bottom:1px solid #ddd;padding:10px 0">
      <strong>Order ${o._id}</strong> — ${new Date(o.createdAt).toLocaleString()}<br/>
      Items: ${
        o.items.map(i=>{
          const p = products.find(x=>x.id===i.id);
          return `${p ? p.name : 'Unknown'} x${i.qty}`;
        }).join(', ')
      }
    </div>
  `).join('');
}

async function renderMessages(){
  const el = $('messages');
  const messages = (await fetchMessages()).slice().reverse();

  if(!messages.length){
    el.innerHTML = '<p>No messages yet.</p>';
    return;
  }

  el.innerHTML = messages.map(m=>`
    <div style="border-bottom:1px solid #ddd;padding:10px 0">
      <strong>${escapeHtml(m.question)}</strong><br/>
      <em>${escapeHtml(m.answer || '—')}</em><br/>
      ${new Date(m.createdAt).toLocaleString()}
    </div>
  `).join('');
}

function escapeHtml(str){
  return String(str||'')
    .replace(/&/g,'&amp;')
    .replace(/</g,'&lt;')
    .replace(/>/g,'&gt;');
}

// ---------- INIT ----------

document.addEventListener('DOMContentLoaded', ()=>{

  const loginSection = $('admin-login');
  const dashboardSection = $('admin-dashboard');
  const sidebar = document.querySelector('.admin-sidebar');
  const toggleBtn = document.querySelector('.sidebar-toggle');

  toggleBtn.addEventListener('click', ()=> sidebar.classList.toggle('active'));

  if(isAdminAuth()){
    loginSection.classList.add('hidden');
    dashboardSection.classList.remove('hidden');
    showView('overview');
    renderOverview();
  }

  $('admin-login-btn').addEventListener('click', ()=>{
    if($('admin-user').value===ADMIN_USER && $('admin-pass').value===ADMIN_PASS){
      setAdminAuth(true);
      loginSection.classList.add('hidden');
      dashboardSection.classList.remove('hidden');
      showView('overview');
      renderOverview();
    } else alert('Invalid credentials');
  });

  document.querySelectorAll('.admin-nav a').forEach(a=>{
    a.addEventListener('click', async e=>{
      e.preventDefault();
      if(a.id==='admin-logout') return;

      if(!isAdminAuth()) return alert('Login first');

      const view = a.dataset.view;
      showView(view);

      if(view==='overview') await renderOverview();
      if(view==='products') renderProductsAdmin();
      if(view==='orders') await renderOrders();
      if(view==='messages') await renderMessages();

      sidebar.classList.remove('active');
    });
  });

  $('admin-logout').addEventListener('click', ()=>{
    setAdminAuth(false);
    location.reload();
  });
});

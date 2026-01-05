// tech-inventory/js/admin.js – DEPLOYED FIX

const ADMIN_USER = 'admin';
const ADMIN_PASS = 'password123';
const API_BASE = 'https://tech-inventory-backend.onrender.com/api';

function $(id){ return document.getElementById(id); }

function isAdminAuth(){
  return localStorage.getItem('adminAuth') === 'true';
}

function setAdminAuth(val){
  val ? localStorage.setItem('adminAuth','true')
      : localStorage.removeItem('adminAuth');
}

function showView(name){
  document.querySelectorAll('.admin-view')
    .forEach(v=>v.classList.add('hidden'));
  const el = document.getElementById(name);
  if(el) el.classList.remove('hidden');
}

function safeProducts(){
  return Array.isArray(window.products) ? window.products : [];
}

// ---------- BACKEND FETCH ----------

async function fetchJSON(url){
  try{
    const res = await fetch(url);
    if(!res.ok) throw new Error('Fetch failed');
    return await res.json();
  }catch(e){
    console.error(e);
    return [];
  }
}

const fetchOrders   = () => fetchJSON(`${API_BASE}/orders`);
const fetchMessages = () => fetchJSON(`${API_BASE}/messages`);

// ---------- RENDERS ----------

async function renderOverview(){
  const [orders, messages] = await Promise.all([
    fetchOrders(),
    fetchMessages()
  ]);

  $('overview').innerHTML = `
    <h3>Overview</h3>
    <p>Products: <strong>${safeProducts().length}</strong></p>
    <p>Orders: <strong>${orders.length}</strong></p>
    <p>Messages: <strong>${messages.length}</strong></p>
  `;
}

function renderProductsAdmin(){
  $('products').innerHTML =
    `<h3>Products</h3>` +
    safeProducts().map(p=>`
      <div style="border-bottom:1px solid #eee;padding:8px 0">
        <strong>${p.name}</strong> — ${p.category} — ${p.price}
      </div>
    `).join('');
}

async function renderOrders(){
  const el = $('orders');
  const orders = await fetchOrders();
  const products = safeProducts();

  if(!orders.length){
    el.innerHTML = '<p>No orders yet.</p>';
    return;
  }

  el.innerHTML = orders.reverse().map(o=>`
    <div style="border-bottom:1px solid #ddd;padding:10px 0">
      <strong>Order ${o._id}</strong><br/>
      ${o.items.map(i=>{
        const p = products.find(x=>x.id===i.id);
        return `${p ? p.name : 'Unknown'} x${i.qty}`;
      }).join(', ')}
    </div>
  `).join('');
}

async function renderMessages(){
  const el = $('messages');
  const messages = await fetchMessages();

  if(!messages.length){
    el.innerHTML = '<p>No messages yet.</p>';
    return;
  }

  el.innerHTML = messages.reverse().map(m=>`
    <div style="border-bottom:1px solid #ddd;padding:10px 0">
      <strong>${m.question}</strong><br/>
      ${new Date(m.createdAt).toLocaleString()}
    </div>
  `).join('');
}

// ---------- INIT ----------

document.addEventListener('DOMContentLoaded', ()=>{

  const sidebar = document.querySelector('.admin-sidebar');
  document.querySelector('.sidebar-toggle')
    ?.addEventListener('click', ()=> sidebar.classList.toggle('active'));

  if(isAdminAuth()){
    $('admin-login').classList.add('hidden');
    $('admin-dashboard').classList.remove('hidden');
    showView('overview');
    renderOverview();
  }

  $('admin-login-btn').onclick = ()=>{
    if($('admin-user').value===ADMIN_USER &&
       $('admin-pass').value===ADMIN_PASS){
      setAdminAuth(true);
      location.reload();
    } else alert('Invalid credentials');
  };

  document.querySelectorAll('.admin-nav a').forEach(a=>{
    a.onclick = async e=>{
      e.preventDefault();
      if(!isAdminAuth()) return alert('Login first');

      const view = a.dataset.view;
      if(!view) return;

      showView(view);
      if(view==='overview') await renderOverview();
      if(view==='products') renderProductsAdmin();
      if(view==='orders') await renderOrders();
      if(view==='messages') await renderMessages();

      sidebar.classList.remove('active');
    };
  });

  $('admin-logout').onclick = ()=>{
    setAdminAuth(false);
    location.reload();
  };
});

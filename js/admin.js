// tech-inventory/js/admin.js – FIXED ORDERS + AI MESSAGES

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
  $(name)?.classList.remove('hidden');
}

// ---------- FETCH HELPERS ----------

async function fetchJSON(url){
  try{
    const res = await fetch(url);
    if(!res.ok) throw new Error('Fetch failed');
    return await res.json();
  }catch{
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
    <div style="display:grid;gap:10px">
      <div>📦 Orders: <strong>${orders.length}</strong></div>
      <div>💬 Messages: <strong>${messages.length}</strong></div>
    </div>
  `;
}

async function renderOrders(){
  const el = $('orders');
  const orders = (await fetchOrders()).reverse();

  if(!orders.length){
    el.innerHTML = '<p>No orders yet.</p>';
    return;
  }

  el.innerHTML = orders.map(o=>`
    <div style="
      border:1px solid #ddd;
      border-radius:6px;
      padding:10px;
      margin-bottom:10px;
    ">
      <strong>Order ID:</strong> ${o._id}<br>
      <strong>Name:</strong> ${o.name}<br>
      <strong>Phone:</strong> ${o.phone}<br>
      <strong>Total:</strong> $${o.total} JMD<br>
      <strong>Items:</strong>
      <ul>
        ${o.items.map(i=>`
          <li>Product ID: ${i.id} — Qty: ${i.qty}</li>
        `).join('')}
      </ul>
      <small>${new Date(o.createdAt).toLocaleString()}</small>
    </div>
  `).join('');
}

async function renderMessages(){
  const el = $('messages');
  const messages = (await fetchMessages()).reverse();

  if(!messages.length){
    el.innerHTML = '<p>No messages yet.</p>';
    return;
  }

  el.innerHTML = messages.map(m=>`
    <div style="
      border:1px solid #ddd;
      border-radius:6px;
      padding:10px;
      margin-bottom:10px;
    ">
      <strong>Question:</strong><br>${m.question}<br><br>
      <strong>Answer:</strong><br>${m.answer || '—'}<br>
      <small>${new Date(m.createdAt).toLocaleString()}</small>
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
      showView(view);

      if(view==='overview') await renderOverview();
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

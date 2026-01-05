// tech-inventory/js/admin.js – FINAL

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

async function fetchJSON(url, options={}){
  const res = await fetch(url, options);
  return res.ok ? res.json() : [];
}

const fetchOrders   = () => fetchJSON(`${API_BASE}/orders`);
const fetchMessages = () => fetchJSON(`${API_BASE}/messages`);

// ---------- ACTIONS ----------

async function deleteOrder(id){
  if(!confirm('Delete this order?')) return;
  await fetchJSON(`${API_BASE}/orders/${id}`, { method:'DELETE' });
  renderOrders();
}

async function deleteMessage(id){
  if(!confirm('Delete this message?')) return;
  await fetchJSON(`${API_BASE}/messages/${id}`, { method:'DELETE' });
  renderMessages();
}

// ---------- RENDERS ----------

async function renderOverview(){
  const [orders, messages] = await Promise.all([
    fetchOrders(),
    fetchMessages()
  ]);

  $('overview').innerHTML = `
    <h3>Overview</h3>
    <p>📦 Orders: <strong>${orders.length}</strong></p>
    <p>💬 Messages: <strong>${messages.length}</strong></p>
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
    <div style="border:1px solid #ddd;padding:10px;border-radius:6px;margin-bottom:10px">
      <strong>Order ID:</strong> ${o._id}<br>
      <strong>Name:</strong> ${o.name}<br>
      <strong>Phone:</strong> ${o.phone}<br>
      <strong>Status:</strong> ${o.status}<br>
      <strong>Total:</strong> $${o.total} JMD<br><br>

      <strong>Items:</strong>
      <ul>
        ${o.items.map(i=>`
          <li>${i.name} × ${i.qty}</li>
        `).join('')}
      </ul>

      <button onclick="deleteOrder('${o._id}')">Delete</button>
      <br><small>${new Date(o.createdAt).toLocaleString()}</small>
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
    <div style="border:1px solid #ddd;padding:10px;border-radius:6px;margin-bottom:10px">
      <strong>Question:</strong><br>${m.question}<br><br>
      <strong>Answer:</strong><br>${m.answer || '—'}<br><br>
      <button onclick="deleteMessage('${m._id}')">Delete</button>
      <br><small>${new Date(m.createdAt).toLocaleString()}</small>
    </div>
  `).join('');
}

// ---------- INIT ----------

document.addEventListener('DOMContentLoaded', ()=>{

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
      const view = a.dataset.view;
      showView(view);
      if(view==='overview') renderOverview();
      if(view==='orders') renderOrders();
      if(view==='messages') renderMessages();
    };
  });

  $('admin-logout').onclick = ()=>{
    setAdminAuth(false);
    location.reload();
  };
});

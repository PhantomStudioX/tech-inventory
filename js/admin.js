// tech-inventory/js/admin.js

const ADMIN_USER = 'admin';
const ADMIN_PASS = 'password123';
const API_BASE = 'https://tech-inventory-backend.onrender.com/api';

let currentView = 'overview';
let autoRefreshTimer = null;

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

async function fetchJSON(url, options = {}) {
  const res = await fetch(url, options);

  if (!res.ok) {
    const text = await res.text();
    console.error('API error:', text);
    throw new Error('Request failed');
  }

  return res.json();
}

const fetchOrders   = () => fetchJSON(`${API_BASE}/orders`);
const fetchMessages = () => fetchJSON(`${API_BASE}/messages`);
const fetchProducts = () => fetchJSON(`${API_BASE}/products`);

// ---------- ACTIONS ----------

async function updateOrderStatus(id, status){

  try {

    await fetchJSON(`${API_BASE}/orders/${id}/status`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        status
      })
    });

    await renderOrders();

  } catch(error){

    console.error(
      'Failed to update order status:',
      error
    );

    alert(
      '❌ Failed to update order status. Please try again.'
    );

  }

}

async function deleteOrder(id){
  if(!confirm('Delete this order?')) return;

  await fetchJSON(`${API_BASE}/orders/${id}`, {
    method:'DELETE'
  });

  renderOrders();
}

async function deleteMessage(id){
  if(!confirm('Delete this message?')) return;

  await fetchJSON(`${API_BASE}/messages/${id}`, {
    method:'DELETE'
  });

  renderMessages();
}


// ---------- ORDER STATUS STYLING ----------

function getStatusClass(status){

  switch(status){

    case 'Confirmed':
      return 'status-confirmed';

    case 'Completed':
      return 'status-completed';

    case 'Cancelled':
      return 'status-cancelled';

    default:
      return 'status-pending';

  }

}

// ---------- RENDERS ----------

async function renderOverview(){
  const [orders, messages, products] = await Promise.all([
    fetchOrders(),
    fetchMessages(),
    fetchProducts()
  ]);

  $('overview').innerHTML = `
    <h3>Overview</h3>

    <p>
      📦 Orders:
      <strong>${orders.length}</strong>
    </p>

    <p>
      💬 Messages:
      <strong>${messages.length}</strong>
    </p>

    <p>
      🛍️ Products:
      <strong>${products.length}</strong>
    </p>
  `;
}

async function renderOrders(){

  const el = $('orders');
  const orders = (await fetchOrders()).reverse();

  if(!orders.length){

    el.innerHTML =
      '<p class="admin-empty">No orders yet.</p>';

    return;

  }

  el.innerHTML = orders.map(o => `

    <div class="admin-order-card">

      <div class="order-header">

        <div>

          <h3>
            Order
          </h3>

          <small>
            ${new Date(o.createdAt).toLocaleString()}
          </small>

        </div>

        <span class="order-id">
          #${o._id.slice(-6)}
        </span>

      </div>


      <div class="order-customer">

        <p>
          <strong>Customer</strong><br>
          ${o.name}
        </p>

        <p>
          <strong>Phone</strong><br>
          ${o.phone}
        </p>

      </div>


      <div class="order-status-row">

        <strong>Status</strong>

        <select
          class="order-status-select ${getStatusClass(o.status)}"
          onchange="updateOrderStatus('${o._id}', this.value)"
        >

          <option
            value="Pending"
            ${o.status === 'Pending' ? 'selected' : ''}
          >
            Pending
          </option>

          <option
            value="Confirmed"
            ${o.status === 'Confirmed' ? 'selected' : ''}
          >
            Confirmed
          </option>

          <option
            value="Completed"
            ${o.status === 'Completed' ? 'selected' : ''}
          >
            Completed
          </option>

          <option
            value="Cancelled"
            ${o.status === 'Cancelled' ? 'selected' : ''}
          >
            Cancelled
          </option>

        </select>

      </div>


      <div class="order-items">

        <strong>Items</strong>

        <ul>

          ${o.items.map(i => `

            <li>
              ${i.name}
              <span>× ${i.qty}</span>
            </li>

          `).join('')}

        </ul>

      </div>


      <div class="order-footer">

        <strong>
          Total:
          <span>$${o.total} JMD</span>
        </strong>

        <button
          class="admin-delete-btn"
          onclick="deleteOrder('${o._id}')"
        >
          Delete
        </button>

      </div>

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
      <strong>Question:</strong><br>
      ${m.question}
      <br><br>

      <strong>Answer:</strong><br>
      ${m.answer || '—'}
      <br><br>

      <button onclick="deleteMessage('${m._id}')">
        Delete
      </button>

      <br>
      <small>${new Date(m.createdAt).toLocaleString()}</small>
    </div>
  `).join('');
}

// ---------- PRODUCTS ----------

async function renderProducts(){
  const el = $('product-list');

  try {
    const products = await fetchProducts();

    if(!products.length){
      el.innerHTML = '<p>No products yet.</p>';
      return;
    }

    el.innerHTML = `
      <div style="display:grid;gap:15px;margin-top:20px">

        ${products.map(product => {

  let stockClass = 'product-stock-in';

  if(product.stock === 0){
    stockClass = 'product-stock-out';
  } else if(product.stock <= 3){
    stockClass = 'product-stock-low';
  }

  return `
    <div class="admin-product-card ${stockClass}" style="
      padding:15px;
      border-radius:8px;
      display:flex;
      gap:15px;
      align-items:center;
    ">

            <img
              src="${product.image}"
              alt="${product.name}"
              style="
                width:90px;
                height:90px;
                object-fit:contain;
                border-radius:6px;
              "
              onerror="this.style.display='none'"
            >

            <div style="flex:1">

              <h4 style="margin:0 0 8px">
                ${product.name}
              </h4>

              <p style="margin:4px 0">
                <strong>Category:</strong>
                ${product.category}
              </p>

              <p style="margin:4px 0">
                <strong>Price:</strong>
                $${product.price} JMD
              </p>

              <p style="margin:4px 0">
                <strong>Stock:</strong>
                ${product.stock}
              </p>

              <p style="margin:4px 0">
                <strong>Colors:</strong>
                ${product.colors?.length
                  ? product.colors.join(', ')
                  : 'None'}
              </p>

            </div>

            <div style="
              margin-left:auto;
              flex-shrink:0;
              display:flex;
              gap:8px;
            ">
              <button onclick="editProduct('${product._id}')">
                Edit
              </button>
            
              <button onclick="deleteProduct('${product._id}')">
                Delete
              </button>
            </div>

                    </div>
                  `;
          }).join('')}

      </div>
    `;

  } catch(error){
    console.error('Failed to load products:', error);

    el.innerHTML = `
      <p>❌ Failed to load products.</p>
    `;
  }
}

// ---------- EDIT PRODUCT ----------

async function editProduct(id){

  const message = $('edit-product-form-message');

  try {

    message.textContent = 'Loading product...';

    const product = await fetchJSON(
      `${API_BASE}/products/${id}`
    );

    $('edit-product-name').value = product.name;
    $('edit-product-category').value = product.category;
    $('edit-product-price').value = product.price;
    $('edit-product-stock').value = product.stock;
    $('edit-product-image').value = product.image;
    $('edit-product-colors').value =
      product.colors?.join(', ') || '';

    $('edit-product-modal').classList.remove('hidden');
    $('edit-product-modal').style.display = 'flex';

    message.textContent = '';

    $('edit-product-modal').dataset.productId = id;

  } catch(error){

    console.error('Failed to load product:', error);

    message.textContent =
      '❌ Failed to load product.';
  }
}

function closeEditProductModal(){

  const modal = $('edit-product-modal');

  modal.classList.add('hidden');
  modal.style.display = 'none';

}

async function saveEditedProduct(){

  const modal = $('edit-product-modal');
  const productId = modal.dataset.productId;

  const name = $('edit-product-name').value.trim();
  const category = $('edit-product-category').value;
  const price = Number($('edit-product-price').value);
  const stock = Number($('edit-product-stock').value);
  const image = $('edit-product-image').value.trim();

  const colors = $('edit-product-colors').value
    .split(',')
    .map(color => color.trim())
    .filter(color => color.length > 0);

  const message = $('edit-product-form-message');

  if(!name || !category || !image){
    message.textContent =
      '❌ Please fill in all required fields.';
    return;
  }

  if(price < 0 || stock < 0){
    message.textContent =
      '❌ Price and stock cannot be negative.';
    return;
  }

  try {

    message.textContent = 'Saving changes...';

    await fetchJSON(`${API_BASE}/products/${productId}`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        name,
        category,
        price,
        stock,
        image,
        colors
      })
    });

    message.textContent =
      '✅ Product updated successfully!';

    await renderProducts();
    await renderOverview();

    closeEditProductModal();

  } catch(error){

    console.error('Failed to update product:', error);

    message.textContent =
      '❌ Failed to update product. Please try again.';
  }
}

async function deleteProduct(id){

  if(!confirm('Delete this product?')) return;

  try {

    await fetchJSON(`${API_BASE}/products/${id}`, {
      method: 'DELETE'
    });

    await renderProducts();
    await renderOverview();

  } catch(error){

    console.error('Failed to delete product:', error);

    alert('❌ Failed to delete product. Please try again.');

  }
}

// ---------- ADD PRODUCT ----------

async function addProduct(){

  const name = $('product-name').value.trim();
  const category = $('product-category').value;
  const price = Number($('product-price').value);
  const stock = Number($('product-stock').value);
  const image = $('product-image').value.trim();

  const colors = $('product-colors').value
    .split(',')
    .map(color => color.trim())
    .filter(color => color.length > 0);

  const message = $('product-form-message');

  if(!name || !category || !image){
    message.textContent =
      '❌ Please fill in all required fields.';
    return;
  }

  if(price < 0 || stock < 0){
    message.textContent =
      '❌ Price and stock cannot be negative.';
    return;
  }

  try {

    message.textContent = 'Adding product...';

    await fetchJSON(`${API_BASE}/products`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        name,
        category,
        price,
        stock,
        image,
        colors
      })
    });

    message.textContent =
      '✅ Product added successfully!';

    $('product-name').value = '';
    $('product-category').value = '';
    $('product-price').value = '';
    $('product-stock').value = '';
    $('product-image').value = '';
    $('product-colors').value = '';

    await renderProducts();
    await renderOverview();

    closeAddProductModal();

  } catch(error){

    console.error('Failed to add product:', error);

    message.textContent =
      '❌ Failed to add product. Please try again.';
  }
}

// ---------- ADD PRODUCT MODAL ----------

function openAddProductModal(){

  const modal = $('add-product-modal');

  modal.classList.remove('hidden');
  modal.style.display = 'flex';

  $('product-form-message').textContent = '';

}

function closeAddProductModal(){

  const modal = $('add-product-modal');

  modal.classList.add('hidden');
  modal.style.display = 'none';

}

// ---------- AUTO REFRESH ----------

function startAutoRefresh(){

  clearInterval(autoRefreshTimer);

  autoRefreshTimer = setInterval(async ()=>{

    if(!isAdminAuth()) return;

    try {

      await renderOverview();

      if(currentView === 'orders'){
        await renderOrders();
      }

      if(currentView === 'messages'){
        await renderMessages();
      }

      if(currentView === 'products'){
        await renderProducts();
      }

    } catch(error){

      console.error(
        'Auto-refresh failed:',
        error
      );

    }

  }, 10000);
}

// ---------- INIT ----------

document.addEventListener('DOMContentLoaded', ()=>{

  if(isAdminAuth()){

    $('admin-login').classList.add('hidden');
    $('admin-dashboard').classList.remove('hidden');
    $('admin-top-nav').classList.remove('hidden');

    showView('overview');

    renderOverview();
    startAutoRefresh();
  }

  $('admin-login-btn').onclick = ()=>{

    if(
      $('admin-user').value===ADMIN_USER &&
      $('admin-pass').value===ADMIN_PASS
    ){

      setAdminAuth(true);
      location.reload();

    } else {

      alert('Invalid credentials');

    }

  };

  document.querySelectorAll('.admin-nav a').forEach(a=>{

    a.onclick = async e=>{

      e.preventDefault();

      const view = a.dataset.view;

      currentView = view;

      showView(view);

      if(view==='overview'){
        renderOverview();
      }

      if(view==='orders'){
        renderOrders();
      }

      if(view==='messages'){
        renderMessages();
      }

      if(view==='products'){
        renderProducts();
      }

    };

  });

  $('admin-logout').onclick = ()=>{

    setAdminAuth(false);
    location.reload();

  };

  // Add Product modal
  $('show-add-product-btn').onclick =
    openAddProductModal;

  $('close-add-product-btn').onclick =
    closeAddProductModal;

  $('add-product-btn').onclick =
    addProduct;

  // Edit Product modal
  $('close-edit-product-btn').onclick =
    closeEditProductModal;

  $('save-edit-product-btn').onclick =
    saveEditedProduct;

});

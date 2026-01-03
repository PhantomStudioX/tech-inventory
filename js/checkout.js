// checkout.js - real checkout → backend

const API_BASE = 'http://localhost:5000/api';

async function showCheckout(){
  const area = document.getElementById('checkout-area');
  const cart = JSON.parse(localStorage.getItem('cart')||'[]');
  if(!area) return;

  if(cart.length===0){
    area.innerHTML = '<p>Your cart is empty. <a href="products.html">Continue shopping</a></p>';
    return;
  }

  let total = 0;

  const rows = cart.map(item=>{
    const p = products.find(x=>x.id===item.id);
    const priceNum = Number(p.price.replace(/[^0-9]/g,'')) || 0;
    total += priceNum * item.qty;
    return `
      <div class="checkout-item">
        <img src="${p.image}">
        <div>
          <strong>${p.name}</strong><br>
          Qty: ${item.qty}<br>
          Price: ${p.price}
        </div>
      </div>
    `;
  }).join('');

  area.innerHTML = `
    <div class="checkout-card">
      <h3>Order Summary</h3>
      ${rows}
      <hr>
      <p class="checkout-total">Total: <strong>JMD ${total}</strong></p>

      <h4>Customer Info</h4>
      <label>Name</label>
      <input id="cust-name" required>

      <label>Phone Number</label>
      <input id="cust-phone" required>

      <button id="place-order" class="btn full">Place Order</button>
    </div>
  `;

  document.getElementById('place-order').addEventListener('click', async ()=>{
    const name = document.getElementById('cust-name').value.trim();
    const phone = document.getElementById('cust-phone').value.trim();
    if(!name || !phone) return alert('Please fill all fields');

    const order = { name, phone, items: cart, total };

    await fetch(`${API_BASE}/orders`, {
      method:'POST',
      headers:{'Content-Type':'application/json'},
      body: JSON.stringify(order)
    });

    localStorage.removeItem('cart');
    alert('Order placed successfully');
    location.href = 'index.html';
  });
}

document.getElementById('checkout-area') && showCheckout();

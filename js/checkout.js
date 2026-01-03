// checkout.js – FIXED order summary rendering

const API_BASE = 'http://localhost:5000/api';

function showCheckout(){
  const area = document.getElementById('checkout-area');
  const cart = JSON.parse(localStorage.getItem('cart') || '[]');
  const productsList = Array.isArray(window.products) ? window.products : [];

  if(!area) return;

  if(cart.length === 0){
    area.innerHTML = '<p>Your cart is empty. <a href="products.html">Continue shopping</a></p>';
    return;
  }

  let total = 0;

  const rows = cart.map(item => {
    const p = productsList.find(x => x.id === item.id);
    if(!p){
      return `
        <div class="checkout-item">
          <div>
            <strong>Unknown product</strong><br>
            Qty: ${item.qty}
          </div>
        </div>
      `;
    }

    const itemTotal = p.price * item.qty;
    total += itemTotal;

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
      ${rows}

      <div class="checkout-total">
        <strong>Total:</strong> ${total}
      </div>

      <h4>Customer Info</h4>
      <input id="cust-name" placeholder="Full Name">
      <input id="cust-phone" placeholder="Phone Number">

      <button id="place-order" class="btn full" id="place-order">
        Place Order
      </button>
    </div>
  `;

  const btn = document.getElementById('place-order');

  btn.addEventListener('click', async () => {
    const name = document.getElementById('cust-name').value.trim() || 'Guest';
    const phone = document.getElementById('cust-phone').value.trim();

    if(!phone){
      alert('Please enter a phone number');
      return;
    }

    btn.disabled = true;
    btn.textContent = 'Placing order…';

    try {
      const res = await fetch(`${API_BASE}/orders`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name,
          phone,
          items: cart,
          total
        })
      });

      const data = await res.json();

      localStorage.removeItem('cart');
      window.location.href = `order-success.html?id=${data._id}`;

    } catch (err) {
      alert('Failed to place order. Please try again.');
      btn.disabled = false;
      btn.textContent = 'Place Order';
    }
  });
}

document.addEventListener('DOMContentLoaded', showCheckout);

// checkout.js – FINAL POPUP VERSION

const API_BASE = 'https://tech-inventory-backend.onrender.com/api';

function showCheckout() {
  const area = document.getElementById('checkout-area');
  const btn = document.getElementById('place-order-btn');
  const cart = JSON.parse(localStorage.getItem('cart') || '[]');

  if (!area || !btn) return;

  if (cart.length === 0) {
    area.innerHTML = '<p>Your cart is empty.</p>';
    btn.style.display = 'none';
    return;
  }

  let total = 0;

  const rows = cart.map(item => {
    const product = products.find(p => p.id === item.id);
    if (!product) return '';

    const priceNum = Number(String(product.price).replace(/[^0-9]/g, ''));
    total += priceNum * item.qty;

    return `
      <div class="checkout-item">
        <img src="${product.image}" alt="${product.name}">
        <div>
          <strong>${product.name}</strong><br>
          Qty: ${item.qty}<br>
          Price: ${product.price}
        </div>
      </div>
    `;
  }).join('');

  area.innerHTML = `
    ${rows}
    <div class="checkout-total">
      <strong>Total:</strong> $${total} JMD
    </div>

    <h4>Customer Info</h4>
    <input id="cust-name" placeholder="Full Name">
    <input id="cust-phone" placeholder="Phone Number">
  `;

  btn.onclick = async () => {
    const name = document.getElementById('cust-name').value.trim() || 'Guest';
    const phone = document.getElementById('cust-phone').value.trim();

    if (!phone) {
      alert('Please enter a phone number');
      return;
    }

    btn.disabled = true;
    btn.textContent = 'Placing order...';

    try {
      const res = await fetch(`${API_BASE}/orders`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name,
          phone,
          items: cart.map(item => {
            const product = products.find(p => p.id === item.id);
            return {
              id: item.id,
              name: product?.name || 'Unknown',
              price: product?.price || '',
              qty: item.qty
            };
          }),
          total
        })
      });

      if (!res.ok) throw new Error('Order failed');

      await res.json();

      // ✅ SUCCESS POPUP
      alert('✅ Order placed successfully! We will contact you shortly.');

      // Clear cart + reset UI
      localStorage.removeItem('cart');
      area.innerHTML = '<p>Thank you for your order.</p>';
      btn.style.display = 'none';

    } catch (err) {
      console.error(err);
      alert('❌ Failed to place order. Please try again.');
      btn.disabled = false;
      btn.textContent = 'Place Order';
    }
  };
}

document.addEventListener('DOMContentLoaded', showCheckout);

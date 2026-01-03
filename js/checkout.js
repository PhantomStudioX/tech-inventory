// tech-inventory/js/checkout.js

const API_BASE = 'http://localhost:5000/api';

function $(id) {
  return document.getElementById(id);
}

function getCart() {
  return JSON.parse(localStorage.getItem('cart') || '[]');
}

async function placeOrder() {
  const name = $('checkout-name').value.trim();
  const phone = $('checkout-phone').value.trim();
  const cart = getCart();

  if (!name || !phone) {
    alert('Please enter name and phone number');
    return;
  }

  if (!cart.length) {
    alert('Your cart is empty');
    return;
  }

  const total = cart.reduce((sum, i) => sum + i.price * i.qty, 0);

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

    if (!res.ok) throw new Error('Order failed');

    localStorage.removeItem('cart');
    alert('Order placed successfully!');
    window.location.href = 'index.html';

  } catch (err) {
    console.error(err);
    alert('Failed to place order');
  }
}

document.addEventListener('DOMContentLoaded', () => {
  const btn = $('place-order-btn');
  if (btn) btn.addEventListener('click', placeOrder);
});

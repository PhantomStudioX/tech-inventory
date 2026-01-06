// cart.js - stable version

function getCart() {
  return JSON.parse(localStorage.getItem('cart') || '[]');
}

function saveCart(cart) {
  localStorage.setItem('cart', JSON.stringify(cart));
}

function renderCartPage() {
  const container = document.getElementById('cart-contents');
  const cart = getCart();

  if (!container) return;

  if (cart.length === 0) {
    container.innerHTML = '<p>Your cart is empty.</p>';
    document.getElementById('cart-actions').innerHTML = '';
    return;
  }

  const html = cart.map(item => {
    const product = products.find(p => p.id === item.id);
    if (!product) return '';

    return `
      <div class="cart-item">
        <img src="${product.image}" alt="${product.name}">
        <div style="flex:1">
          <h4>${product.name}</h4>
          <p>Price: ${product.price}</p>
        </div>
        <div>
          <div class="qty-control">
            <button class="qty-btn" data-id="${item.id}" data-change="-1">−</button>
            <span class="qty-value">${item.qty}</span>
            <button class="qty-btn" data-id="${item.id}" data-change="1">+</button>
          </div>
          <button class="remove-item" data-id="${item.id}">Remove</button>
        </div>
      </div>
    `;
  }).join('');

  container.innerHTML = html;

  document.getElementById('cart-actions').innerHTML = `
    <a href="checkout.html" class="btn">Proceed to Checkout</a>
  `;

  document.querySelectorAll('.qty-btn').forEach(btn => {
    btn.addEventListener('click', () => {
      const id = Number(btn.dataset.id);
      const change = Number(btn.dataset.change);
      let cart = getCart();
      const item = cart.find(i => i.id === id);
      if (!item) return;

      item.qty += change;
      if (item.qty < 1) {
        cart = cart.filter(i => i.id !== id);
      }

      saveCart(cart);
      renderCartPage();
    });
  });

  document.querySelectorAll('.remove-item').forEach(btn => {
    btn.addEventListener('click', () => {
      let cart = getCart();
      cart = cart.filter(i => i.id !== Number(btn.dataset.id));
      saveCart(cart);
      renderCartPage();
    });
  });
}

if (document.getElementById('cart-contents')) {
  renderCartPage();
}

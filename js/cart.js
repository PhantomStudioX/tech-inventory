// tech-inventory/js/cart.js

function getCart() {
  return JSON.parse(localStorage.getItem('cart') || '[]');
}

function saveCart(cart) {
  localStorage.setItem('cart', JSON.stringify(cart));
}


// Format price
function formatCartPrice(price) {
  const value =
    typeof price === 'number'
      ? price
      : Number(String(price).replace(/[^0-9.]/g, '')) || 0;

  return `$${value} JMD`;
}


// Render cart
function renderCartPage() {

  const container =
    document.getElementById('cart-contents');

  const actions =
    document.getElementById('cart-actions');

  const cart =
    getCart();

  if (!container) return;


  // Remove products that no longer exist
  const validCart =
    cart.filter(item =>
      products.some(
        product => product._id === item.id
      )
    );


  if (validCart.length !== cart.length) {

    saveCart(validCart);

  }


  // Empty cart
  if (validCart.length === 0) {

    container.innerHTML = `
      <div class="empty-cart">

        <div class="empty-cart-icon">
          🛒
        </div>

        <h3>Your cart is empty</h3>

        <p>
          You haven't added anything to your cart yet.
        </p>

        <a
          href="products.html"
          class="btn"
        >
          Continue Shopping
        </a>

      </div>
    `;


    if (actions) {

      actions.innerHTML = '';

    }


    return;

  }


  // Calculate total items
  const totalItems =
    validCart.reduce(
      (total, item) =>
        total + item.qty,
      0
    );


  // Calculate subtotal
  const subtotal =
    validCart.reduce((total, item) => {

      const product =
        products.find(
          p => p._id === item.id
        );

      if (!product) return total;

      const price =
        typeof product.price === 'number'
          ? product.price
          : Number(
              String(product.price)
                .replace(/[^0-9.]/g, '')
            ) || 0;

      return total + (price * item.qty);

    }, 0);


  // Cart items
  const html =
    validCart.map(item => {

      const product =
        products.find(
          p => p._id === item.id
        );


      if (!product) return '';


      return `
        <div class="cart-item">

          <img
            src="${product.image}"
            alt="${product.name}"
          >

          <div style="flex:1">

            <h4>${product.name}</h4>

            <p>
              Price:
              ${formatCartPrice(product.price)}
            </p>

            <p>
              ${product.stock > 0
                ? `${product.stock} in stock`
                : 'Out of Stock'}
            </p>

          </div>


          <div>

            <div class="qty-control">

              <button
                class="qty-btn"
                data-id="${item.id}"
                data-change="-1"
              >
                −
              </button>

              <span class="qty-value">
                ${item.qty}
              </span>

              <button
                class="qty-btn"
                data-id="${item.id}"
                data-change="1"
                ${item.qty >= product.stock
                  ? 'disabled'
                  : ''}
              >
                +
              </button>

            </div>


            <button
              class="remove-item"
              data-id="${item.id}"
            >
              Remove
            </button>

          </div>

        </div>
      `;

    }).join('');


  container.innerHTML =
    html;


  // Cart summary
  if (actions) {

    actions.innerHTML = `
      <div class="cart-summary-content">

        <h3>Cart Summary</h3>

        <div class="cart-summary-row">

          <strong>Items</strong>

          <strong>
            ${totalItems}
          </strong>

        </div>


        <div class="cart-summary-row">

          <strong>Subtotal</strong>

          <strong>
            ${formatCartPrice(subtotal)}
          </strong>

        </div>

      </div>
    `;

  }


  // Quantity buttons
  document
    .querySelectorAll('.qty-btn')
    .forEach(btn => {

      btn.addEventListener(
        'click',
        () => {

          const id =
            btn.dataset.id;

          const change =
            Number(
              btn.dataset.change
            );


          let cart =
            getCart();


          const item =
            cart.find(
              i => i.id === id
            );


          if (!item) return;


          const product =
            products.find(
              p => p._id === id
            );


          if (!product) return;


          item.qty += change;


          // Don't allow quantity above stock
          if (item.qty > product.stock) {

            item.qty =
              product.stock;

          }


          // Remove when quantity reaches zero
          if (item.qty < 1) {

            cart =
              cart.filter(
                i => i.id !== id
              );

          }


          saveCart(cart);

          renderCartPage();

        }
      );

    });


  // Remove buttons
  document
    .querySelectorAll('.remove-item')
    .forEach(btn => {

      btn.addEventListener(
        'click',
        () => {

          let cart =
            getCart();


          const id =
            btn.dataset.id;


          cart =
            cart.filter(
              i => i.id !== id
            );


          saveCart(cart);

          renderCartPage();

        }
      );

    });

}


// Wait for MongoDB products to finish loading
window.addEventListener(
  'productsLoaded',
  () => {

    renderCartPage();

  }
);

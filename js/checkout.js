// tech-inventory/js/checkout.js

const CHECKOUT_API_BASE =
  'https://tech-inventory-backend.onrender.com/api';

function formatPrice(price) {

  const value =
    typeof price === 'number'
      ? price
      : Number(
          String(price).replace(/[^0-9.]/g, '')
        ) || 0;

  return `$${value.toLocaleString('en-US')} JMD`;
}


function showCheckout() {

  const area =
    document.getElementById('checkout-area');

  const btn =
    document.getElementById('place-order-btn');

  const cart =
    JSON.parse(
      localStorage.getItem('cart') || '[]'
    );


  if (!area || !btn) return;


  if (cart.length === 0) {

    area.innerHTML =
      '<p>Your cart is empty.</p>';

    btn.style.display = 'none';

    return;
  }


  let total = 0;

  let hasInvalidItem = false;


  const rows = cart.map(item => {

    const product =
      products.find(
        p => p._id === item.id
      );


    if (!product) {

      hasInvalidItem = true;

      return '';

    }


    // Make sure the quantity is not above current stock
    const quantity =
      Math.min(
        item.qty,
        product.stock
      );


    if(quantity < 1){

      hasInvalidItem = true;

      return '';

    }


    const priceNum =
      typeof product.price === 'number'
        ? product.price
        : Number(
            String(product.price)
              .replace(/[^0-9.]/g, '')
          ) || 0;


    total +=
      priceNum * quantity;


    return `
      <div class="checkout-item">

        <img
          src="${product.image}"
          alt="${product.name}"
        >

        <div>

          <strong>${product.name}</strong><br>

          Qty: ${quantity}<br>

          Price: ${formatPrice(product.price)}<br>

          Stock: ${product.stock}

        </div>

      </div>
    `;

  }).join('');


  if(hasInvalidItem){

    area.innerHTML = `
      <p>
        Some products in your cart are no longer
        available. Please return to the cart and
        update it before placing your order.
      </p>
    `;

    btn.style.display = 'none';

    return;

  }


  area.innerHTML = `

    ${rows}

    <div class="checkout-total">

      <strong>Total:</strong>
      ${formatPrice(total)}

    </div>


    <h4>Customer Info</h4>


    <input
      id="cust-name"
      placeholder="Full Name"
    >


    <input
      id="cust-phone"
      placeholder="Phone Number"
    >

  `;


  btn.style.display = 'block';


  btn.onclick = async () => {

    const name =
      document
        .getElementById('cust-name')
        .value
        .trim() || 'Guest';


    const phone =
      document
        .getElementById('cust-phone')
        .value
        .trim();


    if(!phone){

      showToast(
        'Please enter a phone number',
        'warning'
      );

      return;

    }


    // Check stock again before submitting
    const currentCart =
      JSON.parse(
        localStorage.getItem('cart') || '[]'
      );


    for(const item of currentCart){

      const product =
        products.find(
          p => p._id === item.id
        );


      if(!product){

        showToast(
          `${item.id} is no longer available.`,
          'error'
        );

        return;

      }


      if(product.stock <= 0){

        showToast(
          `${product.name} is out of stock.`,
          'error'
        );

        return;

      }


      if(item.qty > product.stock){

        showToast(
          `Only ${product.stock} of ${product.name} are available.`,
          'error'
        );

        return;

      }

    }


    btn.disabled = true;

    btn.textContent =
      'Placing order...';


    try {

      const res =
        await fetch(
          `${CHECKOUT_API_BASE}/orders`,
          {
            method: 'POST',

            headers: {
              'Content-Type':
                'application/json'
            },

            body: JSON.stringify({

              name,

              phone,

              items:
                currentCart.map(item => {

                  const product =
                    products.find(
                      p => p._id === item.id
                    );


                  return {

                    id: item.id,

                    name:
                      product?.name ||
                      'Unknown',

                    price:
                      product?.price ??
                      0,

                    qty:
                      item.qty

                  };

                }),

              total

            })

          }
        );


      if(!res.ok){

        throw new Error(
          'Order failed'
        );

      }


      await res.json();


      // SUCCESS TOAST
      showToast(
        'Order placed successfully! We will contact you shortly.'
      );


      // Clear cart
      localStorage.removeItem('cart');


      area.innerHTML =
        '<p>Thank you for your order.</p>';


      btn.style.display =
        'none';


    } catch(error){

      console.error(
        'Failed to place order:',
        error
      );


      showToast(
        'Failed to place order. Please try again.',
        'error'
      );


      btn.disabled =
        false;


      btn.textContent =
        'Place Order';

    }

  };

}


// Wait for MongoDB products to finish loading
window.addEventListener(
  'productsLoaded',
  () => {

    showCheckout();

  }
);

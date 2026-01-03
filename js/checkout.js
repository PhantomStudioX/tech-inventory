// checkout.js - mock checkout flow

function showCheckout(){
  const area = document.getElementById('checkout-area');
  const cart = JSON.parse(localStorage.getItem('cart')||'[]');
  if(!area) return;
  if(cart.length===0){
    area.innerHTML = '<p>Your cart is empty. <a href="products.html">Continue shopping</a></p>';
    return;
  }
  // build summary
  const rows = cart.map(item=>{
    const p = products.find(x=>x.id===item.id);
    return `<div style="display:flex;gap:12px;align-items:center;margin-bottom:8px;">
      <img src="${p.image}" style="width:80px;border-radius:6px;">
      <div><strong>${p.name}</strong><br>Qty: ${item.qty} • Price: ${p.price}</div>
    </div>`;
  }).join('');

  area.innerHTML = `
    <h3>Order Summary</h3>
    ${rows}
    <h4>Customer Info</h4>
    <label>Name</label><input id="cust-name" /><br/>
    <label>Phone</label><input id="cust-phone" /><br/>
    <button id="place-order" class="btn">Place Order</button>
  `;

  document.getElementById('place-order').addEventListener('click', ()=>{
    const name = document.getElementById('cust-name').value || 'Guest';
    const phone = document.getElementById('cust-phone').value || '';
    const orders = JSON.parse(localStorage.getItem('orders')||'[]');
    const order = {
      id: Date.now(),
      createdAt: new Date().toISOString(),
      name, phone,
      items: cart,
      status: 'placed'
    };
    orders.push(order);
    localStorage.setItem('orders', JSON.stringify(orders));
    localStorage.removeItem('cart');
    alert('Order placed. Order id: ' + order.id);
    window.location.href = 'products.html';
  });
}

if(document.getElementById('checkout-area')) showCheckout();

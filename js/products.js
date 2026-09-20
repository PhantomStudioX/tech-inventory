// tech-inventory/js/products.js

const API_BASE = 'https://tech-inventory-backend.onrender.com/api';

// Products loaded from MongoDB
let products = [];

// Fetch products from the backend
async function loadProductsFromAPI() {
  try {
    const response = await fetch(`${API_BASE}/products`);

    if (!response.ok) {
      throw new Error('Failed to fetch products');
    }

    products = await response.json();

    console.log('✅ Products loaded from MongoDB:', products);

    // Tell main.js that products are ready
    window.dispatchEvent(new Event('productsLoaded'));

  } catch (error) {
    console.error('❌ Failed to load products:', error);

    products = [];

    window.dispatchEvent(new Event('productsLoaded'));
  }
}

// Start loading products
loadProductsFromAPI();

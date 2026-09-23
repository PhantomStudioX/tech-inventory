// tech-inventory/js/products.js

const PRODUCTS_API_BASE =
  'https://tech-inventory-backend.onrender.com/api';

// Products loaded from MongoDB
let products = [];


// Fetch products from the backend
async function loadProductsFromAPI(isRefresh = false) {

  try {

    const response =
      await fetch(
        `${PRODUCTS_API_BASE}/products`
      );


    if (!response.ok) {
      throw new Error(
        'Failed to fetch products'
      );
    }


    const newProducts =
      await response.json();


    // Check whether the product data actually changed
    const productsChanged =
      JSON.stringify(products) !==
      JSON.stringify(newProducts);


    // Update local product data
    products =
      newProducts;


    if (!isRefresh) {

      console.log(
        '✅ Products loaded from MongoDB:',
        products
      );


      // Tell main.js that products are ready
      window.dispatchEvent(
        new Event('productsLoaded')
      );

    } else if (productsChanged) {

      console.log(
        '🔄 Products updated from MongoDB'
      );


      // Tell the storefront that products changed
      window.dispatchEvent(
        new Event('productsUpdated')
      );

    }


  } catch (error) {

    console.error(
      '❌ Failed to load products:',
      error
    );


    // Only clear products during the initial load
    if (!isRefresh) {

      products = [];

      window.dispatchEvent(
        new Event('productsLoaded')
      );

    }

  }

}


// Initial product load
loadProductsFromAPI();


// Check for product changes every 30 seconds
setInterval(() => {

  loadProductsFromAPI(true);

}, 30000);

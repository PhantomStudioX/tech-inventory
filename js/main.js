// Helper: Shuffle array (randomize order)
function shuffle(array) {
  return array.sort(() => Math.random() - 0.5);
}

// Helper: Get URL query parameter
function getQueryParam(name) {
  const params = new URLSearchParams(window.location.search);
  return params.get(name);
}

// Get daily "slice" of products for homepage (now randomized)
function getDailyProducts(products) {
  const count = 8;

  // Shuffle the entire list
  const randomized = shuffle([...products]);

  // Return the first 8 items
  return randomized.slice(0, count);
}

// Load products
function loadProducts() {
  const category = getQueryParam("category");
  const container = document.getElementById("product-list") || document.getElementById("featured-products");
  const titleEl = document.getElementById("category-title");

  let filtered = category
      ? products.filter(p => p.category === category)
      : getDailyProducts(products); // NOW RANDOM ON HOMEPAGE

  if (titleEl && category) {
    titleEl.textContent = category.charAt(0).toUpperCase() + category.slice(1);
  }

  if (!container) return;

  container.innerHTML = filtered.map(p => `
    <div class="product-card">
      <img id="img-${p.id}" src="${p.image}" alt="${p.name}">
      <h3>${p.name}</h3>

      <div class="color-options">
        ${p.colors.map(c => `
          <span class="color-dot" data-id="${p.id}" data-color="${c}" style="background:${c};"></span>
        `).join('')}
      </div>

      <p class="price">Price: ${p.price}</p>
      <p class="stock">Stock: ${p.stock}</p>
    </div>
  `).join('');

  enableColorSwitching();
}

// Fix color switching
function enableColorSwitching() {
  document.querySelectorAll(".color-dot").forEach(dot => {
    dot.addEventListener("click", () => {
      const id = dot.dataset.id;
      const color = dot.dataset.color;
      const img = document.getElementById(`img-${id}`);

      if (!img) return;

      const file = img.src.split("/").pop();
      const base = file.split("-")[0];  
      const folder = img.src.replace(/\/[^\/]*$/, "/");

      img.src = `${folder}${base}-${color}.jpg`;

      dot.parentElement.querySelectorAll(".color-dot").forEach(d => d.classList.remove("active-color"));
      dot.classList.add("active-color");
    });
  });
}

// Search filter
const searchInput = document.getElementById("search");
if (searchInput) {
  searchInput.addEventListener("input", () => {
    const query = searchInput.value.toLowerCase();
    const category = getQueryParam("category");

    // Filter by category first
    let filtered = products.filter(p => p.category === category);

    // Then filter by search term inside that category
    filtered = filtered.filter(p =>
      p.name.toLowerCase().includes(query)
    );

    // Sort alphabetically A → Z
    filtered.sort((a, b) => a.name.localeCompare(b.name));
    const container = document.getElementById("product-list");

    // If nothing matches → show message
    if (filtered.length === 0) {
      container.innerHTML = `
        <p class="no-results">No results found.</p>
      `;
      return;
    }

    container.innerHTML = filtered.map(p => `
      <div class="product-card">
        <img id="img-${p.id}" src="${p.image}" alt="${p.name}">
        <h3>${p.name}</h3>

        <div class="color-options">
          ${p.colors.map(c => `
            <span class="color-dot" data-id="${p.id}" data-color="${c}" style="background:${c};"></span>
          `).join('')}
        </div>

        <p class="price">Price: ${p.price}</p>
        <p class="stock">Stock: ${p.stock}</p>
      </div>
    `).join('');

    enableColorSwitching();
  });
}

window.addEventListener("DOMContentLoaded", loadProducts);

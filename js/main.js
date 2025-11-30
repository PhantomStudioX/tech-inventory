// Helper: Get URL query parameter
function getQueryParam(name) {
  const params = new URLSearchParams(window.location.search);
  return params.get(name);
}

// Load products for homepage or category
function loadProducts() {
  const category = getQueryParam("category");
  const container = document.getElementById("product-list") || document.getElementById("featured-products");
  const titleEl = document.getElementById("category-title");

  let filtered = products;
  if (category) {
    filtered = products.filter(p => p.category === category);
    if (titleEl) titleEl.textContent = category.charAt(0).toUpperCase() + category.slice(1);
  } else {
    filtered = products.slice(0, 4); // show first 4 as featured
  }

  if (!container) return;

  container.innerHTML = filtered.map(p => `
    <div class="product-card">
      <img id="img-${p.id}" src="${p.image}" alt="${p.name}">
      <h3>${p.name}</h3>

      <!-- Color dots -->
      <div class="color-options">
        ${(p.colors || []).map(c => `
          <span class="color-dot"
            data-id="${p.id}"
            data-color="${c}"
            style="background:${c};">
          </span>
        `).join('')}
      </div>

      <p class="price">Price: ${p.price}</p>
      <p class="stock">Stock: ${p.stock}</p>
    </div>
  `).join('');

  enableColorSwitching();
}

// NEW — enable color switching
function enableColorSwitching() {
  document.querySelectorAll(".color-dot").forEach(dot => {
    dot.addEventListener("click", () => {
      const id = dot.getAttribute("data-id");
      const color = dot.getAttribute("data-color");

      const img = document.getElementById(`img-${id}`);
      if (!img) return;

      // Build new image filename:
      const base = img.src.split("/").pop().split(".")[0]; 
      const folder = img.src.replace(/\/[^\/]*$/, "/");

      // If original = iphone15.jpg → base = "iphone15"
      const mainBase = base.includes("-") ? base.split("-")[0] : base;

      img.src = `${folder}${mainBase}-${color}.jpg`;

      // Highlight selected dot
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
    const filtered = products.filter(p => p.name.toLowerCase().includes(query));
    const container = document.getElementById("product-list");
    container.innerHTML = filtered.map(p => `
      <div class="product-card">
        <img id="img-${p.id}" src="${p.image}" alt="${p.name}">
        <h3>${p.name}</h3>

        <!-- Color dots (search results too!) -->
        <div class="color-options">
          ${(p.colors || []).map(c => `
            <span class="color-dot"
              data-id="${p.id}"
              data-color="${c}"
              style="background:${c};">
            </span>
          `).join('')}
        </div>

        <p class="price">Price: ${p.price}</p>
        <p class="stock">Stock: ${p.stock}</p>
      </div>
    `).join('');

    enableColorSwitching();
  });
}

// Initialize
window.addEventListener("DOMContentLoaded", loadProducts);

// products.js
// Responsible for: discount badges, dual slider, category filtering, sorting, combined live filtering
// Relies on addProductToCart(...) from your existing script.js for cart behavior.

const BASE_URL = window.location.hostname === "localhost" || window.location.hostname === "127.0.0.1"
    ? "http://localhost:3000"
    : "https://calliope-backend.onrender.com";

const API_URL = `${BASE_URL}/calliope`;

document.addEventListener("DOMContentLoaded", () => {

  /* ---------- DOM Refs ---------- */
  const sidebar = document.getElementById("filter-sidebar");
  const toggleBtn = document.getElementById("sidebar-toggle");
  const sidebarClose = document.getElementById("sidebar-close");

  const rangeMin = document.getElementById("range-min");
  const rangeMax = document.getElementById("range-max");
  const inputMin = document.getElementById("price-min-input");
  const inputMax = document.getElementById("price-max-input");
  const priceMinText = document.getElementById("price-min-text");
  const priceMaxText = document.getElementById("price-max-text");
  const productsGrid = document.getElementById("products-grid");
  // const allCards = Array.from(document.querySelectorAll(".shop-card"));
  const allCards = []
  const sortSelect = document.getElementById("sort-select");
  const categoryCheckboxes = Array.from(document.querySelectorAll(".categories-list input[type=checkbox]"));
  const applyBtn = document.getElementById("apply-filters");
  const clearBtn = document.getElementById("clear-filters");

  /* ---------- Sidebar open/close ---------- */
  function openSidebar(){
    sidebar.classList.remove("collapsed");
    sidebar.setAttribute("aria-hidden", "false");
    toggleBtn.setAttribute("aria-expanded", "true");
    document.body.classList.add("sidebar-open"); // added for CSS movement
    toggleBtn.innerHTML = "‹";
  }
  function closeSidebar(){
    sidebar.classList.add("collapsed");
    sidebar.setAttribute("aria-hidden", "true");
    toggleBtn.setAttribute("aria-expanded", "false");
    document.body.classList.remove("sidebar-open");
    toggleBtn.innerHTML = "›";
  }

  toggleBtn.addEventListener("click", () => {
    if(sidebar.classList.contains("collapsed")) openSidebar();
    else closeSidebar();
  });
  sidebarClose.addEventListener("click", closeSidebar);

  /* ---------- Setup discounts and product buttons ---------- */
  allCards.forEach(card => {
    const oldP = Number(card.dataset.oldprice || card.dataset.price || 0);
    const newP = Number(card.dataset.price || 0);
    const sale = oldP > newP ? Math.round(((oldP - newP) / oldP) * 100) : 0;
    const badge = card.querySelector(".sale-badge");
    badge.textContent = sale > 0 ? `-${sale}%` : "";

    // Update visible price text if needed
    const oldEl = card.querySelector(".old-price");
    const newEl = card.querySelector(".new-price");
    if(oldEl) oldEl.textContent = (oldP ? oldP + " GEL" : "");
    if(newEl) newEl.textContent = newP + " GEL";

    // Attach add-to-cart handler using global addProductToCart
    const addBtn = card.querySelector(".product-add");
    if(addBtn){
      addBtn.addEventListener("click", () => {
        // use the addProductToCart function defined in script.js
        if(typeof addProductToCart === "function"){
          addProductToCart({
            name: card.dataset.name,
            price: Number(card.dataset.price),
            sourceImageEl: card.querySelector("img")
          });
        } else {
          console.warn("addProductToCart not found - ensure script.js defines it.");
        }
      });
    }
  });

  /* ---------- Range defaults (detect min/max from products) ---------- */
  const prices = allCards.map(c => Number(c.dataset.price || 0)).filter(p => p > 0);
  const globalMin = Math.min(...prices, 20);
  const globalMax = Math.max(...prices, 2950);

  // initialize range inputs
  rangeMin.min = globalMin;
  rangeMax.min = globalMin;
  rangeMin.max = globalMax;
  rangeMax.max = globalMax;
  rangeMin.value = globalMin;
  rangeMax.value = globalMax;

  inputMin.value = globalMin;
  inputMax.value = globalMax;
  priceMinText.textContent = globalMin + " ₾";
  priceMaxText.textContent = globalMax + " ₾";

  // helper to clamp values
  function clamp(v, a, b){ return Math.max(a, Math.min(b, v)); }

  /* ---------- Visual highlight between two ranges ---------- */
  // create highlight element
  const track = document.querySelector(".dual-range .range-track");
  const highlight = document.createElement("div");
  highlight.className = "range-highlight";
  track.parentElement.appendChild(highlight);

  function updateHighlight(){
    const parentRect = track.getBoundingClientRect();
    const min = Number(rangeMin.min);
    const max = Number(rangeMin.max);
    const val1 = Number(rangeMin.value);
    const val2 = Number(rangeMax.value);
    const leftPerc = ((Math.min(val1,val2) - min) / (max - min)) * 100;
    const rightPerc = ((Math.max(val1,val2) - min) / (max - min)) * 100;
    highlight.style.left = leftPerc + "%";
    highlight.style.width = (rightPerc - leftPerc) + "%";
  }

  updateHighlight();

  /* ---------- Sync range <-> inputs ---------- */
  function syncFromRanges(){
    let a = Number(rangeMin.value);
    let b = Number(rangeMax.value);
    if(a > b){ // prevent overlap
      const tmp = a; a = b; b = tmp;
    }
    a = clamp(a, Number(rangeMin.min), Number(rangeMin.max));
    b = clamp(b, Number(rangeMax.min), Number(rangeMax.max));
    inputMin.value = a;
    inputMax.value = b;
    priceMinText.textContent = a + " ₾";
    priceMaxText.textContent = b + " ₾";
    updateHighlight();
  }

  function syncFromInputs(){
    let a = Number(inputMin.value) || globalMin;
    let b = Number(inputMax.value) || globalMax;
    if(a > b){ const tmp = a; a = b; b = tmp; }
    a = clamp(a, Number(rangeMin.min), Number(rangeMin.max));
    b = clamp(b, Number(rangeMax.min), Number(rangeMax.max));
    rangeMin.value = a;
    rangeMax.value = b;
    priceMinText.textContent = a + " ₾";
    priceMaxText.textContent = b + " ₾";
    updateHighlight();
  }

  rangeMin.addEventListener("input", () => { syncFromRanges(); });
  rangeMax.addEventListener("input", () => { syncFromRanges(); });
  inputMin.addEventListener("change", () => { syncFromInputs(); });
  inputMax.addEventListener("change", () => { syncFromInputs(); });

  /* ---------- Filtering logic (combined) ---------- */
  function getActiveCategories(){
    return categoryCheckboxes.filter(cb => cb.checked).map(cb => cb.value);
  }

  function applyFiltersAndSort(){
    const minVal = Number(rangeMin.value);
    const maxVal = Number(rangeMax.value);
    const activeCats = getActiveCategories(); // array of strings
    const sortBy = sortSelect.value;

    // first filter by price & category
    let visible = allCards.filter(card => {
      const price = Number(card.dataset.price || 0);
      if(price < minVal || price > maxVal) return false;

      if(activeCats.length === 0) return true; // no category filter -> pass

      const categories = (card.dataset.category || "").split(/\s+/).map(s => s.trim()).filter(Boolean);
      // if any active category matches card categories -> show
      return activeCats.some(ac => categories.includes(ac));
    });

    // then sort
    visible.sort((a,b) => {
      if(sortBy === "default") return 0;
      if(sortBy === "popularity"){
        return Number(b.dataset.popularity || 0) - Number(a.dataset.popularity || 0);
      }
      if(sortBy === "rating"){
        return Number(b.dataset.rating || 0) - Number(a.dataset.rating || 0);
      }
      if(sortBy === "date"){
        // newest first
        return new Date(b.dataset.date || 0) - new Date(a.dataset.date || 0);
      }
      if(sortBy === "price-asc"){
        return Number(a.dataset.price || 0) - Number(b.dataset.price || 0);
      }
      if(sortBy === "price-desc"){
        return Number(b.dataset.price || 0) - Number(a.dataset.price || 0);
      }
      return 0;
    });

    // hide all first
    allCards.forEach(c => c.classList.add("hidden"));

    // append visible in the sorted order to the grid and unhide
    visible.forEach(card => {
      card.classList.remove("hidden");
      productsGrid.appendChild(card);
    });

    // if none visible -> show a friendly message
    let noMsg = document.getElementById("no-products-msg");
    if(visible.length === 0){
      if(!noMsg){
        noMsg = document.createElement("p");
        noMsg.id = "no-products-msg";
        noMsg.style.color = "var(--muted)";
        noMsg.style.marginTop = "18px";
        noMsg.textContent = currentTranslations().noProducts;
        productsGrid.parentElement.insertBefore(noMsg, productsGrid.nextSibling);
      } else {
        noMsg.textContent = currentTranslations().noProducts;
      }
    } else {
      if(noMsg) noMsg.remove();
    }
  }

  // Apply immediately on page load (to reflect default ranges)
  applyFiltersAndSort();

  // Apply on interactions
  applyBtn.addEventListener("click", () => applyFiltersAndSort());
  clearBtn.addEventListener("click", () => {
    // reset ranges
    rangeMin.value = globalMin;
    rangeMax.value = globalMax;
    inputMin.value = globalMin;
    inputMax.value = globalMax;
    priceMinText.textContent = globalMin + " ₾";
    priceMaxText.textContent = globalMax + " ₾";
    updateHighlight();
    // uncheck categories
    categoryCheckboxes.forEach(cb => cb.checked = false);
    // reset sort
    sortSelect.value = "default";
    applyFiltersAndSort();
  });

  // live apply on sort change and on checkbox change
  sortSelect.addEventListener("change", applyFiltersAndSort);
  categoryCheckboxes.forEach(cb => cb.addEventListener("change", applyFiltersAndSort));
  rangeMin.addEventListener("change", applyFiltersAndSort);
  rangeMax.addEventListener("change", applyFiltersAndSort);

  /* ---------- Accessibility: close sidebar on outside click ---------- */
  document.addEventListener("click", (e) => {
    if(!sidebar.classList.contains("collapsed")){
      const inside = sidebar.contains(e.target) || toggleBtn.contains(e.target);
      if(!inside){
        closeSidebar();
      }
    }
  });

  // keyboard support: Esc closes sidebar
  document.addEventListener("keydown", (e) => {
    if(e.key === "Escape" && !sidebar.classList.contains("collapsed")){
      closeSidebar();
    }
  });

  /* ---------- Language Support for Products Page ---------- */
 const translations = {
  ka: {
    filter: "ფილტრი",
    apply: "ფილტრის მიღება",
    clear: "გასუფთავება",
    cart: "კალათა",
    checkout: "გადახდა",
    noProducts: "არ მოიძებნა პროდუქტები მოცემული პირობებით.",
    addToCart: "კალათაში დამატება"
  },
  en: {
    filter: "Filter",
    apply: "Apply Filters",
    clear: "Clear",
    cart: "Cart",
    checkout: "Checkout",
    noProducts: "No products found for selected filters.",
    addToCart: "Add to cart"
  }
};


  function currentTranslations(){
    const active = document.querySelector(".lang-btn.active");
    const lang = active ? active.dataset.lang : "ka";
    return translations[lang] || translations.ka;
  }

  // initialize UI with default language (button marked active in HTML)
  function applyLanguage(lang){
    // translate product buttons
document.querySelectorAll(".product-add").forEach(btn => {
  btn.textContent = t.addToCart;
});
    const t = translations[lang] || translations.ka;
    const headerH3 = document.querySelector(".filter-header h3");
    if(headerH3) headerH3.textContent = t.filter;
    const applyEl = document.getElementById("apply-filters");
    if(applyEl) applyEl.textContent = t.apply;
    const clearEl = document.getElementById("clear-filters");
    if(clearEl) clearEl.textContent = t.clear;
    const cartHeader = document.querySelector(".cart-header h3");
    if(cartHeader) cartHeader.textContent = t.cart;
    const checkoutBtn = document.getElementById("checkout");
    if(checkoutBtn) checkoutBtn.textContent = t.checkout;

    const noMsg = document.getElementById("no-products-msg");
    if(noMsg) noMsg.textContent = t.noProducts;
  }

  // wire lang buttons
  const langButtons = Array.from(document.querySelectorAll(".lang-btn"));
  langButtons.forEach(btn => {
    btn.addEventListener("click", () => {
      langButtons.forEach(b => {
        b.classList.remove("active");
        b.setAttribute("aria-pressed", "false");
      });
      btn.classList.add("active");
      btn.setAttribute("aria-pressed", "true");
      applyLanguage(btn.dataset.lang);
    });
  });

  // initial apply (respect the active class set in HTML)
  const activeBtn = document.querySelector(".lang-btn.active");
  applyLanguage(activeBtn ? activeBtn.dataset.lang : "ka");

});

async function loadProductsFromBackend() {
    try {
        document.getElementById("products-grid").innerHTML = "";

        const response = await fetch(`${API_URL}/`);
        const result = await response.json();
        const products = result.data
        
        products.forEach(p => {
            const card = document.createElement("div");
            card.className = "shop-card";
            
            card.dataset.name = p.name;
            card.dataset.category = p.category;
            card.dataset.price = p.price;
            card.dataset.oldprice = p.oldPrice || p.price;
            card.dataset.popularity = p.popularity || 0;
            card.dataset.rating = p.rating || 5;
            card.dataset.date = p.date || new Date().toISOString().split("T")[0];

            card.innerHTML = `
                <div class="sale-badge"></div>
                <img src="${BASE_URL}/img/${p.imageURL}" alt="${p.name}">
                <h3>${p.name}</h3>
                <div class="price-box">
                    ${p.oldPrice ? `<span class="old-price">${p.oldPrice} GEL</span>` : ""}
                    <span class="new-price">${p.price} GEL</span>
                </div>
                <button class="product-add">კალათაში დამატება</button>
            `;

            document.getElementById("products-grid").appendChild(card);
            initializeNewCard(card, p);

            
            initializeNewCard(card, p);
        });

        allCards = Array.from(document.querySelectorAll(".shop-card"));

        if(typeof applyFiltersAndSort === "function") applyFiltersAndSort();

    } catch (error) {
        console.error("Backend'den veri çekilirken hata oluştu:", error);
    }
}

function initializeNewCard(card, p) {
    const oldP = Number(p.oldPrice || p.price);
    const newP = Number(p.price);
    const sale = oldP > newP ? Math.round(((oldP - newP) / oldP) * 100) : 0;
    const badge = card.querySelector(".sale-badge");
    if(badge) badge.textContent = sale > 0 ? `-${sale}%` : "";

    const addBtn = card.querySelector(".product-add");
    if(addBtn) {
        addBtn.addEventListener("click", () => {
            if(typeof addProductToCart === "function") {
                addProductToCart({
                    name: p.name,
                    price: Number(p.price),
                    sourceImageEl: card.querySelector("img")
                });
            }
        });
    }
}

loadProductsFromBackend();

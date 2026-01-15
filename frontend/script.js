// ================= GLOBAL =================
let cartCount = 0;
let cartTotal = 0;

// DOM
const drawer = document.getElementById("cart-drawer");
const openCart = document.getElementById("open-cart");
const closeCart = document.getElementById("close-cart");
const cartItemsBox = document.getElementById("cart-items");
const cartCountEl = document.getElementById("cart-count");
const cartTotalEl = document.getElementById("cart-total");

const burgerBtn = document.getElementById("burger");
const navLinks = document.getElementById("nav-links");
const closeNavBtn = document.getElementById("close-nav");

function exists(el){ return el !== null && el !== undefined; }

// ================= BADGE =================
function refreshCartBadge(){
  if(cartCount <= 0){
    cartCountEl.style.display = "none";
  } else {
    cartCountEl.style.display = "inline-flex";
    cartCountEl.innerText = cartCount;
  }
}
refreshCartBadge();

// ================= CART DRAWER =================
function openCartDrawer(){
  drawer.classList.add("active");
}
function closeCartDrawer(){
  drawer.classList.remove("active");
}

openCart.addEventListener("click", () => {
  if(drawer.classList.contains("active")){
    closeCartDrawer();
  } else {
    openCartDrawer();
  }
});
closeCart.addEventListener("click", closeCartDrawer);

// ================= FLY ANIMATION =================
function flyToCart(imgSrc, startRect, endRect){
  return new Promise(res => {
    const clone = document.createElement("img");
    clone.src = imgSrc;
    clone.className = "flying-image";
    clone.style.position = "fixed";
    clone.style.left = startRect.left + "px";
    clone.style.top = startRect.top + "px";
    clone.style.width = startRect.width + "px";
    clone.style.height = startRect.height + "px";
    clone.style.transition = ".6s ease";

    document.body.appendChild(clone);

    requestAnimationFrame(() => {
      clone.style.transform =
        `translate(${endRect.left - startRect.left}px, ${endRect.top - startRect.top}px) scale(.25)`;
      clone.style.opacity = "0";
    });

    clone.addEventListener("transitionend", () => { 
      clone.remove(); 
      res(); 
    });
  });
}

// ================= FLOATING CART =================
function createOrGetFloatingCart(){
  let el = document.querySelector(".cart-floating");
  if(el) return el;

  el = document.createElement("div");
  el.className = "cart-floating";
  el.innerHTML = `
    <img src="img/cart.png" alt="cart preview" class="floating-img" />
    <div class="floating-count">0</div>
  `;
  document.body.appendChild(el);

  el.addEventListener("click", () => {
    if(drawer.classList.contains("active")){
      closeCartDrawer();
    } else {
      openCartDrawer();
    }
  });

  return el;
}

function showFloatingCart(){
  if(window.innerWidth > 900) return;

  const el = createOrGetFloatingCart();
  const img = el.querySelector(".floating-img");
  const count = el.querySelector(".floating-count");

  img.src = "img/cart.png";
  img.style.objectFit = "contain";
  count.innerText = cartCount;

  el.classList.remove("pulse");
  void el.offsetWidth;
  el.classList.add("pulse");

  el.style.display = "flex";
}

function hideFloatingCart(){
  const el = document.querySelector(".cart-floating");
  if(el) el.style.display = "none";
}

window.addEventListener("resize", () => {
  const el = document.querySelector(".cart-floating");
  if(!el) return;

  if(window.innerWidth > 900){
    el.style.display = "none";
  } else if(cartCount > 0){
    el.style.display = "flex";
  }
});

// ================= ADD TO CART =================
async function addProductToCart({name, price, sourceImageEl}){

  // 📌 ავტომატურად იღებს პროდუქტის ფოტოს
  const img = sourceImageEl.src;

  cartCount++;
  refreshCartBadge();

  const start = sourceImageEl.getBoundingClientRect();

  let endRect;
  const floating = document.querySelector(".cart-floating");
  if(floating && window.innerWidth <= 900){
    const previewImg = floating.querySelector(".floating-img");
    try {
      endRect = previewImg.getBoundingClientRect();
    } catch {
      endRect = openCart.getBoundingClientRect();
    }
  } else {
    endRect = openCart.getBoundingClientRect();
  }

  await flyToCart(img, start, endRect);

  const item = document.createElement("div");
  item.className = "cart-item";
  item.innerHTML = `
    <img src="${img}">
    <div class="meta">
      <p>${name}</p>
      <p class="price">${price} GEL</p>
    </div>
    <div class="actions">
      <button class="remove-item">❌</button>
    </div>
  `;
  cartItemsBox.appendChild(item);

  cartTotal += Number(price);
  cartTotalEl.innerText = cartTotal + " GEL";

  // DELETE ITEM
  item.querySelector(".remove-item").addEventListener("click", () => {
    item.remove();
    cartCount--;
    cartTotal -= Number(price);

    refreshCartBadge();
    cartTotalEl.innerText = cartTotal + " GEL";

    if(cartCount <= 0){
      hideFloatingCart();
    }
  });

  showFloatingCart();
}

// ================= PRODUCT BUTTONS =================
document.querySelectorAll(".product-open").forEach(btn => {
  btn.addEventListener("click", () => {
    const card = btn.closest(".product");

    addProductToCart({
      name: card.dataset.name,
      price: card.dataset.price,
      sourceImageEl: card.querySelector("img")  // 📌 აი აქ იღებს ავტომატურად ფოტოს
    });
  });
});

// ================= MOBILE MENU =================
function openMobileNav(){
  navLinks.classList.add("mobile","open");
  burgerBtn.classList.add("open");
  document.body.style.overflow = "hidden";
  hideFloatingCart();
}

function closeMobileNav(){
  navLinks.classList.remove("open");
  burgerBtn.classList.remove("open");
  document.body.style.overflow = "";

  if(cartCount > 0){
    showFloatingCart();
  }
}

burgerBtn.addEventListener("click", () => {
  if(burgerBtn.classList.contains("open")){
    closeMobileNav();
  } else {
    openMobileNav();
  }
});

closeNavBtn.addEventListener("click", closeMobileNav);

// ================= REFRESH =================
document.getElementById("site-logo")?.addEventListener("click", () => location.reload());
document.getElementById("brand-text")?.addEventListener("click", () => location.reload());
document.getElementById("hero-headline")?.addEventListener("click", () => location.reload());
// ================= STICKY HEADER SCROLL EFFECT =================
(function(){
  const header = document.querySelector('.site-header');
  if(!header) return;

  const SCROLL_THRESHOLD = 10; // px

  function onScroll(){
    if(window.scrollY > SCROLL_THRESHOLD){
      header.classList.add('scrolled');
    } else {
      header.classList.remove('scrolled');
    }
  }

  // init check + listener
  onScroll();
  window.addEventListener('scroll', onScroll, {passive: true});
})();
// =========================
// LANGUAGE SWITCH SYSTEM
// =========================

const langButtons = document.querySelectorAll(".lang-btn");

// მცირედი ტექსტების სია
const translations = {
  ka: {
    home: "მთავარი",
    products: "პროდუქცია",
    about: "ჩვენს შესახებ",
    contact: "კონტაქტი",
    headline: "შექმენი შენი<br>ხელნაკეთი ისტორია",
    lead: "აღმოაჩინე პრემიუმ ხარისხის ხელნაკეთი სამკაულები.",
    featured: "რჩეული კოლექცია",
    addToCart: "კალათაში დამატება"
  },

  en: {
    home: "Home",
    products: "Products",
    about: "About Us",
    contact: "Contact",
    headline: "Create Your<br>Handmade Story",
    lead: "Discover premium quality handmade jewelry.",
    featured: "Featured Collection",
    addToCart: "Add to Cart"
  }
};

function switchLanguage(lang) {

  // update active state
  langButtons.forEach(btn => btn.classList.remove("active"));
  document.querySelectorAll(`.lang-btn[data-lang="${lang}"]`)
    .forEach(btn => btn.classList.add("active"));


  // change nav links
  document.querySelector('a[href="#home"]').textContent = translations[lang].home;
  document.querySelector('a[href="products.html"]').textContent = translations[lang].products;
  document.querySelector('a[href="#about"]').textContent = translations[lang].about;
  document.querySelector('a[href="#contact"]').textContent = translations[lang].contact;

  // hero
  document.getElementById("hero-headline").innerHTML = translations[lang].headline;
  document.querySelector(".lead").textContent = translations[lang].lead;

  // featured title
  document.querySelector(".section-title").textContent = translations[lang].featured;

  // product buttons
  document.querySelectorAll(".product-open").forEach(btn => {
    btn.textContent = translations[lang].addToCart;
  });
}

// click listeners
langButtons.forEach(btn => {
  btn.addEventListener("click", () => {
    const lang = btn.dataset.lang;
    switchLanguage(lang);
  });
});
// 🛠 FIX: prevent mobile menu staying open when switching to desktop
window.addEventListener("resize", () => {
  if(window.innerWidth > 900){
    navLinks.classList.remove("open", "mobile");
    burgerBtn.classList.remove("open");
    document.body.style.overflow = "";
  }
});
// =========================
// LANGUAGE SYSTEM (SINGLE, SAFE)
// =========================

(function () {
  const langButtons = document.querySelectorAll(".lang-btn");
  if (!langButtons.length) return; // თუ HTML-ში არ არის ბტონები, უბრალოდ არ ავარდება

  const translations = {
    ka: {
      home: "მთავარი",
      products: "პროდუქცია",
      about: "ჩვენს შესახებ",
      contact: "კონტაქტი",
      headline: "შექმენი შენი<br>ხელნაკეთი ისტორია",
      lead: "აღმოაჩინე პრემიუმ ხარისხის ხელნაკეთი სამკაულები.",
      featured: "რჩეული კოლექცია",
      addToCart: "კალათაში დამატება"
    },
    en: {
      home: "Home",
      products: "Products",
      about: "About Us",
      contact: "Contact",
      headline: "Create Your<br>Handmade Story",
      lead: "Discover premium quality handmade jewelry.",
      featured: "Featured Collection",
      addToCart: "Add to Cart"
    }
  };

  function applyLanguage(lang) {
    // html lang attribute
    document.documentElement.lang = lang;

    // buttons state + accessibility
    langButtons.forEach(btn => {
      const active = btn.dataset.lang === lang;
      btn.classList.toggle("active", active);
      btn.setAttribute("aria-pressed", String(active));
    });

    // navigation (safety: update only if element exists)
    const map = {
      'a[href="#home"]': translations[lang].home,
      'a[href="products.html"]': translations[lang].products,
      'a[href="#about"]': translations[lang].about,
      'a[href="#contact"]': translations[lang].contact
    };
    Object.keys(map).forEach(sel => {
      const el = document.querySelector(sel);
      if (el) el.textContent = map[sel];
    });

    // hero + sections (only if present)
    const hero = document.getElementById("hero-headline");
    if (hero) hero.innerHTML = translations[lang].headline;

    const lead = document.querySelector(".lead");
    if (lead) lead.textContent = translations[lang].lead;

    const sectionTitle = document.querySelector(".section-title");
    if (sectionTitle) sectionTitle.textContent = translations[lang].featured;

    // product buttons
    document.querySelectorAll(".product-open").forEach(btn => {
      btn.textContent = translations[lang].addToCart;
    });
  }

  function switchLanguage(lang) {
    try { localStorage.setItem("siteLang", lang); } catch (e) {}
    applyLanguage(lang);
  }

  // init (restore saved or default to KA)
  const saved = (function () {
    try { return localStorage.getItem("siteLang"); } catch (e) { return null; }
  })();
  applyLanguage(saved === "en" || saved === "ka" ? saved : "ka");

  // click listeners
  langButtons.forEach(btn => {
    btn.addEventListener("click", () => switchLanguage(btn.dataset.lang));
  });
})();

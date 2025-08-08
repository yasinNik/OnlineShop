function getQueryParam(name) {
  return new URLSearchParams(window.location.search).get(name);
}

function getProducts() {
  const raw = localStorage.getItem("products");
  return raw ? JSON.parse(raw) : [];
}

function getProductsFromLocalStorage() {
  const stored = localStorage.getItem("basket");
  return stored ? JSON.parse(stored) : [];
}

function saveBasketInLocalStorage(basket) {
  localStorage.setItem("basket", JSON.stringify(basket));
}

function updateBasketUI() {
  const totalPriceEl = document.querySelector(".total-price");
  const countEl = document.querySelector(".count");
  const countInBasketEl = document.querySelector(".products-count");
  const basketMain = document.querySelector(".basket-main");

  if (!totalPriceEl || !countEl || !basketMain) return;

  let basket = getProductsFromLocalStorage();
  let totalPrice = 0;
  let totalCount = 0;

  basketMain.innerHTML = "";

  if (basket.length === 0) {
    basketMain.innerHTML = "<p class='empty-basket'>سبد خرید شما خالی است :(</p>";
  }

  basket.forEach((item) => {
    totalPrice += item.price * (item.quantity || 1);
    totalCount += item.quantity || 1;

    let imgPath = item.img;
    if (imgPath.startsWith("./public/")) {
      imgPath = "../" + imgPath.replace("./public/", "");
    }

    basketMain.innerHTML += `
      <article class="basket-item">
        <div class="flex-center">
          <img src="${imgPath}" alt="${item.title}" />
          <div class="basket-item_details">
            <p class="basket-item_title">${item.title}</p>
            <p class="basket-item_price">${item.price.toLocaleString()} ت</p>
          </div>
          <div>
            <div class="buttons">
              <button class="increase" onclick="increaseBtnHandler(${item.id})">
                <i class="bx bx-plus"></i>
              </button>
              <button class="remove-button" onclick="trashBtnHandler(${item.id})">
                <i class="bx bx-trash"></i>
              </button>
              <button class="decrease" onclick="decreaseBtnHandler(${item.id})">
                <i class="bx bx-minus"></i>
              </button>
            </div>
            <div class="product-count-card">
              <span>تعداد:</span>
              <span class="product-count">${item.quantity || 1}</span>
            </div>
          </div>
        </div>
      </article>
    `;
  });

  totalPriceEl.textContent = totalPrice.toLocaleString() + " ت";
  countEl.textContent = totalCount;
  countInBasketEl.textContent = `(${totalCount})`;
}

function renderProduct(product) {
  let imgPath = product.img;
  if (imgPath.startsWith("./public/")) {
    imgPath = "../" + imgPath.replace("./public/", "");
  }

  document.getElementById("product-image").src = imgPath;
  document.getElementById("product-title").textContent = product.title;
  document.getElementById("product-description").textContent = product.description;
  document.getElementById("product-price").textContent = product.price.toLocaleString() + " تومان";

  const inBasketCount = document.getElementById("in-basket-count");

  function updateInBasketQuantity(id) {
    const basket = getProductsFromLocalStorage();
    const item = basket.find(p => p.id === id);
    inBasketCount.textContent = item ? `در سبد: ${item.quantity}` : "";
  }

  document.getElementById("add-to-cart").onclick = () => {
    let basket = getProductsFromLocalStorage();
    let exists = false;

    basket.forEach((item) => {
      if (item.id === product.id) {
        exists = true;
        item.quantity = (item.quantity || 1) + 1;
      }
    });

    if (!exists) {
      const newProduct = { ...product, quantity: 1 };
      basket.push(newProduct);
    }

    saveBasketInLocalStorage(basket);
    updateBasketUI();
    updateInBasketQuantity(product.id);
  };

  updateInBasketQuantity(product.id);
}

function setupBasketEvents() {
  const openBtn = document.querySelector(".open-basket");
  const closeBtn = document.querySelector(".close-basket");
  const basketScreen = document.querySelector(".basket-screen");

  if (openBtn && closeBtn && basketScreen) {
    openBtn.addEventListener("click", () => basketScreen.classList.remove("hidden"));
    closeBtn.addEventListener("click", () => basketScreen.classList.add("hidden"));

    window.addEventListener("keyup", (e) => {
      if (e.key === "Escape") basketScreen.classList.add("hidden");
    });
  }
}

function setupClearButton() {
  const clearBtn = document.querySelector(".clear-button");
  if (!clearBtn) return;

  clearBtn.addEventListener("click", () => {
    saveBasketInLocalStorage([]);
    updateBasketUI();
  });
}

function increaseBtnHandler(id) {
  const basket = getProductsFromLocalStorage();
  basket.forEach((item) => {
    if (item.id === id) item.quantity++;
  });
  saveBasketInLocalStorage(basket);
  updateBasketUI();
}

function decreaseBtnHandler(id) {
  let basket = getProductsFromLocalStorage();
  basket = basket.map((item) => {
    if (item.id === id) {
      item.quantity = item.quantity > 1 ? item.quantity - 1 : 1;
    }
    return item;
  });
  saveBasketInLocalStorage(basket);
  updateBasketUI();
}

function trashBtnHandler(id) {
  let basket = getProductsFromLocalStorage();
  basket = basket.filter((item) => item.id !== id);
  saveBasketInLocalStorage(basket);
  updateBasketUI();
}

document.addEventListener("DOMContentLoaded", () => {
  const id = parseInt(getQueryParam("id"), 10);
  const products = getProducts();
  const product = products.find(p => p.id === id);

  if (product) {
    renderProduct(product);
  } else {
    document.querySelector(".product-wrapper").innerHTML = `
      <h2>❌ محصول پیدا نشد</h2>
      <a href='../../index.html'>بازگشت به خانه</a>
    `;
  }

  updateBasketUI();
  setupBasketEvents();
  setupClearButton();
});

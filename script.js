const products = [
    { id: 1, name: "CEREAL BAR", price: 2.00, image: "https://share.google/images/kfxAKSgMS3HWDtMBb", description: "Deliciosas barras de cereal" },
    { id: 2, name: "YULCIS DE YUCA", price: 3.00, image: "https://share.google/images/59drsR54kwvZQye3N", description: "Crujientes yulcis hechos de yuca natural" },
    { id: 3, name: "Chocolate el NAÑO", price: 4.00, image: "hhttps://share.google/images/XjuDAtPMAgUBKumbU", description: "Chocolate artesanal de cacao fino" },
    { id: 4, name: "Maní salado 90 gr", price: 4.00, image: "https://share.google/images/IvupoZ55dsEliMyyr", description: "Maní tostado y salado" },
    { id: 5, name: "Chifles deliciosos", price: 4.00, image: "https://share.google/images/mEeBEnGjU5n1lMwHR", description: "Chifles crujientes y naturales" },
    { id: 6, name: "Cocadas", price: 3.50, image: "https://share.google/images/ZWbRpqC0pycTvgA3G", description: "Dulces de coco rallado" },
    { id: 7, name: "Ricas rosquitas", price: 4.00, image: "https://share.google/images/WG7iutoVeD0AqVFEi", description: "Rosquitas crocantes y deliciosas" },
    { id: 8, name: "Maní confitado 90 gr", price: 4.00, image: "https://share.google/images/mvxjfzgXrL7O2r32z", description: "Maní cubierto con azúcar caramelizada" },
    { id: 9, name: "Pulp fresco", price: 2.50, image: "https://share.google/images/D0wj1DV42QvrJB6FW", description: "Refrescante bebida Pulp" },
    { id: 10, name: "Sporade energético", price: 3.00, image: "https://share.google/images/zovd60wCehMIbAiQO", description: "Bebida isotónica energética" },
    { id: 11, name: "Habas saladas 90 gr", price: 4.00, image: "https://share.google/images/ME0vYwDsnpj8qETTY", description: "Habas crocantes y saladas" },
    { id: 12, name: "Cifrut sabor naranja", price: 3.00, image: "https://share.google/images/i3RjSWMwRIxLxbk2o", description: "Bebida Cifrut sabor naranja" },
    { id: 13, name: "Cifrut sabor piña", price: 3.00, image: "https://share.google/images/eBNfKPO97pHGpuXke", description: "Bebida Cifrut sabor piña" }
];

let cart = [];
const MAX_PRODUCTS = 3;

document.addEventListener("DOMContentLoaded", () => {
    renderProducts();
    setupEventListeners();
    loadCartFromStorage();
});

// 🛒 Renderizado de productos
function renderProducts() {
    const grid = document.getElementById("products-grid");
    const totalCount = getTotalProductCount();

    grid.innerHTML = products.map(p => `
        <div class="product-card">
            <img src="${p.image}" alt="${p.name}" class="product-image">
            <div class="product-info">
                <h3>${p.name}</h3>
                <p>${p.description}</p>
                <span>S/ ${p.price.toFixed(2)}</span><br>
                <button class="btn-add-to-cart" data-id="${p.id}" ${totalCount >= MAX_PRODUCTS ? "disabled" : ""}>
                    ${totalCount >= MAX_PRODUCTS ? "Límite alcanzado" : "Agregar al carrito"}
                </button>
            </div>
        </div>
    `).join("");
}

function setupEventListeners() {
    document.addEventListener("click", e => {
        if (e.target.classList.contains("btn-add-to-cart")) addToCart(parseInt(e.target.dataset.id));
        if (e.target.classList.contains("quantity-btn")) {
            const id = parseInt(e.target.dataset.id);
            e.target.dataset.action === "increase" ? increaseQuantity(id) : decreaseQuantity(id);
        }
        if (e.target.classList.contains("remove-btn")) removeFromCart(parseInt(e.target.dataset.id));
    });
}

// --- FUNCIONES DE CARRITO ---
function addToCart(id) {
    if (getTotalProductCount() >= MAX_PRODUCTS) {
        showNotification(`Solo puedes agregar hasta ${MAX_PRODUCTS} productos`, "warning");
        return;
    }

    const product = products.find(p => p.id === id);
    const existing = cart.find(i => i.id === id);

    if (existing) existing.quantity++;
    else cart.push({ ...product, quantity: 1 });

    updateCart();
    showNotification(`${product.name} agregado`, "success");
}

function increaseQuantity(id) {
    if (getTotalProductCount() >= MAX_PRODUCTS) {
        showNotification(`Solo ${MAX_PRODUCTS} productos en total`, "warning");
        return;
    }
    const item = cart.find(i => i.id === id);
    if (item) item.quantity++;
    updateCart();
}

function decreaseQuantity(id) {
    const item = cart.find(i => i.id === id);
    if (item) {
        item.quantity--;
        if (item.quantity <= 0) removeFromCart(id);
        updateCart();
    }
}

function removeFromCart(id) {
    cart = cart.filter(i => i.id !== id);
    updateCart();
    showNotification("Producto eliminado", "error");
}

function clearCart() {
    if (confirm("¿Vaciar carrito?")) {
        cart = [];
        updateCart();
        showNotification("Carrito vacío", "error");
    }
}

function getTotalProductCount() {
    return cart.reduce((a, i) => a + i.quantity, 0);
}

function updateCart() {
    updateCartDisplay();
    saveCartToStorage();
    renderProducts(); // 🔄 Actualiza botones
}

function updateCartDisplay() {
    const itemsDiv = document.getElementById("cart-items");
    const totalDiv = document.getElementById("total-amount");
    const indicator = document.getElementById("cart-indicator");
    const actions = document.getElementById("cart-actions");

    if (cart.length === 0) {
        itemsDiv.innerHTML = "<p>No hay productos en el carrito.</p>";
        actions.style.display = "none";
        indicator.style.display = "none";
    } else {
        indicator.textContent = getTotalProductCount();
        indicator.style.display = "flex";
        actions.style.display = "block";

        itemsDiv.innerHTML = cart.map(i => `
            <div class="cart-item">
                <div class="cart-item-info">
                    <img src="${i.image}" class="cart-item-image">
                    <strong>${i.name}</strong> - S/${i.price.toFixed(2)}
                </div>
                <div class="cart-item-controls">
                    <button class="quantity-btn" data-id="${i.id}" data-action="decrease">-</button>
                    <span>${i.quantity}</span>
                    <button class="quantity-btn" data-id="${i.id}" data-action="increase" ${getTotalProductCount() >= MAX_PRODUCTS ? "disabled" : ""}>+</button>
                    <button class="remove-btn" data-id="${i.id}">Eliminar</button>
                </div>
            </div>
        `).join("");
    }

    const total = cart.reduce((sum, i) => sum + i.price * i.quantity, 0);
    totalDiv.textContent = `S/ ${total.toFixed(2)}`;
}

// --- LOCAL STORAGE ---
function saveCartToStorage() {
    localStorage.setItem("sumaqCart", JSON.stringify(cart));
}
function loadCartFromStorage() {
    const saved = localStorage.getItem("sumaqCart");
    if (saved) {
        cart = JSON.parse(saved);
        updateCartDisplay();
    }
}

// --- NOTIFICACIONES ---
function showNotification(msg, type) {
    const n = document.getElementById("notification");
    n.textContent = msg;
    n.className = `notification ${type} show`;
    setTimeout(() => n.classList.remove("show"), 3000);
}

// --- NOMBRE CLIENTE ---
function getCustomerName() {
    return document.getElementById("customer-name").value.trim();
}

// --- PAGO CON GOOGLE SHEETS ---
function payCash() {
    const name = getCustomerName();
    if (!name) return showNotification("Ingresa tu nombre", "error");
    if (cart.length === 0) return showNotification("Carrito vacío", "error");

    const total = cart.reduce((s, i) => s + i.price * i.quantity, 0);
    const order = {
        customerName: name,
        paymentMethod: "Efectivo",
        total: total,
        cart: cart
    };

    fetch("TU_URL_DE_APPS_SCRIPT_AQUI", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(order)
    });

    showNotification("Pedido registrado correctamente", "success");
    cart = [];
    updateCart();
}
// 📱 Pago con Yape (mostrar QR)
function payYape() {
  if (cart.length === 0) return alert("Tu carrito está vacío.");
  document.getElementById("qrModal").classList.remove("hidden");
  document.getElementById("qrModal").classList.add("flex");
}

function closeQR() {
  document.getElementById("qrModal").classList.add("hidden");
}

// Confirmar pago con Yape
async function confirmYapePayment() {
  closeQR();
  const customerName = prompt("Ingresa tu nombre para confirmar el pago:");
  if (!customerName) return alert("Debes ingresar un nombre.");
  await sendOrderToSheet(customerName, "Yape");
}

// 📤 Enviar pedido a Google Sheets
async function sendOrderToSheet(customerName, paymentMethod) {
  const orderData = { customerName, paymentMethod, cart };
  try {
    const res = await fetch("TU_URL_DE_APPS_SCRIPT_AQUI", { // ⬅️ reemplaza con tu URL de Apps Script
      method: "POST",
      body: JSON.stringify(orderData),
      headers: { "Content-Type": "application/json" }
    });
    const result = await res.json();

    if (result.status === "success") {
      alert("✅ Pedido registrado correctamente.");
      cart = [];
      renderCart();
    } else {
      alert("❌ Error al guardar el pedido: " + result.message);
    }
  } catch (err) {
    alert("⚠️ Error de conexión: " + err.message);
  }
}

renderProducts();
renderCart();

// Fetched from backend
let products = [];
let orderItems = []; // Will be loaded from localStorage

// Load cart from localStorage on page load
function loadCart() {
  const saved = localStorage.getItem('cartItems');
  if (saved) {
    try {
      orderItems = JSON.parse(saved);
    } catch (e) {
      orderItems = [];
    }
  } else {
    orderItems = [];
  }
  updateCartBadge();
}

// Save cart to localStorage
function saveCart() {
  localStorage.setItem('cartItems', JSON.stringify(orderItems));
  updateCartBadge();
}

// Update cart badge in navigation
function updateCartBadge() {
  const badge = document.getElementById('cartBadge');
  if (badge) {
    const count = orderItems.reduce((sum, item) => sum + item.quantity, 0);
    badge.textContent = count;
    badge.style.display = count > 0 ? 'inline-flex' : 'none';
  }
}

// API Base URL - automatically detects if running locally or online
const API_BASE_URL = window.location.origin === 'file://' || window.location.hostname === 'localhost' 
  ? 'http://localhost:3000' 
  : window.location.origin;

async function fetchProducts() {
  try {
    const response = await fetch(`${API_BASE_URL}/products`);
    products = await response.json();
    renderProducts();
  } catch (error) {
    console.error('Error fetching products:', error);
    // Fallback to demo data if server is not available
    products = [
      { product_id: 1, name: "Laptop", price: 900, stock_quantity: 700 },
      { product_id: 2, name: "Mouse", price: 25, stock_quantity: 600 },
      { product_id: 3, name: "Keyboard", price: 45, stock_quantity: 500 }
    ];
    renderProducts();
  }
}

function renderProducts() {
  const grid = document.getElementById("productGrid");
  if (!grid) return; // Guard clause

  grid.innerHTML = "";

  products.forEach(p => {
    const card = document.createElement("div");
    card.className = "product-card";

    // Create random gradient for product image placeholder
    const hue = (p.product_id * 60) % 360;

    card.innerHTML = `
      <div class="product-image-placeholder" style="background: linear-gradient(135deg, hsl(${hue}, 70%, 80%), hsl(${hue}, 70%, 60%));">
        <i class="fa-solid fa-cube"></i>
      </div>
      <h3>${p.name}</h3>
      <div class="product-price">$${Number(p.price).toFixed(2)}</div>
      <div class="product-stock"><i class="fa-solid fa-layer-group"></i> ${p.stock_quantity} in stock</div>
      <button onclick="addToOrder(${p.product_id})"><i class="fa-solid fa-cart-plus"></i> Add to Cart</button>
    `;
    grid.appendChild(card);
  });
}

function renderOrder() {
  const tbody = document.querySelector("#orderTable tbody");
  if (!tbody) return;

  tbody.innerHTML = "";
  let total = 0;

  if (orderItems.length === 0) {
    tbody.innerHTML = '<tr><td colspan="5" style="text-align:center; color: #888; padding: 2rem;">Your cart is empty. <a href="products.html" style="color: var(--primary);">Start shopping!</a></td></tr>';
    const totalEl = document.getElementById("orderTotal");
    if (totalEl) {
      totalEl.innerHTML = '<div style="font-size: 1.5rem; font-weight: 800; color: var(--text-secondary);">Total: $0.00</div>';
    }
    // Remove checkout button if exists
    const checkoutBtn = document.getElementById('checkoutBtn');
    if (checkoutBtn) checkoutBtn.remove();
    return;
  }

  orderItems.forEach((item, index) => {
    const lineTotal = item.quantity * item.unit_price;
    total += lineTotal;

    const row = document.createElement("tr");
    row.innerHTML = `
      <td>${item.name}</td>
      <td>
        <button onclick="updateQuantity(${index}, -1)" style="padding: 4px 8px; margin-right: 8px;">-</button>
        ${item.quantity}
        <button onclick="updateQuantity(${index}, 1)" style="padding: 4px 8px; margin-left: 8px;">+</button>
      </td>
      <td>$${Number(item.unit_price).toFixed(2)}</td>
      <td>$${lineTotal.toFixed(2)}</td>
      <td><button onclick="removeFromCart(${index})" style="background: #ef4444; padding: 6px 12px;"><i class="fa-solid fa-trash"></i></button></td>
    `;
    tbody.appendChild(row);
  });

  const totalEl = document.getElementById("orderTotal");
  if (totalEl) {
    totalEl.innerHTML = `<div style="font-size: 1.5rem; font-weight: 800; color: var(--primary); margin-top: 1rem;">Total: $${total.toFixed(2)}</div>`;
  }

  ensureCheckoutButton();
  saveCart();
}

function updateQuantity(index, change) {
  if (index < 0 || index >= orderItems.length) return;
  
  const item = orderItems[index];
  const product = products.find(p => p.product_id === item.product_id);
  
  if (!product) return;
  
  const newQuantity = item.quantity + change;
  
  if (newQuantity <= 0) {
    removeFromCart(index);
    return;
  }
  
  // Check stock availability
  if (newQuantity > product.stock_quantity) {
    alert(`Only ${product.stock_quantity} items available in stock!`);
    return;
  }
  
  item.quantity = newQuantity;
  renderOrder();
}

function removeFromCart(index) {
  if (index < 0 || index >= orderItems.length) return;
  
  const item = orderItems[index];
  if (confirm(`Remove ${item.name} from cart?`)) {
    orderItems.splice(index, 1);
    renderOrder();
  }
}

function addToOrder(productId) {
  const product = products.find(p => p.product_id === productId);
  if (!product) {
    alert('Product not found!');
    return;
  }
  
  if (product.stock_quantity === 0) {
    alert(`${product.name} is out of stock!`);
    return;
  }

  let item = orderItems.find(i => i.product_id === productId);
  if (item) {
    // Check if we can add more (stock check)
    if (item.quantity >= product.stock_quantity) {
      alert(`Only ${product.stock_quantity} items available in stock!`);
      return;
    }
    item.quantity += 1;
  } else {
    orderItems.push({
      product_id: product.product_id,
      name: product.name,
      quantity: 1,
      unit_price: Number(product.price)
    });
  }

  // Show quick feedback
  const notification = document.createElement('div');
  notification.style.cssText = 'position: fixed; top: 80px; right: 20px; background: #10b981; color: white; padding: 1rem 1.5rem; border-radius: 8px; box-shadow: 0 4px 6px rgba(0,0,0,0.1); z-index: 1000; animation: slideIn 0.3s;';
  notification.innerHTML = `<i class="fa-solid fa-check-circle"></i> Added ${product.name} to cart!`;
  document.body.appendChild(notification);
  
  setTimeout(() => {
    notification.style.animation = 'slideOut 0.3s';
    setTimeout(() => notification.remove(), 300);
  }, 2000);

  renderOrder();
  saveCart();
}

function ensureCheckoutButton() {
  if (document.getElementById('checkoutBtn')) return;

  // Only add if we are on a page with the container and not just a small widget
  const container = document.querySelector('.cart-container');
  if (!container) return;

  if (orderItems.length === 0) return;

  const btn = document.createElement('button');
  btn.id = 'checkoutBtn';
  btn.className = 'btn-primary';
  btn.innerHTML = '<i class="fa-solid fa-check"></i> Submit Order';

  btn.onclick = submitOrder;
  container.appendChild(btn);
}

async function submitOrder() {
  if (orderItems.length === 0) {
    alert("Your cart is empty!");
    return;
  }

  // Fetch products if not already loaded (in case user navigated directly to orders page)
  if (products.length === 0) {
    try {
      await fetchProducts();
    } catch (error) {
      console.error('Error fetching products:', error);
      // Continue anyway - server will validate stock
    }
  }

  // Optional client-side stock validation (server will do final validation)
  // Only check stock if products are loaded
  if (products.length > 0) {
    for (const item of orderItems) {
      const product = products.find(p => p.product_id === item.product_id);
      // If product found in cache, check stock. If not found, let server handle it.
      if (product && item.quantity > product.stock_quantity) {
        alert(`Only ${product.stock_quantity} items of ${item.name} available in stock!`);
        return;
      }
      // If product not in cache, that's okay - server will validate
    }
  }

  if (!confirm(`Place order for $${orderItems.reduce((sum, item) => sum + (item.quantity * item.unit_price), 0).toFixed(2)}?`)) {
    return;
  }

  const total = orderItems.reduce((sum, item) => sum + (item.quantity * item.unit_price), 0);

  const payload = {
    items: orderItems.map(item => ({
      product_id: item.product_id,
      quantity: item.quantity,
      unit_price: item.unit_price
    })),
    total_amount: total
  };

  const btn = document.getElementById('checkoutBtn');
  const originalText = btn ? btn.innerHTML : '';
  if (btn) {
    btn.disabled = true;
    btn.innerHTML = '<i class="fa-solid fa-spinner fa-spin"></i> Processing...';
  }

  try {
    const response = await fetch(`${API_BASE_URL}/orders`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload)
    });

    const result = await response.json();
    if (response.ok) {
      alert('Order placed successfully! Order ID: ' + result.orderId);
      orderItems = [];
      saveCart();
      renderOrder();

      // If on orders page, refresh history
      if (typeof fetchOrderHistory === 'function') {
        fetchOrderHistory();
      }
      
      // Refresh products to update stock
      if (typeof fetchProducts === 'function') {
        await fetchProducts();
      }
    } else {
      // Server validation failed - show error
      alert('Error placing order: ' + (result.error || 'Unknown error'));
      
      // If stock issue, refresh products to get updated stock
      if (result.error && result.error.includes('stock')) {
        if (typeof fetchProducts === 'function') {
          await fetchProducts();
        }
        // Re-render order to show updated stock info
        renderOrder();
      }
    }
  } catch (error) {
    console.error('Error submitting order:', error);
    alert('Failed to submit order. Please check if the server is running.');
  } finally {
    if (btn) {
      btn.disabled = false;
      btn.innerHTML = originalText;
    }
  }
}

async function fetchOrderHistory() {
  const container = document.getElementById('historyContainer');
  if (!container) return;

  container.innerHTML = '<p><i class="fa-solid fa-spinner fa-spin"></i> Loading your past orders...</p>';

  try {
    const response = await fetch(`${API_BASE_URL}/orders`);
    if (!response.ok) {
      throw new Error('Failed to fetch orders');
    }
    
    const orders = await response.json();

    if (!orders || orders.length === 0) {
      container.innerHTML = '<div class="empty-state"><i class="fa-solid fa-clipboard-list"></i><p>No past orders found.</p></div>';
      return;
    }

    let html = '<div style="display: grid; gap: 1rem;">';
    orders.forEach(order => {
      const date = order.order_date ? new Date(order.order_date).toLocaleDateString() + ' ' + new Date(order.order_date).toLocaleTimeString() : 'N/A';
      html += `
                <div style="background: white; padding: 1.5rem; border-radius: 12px; border: 1px solid #e2e8f0; display: flex; justify-content: space-between; align-items: center; box-shadow: 0 2px 4px rgba(0,0,0,0.05);">
                    <div>
                        <strong style="display: block; font-size: 1.1rem; color: var(--text-primary);">Order #${order.order_id}</strong>
                        <span style="color: #64748b; font-size: 0.9rem;"><i class="fa-solid fa-calendar"></i> ${date}</span>
                    </div>
                    <div style="font-weight: 800; font-size: 1.2rem; color: var(--primary);">
                        $${Number(order.total_amount || 0).toFixed(2)}
                    </div>
                </div>
            `;
    });
    html += '</div>';
    container.innerHTML = html;

  } catch (error) {
    console.error("Error fetching history:", error);
    container.innerHTML = '<div class="empty-state"><i class="fa-solid fa-exclamation-triangle"></i><p style="color: #ef4444;">Failed to load order history. Make sure the server is running.</p></div>';
  }
}

// Initialize cart on page load
loadCart();

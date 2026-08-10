// Keeper POS Frontend Application Logic

let token = localStorage.getItem('keeper_token') || '';
let currentUser = JSON.parse(localStorage.getItem('keeper_user') || 'null');

let state = {
  currentTab: 'dashboard',
  items: [],
  categories: [],
  customers: [],
  sales: [],
  cart: [], // { item, quantity }
  activeReturnSale: null,
};

// INITIALIZATION
document.addEventListener('DOMContentLoaded', () => {
  if (token && currentUser) {
    showMainApp();
  } else {
    showAuthScreen();
  }
});

function prefillLogin(email, password) {
  document.getElementById('login-email').value = email;
  document.getElementById('login-password').value = password;
}

async function handleLogin(e) {
  e.preventDefault();
  const email = document.getElementById('login-email').value;
  const password = document.getElementById('login-password').value;
  const errDiv = document.getElementById('auth-error');
  errDiv.classList.add('hidden');

  try {
    const res = await apiFetch('/api/auth/login', 'POST', { email, password }, false);
    token = res.token;
    currentUser = res.user;
    localStorage.setItem('keeper_token', token);
    localStorage.setItem('keeper_user', JSON.stringify(currentUser));

    showMainApp();
  } catch (err) {
    errDiv.textContent = err.message || 'Login failed. Please check credentials.';
    errDiv.classList.remove('hidden');
  }
}

function handleLogout() {
  token = '';
  currentUser = null;
  localStorage.removeItem('keeper_token');
  localStorage.removeItem('keeper_user');
  showAuthScreen();
}

function showAuthScreen() {
  document.getElementById('auth-screen').classList.remove('hidden');
  document.getElementById('main-app').classList.add('hidden');
}

function showMainApp() {
  document.getElementById('auth-screen').classList.add('hidden');
  document.getElementById('main-app').classList.remove('hidden');

  document.getElementById('user-name').textContent = currentUser.name;
  document.getElementById('user-email').textContent = currentUser.email;
  document.getElementById('user-role-badge').textContent = currentUser.role.toUpperCase();
  document.getElementById('user-role-badge').className = `badge ${currentUser.role === 'admin' ? 'badge-admin' : 'badge-partial'}`;

  switchTab('dashboard');
}

// NAVIGATION
function switchTab(tabId) {
  state.currentTab = tabId;

  document.querySelectorAll('.nav-item').forEach(btn => btn.classList.remove('active'));
  document.querySelectorAll('.tab-pane').forEach(pane => pane.classList.add('hidden'));

  const activeNav = Array.from(document.querySelectorAll('.nav-item')).find(b => b.getAttribute('onclick')?.includes(tabId));
  if (activeNav) activeNav.classList.add('active');

  const pane = document.getElementById(`tab-${tabId}`);
  if (pane) pane.classList.remove('hidden');

  const titleMap = {
    dashboard: { title: 'Dashboard Overview', desc: 'Real-time KPIs and store performance analytics' },
    pos: { title: 'POS Checkout & Billing', desc: 'Fast point of sale transaction processing' },
    inventory: { title: 'Inventory Product Catalog', desc: 'Manage products, stock levels, and buy/sell pricing' },
    customers: { title: 'Customers & Balance Ledger', desc: 'Customer registry and transaction statement ledgers' },
    returns: { title: 'Product Returns & Restocking', desc: 'Process customer returns against original invoice' },
  };

  if (titleMap[tabId]) {
    document.getElementById('current-tab-title').textContent = titleMap[tabId].title;
    document.getElementById('current-tab-desc').textContent = titleMap[tabId].desc;
  }

  refreshCurrentTab();
}

function refreshCurrentTab() {
  if (state.currentTab === 'dashboard') loadDashboard();
  if (state.currentTab === 'pos') loadPosData();
  if (state.currentTab === 'inventory') loadInventory();
  if (state.currentTab === 'customers') loadCustomers();
}

// DASHBOARD LOAD
async function loadDashboard() {
  try {
    const stats = await apiFetch('/api/dashboard/stats');
    document.getElementById('stat-revenue').textContent = `৳${parseFloat(stats.totalSalesRevenue || 0).toLocaleString()}`;
    document.getElementById('stat-profit').textContent = stats.netProfit !== 'N/A' ? `৳${parseFloat(stats.netProfit || 0).toLocaleString()}` : 'Admin Only';
    document.getElementById('stat-due').textContent = `৳${parseFloat(stats.totalCustomerDue || 0).toLocaleString()}`;
    document.getElementById('stat-low-stock').textContent = `${stats.lowStockCount} items`;

    const sales = await apiFetch('/api/sales');
    state.sales = sales;

    const tbody = document.getElementById('recent-sales-tbody');
    if (sales.length === 0) {
      tbody.innerHTML = '<tr><td colspan="6" class="text-center">No sales recorded yet.</td></tr>';
    } else {
      tbody.innerHTML = sales.slice(0, 5).map(s => `
        <tr>
          <td><strong>#${s.invoiceNumber}</strong></td>
          <td>${s.customerName}</td>
          <td>৳${parseFloat(s.grandTotal).toFixed(2)}</td>
          <td>৳${parseFloat(s.paidAmount).toFixed(2)}</td>
          <td><span class="badge badge-${s.paymentStatus}">${s.paymentStatus.toUpperCase()}</span></td>
          <td>${new Date(s.date).toLocaleDateString()}</td>
        </tr>
      `).join('');
    }

    const lowItems = await apiFetch('/api/items/low-stock');
    const alertDiv = document.getElementById('low-stock-list');
    if (lowItems.length === 0) {
      alertDiv.innerHTML = '<p class="text-success text-center">✓ All inventory stock levels healthy.</p>';
    } else {
      alertDiv.innerHTML = lowItems.map(i => `
        <div style="display:flex; justify-content:space-between; padding:10px 0; border-bottom:1px solid var(--border-color);">
          <div>
            <strong>${i.name}</strong> (${i.sku})
            <div class="text-muted" style="font-size:12px;">Threshold: ${i.lowStockThreshold} ${i.unit}</div>
          </div>
          <span class="badge badge-due">${i.stockQuantity} ${i.unit} left</span>
        </div>
      `).join('');
    }
  } catch (err) {
    console.error('Failed to load dashboard stats:', err);
  }
}

// POS BILLING LOAD
async function loadPosData() {
  try {
    state.items = await apiFetch('/api/items');
    state.customers = await apiFetch('/api/customers');
    state.categories = await apiFetch('/api/categories');

    // Populate category dropdown
    const catSelect = document.getElementById('pos-category-filter');
    catSelect.innerHTML = '<option value="">All Categories</option>' +
      state.categories.map(c => `<option value="${c.name}">${c.name}</option>`).join('');

    // Populate customer dropdown
    const custSelect = document.getElementById('cart-customer-select');
    custSelect.innerHTML = '<option value="walk-in">Walk-in Customer</option>' +
      state.customers.map(c => `<option value="${c.id}">${c.name} (${c.phone || 'No phone'})</option>`).join('');

    renderPosGrid();
    renderCart();
  } catch (err) {
    console.error('Failed to load POS data:', err);
  }
}

function filterPosItems() {
  renderPosGrid();
}

function renderPosGrid() {
  const query = document.getElementById('pos-search').value.toLowerCase();
  const category = document.getElementById('pos-category-filter').value;

  const filtered = state.items.filter(i => {
    const matchQ = i.name.toLowerCase().includes(query) || i.sku.toLowerCase().includes(query);
    const matchCat = category ? i.category === category : true;
    return matchQ && matchCat;
  });

  const grid = document.getElementById('pos-items-grid');
  if (filtered.length === 0) {
    grid.innerHTML = '<div class="empty-cart" style="grid-column: 1/-1;">No products found matching criteria.</div>';
    return;
  }

  grid.innerHTML = filtered.map(item => `
    <div class="pos-item-card" onclick="addToCart('${item.id}')">
      <div class="pos-item-title">${item.name}</div>
      <div class="pos-item-sku">SKU: ${item.sku || 'N/A'} | Stock: ${item.stockQuantity} ${item.unit}</div>
      <div class="pos-item-price">৳${parseFloat(item.sellPrice).toFixed(2)}</div>
    </div>
  `).join('');
}

function addToCart(itemId) {
  const item = state.items.find(i => i.id === itemId);
  if (!item) return;

  if (item.stockQuantity <= 0) {
    alert(`Item '${item.name}' is out of stock!`);
    return;
  }

  const existing = state.cart.find(c => c.item.id === itemId);
  if (existing) {
    if (existing.quantity + 1 > item.stockQuantity) {
      alert(`Cannot add more. Maximum available stock: ${item.stockQuantity}`);
      return;
    }
    existing.quantity++;
  } else {
    state.cart.push({ item, quantity: 1 });
  }

  renderCart();
}

function updateCartQty(itemId, change) {
  const existing = state.cart.find(c => c.item.id === itemId);
  if (!existing) return;

  const newQty = existing.quantity + change;
  if (newQty <= 0) {
    state.cart = state.cart.filter(c => c.item.id !== itemId);
  } else {
    if (newQty > existing.item.stockQuantity) {
      alert(`Cannot add more. Available stock: ${existing.item.stockQuantity}`);
      return;
    }
    existing.quantity = newQty;
  }

  renderCart();
}

function clearCart() {
  state.cart = [];
  renderCart();
}

function renderCart() {
  const container = document.getElementById('cart-items-container');
  if (state.cart.length === 0) {
    container.innerHTML = '<div class="empty-cart">Cart is empty. Click on items to add.</div>';
  } else {
    container.innerHTML = state.cart.map(c => `
      <div class="cart-row">
        <div>
          <div class="cart-item-title">${c.item.name}</div>
          <small class="text-muted">৳${parseFloat(c.item.sellPrice).toFixed(2)} × ${c.quantity}</small>
        </div>
        <div class="cart-qty-ctrl">
          <button class="btn btn-sm btn-outline" onclick="updateCartQty('${c.item.id}', -1)">-</button>
          <span><strong>${c.quantity}</strong></span>
          <button class="btn btn-sm btn-outline" onclick="updateCartQty('${c.item.id}', 1)">+</button>
          <span style="min-width: 60px; text-align: right; font-weight:700;">৳${(parseFloat(c.item.sellPrice) * c.quantity).toFixed(2)}</span>
        </div>
      </div>
    `).join('');
  }

  updateCartTotals();
}

function updateCartTotals() {
  let subtotal = 0;
  state.cart.forEach(c => {
    subtotal += parseFloat(c.item.sellPrice) * c.quantity;
  });

  const discount = parseFloat(document.getElementById('cart-discount').value) || 0;
  const grandTotal = Math.max(0, subtotal - discount);
  const paid = parseFloat(document.getElementById('cart-paid-amount').value) || 0;
  const due = Math.max(0, grandTotal - paid);

  document.getElementById('cart-subtotal').textContent = `৳${subtotal.toFixed(2)}`;
  document.getElementById('cart-grand-total').textContent = `৳${grandTotal.toFixed(2)}`;
  document.getElementById('cart-due-amount').textContent = `৳${due.toFixed(2)}`;
}

async function checkoutPosCart() {
  if (state.cart.length === 0) {
    alert('Cart is empty! Please add items before checking out.');
    return;
  }

  const customerId = document.getElementById('cart-customer-select').value;
  const discount = parseFloat(document.getElementById('cart-discount').value) || 0;
  const paidAmount = parseFloat(document.getElementById('cart-paid-amount').value) || 0;

  const payload = {
    customerId,
    discount,
    paidAmount,
    items: state.cart.map(c => ({
      itemId: c.item.id,
      quantity: c.quantity,
      unitPrice: parseFloat(c.item.sellPrice),
    })),
  };

  try {
    const sale = await apiFetch('/api/sales', 'POST', payload);
    alert(`🎉 Sale completed successfully!\nInvoice Number: #${sale.invoiceNumber}\nGrand Total: ৳${sale.grandTotal}`);
    clearCart();
    document.getElementById('cart-discount').value = 0;
    document.getElementById('cart-paid-amount').value = 0;
    loadPosData();
  } catch (err) {
    alert(`Checkout error: ${err.message}`);
  }
}

// INVENTORY LOAD & ACTIONS
async function loadInventory() {
  try {
    state.items = await apiFetch('/api/items');
    renderInventoryTable();
  } catch (err) {
    console.error('Failed to load inventory:', err);
  }
}

function renderInventoryTable() {
  const query = document.getElementById('inventory-search').value.toLowerCase();
  const filtered = state.items.filter(i =>
    i.name.toLowerCase().includes(query) ||
    i.sku.toLowerCase().includes(query) ||
    i.category.toLowerCase().includes(query)
  );

  const tbody = document.getElementById('inventory-tbody');
  if (filtered.length === 0) {
    tbody.innerHTML = '<tr><td colspan="9" class="text-center">No inventory items found.</td></tr>';
    return;
  }

  tbody.innerHTML = filtered.map(item => `
    <tr>
      <td><strong>${item.name}</strong></td>
      <td><code>${item.sku || 'N/A'}</code></td>
      <td><span class="badge badge-admin">${item.category}</span></td>
      <td>৳${parseFloat(item.sellPrice).toFixed(2)}</td>
      <td>৳${parseFloat(item.buyPrice).toFixed(2)}</td>
      <td>
        <span class="badge ${item.isLowStock ? 'badge-due' : 'badge-paid'}">
          ${item.stockQuantity} ${item.unit}
        </span>
      </td>
      <td>${item.unit}</td>
      <td>${item.lowStockThreshold}</td>
      <td>
        <button class="btn btn-sm btn-outline" onclick="openEditProductModal('${item.id}')">✏️ Edit</button>
        <button class="btn btn-sm btn-danger" onclick="deleteProduct('${item.id}')">🗑️</button>
      </td>
    </tr>
  `).join('');
}

function openAddProductModal() {
  document.getElementById('modal-product-title').textContent = 'Add New Product';
  document.getElementById('product-form').reset();
  document.getElementById('prod-id').value = '';
  document.getElementById('product-modal').classList.remove('hidden');
}

function openEditProductModal(id) {
  const item = state.items.find(i => i.id === id);
  if (!item) return;

  document.getElementById('modal-product-title').textContent = 'Edit Product';
  document.getElementById('prod-id').value = item.id;
  document.getElementById('prod-name').value = item.name;
  document.getElementById('prod-sku').value = item.sku;
  document.getElementById('prod-category').value = item.category;
  document.getElementById('prod-sell').value = item.sellPrice;
  document.getElementById('prod-buy').value = item.buyPrice;
  document.getElementById('prod-stock').value = item.stockQuantity;
  document.getElementById('prod-unit').value = item.unit;
  document.getElementById('prod-low').value = item.lowStockThreshold;

  document.getElementById('product-modal').classList.remove('hidden');
}

function closeProductModal() {
  document.getElementById('product-modal').classList.add('hidden');
}

async function saveProduct(e) {
  e.preventDefault();
  const id = document.getElementById('prod-id').value;
  const payload = {
    name: document.getElementById('prod-name').value,
    sku: document.getElementById('prod-sku').value,
    category: document.getElementById('prod-category').value,
    sellPrice: parseFloat(document.getElementById('prod-sell').value),
    buyPrice: parseFloat(document.getElementById('prod-buy').value),
    stockQuantity: parseInt(document.getElementById('prod-stock').value, 10),
    unit: document.getElementById('prod-unit').value,
    lowStockThreshold: parseInt(document.getElementById('prod-low').value, 10),
  };

  try {
    if (id) {
      await apiFetch(`/api/items/${id}`, 'PUT', payload);
    } else {
      await apiFetch('/api/items', 'POST', payload);
    }
    closeProductModal();
    loadInventory();
  } catch (err) {
    alert(`Failed to save product: ${err.message}`);
  }
}

async function deleteProduct(id) {
  if (!confirm('Are you sure you want to delete this product?')) return;
  try {
    await apiFetch(`/api/items/${id}`, 'DELETE');
    loadInventory();
  } catch (err) {
    alert(`Failed to delete product: ${err.message}`);
  }
}

// CUSTOMERS & LEDGER LOAD & ACTIONS
async function loadCustomers() {
  try {
    state.customers = await apiFetch('/api/customers');
    renderCustomersTable();
  } catch (err) {
    console.error('Failed to load customers:', err);
  }
}

function renderCustomersTable() {
  const tbody = document.getElementById('customers-tbody');
  if (state.customers.length === 0) {
    tbody.innerHTML = '<tr><td colspan="6" class="text-center">No customers registered yet.</td></tr>';
    return;
  }

  tbody.innerHTML = state.customers.map(c => {
    const closing = parseFloat(c.closingBalance);
    const balanceBadge = closing < 0
      ? `<span class="badge badge-due">Due: ৳${Math.abs(closing).toFixed(2)}</span>`
      : `<span class="badge badge-paid">Advance: ৳${closing.toFixed(2)}</span>`;

    return `
      <tr>
        <td><strong>${c.name}</strong></td>
        <td>${c.phone || 'N/A'}</td>
        <td>${c.address || 'N/A'}</td>
        <td>৳${parseFloat(c.openingBalance).toFixed(2)}</td>
        <td>${balanceBadge}</td>
        <td>
          <button class="btn btn-sm btn-outline" onclick="viewCustomerLedger('${c.id}', '${c.name}')">📜 Ledger Statement</button>
          <button class="btn btn-sm btn-success" onclick="openPaymentModal('${c.id}', '${c.name}')">💵 Collect Due</button>
        </td>
      </tr>
    `;
  }).join('');
}

function openAddCustomerModal() {
  document.getElementById('customer-form').reset();
  document.getElementById('customer-modal').classList.remove('hidden');
}

function closeCustomerModal() {
  document.getElementById('customer-modal').classList.add('hidden');
}

async function saveCustomer(e) {
  e.preventDefault();
  const payload = {
    name: document.getElementById('cust-name').value,
    phone: document.getElementById('cust-phone').value,
    address: document.getElementById('cust-address').value,
    openingBalance: parseFloat(document.getElementById('cust-opening').value) || 0,
  };

  try {
    await apiFetch('/api/customers', 'POST', payload);
    closeCustomerModal();
    loadCustomers();
  } catch (err) {
    alert(`Failed to save customer: ${err.message}`);
  }
}

async function viewCustomerLedger(customerId, customerName) {
  try {
    const ledger = await apiFetch(`/api/customers/${customerId}/ledger`);
    document.getElementById('ledger-customer-title').textContent = `Ledger Statement — ${customerName}`;

    const tbody = document.getElementById('ledger-tbody');
    if (ledger.length === 0) {
      tbody.innerHTML = '<tr><td colspan="6" class="text-center">No ledger records available.</td></tr>';
    } else {
      tbody.innerHTML = ledger.map(r => `
        <tr>
          <td>${new Date(r.date).toLocaleString()}</td>
          <td><span class="badge badge-admin">${r.type.toUpperCase()}</span></td>
          <td>${r.description}</td>
          <td>৳${parseFloat(r.amount).toFixed(2)}</td>
          <td>৳${parseFloat(r.previousBalance).toFixed(2)}</td>
          <td><strong>৳${parseFloat(r.newBalance).toFixed(2)}</strong></td>
        </tr>
      `).join('');
    }

    document.getElementById('ledger-modal').classList.remove('hidden');
  } catch (err) {
    alert(`Failed to load ledger statement: ${err.message}`);
  }
}

function closeLedgerModal() {
  document.getElementById('ledger-modal').classList.add('hidden');
}

function openPaymentModal(customerId, customerName) {
  document.getElementById('pay-customer-id').value = customerId;
  document.getElementById('pay-customer-name').value = customerName;
  document.getElementById('pay-amount').value = '';
  document.getElementById('payment-modal').classList.remove('hidden');
}

function closePaymentModal() {
  document.getElementById('payment-modal').classList.add('hidden');
}

async function savePayment(e) {
  e.preventDefault();
  const payload = {
    customerId: document.getElementById('pay-customer-id').value,
    amount: parseFloat(document.getElementById('pay-amount').value),
    paymentMethod: document.getElementById('pay-method').value,
  };

  try {
    await apiFetch('/api/payments', 'POST', payload);
    alert('Payment collected and customer ledger updated successfully!');
    closePaymentModal();
    loadCustomers();
  } catch (err) {
    alert(`Payment failed: ${err.message}`);
  }
}

// RETURNS PROCESSING
async function fetchSaleForReturn() {
  const inv = document.getElementById('return-invoice-input').value.trim();
  if (!inv) {
    alert('Please enter an invoice number');
    return;
  }

  try {
    const sale = await apiFetch(`/api/sales/invoice/${inv}`);
    state.activeReturnSale = sale;

    const tbody = document.getElementById('return-items-tbody');
    tbody.innerHTML = sale.items.map(i => `
      <tr>
        <td><strong>${i.name}</strong></td>
        <td>${i.quantity}</td>
        <td>৳${parseFloat(i.unitPrice).toFixed(2)}</td>
        <td>
          <input type="number" min="0" max="${i.quantity}" value="0" data-item-id="${i.itemId}" style="width: 80px;" />
        </td>
      </tr>
    `).join('');

    document.getElementById('return-sale-preview').classList.remove('hidden');
  } catch (err) {
    alert(`Invoice not found: ${err.message}`);
  }
}

async function submitReturnProcess() {
  if (!state.activeReturnSale) return;

  const inputs = document.querySelectorAll('#return-items-tbody input');
  const returnedItems = [];

  inputs.forEach(input => {
    const qty = parseInt(input.value, 10) || 0;
    if (qty > 0) {
      returnedItems.push({
        itemId: input.getAttribute('data-item-id'),
        quantity: qty,
      });
    }
  });

  if (returnedItems.length === 0) {
    alert('Please select at least 1 item quantity to return');
    return;
  }

  const payload = {
    customerId: state.activeReturnSale.customerId,
    saleId: state.activeReturnSale.id,
    returnedItems,
  };

  try {
    const res = await apiFetch('/api/returns', 'POST', payload);
    alert(`✓ Return processed successfully!\nTotal Refund: ৳${res.totalRefund}`);
    document.getElementById('return-sale-preview').classList.add('hidden');
    document.getElementById('return-invoice-input').value = '';
    state.activeReturnSale = null;
  } catch (err) {
    alert(`Return failed: ${err.message}`);
  }
}

// GENERIC API FETCH WRAPPER
async function apiFetch(endpoint, method = 'GET', body = null, useAuth = true) {
  const headers = { 'Content-Type': 'application/json' };
  if (useAuth && token) {
    headers['Authorization'] = `Bearer ${token}`;
  }

  const options = { method, headers };
  if (body) options.body = JSON.stringify(body);

  const response = await fetch(endpoint, options);
  const json = await response.json();

  if (!response.ok) {
    throw new Error(json.message || 'API Server Error');
  }
  return json;
}

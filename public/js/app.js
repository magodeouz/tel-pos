let currentOrderId = null;
let categories = [];
let customers = {};
let incomingCallData = null;
let allOrdersPage = 1;
let allOrdersPages = 1;
let itemNotes = {};
let isCreatingOrder = false; // prevents double-tap on any order creation

function authHeaders(extra = {}) {
    const token = localStorage.getItem('access_token');
    return token
        ? { "Content-Type": "application/json", "Authorization": `Bearer ${token}`, ...extra }
        : { "Content-Type": "application/json", ...extra };
}

function logout() {
    localStorage.removeItem('access_token');
    localStorage.removeItem('username');
    window.location.href = '/';
}

function switchToOrdersTab() {
    document.querySelectorAll('.tab-btn').forEach(b => b.classList.remove('active'));
    document.querySelectorAll('.tab-pane').forEach(p => p.classList.remove('active'));
    document.querySelector('.tab-btn')?.classList.add('active');
    document.getElementById('orders-panel')?.classList.add('active');
}

// Cari customer picker
let _cariOrderId = null;
function openCariCustomerPicker(orderId) {
    _cariOrderId = orderId;
    document.getElementById('cariSearch').value = '';
    renderCariCustomerList(allCustomersList);
    bootstrap.Modal.getOrCreateInstance(document.getElementById('cariCustomerModal')).show();
}

function renderCariCustomerList(list) {
    const el = document.getElementById('cariCustomerList');
    if (!list.length) { el.innerHTML = '<p class="text-muted" style="font-size:.82rem;text-align:center;padding:12px;">Müşteri bulunamadı</p>'; return; }
    el.innerHTML = list.map(c => `
        <div class="customer-card" onclick="selectCariCustomer(${c.id})" style="cursor:pointer;">
            <div style="display:flex;justify-content:space-between;align-items:center;">
                <div>
                    <div class="customer-card-name">${c.name}</div>
                    <div class="customer-card-phone">${c.phone}</div>
                </div>
            </div>
        </div>
    `).join('');
}

async function selectCariCustomer(customerId) {
    if (!_cariOrderId) return;
    const orderId = _cariOrderId;
    _cariOrderId = null;

    bootstrap.Modal.getInstance(document.getElementById('cariCustomerModal')).hide();

    // Link customer to order if not already linked, then set cari payment
    currentOrderId = null;
    resetOrderPanel();
    switchToOrdersTab();
    printOrder(orderId);

    await Promise.all([
        API.patch(`/api/orders/${orderId}/payment`, { payment_method: 'cari' }),
        API.patch(`/api/orders/${orderId}/status`, { status: 'paid' }),
    ]);
    // Also link customer to order
    await fetch(`/api/orders/${orderId}/customer`, {
        method: 'PATCH',
        headers: authHeaders(),
        body: JSON.stringify({ customer_id: customerId }),
    });

    loadOrders();
    loadAllOrders(1);
}

async function openCustomerDetail(customerId) {
    const d = await API.get(`/api/customers/${customerId}/detail`);
    if (!d || !d.id) return;

    document.getElementById('custDetailName').textContent = d.name;
    document.getElementById('custDetailPhone').textContent = d.phone;
    document.getElementById('custDetailAddress').textContent = d.address || '—';
    document.getElementById('custDetailNote').textContent = d.note || '—';

    const cariEl = document.getElementById('custDetailCari');
    if (d.cari_balance > 0) {
        cariEl.style.display = 'block';
        document.getElementById('custDetailCariAmount').textContent = d.cari_balance.toFixed(2) + ' ₺';
    } else {
        cariEl.style.display = 'none';
    }

    const statusMap = { open: 'Açık', paid: 'Ödendi', cancelled: 'İptal' };
    const payMap = { nakit: '💵 Nakit', kredi_karti: '💳 Kart', cari: '📋 Cari', odenmes: '🚫 Ödenmez', pending: '—' };
    const orders = d.orders || [];

    document.getElementById('custDetailOrders').innerHTML = orders.length === 0
        ? '<p class="text-muted" style="font-size:.8rem;">Sipariş yok</p>'
        : orders.slice(0, 20).map(o => `
            <div style="display:flex;justify-content:space-between;align-items:center;padding:6px 0;border-bottom:1px solid #f1f5f9;font-size:.8rem;">
                <div>
                    <strong>#${o.id}</strong>
                    <span style="color:#64748b;margin-left:6px;">${new Date(o.created_at).toLocaleDateString('tr-TR')}</span>
                    <span style="margin-left:6px;">${payMap[o.payment_method] || ''}</span>
                </div>
                <div style="display:flex;align-items:center;gap:8px;">
                    <strong>${o.total.toFixed(2)} ₺</strong>
                    <span class="status-badge status-${o.status}">${statusMap[o.status] || o.status}</span>
                </div>
            </div>
        `).join('');

    // Store id for "Sipariş Aç" button
    document.getElementById('custDetailOrderBtn').onclick = () => {
        bootstrap.Modal.getInstance(document.getElementById('customerDetailModal')).hide();
        createOrderForCustomer(d.id, d.name);
    };

    bootstrap.Modal.getOrCreateInstance(document.getElementById('customerDetailModal')).show();
}

let _editCustomerId = null;

async function openEditCustomer(customerId) {
    const c = await API.get(`/api/customers/${customerId}`);
    if (!c || !c.id) return;
    _editCustomerId = customerId;
    document.getElementById('editCustPhone').value = c.phone;
    document.getElementById('editCustName').value = c.name;
    document.getElementById('editCustAddress').value = c.address || '';
    document.getElementById('editCustNote').value = c.note || '';
    document.getElementById('editCustError').style.display = 'none';
    bootstrap.Modal.getOrCreateInstance(document.getElementById('editCustomerModal')).show();
}

function openChangePassword() {
    document.getElementById('currentPassword').value = '';
    document.getElementById('newPassword').value = '';
    document.getElementById('pwChangeError').style.display = 'none';
    bootstrap.Modal.getOrCreateInstance(document.getElementById('changePasswordModal')).show();
}

document.addEventListener('DOMContentLoaded', () => {
    document.getElementById('saveEditCustomerBtn')?.addEventListener('click', async () => {
        if (!_editCustomerId) return;
        const phone = document.getElementById('editCustPhone').value.trim();
        const name  = document.getElementById('editCustName').value.trim();
        const address = document.getElementById('editCustAddress').value.trim();
        const note  = document.getElementById('editCustNote').value.trim();
        const errEl = document.getElementById('editCustError');
        if (!phone || !name) { errEl.textContent = 'Telefon ve isim zorunlu.'; errEl.style.display = 'block'; return; }

        const res = await fetch(`/api/customers/${_editCustomerId}`, {
            method: 'PUT', headers: authHeaders(),
            body: JSON.stringify({ phone, name, address: address || null, note: note || null }),
        });
        if (res.ok) {
            bootstrap.Modal.getInstance(document.getElementById('editCustomerModal')).hide();
            loadCustomers();
            loadOrders();
        } else {
            const d = await res.json().catch(() => ({}));
            errEl.textContent = d.detail || 'Hata oluştu.';
            errEl.style.display = 'block';
        }
    });

    document.getElementById('savePasswordBtn')?.addEventListener('click', async () => {
        const current = document.getElementById('currentPassword').value;
        const next = document.getElementById('newPassword').value;
        const errEl = document.getElementById('pwChangeError');
        errEl.style.display = 'none';

        if (!current || !next) { errEl.textContent = 'Her iki alanı da doldurun.'; errEl.style.display = 'block'; return; }
        if (next.length < 6) { errEl.textContent = 'Yeni şifre en az 6 karakter olmalı.'; errEl.style.display = 'block'; return; }

        const res = await fetch('/api/auth/change-password', {
            method: 'POST',
            headers: authHeaders(),
            body: JSON.stringify({ current_password: current, new_password: next }),
        });
        const data = await res.json();
        if (res.ok) {
            bootstrap.Modal.getInstance(document.getElementById('changePasswordModal')).hide();
            alert('✓ Şifre başarıyla değiştirildi.');
        } else {
            errEl.textContent = data.detail || 'Hata oluştu.';
            errEl.style.display = 'block';
        }
    });
});

const API = {
    async get(url) {
        const res = await fetch(url, { headers: authHeaders() });
        if (res.status === 401) { logout(); return {}; }
        return res.json();
    },
    async post(url, data) {
        const res = await fetch(url, {
            method: "POST",
            headers: authHeaders(),
            body: JSON.stringify(data),
        });
        if (res.status === 401) { logout(); return {}; }
        return res.json();
    },
    async put(url, data) {
        const res = await fetch(url, {
            method: "PUT",
            headers: authHeaders(),
            body: JSON.stringify(data),
        });
        if (res.status === 401) { logout(); return {}; }
        return res.json();
    },
    async patch(url, data) {
        const res = await fetch(url, {
            method: "PATCH",
            headers: authHeaders(),
            body: JSON.stringify(data),
        });
        if (res.status === 401) { logout(); return {}; }
        return res.json();
    },
    async delete(url) {
        const res = await fetch(url, { method: "DELETE", headers: authHeaders() });
        if (res.status === 401) { logout(); return {}; }
        return res.json();
    },
};

// WebSocket for real-time incoming call notifications
let _ws = null;
let _shownCallIds = new Set();   // dedup by DB id (polling)
let _shownPhones = new Map();    // dedup by phone+time for WS (no id)
let _callQueue = [];             // queue when modal is already open
let _modalOpen = false;

function initWebSocket() {
    const protocol = window.location.protocol === 'https:' ? 'wss:' : 'ws:';
    _ws = new WebSocket(`${protocol}//${window.location.host}/ws`);

    _ws.onmessage = (event) => {
        try {
            const data = JSON.parse(event.data);
            if (data.type === 'incoming_call') queueIncomingCall(data);
        } catch (e) {}
    };

    _ws.onopen = () => {
        document.getElementById('wsStatus')?.classList.add('connected');
        // Catch any calls that arrived during disconnect
        pollIncomingCalls();
    };
    _ws.onclose = () => {
        document.getElementById('wsStatus')?.classList.remove('connected');
        setTimeout(initWebSocket, 3000);
    };
    _ws.onerror = () => _ws.close();
}

// Safety net polling — runs on WS reconnect + visibility change
async function pollIncomingCalls() {
    try {
        const token = localStorage.getItem('access_token');
        if (!token) return;
        const res = await fetch("/api/incoming-call/pending", { headers: authHeaders() });
        if (!res.ok) return;
        const calls = await res.json();
        if (!Array.isArray(calls)) return;
        for (const call of calls) {
            if (_shownCallIds.has(call.id)) continue;
            _shownCallIds.add(call.id);
            queueIncomingCall({ ...call, type: "incoming_call" });
            // ack so it won't reappear on next poll
            fetch(`/api/incoming-call/${call.id}/ack`, { method: 'POST', headers: authHeaders() });
        }
    } catch (e) { /* ignore */ }
}

// Poll when tab becomes visible again (catches sleep/background)
document.addEventListener('visibilitychange', () => {
    if (!document.hidden) pollIncomingCalls();
});

function queueIncomingCall(data) {
    // Dedup by DB id (reliable)
    if (data.id) {
        if (_shownCallIds.has(data.id)) return;
        _shownCallIds.add(data.id);
    } else {
        // Fallback: dedup by phone within 10 seconds
        const lastSeen = _shownPhones.get(data.phone) || 0;
        if (Date.now() - lastSeen < 10000) return;
        _shownPhones.set(data.phone, Date.now());
    }
    if (_modalOpen) {
        // Queue it — show after current modal closes
        _callQueue.push(data);
    } else {
        handleIncomingCall(data);
    }
}

function playIncomingCallRing() {
    try {
        const audioContext = new (window.AudioContext || window.webkitAudioContext)();
        const now = audioContext.currentTime;

        // Create 3 beeps for ring effect
        for (let i = 0; i < 3; i++) {
            const osc = audioContext.createOscillator();
            const gain = audioContext.createGain();

            osc.connect(gain);
            gain.connect(audioContext.destination);

            osc.frequency.value = 800 + (i * 100);
            osc.type = 'sine';

            const startTime = now + (i * 0.5);
            gain.gain.setValueAtTime(0.3, startTime);
            gain.gain.exponentialRampToValueAtTime(0.01, startTime + 0.3);

            osc.start(startTime);
            osc.stop(startTime + 0.3);
        }
    } catch (e) {
        console.log("Audio context error:", e);
    }
}

function handleIncomingCall(data) {
    _modalOpen = true;
    incomingCallData = data;
    playIncomingCallRing();
    document.getElementById("callPhone").textContent = data.phone;

    const customerInfo = document.getElementById("customerInfo");
    const newCustomerInfo = document.getElementById("newCustomerInfo");

    if (data.customer) {
        customerInfo.style.display = "block";
        newCustomerInfo.style.display = "none";
        document.getElementById("callCustomerName").textContent = data.customer.name;
        document.getElementById("callCustomerAddress").textContent = data.customer.address || "-";
        document.getElementById("callCustomerNote").textContent = data.customer.note || "-";

        // Display past orders
        const ordersList = document.getElementById("customerOrdersList");
        const orders = data.customer.orders || [];

        if (orders.length === 0) {
            ordersList.innerHTML = '<p class="text-muted">Geçmiş sipariş yok</p>';
        } else {
            ordersList.innerHTML = orders
                .map(
                    (order) => `
                <div class="card mb-2">
                    <div class="card-body p-2">
                        <div class="d-flex justify-content-between mb-2">
                            <span><strong>Sipariş #${order.id}</strong></span>
                            <span class="badge bg-secondary">${order.status}</span>
                        </div>
                        <small class="text-muted">
                            ${new Date(order.created_at).toLocaleString("tr-TR")}
                        </small>
                        <div class="mt-2 small">
                            ${order.items
                                .map(
                                    (item) => `
                                <div>${item.product_name} × ${item.quantity} = ${(item.quantity * item.unit_price).toFixed(2)} TL</div>
                            `
                                )
                                .join("")}
                        </div>
                        <div class="mt-2">
                            <strong>Toplam: ${order.total.toFixed(2)} TL</strong>
                        </div>
                        ${order.note ? `<div class="mt-2 text-muted"><small>Not: ${order.note}</small></div>` : ""}
                    </div>
                </div>
            `
                )
                .join("");
        }
    } else {
        customerInfo.style.display = "none";
        newCustomerInfo.style.display = "block";
    }

    const modalEl = document.getElementById("incomingCallModal");
    const modal = bootstrap.Modal.getOrCreateInstance(modalEl);

    // When this modal closes, show next queued call (if any)
    modalEl.addEventListener('hidden.bs.modal', () => {
        _modalOpen = false;
        if (_callQueue.length > 0) {
            const next = _callQueue.shift();
            setTimeout(() => handleIncomingCall(next), 400);
        }
    }, { once: true });

    modal.show();
}

async function loadCategories() {
    categories = await API.get("/api/categories");
    renderCategories();
}

function renderCategories() {
    const container = document.getElementById("categoriesContainer");
    const activeCats = categories.filter(c => c.products.some(p => p.active));
    if (!activeCats.length) { container.innerHTML = '<p class="text-muted">Ürün yok</p>'; return; }

    // Tab bar
    const tabBar = `<div class="cat-tabs" id="catTabBar">${
        activeCats.map((cat, i) => `
            <button class="cat-tab ${i === 0 ? 'active' : ''}" data-cat="${cat.id}">${cat.name}</button>
        `).join('')
    }</div>`;

    // Panels
    const panels = activeCats.map((cat, i) => `
        <div class="cat-panel ${i === 0 ? 'active' : ''}" id="cat-panel-${cat.id}">
            <div class="product-grid">
                ${cat.products.filter(p => p.active).map(prod => `
                    <button class="product-btn" data-product-id="${prod.id}" title="${(prod.note || '').replace(/"/g, '&quot;')}">
                        <span>${prod.name}</span>
                        <span class="product-price">${prod.price.toFixed(2)} ₺</span>
                        ${prod.note ? `<span class="product-note-text">${prod.note}</span>` : ''}
                    </button>
                `).join('')}
            </div>
        </div>
    `).join('');

    container.innerHTML = tabBar + panels;

    // Tab click
    container.querySelector('#catTabBar').addEventListener('click', e => {
        const btn = e.target.closest('.cat-tab');
        if (!btn) return;
        container.querySelectorAll('.cat-tab').forEach(b => b.classList.remove('active'));
        container.querySelectorAll('.cat-panel').forEach(p => p.classList.remove('active'));
        btn.classList.add('active');
        container.querySelector('#cat-panel-' + btn.dataset.cat)?.classList.add('active');
    });
}

async function loadOrders() {
    const [allCustomers, orders] = await Promise.all([
        API.get("/api/customers"),
        API.get("/api/orders?status=open"),
    ]);
    customers = {};
    allCustomers.forEach(c => customers[c.id] = c);
    renderOrders(orders);
}

let allCustomersList = [];

async function loadCustomers() {
    allCustomersList = await API.get("/api/customers");
    renderCustomers(allCustomersList);
}

function filterCustomers(query) {
    const q = query.trim().toLowerCase();
    if (!q) { renderCustomers(allCustomersList); return; }
    renderCustomers(allCustomersList.filter(c =>
        c.name.toLowerCase().includes(q) ||
        c.phone.includes(q) ||
        (c.address || '').toLowerCase().includes(q)
    ));
}

function renderCustomers(customers) {
    const container = document.getElementById("customersList");
    if (customers.length === 0) {
        container.innerHTML = '<div class="empty-state" style="height:60px"><span>Müşteri bulunamadı</span></div>';
        return;
    }

    container.innerHTML = customers
        .map(c => `
        <div class="customer-card" onclick="createOrderForCustomer(${c.id}, '${c.name.replace(/'/g,"\\'")}')">
            <div style="display:flex;align-items:center;gap:4px;">
                <div style="flex:1;min-width:0;">
                    <div class="customer-card-name">${c.name}</div>
                    <div class="customer-card-phone">${c.phone}</div>
                    ${c.address ? `<div class="customer-card-address">${c.address}</div>` : ''}
                </div>
                <div style="display:flex;gap:3px;flex-shrink:0;">
                    <button class="order-item-del" style="font-size:.8rem;"
                        onclick="event.stopPropagation(); openCustomerDetail(${c.id})" title="Detay">👁</button>
                    <button class="order-item-del" style="font-size:.8rem;"
                        onclick="event.stopPropagation(); openEditCustomer(${c.id})" title="Düzenle">✏️</button>
                </div>
            </div>
        </div>
    `).join("");
}

async function createOrderForCustomer(customerId, customerName) {
    if (isCreatingOrder) return;
    isCreatingOrder = true;
    try {
    const order = await API.post("/api/orders", { customer_id: customerId });
    currentOrderId = order.id;
    renderOrderDetails(order);
    loadOrders();
    } finally { isCreatingOrder = false; }
    switchToOrdersTab();
}

function renderOrders(orders) {
    const container = document.getElementById("ordersList");
    if (orders.length === 0) {
        container.innerHTML = '<div class="empty-state" style="height:80px;"><span class="empty-icon">📋</span><span>Açık sipariş yok</span></div>';
        return;
    }

    container.innerHTML = orders.map(order => {
        const customerName = order.customer_id && customers[order.customer_id]
            ? customers[order.customer_id].name : "Müşteri Yok";
        const isActive = currentOrderId === order.id;
        return `
        <div class="order-card ${isActive ? 'active' : ''}" onclick="selectOrder(${order.id})">
            <div class="order-card-top">
                <span class="order-card-id">#${order.id}</span>
                <span class="order-card-total">${order.total.toFixed(2)} ₺</span>
                <button class="cancel-order-btn" onclick="cancelOrderFromList(${order.id}, event)" title="İptal">×</button>
            </div>
            <div class="order-card-customer">${customerName}</div>
            <div class="order-card-items">${order.items.length} ürün</div>
        </div>
    `;
    }).join("");
}

async function loadAllOrders(page = 1) {
    const data = await API.get(`/api/orders/list/paginated?page=${page}&per_page=10`);
    allOrdersPage = data.page;
    allOrdersPages = data.pages;
    renderAllOrders(data.orders);
    updateAllOrdersPagination();
}

function renderAllOrders(orders) {
    const container = document.getElementById("allOrdersList");
    if (orders.length === 0) {
        container.innerHTML = '<div class="col-12"><p class="text-muted text-center">Sipariş yok</p></div>';
        return;
    }

    // Sort by newest first (created_at DESC)
    const sortedOrders = [...orders].sort((a, b) => new Date(b.created_at) - new Date(a.created_at));

    const tableHtml = `
        <table class="orders-table">
            <thead>
                <tr>
                    <th style="width:8%">#</th>
                    <th style="width:20%">Müşteri</th>
                    <th style="width:18%">Tarih</th>
                    <th style="width:8%">Ürün</th>
                    <th style="width:12%">Toplam</th>
                    <th style="width:14%">Durum</th>
                    <th style="width:10%;text-align:center">İşlem</th>
                </tr>
            </thead>
            <tbody>
                ${sortedOrders.map(order => {
                    const customerName = order.customer_id && customers[order.customer_id]
                        ? customers[order.customer_id].name
                        : "—";
                    return `
                    <tr style="cursor: pointer;" data-order-detail-id="${order.id}">
                        <td><strong>#${order.id}</strong></td>
                        <td>${customerName}</td>
                        <td><small>${new Date(order.created_at).toLocaleString("tr-TR")}</small></td>
                        <td>${order.items.length}</td>
                        <td><strong>${order.total.toFixed(2)} TL</strong></td>
                        <td>
                            ${order.status === 'cancelled'
                                ? `<span class="status-badge status-cancelled">İptal</span>`
                                : order.status === 'paid'
                                    ? `<span class="status-badge status-paid">${getPaymentLabel(order.payment_method)}</span>`
                                    : `<span class="status-badge status-open">Açık</span>
                                       <br><button class="action-btn enabled print" style="padding:2px 6px;font-size:.68rem;border-radius:4px;margin-top:3px;" data-mark-paid="${order.id}">✓ Ödendi</button>`
                            }
                        </td>
                        <td style="text-align:center;">
                            <button class="action-btn enabled cancel-action" style="padding:2px 8px;font-size:.72rem;border-radius:4px;" data-open-detail="${order.id}">Aç</button>
                        </td>
                    </tr>
                    `;
                }).join("")}
            </tbody>
        </table>
    `;

    container.innerHTML = tableHtml;
}

function getStatusText(status) {
    const texts = { open: "Açık", paid: "Ödendi", cancelled: "İptal" };
    return texts[status] || status;
}

function getPaymentLabel(method) {
    const map = { nakit: '💵 Nakit', kredi_karti: '💳 Kart', cari: '📋 Cari', odenmes: '🚫 Ödenmez', pending: 'Ödendi' };
    return map[method] || 'Ödendi';
}

function getStatusBadgeColor(status) {
    const colors = { open: "status-open", paid: "status-paid", cancelled: "status-cancelled" };
    return colors[status] || "status-open";
}

async function showOrderDetail(orderId) {
    const order = await API.get(`/api/orders/${orderId}`);
    if (!order || !order.id) return;

    document.getElementById("detailOrderTitle").textContent = `Sipariş #${order.id}`;
    document.getElementById("detailStatus").textContent = getStatusText(order.status);
    document.getElementById("detailStatus").className = `status-badge ${getStatusBadgeColor(order.status)}`;
    document.getElementById("detailDate").textContent = new Date(order.created_at).toLocaleString("tr-TR");
    document.getElementById("detailTotal").textContent = `${order.total.toFixed(2)} TL`;
    document.getElementById("detailNote").textContent = order.note || "—";

    document.getElementById("detailItems").innerHTML = order.items.map(item => `
        <div class="row mb-2 pb-2 border-bottom">
            <div class="col-8">${item.product_name}</div>
            <div class="col-2 text-center">${item.quantity}x</div>
            <div class="col-2 text-end">${(item.quantity * item.unit_price).toFixed(2)} TL</div>
        </div>
    `).join("");

    const modal = new bootstrap.Modal(document.getElementById("orderDetailModal"));
    modal.show();
}

function updateAllOrdersPagination() {
    const paginationNav = document.getElementById("paginationNav");
    const pageInfo = document.getElementById("pageInfo");
    const prevBtn = document.getElementById("prevPageBtn");
    const nextBtn = document.getElementById("nextPageBtn");

    pageInfo.textContent = `${allOrdersPage} / ${allOrdersPages}`;
    prevBtn.parentElement.classList.toggle("disabled", allOrdersPage === 1);
    nextBtn.parentElement.classList.toggle("disabled", allOrdersPage === allOrdersPages);
    paginationNav.style.display = allOrdersPages > 1 ? "block" : "none";
}

async function selectOrder(orderId) {
    currentOrderId = orderId;
    const order = await API.get(`/api/orders/${orderId}`);
    renderOrderDetails(order);
}

function resetOrderPanel() {
    document.getElementById("orderItems").innerHTML = '<div class="empty-state"><span class="empty-icon">🛒</span><span>Sol panelden sipariş seçin<br>veya yeni sipariş açın</span></div>';
    document.getElementById("orderTitle").textContent = "Sipariş Seçin";
    document.getElementById("orderTotal").textContent = "0.00";
    document.getElementById("orderSubtotal").textContent = "0.00";
    document.getElementById("discountAmount").value = "";
    document.getElementById("discountPercent").value = "";
    document.getElementById("discountDisplay").style.display = "none";
    document.getElementById("orderNote").value = "";
    document.getElementById("orderNote").disabled = true;
    document.querySelectorAll(".payment-btn").forEach(b => b.classList.remove("enabled"));
    document.getElementById("printBtn").classList.remove("enabled");
    document.getElementById("cancelBtn").classList.remove("enabled");
}

function renderOrderDetails(order) {
    const itemsDiv = document.getElementById("orderItems");
    const titleDiv = document.getElementById("orderTitle");
    const totalDiv = document.getElementById("orderTotal");
    const noteDiv = document.getElementById("orderNote");

    const customerName = order.customer_id && customers[order.customer_id]
        ? customers[order.customer_id].name
        : "Müşteri Yok";

    titleDiv.textContent = `Sipariş #${order.id} - ${customerName}`;
    totalDiv.textContent = `${order.total.toFixed(2)} TL`;
    noteDiv.value = order.note || "";
    noteDiv.disabled = false;

    if (order.items.length === 0) {
        itemsDiv.innerHTML = '<div class="empty-state"><span class="empty-icon">🛒</span><span>Ürün eklemek için sağ panelden seçin</span></div>';
    } else {
        itemsDiv.innerHTML = order.items
            .map(
                (item) => {
                    const itemNote = itemNotes[item.id] || "";
                    return `
            <div class="order-item-row" data-item-id="${item.id}">
                <span class="order-item-name">${item.product_name}${itemNote ? `<br><small style="color:#3b82f6;font-size:.68rem;">📝 ${itemNote}</small>` : ''}</span>
                <span class="order-item-qty">${item.quantity}×</span>
                <span class="order-item-price">${(item.quantity * item.unit_price).toFixed(2)} ₺</span>
                <button class="order-item-del" data-edit-note="${item.id}" title="Not ekle">✏️</button>
                <button class="order-item-del" onclick="removeItem(${order.id}, ${item.id})" title="Sil" style="color:#ef4444;">
                    <button class="btn btn-sm btn-danger" onclick="removeItem(${order.id}, ${item.id})">×</button>
                </div>
                <div class="col-12 text-muted small">
                    ${item.quantity} × ${item.unit_price.toFixed(2)} = ${(item.quantity * item.unit_price).toFixed(2)} TL
×</button>
            </div>
        `;
                }
            )
            .join("");
    }

    // Payment method & discount
    const paymentButtons = document.querySelectorAll(".payment-btn");
    const discountAmountInput = document.getElementById("discountAmount");
    const discountPercentInput = document.getElementById("discountPercent");

    const hasItems = order.items.length > 0;
    paymentButtons.forEach(btn => {
        btn.classList.toggle("enabled", hasItems);
    });

    discountAmountInput.value = order.discount_amount || 0;
    discountPercentInput.value = order.discount_percent || 0;

    updateOrderTotal(order);

    document.getElementById("printBtn").classList.toggle("enabled", hasItems);
    document.getElementById("cancelBtn").classList.add("enabled");
}

async function addProductToOrder(productId) {
    if (!currentOrderId) {
        alert("Lütfen önce sipariş seçin");
        return;
    }

    await API.post(`/api/orders/${currentOrderId}/items`, {
        product_id: productId,
        quantity: 1,
    });

    const order = await API.get(`/api/orders/${currentOrderId}`);
    renderOrderDetails(order);
    loadOrders(); // fire-and-forget, UI already updated
}

async function removeItem(orderId, itemId) {
    await API.delete(`/api/orders/${orderId}/items/${itemId}`);
    const order = await API.get(`/api/orders/${orderId}`);
    renderOrderDetails(order);
    loadOrders(); // fire-and-forget
}

function printOrder(orderId) {
    window.open(`/api/orders/${orderId}/receipt`, '_blank');
    return true;
}

function updateOrderTotal(order) {
    const subtotal = order.items.reduce((sum, item) => sum + (item.quantity * item.unit_price), 0);
    const discountAmount = parseFloat(document.getElementById("discountAmount").value) || 0;
    const discountPercent = parseFloat(document.getElementById("discountPercent").value) || 0;

    const percentDiscount = subtotal * (discountPercent / 100);
    const totalDiscount = discountAmount + percentDiscount;
    const finalTotal = Math.max(0, subtotal - totalDiscount);

    document.getElementById("orderSubtotal").textContent = `${subtotal.toFixed(2)} TL`;

    if (totalDiscount > 0) {
        document.getElementById("discountDisplay").style.display = "";
        document.getElementById("discountDisplayValue").textContent = `-${totalDiscount.toFixed(2)} TL`;
    } else {
        document.getElementById("discountDisplay").style.display = "none";
    }

    document.getElementById("orderTotal").textContent = `${finalTotal.toFixed(2)} TL`;
}

let noteUpdateTimeout;
async function saveOrderNote(orderId) {
    const noteText = document.getElementById("orderNote").value;
    if (orderId) {
        await API.patch(`/api/orders/${orderId}/note`, { note: noteText });
    }
}

function debounceNoteUpdate(orderId) {
    clearTimeout(noteUpdateTimeout);
    noteUpdateTimeout = setTimeout(() => saveOrderNote(orderId), 1000);
}

function editItemNote(itemId, currentNote, productName) {
    const newNote = prompt(`${productName} için not ekleyin:`, currentNote);
    if (newNote !== null) {
        itemNotes[itemId] = newNote;
        // Re-render the current order to show the updated note
        if (currentOrderId) {
            const order = document.getElementById("orderItems");
            // Trigger re-render by getting the order again
            API.get(`/api/orders/${currentOrderId}`).then(updatedOrder => {
                renderOrderDetails(updatedOrder);
            });
        }
    }
}

async function cancelOrderFromList(orderId, event) {
    event.stopPropagation();
    if (confirm("Bu siparişi iptal etmek istediğinizden emin misiniz?")) {
        await API.patch(`/api/orders/${orderId}/status`, { status: "cancelled" });
        loadOrders();
        if (currentOrderId === orderId) {
            currentOrderId = null;
            document.getElementById("orderItems").innerHTML = '<p class="text-muted">Lütfen sipariş seçin</p>';
            document.getElementById("orderTitle").textContent = "Sipariş Seçin";
            document.getElementById("orderTotal").textContent = "0.00 TL";
            document.getElementById("orderNote").value = "";
            document.getElementById("orderNote").disabled = true;
        }
    }
}

async function markOrderAsPaid(orderId) {
    await API.patch(`/api/orders/${orderId}/status`, { status: "paid" });
    loadAllOrders(allOrdersPage);
}

function checkPrinterStatus() {
    // Browser print — no status needed
}

// Event listeners
document.getElementById("newOrderBtn").addEventListener("click", async (e) => {
    const btn = e.currentTarget;
    if (btn.disabled) return;
    btn.disabled = true;
    btn.textContent = "Oluşturuluyor...";
    try {
        const order = await API.post("/api/orders", { customer_id: null });
        currentOrderId = order.id;
        renderOrderDetails(order);
        loadOrders();
    } finally {
        btn.disabled = false;
        btn.textContent = "+ Yeni Sipariş";
    }
});

document.getElementById("printBtn").addEventListener("click", async () => {
    if (currentOrderId) {
        printOrder(currentOrderId);
    }
});

document.getElementById("cancelBtn").addEventListener("click", async () => {
    if (currentOrderId && confirm("Siparişi iptal etmek istediğinizden emin misiniz?")) {
        const orderId = currentOrderId;
        currentOrderId = null;
        resetOrderPanel();
        await API.patch(`/api/orders/${orderId}/status`, { status: "cancelled" });
        loadOrders();
        loadAllOrders(1);
    }
});

document.getElementById("createOrderFromCallBtn").addEventListener("click", async () => {
    if (incomingCallData) {
        let customerId = null;

        if (incomingCallData.customer) {
            customerId = incomingCallData.customer.id;
        } else {
            // Show customer modal to collect details
            document.getElementById("customerPhone").value = incomingCallData.phone;
            document.getElementById("customerName").value = "";
            document.getElementById("customerSurname").value = "";
            document.getElementById("customerAddress").value = "";
            document.getElementById("customerNote").value = "";

            // Store the callback to create order after saving customer
            window.createOrderAfterCustomer = true;

            bootstrap.Modal.getInstance(document.getElementById("incomingCallModal")).hide();
            const modal = new bootstrap.Modal(document.getElementById("customerModal"));
            modal.show();
            return;
        }

        const order = await API.post("/api/orders", { customer_id: customerId });
        currentOrderId = order.id;
        renderOrderDetails(order);
        loadOrders();

        bootstrap.Modal.getInstance(document.getElementById("incomingCallModal")).hide();
    }
});

// Current time
function updateTime() {
    const now = new Date();
    document.getElementById("currentTime").textContent = now.toLocaleTimeString("tr-TR");
}

setInterval(updateTime, 1000);
updateTime();

// Pagination event listeners
document.getElementById("prevPageBtn").addEventListener("click", (e) => {
    e.preventDefault();
    if (allOrdersPage > 1) {
        loadAllOrders(allOrdersPage - 1);
    }
});

document.getElementById("nextPageBtn").addEventListener("click", (e) => {
    e.preventDefault();
    if (allOrdersPage < allOrdersPages) {
        loadAllOrders(allOrdersPage + 1);
    }
});

// Save customer button
document.getElementById("saveCustomerBtn").addEventListener("click", async () => {
    const phone = document.getElementById("customerPhone").value;
    const name = document.getElementById("customerName").value;
    const surname = document.getElementById("customerSurname").value;
    const address = document.getElementById("customerAddress").value;
    const note = document.getElementById("customerNote").value;

    if (!phone || !name) {
        alert("Telefon ve isim gereklidir!");
        return;
    }

    const fullName = surname ? `${name} ${surname}` : name;

    const customerData = await API.post("/api/customers", {
        phone,
        name: fullName,
        address,
        note,
    });

    loadCustomers();
    bootstrap.Modal.getInstance(document.getElementById("customerModal")).hide();

    // If coming from incoming call, create order
    if (window.createOrderAfterCustomer) {
        window.createOrderAfterCustomer = false;
        const order = await API.post("/api/orders", { customer_id: customerData.id });
        currentOrderId = order.id;
        renderOrderDetails(order);
        loadOrders();
    }
});

function startApp() {
    initWebSocket();
    // Periodic safety-net poll — catches anything WS missed (sleep, network blip)
    setInterval(pollIncomingCalls, 30000);
    loadCategories();
    loadOrders();
    loadCustomers();
    loadAllOrders(1);
    checkPrinterStatus();

    // Product button clicks via event delegation
    document.getElementById("categoriesContainer").addEventListener("click", (e) => {
        const btn = e.target.closest("[data-product-id]");
        if (btn) addProductToOrder(Number(btn.dataset.productId));
    });

    // Item note edit via event delegation
    document.getElementById("orderItems").addEventListener("click", (e) => {
        const btn = e.target.closest("[data-edit-note]");
        if (btn && currentOrderId) {
            const itemId = Number(btn.dataset.editNote);
            const row = btn.closest(".order-item-row");
            const name = row?.querySelector(".order-item-name")?.childNodes[0]?.textContent?.trim() || "";
            editItemNote(itemId, itemNotes[itemId] || "", name);
        }
    });

    // All-orders table: detail open + mark paid via event delegation
    document.getElementById("allOrdersList").addEventListener("click", (e) => {
        const openBtn = e.target.closest("[data-open-detail]");
        if (openBtn) { e.stopPropagation(); showOrderDetail(Number(openBtn.dataset.openDetail)); return; }

        const paidBtn = e.target.closest("[data-mark-paid]");
        if (paidBtn) { e.stopPropagation(); markOrderAsPaid(Number(paidBtn.dataset.markPaid)); return; }

        const row = e.target.closest("[data-order-detail-id]");
        if (row) showOrderDetail(Number(row.dataset.orderDetailId));
    });

    // Event listener for order note updates
    document.getElementById("orderNote").addEventListener("input", () => {
        if (currentOrderId) {
            debounceNoteUpdate(currentOrderId);
        }
    });

    // Event listeners for discount and payment
    document.getElementById("discountAmount").addEventListener("change", async () => {
        if (currentOrderId) {
            const discountAmount = parseFloat(document.getElementById("discountAmount").value) || 0;
            const discountPercent = parseFloat(document.getElementById("discountPercent").value) || 0;
            await API.patch(`/api/orders/${currentOrderId}/discount`, {
                discount_amount: discountAmount,
                discount_percent: discountPercent,
            });
            const order = await API.get(`/api/orders/${currentOrderId}`);
            updateOrderTotal(order);
        }
    });

    document.getElementById("discountPercent").addEventListener("change", async () => {
        if (currentOrderId) {
            const discountAmount = parseFloat(document.getElementById("discountAmount").value) || 0;
            const discountPercent = parseFloat(document.getElementById("discountPercent").value) || 0;
            await API.patch(`/api/orders/${currentOrderId}/discount`, {
                discount_amount: discountAmount,
                discount_percent: discountPercent,
            });
            const order = await API.get(`/api/orders/${currentOrderId}`);
            updateOrderTotal(order);
        }
    });

    // Payment method buttons - auto-pay and print
    document.querySelectorAll(".payment-btn").forEach(btn => {
        btn.addEventListener("click", async () => {
            if (!currentOrderId) return;
            const paymentMethod = btn.dataset.method;

            // Cari: require customer selection first
            if (paymentMethod === 'cari') {
                openCariCustomerPicker(currentOrderId);
                return;
            }

            const orderId = currentOrderId;

            // Clear UI immediately — don't wait for server
            currentOrderId = null;
            resetOrderPanel();
            switchToOrdersTab();

            // Print immediately
            printOrder(orderId);

            // Send payment + status in parallel, refresh lists in background
            await Promise.all([
                API.patch(`/api/orders/${orderId}/payment`, { payment_method: paymentMethod }),
                API.patch(`/api/orders/${orderId}/status`, { status: "paid" }),
            ]);

            loadOrders();
            loadAllOrders(1);
        });
    });
}

// Initialize
document.addEventListener("DOMContentLoaded", () => {
    startApp();
});

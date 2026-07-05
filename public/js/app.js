// ── Number formatting ────────────────────────────────────────
// Turkish format: 1.234,56 ₺
function fmt(n) {
    return Number(n).toLocaleString('tr-TR', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
}

// ── Date formatting (always Istanbul time) ───────────────────
// DB stores UTC ("YYYY-MM-DD HH:MM:SS"). Mark it UTC, render Istanbul.
function toUtcDate(s) {
    if (!s) return null;
    const iso = s.includes('T') ? s : s.replace(' ', 'T') + (s.endsWith('Z') ? '' : 'Z');
    return new Date(iso);
}
function fmtDateTime(s) {
    const d = toUtcDate(s);
    return d ? d.toLocaleString('tr-TR', { timeZone: 'Europe/Istanbul' }) : '';
}
function fmtDate(s) {
    const d = toUtcDate(s);
    return d ? d.toLocaleDateString('tr-TR', { timeZone: 'Europe/Istanbul' }) : '';
}

let currentOrderId = null;
let categories = [];
let customers = {};
let incomingCallData = null;
let allOrdersPage = 1;
let allOrdersPages = 1;
let itemNotes = {};
let isCreatingOrder = false; // prevents double-tap on any order creation

// ── Floor plan (salon/masa) state ───────────────────────────────
let floorData = [];          // [{area_id, area_name, tables:[{id,name,open_order}]}]
let _activeFloorArea = null; // currently selected area tab
let tableLabels = {};        // tableId -> "Bahçe · Masa 3" (for order titles/lists)
let _currentOrder = null;    // last order rendered in the right panel (for empty-salon cleanup)

// Bottom orders-list filters
let _fltType = '';   // '' | 'salon' | 'paket'
let _fltStatus = ''; // '' | 'open' | 'paid'

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

// switchToOrdersTab is defined later as a no-op (left panel no longer has tabs).

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
    showCenterTab(_centerTab);

    // Persist payment, status and customer link BEFORE printing so the
    // receipt shows the payment method and customer info.
    await Promise.all([
        API.patch(`/api/orders/${orderId}/payment`, { payment_method: 'cari' }),
        API.patch(`/api/orders/${orderId}/status`, { status: 'paid' }),
        fetch(`/api/orders/${orderId}/customer`, {
            method: 'PATCH',
            headers: authHeaders(),
            body: JSON.stringify({ customer_id: customerId }),
        }),
    ]);

    printOrder(orderId);

    loadOrders();
    loadAllOrders(1);
    loadFloor();
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
        document.getElementById('custDetailCariAmount').textContent = fmt(d.cari_balance) + ' ₺';
    } else {
        cariEl.style.display = 'none';
    }

    const statusMap = { open: 'Açık', paid: 'Ödendi', cancelled: 'İptal', cari: 'Cari' };
    const payMap = { nakit: '💵 Nakit', kredi_karti: '💳 Kart', cari: '📋 Cari', odenmes: '🚫 Ödenmez', pending: '—' };
    const orders = d.orders || [];

    // Cari tahsilat butonu
    document.getElementById('custDetailCariPayBtn').onclick = () => openCariTahsilat(d.id, d.name, d.cari_balance);
    document.getElementById('custDetailCariPayBtn').style.display = d.cari_balance > 0 ? '' : 'none';

    // Tahsilat geçmişi
    const payments = d.cari_payments || [];
    const paymentsEl = document.getElementById('custDetailPayments');
    if (paymentsEl) {
        if (payments.length === 0) {
            paymentsEl.innerHTML = '<p class="text-muted" style="font-size:.8rem;">Tahsilat yok</p>';
        } else {
            paymentsEl.innerHTML = payments.map(p => `
                <div style="display:flex;justify-content:space-between;padding:5px 0;border-bottom:1px solid #f1f5f9;font-size:.8rem;">
                    <div>
                        <span style="color:#64748b;">${fmtDate(p.created_at)}</span>
                        ${p.note ? `<span style="margin-left:6px;color:#64748b;">${p.note}</span>` : ''}
                    </div>
                    <strong style="color:#16a34a;">+${fmt(p.amount)} ₺</strong>
                </div>
            `).join('');
        }
        document.getElementById('custDetailPaymentsSection').style.display = '';
    }

    document.getElementById('custDetailOrders').innerHTML = orders.length === 0
        ? '<p class="text-muted" style="font-size:.8rem;">Sipariş yok</p>'
        : orders.slice(0, 30).map(o => {
            const isCari = o.payment_method === 'cari';
            const statusLabel = isCari ? '📋 Cari' : statusMap[o.status] || o.status;
            const statusClass = isCari ? 'status-open' : `status-${o.status}`;
            return `
            <div style="display:flex;justify-content:space-between;align-items:center;padding:6px 0;border-bottom:1px solid #f1f5f9;font-size:.8rem;cursor:pointer;"
                 onclick="showOrderDetail(${o.id})">
                <div>
                    <strong>#${o.id}</strong>
                    <span style="color:#64748b;margin-left:6px;">${fmtDate(o.created_at)}</span>
                    <span style="margin-left:6px;">${payMap[o.payment_method] || ''}</span>
                </div>
                <div style="display:flex;align-items:center;gap:8px;">
                    <strong>${fmt(o.total)} ₺</strong>
                    <span class="status-badge ${statusClass}">${statusLabel}</span>
                </div>
            </div>
        `}).join('');

    // Store id for "Sipariş Aç" button
    document.getElementById('custDetailOrderBtn').onclick = () => {
        bootstrap.Modal.getInstance(document.getElementById('customerDetailModal')).hide();
        createOrderForCustomer(d.id, d.name);
    };

    bootstrap.Modal.getOrCreateInstance(document.getElementById('customerDetailModal')).show();
}

// Cari tahsilat — collect payment from customer
let _cariTahsilatCustomerId = null;
function openCariTahsilat(customerId, name, balance) {
    _cariTahsilatCustomerId = customerId;
    document.getElementById('cariTahsilatName').textContent = name;
    document.getElementById('cariTahsilatBalance').textContent = fmt(balance) + ' ₺';
    document.getElementById('cariTahsilatAmount').value = '';
    document.getElementById('cariTahsilatNote').value = '';
    document.getElementById('cariTahsilatError').style.display = 'none';
    bootstrap.Modal.getOrCreateInstance(document.getElementById('cariTahsilatModal')).show();
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

function openNewCustomerModal() {
    document.getElementById('customerPhone').value = '';
    document.getElementById('customerName').value = '';
    document.getElementById('customerSurname').value = '';
    document.getElementById('customerAddress').value = '';
    document.getElementById('customerNote').value = '';
    bootstrap.Modal.getOrCreateInstance(document.getElementById('customerModal')).show();
}

function openChangePassword() {
    document.getElementById('currentPassword').value = '';
    document.getElementById('newPassword').value = '';
    document.getElementById('pwChangeError').style.display = 'none';
    bootstrap.Modal.getOrCreateInstance(document.getElementById('changePasswordModal')).show();
}

document.addEventListener('DOMContentLoaded', () => {
    document.getElementById('saveCariTahsilatBtn')?.addEventListener('click', async () => {
        const amount = parseFloat(document.getElementById('cariTahsilatAmount').value);
        const note = document.getElementById('cariTahsilatNote').value.trim();
        const errEl = document.getElementById('cariTahsilatError');
        if (!amount || amount <= 0) { errEl.textContent = 'Geçerli bir tutar girin.'; errEl.style.display = 'block'; return; }

        const res = await fetch(`/api/customers/${_cariTahsilatCustomerId}/cari-payment`, {
            method: 'POST', headers: authHeaders(),
            body: JSON.stringify({ amount, note }),
        });
        if (res.ok) {
            bootstrap.Modal.getInstance(document.getElementById('cariTahsilatModal')).hide();
            // Refresh customer detail
            openCustomerDetail(_cariTahsilatCustomerId);
        } else {
            const d = await res.json().catch(() => ({}));
            errEl.textContent = d.detail || 'Hata oluştu.';
            errEl.style.display = 'block';
        }
    });

    document.getElementById('deleteCustomerBtn')?.addEventListener('click', async () => {
        if (!_editCustomerId) return;
        const name = document.getElementById('editCustName').value.trim() || 'Bu müşteri';
        // Fetch cari balance so we don't silently erase an unpaid debt record.
        const detail = await API.get(`/api/customers/${_editCustomerId}/detail`).catch(() => null);
        let msg = `"${name}" müşterisini silmek istediğinize emin misiniz?\nBu işlem geri alınamaz.`;
        if (detail && detail.cari_balance > 0) {
            msg = `⚠️ DİKKAT: "${name}" müşterisinin ${fmt(detail.cari_balance)} ₺ ödenmemiş cari borcu var!\n\nSilerseniz bu borç kaydı da silinecek. Yine de silmek istiyor musunuz?`;
        }
        if (!confirm(msg)) return;

        const res = await fetch(`/api/customers/${_editCustomerId}`, {
            method: 'DELETE', headers: authHeaders(),
        });
        if (res.ok) {
            bootstrap.Modal.getInstance(document.getElementById('editCustomerModal'))?.hide();
            _editCustomerId = null;
            loadCustomers();
            loadOrders();
        } else {
            const d = await res.json().catch(() => ({}));
            const errEl = document.getElementById('editCustError');
            errEl.textContent = d.detail || 'Silme sırasında hata oluştu.';
            errEl.style.display = 'block';
        }
    });

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
        // no-store: never serve a stale cached list after a mutation
        const res = await fetch(url, { headers: authHeaders(), cache: 'no-store' });
        if (res.status === 401) { logout(); return {}; }
        return res.json();
    },
    async post(url, data) {
        const res = await fetch(url, {
            method: "POST",
            headers: authHeaders(),
            cache: 'no-store',
            body: JSON.stringify(data),
        });
        if (res.status === 401) { logout(); return {}; }
        return res.json();
    },
    async put(url, data) {
        const res = await fetch(url, {
            method: "PUT",
            headers: authHeaders(),
            cache: 'no-store',
            body: JSON.stringify(data),
        });
        if (res.status === 401) { logout(); return {}; }
        return res.json();
    },
    async patch(url, data) {
        const res = await fetch(url, {
            method: "PATCH",
            headers: authHeaders(),
            cache: 'no-store',
            body: JSON.stringify(data),
        });
        if (res.status === 401) { logout(); return {}; }
        return res.json();
    },
    async delete(url) {
        const res = await fetch(url, { method: "DELETE", headers: authHeaders(), cache: 'no-store' });
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

let _wsPingTimer = null;

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
        // Keepalive: a dead TCP link may never fire onclose. A failing send
        // throws synchronously → we tear down and reconnect.
        clearInterval(_wsPingTimer);
        _wsPingTimer = setInterval(() => {
            try {
                if (_ws && _ws.readyState === WebSocket.OPEN) _ws.send('ping');
                else { clearInterval(_wsPingTimer); _ws?.close(); }
            } catch (e) {
                clearInterval(_wsPingTimer);
                try { _ws?.close(); } catch (_) {}
            }
        }, 25000);
    };
    _ws.onclose = () => {
        document.getElementById('wsStatus')?.classList.remove('connected');
        clearInterval(_wsPingTimer);
        setTimeout(initWebSocket, 3000);
    };
    _ws.onerror = () => _ws.close();
}

// Safety net polling — runs on WS reconnect + visibility change
let _polling = false;
async function pollIncomingCalls() {
    if (_polling) return; // don't stack requests if a poll is still in flight
    _polling = true;
    try {
        const token = localStorage.getItem('access_token');
        if (!token) return;
        const res = await fetch("/api/incoming-call/pending", { headers: authHeaders(), cache: 'no-store' });
        if (!res.ok) return;
        const calls = await res.json();
        if (!Array.isArray(calls)) return;
        for (const call of calls) {
            // Always ack — even if already shown via WS — so it leaves the
            // pending list and the backend stops re-resolving it every poll.
            fetch(`/api/incoming-call/${call.id}/ack`, { method: 'POST', headers: authHeaders() });
            // Dedup is handled inside queueIncomingCall — don't pre-add here,
            // otherwise queueIncomingCall sees the id and returns without showing.
            if (_shownCallIds.has(call.id)) continue;
            queueIncomingCall({ ...call, type: "incoming_call" });
        }
    } catch (e) { /* ignore */ }
    finally { _polling = false; }
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

// Single reused AudioContext — creating one per call leaks resources
// (browsers cap at ~6) and eventually freezes the panel.
let _audioCtx = null;
function playIncomingCallRing() {
    try {
        if (!_audioCtx) {
            _audioCtx = new (window.AudioContext || window.webkitAudioContext)();
        }
        if (_audioCtx.state === 'suspended') _audioCtx.resume();

        const now = _audioCtx.currentTime;
        for (let i = 0; i < 3; i++) {
            const osc = _audioCtx.createOscillator();
            const gain = _audioCtx.createGain();
            osc.connect(gain);
            gain.connect(_audioCtx.destination);
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
  try {
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
                            ${fmtDateTime(order.created_at)}
                        </small>
                        <div class="mt-2 small">
                            ${order.items
                                .map(
                                    (item) => `
                                <div>${item.product_name} × ${item.quantity} = ${fmt(item.quantity * item.unit_price)} TL</div>
                            `
                                )
                                .join("")}
                        </div>
                        <div class="mt-2">
                            <strong>Toplam: ${fmt(order.total)} TL</strong>
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
  } catch (e) {
    // If anything fails, never leave _modalOpen stuck — flush queue safety net
    console.error('handleIncomingCall error:', e);
    _modalOpen = false;
  }
}

// "5 dk", "1 sa 10 dk" — how long a table has been open
function fmtElapsed(utc) {
    if (!utc) return '';
    const t = new Date(utc.replace(' ', 'T') + 'Z').getTime();
    const m = Math.max(0, Math.floor((Date.now() - t) / 60000));
    if (m < 60) return `${m} dk`;
    return `${Math.floor(m / 60)} sa ${m % 60} dk`;
}

// ── Center panel: browse tabs (Masalar/Gel Al/Paket) ↔ products ──
let _centerTab = 'masalar';

function showProducts() {
    ["acikView", "floorView", "gelalView", "paketView"].forEach(id => document.getElementById(id).style.display = "none");
    document.getElementById("centerHeaderNav").style.display = "none";
    document.getElementById("productsView").style.display = "flex";
    document.getElementById("centerHeaderProducts").style.display = "flex";
    // Editing an order → show the right-hand order panel.
    document.querySelector(".pos-layout").classList.remove("no-order");
}

// Show one of the browse tabs (and leave products mode).
function showCenterTab(tab) {
    _centerTab = tab;
    document.getElementById("productsView").style.display = "none";
    document.getElementById("centerHeaderProducts").style.display = "none";
    document.getElementById("centerHeaderNav").style.display = "flex";
    // Browsing (no order selected) → hide the right-hand order panel.
    document.querySelector(".pos-layout").classList.add("no-order");
    document.querySelectorAll(".center-tab").forEach(b => b.classList.toggle("active", b.dataset.center === tab));
    document.getElementById("acikView").style.display = tab === 'acik' ? "flex" : "none";
    document.getElementById("floorView").style.display = tab === 'masalar' ? "flex" : "none";
    document.getElementById("gelalView").style.display = tab === 'gelal' ? "flex" : "none";
    document.getElementById("paketView").style.display = tab === 'paket' ? "flex" : "none";
    if (tab === 'masalar') loadFloor();
    else if (tab === 'acik') loadAcikOrders();
    else loadOrders();
}

// "Açık Siparişler" tab: all open orders (salon + gel al + paket) in one list.
async function loadAcikOrders() {
    const open = await API.get("/api/orders?status=open");
    renderAcikList(open);
}
function orderCtxLabel(o) {
    if (o.order_type === 'salon')
        return '🍽️ ' + (o.table_id && tableLabels[o.table_id] ? tableLabels[o.table_id] : 'Salon');
    const nm = o.customer_id && customers[o.customer_id] ? ' · ' + customers[o.customer_id].name : '';
    if (o.order_type === 'gelal') return '🛍️ Gel Al' + nm;
    return '📦 Paket' + nm;
}
function renderAcikList(orders) {
    const container = document.getElementById("acikList");
    if (!orders.length) { container.innerHTML = '<div class="center-list-empty">Açık sipariş yok</div>'; return; }
    container.innerHTML = orders.map(o => {
        const isActive = currentOrderId === o.id;
        return `
        <div class="order-card ${isActive ? 'active' : ''}" onclick="selectOrder(${o.id})">
            <div class="order-card-top">
                <span class="order-card-id">#${o.id}</span>
                <span class="order-card-total">${fmt(o.total)} ₺</span>
                <button class="cancel-order-btn" onclick="cancelOrderFromList(${o.id}, event)" title="İptal">×</button>
            </div>
            <div class="order-card-customer">${orderCtxLabel(o)}</div>
            <div class="order-card-items">${o.items.length} ürün</div>
        </div>`;
    }).join("");
}

// Back button from products → return to the last browse tab.
async function backToCenter() {
    await discardEmptySalon();
    showCenterTab(_centerTab);
}

// Kept for legacy callers (after pay/cancel): return to the floor tab.
async function showFloor() {
    await discardEmptySalon();
    showCenterTab('masalar');
}

function switchToOrdersTab() { /* no-op: left panel no longer has order tabs */ }

// Cancel the active order if it's an empty salon order (no items added).
async function discardEmptySalon() {
    if (_currentOrder && _currentOrder.order_type === 'salon'
        && (_currentOrder.items?.length || 0) === 0
        && currentOrderId === _currentOrder.id) {
        const id = currentOrderId;
        currentOrderId = null;
        _currentOrder = null;
        resetOrderPanel();
        await API.patch(`/api/orders/${id}/status`, { status: 'cancelled' });
        loadOrders();
        loadAllOrders(allOrdersPage);
    }
}

// ── Floor plan ──────────────────────────────────────────────────
async function loadFloor() {
    floorData = await API.get("/api/orders/floor");
    tableLabels = {};
    for (const a of floorData)
        for (const t of (a.tables || [])) tableLabels[t.id] = `${a.area_name} · ${t.name}`;
    renderFloor();
}

function renderFloor() {
    const container = document.getElementById("floorContainer");
    if (!floorData.length) {
        container.innerHTML = '<div class="empty-state" style="height:100%;"><span class="empty-icon">🍽️</span><span>Henüz salon/masa yok<br>Yönetim → Salonlar\'dan ekleyin</span></div>';
        return;
    }
    if (_activeFloorArea == null || !floorData.some(a => a.area_id === _activeFloorArea))
        _activeFloorArea = floorData[0].area_id;

    // Occupancy across ALL areas, shown as a glanceable summary bar.
    let allTables = 0, busy = 0, grand = 0;
    for (const a of floorData) for (const t of (a.tables || [])) {
        allTables++;
        if (t.open_order) { busy++; grand += t.open_order.total || 0; }
    }
    const summary = `<div class="floor-summary">
        <span class="floor-summary-badge busy">${busy} dolu</span>
        <span class="floor-summary-badge free">${allTables - busy} boş</span>
        <span class="floor-summary-total">Açık toplam: <strong>${fmt(grand)} ₺</strong></span>
    </div>`;

    const tabBar = `<div class="cat-tabs" id="floorTabBar">${
        floorData.map(a => {
            const b = (a.tables || []).filter(t => t.open_order).length;
            return `<button class="cat-tab ${a.area_id === _activeFloorArea ? 'active' : ''}" data-area="${a.area_id}">${a.area_name}${b ? ` <span class="cat-tab-count">${b}</span>` : ''}</button>`;
        }).join('')
    }</div>`;

    const area = floorData.find(a => a.area_id === _activeFloorArea);
    const tables = area.tables || [];
    const grid = tables.length
        ? `<div class="table-grid">${tables.map(t => {
            const occ = t.open_order;
            const nm = t.name.replace(/"/g, '&quot;');
            const an = area.area_name.replace(/"/g, '&quot;');
            if (occ) {
                return `
            <button class="table-tile occupied" data-table-id="${t.id}" data-table-name="${nm}" data-area-name="${an}">
                <span class="table-tile-name">${t.name}</span>
                <span class="table-tile-total">${fmt(occ.total)} ₺</span>
                <span class="table-tile-meta">${occ.count} ürün${occ.opened_at ? ` · ${fmtElapsed(occ.opened_at)}` : ''}</span>
            </button>`;
            }
            return `
            <button class="table-tile" data-table-id="${t.id}" data-table-name="${nm}" data-area-name="${an}">
                <span class="table-tile-name">${t.name}</span>
                <span class="table-tile-state">＋ Boş</span>
            </button>`;
        }).join('')}</div>`
        : '<p class="text-muted" style="font-size:.8rem;padding:12px;text-align:center;">Bu bölümde masa yok. Yönetim → Salonlar\'dan ekleyin.</p>';

    container.innerHTML = summary + tabBar + `<div class="cat-panel active">${grid}</div>`;
}

// Tap a table: open its existing salon order, or start a new one.
async function openTable(tableId, tableName, areaName) {
    if (isCreatingOrder) return;
    // Switching to a different table? Drop any empty salon order first.
    if (_currentOrder && _currentOrder.table_id !== tableId) await discardEmptySalon();
    const area = floorData.find(a => (a.tables || []).some(t => t.id === tableId));
    const t = area && area.tables.find(x => x.id === tableId);

    _centerTab = 'masalar'; // back button returns to the floor
    if (t && t.open_order) {
        currentOrderId = t.open_order.id;
        const order = await API.get(`/api/orders/${currentOrderId}`);
        renderOrderDetails(order);
    } else {
        isCreatingOrder = true;
        try {
            const order = await API.post("/api/orders", { order_type: 'salon', table_id: tableId });
            currentOrderId = order.id;
            renderOrderDetails(order);
        } finally { isCreatingOrder = false; }
    }
    showProducts();
    loadFloor();
    loadAllOrders(allOrdersPage);
}

// Single-tap a table: show a read-only info screen (contents only, no actions).
let _tableInfoModal = null;
function getTableInfoModal() {
    _tableInfoModal = _tableInfoModal || new bootstrap.Modal(document.getElementById("tableInfoModal"));
    return _tableInfoModal;
}
async function showTableInfo(tableId) {
    const label = tableLabels[tableId] || 'Masa';
    const area = floorData.find(a => (a.tables || []).some(t => t.id === tableId));
    const t = area && area.tables.find(x => x.id === tableId);
    document.getElementById('tableInfoTitle').textContent = `🍽️ ${label}`;
    const bodyEl = document.getElementById('tableInfoBody');

    if (!t || !t.open_order) {
        bodyEl.innerHTML = `<div class="empty-state" style="height:70px"><span class="empty-icon">🍽️</span><span>Bu masa boş</span></div>
            <p class="text-muted" style="text-align:center;font-size:.76rem;margin:0;">Açmak için masaya çift tıklayın</p>`;
        getTableInfoModal().show();
        return;
    }

    bodyEl.innerHTML = '<p class="text-muted" style="text-align:center;font-size:.8rem;">Yükleniyor...</p>';
    getTableInfoModal().show();

    const order = await API.get(`/api/orders/${t.open_order.id}`);
    const subtotal = order.items.reduce((s, i) => s + i.quantity * i.unit_price, 0);
    let disc = order.discount_amount || 0;
    if (order.discount_percent) disc += subtotal * order.discount_percent / 100;
    const total = Math.max(0, subtotal - disc);

    const itemsHtml = order.items.length
        ? order.items.map(i => `<div style="display:flex;justify-content:space-between;padding:6px 0;border-bottom:1px solid #f1f5f9;font-size:.86rem;">
            <span>${i.product_name} <span style="color:#64748b;">×${i.quantity}</span></span>
            <strong>${fmt(i.quantity * i.unit_price)} ₺</strong></div>`).join('')
        : '<p class="text-muted" style="text-align:center;font-size:.8rem;">Ürün yok</p>';

    bodyEl.innerHTML = `
        <div style="font-size:.78rem;color:#64748b;margin-bottom:8px;">Sipariş #${order.id}${t.open_order.opened_at ? ` · ${fmtElapsed(t.open_order.opened_at)}` : ''}</div>
        ${itemsHtml}
        ${disc > 0 ? `<div style="display:flex;justify-content:space-between;padding:6px 0;font-size:.82rem;color:#ef4444;"><span>İndirim</span><span>-${fmt(disc)} ₺</span></div>` : ''}
        <div style="display:flex;justify-content:space-between;margin-top:10px;padding-top:8px;border-top:2px solid #0f172a;font-weight:800;font-size:1rem;"><span>TOPLAM</span><span>${fmt(total)} ₺</span></div>
        ${order.note ? `<div style="margin-top:8px;font-size:.8rem;color:#64748b;">📝 ${order.note}</div>` : ''}
        <p class="text-muted" style="text-align:center;font-size:.75rem;margin:12px 0 0;">İşlem yapmak için masaya çift tıklayın</p>`;
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
                        <span class="product-price">${fmt(prod.price)} ₺</span>
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
    // Center tabs list open Gel Al + Paket orders by type; salon opens live on the floor.
    const [allCustomers, gelal, paket] = await Promise.all([
        API.get("/api/customers"),
        API.get("/api/orders?status=open&type=gelal"),
        API.get("/api/orders?status=open&type=paket"),
    ]);
    customers = {};
    allCustomers.forEach(c => customers[c.id] = c);
    renderOpenList("gelalList", gelal, "Açık gel al siparişi yok");
    renderOpenList("paketList", paket, "Açık paket siparişi yok");
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
    // Close the customers popup if it was opened from there.
    bootstrap.Modal.getInstance(document.getElementById("customersModal"))?.hide();
    await discardEmptySalon();
    isCreatingOrder = true;
    try {
    const order = await API.post("/api/orders", { customer_id: customerId, order_type: 'paket' });
    currentOrderId = order.id;
    _centerTab = 'paket';
    renderOrderDetails(order);
    loadOrders();
    } finally { isCreatingOrder = false; }
    showProducts();
}

function renderOpenList(containerId, orders, emptyText) {
    const container = document.getElementById(containerId);
    if (!container) return;
    if (orders.length === 0) {
        container.innerHTML = `<div class="center-list-empty">${emptyText}</div>`;
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
                <span class="order-card-total">${fmt(order.total)} ₺</span>
                <button class="cancel-order-btn" onclick="cancelOrderFromList(${order.id}, event)" title="İptal">×</button>
            </div>
            <div class="order-card-customer">${customerName}</div>
            <div class="order-card-items">${order.items.length} ürün</div>
        </div>
    `;
    }).join("");
}

async function loadAllOrders(page = 1) {
    const params = new URLSearchParams({ page: String(page), per_page: "10" });
    if (_fltType) params.set("type", _fltType);
    if (_fltStatus) params.set("status", _fltStatus);
    const data = await API.get(`/api/orders/list/paginated?${params.toString()}`);
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
                    <th style="width:7%">#</th>
                    <th style="width:17%">Tür</th>
                    <th style="width:15%">Müşteri</th>
                    <th style="width:13%">Telefon</th>
                    <th style="width:15%">Tarih</th>
                    <th style="width:6%">Ürün</th>
                    <th style="width:12%">Toplam</th>
                    <th style="width:15%">Durum</th>
                </tr>
            </thead>
            <tbody>
                ${sortedOrders.map(order => {
                    const cust = order.customer_id ? customers[order.customer_id] : null;
                    const customerName = cust ? cust.name : "—";
                    const customerPhone = cust && cust.phone ? cust.phone : "—";
                    const typeLabel = order.order_type === 'salon'
                        ? `🍽️ ${order.table_id && tableLabels[order.table_id] ? tableLabels[order.table_id] : 'Salon'}`
                        : order.order_type === 'gelal' ? '🛍️ Gel Al' : '📦 Paket';
                    return `
                    <tr style="cursor: pointer;" data-order-detail-id="${order.id}">
                        <td><strong>#${order.id}</strong></td>
                        <td><small>${typeLabel}</small></td>
                        <td>${customerName}</td>
                        <td>${customerPhone}</td>
                        <td><small>${fmtDateTime(order.created_at)}</small></td>
                        <td>${order.items.length}</td>
                        <td><strong>${fmt(order.total)} TL</strong></td>
                        <td>
                            ${order.status === 'cancelled'
                                ? `<span class="status-badge status-cancelled">İptal</span>`
                                : order.status === 'paid' && order.payment_method === 'cari'
                                    ? `<span class="status-badge status-open">📋 Cari</span>`
                                    : order.status === 'paid'
                                        ? `<span class="status-badge status-paid">${getPaymentLabel(order.payment_method)}</span>`
                                        : `<span class="status-badge status-open">Açık</span>`
                            }
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

let _detailOrderId = null;

async function showOrderDetail(orderId) {
    const order = await API.get(`/api/orders/${orderId}`);
    if (!order || !order.id) return;
    _detailOrderId = orderId;

    document.getElementById("detailOrderTitle").textContent = `Sipariş #${order.id}`;

    // Status
    const isCari = order.payment_method === 'cari';
    const statusLabel = isCari ? '📋 Cari' : getStatusText(order.status);
    const statusClass = isCari ? 'status-open' : getStatusBadgeColor(order.status);
    document.getElementById("detailStatus").textContent = statusLabel;
    document.getElementById("detailStatus").className = `status-badge ${statusClass}`;

    document.getElementById("detailDate").textContent = fmtDateTime(order.created_at);

    // Customer
    const custEl = document.getElementById("detailCustomer");
    if (order.customer_id && customers[order.customer_id]) {
        document.getElementById("detailCustomerName").textContent = customers[order.customer_id].name;
        custEl.style.display = '';
    } else {
        custEl.style.display = 'none';
    }

    // Total + discount
    const subtotal = order.items.reduce((s, i) => s + i.quantity * i.unit_price, 0);
    const discount = order.discount_amount || 0;
    document.getElementById("detailTotal").textContent = `${fmt(order.total)} ₺`;
    const discEl = document.getElementById("detailDiscount");
    if (discount > 0) {
        document.getElementById("detailDiscountVal").textContent = `-${fmt(discount)} ₺`;
        discEl.style.display = '';
    } else { discEl.style.display = 'none'; }

    // Payment
    const payMap = { nakit: '💵 Nakit', kredi_karti: '💳 Kredi Kartı', cari: '📋 Cari', odenmes: '🚫 Ödenmez', pending: '—' };
    document.getElementById("detailPayment").textContent = payMap[order.payment_method] || '—';

    // Note
    const noteWrap = document.getElementById("detailNoteWrap");
    noteWrap.style.display = order.note ? '' : 'none';
    document.getElementById("detailNote").textContent = order.note || '';

    // Items
    document.getElementById("detailItems").innerHTML = order.items.length === 0
        ? '<p class="text-muted" style="font-size:.8rem;">Ürün yok</p>'
        : order.items.map(item => `
        <div style="display:flex;justify-content:space-between;align-items:center;padding:5px 0;border-bottom:1px solid #f1f5f9;font-size:.82rem;">
            <div style="flex:1;font-weight:500;">${item.product_name}</div>
            <div style="color:#64748b;margin:0 10px;">${item.quantity}×</div>
            <div style="font-weight:700;">${fmt(item.quantity * item.unit_price)} ₺</div>
        </div>
    `).join("");

    // Hide payment change panel
    document.getElementById("detailPaymentChangeWrap").style.display = 'none';

    // Reprint
    document.getElementById("detailReprintBtn").onclick = () => printOrder(orderId);

    bootstrap.Modal.getOrCreateInstance(document.getElementById("orderDetailModal")).show();
}

function openDetailPaymentChange() {
    const wrap = document.getElementById("detailPaymentChangeWrap");
    wrap.style.display = wrap.style.display === 'none' ? '' : 'none';
}

async function updateDetailPayment(method) {
    if (!_detailOrderId) return;
    if ((method === 'cari' || method === 'odenmes') && !requirePin()) return;
    await API.patch(`/api/orders/${_detailOrderId}/payment`, { payment_method: method });
    document.getElementById("detailPaymentChangeWrap").style.display = 'none';
    // Refresh
    showOrderDetail(_detailOrderId);
    loadAllOrders(allOrdersPage);
    loadOrders();
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
    if (_currentOrder && _currentOrder.id !== orderId) await discardEmptySalon();
    currentOrderId = orderId;
    const order = await API.get(`/api/orders/${orderId}`);
    renderOrderDetails(order);
    showProducts();
}

function resetOrderPanel() {
    _currentOrder = null;
    document.getElementById("orderItems").innerHTML = '<div class="empty-state"><span class="empty-icon">🛒</span><span>Masaya dokun veya<br>Paket / Gel-Al ile sipariş aç</span></div>';
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
    document.getElementById("enterOrderBtn").classList.remove("enabled");
}

function renderOrderDetails(order) {
    _currentOrder = order;
    const itemsDiv = document.getElementById("orderItems");
    const titleDiv = document.getElementById("orderTitle");
    const totalDiv = document.getElementById("orderTotal");
    const noteDiv = document.getElementById("orderNote");

    const customerName = order.customer_id && customers[order.customer_id]
        ? customers[order.customer_id].name
        : null;

    // Context label: salon shows the table, paket shows the customer (if any).
    let ctx;
    if (order.order_type === 'salon') {
        ctx = '🍽️ ' + (order.table_id && tableLabels[order.table_id] ? tableLabels[order.table_id] : 'Salon');
    } else if (order.order_type === 'gelal') {
        ctx = '🛍️ Gel Al' + (customerName ? ' · ' + customerName : '');
    } else {
        ctx = '📦 Paket' + (customerName ? ' · ' + customerName : '');
    }
    titleDiv.textContent = `#${order.id} · ${ctx}`;
    const ctxEl = document.getElementById("centerOrderCtx");
    if (ctxEl) ctxEl.textContent = ctx;
    totalDiv.textContent = `${fmt(order.total)} TL`;
    noteDiv.value = order.note || "";
    noteDiv.disabled = false;

    if (order.items.length === 0) {
        itemsDiv.innerHTML = '<div class="empty-state"><span class="empty-icon">🛒</span><span>Ürün eklemek için sağ panelden seçin</span></div>';
    } else {
        itemsDiv.innerHTML = order.items
            .map((item) => {
                const itemNote = itemNotes[item.id] || "";
                return `
            <div class="order-item-row" data-item-id="${item.id}">
                <span class="order-item-name">
                    ${item.product_name}
                    ${itemNote ? `<br><small style="color:#3b82f6;font-size:.68rem;">📝 ${itemNote}</small>` : ''}
                </span>
                <span class="order-item-qty">${item.quantity}×</span>
                <span class="order-item-price">${fmt(item.quantity * item.unit_price)} ₺</span>
                <button class="order-item-action" data-edit-note="${item.id}" title="Düzenle">✏️</button>
                <button class="order-item-action danger" onclick="removeItem(${order.id}, ${item.id})" title="Sil">🗑</button>
            </div>
        `;
            })
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
    document.getElementById("enterOrderBtn").classList.add("enabled");
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
    loadOrders();
    loadAllOrders(allOrdersPage);
    loadFloor();
}

// Manager PIN gate for sensitive actions (item delete, cari/ödenmez settle).
const MANAGER_PIN = "4444";
function requirePin() {
    const pin = prompt("Yönetici parolası:");
    if (pin === null) return false;          // cancelled
    if (pin === MANAGER_PIN) return true;
    alert("Hatalı parola");
    return false;
}

async function removeItem(orderId, itemId) {
    if (!requirePin()) return;
    await API.delete(`/api/orders/${orderId}/items/${itemId}`);
    const order = await API.get(`/api/orders/${orderId}`);
    renderOrderDetails(order);
    loadOrders();
    loadAllOrders(allOrdersPage);
    loadFloor();
}

function printOrder(orderId) {
    // Print via a hidden iframe so no visible browser tab/page opens — the
    // system print dialog appears directly over the POS. The receipt page
    // auto-calls window.print() on load, which prints just the iframe's
    // contents (the receipt).
    const url = `/api/orders/${orderId}/receipt`;
    document.getElementById('receiptPrintFrame')?.remove();

    const frame = document.createElement('iframe');
    frame.id = 'receiptPrintFrame';
    frame.setAttribute('aria-hidden', 'true');
    frame.style.cssText = 'position:fixed;left:-9999px;top:0;width:1px;height:1px;border:0;';
    frame.src = url;
    document.body.appendChild(frame);
    return true;
}

function updateOrderTotal(order) {
    const subtotal = order.items.reduce((sum, item) => sum + (item.quantity * item.unit_price), 0);
    const discountAmount = parseFloat(document.getElementById("discountAmount").value) || 0;
    const discountPercent = parseFloat(document.getElementById("discountPercent").value) || 0;

    const percentDiscount = subtotal * (discountPercent / 100);
    const totalDiscount = discountAmount + percentDiscount;
    const finalTotal = Math.max(0, subtotal - totalDiscount);

    document.getElementById("orderSubtotal").textContent = `${fmt(subtotal)} TL`;

    if (totalDiscount > 0) {
        document.getElementById("discountDisplay").style.display = "";
        document.getElementById("discountDisplayValue").textContent = `-${fmt(totalDiscount)} TL`;
    } else {
        document.getElementById("discountDisplay").style.display = "none";
    }

    document.getElementById("orderTotal").textContent = `${fmt(finalTotal)} TL`;
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
        loadFloor();
        loadAllOrders(allOrdersPage);
        if (currentOrderId === orderId) {
            currentOrderId = null;
            resetOrderPanel();
            showCenterTab(_centerTab);
        }
    }
}

async function markOrderAsPaid(orderId) {
    await API.patch(`/api/orders/${orderId}/status`, { status: "paid" });
    loadAllOrders(allOrdersPage);
    loadFloor();
}

function checkPrinterStatus() {
    // Browser print — no status needed
}

// Event listeners
// Create a Gel Al / Paket order from the left footer buttons → jump to products.
async function createTypedOrder(orderType, btn) {
    if (btn.disabled) return;
    const orig = btn.textContent;
    btn.disabled = true;
    btn.textContent = "...";
    try {
        await discardEmptySalon();
        const order = await API.post("/api/orders", { customer_id: null, order_type: orderType });
        currentOrderId = order.id;
        _centerTab = orderType; // back button returns to this order's tab
        renderOrderDetails(order);
        showProducts();
        await loadOrders();
        loadAllOrders(allOrdersPage);
    } finally {
        btn.disabled = false;
        btn.textContent = orig;
    }
}

document.getElementById("newGelAlBtn").addEventListener("click", (e) => createTypedOrder('gelal', e.currentTarget));
document.getElementById("newPaketBtn").addEventListener("click", (e) => createTypedOrder('paket', e.currentTarget));

// Customers popup
let _customersModal = null;
function getCustomersModal() {
    _customersModal = _customersModal || new bootstrap.Modal(document.getElementById("customersModal"));
    return _customersModal;
}
document.getElementById("openCustomersModalBtn").addEventListener("click", () => {
    document.getElementById("customerSearch").value = '';
    loadCustomers();
    getCustomersModal().show();
});

// Today's orders popup
let _ordersModal = null;
document.getElementById("openOrdersModalBtn").addEventListener("click", () => {
    _ordersModal = _ordersModal || new bootstrap.Modal(document.getElementById("ordersModal"));
    loadAllOrders(1);
    _ordersModal.show();
});

document.getElementById("printBtn").addEventListener("click", async () => {
    if (currentOrderId) {
        printOrder(currentOrderId);
    } else {
        alert("Yazdırmak için önce bir sipariş seçin.");
    }
});

document.getElementById("cancelBtn").addEventListener("click", async () => {
    if (currentOrderId && confirm("Siparişi iptal etmek istediğinizden emin misiniz?")) {
        const orderId = currentOrderId;
        currentOrderId = null;
        resetOrderPanel();
        showCenterTab(_centerTab);
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

        await discardEmptySalon();
        const order = await API.post("/api/orders", { customer_id: customerId, order_type: 'paket' });
        currentOrderId = order.id;
        _centerTab = 'paket';
        renderOrderDetails(order);
        loadOrders();
        showProducts();

        bootstrap.Modal.getInstance(document.getElementById("incomingCallModal")).hide();
    }
});

// Current time
function updateTime() {
    const now = new Date();
    document.getElementById("currentTime").textContent = now.toLocaleTimeString("tr-TR", { timeZone: 'Europe/Istanbul' });
}

setInterval(updateTime, 1000);
updateTime();

// ── Auto day-close at 23:59 Istanbul time ───────────────────────
// The receipt printer is attached to this computer, not the cloud, so the
// closing report can only be printed from an open POS screen. While the page
// is open we check the Istanbul clock and, once per day at 23:59, open the
// day-close report (it auto-prints itself). localStorage guards against
// printing twice if the page is reloaded within that minute.
function istanbulNowParts() {
    const fmt = new Intl.DateTimeFormat('en-CA', {
        timeZone: 'Europe/Istanbul', hourCycle: 'h23',
        year: 'numeric', month: '2-digit', day: '2-digit',
        hour: '2-digit', minute: '2-digit',
    });
    const p = {};
    for (const part of fmt.formatToParts(new Date())) p[part.type] = part.value;
    return p; // { year, month, day, hour, minute }
}

function checkAutoDayClose() {
    const p = istanbulNowParts();
    if (p.hour === '23' && p.minute === '59') {
        const today = `${p.year}-${p.month}-${p.day}`;
        if (localStorage.getItem('lastDayClose') !== today) {
            localStorage.setItem('lastDayClose', today);
            window.open('/api/reports/day-close', '_blank');
        }
    }
}

setInterval(checkAutoDayClose, 20000);
checkAutoDayClose();

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
        const order = await API.post("/api/orders", { customer_id: customerData.id, order_type: 'paket' });
        currentOrderId = order.id;
        _centerTab = 'paket';
        renderOrderDetails(order);
        loadOrders();
        showProducts();
    }
});

function startApp() {
    initWebSocket();
    // Periodic safety-net poll — catches anything WS missed (sleep, network blip)
    setInterval(pollIncomingCalls, 3000);
    pollIncomingCalls(); // also poll once on startup
    loadCategories();
    loadOrders();
    loadCustomers();
    loadAllOrders(1);
    loadFloor();
    checkPrinterStatus();

    // Keep the active browse tab fresh (open totals, elapsed time) while idle.
    setInterval(() => {
        if (currentOrderId) return; // editing an order
        if (document.getElementById("productsView").style.display !== "none") return;
        if (_centerTab === 'masalar') loadFloor();
        else if (_centerTab === 'acik') loadAcikOrders();
        else loadOrders();
    }, 30000);

    // Product button clicks via event delegation
    document.getElementById("categoriesContainer").addEventListener("click", (e) => {
        const btn = e.target.closest("[data-product-id]");
        if (btn) addProductToOrder(Number(btn.dataset.productId));
    });

    // Floor plan: area-tab + table-tile clicks via event delegation.
    // Single-click a table → read-only info screen. Double-click → open it.
    let _tableClickTimer = null;
    const floorEl = document.getElementById("floorContainer");
    floorEl.addEventListener("click", (e) => {
        const tab = e.target.closest("[data-area]");
        if (tab) { _activeFloorArea = Number(tab.dataset.area); renderFloor(); return; }
        const tile = e.target.closest("[data-table-id]");
        if (!tile) return;
        // Second click of a double-click: cancel the pending single-click.
        if (_tableClickTimer) { clearTimeout(_tableClickTimer); _tableClickTimer = null; return; }
        const id = Number(tile.dataset.tableId);
        _tableClickTimer = setTimeout(() => {
            _tableClickTimer = null;
            showTableInfo(id);
        }, 250);
    });
    floorEl.addEventListener("dblclick", (e) => {
        const tile = e.target.closest("[data-table-id]");
        if (!tile) return;
        if (_tableClickTimer) { clearTimeout(_tableClickTimer); _tableClickTimer = null; }
        openTable(Number(tile.dataset.tableId), tile.dataset.tableName, tile.dataset.areaName);
    });

    // Bottom orders-list filter chips (type + status)
    document.getElementById("orderFilters").addEventListener("click", (e) => {
        const chip = e.target.closest(".filter-chip");
        if (!chip) return;
        const group = chip.closest(".filter-group");
        group.querySelectorAll(".filter-chip").forEach(c => c.classList.remove("active"));
        chip.classList.add("active");
        if (group.dataset.filter === "type") _fltType = chip.dataset.value;
        else _fltStatus = chip.dataset.value;
        loadAllOrders(1);
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

            // Cari / Ödenmez require a manager PIN before settling.
            if ((paymentMethod === 'cari' || paymentMethod === 'odenmes') && !requirePin()) return;

            // Cari: require customer selection first
            if (paymentMethod === 'cari') {
                openCariCustomerPicker(currentOrderId);
                return;
            }

            const orderId = currentOrderId;

            // Clear UI immediately — don't wait for server
            currentOrderId = null;
            resetOrderPanel();
            showCenterTab(_centerTab);

            // Save the payment method BEFORE printing so the receipt shows
            // the correct payment.
            await Promise.all([
                API.patch(`/api/orders/${orderId}/payment`, { payment_method: paymentMethod }),
                API.patch(`/api/orders/${orderId}/status`, { status: "paid" }),
            ]);

            printOrder(orderId);

            loadOrders();
            loadAllOrders(1);
            loadFloor();
        });
    });
}

// Initialize
document.addEventListener("DOMContentLoaded", () => {
    startApp();
});

let currentOrderId = null;
let categories = [];
let customers = {};
let incomingCallData = null;
let allOrdersPage = 1;
let allOrdersPages = 1;
let itemNotes = {}; // Track notes for items: { item_id: "note text" }

function authHeaders(extra = {}) {
    const token = localStorage.getItem('access_token');
    return token
        ? { "Content-Type": "application/json", "Authorization": `Bearer ${token}`, ...extra }
        : { "Content-Type": "application/json", ...extra };
}

const API = {
    async get(url) {
        const res = await fetch(url, { headers: authHeaders() });
        if (res.status === 401) { window.location.href = '/'; return {}; }
        return res.json();
    },
    async post(url, data) {
        const res = await fetch(url, {
            method: "POST",
            headers: authHeaders(),
            body: JSON.stringify(data),
        });
        if (res.status === 401) { window.location.href = '/'; return {}; }
        return res.json();
    },
    async put(url, data) {
        const res = await fetch(url, {
            method: "PUT",
            headers: authHeaders(),
            body: JSON.stringify(data),
        });
        if (res.status === 401) { window.location.href = '/'; return {}; }
        return res.json();
    },
    async patch(url, data) {
        const res = await fetch(url, {
            method: "PATCH",
            headers: authHeaders(),
            body: JSON.stringify(data),
        });
        if (res.status === 401) { window.location.href = '/'; return {}; }
        return res.json();
    },
    async delete(url) {
        const res = await fetch(url, { method: "DELETE", headers: authHeaders() });
        if (res.status === 401) { window.location.href = '/'; return {}; }
        return res.json();
    },
};

// WebSocket connection
function initWebSocket() {
    const protocol = window.location.protocol === "https:" ? "wss:" : "ws:";
    const ws = new WebSocket(`${protocol}//${window.location.host}/ws`);

    ws.onmessage = (event) => {
        const data = JSON.parse(event.data);
        if (data.type === "incoming_call") {
            handleIncomingCall(data);
        }
    };

    ws.onclose = () => {
        setTimeout(() => initWebSocket(), 3000);
    };
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

    const modal = new bootstrap.Modal(document.getElementById("incomingCallModal"));
    modal.show();
}

async function loadCategories() {
    categories = await API.get("/api/categories");
    renderCategories();
}

function renderCategories() {
    const container = document.getElementById("categoriesContainer");
    container.innerHTML = categories
        .map(
            (cat) => `
        <h6>${cat.name}</h6>
        <div class="btn-group-vertical w-100 mb-3">
            ${cat.products
                .filter((p) => p.active)
                .map(
                    (prod) => `
                <button class="btn btn-outline-primary btn-sm text-start"
                    onclick="addProductToOrder(${prod.id}, '${prod.name}', ${prod.price})"
                    title="${prod.note ? prod.note : ''}">
                    ${prod.name} - ${prod.price.toFixed(2)} TL
                    ${prod.note ? `<br><small class="text-secondary">${prod.note}</small>` : ""}
                </button>
            `
                )
                .join("")}
        </div>
    `
        )
        .join("");
}

async function loadOrders() {
    const allCustomers = await API.get("/api/customers/");
    customers = {};
    allCustomers.forEach(c => customers[c.id] = c);

    const orders = await API.get("/api/orders?status=open");
    renderOrders(orders);
}

async function loadCustomers() {
    const customers = await API.get("/api/customers");
    renderCustomers(customers);
}

function renderCustomers(customers) {
    const container = document.getElementById("customersList");
    if (customers.length === 0) {
        container.innerHTML = '<p class="text-muted">Müşteri yok</p>';
        return;
    }

    container.innerHTML = customers
        .map(
            (customer) => `
        <div class="card mb-2 cursor-pointer" style="cursor: pointer;" onclick="createOrderForCustomer(${customer.id}, '${customer.name}')">
            <div class="card-body p-2">
                <div class="d-flex justify-content-between">
                    <span><strong>${customer.name}</strong></span>
                </div>
                <small class="text-muted">${customer.phone}</small><br>
                <small>${customer.address || "Adres yok"}</small>
            </div>
        </div>
    `
        )
        .join("");
}

async function createOrderForCustomer(customerId, customerName) {
    const order = await API.post("/api/orders", { customer_id: customerId });
    currentOrderId = order.id;
    renderOrderDetails(order);
    loadOrders();
    document.getElementById("orders-tab").click();
}

function renderOrders(orders) {
    const container = document.getElementById("ordersList");
    if (orders.length === 0) {
        container.innerHTML = '<p class="text-muted">Sipariş yok</p>';
        return;
    }

    container.innerHTML = orders
        .map(
            (order) => {
                const customerName = order.customer_id && customers[order.customer_id]
                    ? customers[order.customer_id].name
                    : "Müşteri Yok";
                return `
        <div class="card mb-2" style="background-color: ${currentOrderId === order.id ? '#e9ecef' : 'white'}">
            <div class="card-body p-2">
                <div class="d-flex justify-content-between align-items-start">
                    <div style="flex: 1; cursor: pointer;" onclick="selectOrder(${order.id})">
                        <div class="d-flex justify-content-between mb-1">
                            <span><strong>#${order.id}</strong></span>
                            <span class="badge bg-info">${order.items.length} ürün</span>
                        </div>
                        <small class="text-success"><strong>${customerName}</strong></small><br>
                        <small class="text-muted">${order.total.toFixed(2)} TL</small>
                    </div>
                    <button class="btn btn-sm btn-danger ms-2" onclick="cancelOrderFromList(${order.id}, event)" title="İptal">×</button>
                </div>
            </div>
        </div>
    `;
            }
        )
        .join("");
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
        <table class="table table-sm table-hover mb-0">
            <thead class="table-light">
                <tr>
                    <th style="width: 8%;">Sipariş #</th>
                    <th style="width: 20%;">Müşteri</th>
                    <th style="width: 18%;">Tarih</th>
                    <th style="width: 10%;">Ürün Sayısı</th>
                    <th style="width: 12%;">Toplam</th>
                    <th style="width: 12%;">Durum</th>
                    <th style="width: 8%; text-align: center;">İşlem</th>
                </tr>
            </thead>
            <tbody>
                ${sortedOrders.map(order => {
                    const customerName = order.customer_id && customers[order.customer_id]
                        ? customers[order.customer_id].name
                        : "—";
                    return `
                    <tr style="cursor: pointer;" onclick="showOrderDetail(${order.id}, '${order.status}', '${order.created_at}', ${order.total}, \`${(order.note || '').replace(/`/g, '\\`')}\`, ${JSON.stringify(order.items).replace(/`/g, '\\`')})">
                        <td><strong>#${order.id}</strong></td>
                        <td>${customerName}</td>
                        <td><small>${new Date(order.created_at).toLocaleString("tr-TR")}</small></td>
                        <td>${order.items.length}</td>
                        <td><strong>${order.total.toFixed(2)} TL</strong></td>
                        <td>
                            <span class="badge ${getStatusBadgeColor(order.status)}">${getStatusText(order.status)}</span>
                            ${order.status !== 'paid' ? `<br><button class="btn btn-sm btn-success mt-1" onclick="event.stopPropagation(); markOrderAsPaid(${order.id})">Ödendi Yap</button>` : ''}
                        </td>
                        <td style="text-align: center;">
                            <button class="btn btn-sm btn-primary" onclick="event.stopPropagation(); showOrderDetail(${order.id}, '${order.status}', '${order.created_at}', ${order.total}, \`${(order.note || '').replace(/`/g, '\\`')}\`, ${JSON.stringify(order.items).replace(/`/g, '\\`')})">Aç</button>
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

function getStatusBadgeColor(status) {
    const colors = { open: "bg-info", paid: "bg-success", cancelled: "bg-danger" };
    return colors[status] || "bg-secondary";
}

function showOrderDetail(orderId, status, createdAt, total, note, items) {
    document.getElementById("detailOrderTitle").textContent = `Sipariş #${orderId}`;
    document.getElementById("detailStatus").textContent = getStatusText(status);
    document.getElementById("detailStatus").className = `badge ${getStatusBadgeColor(status)}`;
    document.getElementById("detailDate").textContent = new Date(createdAt).toLocaleString("tr-TR");
    document.getElementById("detailTotal").textContent = `${total.toFixed(2)} TL`;
    document.getElementById("detailNote").textContent = note || "—";

    const itemsHtml = items
        .map(
            (item) => `
        <div class="row mb-2 pb-2 border-bottom">
            <div class="col-8">${item.product_name}</div>
            <div class="col-2 text-center">${item.quantity}x</div>
            <div class="col-2 text-end">${(item.quantity * item.unit_price).toFixed(2)} TL</div>
        </div>
    `
        )
        .join("");

    document.getElementById("detailItems").innerHTML = itemsHtml;

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
    loadOrders();
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
        itemsDiv.innerHTML = '<p class="text-muted">Ürün eklenmedi</p>';
    } else {
        itemsDiv.innerHTML = order.items
            .map(
                (item) => {
                    const itemNote = itemNotes[item.id] || "";
                    return `
            <div class="row mb-2 pb-2 border-bottom">
                <div class="col-7">${item.product_name}</div>
                <div class="col-1">${item.quantity}x</div>
                <div class="col-1 text-center">
                    <button class="btn btn-sm btn-outline-secondary" onclick="editItemNote(${item.id}, '${(itemNote).replace(/'/g, "\\'")}', '${item.product_name}')" title="Ürün notu">✏️</button>
                </div>
                <div class="col-1 text-end">
                    <button class="btn btn-sm btn-danger" onclick="removeItem(${order.id}, ${item.id})">×</button>
                </div>
                <div class="col-12 text-muted small">
                    ${item.quantity} × ${item.unit_price.toFixed(2)} = ${(item.quantity * item.unit_price).toFixed(2)} TL
                </div>
                ${itemNote ? `<div class="col-12 text-primary small"><strong>Not:</strong> ${itemNote}</div>` : ""}
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

    paymentButtons.forEach(btn => {
        btn.disabled = order.items.length === 0;
        if (btn.dataset.method === order.payment_method && order.payment_method !== "pending") {
            btn.style.opacity = "1";
        } else {
            btn.style.opacity = "0.6";
        }
    });

    discountAmountInput.value = order.discount_amount || 0;
    discountPercentInput.value = order.discount_percent || 0;

    // Update totals with discount
    updateOrderTotal(order);

    document.getElementById("printBtn").disabled = order.items.length === 0;
    document.getElementById("cancelBtn").disabled = false;
}

async function addProductToOrder(productId, productName, price) {
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
}

async function removeItem(orderId, itemId) {
    await API.delete(`/api/orders/${orderId}/items/${itemId}`);
    const order = await API.get(`/api/orders/${orderId}`);
    renderOrderDetails(order);
    loadOrders();
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
document.getElementById("newOrderBtn").addEventListener("click", async () => {
    const order = await API.post("/api/orders", { customer_id: null });
    currentOrderId = order.id;
    renderOrderDetails(order);
    loadOrders();
});

document.getElementById("printBtn").addEventListener("click", async () => {
    if (currentOrderId) {
        printOrder(currentOrderId);
    }
});

document.getElementById("cancelBtn").addEventListener("click", async () => {
    if (currentOrderId) {
        if (confirm("Siparişi iptal etmek istediğinizden emin misiniz?")) {
            await API.patch(`/api/orders/${currentOrderId}/status`, { status: "cancelled" });
            currentOrderId = null;
            loadOrders();
            document.getElementById("orderItems").innerHTML = '<p class="text-muted">Lütfen sipariş seçin</p>';
            document.getElementById("orderTitle").textContent = "Sipariş Seçin";
            document.getElementById("orderTotal").textContent = "0.00 TL";
            document.getElementById("orderNote").value = "";
            document.getElementById("orderNote").disabled = true;
        }
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
    loadCategories();
    loadOrders();
    loadCustomers();
    loadAllOrders(1);
    checkPrinterStatus();
    setInterval(checkPrinterStatus, 5000);

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
            if (currentOrderId) {
                const paymentMethod = btn.dataset.method;

                // Update payment method
                await API.patch(`/api/orders/${currentOrderId}/payment`, {
                    payment_method: paymentMethod,
                });

                // Mark order as paid
                await API.patch(`/api/orders/${currentOrderId}/status`, {
                    status: "paid",
                });

                // Auto print
                const order = await API.get(`/api/orders/${currentOrderId}`);
                await printOrder(currentOrderId);

                // Refresh orders list and reset
                loadOrders();
                loadAllOrders(1);
                currentOrderId = null;

                // Show success and return to orders tab
                document.getElementById("orders-tab").click();

                // Clear order details
                document.getElementById("orderItems").innerHTML = '<p class="text-muted">Siparişi tamamlandı!</p>';
                document.getElementById("orderTitle").textContent = "Sipariş Seçin";
                document.getElementById("orderTotal").textContent = "0.00 TL";
            }
        });
    });
}

// Initialize
document.addEventListener("DOMContentLoaded", () => {
    startApp();
});

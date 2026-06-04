let currentOrderId = null;
let categories = [];
let customers = {};
let incomingCallData = null;

const API = {
    async get(url) {
        const res = await fetch(url);
        return res.json();
    },
    async post(url, data) {
        const res = await fetch(url, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(data),
        });
        return res.json();
    },
    async put(url, data) {
        const res = await fetch(url, {
            method: "PUT",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(data),
        });
        return res.json();
    },
    async patch(url, data) {
        const res = await fetch(url, {
            method: "PATCH",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(data),
        });
        return res.json();
    },
    async delete(url) {
        const res = await fetch(url, { method: "DELETE" });
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

function handleIncomingCall(data) {
    incomingCallData = data;
    document.getElementById("callPhone").textContent = data.phone;

    const customerInfo = document.getElementById("customerInfo");
    const newCustomerInfo = document.getElementById("newCustomerInfo");

    if (data.customer) {
        customerInfo.style.display = "block";
        newCustomerInfo.style.display = "none";
        document.getElementById("callCustomerName").textContent = data.customer.name;
        document.getElementById("callCustomerAddress").textContent = data.customer.address || "-";
        document.getElementById("callCustomerNote").textContent = data.customer.note || "-";
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
    const orders = await API.get("/api/orders?status=open");
    renderOrders(orders);
}

function renderOrders(orders) {
    const container = document.getElementById("ordersList");
    if (orders.length === 0) {
        container.innerHTML = '<p class="text-muted">Sipariş yok</p>';
        return;
    }

    container.innerHTML = orders
        .map(
            (order) => `
        <div class="card mb-2 cursor-pointer" onclick="selectOrder(${order.id})"
            style="cursor: pointer; background-color: ${currentOrderId === order.id ? '#e9ecef' : 'white'}">
            <div class="card-body p-2">
                <div class="d-flex justify-content-between">
                    <span><strong>#${order.id}</strong></span>
                    <span class="badge bg-info">${order.items.length} ürün</span>
                </div>
                <small class="text-muted">${order.total.toFixed(2)} TL</small>
            </div>
        </div>
    `
        )
        .join("");
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

    titleDiv.textContent = `Sipariş #${order.id}`;
    totalDiv.textContent = `${order.total.toFixed(2)} TL`;
    noteDiv.value = order.note || "";
    noteDiv.disabled = false;

    if (order.items.length === 0) {
        itemsDiv.innerHTML = '<p class="text-muted">Ürün eklenmedi</p>';
    } else {
        itemsDiv.innerHTML = order.items
            .map(
                (item) => `
            <div class="row mb-2 pb-2 border-bottom">
                <div class="col-8">${item.product_name}</div>
                <div class="col-2">${item.quantity}x</div>
                <div class="col-2 text-end">
                    <button class="btn btn-sm btn-danger" onclick="removeItem(${order.id}, ${item.id})">×</button>
                </div>
                <div class="col-12 text-muted small">
                    ${item.quantity} × ${item.unit_price.toFixed(2)} = ${(item.quantity * item.unit_price).toFixed(2)} TL
                </div>
            </div>
        `
            )
            .join("");
    }

    document.getElementById("payBtn").disabled = order.items.length === 0;
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
}

async function checkPrinterStatus() {
    const status = await API.get("/api/printer/status");
    const badge = document.getElementById("printerStatus");
    if (status.ok) {
        badge.textContent = `Yazıcı: ${status.device || "Bağlı"}`;
        badge.className = "badge bg-success";
    } else {
        badge.textContent = "Yazıcı: Hata";
        badge.className = "badge bg-danger";
    }
}

// Event listeners
document.getElementById("newOrderBtn").addEventListener("click", async () => {
    const order = await API.post("/api/orders", { customer_id: null });
    currentOrderId = order.id;
    renderOrderDetails(order);
    loadOrders();
});

document.getElementById("payBtn").addEventListener("click", async () => {
    if (currentOrderId) {
        await API.patch(`/api/orders/${currentOrderId}/status`, { status: "paid" });
        currentOrderId = null;
        loadOrders();
        document.getElementById("orderItems").innerHTML = '<p class="text-muted">Lütfen sipariş seçin</p>';
        document.getElementById("orderTitle").textContent = "Sipariş Seçin";
        document.getElementById("orderTotal").textContent = "0.00 TL";
        document.getElementById("orderNote").value = "";
        document.getElementById("orderNote").disabled = true;
    }
});

document.getElementById("printBtn").addEventListener("click", async () => {
    if (currentOrderId) {
        const result = await API.post(`/api/orders/${currentOrderId}/print`, {});
        if (result.ok) {
            alert("Yazıldı!");
        } else {
            alert("Yazıcı hatası: " + result.error);
        }
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
            const customerData = await API.post("/api/customers", {
                phone: incomingCallData.phone,
                name: "Yeni Müşteri",
                address: "",
            });
            customerId = customerData.id;
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

// Initialize
document.addEventListener("DOMContentLoaded", () => {
    initWebSocket();
    loadCategories();
    loadOrders();
    checkPrinterStatus();
    setInterval(checkPrinterStatus, 5000);

    // Event listener for order note updates
    document.getElementById("orderNote").addEventListener("input", () => {
        if (currentOrderId) {
            debounceNoteUpdate(currentOrderId);
        }
    });
});

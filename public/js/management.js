// Turkish money format: thousands "." and decimals "," (e.g. 91.295,00).
function fmtTL(n) {
    return Number(n || 0).toLocaleString('tr-TR', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
}

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

const API = {
    async get(url) {
        const res = await fetch(url, { headers: authHeaders(), cache: 'no-store' });
        if (res.status === 401) { logout(); return {}; }
        if (!res.ok) throw new Error(`API error: ${res.status}`);
        return res.json();
    },
    async post(url, data) {
        const res = await fetch(url, {
            method: "POST",
            headers: authHeaders(),
            body: JSON.stringify(data),
        });
        if (res.status === 401) { logout(); return {}; }
        if (!res.ok) throw new Error(`API error: ${res.status}`);
        return res.json();
    },
    async put(url, data) {
        const res = await fetch(url, {
            method: "PUT",
            headers: authHeaders(),
            body: JSON.stringify(data),
        });
        if (res.status === 401) { logout(); return {}; }
        if (!res.ok) throw new Error(`API error: ${res.status}`);
        return res.json();
    },
    async delete(url) {
        const res = await fetch(url, { method: "DELETE", headers: authHeaders() });
        if (res.status === 401) { logout(); return {}; }
        if (!res.ok) throw new Error(`API error: ${res.status}`);
        return res.json();
    },
};

let categories = [];
let products = [];
let filteredProducts = [];
let editingProduct = null;
let selectedCategoryId = null; // null = "Tümü" (all categories)

// ============= CATALOG: CATEGORY MASTER LIST =============

function renderCategoryList() {
    const el = document.getElementById("categoryList");
    if (!el) return;

    const sorted = [...categories].sort((a, b) => (a.sort_order || 0) - (b.sort_order || 0));

    // "Tümü" is pinned on top (not draggable). Real categories live in a
    // separate sortable container so drag-reorder can't move them above "Tümü".
    const allRow = `
        <div class="cat-item ${selectedCategoryId === null ? 'active' : ''}" onclick="selectCategory(null)">
            <span class="cat-drag" style="visibility:hidden">⠿</span>
            <span class="cat-name">Tümü</span>
            <span class="cat-count">${products.length}</span>
        </div>`;

    const catRows = sorted.map(c => {
        const count = products.filter(p => p.category_id === c.id).length;
        return `
        <div class="cat-item ${selectedCategoryId === c.id ? 'active' : ''}" data-cat-id="${c.id}" onclick="selectCategory(${c.id})">
            <span class="cat-drag" title="Sürükleyerek sırala">⠿</span>
            <span class="cat-name">${c.name}</span>
            <span class="cat-count">${count}</span>
            <span class="cat-actions">
                <button class="icon-btn" title="Düzenle"
                    onclick="event.stopPropagation(); editCategory(${c.id}, '${c.name.replace(/'/g, "\\'")}', ${c.sort_order || 1})">✏️</button>
                <button class="icon-btn" title="Sil"
                    onclick="event.stopPropagation(); deleteCategory(${c.id})">🗑</button>
            </span>
        </div>`;
    }).join("");

    el.innerHTML = allRow + `<div id="categorySortable" class="cat-sortable">${catRows}</div>`;

    makeSortable(document.getElementById("categorySortable"), ".cat-item", persistCategoryOrder);
}

async function persistCategoryOrder() {
    const ids = [...document.querySelectorAll("#categorySortable .cat-item")].map(el => Number(el.dataset.catId));
    try {
        await API.post("/api/categories/reorder", { ids });
        await loadCategories();
        await loadProducts();
        selectCategory(selectedCategoryId);
    } catch (e) {
        alert("Kategori sırası kaydedilemedi: " + e.message);
    }
}

// ── Generic drag-and-drop reorder for a list/table container ──
function makeSortable(container, itemSelector, onDrop) {
    if (!container) return;
    let dragEl = null;

    container.querySelectorAll(itemSelector).forEach(el => {
        el.setAttribute("draggable", "true");
        el.addEventListener("dragstart", (e) => {
            dragEl = el;
            e.dataTransfer.effectAllowed = "move";
            setTimeout(() => el.classList.add("dragging"), 0);
        });
        el.addEventListener("dragend", () => {
            el.classList.remove("dragging");
            if (dragEl) { dragEl = null; onDrop(); }
        });
    });

    // Bind the container's dragover only once (it may persist across renders).
    if (container.dataset.sortableBound !== "1") {
        container.dataset.sortableBound = "1";
        container.addEventListener("dragover", (e) => {
            e.preventDefault();
            const moving = container.querySelector("." + "dragging");
            if (!moving) return;
            const after = dragAfterElement(container, itemSelector, e.clientY);
            if (after == null) container.appendChild(moving);
            else container.insertBefore(moving, after);
        });
    }
}

function dragAfterElement(container, selector, y) {
    const els = [...container.querySelectorAll(selector + ":not(.dragging)")];
    let closest = { offset: -Infinity, el: null };
    for (const child of els) {
        const box = child.getBoundingClientRect();
        const offset = y - box.top - box.height / 2;
        if (offset < 0 && offset > closest.offset) closest = { offset, el: child };
    }
    return closest.el;
}

function selectCategory(id) {
    selectedCategoryId = id;
    renderCategoryList();
    filterProducts();
    renderProductsTable();

    const cat = categories.find(c => c.id === id);
    const title = document.getElementById("productsTitle");
    title.textContent = "Ürünler: " + (cat ? cat.name : "Tümü");
    if (!cat) {
        const hint = document.createElement("span");
        hint.style.cssText = "font-weight:400;font-size:.78rem;color:var(--muted);margin-left:8px;";
        hint.textContent = "(sıralamak için bir kategori seçin)";
        title.appendChild(hint);
    }
    // Pre-fill the add-product category with the selected one for convenience.
    if (id) document.getElementById("newProductCategory").value = String(id);
}

// ============= PRODUCT MANAGEMENT =============

async function loadCategories() {
    try {
        categories = await API.get("/api/categories");
        updateCategorySelects();
        renderCategoryList();
    } catch (e) {
        console.error("Error loading categories:", e);
    }
}

async function loadProducts() {
    try {
        const data = await API.get("/api/categories");
        products = [];
        for (const cat of data) {
            products.push(...cat.products.map(p => ({ ...p, category_name: cat.name })));
        }
        filterProducts();
        renderProductsTable();
        renderCategoryList(); // refresh per-category counts
    } catch (e) {
        console.error("Error loading products:", e);
    }
}

function filterProducts() {
    const searchTerm = document.getElementById("productSearch").value.toLowerCase();
    filteredProducts = products.filter(p => {
        const matchCat = selectedCategoryId == null || p.category_id === selectedCategoryId;
        const matchSearch = p.name.toLowerCase().includes(searchTerm) ||
            (p.category_name && p.category_name.toLowerCase().includes(searchTerm));
        return matchCat && matchSearch;
    });
}

function renderProductsTable() {
    const body = document.getElementById("productsTableBody");

    if (filteredProducts.length === 0) {
        body.innerHTML = '<div class="mgmt-empty">Ürün bulunamadı</div>';
        return;
    }

    // Drag-reorder only makes sense within a single category.
    const sortable = selectedCategoryId != null;

    body.innerHTML = filteredProducts.map(product => {
        const activeStatus = product.active
            ? '<span class="badge badge-green">Aktif</span>'
            : '<span class="badge badge-red">Pasif</span>';

        return `
            <div class="prod-row ${sortable ? 'row-sortable' : ''}" data-product-id="${product.id}">
                <span style="color:#64748b">${sortable ? '<span class="row-drag" title="Sürükleyerek sırala">⠿</span> ' : ''}${product.id}</span>
                <span><strong>${product.name}</strong></span>
                <span><span class="badge badge-blue">${product.category_name}</span></span>
                <span><strong>${fmtTL(product.price)} ₺</strong></span>
                <span style="color:#64748b;font-size:.78rem">${product.note || '—'}</span>
                <span>${activeStatus}</span>
                <span class="prod-c-actions">
                    <button class="btn btn-ghost btn-sm" onclick="openEditProductModal(${product.id})" title="Düzenle">✏️</button>
                    <button class="btn btn-danger btn-sm" onclick="deleteProduct(${product.id})" title="Sil">🗑</button>
                </span>
            </div>
        `;
    }).join("");

    if (sortable) makeSortable(body, ".prod-row", persistProductOrder);
}

async function persistProductOrder() {
    const ids = [...document.querySelectorAll("#productsTableBody .prod-row[data-product-id]")].map(el => Number(el.dataset.productId));
    try {
        await API.post("/api/products/reorder", { ids });
        await loadProducts();
        selectCategory(selectedCategoryId);
    } catch (e) {
        alert("Ürün sırası kaydedilemedi: " + e.message);
    }
}

function updateCategorySelects() {
    const selects = [
        document.getElementById("newProductCategory"),
        document.getElementById("editProductCategory")
    ];

    selects.forEach(select => {
        select.innerHTML = '<option value="">Kategori seçin</option>' +
            categories.map(c => `<option value="${c.id}">${c.name}</option>`).join("");
    });
}

async function deleteProduct(productId) {
    if (!confirm("Ürünü silmek istediğinizden emin misiniz?")) return;

    try {
        await API.delete(`/api/products/${productId}`);
        await loadProducts();
    } catch (e) {
        alert("Hata: " + e.message);
    }
}

function openEditProductModal(productId) {
    editingProduct = products.find(p => p.id === productId);
    if (!editingProduct) return;

    document.getElementById("editProductId").value = editingProduct.id;
    document.getElementById("editProductName").value = editingProduct.name;
    document.getElementById("editProductPrice").value = editingProduct.price;
    document.getElementById("editProductCategory").value = editingProduct.category_id;
    document.getElementById("editProductNote").value = editingProduct.note || "";
    document.getElementById("editProductActive").checked = editingProduct.active;

    new bootstrap.Modal(document.getElementById("editProductModal")).show();
}

async function saveEditProduct() {
    const productId = parseInt(document.getElementById("editProductId").value);
    const name = document.getElementById("editProductName").value;
    const price = parseFloat(document.getElementById("editProductPrice").value);
    const note = document.getElementById("editProductNote").value;
    const active = document.getElementById("editProductActive").checked;

    try {
        await API.put(`/api/products/${productId}`, {
            name,
            price,
            note: note || null,
            active
        });
        bootstrap.Modal.getInstance(document.getElementById("editProductModal")).hide();
        await loadProducts();
    } catch (e) {
        alert("Hata: " + e.message);
    }
}

// ============= FORM HANDLERS =============

document.getElementById("productForm").addEventListener("submit", async (e) => {
    e.preventDefault();

    const name = document.getElementById("newProductName").value;
    const price = parseFloat(document.getElementById("newProductPrice").value);
    const category_id = parseInt(document.getElementById("newProductCategory").value);
    const note = document.getElementById("newProductNote").value;

    try {
        await API.post("/api/products", { category_id, name, price, note: note || "" });

        document.getElementById("productForm").reset();
        await loadProducts();
    } catch (e) {
        alert("Hata: " + e.message);
    }
});

document.getElementById("productSearch").addEventListener("input", () => {
    filterProducts();
    renderProductsTable();
});

document.getElementById("saveEditProductBtn").addEventListener("click", saveEditProduct);

// ============= REPORTING =============

async function loadSalesReport() {
    try {
        const startDate = document.getElementById("salesStartDate").value;
        const endDate = document.getElementById("salesEndDate").value;

        const data = await API.get(
            `/api/reports/sales-by-date?start_date=${startDate}&end_date=${endDate}`
        );

        renderSalesReport(data);
    } catch (e) {
        console.error("Error loading sales report:", e);
        alert("Rapor yüklenirken hata oluştu");
    }
}

function renderSalesReport(data) {
    const totalAmount = data.total_sales;
    const totalOrders = data.total_orders;
    const avgOrder = totalOrders > 0 ? totalAmount / totalOrders : 0;
    const daysCount = data.daily_breakdown.length;

    document.getElementById("totalSalesAmount").textContent = fmtTL(totalAmount) + " TL";
    document.getElementById("totalOrdersCount").textContent = totalOrders;
    document.getElementById("avgOrderValue").textContent = fmtTL(avgOrder) + " TL";
    document.getElementById("daysCount").textContent = daysCount;

    const tbody = document.getElementById("salesBreakdownBody");
    if (data.daily_breakdown.length === 0) {
        tbody.innerHTML = '<tr><td colspan="4" class="text-center text-muted">Veri bulunamadı</td></tr>';
        return;
    }

    tbody.innerHTML = data.daily_breakdown.map(day => {
        const avgDayOrder = day.order_count > 0 ? day.total_amount / day.order_count : 0;
        return `
            <tr style="cursor:pointer;" title="Gün detayını ve siparişleri gör"
                onclick="window.open('/api/reports/day-close?date=${day.date}','_blank')">
                <td>${formatDate(day.date)} 🔍</td>
                <td>${day.order_count}</td>
                <td>${fmtTL(day.total_amount)} TL</td>
                <td>${fmtTL(avgDayOrder)} TL</td>
            </tr>
        `;
    }).join("");
}

async function loadProductSalesAnalysis() {
    try {
        const data = await API.get("/api/reports/product-sales");
        renderProductSalesAnalysis(data);
    } catch (e) {
        console.error("Error loading product sales:", e);
        alert("Ürün analizi yüklenirken hata oluştu");
    }
}

function renderProductSalesAnalysis(data) {
    const topProduct = data.top_products[0];
    const bottomProduct = data.top_products[data.top_products.length - 1];
    const totalQty = data.total_quantity_sold;

    document.getElementById("topProduct").textContent = topProduct ? topProduct.product_name : "-";
    document.getElementById("topProductQty").textContent = topProduct ? topProduct.quantity_sold + " adet" : "0 adet";
    document.getElementById("bottomProduct").textContent = bottomProduct ? bottomProduct.product_name : "-";
    document.getElementById("bottomProductQty").textContent = bottomProduct ? bottomProduct.quantity_sold + " adet" : "0 adet";
    document.getElementById("totalProductsSold").textContent = totalQty;

    const tbody = document.getElementById("productSalesBody");
    if (data.top_products.length === 0) {
        tbody.innerHTML = '<tr><td colspan="5" class="text-center text-muted">Veri bulunamadı</td></tr>';
        return;
    }

    tbody.innerHTML = data.top_products.map((product, index) => {
        const percentage = totalQty > 0 ? ((product.quantity_sold / totalQty) * 100).toFixed(1) : 0;
        return `
            <tr>
                <td>${index + 1}</td>
                <td><strong>${product.product_name}</strong></td>
                <td>${product.quantity_sold}</td>
                <td>${fmtTL(product.revenue)} TL</td>
                <td>
                    <div class="progress" style="height: 20px;">
                        <div class="progress-bar" style="width: ${percentage}%">
                            ${percentage}%
                        </div>
                    </div>
                </td>
            </tr>
        `;
    }).join("");
}

async function loadCustomerSpendingAnalysis() {
    try {
        const data = await API.get("/api/reports/customer-spending");
        renderCustomerSpendingAnalysis(data);
    } catch (e) {
        console.error("Error loading customer spending:", e);
        alert("Müşteri analizi yüklenirken hata oluştu");
    }
}

function renderCustomerSpendingAnalysis(data) {
    const totalCustomers = data.total_customers;
    const totalSpending = data.total_spending;
    const topCustomer = data.top_customers[0];

    document.getElementById("totalCustomersCount").textContent = totalCustomers;
    document.getElementById("topSpender").textContent = topCustomer ? topCustomer.name : "-";
    document.getElementById("topSpenderAmount").textContent = topCustomer ? fmtTL(topCustomer.total_spent) + " TL" : "0.00 TL";
    document.getElementById("totalSpending").textContent = fmtTL(totalSpending) + " TL";

    const tbody = document.getElementById("customerSpendingBody");
    if (data.top_customers.length === 0) {
        tbody.innerHTML = '<tr><td colspan="6" class="text-center text-muted">Veri bulunamadı</td></tr>';
        return;
    }

    tbody.innerHTML = data.top_customers.map((customer, index) => {
        const avgOrder = customer.order_count > 0 ? customer.total_spent / customer.order_count : 0;
        return `
            <tr>
                <td>${index + 1}</td>
                <td><strong>${customer.name}</strong></td>
                <td>${customer.phone}</td>
                <td>${fmtTL(customer.total_spent)} TL</td>
                <td>${customer.order_count}</td>
                <td>${fmtTL(avgOrder)} TL</td>
            </tr>
        `;
    }).join("");
}

// ============= UTILITY FUNCTIONS =============

function formatDate(dateString) {
    const date = new Date(dateString);
    return date.toLocaleDateString("tr-TR", { year: "numeric", month: "2-digit", day: "2-digit" });
}

function setDateDefaults() {
    const today = new Date();
    const thirtyDaysAgo = new Date(today.getTime() - 30 * 24 * 60 * 60 * 1000);

    const startInput = document.getElementById("salesStartDate");
    const endInput = document.getElementById("salesEndDate");

    startInput.value = thirtyDaysAgo.toISOString().split("T")[0];
    endInput.value = today.toISOString().split("T")[0];
}

// ============= EVENT LISTENERS =============

document.getElementById("applySalesFilter").addEventListener("click", loadSalesReport);

document.getElementById("resetSalesFilter").addEventListener("click", () => {
    setDateDefaults();
    loadSalesReport();
});

// ============= CATEGORY MANAGEMENT =============

// Kept as a thin alias: refreshing categories also re-renders the master list.
async function loadCategoriesList() {
    await loadCategories();
}

async function editCategory(id, name, sortOrder) {
    const newName = prompt("Kategori adını düzenleyin:", name);
    if (newName === null) return;

    const newSortOrder = prompt("Sıra numarasını girin:", sortOrder);
    if (newSortOrder === null) return;

    try {
        await API.put(`/api/categories/${id}`, {
            name: newName,
            sort_order: parseInt(newSortOrder) || 1
        });
        await loadCategories();
        await loadProducts();
        selectCategory(selectedCategoryId); // refresh title/highlight
    } catch (e) {
        alert("Kategori düzenlenemedi: " + e.message);
    }
}

async function deleteCategory(id) {
    if (!confirm("Bu kategoriyi silmek istediğinizden emin misiniz?")) return;

    try {
        await API.delete(`/api/categories/${id}`);
        await loadCategories();
        await loadProducts();
        // If the deleted category was selected, fall back to "Tümü".
        selectCategory(categories.some(c => c.id === selectedCategoryId) ? selectedCategoryId : null);
    } catch (e) {
        alert("Kategori silinemedi: " + e.message);
    }
}

document.getElementById("categoryForm")?.addEventListener("submit", async (e) => {
    e.preventDefault();
    const name = document.getElementById("newCategoryName").value.trim();
    const sortOrder = parseInt(document.getElementById("newCategorySortOrder").value) || 1;

    if (!name) {
        alert("Kategori adı boş olamaz");
        return;
    }

    try {
        await API.post("/api/categories", { name, sort_order: sortOrder });
        document.getElementById("categoryForm").reset();
        document.getElementById("newCategorySortOrder").value = "1";
        await loadCategories();
        await loadProducts();
        selectCategory(selectedCategoryId);
    } catch (e) {
        alert("Kategori eklenemedi: " + e.message);
    }
});

// ============= INITIALIZATION =============

document.addEventListener("DOMContentLoaded", async () => {
    // Catalog: categories + products
    await loadCategories();
    await loadProducts();
    selectCategory(null); // default to "Tümü"

    // Load reports with default dates
    setDateDefaults();
    await loadSalesReport();
    await loadProductSalesAnalysis();
    await loadCustomerSpendingAnalysis();

    // Report sub-tab clicks → reload data
    document.getElementById("sales-report-tab")?.addEventListener("click", loadSalesReport);
    document.getElementById("product-analysis-tab")?.addEventListener("click", loadProductSalesAnalysis);
    document.getElementById("customer-analysis-tab")?.addEventListener("click", loadCustomerSpendingAnalysis);
});

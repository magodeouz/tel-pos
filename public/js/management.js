const API = {
    async get(url) {
        const res = await fetch(url);
        if (!res.ok) throw new Error(`API error: ${res.status}`);
        return res.json();
    },
    async post(url, data) {
        const res = await fetch(url, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(data),
        });
        if (!res.ok) throw new Error(`API error: ${res.status}`);
        return res.json();
    },
    async put(url, data) {
        const res = await fetch(url, {
            method: "PUT",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(data),
        });
        if (!res.ok) throw new Error(`API error: ${res.status}`);
        return res.json();
    },
    async delete(url) {
        const res = await fetch(url, { method: "DELETE" });
        if (!res.ok) throw new Error(`API error: ${res.status}`);
        return res.json();
    },
};

let categories = [];
let products = [];
let filteredProducts = [];
let editingProduct = null;

// ============= PRODUCT MANAGEMENT =============

async function loadCategories() {
    try {
        categories = await API.get("/api/categories");
        updateCategorySelects();
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
    } catch (e) {
        console.error("Error loading products:", e);
    }
}

function filterProducts() {
    const searchTerm = document.getElementById("productSearch").value.toLowerCase();
    filteredProducts = products.filter(p => {
        return p.name.toLowerCase().includes(searchTerm) ||
               (p.category_name && p.category_name.toLowerCase().includes(searchTerm));
    });
}

function renderProductsTable() {
    const tbody = document.getElementById("productsTableBody");

    if (filteredProducts.length === 0) {
        tbody.innerHTML = '<tr><td colspan="7" class="text-center text-muted">Ürün bulunamadı</td></tr>';
        return;
    }

    tbody.innerHTML = filteredProducts.map(product => {
        const activeStatus = product.active
            ? '<span class="badge bg-success">Aktif</span>'
            : '<span class="badge bg-danger">Pasif</span>';

        return `
            <tr>
                <td>${product.id}</td>
                <td><strong>${product.name}</strong></td>
                <td>${product.category_name}</td>
                <td>${product.price.toFixed(2)} TL</td>
                <td>${product.note ? `<small>${product.note}</small>` : '<span class="text-muted">-</span>'}</td>
                <td>${activeStatus}</td>
                <td>
                    <button class="btn btn-sm btn-warning" onclick="openEditProductModal(${product.id})">
                        <i class="bi bi-pencil"></i>
                    </button>
                    <button class="btn btn-sm btn-danger" onclick="deleteProduct(${product.id})">
                        <i class="bi bi-trash"></i>
                    </button>
                </td>
            </tr>
        `;
    }).join("");
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

    document.getElementById("totalSalesAmount").textContent = totalAmount.toFixed(2) + " TL";
    document.getElementById("totalOrdersCount").textContent = totalOrders;
    document.getElementById("avgOrderValue").textContent = avgOrder.toFixed(2) + " TL";
    document.getElementById("daysCount").textContent = daysCount;

    const tbody = document.getElementById("salesBreakdownBody");
    if (data.daily_breakdown.length === 0) {
        tbody.innerHTML = '<tr><td colspan="4" class="text-center text-muted">Veri bulunamadı</td></tr>';
        return;
    }

    tbody.innerHTML = data.daily_breakdown.map(day => {
        const avgDayOrder = day.order_count > 0 ? day.total_amount / day.order_count : 0;
        return `
            <tr>
                <td>${formatDate(day.date)}</td>
                <td>${day.order_count}</td>
                <td>${day.total_amount.toFixed(2)} TL</td>
                <td>${avgDayOrder.toFixed(2)} TL</td>
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
                <td>${product.revenue.toFixed(2)} TL</td>
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
    document.getElementById("topSpenderAmount").textContent = topCustomer ? topCustomer.total_spent.toFixed(2) + " TL" : "0.00 TL";
    document.getElementById("totalSpending").textContent = totalSpending.toFixed(2) + " TL";

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
                <td>${customer.total_spent.toFixed(2)} TL</td>
                <td>${customer.order_count}</td>
                <td>${avgOrder.toFixed(2)} TL</td>
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

async function loadCategoriesList() {
    try {
        const data = await API.get("/api/categories");
        renderCategoriesTable(data);
    } catch (e) {
        console.error("Error loading categories:", e);
        alert("Kategoriler yüklenemedi");
    }
}

function renderCategoriesTable(categories) {
    const tbody = document.getElementById("categoriesTableBody");
    if (categories.length === 0) {
        tbody.innerHTML = '<tr><td colspan="4" class="text-center text-muted">Kategori yok</td></tr>';
        return;
    }

    tbody.innerHTML = categories
        .sort((a, b) => (a.sort_order || 0) - (b.sort_order || 0))
        .map(cat => `
            <tr>
                <td>${cat.id}</td>
                <td>${cat.name}</td>
                <td>${cat.sort_order || 1}</td>
                <td>
                    <button class="btn btn-sm btn-warning" onclick="editCategory(${cat.id}, '${cat.name}', ${cat.sort_order || 1})">
                        <i class="bi bi-pencil"></i> Düzenle
                    </button>
                    <button class="btn btn-sm btn-danger" onclick="deleteCategory(${cat.id})">
                        <i class="bi bi-trash"></i> Sil
                    </button>
                </td>
            </tr>
        `)
        .join("");
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
        await loadCategoriesList();
        await loadCategories();
        await loadProducts();
    } catch (e) {
        alert("Kategori düzenlenemedi: " + e.message);
    }
}

async function deleteCategory(id) {
    if (!confirm("Bu kategoriyi silmek istediğinizden emin misiniz?")) return;

    try {
        await API.delete(`/api/categories/${id}`);
        await loadCategoriesList();
        await loadCategories();
        await loadProducts();
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
        await loadCategoriesList();
        await loadCategories();
        await loadProducts();
        alert("Kategori eklendi");
    } catch (e) {
        alert("Kategori eklenemedi: " + e.message);
    }
});

// ============= INITIALIZATION =============

document.addEventListener("DOMContentLoaded", async () => {
    // Load product management
    await loadCategories();
    await loadProducts();

    // Load category management
    await loadCategoriesList();

    // Load reports with default dates
    setDateDefaults();
    await loadSalesReport();
    await loadProductSalesAnalysis();
    await loadCustomerSpendingAnalysis();

    // Load reports when switching tabs
    document.getElementById("sales-report-tab").addEventListener("shown.bs.tab", loadSalesReport);
    document.getElementById("product-analysis-tab").addEventListener("shown.bs.tab", loadProductSalesAnalysis);
    document.getElementById("customer-analysis-tab").addEventListener("shown.bs.tab", loadCustomerSpendingAnalysis);

    // Load categories when switching to categories tab
    document.getElementById("categories-tab").addEventListener("shown.bs.tab", loadCategoriesList);
});

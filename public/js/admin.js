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
    async delete(url) {
        const res = await fetch(url, { method: "DELETE" });
        return res.json();
    },
};

let categories = [];

async function loadCategories() {
    categories = await API.get("/api/categories");
    renderCategories();
    updateCategorySelect();
}

function renderCategories() {
    const container = document.getElementById("categoriesList");
    container.innerHTML = categories
        .map(
            (cat) => `
        <div class="d-flex justify-content-between align-items-center mb-2 p-2 border rounded">
            <span>${cat.name}</span>
            <button class="btn btn-sm btn-danger" onclick="deleteCategory(${cat.id})">Sil</button>
        </div>
    `
        )
        .join("");
}

let editingProductId = null;

function updateCategorySelect() {
    const select = document.getElementById("productCategory");
    select.innerHTML = '<option value="">Kategori seçin</option>' + categories.map((c) => `<option value="${c.id}">${c.name}</option>`).join("");
}

async function loadProducts() {
    const cats = await API.get("/api/categories");
    const container = document.getElementById("productsList");

    let html = "";
    for (const cat of cats) {
        if (cat.products.length === 0) continue;
        html += `<h6 class="mt-3">${cat.name}</h6>`;
        html += cat.products
            .map(
                (prod) => `
            <div class="mb-2 p-2 border rounded bg-white">
                <div class="d-flex justify-content-between align-items-start">
                    <div>
                        <strong>${prod.name}</strong><br>
                        <small>${prod.price.toFixed(2)} TL</small>
                        ${prod.note ? `<br><small class="text-secondary">Not: ${prod.note}</small>` : ""}
                    </div>
                    <div>
                        <button class="btn btn-sm btn-warning" onclick="editProduct(${prod.id})">Düzenle</button>
                        <button class="btn btn-sm btn-danger" onclick="deleteProduct(${prod.id})">Sil</button>
                    </div>
                </div>
            </div>
        `
            )
            .join("");
    }

    container.innerHTML = html || '<p class="text-muted">Ürün yok</p>';
}

async function deleteCategory(categoryId) {
    if (confirm("Kategoriyi silmek istediğinizden emin misiniz?")) {
        await API.delete(`/api/categories/${categoryId}`);
        loadCategories();
        loadProducts();
    }
}

async function deleteProduct(productId) {
    if (confirm("Ürünü silmek istediğinizden emin misiniz?")) {
        await API.delete(`/api/products/${productId}`);
        loadProducts();
    }
}

async function editProduct(productId) {
    const cats = await API.get("/api/categories");
    let product = null;
    for (const cat of cats) {
        const found = cat.products.find(p => p.id === productId);
        if (found) {
            product = found;
            break;
        }
    }

    if (!product) return;

    const name = prompt("Ürün adı:", product.name);
    if (name === null) return;

    const price = prompt("Fiyat:", product.price);
    if (price === null) return;

    const note = prompt("Not:", product.note || "");
    if (note === null) return;

    await API.put(`/api/products/${productId}`, {
        name,
        price: parseFloat(price),
        note: note || null
    });
    loadProducts();
}

document.getElementById("categoryForm").addEventListener("submit", async (e) => {
    e.preventDefault();
    const name = document.getElementById("categoryName").value;
    await API.post("/api/categories", { name });
    document.getElementById("categoryName").value = "";
    loadCategories();
});

document.getElementById("productForm").addEventListener("submit", async (e) => {
    e.preventDefault();
    const category_id = parseInt(document.getElementById("productCategory").value);
    const name = document.getElementById("productName").value;
    const price = parseFloat(document.getElementById("productPrice").value);
    const note = document.getElementById("productNote").value;

    await API.post("/api/products", { category_id, name, price, note: note || "" });

    document.getElementById("productName").value = "";
    document.getElementById("productPrice").value = "";
    document.getElementById("productNote").value = "";
    document.getElementById("productCategory").value = "";

    loadProducts();
});

document.addEventListener("DOMContentLoaded", () => {
    loadCategories();
    loadProducts();
});

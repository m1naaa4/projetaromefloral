let orders = [];
let currentEditId = null;
let currentPage = 1;
const pageSize = 5;
const STORAGE_KEY = "orders-local-2026";   // clé unique pour cette fonctionnalité

const tbody = document.querySelector("#orders-table tbody");
const form = document.getElementById("edit-form");
const clientInput = document.getElementById("client");
const productInput = document.getElementById("product");
const quantityInput = document.getElementById("quantity");
const prevBtn = document.getElementById("prev-btn");
const nextBtn = document.getElementById("next-btn");
const pageInfo = document.getElementById("page-info");

async function loadOrders() {
    const saved = localStorage.getItem(STORAGE_KEY);

    if (saved) {
        // Si des données existent en local → on les charge (tes changements persistent)
        orders = JSON.parse(saved);
        displayOrders();
        return;
    }

    // Seulement la première fois (ou si localStorage vidé)
    try {
        const res = await fetch("https://dummyjson.com/carts");
        const data = await res.json();

        orders = data.carts.map(c => ({
            id: c.id,
            client: `Client ${c.userId}`,
            product: c.products[0]?.title || "Produit inconnu",
            quantity: c.totalQuantity
        }));

        saveOrders();          // on sauvegarde immédiatement après chargement API
        displayOrders();
    } catch (err) {
        console.error("Erreur chargement API:", err);
        orders = [];
        displayOrders();
    }
}

function saveOrders() {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(orders));
}

function displayOrders() {
    tbody.innerHTML = "";
    const start = (currentPage - 1) * pageSize;
    const paginated = orders.slice(start, start + pageSize);

    paginated.forEach(o => {
        const tr = document.createElement("tr");
        tr.innerHTML = `
            <td>${o.id}</td>
            <td>${o.client}</td>
            <td>${o.product}</td>
            <td>${o.quantity}</td>
            <td class="actions">
                <button class="btn btn-details" onclick="goToDetails(${o.id})">Détails</button>
                <button class="btn btn-edit" onclick="openEdit(${o.id})">Modifier</button>
                <button class="btn btn-delete" onclick="deleteOrder(${o.id})">Supprimer</button>
            </td>
        `;
        tbody.appendChild(tr);
    });

    pageInfo.textContent = `Page ${currentPage}`;
    prevBtn.disabled = currentPage === 1;
    nextBtn.disabled = currentPage * pageSize >= orders.length;
}

prevBtn.addEventListener("click", () => {
    if (currentPage > 1) {
        currentPage--;
        displayOrders();
    }
});

nextBtn.addEventListener("click", () => {
    if (currentPage * pageSize < orders.length) {
        currentPage++;
        displayOrders();
    }
});

function showForm() {
    form.style.display = "block";
    document.getElementById("form-title").textContent = "Ajouter une commande";
    clientInput.value = "";
    productInput.value = "";
    quantityInput.value = "";
    currentEditId = null;
}

function openEdit(id) {
    const o = orders.find(o => o.id === id);
    if (!o) return;

    form.style.display = "block";
    document.getElementById("form-title").textContent = "Modifier la commande";
    clientInput.value = o.client;
    productInput.value = o.product;
    quantityInput.value = o.quantity;
    currentEditId = id;
}

function saveEdit() {
    const client = clientInput.value.trim();
    const product = productInput.value.trim();
    const quantity = Number(quantityInput.value);

    if (!client || !product || isNaN(quantity) || quantity <= 0) {
        alert("Remplir tous les champs correctement (quantité > 0)");
        return;
    }

    if (currentEditId !== null) {
        // Modification
        const o = orders.find(o => o.id === currentEditId);
        if (o) {
            o.client = client;
            o.product = product;
            o.quantity = quantity;
        }
    } else {
        // Ajout
        const newId = orders.length > 0 
            ? Math.max(...orders.map(o => o.id)) + 1 
            : 1;
        orders.push({ id: newId, client, product, quantity });
    }

    saveOrders();              // ← SAUVEGARDE → persistance après refresh
    form.style.display = "none";
    currentEditId = null;
    displayOrders();
}

function deleteOrder(id) {
    if (!confirm("Supprimer cette commande ?")) return;

    orders = orders.filter(o => o.id !== id);
    saveOrders();              // ← SAUVEGARDE après suppression
    displayOrders();
}

function goToDetails(id) {
    window.location.href = `orderdetail.html?id=${id}`;
}

window.addEventListener("DOMContentLoaded", loadOrders);
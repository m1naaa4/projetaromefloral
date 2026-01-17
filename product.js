// product.js - Gestion produits sans images

const API_URL = "https://fakestoreapi.com/products";
const STORAGE_KEY = "aromefloral_products_2026";

let products = [];
let currentPage = 1;
const itemsPerPage = 5;
let editId = null;

// ────────────────────────────────────────────────
// CHARGEMENT
// ────────────────────────────────────────────────
function loadData() {
    const saved = localStorage.getItem(STORAGE_KEY);

    if (saved) {
        products = JSON.parse(saved);
        renderTable();
    } else {
        fetch(API_URL)
            .then(res => res.json())
            .then(data => {
                // Conversion prix vers MAD (×10 pour réalisme)
                products = data.map(p => ({
                    id: p.id,
                    title: p.title,
                    price: Math.round(p.price * 10),
                    category: p.category
                }));
                saveProducts();
                renderTable();
            })
            .catch(err => {
                console.error("Erreur chargement API", err);
                products = [];
                renderTable();
            });
    }
}

function saveProducts() {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(products));
}

// ────────────────────────────────────────────────
// AFFICHAGE TABLEAU
// ────────────────────────────────────────────────
function renderTable() {
    const tbody = document.querySelector("#products-table tbody");
    tbody.innerHTML = "";

    const start = (currentPage - 1) * itemsPerPage;
    const end = start + itemsPerPage;
    const pageItems = products.slice(start, end);

    pageItems.forEach(product => {
        const row = document.createElement("tr");
        row.innerHTML = `
            <td>${product.id}</td>
            <td>${product.title}</td>
            <td>${product.category}</td>
            <td>${product.price.toFixed(2)} MAD</td>
            <td class="actions">
                <button class="btn btn-details" onclick="goToDetails('${product.id}')">Détails</button>
                <button class="btn btn-edit" onclick="editItem('${product.id}')">Modifier</button>
                <button class="btn btn-delete" onclick="deleteItem('${product.id}')">Supprimer</button>
            </td>
        `;
        tbody.appendChild(row);
    });

    document.getElementById("page-info").textContent = `Page ${currentPage}`;
    document.getElementById("prev-btn").disabled = currentPage === 1;
    document.getElementById("next-btn").disabled = end >= products.length;
}

// ────────────────────────────────────────────────
// PAGINATION
// ────────────────────────────────────────────────
document.getElementById("prev-btn").addEventListener("click", () => {
    if (currentPage > 1) {
        currentPage--;
        renderTable();
    }
});

document.getElementById("next-btn").addEventListener("click", () => {
    if (currentPage * itemsPerPage < products.length) {
        currentPage++;
        renderTable();
    }
});

// ────────────────────────────────────────────────
// FORMULAIRE
// ────────────────────────────────────────────────
function showForm() {
    document.getElementById("edit-form").style.display = "block";
    document.getElementById("form-title").textContent = "Ajouter un produit";
    editId = null;
    clearForm();
}

function editItem(id) {
    const product = products.find(p => p.id == id);
    if (!product) return;

    document.getElementById("name").value = product.title;
    document.getElementById("price").value = product.price;
    document.getElementById("category").value = product.category;

    document.getElementById("edit-form").style.display = "block";
    document.getElementById("form-title").textContent = "Modifier le produit";
    editId = id;
}

function saveEdit() {
    const name = document.getElementById("name").value.trim();
    const price = Number(document.getElementById("price").value);
    const category = document.getElementById("category").value.trim();

    if (!name || isNaN(price) || price <= 0 || !category) {
        alert("Veuillez remplir tous les champs correctement.");
        return;
    }

    if (editId !== null) {
        // Modification
        const index = products.findIndex(p => p.id == editId);
        if (index !== -1) {
            products[index].title = name;
            products[index].price = price;
            products[index].category = category;
        }
    } else {
        // Ajout
        const newId = "local-" + Date.now();
        products.unshift({
            id: newId,
            title: name,
            price: price,
            category: category
        });
    }

    saveProducts();
    clearForm();
    document.getElementById("edit-form").style.display = "none";
    renderTable();
}

function clearForm() {
    document.getElementById("name").value = "";
    document.getElementById("price").value = "";
    document.getElementById("category").value = "";
}

// ────────────────────────────────────────────────
// SUPPRESSION
// ────────────────────────────────────────────────
function deleteItem(id) {
    if (!confirm("Voulez-vous vraiment supprimer ce produit ?")) return;

    products = products.filter(p => p.id != id);
    saveProducts();
    renderTable();
}

// ────────────────────────────────────────────────
// REDIRECTION DÉTAILS
// ────────────────────────────────────────────────
function goToDetails(id) {
    window.location.href = `productdetail.html?id=${id}`;
}

// ────────────────────────────────────────────────
// INIT
// ────────────────────────────────────────────────
window.addEventListener("DOMContentLoaded", loadData);
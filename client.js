let clients = [];
let currentEditId = null;
let currentPage = 1;
const pageSize = 5;
const STORAGE_KEY = "clients-local-2026";   // clé unique pour ton projet

const tbody = document.querySelector("#clients-table tbody");
const form = document.getElementById("edit-form");
const nameInput = document.getElementById("name");
const emailInput = document.getElementById("email");
const phoneInput = document.getElementById("phone");
const prevBtn = document.getElementById("prev-btn");
const nextBtn = document.getElementById("next-btn");
const pageInfo = document.getElementById("page-info");

async function loadClients() {
    const saved = localStorage.getItem(STORAGE_KEY);

    if (saved) {
        // Si on a déjà une sauvegarde → on prend celle-là
        clients = JSON.parse(saved);
        displayClients();
        return;
    }

    // Seulement la première fois (ou si localStorage vidé)
    try {
        const res = await fetch("https://dummyjson.com/users");
        const data = await res.json();

        clients = data.users.map(u => ({
            id: u.id,
            name: u.firstName + " " + u.lastName,
            email: u.email,
            phone: u.phone
        }));

        saveClients();           // on sauvegarde tout de suite
        displayClients();
    } catch (err) {
        console.error("Erreur chargement API", err);
        clients = [];
        displayClients();
    }
}

function saveClients() {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(clients));
}

function displayClients() {
    tbody.innerHTML = "";
    const start = (currentPage - 1) * pageSize;
    const paginated = clients.slice(start, start + pageSize);

    paginated.forEach(c => {
        const tr = document.createElement("tr");
        tr.innerHTML = `
            <td>${c.id}</td>
            <td>${c.name}</td>
            <td>${c.email}</td>
            <td>${c.phone}</td>
            <td class="actions">
                <button class="btn btn-details" onclick="goToDetails(${c.id})">Détails</button>
                <button class="btn btn-edit" onclick="openEdit(${c.id})">Modifier</button>
                <button class="btn btn-delete" onclick="deleteClient(${c.id})">Supprimer</button>
            </td>
        `;
        tbody.appendChild(tr);
    });

    pageInfo.textContent = `Page ${currentPage}`;
    prevBtn.disabled = currentPage === 1;
    nextBtn.disabled = currentPage * pageSize >= clients.length;
}

prevBtn.addEventListener("click", () => {
    if (currentPage > 1) {
        currentPage--;
        displayClients();
    }
});

nextBtn.addEventListener("click", () => {
    if (currentPage * pageSize < clients.length) {
        currentPage++;
        displayClients();
    }
});

function showForm() {
    form.style.display = "block";
    document.getElementById("form-title").textContent = "Ajouter un client";
    nameInput.value = "";
    emailInput.value = "";
    phoneInput.value = "";
    currentEditId = null;
}

function openEdit(id) {
    const c = clients.find(c => c.id === id);
    if (!c) return;

    form.style.display = "block";
    document.getElementById("form-title").textContent = "Modifier le client";
    nameInput.value = c.name;
    emailInput.value = c.email;
    phoneInput.value = c.phone;
    currentEditId = id;
}

function saveEdit() {
    const name = nameInput.value.trim();
    const email = emailInput.value.trim();
    const phone = phoneInput.value.trim();

    if (!name || !email || !phone) {
        alert("Remplir tous les champs");
        return;
    }

    // Validation email très basique (optionnel mais utile)
    if (!email.includes("@") || !email.includes(".")) {
        alert("Email invalide");
        return;
    }

    if (currentEditId !== null) {
        // Modification
        const c = clients.find(c => c.id === currentEditId);
        if (c) {
            c.name = name;
            c.email = email;
            c.phone = phone;
        }
    } else {
        // Ajout
        const newId = clients.length > 0 
            ? Math.max(...clients.map(c => c.id)) + 1 
            : 1;
        clients.push({ id: newId, name, email, phone });
    }

    saveClients();              // ← sauvegarde après chaque changement
    form.style.display = "none";
    currentEditId = null;
    displayClients();
}

function deleteClient(id) {
    if (!confirm("Supprimer ce client ?")) return;

    clients = clients.filter(c => c.id !== id);
    saveClients();              // ← sauvegarde après suppression
    displayClients();
}

function goToDetails(id) {
    window.location.href = `clientdetail.html?id=${id}`;
}

window.addEventListener("DOMContentLoaded", loadClients);

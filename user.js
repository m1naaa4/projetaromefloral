let users = [];
let currentUserId = null;
let currentPage = 1;
const pageSize = 5;
const STORAGE_KEY = "users-local-2026";   // ← clé unique pour ton projet

// =====================
// DOM
// =====================
const tbody = document.querySelector("#users-table tbody");
const form = document.getElementById("edit-form");
const formTitle = document.getElementById("form-title");

// On suppose que ces inputs existent dans ton HTML
const firstName = document.getElementById("firstName");
const lastName  = document.getElementById("lastName");
const email     = document.getElementById("email");
const username  = document.getElementById("username");

// =====================
// CHARGEMENT (localStorage en priorité)
// =====================
async function loadUsers() {
    const saved = localStorage.getItem(STORAGE_KEY);

    if (saved) {
        // Si sauvegarde existe → on la prend (tes changements persistent)
        users = JSON.parse(saved);
        displayUsers();
        return;
    }

    // Seulement la toute première fois (ou localStorage vidé)
    try {
        const res = await fetch("https://dummyjson.com/users");
        const data = await res.json();

        users = data.users.map(u => ({
            id: u.id,
            firstName: u.firstName,
            lastName: u.lastName,
            email: u.email,
            username: u.username
        }));

        saveUsers();          // on sauvegarde immédiatement après chargement API
        displayUsers();
    } catch (err) {
        console.error("Erreur chargement API:", err);
        users = [];
        displayUsers();
    }
}

function saveUsers() {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(users));
}

// =====================
// AFFICHAGE TABLEAU
// =====================
function displayUsers() {
    tbody.innerHTML = "";
    const start = (currentPage - 1) * pageSize;
    const paginated = users.slice(start, start + pageSize);

    paginated.forEach(u => {
        const tr = document.createElement("tr");
        tr.innerHTML = `
            <td>${u.id}</td>
            <td>${u.firstName} ${u.lastName}</td>
            <td>${u.email}</td>
            <td>${u.username}</td>
            <td class="actions">
                <button class="btn btn-details" onclick="viewDetails(${u.id})">Détails</button>
                <button class="btn btn-edit" onclick="openEdit(${u.id})">Modifier</button>
                <button class="btn btn-delete" onclick="deleteUser(${u.id})">Supprimer</button>
            </td>
        `;
        tbody.appendChild(tr);
    });

    document.getElementById("page-info").textContent = `Page ${currentPage}`;
    document.getElementById("prev-btn").disabled = currentPage === 1;
    document.getElementById("next-btn").disabled = currentPage * pageSize >= users.length;
}

// =====================
// FORMULAIRE
// =====================
function showForm() {
    form.style.display = "block";
    formTitle.textContent = "Ajouter un utilisateur";
    firstName.value = "";
    lastName.value  = "";
    email.value     = "";
    username.value  = "";
    currentUserId = null;
}

function openEdit(id) {
    const user = users.find(u => u.id === id);
    if (!user) return;

    form.style.display = "block";
    formTitle.textContent = "Modifier un utilisateur";

    firstName.value = user.firstName;
    lastName.value  = user.lastName;
    email.value     = user.email;
    username.value  = user.username;

    currentUserId = id;
}

function saveEdit() {
    const f = firstName.value.trim();
    const l = lastName.value.trim();
    const e = email.value.trim();
    const u = username.value.trim();

    if (!f || !l || !e || !u) {
        alert("Tous les champs sont obligatoires");
        return;
    }

    // Validation email très basique (recommandé)
    if (!e.includes("@") || !e.includes(".")) {
        alert("L'email semble invalide");
        return;
    }

    if (currentUserId) {
        // Modifier
        const user = users.find(u => u.id === currentUserId);
        if (user) {
            user.firstName = f;
            user.lastName  = l;
            user.email     = e;
            user.username  = u;
        }
    } else {
        // Ajouter
        const newId = users.length > 0 
            ? Math.max(...users.map(u => u.id)) + 1 
            : 1;

        users.push({
            id: newId,
            firstName: f,
            lastName: l,
            email: e,
            username: u
        });
    }

    saveUsers();              // ← SAUVEGARDE ICI = persistance
    form.style.display = "none";
    currentUserId = null;
    displayUsers();
}

// =====================
// ACTIONS
// =====================
function deleteUser(id) {
    if (!confirm("Supprimer cet utilisateur ?")) return;

    users = users.filter(u => u.id !== id);
    saveUsers();              // ← SAUVEGARDE APRÈS SUPPRESSION
    displayUsers();
}

function viewDetails(id) {
    window.location.href = `userdetail.html?id=${id}`;
}

// =====================
// PAGINATION
// =====================
document.getElementById("prev-btn").onclick = () => {
    if (currentPage > 1) {
        currentPage--;
        displayUsers();
    }
};

document.getElementById("next-btn").onclick = () => {
    if (currentPage * pageSize < users.length) {
        currentPage++;
        displayUsers();
    }
};

// =====================
// INIT
// =====================
window.addEventListener("DOMContentLoaded", loadUsers);
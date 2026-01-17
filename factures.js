// =============================================
// GESTION DES FACTURES (CRUD + pagination + localStorage)
// =============================================

// Variables globales
let invoices = [];                  // Tableau qui contient toutes les factures
let currentEditId = null;           // ID de la facture en cours de modification (null = ajout)
let currentPage = 1;                // Page courante pour la pagination
const pageSize = 5;                 // Nombre de factures affichées par page
const STORAGE_KEY = "invoices-local";  // Clé unique dans localStorage (évite les conflits)

// Éléments du DOM (récupérés une seule fois au démarrage)
const tbody = document.querySelector("#invoices-table tbody");
const form = document.getElementById("edit-form");
const clientInput = document.getElementById("client");
const amountInput = document.getElementById("amount");
const statusInput = document.getElementById("status");
const prevBtn = document.getElementById("prev-btn");
const nextBtn = document.getElementById("next-btn");
const pageInfo = document.getElementById("page-info");

/**
 * Charge les factures :
 *   1. Priorité → localStorage (si données déjà présentes)
 *   2. Sinon → appel API dummyjson.com (une seule fois)
 */
async function loadInvoices() {
    const saved = localStorage.getItem(STORAGE_KEY);

    // Cas 1 : données déjà sauvegardées localement
    if (saved) {
        console.log("Chargement depuis localStorage");
        invoices = JSON.parse(saved);
        displayInvoices();
        return;
    }

    // Cas 2 : première visite → on charge depuis l'API
    console.log("Chargement depuis API (première fois)");
    try {
        const res = await fetch("https://dummyjson.com/carts");
        if (!res.ok) throw new Error("Erreur réseau");

        const data = await res.json();

        // Transformation des "carts" en format facture simplifié
        invoices = data.carts.map(cart => ({
            id: cart.id,
            client: `Client ${cart.userId}`,
            amount: cart.total,
            status: Math.random() > 0.5 ? "Payée" : "En attente"  // statut aléatoire pour démo
        }));

        saveInvoices();           // On sauvegarde tout de suite pour ne plus recharger l'API
        displayInvoices();
    } catch (err) {
        console.error("Erreur lors du chargement API :", err);
        invoices = [];            // En cas d'erreur → tableau vide
        displayInvoices();
    }
}

/**
 * Sauvegarde le tableau invoices dans localStorage
 * Appelée après chaque modification (ajout, edit, suppression)
 */
function saveInvoices() {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(invoices));
}

/**
 * Affiche les factures de la page courante dans le tableau
 */
function displayInvoices() {
    tbody.innerHTML = "";  // On vide le tableau avant de reconstruire

    // Calcul des indices pour la pagination
    const start = (currentPage - 1) * pageSize;
    const paginated = invoices.slice(start, start + pageSize);

    // Création d'une ligne <tr> par facture
    paginated.forEach(inv => {
        const tr = document.createElement("tr");
        tr.innerHTML = `
            <td>${inv.id}</td>
            <td>${inv.client}</td>
            <td>${Number(inv.amount).toFixed(2)}</td>
            <td>${inv.status}</td>
            <td class="actions">
                <button class="btn btn-details" onclick="goToDetails(${inv.id})">Détails</button>
                <button class="btn btn-edit"   onclick="openEdit(${inv.id})">Modifier</button>
                <button class="btn btn-delete" onclick="deleteInvoice(${inv.id})">Supprimer</button>
            </td>
        `;
        tbody.appendChild(tr);
    });

    // Mise à jour de l'interface de pagination
    pageInfo.textContent = `Page ${currentPage}`;
    prevBtn.disabled = currentPage === 1;
    nextBtn.disabled = (currentPage * pageSize >= invoices.length);
}

// -------------------
// Gestion de la pagination
// -------------------
prevBtn.addEventListener("click", () => {
    if (currentPage > 1) {
        currentPage--;
        displayInvoices();
    }
});

nextBtn.addEventListener("click", () => {
    if (currentPage * pageSize < invoices.length) {
        currentPage++;
        displayInvoices();
    }
});

// -------------------
// Gestion du formulaire (Ajout / Modification)
// -------------------

/**
 * Affiche le formulaire en mode "Ajout"
 */
function showForm() {
    form.style.display = "block";
    document.getElementById("form-title").textContent = "Ajouter une facture";
    clientInput.value = "";
    amountInput.value = "";
    statusInput.value = "";
    currentEditId = null;  // On est en mode création
}

/**
 * Remplit le formulaire avec les données d'une facture existante (mode édition)
 * @param {number} id - ID de la facture à modifier
 */
function openEdit(id) {
    const inv = invoices.find(inv => inv.id === id);
    if (!inv) return;

    form.style.display = "block";
    document.getElementById("form-title").textContent = "Modifier la facture";
    clientInput.value = inv.client;
    amountInput.value = inv.amount;
    statusInput.value = inv.status;
    currentEditId = id;
}

/**
 * Enregistre les modifications ou crée une nouvelle facture
 */
function saveEdit() {
    const client = clientInput.value.trim();
    const amount = Number(amountInput.value);
    const status = statusInput.value.trim();

    // Validation simple côté client
    if (!client || isNaN(amount) || amount <= 0 || !status) {
        alert("Veuillez remplir tous les champs correctement.");
        return;
    }

    if (currentEditId !== null) {
        // ── Mode modification ──
        const inv = invoices.find(inv => inv.id === currentEditId);
        if (inv) {
            inv.client = client;
            inv.amount = amount;
            inv.status = status;
        }
    } else {
        // ── Mode ajout ──
        // On génère un nouvel ID (le plus grand ID existant + 1)
        const newId = invoices.length > 0 
            ? Math.max(...invoices.map(i => i.id)) + 1 
            : 1;

        invoices.push({ id: newId, client, amount, status });
    }

    // Toujours sauvegarder après modification
    saveInvoices();
    form.style.display = "none";
    currentEditId = null;
    displayInvoices();  // Rafraîchit le tableau
}

/**
 * Supprime une facture après confirmation
 * @param {number} id - ID de la facture à supprimer
 */
function deleteInvoice(id) {
    if (!confirm("Voulez-vous vraiment supprimer cette facture ?")) return;

    invoices = invoices.filter(inv => inv.id !== id);
    saveInvoices();           // Sauvegarde immédiate
    displayInvoices();        // Rafraîchit l'affichage
}

/**
 * Redirige vers la page de détails d'une facture
 * @param {number} id - ID de la facture
 */
function goToDetails(id) {
    window.location.href = `facturesdetail.html?id=${id}`;
}

// -------------------
// Initialisation au chargement de la page
// -------------------
window.addEventListener("DOMContentLoaded", () => {
    loadInvoices();  // Lance le chargement dès que le DOM est prêt
});
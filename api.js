// script.js

// ========================
// GESTION DES LANGUES
// ========================
const LANG_KEY = "aromefloral_lang";

const translations = {
    fr: {
        logo: "Arome Floral",
        "nav.home": "Accueil",
        "nav.about": "À propos",
        "nav.menu": "Menu",
        "nav.gallery": "Galerie",
        "nav.contact": "Contact",
        "hero.title": "Café & Fleurs",
        "hero.subtitle": "Un coffee shop floral où chaque tasse est une douceur",
        "hero.button": "Découvrir",
        "about.title": "Notre univers",
        "about.text": "Arome Floral est un espace élégant et apaisant, mêlant café artisanal et esthétique florale.",
        "stats.users": "Utilisateurs",
        "stats.products": "Produits",
        "stats.orders": "Commandes",
        "stats.revenue": "Revenus",
        "menu.title": "Liste des produits",
        "contact.title": "Ajouter un élément",
        "contact.name": "Nom",
        "contact.price": "Prix",
        "contact.description": "Description",
        "contact.button": "Ajouter",
        footer: "© 2025 Arome Floral – Backoffice",
        logout: "Déconnexion"
    },
    en: {
        logo: "Arome Floral",
        "nav.home": "Home",
        "nav.about": "About",
        "nav.menu": "Menu",
        "nav.gallery": "Gallery",
        "nav.contact": "Contact",
        "hero.title": "Coffee & Flowers",
        "hero.subtitle": "A floral coffee shop where every cup is a delight",
        "hero.button": "Discover",
        "about.title": "Our Universe",
        "about.text": "Arome Floral is an elegant and soothing space, blending artisanal coffee and floral aesthetics.",
        "stats.users": "Users",
        "stats.products": "Products",
        "stats.orders": "Orders",
        "stats.revenue": "Revenue",
        "menu.title": "Product List",
        "contact.title": "Add an Item",
        "contact.name": "Name",
        "contact.price": "Price",
        "contact.description": "Description",
        "contact.button": "Add",
        footer: "© 2025 Arome Floral – Backoffice",
        logout: "Logout"
    },
    ar: {
        logo: "أروم فلورال",
        "nav.home": "الرئيسية",
        "nav.about": "من نحن",
        "nav.menu": "القائمة",
        "nav.gallery": "معرض الصور",
        "nav.contact": "اتصل بنا",
        "hero.title": "قهوة وزهور",
        "hero.subtitle": "مقهى زهري حيث تكون كل كوب لذيذة",
        "hero.button": "اكتشف",
        "about.title": "عالمنا",
        "about.text": "أروم فلورال مساحة أنيقة ومهدئة، تجمع بين القهوة الحرفية والجماليات الزهرية.",
        "stats.users": "المستخدمون",
        "stats.products": "المنتجات",
        "stats.orders": "الطلبات",
        "stats.revenue": "الإيرادات",
        "menu.title": "قائمة المنتجات",
        "contact.title": "إضافة عنصر",
        "contact.name": "الاسم",
        "contact.price": "السعر",
        "contact.description": "الوصف",
        "contact.button": "إضافة",
        footer: "© 2025 أروم فلورال – لوحة التحكم",
        logout: "تسجيل الخروج"
    }
};

function setLanguage(lang) {
    if (!["fr", "en", "ar"].includes(lang)) lang = "fr";

    localStorage.setItem(LANG_KEY, lang);
    document.documentElement.setAttribute("lang", lang);
    document.documentElement.setAttribute("dir", lang === "ar" ? "rtl" : "ltr");

    document.getElementById("current-lang-text").textContent = {
        fr: "Français",
        en: "English",
        ar: "العربية"
    }[lang];

    document.querySelectorAll("[data-i18n]").forEach(el => {
        const key = el.dataset.i18n;
        if (translations[lang][key]) {
            el.textContent = translations[lang][key];
        }
    });

    document.querySelectorAll("[data-i18n-placeholder]").forEach(el => {
        const key = el.dataset.i18nPlaceholder;
        if (translations[lang][key]) {
            el.placeholder = translations[lang][key];
        }
    });

    document.getElementById("logout-text").textContent = translations[lang].logout;
}

// ========================
// GESTION DES PRODUITS (ton code original)
// ========================
const API_URL = "https://fakestoreapi.com/products";
const STORAGE_KEY = "products-arome-floral";
let products = [];
let currentPage = 1;
const itemsPerPage = 5;
let editId = null;

function loadData() {
    const saved = localStorage.getItem(STORAGE_KEY);
    if (saved) {
        products = JSON.parse(saved);
        renderTable();
    } else {
        fetch(API_URL)
            .then(res => res.json())
            .then(data => {
                products = data.map(p => ({
                    ...p,
                    price: Math.round(p.price * 10)
                }));
                saveToLocal();
                renderTable();
            })
            .catch(err => {
                console.error("Erreur chargement API", err);
                products = [];
                renderTable();
            });
    }
}

function saveToLocal() {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(products));
}

function renderTable() {
    const tbody = document.querySelector("#products-table tbody");
    if (!tbody) return;

    tbody.innerHTML = "";
    const start = (currentPage - 1) * itemsPerPage;
    const end = start + itemsPerPage;
    const pageItems = products.slice(start, end);

    pageItems.forEach(product => {
        tbody.innerHTML += `
            <tr>
                <td>${product.id}</td>
                <td>${product.title || product.name || '—'}</td>
                <td>${product.category}</td>
                <td>${product.price.toFixed(2)}</td>
                <td class="actions">
                    <button class="btn btn-details" onclick="goToDetails(${product.id})">Détails</button>
                    <button class="btn btn-edit" onclick="editItem(${product.id})">Modifier</button>
                    <button class="btn btn-delete" onclick="deleteItem(${product.id})">Supprimer</button>
                </td>
            </tr>
        `;
    });

    const pageInfo = document.getElementById("page-info");
    if (pageInfo) pageInfo.innerText = `Page ${currentPage}`;

    const prevBtn = document.getElementById("prev-btn");
    const nextBtn = document.getElementById("next-btn");
    if (prevBtn) prevBtn.disabled = currentPage === 1;
    if (nextBtn) nextBtn.disabled = end >= products.length;
}

// Pagination
document.addEventListener("click", e => {
    if (e.target.id === "prev-btn" && currentPage > 1) {
        currentPage--;
        renderTable();
    }
    if (e.target.id === "next-btn" && currentPage * itemsPerPage < products.length) {
        currentPage++;
        renderTable();
    }
});

// ... (le reste de tes fonctions : showForm, editItem, saveEdit, clearForm, deleteItem, goToDetails reste identique)

function showForm() { /* ton code */ }
function editItem(id) { /* ton code */ }
function saveEdit() { /* ton code */ }
function clearForm() { /* ton code */ }
function deleteItem(id) { /* ton code */ }
function goToDetails(id) { /* ton code */ }

// Init
window.addEventListener("DOMContentLoaded", () => {
    let lang = localStorage.getItem(LANG_KEY) || "fr";
    setLanguage(lang);

    document.querySelectorAll(".language-option").forEach(opt => {
        opt.addEventListener("click", e => {
            e.preventDefault();
            setLanguage(opt.dataset.lang);
        });
    });

    loadData();

    // Déconnexion (exemple basique)
    document.getElementById("logout-button")?.addEventListener("click", () => {
        if (confirm("Voulez-vous vraiment vous déconnecter ?")) {
            localStorage.removeItem("aromefloral_currentUser");
            localStorage.removeItem("aromefloral_authToken");
            window.location.href = "login.html";
        }
    });
});


const users = [
    {
        email: "mina@aromefloral.ma",
        password: "arome2025",
        name: "Mina",
        role: "admin"
    },
    {
        email: "client@aromefloral.ma",
        password: "client123",
        name: "Client Test",
        role: "client"
    }
];

// On définit deux noms qu'on va utiliser pour stocker des informations dans le navigateur
const STORAGE_KEY_USER  = "aromefloral_currentUser";
const STORAGE_KEY_TOKEN = "aromefloral_authToken";

//// On récupère les éléments HTML dont on aura besoin
const loginForm     = document.getElementById("loginForm");
const emailInput    = document.getElementById("email");
const passwordInput = document.getElementById("password");
const errorMsg      = document.getElementById("error-msg");

// Fonction qui affiche un message d'erreur en rouge
function showError(message) {
    errorMsg.textContent = message;
    errorMsg.style.color = "red";
}

function clearError() {
    errorMsg.textContent = "";
}
//on sauvegarde l'utilisateur dans le navigateur
function saveUserSession(user) {
    const userData = {
        email: user.email,
        name: user.name,
        role: user.role,
        loginTime: new Date().toISOString()
    };
    
    localStorage.setItem(STORAGE_KEY_USER, JSON.stringify(userData));
    
    // Simulation d'un token simple
    const fakeToken = btoa(user.email + ":" + Date.now());
    localStorage.setItem(STORAGE_KEY_TOKEN, fakeToken);
}
// Récupère l'utilisateur actuellement connecté
function getCurrentUser() {
    const saved = localStorage.getItem(STORAGE_KEY_USER);
    return saved ? JSON.parse(saved) : null;
}

function isLoggedIn() {
    return !!localStorage.getItem(STORAGE_KEY_USER) && 
           !!localStorage.getItem(STORAGE_KEY_TOKEN);
}


function goToHome() {
    window.location.href = "html2.html";
}

loginForm.addEventListener("submit", function(e) {
    e.preventDefault();
    
    clearError();
    
    const email = emailInput.value.trim();
    const password = passwordInput.value.trim();
    
    if (!email || !password) {
        showError("Veuillez remplir tous les champs");
        return;
    }
    // On cherche dans la liste si un utilisateur correspond
    const foundUser = users.find(u => u.email === email && u.password === password);
    
    if (!foundUser) {
        showError("Email ou mot de passe incorrect");
        passwordInput.value = "";
        passwordInput.focus();
        return;
    }
    
    // Connexion réussie
    saveUserSession(foundUser);
    
    // Feedback visuel
    errorMsg.style.color = "green";
    errorMsg.textContent = "Connexion réussie... redirection vers l'accueil";
    
    // Redirection vers html2.html
    setTimeout(goToHome, 800);
});

// Au chargement de la page, on vérifie si l'utilisateur est déjà connecté
window.addEventListener("DOMContentLoaded", () => {
    if (isLoggedIn()) {
        const user = getCurrentUser();
        if (user) {
            errorMsg.style.color = "green";
            errorMsg.textContent = `Bienvenue ${user.name} – redirection automatique...`;
            setTimeout(goToHome, 1000);
        }
    }
});
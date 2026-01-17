# Arome Floral – Gestion d'un café

Application web simple de gestion de boutique florale (projet scolaire / personnel 2025-2026).  
CRUD complet pour **Utilisateurs**, **Produits** et **Commandes**, authentification basique avec rôles (admin/client), dashboard stats + graphiques, persistance via localStorage.

## Fonctionnalités principales

- **Authentification**
  - Login avec email/mot de passe
  - Rôles : admin 
  - Session persistante via localStorage (simulation token)
  - Redirection automatique si déjà connecté

- **Gestion des Produits** (CRUD)
  - Chargement initial depuis FakeStore API
  - Ajout, modification, suppression
  - Prix convertis en MAD 
  - Pagination (5 par page)
  - Page détail produit
  - export PDF/CSV

- **Gestion des Commandes** (CRUD)
  - Chargement initial depuis DummyJSON /carts
  - Ajout, modification, suppression
  - Pagination
  - Page détail commande
  - export PDF/CSV

- **Gestion des Utilisateurs** (CRUD)
  - Chargement depuis DummyJSON /users
  - Ajout, modification, suppression
  - Pagination
  - Page details
  - export PDF/CSV

- **Dashboard Admin**
  - Statistiques : total users / products / orders / pending / revenue
  - Graphiques Chart.js : pie, bar, line, doughnut, scatter
  - Chargement via Axios depuis DummyJSON
  -  Page details
  - export PDF/CSV

- **Persistance**  
  Toutes les modifications (ajout/modif/suppr) sont sauvegardées dans le **localStorage** avec clés uniques.

## Technologies utilisées

- HTML5 / CSS3
- JavaScript vanilla (ES6+)
- Axios (pour les appels API)
- Chart.js (graphiques dashboard)
- localStorage (persistance client-side)
- FakeStore API & DummyJSON API (données fake)

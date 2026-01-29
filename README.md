# Fav-Link 🌟

> **Le Gestionnaire de Favoris PWA Ultime.**
>
> Une expérience **premium**, **minimaliste** et **totalement hors-ligne** pour organiser votre web.

![PWA Shield](https://img.shields.io/badge/PWA-Ready-purple?style=for-the-badge&logo=pwa)
![Vanilla JS](https://img.shields.io/badge/Vanilla%20JS-100%25-yellow?style=for-the-badge&logo=javascript)
![License](https://img.shields.io/badge/License-MIT-blue?style=for-the-badge)

## ✨ Fonctionnalités Clés

**Fav-Link** a été conçu avec une obsession pour le détail et la performance. Pas de framework lourd, juste du code pur pour une vitesse maximale.

*   🎨 **Design Premium & Glassmorphism**
    *   Interface fluide avec effets de transparence.
    *   **Dark Mode** & **Light Mode** automatique ou manuel.
    *   Animations soignées à l'entrée des éléments.

*   📱 **PWA Native (Progressive Web App)**
    *   **Installable** sur Mobile (iOS/Android) et Desktop.
    *   **100% Hors-ligne** grâce au Service Worker et IndexedDB.
    *   **Share Target API** : Partagez un lien depuis n'importe quelle app directement vers Fav-Link.

*   ⚡ **Performance & Confidentialité**
    *   **Zero Backend** : Vos données restent sur votre appareil (IndexedDB).
    *   **Zéro Trackers**.
    *   Chargement instantané.

*   🛠️ **Outils Avancés**
    *   **Import/Export JSON** : Sauvegardez et restaurez vos favoris en un clic.
    *   **Recherche Instantanée** : Filtrez par titre, URL ou tags en temps réel.
    *   **Tagging System** : Organisation par étiquettes dynamiques.

## 🚀 Installation & Utilisation

### En Ligne (Démo)
*Déployez simplement ce dossier sur Netlify, Vercel ou GitHub Pages.*

### En Local

Pas de `npm install` complexe. C'est du Vanilla JS. Il suffit de servir les fichiers.

1.  **Cloner le projet**
    ```bash
    git clone https://github.com/votre-user/fav-link.git
    cd fav-link
    ```

2.  **Lancer un serveur local**
    ```bash
    # Avec npx (Node.js)
    npx serve .
    
    # Ou avec Python
    python3 -m http.server 3000
    ```

3.  **Ouvrir**
    Rendez-vous sur `http://localhost:3000`.

## 🛠️ Stack Technique

*   **HTML5** : Structure sémantique.
*   **CSS3** : Variables CSS (Theming), Flexbox/Grid, Glassmorphism, Animations.
*   **JavaScript (ES6+)** : Modules, Async/Await.
*   **IndexedDB** : Base de données locale performante (via wrapper `db.js`).
*   **Service Worker** : Stratégie de cache "Stale-while-revalidate".

## 🤝 Contribuer

Les contributions sont les bienvenues ! N'hésitez pas à ouvrir une *issue* ou une *pull request*.

---

*Fait avec ❤️ par Antigravity*
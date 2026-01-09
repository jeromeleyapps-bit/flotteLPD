# Flotte LPD - Gestion de flotte Les Petits Débrouillards

Application web de gestion de flotte de véhicules pour l'association Les Petits Débrouillards.

## 🚀 Fonctionnalités

- ✅ **Gestion des véhicules** : Ajout, modification, suppression, suivi des statuts
- ✅ **Réservations** : Création et gestion des réservations de véhicules
- ✅ **Trajets** : Suivi des trajets (départ/arrivée)
- ✅ **Maintenances** : Suivi des maintenances préventives et curatives
- ✅ **Multi-utilisateurs** : Synchronisation temps réel entre utilisateurs
- ✅ **Responsive** : Interface optimisée pour mobile, tablette et desktop
- ✅ **PWA Ready** : Application Progressive Web App

## 🛠️ Technologies

- **Frontend** : Vue 3 + Vuetify 3
- **State Management** : Pinia
- **Routing** : Vue Router
- **Backend** : Architecture d'abstraction supportant :
  - 🔥 **Firebase** (Firestore) - Recommandé pour plan gratuit généreux
  - 🟢 **Supabase** (PostgreSQL) - Alternative SQL
  - 💾 **LocalStorage** - Uniquement pour tests solo

## 📋 Prérequis

- Node.js >= 20.19.0 ou >= 22.12.0
- npm ou yarn

## 🚀 Installation

1. **Cloner le dépôt**
```bash
git clone https://github.com/jeromeleyapps-bit/flotteLPD.git
cd flotteLPD
```

2. **Installer les dépendances**
```bash
npm install
```

3. **Configurer le backend**

Créez un fichier `.env` à la racine du projet :

### Option 1 : Firebase (Recommandé)
```env
VITE_BACKEND_TYPE=firebase
VITE_FIREBASE_API_KEY=votre_cle_api
VITE_FIREBASE_AUTH_DOMAIN=votre-projet.firebaseapp.com
VITE_FIREBASE_PROJECT_ID=votre_projet_id
VITE_FIREBASE_STORAGE_BUCKET=votre-projet.appspot.com
VITE_FIREBASE_MESSAGING_SENDER_ID=votre_sender_id
VITE_FIREBASE_APP_ID=votre_app_id
```

### Option 2 : Supabase
```env
VITE_BACKEND_TYPE=supabase
VITE_SUPABASE_URL=https://votre-projet.supabase.co
VITE_SUPABASE_ANON_KEY=votre_cle_anon
```

### Option 3 : LocalStorage (Tests uniquement)
```env
VITE_BACKEND_TYPE=localstorage
```

**⚠️ Important** : LocalStorage ne supporte PAS la synchronisation multi-utilisateurs. Utilisez Firebase ou Supabase pour la production.

4. **Lancer l'application**
```bash
npm run dev
```

## 📚 Documentation

- **[GUIDE_FIREBASE.md](./GUIDE_FIREBASE.md)** - Guide complet pour configurer Firebase
- **[GUIDE_BACKEND.md](./GUIDE_BACKEND.md)** - Guide d'utilisation des backends alternatifs
- **[COMPARAISON_FIREBASE_SUPABASE.md](./COMPARAISON_FIREBASE_SUPABASE.md)** - Comparaison détaillée
- **[ACTIVER_SYNCHRONISATION_TEMPS_REEL.md](./ACTIVER_SYNCHRONISATION_TEMPS_REEL.md)** - Activer la sync temps réel
- **[MODE_DEVELOPPEMENT.md](./MODE_DEVELOPPEMENT.md)** - Mode développement (bypass auth)

## 🎯 Recommandation Backend

Pour une utilisation **multi-utilisateurs** avec synchronisation temps réel :

**→ Firebase avec Firestore** ⭐ RECOMMANDÉ
- Plan gratuit généreux (1 GB base, 5 GB stockage)
- Synchronisation temps réel native
- Authentication illimitée
- Service très stable (Google)

Voir [GUIDE_FIREBASE.md](./GUIDE_FIREBASE.md) pour la configuration complète.

## 🏗️ Structure du projet

```
flotte-lpd/
├── src/
│   ├── components/     # Composants Vue réutilisables
│   ├── config/         # Configuration (backend, adapters)
│   ├── router/         # Routes Vue Router
│   ├── stores/         # Stores Pinia
│   ├── views/          # Vues principales
│   └── assets/         # Assets (CSS, images)
├── database/           # Scripts SQL (Supabase)
├── public/             # Fichiers statiques
└── .env                # Variables d'environnement (à créer)
```

## 🔧 Scripts disponibles

```bash
# Développement
npm run dev

# Build production
npm run build

# Preview production build
npm run preview
```

## 📱 Responsive Design

L'application est optimisée pour :
- 📱 **Mobile** : Interface adaptée aux petits écrans
- 📱 **Tablette** : Layout intermédiaire
- 💻 **Desktop** : Interface complète

## 🔐 Sécurité

- Les fichiers `.env` sont exclus du dépôt Git
- Ne commitez JAMAIS vos clés API ou identifiants
- Utilisez les règles de sécurité Firestore/Supabase appropriées

## 🤝 Contribution

Les contributions sont les bienvenues ! N'hésitez pas à ouvrir une issue ou une pull request.

## 📄 Licence

Ce projet est destiné à l'usage interne de l'association Les Petits Débrouillards.

## 🆘 Support

Pour toute question ou problème :
1. Consultez la documentation dans les fichiers `.md`
2. Vérifiez les issues GitHub existantes
3. Ouvrez une nouvelle issue si nécessaire

---

**Développé pour Les Petits Débrouillards** 🚗

# Guide d'utilisation des backends alternatifs

## 🎯 Architecture d'abstraction

L'application utilise maintenant une architecture d'abstraction qui permet de changer facilement de backend sans modifier le code de l'application.

## 🚀 Backends disponibles

### 1. LocalStorage ⚠️ UNIQUEMENT pour test solo

**⚠️ ATTENTION : Ne convient PAS pour une utilisation multi-utilisateurs !**

**Avantages :**
- ✅ Fonctionne immédiatement, aucun serveur nécessaire
- ✅ Aucune configuration requise
- ✅ Parfait pour développement/test **SEUL**

**Inconvénients CRITIQUES :**
- ❌ **PAS de synchronisation entre utilisateurs**
- ❌ **Statuts des véhicules non partagés** - Conflits de réservation possibles
- ❌ Chaque navigateur a ses propres données
- ❌ Limite : ~5-10MB de stockage

**⚠️ À NE PAS UTILISER** si plusieurs personnes utilisent l'application en même temps !

**Configuration :**
```env
# Dans .env (optionnel, c'est le défaut)
VITE_BACKEND_TYPE=localstorage
```

---

### 2. Firebase ⭐ Recommandé pour plan gratuit généreux

**Avantages :**
- ✅ **Plan gratuit très généreux** : 1 GB base de données, 5 GB stockage
- ✅ **Synchronisation temps réel native** avec Firestore
- ✅ **Authentication illimitée** (pas de limite d'utilisateurs)
- ✅ **50,000 lectures/jour** et **20,000 écritures/jour** gratuites
- ✅ **Service très stable** (Google)

**Configuration :**
```env
VITE_BACKEND_TYPE=firebase
VITE_FIREBASE_API_KEY=votre_cle_api
VITE_FIREBASE_AUTH_DOMAIN=votre-projet.firebaseapp.com
VITE_FIREBASE_PROJECT_ID=votre_projet_id
VITE_FIREBASE_STORAGE_BUCKET=votre-projet.appspot.com
VITE_FIREBASE_MESSAGING_SENDER_ID=votre_sender_id
VITE_FIREBASE_APP_ID=votre_app_id
```

**Utilisation :**
- Nécessite un projet Firebase (gratuit)
- Données stockées dans Firestore (NoSQL)
- Synchronisation temps réel automatique
- **Parfait pour votre cas d'usage multi-utilisateurs !**

**Guide complet :** Voir `GUIDE_FIREBASE.md`

---

### 3. Supabase

**Configuration :**
```env
VITE_BACKEND_TYPE=supabase
VITE_SUPABASE_URL=https://votre-projet.supabase.co
VITE_SUPABASE_ANON_KEY=votre_cle_anon
```

**Utilisation :**
- Nécessite un projet Supabase actif
- Données stockées dans le cloud (SQL)
- Synchronisation multi-appareils avec Realtime

---

### 3. Firebase (À venir)

**Configuration :**
```env
VITE_BACKEND_TYPE=firebase
VITE_FIREBASE_API_KEY=votre_cle
VITE_FIREBASE_PROJECT_ID=votre_projet
```

**Note :** L'adaptateur Firebase sera implémenté si nécessaire.

---

### 4. PocketBase (À venir)

**Configuration :**
```env
VITE_BACKEND_TYPE=pocketbase
VITE_POCKETBASE_URL=http://localhost:8090
```

**Note :** L'adaptateur PocketBase sera implémenté si nécessaire.

---

### 5. REST API (À venir)

**Configuration :**
```env
VITE_BACKEND_TYPE=rest
VITE_API_URL=http://localhost:3000/api
```

**Note :** L'adaptateur REST sera implémenté si nécessaire.

---

## 📝 Comment changer de backend

### Méthode 1 : Variable d'environnement (Recommandé)

1. Créez/modifiez le fichier `.env` à la racine du projet
2. Ajoutez :
   ```env
   VITE_BACKEND_TYPE=localstorage
   ```
3. Redémarrez le serveur de développement

### Méthode 2 : Modification directe

Modifiez `src/config/backend.js` :
```javascript
const BACKEND_TYPE = 'localstorage' // Changez ici
```

---

## ✅ Utilisation actuelle

**Par défaut, l'application utilise LocalStorage**, ce qui signifie :

- ✅ **Aucune configuration nécessaire**
- ✅ **Fonctionne immédiatement**
- ✅ **Pas de serveur requis**
- ✅ **Parfait pour tester l'application**

---

## 🔄 Migration des données

### Depuis Supabase vers LocalStorage

Les données sont actuellement stockées dans Supabase. Pour migrer vers LocalStorage :

1. Exportez vos données depuis Supabase
2. Utilisez l'interface de l'application en mode LocalStorage
3. Importez manuellement les données via l'interface (fonctionnalité à ajouter)

### Depuis LocalStorage vers Supabase

1. Configurez Supabase dans `.env`
2. Changez `VITE_BACKEND_TYPE=supabase`
3. Les données seront automatiquement synchronisées avec Supabase

---

## 🛠️ Développement

### Ajouter un nouveau backend

1. Créez un nouveau fichier dans `src/config/adapters/`
2. Implémentez toutes les méthodes de l'interface
3. Ajoutez le cas dans `src/config/backend.js`

### Interface à implémenter

Tous les adaptateurs doivent implémenter :

- **Authentification :** `signIn`, `signUp`, `signOut`, `getSession`, `getUser`
- **Véhicules :** `getVehicles`, `createVehicle`, `updateVehicle`, `deleteVehicle`
- **Réservations :** `getReservations`, `createReservation`, `updateReservation`
- **Trajets :** `getTrips`, `createTrip`, `updateTrip`
- **Maintenances :** `getMaintenances`
- **Départements :** `getDepartments`
- **Profils :** `updateProfile`

---

## 📊 Comparaison rapide

| Backend | Configuration | Serveur | Coût | Multi-utilisateurs | Sync temps réel |
|---------|--------------|---------|------|---------------------|-----------------|
| LocalStorage | Aucune | Non | Gratuit | ❌ Non | ❌ Non |
| Supabase | Facile | Non (cloud) | Gratuit/Paid | ✅ Oui | ✅ Oui |
| Firebase | Facile | Non (cloud) | Gratuit/Paid | ✅ Oui | ✅ Oui |
| PocketBase | Moyenne | Oui | Gratuit | ✅ Oui | ✅ Oui |
| REST API | Complexe | Oui | Variable | ✅ Oui | ⚠️ Avec WebSocket |

---

## 🎯 Recommandation pour votre cas

### ⚠️ IMPORTANT : Vous avez besoin de synchronisation multi-utilisateurs

**Pour votre application de gestion de flotte :**

**→ Firebase avec Firestore** ⭐ RECOMMANDÉ (Plan gratuit généreux)
- ✅ **Synchronisation temps réel native** - Les changements sont propagés instantanément
- ✅ **Plan gratuit très généreux** - 1 GB base de données, 5 GB stockage
- ✅ **Authentication illimitée** - Pas de limite sur le nombre d'utilisateurs
- ✅ **50,000 lectures/jour** - Suffisant pour commencer
- ✅ **Service très stable** - Géré par Google
- ✅ **Tous les utilisateurs voient les changements instantanément**

**Configuration :**
```env
VITE_BACKEND_TYPE=firebase
VITE_FIREBASE_API_KEY=votre_cle_api
VITE_FIREBASE_AUTH_DOMAIN=votre-projet.firebaseapp.com
VITE_FIREBASE_PROJECT_ID=votre_projet_id
VITE_FIREBASE_STORAGE_BUCKET=votre-projet.appspot.com
VITE_FIREBASE_MESSAGING_SENDER_ID=votre_sender_id
VITE_FIREBASE_APP_ID=votre_app_id
```

**Installation :**
```bash
npm install firebase
```

**Guide complet :** Voir `GUIDE_FIREBASE.md`

---

**→ Supabase avec Realtime** (Alternative)
- ✅ Synchronisation en temps réel
- ✅ SQL natif (si vous préférez SQL)
- ✅ 500 MB base de données (moins que Firebase)
- ✅ Gratuit jusqu'à 200 connexions simultanées

### ❌ Ne PAS utiliser LocalStorage pour production

LocalStorage est uniquement pour :
- Tests personnels
- Démonstrations solo
- Développement local sans autres utilisateurs

---

## ⚠️ Notes importantes

1. **LocalStorage** : Les données sont limitées au navigateur et peuvent être perdues
2. **Supabase** : Nécessite un projet actif et configuré
3. **Changement de backend** : Les données ne sont pas automatiquement migrées entre backends
4. **Mode dev** : En mode développement, LocalStorage est utilisé automatiquement si aucun backend n'est configuré

---

## 🆘 Dépannage

### L'application ne se connecte pas au backend

1. Vérifiez la variable `VITE_BACKEND_TYPE` dans `.env`
2. Vérifiez la console pour les erreurs
3. Pour LocalStorage, aucune configuration n'est nécessaire

### Les données ne se sauvegardent pas

- **LocalStorage** : Vérifiez que le navigateur autorise le stockage local
- **Supabase** : Vérifiez les variables d'environnement et la connexion réseau

### Erreur "Backend type inconnu"

- Vérifiez l'orthographe dans `VITE_BACKEND_TYPE`
- Les valeurs valides sont : `localstorage`, `supabase`, `firebase`, `pocketbase`, `rest`

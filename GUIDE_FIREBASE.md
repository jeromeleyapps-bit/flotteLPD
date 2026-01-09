# Guide d'installation et configuration Firebase

## 🎯 Pourquoi Firebase ?

Firebase est une **excellente option gratuite** pour votre application :

- ✅ **Plan gratuit généreux** : 1 GB de base de données, 5 GB de stockage
- ✅ **Synchronisation temps réel native** avec Firestore
- ✅ **Authentication illimitée** (pas de limite d'utilisateurs)
- ✅ **Service très stable** géré par Google
- ✅ **50,000 lectures/jour** et **20,000 écritures/jour** gratuites

## 📋 Étape 1 : Créer un projet Firebase

1. Allez sur [console.firebase.google.com](https://console.firebase.google.com)
2. Cliquez sur **"Ajouter un projet"** ou **"Create a project"**
3. Suivez les étapes :
   - Nommez votre projet (ex: "flotte-lpd")
   - Activez Google Analytics (optionnel)
   - Créez le projet

## 📋 Étape 2 : Configurer Firestore Database

1. Dans votre projet Firebase, allez dans **Firestore Database**
2. Cliquez sur **"Créer une base de données"** ou **"Create database"**
3. Choisissez **"Commencer en mode test"** (pour commencer)
4. Sélectionnez une région (ex: `europe-west` pour la France)
5. Créez la base de données

## 📋 Étape 3 : Activer Authentication

1. Allez dans **Authentication**
2. Cliquez sur **"Commencer"** ou **"Get started"**
3. Activez **"Email/Password"** dans les méthodes de connexion
4. Sauvegardez

## 📋 Étape 4 : Récupérer les identifiants

1. Allez dans **Paramètres du projet** (icône ⚙️)
2. Dans la section **"Vos applications"**, cliquez sur **"</>"** (Web)
3. Enregistrez l'application (nom: "Flotte LPD")
4. **Copiez la configuration** qui ressemble à :

```javascript
const firebaseConfig = {
  apiKey: "AIza...",
  authDomain: "votre-projet.firebaseapp.com",
  projectId: "votre-projet-id",
  storageBucket: "votre-projet.appspot.com",
  messagingSenderId: "123456789",
  appId: "1:123456789:web:abc123"
}
```

## 📋 Étape 5 : Configurer l'application

Créez/modifiez le fichier `.env` à la racine du projet :

```env
VITE_BACKEND_TYPE=firebase
VITE_FIREBASE_API_KEY=AIza...
VITE_FIREBASE_AUTH_DOMAIN=votre-projet.firebaseapp.com
VITE_FIREBASE_PROJECT_ID=votre-projet-id
VITE_FIREBASE_STORAGE_BUCKET=votre-projet.appspot.com
VITE_FIREBASE_MESSAGING_SENDER_ID=123456789
VITE_FIREBASE_APP_ID=1:123456789:web:abc123
```

## 📋 Étape 6 : Installer les dépendances Firebase

```bash
npm install firebase
```

## 📋 Étape 7 : Créer les collections dans Firestore

Firebase utilise des **collections** (équivalent de tables SQL). Créez les collections suivantes :

1. **`profiles`** - Profils utilisateurs
2. **`vehicles`** - Véhicules
3. **`reservations`** - Réservations
4. **`trips`** - Trajets
5. **`maintenances`** - Maintenances
6. **`departments`** - Départements

**Comment créer :**
- Allez dans Firestore Database
- Cliquez sur **"Démarrer la collection"**
- Nommez la collection (ex: `departments`)
- Ajoutez le premier document avec les champs nécessaires

## 📋 Étape 8 : Initialiser les départements

Créez manuellement les départements dans la collection `departments` :

1. Collection : `departments`
2. Ajoutez 6 documents avec les champs :
   - `name` (string) : "Alpes-de-Haute-Provence", etc.
   - `code` (string) : "04", "05", etc.

## 📋 Étape 9 : Configurer les règles de sécurité Firestore

Allez dans **Firestore Database** > **Règles** et configurez :

```javascript
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    // Profils : utilisateurs peuvent lire/écrire leur propre profil
    match /profiles/{userId} {
      allow read, write: if request.auth != null && request.auth.uid == userId;
    }
    
    // Véhicules : lecture pour tous les utilisateurs authentifiés, écriture pour admins
    match /vehicles/{vehicleId} {
      allow read: if request.auth != null;
      allow write: if request.auth != null; // À restreindre aux admins si nécessaire
    }
    
    // Réservations : lecture/écriture pour utilisateurs authentifiés
    match /reservations/{reservationId} {
      allow read, write: if request.auth != null;
    }
    
    // Trajets : lecture/écriture pour utilisateurs authentifiés
    match /trips/{tripId} {
      allow read, write: if request.auth != null;
    }
    
    // Maintenances : lecture pour tous, écriture pour admins
    match /maintenances/{maintenanceId} {
      allow read: if request.auth != null;
      allow write: if request.auth != null;
    }
    
    // Départements : lecture pour tous
    match /departments/{departmentId} {
      allow read: if request.auth != null;
      allow write: if false; // Seuls les admins peuvent modifier
    }
  }
}
```

## 📋 Étape 10 : Redémarrer l'application

```bash
npm run dev
```

## ✅ Vérification

1. L'application devrait se connecter à Firebase
2. Vous pouvez créer un compte
3. Les données sont stockées dans Firestore
4. La synchronisation temps réel fonctionne automatiquement

## 🔄 Migration depuis Supabase

Si vous avez déjà des données dans Supabase :

1. Exportez vos données depuis Supabase
2. Importez-les dans Firestore (format JSON)
3. Adaptez la structure si nécessaire (SQL → NoSQL)

## 📊 Structure des données Firestore

### Collection `vehicles`
```javascript
{
  plate_number: "AA-123-AA",
  brand: "Renault",
  model: "Dokker",
  year: 2020,
  type: "utilitaire",
  fuel_type: "diesel",
  status: "available",
  department_id: "doc-id-du-departement",
  created_at: Timestamp
}
```

### Collection `reservations`
```javascript
{
  vehicle_id: "doc-id-vehicule",
  user_id: "doc-id-user",
  purpose: "Mission",
  start_date: Timestamp,
  end_date: Timestamp,
  status: "pending",
  created_at: Timestamp
}
```

## 🎯 Avantages de Firebase pour votre cas

- ✅ **Synchronisation temps réel automatique** - Les changements sont propagés instantanément
- ✅ **Plan gratuit généreux** - 50,000 lectures/jour suffisent largement
- ✅ **Très stable** - Service géré par Google
- ✅ **Authentication illimitée** - Pas de limite sur le nombre d'utilisateurs
- ✅ **Plus de stockage** - 1 GB vs 500 MB pour Supabase

## ⚠️ Notes importantes

- **NoSQL** : La structure est différente de SQL (collections/documents au lieu de tables)
- **Quotas quotidiens** : 50,000 lectures et 20,000 écritures par jour
- **Règles de sécurité** : Configurez-les correctement pour la sécurité

---

**Firebase est prêt à être utilisé !** Configurez simplement vos identifiants dans `.env` et redémarrez l'application.

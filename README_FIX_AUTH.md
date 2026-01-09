# Correction des problèmes d'authentification Supabase

## Problèmes identifiés
- Erreurs 406 (Not Acceptable) lors des requêtes API
- Erreurs 403 (Forbidden) et RLS (42501) sur la table "profiles"
- Erreurs PGRST116 lors de la mise à jour du département

## Corrections apportées

### 1. Configuration Supabase améliorée
- Ajout des en-têtes `Content-Type`, `Accept` et `apikey` dans la configuration du client
- Fichier modifié : `src/config/supabase.js`

### 2. Gestion des erreurs dans le store
- Utilisation de `throwOnError()` pour une meilleure gestion des erreurs
- Vérification de l'authentification avant chaque opération
- Fonctions corrigées : `loadUserProfile()` et `updateDepartment()`
- Fichier modifié : `src/store/index.js`

### 3. Politiques RLS configurées
- Script SQL créé pour configurer les politiques de sécurité
- Fichier : `database/setup_rls_policies.sql`

## Instructions pour appliquer les corrections

### Étape 1 : Appliquer les politiques RLS
1. Connectez-vous à votre tableau de bord Supabase
2. Allez dans l'éditeur SQL
3. Copiez et exécutez le contenu du fichier `database/setup_rls_policies.sql`

### Étape 2 : Configurer CORS
1. Dans Supabase, allez dans Authentication > Settings
2. Ajoutez `http://localhost:5174` dans "Site URL"
3. Ajoutez `http://localhost:5174/**` dans "Redirect URLs"

### Étape 3 : Redémarrer l'application
```bash
npm run dev
```

### Étape 4 : Tester l'authentification
1. Accédez à `http://localhost:5174/login`
2. Connectez-vous avec un compte existant ou créez un nouveau compte
3. Vérifiez que la sélection du département fonctionne correctement

## Vérification des erreurs
Après avoir appliqué les corrections, les erreurs suivantes devraient disparaître :
- `406 (Not Acceptable)`
- `403 (Forbidden)`
- `42501 (new row violates row-level security policy)`
- `PGRST116 (Cannot coerce the result to a single JSON object)`

## Dépannage
Si les problèmes persistent :
1. Vérifiez que les politiques RLS ont été correctement appliquées
2. Assurez-vous que les variables d'environnement sont correctement configurées
3. Consultez les logs Supabase pour identifier d'éventuels problèmes
4. Vérifiez la console du navigateur pour les erreurs JavaScript

## Notes importantes
- Les politiques RLS garantissent que chaque utilisateur ne peut accéder qu'à son propre profil
- Les départements sont accessibles en lecture seule pour tous les utilisateurs
- Seuls les administrateurs peuvent modifier les départements

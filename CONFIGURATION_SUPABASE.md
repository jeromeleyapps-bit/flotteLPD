# Configuration Supabase - Guide de dépannage

## 🔴 Erreur : ERR_NAME_NOT_RESOLVED

Si vous voyez l'erreur `ERR_NAME_NOT_RESOLVED` avec une URL Supabase, cela signifie que :

1. **L'URL Supabase est incorrecte** dans votre fichier `.env`
2. **Le projet Supabase n'existe plus** ou a été supprimé
3. **Les variables d'environnement ne sont pas chargées** correctement

## ✅ Solution : Configurer correctement les variables d'environnement

### Étape 1 : Créer le fichier `.env`

Créez un fichier `.env` à la racine du projet avec le contenu suivant :

```env
VITE_SUPABASE_URL=https://votre-projet.supabase.co
VITE_SUPABASE_ANON_KEY=votre_cle_anon_ici
```

### Étape 2 : Récupérer vos identifiants Supabase

1. Connectez-vous à votre [tableau de bord Supabase](https://app.supabase.com)
2. Sélectionnez votre projet
3. Allez dans **Settings** > **API**
4. Copiez :
   - **Project URL** → `VITE_SUPABASE_URL`
   - **anon public** key → `VITE_SUPABASE_ANON_KEY`

### Étape 3 : Vérifier le format de l'URL

L'URL doit :
- Commencer par `https://`
- Contenir `.supabase.co`
- Exemple valide : `https://abcdefghijklmnop.supabase.co`

### Étape 4 : Redémarrer le serveur de développement

Après avoir modifié le fichier `.env`, **vous devez redémarrer le serveur** :

```bash
# Arrêtez le serveur (Ctrl+C)
# Puis relancez-le
npm run dev
```

## 🔍 Vérification

Pour vérifier que la configuration est correcte :

1. Ouvrez la console du navigateur (F12)
2. Vérifiez qu'il n'y a plus d'erreurs `ERR_NAME_NOT_RESOLVED`
3. L'application devrait se connecter à Supabase sans erreur

## ⚠️ Notes importantes

- Le fichier `.env` ne doit **jamais** être commité dans Git (il est déjà dans `.gitignore`)
- Si vous travaillez en équipe, partagez les identifiants via un gestionnaire de secrets sécurisé
- Pour la production, configurez les variables d'environnement sur votre plateforme d'hébergement

## 🆘 Si le problème persiste

1. **Vérifiez que votre projet Supabase est actif** dans le tableau de bord
2. **Vérifiez votre connexion internet**
3. **Vérifiez les paramètres CORS** dans Supabase (Settings > API > CORS)
4. **Consultez les logs Supabase** pour voir s'il y a des erreurs côté serveur

## 📝 Exemple de fichier .env

```env
# Supabase Configuration
VITE_SUPABASE_URL=https://votre-projet-id.supabase.co
VITE_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InZvdHJlLXByb2pldC1pZCIsInJvbGUiOiJhbm9uIiwiaWF0IjoxNjE2MjM5MDIyfQ.exemple
```

**⚠️ Remplacez les valeurs par vos propres identifiants !**

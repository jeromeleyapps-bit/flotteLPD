# Mode Développement - Authentification désactivée

## 🔧 Activation du mode développement

Le mode développement désactive temporairement l'authentification pour permettre de tester l'application directement sans avoir à se connecter.

### Méthode 1 : Variable d'environnement (recommandé)

Ajoutez dans votre fichier `.env` :

```env
VITE_DEV_MODE=true
```

### Méthode 2 : Mode développement automatique

En mode développement (`npm run dev`), le mode dev est automatiquement activé si `VITE_DEV_MODE` n'est pas défini.

## ✅ Ce qui est activé en mode dev

- ✅ **Authentification désactivée** : Pas besoin de se connecter
- ✅ **Utilisateur fictif créé automatiquement** :
  - Email: `dev@test.local`
  - Nom: `Utilisateur Test`
  - Rôle: `admin`
  - Département: `Alpes-de-Haute-Provence`
- ✅ **Accès à toutes les routes** : Aucune redirection vers `/login`
- ✅ **Navigation complète** : Tous les menus sont accessibles

## 🚀 Utilisation

1. **Activez le mode dev** en ajoutant `VITE_DEV_MODE=true` dans `.env`
2. **Redémarrez le serveur** : `npm run dev`
3. **Accédez directement** à n'importe quelle route :
   - `/dashboard` - Tableau de bord
   - `/vehicles` - Gestion des véhicules
   - `/reservations` - Gestion des réservations
   - `/trips` - Gestion des trajets

## ⚠️ Important

- **Ne jamais activer en production** : Le mode dev ne doit être utilisé qu'en développement local
- **Les données Supabase** : Les opérations sur Supabase fonctionneront toujours, mais avec l'utilisateur fictif
- **Pour désactiver** : Supprimez `VITE_DEV_MODE=true` du fichier `.env` ou mettez-le à `false`

## 🔄 Désactiver le mode dev

Pour revenir au mode normal avec authentification :

1. Supprimez ou modifiez dans `.env` :
   ```env
   VITE_DEV_MODE=false
   ```
2. Redémarrez le serveur

## 📝 Note

En mode dev, vous verrez dans la console :
```
🔧 Mode développement activé - Authentification désactivée
```

Cela confirme que le mode dev est bien actif.

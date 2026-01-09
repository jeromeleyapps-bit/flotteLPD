-- Configuration des politiques RLS (Row Level Security) pour Supabase
-- Exécuter ce script dans l'éditeur SQL du tableau de bord Supabase

-- Activer le RLS sur la table profiles
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

-- Supprimer les politiques existantes pour éviter les conflits
DROP POLICY IF EXISTS "Les utilisateurs peuvent voir leur propre profil" ON public.profiles;
DROP POLICY IF EXISTS "Les utilisateurs peuvent mettre à jour leur propre profil" ON public.profiles;
DROP POLICY IF EXISTS "Les utilisateurs peuvent créer leur propre profil" ON public.profiles;

-- Politique pour permettre la lecture du profil de l'utilisateur connecté
CREATE POLICY "Les utilisateurs peuvent voir leur propre profil" 
ON public.profiles
FOR SELECT 
USING (auth.uid() = id);

-- Politique pour permettre la mise à jour du profil de l'utilisateur connecté
CREATE POLICY "Les utilisateurs peuvent mettre à jour leur propre profil" 
ON public.profiles
FOR UPDATE 
USING (auth.uid() = id)
WITH CHECK (auth.uid() = id);

-- Politique pour permettre l'insertion d'un nouveau profil
CREATE POLICY "Les utilisateurs peuvent créer leur propre profil" 
ON public.profiles
FOR INSERT 
WITH CHECK (auth.uid() = id);

-- Activer le RLS sur la table departments
ALTER TABLE public.departments ENABLE ROW LEVEL SECURITY;

-- Supprimer les politiques existantes pour la table departments
DROP POLICY IF EXISTS "Tout le monde peut voir les départements" ON public.departments;
DROP POLICY IF EXISTS "Les administrateurs peuvent gérer les départements" ON public.departments;

-- Politique pour permettre à tout le monde de voir les départements (lecture seule)
CREATE POLICY "Tout le monde peut voir les départements" 
ON public.departments
FOR SELECT 
USING (true);

-- Politique pour permettre aux administrateurs de gérer les départements
CREATE POLICY "Les administrateurs peuvent gérer les départements" 
ON public.departments
FOR ALL 
USING (
  EXISTS (
    SELECT 1 FROM public.profiles 
    WHERE profiles.id = auth.uid() 
    AND profiles.role = 'admin'
  )
)
WITH CHECK (
  EXISTS (
    SELECT 1 FROM public.profiles 
    WHERE profiles.id = auth.uid() 
    AND profiles.role = 'admin'
  )
);

-- Vérifier que les politiques sont correctement configurées
SELECT 
  schemaname,
  tablename,
  policyname,
  permissive,
  roles,
  cmd,
  qual,
  with_check
FROM pg_policies 
WHERE tablename IN ('profiles', 'departments')
ORDER BY tablename, policyname;

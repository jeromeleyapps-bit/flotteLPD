-- Script de nettoyage des données en double et vérification des politiques RLS
-- Exécuter ce script dans l'éditeur SQL du tableau de bord Supabase

-- 1. Nettoyer les profils en double (garder le plus récent)
WITH ranked_profiles AS (
  SELECT 
    id,
    full_name,
    email,
    role,
    department_id,
    created_at,
    updated_at,
    ROW_NUMBER() OVER (PARTITION BY id ORDER BY updated_at DESC, created_at DESC) as rn
  FROM public.profiles
)
DELETE FROM public.profiles 
WHERE id IN (
  SELECT id FROM ranked_profiles WHERE rn > 1
);

-- 2. Nettoyer les départements en double (garder le plus récent)
WITH ranked_departments AS (
  SELECT 
    id,
    name,
    code,
    created_at,
    updated_at,
    ROW_NUMBER() OVER (PARTITION BY code ORDER BY updated_at DESC, created_at DESC) as rn
  FROM public.departments
)
DELETE FROM public.departments 
WHERE id IN (
  SELECT id FROM ranked_departments WHERE rn > 1
);

-- 3. Vérifier l'état actuel des tables
SELECT 'profiles' as table_name, COUNT(*) as record_count FROM public.profiles
UNION ALL
SELECT 'departments' as table_name, COUNT(*) as record_count FROM public.departments;

-- 4. Afficher les départements actuels
SELECT id, name, code, created_at, updated_at 
FROM public.departments 
ORDER BY code;

-- 5. Afficher les profils actuels
SELECT id, full_name, email, role, department_id, created_at, updated_at 
FROM public.profiles 
ORDER BY created_at DESC;

-- 6. Vérifier les politiques RLS actuelles
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

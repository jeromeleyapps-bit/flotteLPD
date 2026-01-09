-- Script pour corriger les doublons de départements
-- Exécuter ce script dans l'éditeur SQL du tableau de bord Supabase

-- 1. Supprimer tous les départements existants
DELETE FROM public.departments;

-- 2. Insérer les départements corrects sans doublons
INSERT INTO public.departments (id, name, code) VALUES
('11111111-1111-1111-1111-111111111111', 'Alpes-de-Haute-Provence', '04'),
('22222222-2222-2222-2222-222222222222', 'Hautes-Alpes', '05'),
('33333333-3333-3333-3333-333333333333', 'Alpes-Maritimes', '06'),
('44444444-4444-4444-4444-444444444444', 'Bouches-du-Rhône', '13'),
('55555555-5555-5555-5555-555555555555', 'Var', '83'),
('66666666-6666-6666-6666-666666666666', 'Vaucluse', '84');

-- 3. Vérifier le résultat
SELECT * FROM public.departments ORDER BY code;

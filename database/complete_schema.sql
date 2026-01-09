-- Schéma complet de la base de données pour la flotte LPD
-- Exécuter ce script dans l'éditeur SQL du tableau de bord Supabase

-- Tables principales
CREATE TABLE IF NOT EXISTS public.vehicles (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    plate_number VARCHAR(20) NOT NULL UNIQUE,
    brand VARCHAR(100) NOT NULL,
    model VARCHAR(100) NOT NULL,
    year INTEGER NOT NULL,
    type VARCHAR(50) NOT NULL, -- 'voiture', 'utilitaire', 'moto', etc.
    fuel_type VARCHAR(50) NOT NULL, -- 'essence', 'diesel', 'électrique', 'hybride'
    status VARCHAR(20) DEFAULT 'available', -- 'available', 'reserved', 'in_use', 'maintenance', 'out_of_service'
    department_id UUID NOT NULL REFERENCES public.departments(id),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Réservations (booking/bookout)
CREATE TABLE IF NOT EXISTS public.reservations (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    vehicle_id UUID NOT NULL REFERENCES public.vehicles(id),
    user_id UUID NOT NULL REFERENCES public.profiles(id),
    start_date TIMESTAMP WITH TIME ZONE NOT NULL,
    end_date TIMESTAMP WITH TIME ZONE NOT NULL,
    purpose TEXT,
    status VARCHAR(20) DEFAULT 'pending', -- 'pending', 'confirmed', 'active', 'completed', 'cancelled'
    booking_km INTEGER, -- Kilométrage au moment de la réservation
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Trajets
CREATE TABLE IF NOT EXISTS public.trips (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    reservation_id UUID NOT NULL REFERENCES public.reservations(id),
    start_time TIMESTAMP WITH TIME ZONE NOT NULL,
    end_time TIMESTAMP WITH TIME ZONE,
    start_km INTEGER NOT NULL,
    end_km INTEGER,
    departure_location TEXT,
    arrival_location TEXT,
    purpose TEXT,
    status VARCHAR(20) DEFAULT 'in_progress', -- 'in_progress', 'completed'
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Entretien
CREATE TABLE IF NOT EXISTS public.maintenance (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    vehicle_id UUID NOT NULL REFERENCES public.vehicles(id),
    type VARCHAR(50) NOT NULL, -- 'routine', 'repair', 'inspection'
    description TEXT NOT NULL,
    scheduled_date DATE NOT NULL,
    completed_date DATE,
    cost DECIMAL(10,2),
    provider TEXT,
    status VARCHAR(20) DEFAULT 'scheduled', -- 'scheduled', 'in_progress', 'completed', 'cancelled'
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Contrôle Technique (CT)
CREATE TABLE IF NOT EXISTS public.technical_inspections (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    vehicle_id UUID NOT NULL REFERENCES public.vehicles(id),
    inspection_date DATE NOT NULL,
    next_inspection_date DATE NOT NULL,
    result VARCHAR(20) NOT NULL, -- 'favorable', 'defavorable', 'contre_visite'
    details TEXT,
    inspector_name TEXT,
    cost DECIMAL(10,2),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Réparations
CREATE TABLE IF NOT EXISTS public.repairs (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    vehicle_id UUID NOT NULL REFERENCES public.vehicles(id),
    description TEXT NOT NULL,
    reported_date DATE NOT NULL,
    start_date DATE,
    end_date DATE,
    cost DECIMAL(10,2),
    provider TEXT,
    status VARCHAR(20) DEFAULT 'reported', -- 'reported', 'in_progress', 'completed', 'cancelled'
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Kilométrage historique
CREATE TABLE IF NOT EXISTS public.mileage_logs (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    vehicle_id UUID NOT NULL REFERENCES public.vehicles(id),
    user_id UUID NOT NULL REFERENCES public.profiles(id),
    km_value INTEGER NOT NULL,
    recorded_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    context VARCHAR(50), -- 'booking', 'trip_end', 'maintenance', 'inspection'
    notes TEXT
);

-- Index pour optimiser les performances
CREATE INDEX IF NOT EXISTS idx_vehicles_department ON public.vehicles(department_id);
CREATE INDEX IF NOT EXISTS idx_vehicles_status ON public.vehicles(status);
CREATE INDEX IF NOT EXISTS idx_reservations_vehicle ON public.reservations(vehicle_id);
CREATE INDEX IF NOT EXISTS idx_reservations_user ON public.reservations(user_id);
CREATE INDEX IF NOT EXISTS idx_reservations_status ON public.reservations(status);
CREATE INDEX IF NOT EXISTS idx_reservations_dates ON public.reservations(start_date, end_date);
CREATE INDEX IF NOT EXISTS idx_trips_reservation ON public.trips(reservation_id);
CREATE INDEX IF NOT EXISTS idx_maintenance_vehicle ON public.maintenance(vehicle_id);
CREATE INDEX IF NOT EXISTS idx_maintenance_status ON public.maintenance(status);
CREATE INDEX IF NOT EXISTS idx_inspections_vehicle ON public.technical_inspections(vehicle_id);
CREATE INDEX IF NOT EXISTS idx_repairs_vehicle ON public.repairs(vehicle_id);
CREATE INDEX IF NOT EXISTS idx_repairs_status ON public.repairs(status);
CREATE INDEX IF NOT EXISTS idx_mileage_vehicle ON public.mileage_logs(vehicle_id);

-- Activer le RLS sur toutes les tables
ALTER TABLE public.vehicles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.reservations ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.trips ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.maintenance ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.technical_inspections ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.repairs ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.mileage_logs ENABLE ROW LEVEL SECURITY;

-- Politiques RLS pour les véhicules
CREATE POLICY "Les utilisateurs peuvent voir les véhicules de leur département" 
ON public.vehicles
FOR SELECT 
USING (department_id IN (
  SELECT department_id FROM public.profiles WHERE id = auth.uid()
));

CREATE POLICY "Les administrateurs peuvent gérer tous les véhicules" 
ON public.vehicles
FOR ALL 
USING (
  EXISTS (
    SELECT 1 FROM public.profiles 
    WHERE profiles.id = auth.uid() 
    AND profiles.role = 'admin'
  )
);

-- Politiques RLS pour les réservations
CREATE POLICY "Les utilisateurs peuvent voir leurs réservations" 
ON public.reservations
FOR SELECT 
USING (user_id = auth.uid());

CREATE POLICY "Les utilisateurs peuvent créer leurs réservations" 
ON public.reservations
FOR INSERT 
WITH CHECK (user_id = auth.uid());

CREATE POLICY "Les utilisateurs peuvent mettre à jour leurs réservations" 
ON public.reservations
FOR UPDATE 
USING (user_id = auth.uid())
WITH CHECK (user_id = auth.uid());

CREATE POLICY "Les administrateurs peuvent gérer toutes les réservations" 
ON public.reservations
FOR ALL 
USING (
  EXISTS (
    SELECT 1 FROM public.profiles 
    WHERE profiles.id = auth.uid() 
    AND profiles.role = 'admin'
  )
);

-- Politiques RLS pour les trajets
CREATE POLICY "Les utilisateurs peuvent voir leurs trajets" 
ON public.trips
FOR SELECT 
USING (EXISTS (
  SELECT 1 FROM public.reservations 
  WHERE reservations.id = trips.reservation_id 
  AND reservations.user_id = auth.uid()
));

CREATE POLICY "Les utilisateurs peuvent créer leurs trajets" 
ON public.trips
FOR INSERT 
WITH CHECK (EXISTS (
  SELECT 1 FROM public.reservations 
  WHERE reservations.id = trips.reservation_id 
  AND reservations.user_id = auth.uid()
));

-- Politiques RLS pour les autres tables (similaires)
CREATE POLICY "Les utilisateurs peuvent voir l'entretien des véhicules de leur département" 
ON public.maintenance
FOR SELECT 
USING (EXISTS (
  SELECT 1 FROM public.vehicles 
  WHERE vehicles.id = maintenance.vehicle_id 
  AND vehicles.department_id IN (
    SELECT department_id FROM public.profiles WHERE id = auth.uid()
  )
));

CREATE POLICY "Les administrateurs peuvent gérer tout l'entretien" 
ON public.maintenance
FOR ALL 
USING (
  EXISTS (
    SELECT 1 FROM public.profiles 
    WHERE profiles.id = auth.uid() 
    AND profiles.role = 'admin'
  )
);

-- Insérer des données de test pour les véhicules
INSERT INTO public.vehicles (plate_number, brand, model, year, type, fuel_type, department_id) VALUES
('AB-123-CD', 'Renault', 'Clio', 2022, 'voiture', 'essence', '11111111-1111-1111-1111-111111111111'),
('EF-456-GH', 'Peugeot', '308', 2021, 'voiture', 'diesel', '11111111-1111-1111-1111-111111111111'),
('IJ-789-KL', 'Citroën', 'Berlingo', 2020, 'utilitaire', 'diesel', '22222222-2222-2222-2222-222222222222'),
('MN-012-OP', 'Toyota', 'Yaris', 2023, 'voiture', 'hybride', '33333333-3333-3333-3333-333333333333'),
('QR-345-ST', 'Nissan', 'Leaf', 2022, 'voiture', 'électrique', '44444444-4444-4444-4444-444444444444'),
('UV-678-WX', 'Ford', 'Transit', 2021, 'utilitaire', 'diesel', '55555555-5555-5555-5555-555555555555')
ON CONFLICT (plate_number) DO NOTHING;

-- Vérification
SELECT 'vehicles' as table_name, COUNT(*) as record_count FROM public.vehicles
UNION ALL
SELECT 'reservations' as table_name, COUNT(*) as record_count FROM public.reservations
UNION ALL
SELECT 'trips' as table_name, COUNT(*) as record_count FROM public.trips
UNION ALL
SELECT 'maintenance' as table_name, COUNT(*) as record_count FROM public.maintenance
UNION ALL
SELECT 'technical_inspections' as table_name, COUNT(*) as record_count FROM public.technical_inspections
UNION ALL
SELECT 'repairs' as table_name, COUNT(*) as record_count FROM public.repairs
UNION ALL
SELECT 'mileage_logs' as table_name, COUNT(*) as record_count FROM public.mileage_logs;

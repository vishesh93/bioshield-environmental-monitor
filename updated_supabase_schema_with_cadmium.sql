-- Updated Supabase Schema for Water Pollution Dashboard
-- This includes CADMIUM as requested

-- 1️⃣ Create monitoring_stations table
CREATE TABLE IF NOT EXISTS monitoring_stations (
    id SERIAL PRIMARY KEY,
    name TEXT NOT NULL,
    lat NUMERIC NOT NULL,
    lng NUMERIC NOT NULL,
    description TEXT,
    created_at TIMESTAMP DEFAULT NOW()
);

-- 2️⃣ Create water_data table (UPDATED with cadmium)
CREATE TABLE IF NOT EXISTS water_data (
    id SERIAL PRIMARY KEY,
    station_id INT REFERENCES monitoring_stations(id) ON DELETE CASCADE,
    ph NUMERIC,
    turbidity NUMERIC,
    lead NUMERIC,
    mercury NUMERIC,
    arsenic NUMERIC,
    cadmium NUMERIC,
    hmpi NUMERIC,
    created_at TIMESTAMP DEFAULT NOW()
);

-- 3️⃣ Create alerts table
CREATE TABLE IF NOT EXISTS alerts (
    id SERIAL PRIMARY KEY,
    station_id INT REFERENCES monitoring_stations(id) ON DELETE CASCADE,
    parameter TEXT NOT NULL,
    value NUMERIC NOT NULL,
    message TEXT NOT NULL,
    created_at TIMESTAMP DEFAULT NOW()
);

-- 4️⃣ Insert sample data into monitoring_stations
INSERT INTO monitoring_stations (name, lat, lng, description)
VALUES
('Ganga Monitoring Point 1', 25.4683, 81.8546, 'Main river station near city'),
('Ganga Monitoring Point 2', 29.8703, 77.6495, 'Industrial area station'),
('Yamuna River - Delhi', 28.6139, 77.2090, 'Delhi monitoring station'),
('Hooghly River - Kolkata', 22.5726, 88.3639, 'Kolkata monitoring station'),
('Godavari River - Nashik', 19.9975, 73.7898, 'Nashik monitoring station'),
('Kaveri River - Bangalore', 12.9716, 77.5946, 'Bangalore monitoring station')
ON CONFLICT DO NOTHING;

-- 5️⃣ Insert sample data into water_data (UPDATED with cadmium values)
INSERT INTO water_data (station_id, ph, turbidity, lead, mercury, arsenic, cadmium, hmpi)
VALUES
(1, 7.1, 2.5, 0.2, 0.01, 0.04, 0.08, 0.35),
(2, 6.8, 3.1, 0.3, 0.02, 0.05, 0.12, 0.45),
(3, 6.9, 2.8, 0.85, 0.12, 0.15, 0.25, 0.65),
(4, 7.0, 3.2, 0.35, 0.06, 0.09, 0.15, 0.48),
(5, 7.2, 1.8, 0.12, 0.02, 0.03, 0.05, 0.25),
(6, 7.1, 2.1, 0.18, 0.03, 0.04, 0.09, 0.32)
ON CONFLICT DO NOTHING;

-- 6️⃣ Insert sample data into alerts (UPDATED with cadmium alerts)
INSERT INTO alerts (station_id, parameter, value, message)
VALUES
(2, 'Lead', 0.3, 'Lead concentration high at Station 2!'),
(1, 'Arsenic', 0.04, 'Arsenic level near safe limit.'),
(3, 'Lead', 0.85, 'Lead levels exceed safe limits by 70%. Immediate action required.'),
(3, 'Mercury', 0.12, 'Mercury levels above threshold.'),
(4, 'Mercury', 0.06, 'Mercury levels approaching caution threshold.'),
(4, 'Arsenic', 0.09, 'Arsenic levels showing upward trend.'),
(3, 'Cadmium', 0.25, 'Cadmium levels exceed safe limits!'),
(2, 'Cadmium', 0.12, 'Cadmium levels approaching caution threshold.')
ON CONFLICT DO NOTHING;

-- 7️⃣ Disable RLS for development
ALTER TABLE monitoring_stations DISABLE ROW LEVEL SECURITY;
ALTER TABLE water_data DISABLE ROW LEVEL SECURITY;
ALTER TABLE alerts DISABLE ROW LEVEL SECURITY;

-- 8️⃣ Grant permissions
GRANT SELECT ON monitoring_stations TO anon;
GRANT SELECT ON water_data TO anon;
GRANT SELECT ON alerts TO anon;
GRANT SELECT ON monitoring_stations TO authenticated;
GRANT SELECT ON water_data TO authenticated;
GRANT SELECT ON alerts TO authenticated;





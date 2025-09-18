-- Large Water Pollution Database for BioShield Dashboard
-- Comprehensive dataset with 50+ monitoring stations across India

-- 1️⃣ Create monitoring_stations table
CREATE TABLE IF NOT EXISTS monitoring_stations (
    id SERIAL PRIMARY KEY,
    name TEXT NOT NULL,
    lat NUMERIC NOT NULL,
    lng NUMERIC NOT NULL,
    description TEXT,
    created_at TIMESTAMP DEFAULT NOW()
);

-- 2️⃣ Create water_data table with cadmium
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

-- 4️⃣ Insert 50+ monitoring stations across India
INSERT INTO monitoring_stations (name, lat, lng, description)
VALUES
-- Ganga River Basin
('Ganga - Rishikesh', 30.0869, 78.2676, 'Upper Ganga - Himalayan foothills'),
('Ganga - Haridwar', 29.9457, 78.1642, 'Sacred city monitoring point'),
('Ganga - Kanpur', 26.4499, 80.3319, 'Industrial city - heavy pollution'),
('Ganga - Allahabad', 25.4358, 81.8463, 'Confluence of Ganga and Yamuna'),
('Ganga - Varanasi', 25.3176, 82.9739, 'Spiritual city - high tourist impact'),
('Ganga - Patna', 25.5941, 85.1376, 'State capital monitoring'),
('Ganga - Kolkata', 22.5726, 88.3639, 'Delta region - final stretch'),

-- Yamuna River Basin
('Yamuna - Yamunotri', 31.0130, 78.4540, 'Source of Yamuna River'),
('Yamuna - Delhi - Wazirabad', 28.7135, 77.2234, 'Delhi entry point'),
('Yamuna - Delhi - Okhla', 28.5600, 77.2800, 'Delhi exit point - highly polluted'),
('Yamuna - Agra', 27.1767, 78.0081, 'Near Taj Mahal - tourism impact'),
('Yamuna - Mathura', 27.4924, 77.6737, 'Religious city monitoring'),
('Yamuna - Etawah', 26.7570, 79.0214, 'Agricultural region'),

-- Godavari River Basin
('Godavari - Nashik', 19.9975, 73.7898, 'Source region - Trimbakeshwar'),
('Godavari - Aurangabad', 19.8762, 75.3433, 'Historical city monitoring'),
('Godavari - Nanded', 19.1383, 77.3210, 'Religious significance'),
('Godavari - Rajahmundry', 17.0005, 81.8040, 'Delta region monitoring'),

-- Krishna River Basin
('Krishna - Mahabaleshwar', 17.9249, 73.6576, 'Source of Krishna River'),
('Krishna - Sangli', 16.8524, 74.5815, 'Agricultural monitoring'),
('Krishna - Vijayawada', 16.5062, 80.6480, 'Major city monitoring'),
('Krishna - Hyderabad', 17.3850, 78.4867, 'Metropolitan monitoring'),

-- Kaveri River Basin
('Kaveri - Talakaveri', 12.3867, 75.5200, 'Source of Kaveri River'),
('Kaveri - Mysore', 12.2958, 76.6394, 'Royal city monitoring'),
('Kaveri - Bangalore', 12.9716, 77.5946, 'IT hub monitoring'),
('Kaveri - Srirangapatna', 12.4186, 76.6944, 'Historical monitoring'),
('Kaveri - Trichy', 10.7905, 78.7047, 'Temple city monitoring'),
('Kaveri - Thanjavur', 10.7870, 79.1378, 'Cultural heritage monitoring'),

-- Narmada River Basin
('Narmada - Amarkantak', 22.6749, 81.7551, 'Source of Narmada River'),
('Narmada - Jabalpur', 23.1815, 79.9864, 'Major city monitoring'),
('Narmada - Bhopal', 23.2599, 77.4126, 'State capital monitoring'),
('Narmada - Indore', 22.7196, 75.8577, 'Commercial hub monitoring'),
('Narmada - Bharuch', 21.7051, 72.9959, 'Industrial monitoring'),

-- Tapi River Basin
('Tapi - Multai', 21.7742, 78.2549, 'Source of Tapi River'),
('Tapi - Surat', 21.1702, 72.8311, 'Industrial city monitoring'),

-- Sabarmati River Basin
('Sabarmati - Ahmedabad', 23.0225, 72.5714, 'Gujarat capital monitoring'),

-- Brahmaputra River Basin
('Brahmaputra - Guwahati', 26.1445, 91.7362, 'Assam capital monitoring'),
('Brahmaputra - Dibrugarh', 27.4728, 94.9120, 'Upper Assam monitoring'),

-- Coastal Monitoring Stations
('Arabian Sea - Mumbai', 19.0760, 72.8777, 'Mumbai coastal monitoring'),
('Arabian Sea - Goa', 15.2993, 74.1240, 'Goa beach monitoring'),
('Bay of Bengal - Chennai', 13.0827, 80.2707, 'Chennai coastal monitoring'),
('Bay of Bengal - Puri', 19.8134, 85.8312, 'Odisha coastal monitoring'),

-- Lake Monitoring Stations
('Dal Lake - Srinagar', 34.1248, 74.8445, 'Kashmir lake monitoring'),
('Chilika Lake - Odisha', 19.6950, 85.3185, 'Largest brackish water lake'),
('Vembanad Lake - Kerala', 9.4981, 76.3388, 'Backwater monitoring'),
('Pulicat Lake - Tamil Nadu', 13.4141, 80.1777, 'Coastal lagoon monitoring'),

-- Industrial Monitoring
('Industrial Zone - Jamshedpur', 22.8046, 86.2029, 'Steel city monitoring'),
('Industrial Zone - Durgapur', 23.5204, 87.3119, 'Steel plant monitoring'),
('Industrial Zone - Bhilai', 21.1938, 81.3509, 'Steel city monitoring'),
('Industrial Zone - Rourkela', 22.2604, 84.8536, 'Steel plant monitoring'),

-- Mining Areas
('Mining Area - Jharia', 23.7451, 86.4140, 'Coal mining region'),
('Mining Area - Singrauli', 24.1996, 82.6752, 'Coal mining region'),
('Mining Area - Korba', 22.3458, 82.6963, 'Coal mining region'),

-- Agricultural Regions
('Agricultural Zone - Ludhiana', 30.9010, 75.8573, 'Punjab agricultural monitoring'),
('Agricultural Zone - Indore', 22.7196, 75.8577, 'MP agricultural monitoring'),
('Agricultural Zone - Coimbatore', 11.0168, 76.9558, 'Tamil Nadu agricultural monitoring')
ON CONFLICT DO NOTHING;

-- 5️⃣ Insert comprehensive water data with realistic pollution patterns
INSERT INTO water_data (station_id, ph, turbidity, lead, mercury, arsenic, cadmium, hmpi)
VALUES
-- Ganga Basin - High pollution in industrial areas
(1, 7.2, 1.5, 0.08, 0.01, 0.02, 0.03, 0.15), -- Rishikesh - Clean
(2, 7.0, 2.1, 0.12, 0.02, 0.03, 0.05, 0.22), -- Haridwar - Moderate
(3, 6.5, 4.2, 0.65, 0.15, 0.18, 0.28, 0.75), -- Kanpur - High pollution
(4, 6.8, 3.8, 0.45, 0.12, 0.15, 0.22, 0.65), -- Allahabad - High pollution
(5, 6.9, 3.5, 0.38, 0.10, 0.12, 0.18, 0.58), -- Varanasi - High pollution
(6, 6.7, 3.2, 0.32, 0.08, 0.10, 0.15, 0.52), -- Patna - Moderate-High
(7, 6.8, 2.8, 0.25, 0.06, 0.08, 0.12, 0.42), -- Kolkata - Moderate

-- Yamuna Basin - Extremely polluted in Delhi
(8, 7.1, 1.2, 0.05, 0.01, 0.02, 0.02, 0.12), -- Yamunotri - Clean
(9, 6.2, 5.8, 0.95, 0.25, 0.35, 0.45, 0.95), -- Delhi Wazirabad - Critical
(10, 5.8, 6.5, 1.2, 0.35, 0.45, 0.55, 1.1), -- Delhi Okhla - Critical
(11, 6.4, 4.5, 0.55, 0.18, 0.25, 0.32, 0.68), -- Agra - High pollution
(12, 6.6, 3.8, 0.42, 0.15, 0.20, 0.28, 0.58), -- Mathura - High pollution
(13, 6.8, 2.5, 0.25, 0.08, 0.12, 0.15, 0.35), -- Etawah - Moderate

-- Godavari Basin - Generally cleaner
(14, 7.3, 1.8, 0.08, 0.02, 0.03, 0.04, 0.18), -- Nashik - Clean
(15, 7.1, 2.2, 0.15, 0.04, 0.05, 0.08, 0.25), -- Aurangabad - Clean-Moderate
(16, 6.9, 2.8, 0.22, 0.06, 0.08, 0.12, 0.32), -- Nanded - Moderate
(17, 6.7, 3.2, 0.35, 0.10, 0.15, 0.20, 0.45), -- Rajahmundry - Moderate-High

-- Krishna Basin - Mixed pollution levels
(18, 7.2, 1.6, 0.06, 0.02, 0.03, 0.04, 0.16), -- Mahabaleshwar - Clean
(19, 6.8, 2.5, 0.20, 0.05, 0.08, 0.10, 0.28), -- Sangli - Moderate
(20, 6.5, 3.5, 0.45, 0.12, 0.18, 0.25, 0.55), -- Vijayawada - High pollution
(21, 6.6, 3.2, 0.38, 0.10, 0.15, 0.22, 0.48), -- Hyderabad - High pollution

-- Kaveri Basin - Generally clean to moderate
(22, 7.4, 1.4, 0.05, 0.01, 0.02, 0.03, 0.12), -- Talakaveri - Clean
(23, 7.2, 1.8, 0.08, 0.02, 0.03, 0.05, 0.15), -- Mysore - Clean
(24, 6.9, 2.8, 0.25, 0.08, 0.12, 0.15, 0.35), -- Bangalore - Moderate
(25, 7.0, 2.2, 0.15, 0.04, 0.06, 0.08, 0.22), -- Srirangapatna - Clean-Moderate
(26, 6.8, 2.5, 0.18, 0.05, 0.08, 0.10, 0.28), -- Trichy - Moderate
(27, 6.9, 2.3, 0.12, 0.03, 0.05, 0.06, 0.20), -- Thanjavur - Clean-Moderate

-- Narmada Basin - Clean to moderate
(28, 7.3, 1.5, 0.06, 0.02, 0.03, 0.04, 0.14), -- Amarkantak - Clean
(29, 6.9, 2.2, 0.15, 0.04, 0.06, 0.08, 0.25), -- Jabalpur - Clean-Moderate
(30, 6.8, 2.5, 0.18, 0.05, 0.08, 0.10, 0.28), -- Bhopal - Moderate
(31, 6.7, 2.8, 0.22, 0.06, 0.10, 0.12, 0.32), -- Indore - Moderate
(32, 6.5, 3.2, 0.35, 0.12, 0.18, 0.25, 0.48), -- Bharuch - High pollution

-- Tapi Basin
(33, 7.1, 2.0, 0.12, 0.03, 0.05, 0.06, 0.18), -- Multai - Clean-Moderate
(34, 6.4, 4.0, 0.55, 0.18, 0.25, 0.32, 0.65), -- Surat - High pollution

-- Sabarmati Basin
(35, 6.3, 4.5, 0.65, 0.20, 0.30, 0.38, 0.75), -- Ahmedabad - High pollution

-- Brahmaputra Basin
(36, 6.8, 2.8, 0.25, 0.08, 0.12, 0.15, 0.35), -- Guwahati - Moderate
(37, 7.0, 2.2, 0.15, 0.04, 0.06, 0.08, 0.22), -- Dibrugarh - Clean-Moderate

-- Coastal Monitoring
(38, 6.6, 3.5, 0.45, 0.15, 0.20, 0.28, 0.55), -- Mumbai - High pollution
(39, 7.1, 2.2, 0.18, 0.05, 0.08, 0.10, 0.25), -- Goa - Clean-Moderate
(40, 6.8, 3.0, 0.32, 0.10, 0.15, 0.18, 0.42), -- Chennai - Moderate-High
(41, 6.9, 2.5, 0.22, 0.06, 0.10, 0.12, 0.30), -- Puri - Moderate

-- Lake Monitoring
(42, 6.7, 2.8, 0.25, 0.08, 0.12, 0.15, 0.35), -- Dal Lake - Moderate
(43, 7.2, 2.0, 0.15, 0.04, 0.06, 0.08, 0.22), -- Chilika Lake - Clean-Moderate
(44, 6.9, 2.3, 0.18, 0.05, 0.08, 0.10, 0.25), -- Vembanad Lake - Clean-Moderate
(45, 6.8, 2.5, 0.20, 0.06, 0.10, 0.12, 0.28), -- Pulicat Lake - Moderate

-- Industrial Zones - High pollution
(46, 6.2, 4.8, 0.85, 0.25, 0.35, 0.45, 0.90), -- Jamshedpur - Critical
(47, 6.1, 5.2, 0.95, 0.30, 0.40, 0.50, 1.0), -- Durgapur - Critical
(48, 6.3, 4.5, 0.75, 0.22, 0.32, 0.40, 0.85), -- Bhilai - Critical
(49, 6.0, 5.5, 1.1, 0.35, 0.45, 0.55, 1.1), -- Rourkela - Critical

-- Mining Areas - Very high pollution
(50, 5.8, 6.0, 1.2, 0.40, 0.50, 0.60, 1.2), -- Jharia - Critical
(51, 5.9, 5.8, 1.1, 0.38, 0.48, 0.58, 1.15), -- Singrauli - Critical
(52, 6.0, 5.5, 1.0, 0.35, 0.45, 0.55, 1.05), -- Korba - Critical

-- Agricultural Zones - Moderate pollution
(53, 6.8, 2.8, 0.25, 0.08, 0.12, 0.15, 0.35), -- Ludhiana - Moderate
(54, 6.7, 3.0, 0.28, 0.09, 0.14, 0.18, 0.38), -- Indore - Moderate
(55, 6.9, 2.5, 0.22, 0.07, 0.10, 0.12, 0.30) -- Coimbatore - Moderate
ON CONFLICT DO NOTHING;

-- 6️⃣ Insert comprehensive alerts based on pollution levels
INSERT INTO alerts (station_id, parameter, value, message)
VALUES
-- Critical alerts for highly polluted stations
(3, 'Lead', 0.65, 'CRITICAL: Lead levels 225% above safe limits in Kanpur!'),
(3, 'Mercury', 0.15, 'CRITICAL: Mercury levels 200% above safe limits!'),
(3, 'Arsenic', 0.18, 'CRITICAL: Arsenic levels 260% above safe limits!'),
(3, 'Cadmium', 0.28, 'CRITICAL: Cadmium levels 180% above safe limits!'),

(9, 'Lead', 0.95, 'CRITICAL: Lead levels 375% above safe limits in Delhi!'),
(9, 'Mercury', 0.25, 'CRITICAL: Mercury levels 400% above safe limits!'),
(9, 'Arsenic', 0.35, 'CRITICAL: Arsenic levels 600% above safe limits!'),
(9, 'Cadmium', 0.45, 'CRITICAL: Cadmium levels 350% above safe limits!'),

(10, 'Lead', 1.2, 'CRITICAL: Lead levels 500% above safe limits in Delhi!'),
(10, 'Mercury', 0.35, 'CRITICAL: Mercury levels 600% above safe limits!'),
(10, 'Arsenic', 0.45, 'CRITICAL: Arsenic levels 800% above safe limits!'),
(10, 'Cadmium', 0.55, 'CRITICAL: Cadmium levels 450% above safe limits!'),

-- Industrial zone critical alerts
(46, 'Lead', 0.85, 'CRITICAL: Industrial pollution - Lead levels 325% above safe limits!'),
(46, 'Mercury', 0.25, 'CRITICAL: Industrial pollution - Mercury levels 400% above safe limits!'),
(47, 'Lead', 0.95, 'CRITICAL: Steel plant pollution - Lead levels 375% above safe limits!'),
(47, 'Arsenic', 0.40, 'CRITICAL: Steel plant pollution - Arsenic levels 700% above safe limits!'),
(48, 'Lead', 0.75, 'CRITICAL: Steel plant pollution - Lead levels 275% above safe limits!'),
(49, 'Lead', 1.1, 'CRITICAL: Steel plant pollution - Lead levels 450% above safe limits!'),

-- Mining area critical alerts
(50, 'Lead', 1.2, 'CRITICAL: Mining pollution - Lead levels 500% above safe limits!'),
(50, 'Mercury', 0.40, 'CRITICAL: Mining pollution - Mercury levels 700% above safe limits!'),
(50, 'Arsenic', 0.50, 'CRITICAL: Mining pollution - Arsenic levels 900% above safe limits!'),
(50, 'Cadmium', 0.60, 'CRITICAL: Mining pollution - Cadmium levels 500% above safe limits!'),

(51, 'Lead', 1.1, 'CRITICAL: Coal mining pollution - Lead levels 450% above safe limits!'),
(51, 'Mercury', 0.38, 'CRITICAL: Coal mining pollution - Mercury levels 660% above safe limits!'),
(52, 'Lead', 1.0, 'CRITICAL: Coal mining pollution - Lead levels 400% above safe limits!'),

-- High pollution warnings
(4, 'Lead', 0.45, 'WARNING: Lead levels 125% above safe limits in Allahabad!'),
(4, 'Mercury', 0.12, 'WARNING: Mercury levels 140% above safe limits!'),
(5, 'Lead', 0.38, 'WARNING: Lead levels 90% above safe limits in Varanasi!'),
(5, 'Arsenic', 0.12, 'WARNING: Arsenic levels 140% above safe limits!'),
(11, 'Lead', 0.55, 'WARNING: Lead levels 175% above safe limits in Agra!'),
(11, 'Mercury', 0.18, 'WARNING: Mercury levels 260% above safe limits!'),
(20, 'Lead', 0.45, 'WARNING: Lead levels 125% above safe limits in Vijayawada!'),
(21, 'Lead', 0.38, 'WARNING: Lead levels 90% above safe limits in Hyderabad!'),
(32, 'Lead', 0.35, 'WARNING: Lead levels 75% above safe limits in Bharuch!'),
(34, 'Lead', 0.55, 'WARNING: Lead levels 175% above safe limits in Surat!'),
(35, 'Lead', 0.65, 'WARNING: Lead levels 225% above safe limits in Ahmedabad!'),

-- Moderate pollution alerts
(6, 'Lead', 0.32, 'CAUTION: Lead levels 60% above safe limits in Patna!'),
(7, 'Lead', 0.25, 'CAUTION: Lead levels 25% above safe limits in Kolkata!'),
(12, 'Lead', 0.42, 'CAUTION: Lead levels 110% above safe limits in Mathura!'),
(13, 'Lead', 0.25, 'CAUTION: Lead levels 25% above safe limits in Etawah!'),
(17, 'Lead', 0.35, 'CAUTION: Lead levels 75% above safe limits in Rajahmundry!'),
(24, 'Lead', 0.25, 'CAUTION: Lead levels 25% above safe limits in Bangalore!'),
(30, 'Lead', 0.18, 'CAUTION: Lead levels approaching safe limits in Bhopal!'),
(31, 'Lead', 0.22, 'CAUTION: Lead levels 10% above safe limits in Indore!'),
(38, 'Lead', 0.45, 'CAUTION: Lead levels 125% above safe limits in Mumbai!'),
(40, 'Lead', 0.32, 'CAUTION: Lead levels 60% above safe limits in Chennai!'),
(42, 'Lead', 0.25, 'CAUTION: Lead levels 25% above safe limits in Dal Lake!'),
(53, 'Lead', 0.25, 'CAUTION: Lead levels 25% above safe limits in Ludhiana!'),
(54, 'Lead', 0.28, 'CAUTION: Lead levels 40% above safe limits in Indore!'),
(55, 'Lead', 0.22, 'CAUTION: Lead levels 10% above safe limits in Coimbatore!'),

-- Cadmium specific alerts
(3, 'Cadmium', 0.28, 'WARNING: Cadmium levels 180% above safe limits in Kanpur!'),
(9, 'Cadmium', 0.45, 'CRITICAL: Cadmium levels 350% above safe limits in Delhi!'),
(10, 'Cadmium', 0.55, 'CRITICAL: Cadmium levels 450% above safe limits in Delhi!'),
(20, 'Cadmium', 0.25, 'WARNING: Cadmium levels 150% above safe limits in Vijayawada!'),
(21, 'Cadmium', 0.22, 'WARNING: Cadmium levels 120% above safe limits in Hyderabad!'),
(32, 'Cadmium', 0.25, 'WARNING: Cadmium levels 150% above safe limits in Bharuch!'),
(34, 'Cadmium', 0.32, 'WARNING: Cadmium levels 220% above safe limits in Surat!'),
(35, 'Cadmium', 0.38, 'WARNING: Cadmium levels 280% above safe limits in Ahmedabad!'),
(46, 'Cadmium', 0.45, 'CRITICAL: Industrial cadmium pollution - 350% above safe limits!'),
(50, 'Cadmium', 0.60, 'CRITICAL: Mining cadmium pollution - 500% above safe limits!'),

-- pH level alerts
(3, 'pH', 6.5, 'WARNING: Low pH levels detected in Kanpur - acidic water!'),
(9, 'pH', 6.2, 'WARNING: Low pH levels detected in Delhi - acidic water!'),
(10, 'pH', 5.8, 'CRITICAL: Very low pH levels in Delhi - highly acidic water!'),
(46, 'pH', 6.2, 'WARNING: Low pH levels detected in Jamshedpur - acidic water!'),
(50, 'pH', 5.8, 'CRITICAL: Very low pH levels in Jharia - highly acidic water!'),
(51, 'pH', 5.9, 'CRITICAL: Very low pH levels in Singrauli - highly acidic water!'),
(52, 'pH', 6.0, 'CRITICAL: Very low pH levels in Korba - highly acidic water!')
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

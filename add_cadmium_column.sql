-- Add cadmium column to existing water_data table
-- Run this FIRST before the main schema script

-- 1️⃣ Add cadmium column to water_data table
ALTER TABLE water_data ADD COLUMN IF NOT EXISTS cadmium NUMERIC;

-- 2️⃣ Update existing records with cadmium values
UPDATE water_data SET cadmium = 0.08 WHERE id = 1;
UPDATE water_data SET cadmium = 0.12 WHERE id = 2;

-- 3️⃣ Insert new sample data with cadmium
INSERT INTO water_data (station_id, ph, turbidity, lead, mercury, arsenic, cadmium, hmpi)
VALUES
(3, 6.9, 2.8, 0.85, 0.12, 0.15, 0.25, 0.65),
(4, 7.0, 3.2, 0.35, 0.06, 0.09, 0.15, 0.48),
(5, 7.2, 1.8, 0.12, 0.02, 0.03, 0.05, 0.25),
(6, 7.1, 2.1, 0.18, 0.03, 0.04, 0.09, 0.32)
ON CONFLICT DO NOTHING;

-- 4️⃣ Insert cadmium alerts
INSERT INTO alerts (station_id, parameter, value, message)
VALUES
(3, 'Cadmium', 0.25, 'Cadmium levels exceed safe limits!'),
(2, 'Cadmium', 0.12, 'Cadmium levels approaching caution threshold.')
ON CONFLICT DO NOTHING;





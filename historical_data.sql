-- Historical Water Data for Analytics
-- This adds 90 days of historical data for trend analysis

-- Insert historical data for the last 90 days
-- This creates realistic pollution patterns with seasonal variations

INSERT INTO water_data (station_id, ph, turbidity, lead, mercury, arsenic, cadmium, hmpi, created_at)
SELECT 
    station_id,
    -- pH varies slightly around base values
    base_ph + (RANDOM() - 0.5) * 0.4,
    -- Turbidity varies more significantly
    base_turbidity + (RANDOM() - 0.5) * 1.0,
    -- Heavy metals vary with pollution levels
    base_lead + (RANDOM() - 0.5) * base_lead * 0.3,
    base_mercury + (RANDOM() - 0.5) * base_mercury * 0.3,
    base_arsenic + (RANDOM() - 0.5) * base_arsenic * 0.3,
    base_cadmium + (RANDOM() - 0.5) * base_cadmium * 0.3,
    -- HMPI calculated from other parameters
    base_hmpi + (RANDOM() - 0.5) * base_hmpi * 0.2,
    -- Date from 90 days ago to now
    NOW() - INTERVAL '90 days' + (RANDOM() * INTERVAL '90 days')
FROM (
    -- Base values for each station
    SELECT 1 as station_id, 7.2 as base_ph, 1.5 as base_turbidity, 0.08 as base_lead, 0.01 as base_mercury, 0.02 as base_arsenic, 0.03 as base_cadmium, 0.15 as base_hmpi
    UNION ALL SELECT 2, 7.0, 2.1, 0.12, 0.02, 0.03, 0.05, 0.22
    UNION ALL SELECT 3, 6.5, 4.2, 0.65, 0.15, 0.18, 0.28, 0.75
    UNION ALL SELECT 4, 6.8, 3.8, 0.45, 0.12, 0.15, 0.22, 0.65
    UNION ALL SELECT 5, 6.9, 3.5, 0.38, 0.10, 0.12, 0.18, 0.58
    UNION ALL SELECT 6, 6.7, 3.2, 0.32, 0.08, 0.10, 0.15, 0.52
    UNION ALL SELECT 7, 6.8, 2.8, 0.25, 0.06, 0.08, 0.12, 0.42
    UNION ALL SELECT 8, 7.1, 1.2, 0.05, 0.01, 0.02, 0.02, 0.12
    UNION ALL SELECT 9, 6.2, 5.8, 0.95, 0.25, 0.35, 0.45, 0.95
    UNION ALL SELECT 10, 5.8, 6.5, 1.2, 0.35, 0.45, 0.55, 1.1
    UNION ALL SELECT 11, 6.4, 4.5, 0.55, 0.18, 0.25, 0.32, 0.68
    UNION ALL SELECT 12, 6.6, 3.8, 0.42, 0.15, 0.20, 0.28, 0.58
    UNION ALL SELECT 13, 6.8, 2.5, 0.25, 0.08, 0.12, 0.15, 0.35
    UNION ALL SELECT 14, 7.3, 1.8, 0.08, 0.02, 0.03, 0.04, 0.18
    UNION ALL SELECT 15, 7.1, 2.2, 0.15, 0.04, 0.05, 0.08, 0.25
    UNION ALL SELECT 16, 6.9, 2.8, 0.22, 0.06, 0.08, 0.12, 0.32
    UNION ALL SELECT 17, 6.7, 3.2, 0.35, 0.10, 0.15, 0.20, 0.45
    UNION ALL SELECT 18, 7.2, 1.6, 0.06, 0.02, 0.03, 0.04, 0.16
    UNION ALL SELECT 19, 6.8, 2.5, 0.20, 0.05, 0.08, 0.10, 0.28
    UNION ALL SELECT 20, 6.5, 3.5, 0.45, 0.12, 0.18, 0.25, 0.55
    UNION ALL SELECT 21, 6.6, 3.2, 0.38, 0.10, 0.15, 0.22, 0.48
    UNION ALL SELECT 22, 7.4, 1.4, 0.05, 0.01, 0.02, 0.03, 0.12
    UNION ALL SELECT 23, 7.2, 1.8, 0.08, 0.02, 0.03, 0.05, 0.15
    UNION ALL SELECT 24, 6.9, 2.8, 0.25, 0.08, 0.12, 0.15, 0.35
    UNION ALL SELECT 25, 7.0, 2.2, 0.15, 0.04, 0.06, 0.08, 0.22
    UNION ALL SELECT 26, 6.8, 2.5, 0.18, 0.05, 0.08, 0.10, 0.28
    UNION ALL SELECT 27, 6.9, 2.3, 0.12, 0.03, 0.05, 0.06, 0.20
    UNION ALL SELECT 28, 7.3, 1.5, 0.06, 0.02, 0.03, 0.04, 0.14
    UNION ALL SELECT 29, 6.9, 2.2, 0.15, 0.04, 0.06, 0.08, 0.25
    UNION ALL SELECT 30, 6.8, 2.5, 0.18, 0.05, 0.08, 0.10, 0.28
    UNION ALL SELECT 31, 6.7, 2.8, 0.22, 0.06, 0.10, 0.12, 0.32
    UNION ALL SELECT 32, 6.5, 3.2, 0.35, 0.12, 0.18, 0.25, 0.48
    UNION ALL SELECT 33, 7.1, 2.0, 0.12, 0.03, 0.05, 0.06, 0.18
    UNION ALL SELECT 34, 6.4, 4.0, 0.55, 0.18, 0.25, 0.32, 0.65
    UNION ALL SELECT 35, 6.3, 4.5, 0.65, 0.20, 0.30, 0.38, 0.75
    UNION ALL SELECT 36, 6.8, 2.8, 0.25, 0.08, 0.12, 0.15, 0.35
    UNION ALL SELECT 37, 7.0, 2.2, 0.15, 0.04, 0.06, 0.08, 0.22
    UNION ALL SELECT 38, 6.6, 3.5, 0.45, 0.15, 0.20, 0.28, 0.55
    UNION ALL SELECT 39, 7.1, 2.2, 0.18, 0.05, 0.08, 0.10, 0.25
    UNION ALL SELECT 40, 6.8, 3.0, 0.32, 0.10, 0.15, 0.18, 0.42
    UNION ALL SELECT 41, 6.9, 2.5, 0.22, 0.06, 0.10, 0.12, 0.30
    UNION ALL SELECT 42, 6.7, 2.8, 0.25, 0.08, 0.12, 0.15, 0.35
    UNION ALL SELECT 43, 7.2, 2.0, 0.15, 0.04, 0.06, 0.08, 0.22
    UNION ALL SELECT 44, 6.9, 2.3, 0.18, 0.05, 0.08, 0.10, 0.25
    UNION ALL SELECT 45, 6.8, 2.5, 0.20, 0.06, 0.10, 0.12, 0.28
    UNION ALL SELECT 46, 6.2, 4.8, 0.85, 0.25, 0.35, 0.45, 0.90
    UNION ALL SELECT 47, 6.1, 5.2, 0.95, 0.30, 0.40, 0.50, 1.0
    UNION ALL SELECT 48, 6.3, 4.5, 0.75, 0.22, 0.32, 0.40, 0.85
    UNION ALL SELECT 49, 6.0, 5.5, 1.1, 0.35, 0.45, 0.55, 1.1
    UNION ALL SELECT 50, 5.8, 6.0, 1.2, 0.40, 0.50, 0.60, 1.2
    UNION ALL SELECT 51, 5.9, 5.8, 1.1, 0.38, 0.48, 0.58, 1.15
    UNION ALL SELECT 52, 6.0, 5.5, 1.0, 0.35, 0.45, 0.55, 1.05
    UNION ALL SELECT 53, 6.8, 2.8, 0.25, 0.08, 0.12, 0.15, 0.35
    UNION ALL SELECT 54, 6.7, 3.0, 0.28, 0.09, 0.14, 0.18, 0.38
    UNION ALL SELECT 55, 6.9, 2.5, 0.22, 0.07, 0.10, 0.12, 0.30
) base_data
CROSS JOIN generate_series(1, 90) as day_offset;

-- Add some seasonal variation to make the data more realistic
-- Winter months (Dec-Feb) tend to have higher pollution due to temperature inversion
-- Monsoon months (Jun-Sep) tend to have lower pollution due to dilution

UPDATE water_data 
SET 
    lead = lead * CASE 
        WHEN EXTRACT(MONTH FROM created_at) IN (12, 1, 2) THEN 1.2  -- Winter increase
        WHEN EXTRACT(MONTH FROM created_at) IN (6, 7, 8, 9) THEN 0.8  -- Monsoon decrease
        ELSE 1.0 
    END,
    mercury = mercury * CASE 
        WHEN EXTRACT(MONTH FROM created_at) IN (12, 1, 2) THEN 1.2
        WHEN EXTRACT(MONTH FROM created_at) IN (6, 7, 8, 9) THEN 0.8
        ELSE 1.0 
    END,
    arsenic = arsenic * CASE 
        WHEN EXTRACT(MONTH FROM created_at) IN (12, 1, 2) THEN 1.2
        WHEN EXTRACT(MONTH FROM created_at) IN (6, 7, 8, 9) THEN 0.8
        ELSE 1.0 
    END,
    cadmium = cadmium * CASE 
        WHEN EXTRACT(MONTH FROM created_at) IN (12, 1, 2) THEN 1.2
        WHEN EXTRACT(MONTH FROM created_at) IN (6, 7, 8, 9) THEN 0.8
        ELSE 1.0 
    END
WHERE created_at < NOW() - INTERVAL '1 day';





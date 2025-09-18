-- Complete Supabase Fix Script
-- Run this in your Supabase SQL Editor

-- 1. Disable RLS on all tables
ALTER TABLE monitoring_stations DISABLE ROW LEVEL SECURITY;
ALTER TABLE water_data DISABLE ROW LEVEL SECURITY;
ALTER TABLE alerts DISABLE ROW LEVEL SECURITY;

-- 2. Grant permissions to anon role
GRANT SELECT ON monitoring_stations TO anon;
GRANT SELECT ON water_data TO anon;
GRANT SELECT ON alerts TO anon;

-- 3. Grant permissions to authenticated role
GRANT SELECT ON monitoring_stations TO authenticated;
GRANT SELECT ON water_data TO authenticated;
GRANT SELECT ON alerts TO authenticated;

-- 4. Verify table structure (optional - just to check)
SELECT column_name, data_type, is_nullable 
FROM information_schema.columns 
WHERE table_name = 'monitoring_stations' 
ORDER BY ordinal_position;

-- 5. Test data access (optional - just to verify)
SELECT COUNT(*) as station_count FROM monitoring_stations;
SELECT COUNT(*) as water_data_count FROM water_data;
SELECT COUNT(*) as alerts_count FROM alerts;

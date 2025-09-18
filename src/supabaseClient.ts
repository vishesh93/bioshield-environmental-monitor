import { createClient } from '@supabase/supabase-js'
import { SUPABASE_CONFIG } from './config/supabase'

export const supabase = createClient(SUPABASE_CONFIG.url, SUPABASE_CONFIG.anonKey)

// Database types based on your schema
export interface MonitoringStation {
  id: number;
  name: string;
  lat: number;
  lng: number;
  description: string | null;
  created_at: string;
}

export interface WaterData {
  id: number;
  station_id: number;
  ph: number | null;
  turbidity: number | null;
  lead: number | null;
  mercury: number | null;
  arsenic: number | null;
  cadmium: number | null;
  hmpi: number | null;
  created_at?: string; // Optional since it might not exist
}

export interface Alert {
  id: number;
  station_id: number;
  parameter: string;
  value: number;
  message: string;
  created_at?: string; // Optional since it might not exist
}

import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || 'https://rurbsodgubtzdthhwovi.supabase.co';
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InJ1cmJzb2RndWJ0emR0aGh3b3ZpIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzQzNzE1NDIsImV4cCI6MjA4OTk0NzU0Mn0.M8DRnHdX6ZTULh5WVwQtTiwXkDdSW1MuDO2YsiC2p8I';

export const supabase = createClient(supabaseUrl, supabaseAnonKey);

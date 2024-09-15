// supabaseClient.js
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://evwijhntckwkgouqpwxo.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImV2d2lqaG50Y2t3a2dvdXFwd3hvIiwicm9sZSI6ImFub24iLCJpYXQiOjE3MjM2NTU3MjcsImV4cCI6MjAzOTIzMTcyN30.rQfuJMXQ0a_OJC1O3SBqDq1uopxX7Eolq1kuvG1GZxU';
export const supabase = createClient(supabaseUrl, supabaseKey);

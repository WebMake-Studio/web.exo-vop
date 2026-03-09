
const SUPABASE_URL     = 'https://pzwbsefmiesbfdjccwgf.supabase.co';
const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InB6d2JzZWZtaWVzYmZkamNjd2dmIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzI5ODQ3MzksImV4cCI6MjA4ODU2MDczOX0.yNUeqHBl0vdnCPonunfOcrVskpQgctDQLn5pQo_GBMs';

const db = window.supabase ? window.supabase.createClient(SUPABASE_URL, SUPABASE_ANON_KEY) : null;
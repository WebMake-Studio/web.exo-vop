
const SUPABASE_URL     = 'https://fnlnajgenegnhhehmvps.supabase.co/';
const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImZubG5hamdlbmVnbmhoZWhtdnBzIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzMyMzQ3OTcsImV4cCI6MjA4ODgxMDc5N30.CeLHsHxRkaMNnugFzsNVr9o95XfKklcxgFaK5nTidiY';

const db = window.supabase ? window.supabase.createClient(SUPABASE_URL, SUPABASE_ANON_KEY) : null;

const { createClient } = require('@supabase/supabase-js');
require('dotenv').config();

const supabaseUrl = process.env.SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseServiceKey) {
  throw new Error(
    'FATAL: SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY environment variables are required. ' +
    'Check your .env file or deployment environment configuration.'
  );
}

const supabase = createClient(supabaseUrl, supabaseServiceKey);

module.exports = supabase;


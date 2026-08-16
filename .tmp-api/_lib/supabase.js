"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getSupabase = getSupabase;
const supabase_js_1 = require("@supabase/supabase-js");
let client = null;
function getSupabase() {
    const url = process.env.SUPABASE_URL;
    const key = process.env.SUPABASE_SERVICE_ROLE_KEY;
    if (!url || !key)
        throw new Error('SUPABASE_URL / SUPABASE_SERVICE_ROLE_KEY not set');
    if (!client)
        client = (0, supabase_js_1.createClient)(url, key, { auth: { persistSession: false } });
    return client;
}

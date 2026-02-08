// lib/supabase.ts
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://uxdwfguljkwsepjvuehk.supabase.co';
const supabaseKey = 'sb_publishable_wGmtFbHbr3OUR9Hl20R8Gg_1EkNn-sz';

export const supabase = createClient(supabaseUrl, supabaseKey);
// This allows you to import it as { supabase } in your other files
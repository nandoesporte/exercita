
// Follow this setup guide to integrate the Deno language server with your editor:
// https://deno.land/manual/getting_started/setup_your_environment
// This enables autocomplete, go to definition, etc.

import { serve } from 'https://deno.land/std@0.168.0/http/server.ts'
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const supabaseUrl = Deno.env.get('SUPABASE_URL')
const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, {
      headers: {
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Methods': 'POST, OPTIONS',
        'Access-Control-Allow-Headers': 'Content-Type, Authorization',
      },
      status: 204,
    })
  }

  // Only allow POST requests
  if (req.method !== 'POST') {
    return new Response(JSON.stringify({ error: 'Method not allowed' }), {
      headers: { 'Content-Type': 'application/json' },
      status: 405,
    })
  }

  try {
    const supabase = createClient(supabaseUrl, supabaseServiceKey)
    
    // Parse the incoming JSON webhook
    const payload = await req.json()
    console.log('Received Kiwify webhook payload:', payload)
    
    // Validate required fields
    if (!payload.order_id || !payload.status) {
      return new Response(
        JSON.stringify({ error: 'Missing required webhook fields' }),
        { headers: { 'Content-Type': 'application/json' }, status: 400 }
      )
    }

    // Call the database function to handle the webhook
    const { data, error } = await supabase
      .rpc('handle_kiwify_webhook', { payload })
    
    if (error) {
      console.error('Error handling webhook:', error)
      return new Response(
        JSON.stringify({ error: error.message }),
        { headers: { 'Content-Type': 'application/json' }, status: 500 }
      )
    }
    
    return new Response(
      JSON.stringify({ success: true, data }),
      { headers: { 'Content-Type': 'application/json' } }
    )
  } catch (error) {
    console.error('Server error:', error)
    return new Response(
      JSON.stringify({ error: 'Internal server error' }),
      { headers: { 'Content-Type': 'application/json' }, status: 500 }
    )
  }
})

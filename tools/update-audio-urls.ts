/**
 * One-off script: update listening group audio_url fields in the database
 * to point at the correct Supabase Storage public URLs.
 *
 * Run: npm run db:update-audio
 */

import { createClient } from '@supabase/supabase-js'
import * as dotenv from 'dotenv'

dotenv.config()

const SUPABASE_URL = process.env.VITE_SUPABASE_URL
const SERVICE_ROLE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY

if (!SUPABASE_URL || !SERVICE_ROLE_KEY) {
  console.error('Missing VITE_SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY in .env')
  process.exit(1)
}

const supabase = createClient(SUPABASE_URL, SERVICE_ROLE_KEY)

const BASE = `${SUPABASE_URL}/storage/v1/object/public/audio/n5/2017/december`

const UPDATES = [
  { id: 'n5-2017-l-g1', audio_url: `${BASE}/q1.mp3` },
  { id: 'n5-2017-l-g2', audio_url: `${BASE}/q2.mp3` },
  { id: 'n5-2017-l-g3', audio_url: `${BASE}/q3.mp3` },
  { id: 'n5-2017-l-g4', audio_url: `${BASE}/q4.mp3` },
]

async function run() {
  console.log('Updating listening group audio URLs...\n')

  for (const { id, audio_url } of UPDATES) {
    const { error } = await supabase
      .from('question_groups')
      .update({ audio_url })
      .eq('group_key', id)

    if (error) {
      console.error(`  ✗ ${id}: ${error.message}`)
    } else {
      console.log(`  ✓ ${id} → ${audio_url}`)
    }
  }

  console.log('\nDone.')
}

run().catch(err => {
  console.error('Fatal:', err)
  process.exit(1)
})

import { createClient } from '@supabase/supabase-js'
import * as dotenv from 'dotenv'
import * as path from 'path'

// ================================
// Seed Verification Script
// Connects to Supabase and checks the seeded data is correct.
// Usage: npm run db:verify
// ================================

dotenv.config({ path: path.join(__dirname, '../.env') })

const SUPABASE_URL = process.env.SUPABASE_URL ?? process.env.VITE_SUPABASE_URL ?? ''
const SUPABASE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY ?? ''

if (!SUPABASE_URL || !SUPABASE_KEY) {
  console.error('❌ Missing SUPABASE_URL (or VITE_SUPABASE_URL) and SUPABASE_SERVICE_ROLE_KEY')
  console.error('   Copy .env.example to .env and fill in the values.')
  process.exit(1)
}

const supabase = createClient(SUPABASE_URL, SUPABASE_KEY)

// ── Types ─────────────────────────────────────────────────

interface CheckResult {
  name: string
  passed: boolean
  detail: string
}

// ── Helpers ───────────────────────────────────────────────

function pass(name: string, detail: string): CheckResult {
  return { name, passed: true, detail }
}

function fail(name: string, detail: string): CheckResult {
  return { name, passed: false, detail }
}

// ── Checks ────────────────────────────────────────────────

async function checkCounts(): Promise<CheckResult[]> {
  const results: CheckResult[] = []

  const tables = ['exams', 'sections', 'question_groups', 'questions'] as const

  for (const table of tables) {
    const { count, error } = await supabase
      .from(table)
      .select('*', { count: 'exact', head: true })

    if (error) {
      results.push(fail(`${table} count`, `Query failed: ${error.message}`))
    } else if (count === 0) {
      results.push(fail(`${table} count`, `Table is empty — seed may not have run`))
    } else {
      results.push(pass(`${table} count`, `${count} row${count === 1 ? '' : 's'}`))
    }
  }

  return results
}

async function checkN5December(): Promise<CheckResult[]> {
  const results: CheckResult[] = []

  const { data: exam, error } = await supabase
    .from('exams')
    .select('id, status')
    .eq('level', 'N5')
    .eq('year', 2017)
    .eq('month', 'december')
    .single()

  if (error || !exam) {
    return [fail('N5 2017 December exists', 'Exam not found — run: npm run db:seed -- --file=n5_2017_december.json')]
  }

  results.push(pass('N5 2017 December exists', `id: ${exam.id}`))

  if (exam.status === 'published') {
    results.push(pass('N5 2017 December status', 'published'))
  } else {
    results.push(fail('N5 2017 December status', `Expected "published", got "${exam.status}"`))
  }

  // Check section + question counts
  const { data: sections } = await supabase
    .from('sections')
    .select('id, type')
    .eq('exam_id', exam.id)

  if (!sections || sections.length !== 3) {
    results.push(fail('N5 2017 December sections', `Expected 3 sections, got ${sections?.length ?? 0}`))
  } else {
    results.push(pass('N5 2017 December sections', '3 sections (vocabulary, grammar_reading, listening)'))
  }

  // Total question count should be 90 (33+32+25)
  if (sections) {
    const sectionIds = sections.map(s => s.id)
    const { data: groups } = await supabase
      .from('question_groups')
      .select('id')
      .in('section_id', sectionIds)

    if (groups) {
      const groupIds = groups.map(g => g.id)
      const { count: qCount } = await supabase
        .from('questions')
        .select('*', { count: 'exact', head: true })
        .in('group_id', groupIds)

      if (qCount === 90) {
        results.push(pass('N5 2017 December question count', '90 questions (33+32+25)'))
      } else {
        results.push(fail('N5 2017 December question count', `Expected 90, got ${qCount}`))
      }
    }
  }

  return results
}

async function checkN5July(): Promise<CheckResult[]> {
  const results: CheckResult[] = []

  const { data: exam, error } = await supabase
    .from('exams')
    .select('id, status')
    .eq('level', 'N5')
    .eq('year', 2019)
    .eq('month', 'july')
    .single()

  if (error || !exam) {
    results.push(fail('N5 2019 July exists', 'Not found — run: npm run db:seed -- --file=n5_2019_july.json'))
    return results
  }

  results.push(pass('N5 2019 July exists', `id: ${exam.id}`))

  if (exam.status === 'draft') {
    results.push(pass('N5 2019 July status', 'draft (expected)'))
  } else {
    results.push(fail('N5 2019 July status', `Expected "draft", got "${exam.status}"`))
  }

  return results
}

async function checkAnswerValidity(): Promise<CheckResult[]> {
  const results: CheckResult[] = []

  // All correct_answer values must be 1, 2, 3, or 4
  const { data: invalid, error } = await supabase
    .from('questions')
    .select('id, correct_answer')
    .or('correct_answer.lt.1,correct_answer.gt.4')

  if (error) {
    return [fail('Valid correct_answer values', `Query failed: ${error.message}`)]
  }

  if (!invalid || invalid.length === 0) {
    results.push(pass('Valid correct_answer values', 'All questions have correct_answer in 1–4'))
  } else {
    results.push(fail('Valid correct_answer values', `${invalid.length} questions have out-of-range correct_answer`))
  }

  return results
}

async function checkNoEmptyOptions(): Promise<CheckResult[]> {
  // options is a JSONB array — check for any rows where it is null or empty
  const { data: questions, error } = await supabase
    .from('questions')
    .select('id, options')

  if (error) {
    return [fail('No empty options arrays', `Query failed: ${error.message}`)]
  }

  const emptyCount = (questions ?? []).filter(q => {
    const opts = q.options as unknown[]
    return !opts || opts.length === 0
  }).length

  if (emptyCount === 0) {
    return [pass('No empty options arrays', `All ${questions?.length} questions have options`)]
  }
  return [fail('No empty options arrays', `${emptyCount} questions have empty options`)]
}

async function checkListeningAudioUrls(): Promise<CheckResult[]> {
  // Listening groups that have no audio_url set
  const { data: groups, error } = await supabase
    .from('question_groups')
    .select('id, group_key, audio_url, sections!inner(type)')
    .eq('sections.type', 'listening')

  if (error) {
    return [fail('Listening audio_url check', `Query failed: ${error.message}`)]
  }

  if (!groups || groups.length === 0) {
    return [fail('Listening audio_url check', 'No listening groups found')]
  }

  const missing = groups.filter(g => !g.audio_url)

  if (missing.length === 0) {
    return [pass('Listening audio_url set', `All ${groups.length} listening groups have audio_url`)]
  }

  return [fail(
    'Listening audio_url set',
    `${missing.length}/${groups.length} listening groups missing audio_url: ${missing.map(g => g.group_key).join(', ')}`
  )]
}

// ── Runner ────────────────────────────────────────────────

async function main() {
  console.log('\n🔍 JLPT Simulator — Seed Verification\n')
  console.log(`   URL: ${SUPABASE_URL}\n`)

  const allResults: CheckResult[] = []

  process.stdout.write('Checking table counts... ')
  allResults.push(...await checkCounts())
  console.log('done')

  process.stdout.write('Checking N5 2017 December... ')
  allResults.push(...await checkN5December())
  console.log('done')

  process.stdout.write('Checking N5 2019 July... ')
  allResults.push(...await checkN5July())
  console.log('done')

  process.stdout.write('Checking correct_answer validity... ')
  allResults.push(...await checkAnswerValidity())
  console.log('done')

  process.stdout.write('Checking options arrays... ')
  allResults.push(...await checkNoEmptyOptions())
  console.log('done')

  process.stdout.write('Checking listening audio_url... ')
  allResults.push(...await checkListeningAudioUrls())
  console.log('done')

  // ── Report ───────────────────────────────────────────────
  const passed = allResults.filter(r => r.passed)
  const failed = allResults.filter(r => !r.passed)

  console.log('\n' + '─'.repeat(60))
  console.log('RESULTS\n')

  for (const r of allResults) {
    const icon = r.passed ? '✅' : '❌'
    console.log(`${icon}  ${r.name}`)
    console.log(`    ${r.detail}`)
  }

  console.log('\n' + '─'.repeat(60))
  console.log(`\n${passed.length}/${allResults.length} checks passed`)

  if (failed.length > 0) {
    console.log(`\n⚠️  ${failed.length} check${failed.length > 1 ? 's' : ''} failed:\n`)
    for (const r of failed) {
      console.log(`   • ${r.name}: ${r.detail}`)
    }
    console.log('')
    process.exit(1)
  }

  console.log('\n🎉 All checks passed!\n')
}

main().catch(err => {
  console.error('\n❌ Verification failed with unexpected error:', err)
  process.exit(1)
})

#!/usr/bin/env ts-node
import { Command } from 'commander'
import * as path from 'path'
import * as fs from 'fs'
import { extractPdf } from './extractors/pdfExtractor'
import { buildAudioMap } from './extractors/audioMapper'
import { parseAnswers } from './parsers/answerParser'
import { parseVocabulary } from './parsers/vocabularyParser'
import { parseGrammar } from './parsers/grammarParser'
import { parseListening } from './parsers/listeningParser'
import { assembleExam } from './generators/jsonGenerator'
import { validateExam } from './validators/jsonValidator'

// ================================
// JLPT PDF → JSON Converter CLI
// Usage: npm run convert -- --level N5 --year 2017 --month december \
//   --vocab input/pdfs/N5V.pdf --grammar input/pdfs/N5G.pdf \
//   --listening input/pdfs/N5L.pdf --answers input/pdfs/N5答案.pdf
// ================================

const program = new Command()

program
  .name('jlpt-converter')
  .description('Convert JLPT PDF papers into standardized exam JSON')
  .requiredOption('-l, --level <level>',      'JLPT level (N1-N5)')
  .requiredOption('-y, --year <year>',         'Exam year (e.g. 2017)', parseInt)
  .requiredOption('-m, --month <month>',       'Exam month (july|december)')
  .requiredOption('-v, --vocab <path>',        'Path to vocabulary PDF')
  .requiredOption('-g, --grammar <path>',      'Path to grammar+reading PDF')
  .requiredOption('-L, --listening <path>',    'Path to listening PDF')
  .requiredOption('-a, --answers <path>',      'Path to answer key PDF')
  .option('-t, --transcript <path>',           'Path to listening transcript PDF')
  .option('-o, --output <dir>',                'Output directory', 'output')
  .option('--audio-dir <dir>',                 'Directory containing MP3 files')

program.parse(process.argv)

const opts = program.opts<{
  level:      string
  year:       number
  month:      string
  vocab:      string
  grammar:    string
  listening:  string
  answers:    string
  transcript: string | undefined
  output:     string
  audioDir:   string | undefined
}>()

// ── Validate options ─────────────────────────────────────
const validLevels  = ['N1', 'N2', 'N3', 'N4', 'N5']
const validMonths  = ['july', 'december']

if (!validLevels.includes(opts.level)) {
  console.error(`❌ Invalid level: ${opts.level}. Must be one of: ${validLevels.join(', ')}`)
  process.exit(1)
}
if (!validMonths.includes(opts.month)) {
  console.error(`❌ Invalid month: ${opts.month}. Must be: july or december`)
  process.exit(1)
}

// ── Check files exist ────────────────────────────────────
for (const [name, p] of [
  ['vocab',     opts.vocab],
  ['grammar',   opts.grammar],
  ['listening', opts.listening],
  ['answers',   opts.answers],
] as [string, string][]) {
  if (!fs.existsSync(p)) {
    console.error(`❌ File not found (--${name}): ${p}`)
    process.exit(1)
  }
}

async function run() {
  console.log(`\n🎌 JLPT Converter — ${opts.level} ${opts.year} ${opts.month}`)
  console.log('─'.repeat(50))

  // ── Step 1: Extract raw text from PDFs ──────────────────
  console.log('\n📄 Extracting PDF text...')
  const [vocabText, grammarText, listeningText, answersText] = await Promise.all([
    extractPdf(opts.vocab),
    extractPdf(opts.grammar),
    extractPdf(opts.listening),
    extractPdf(opts.answers),
  ])
  console.log('  ✓ Vocabulary PDF')
  console.log('  ✓ Grammar/Reading PDF')
  console.log('  ✓ Listening PDF')
  console.log('  ✓ Answer key PDF')

  // ── Step 2: Parse answer key ─────────────────────────────
  console.log('\n🔑 Parsing answer key...')
  const answerMap = parseAnswers(answersText)
  console.log(`  ✓ ${Object.keys(answerMap).length} answers parsed`)

  // ── Step 3: Parse sections ───────────────────────────────
  console.log('\n📝 Parsing sections...')
  const vocabGroups     = parseVocabulary(vocabText, answerMap, opts.level, opts.year)
  console.log(`  ✓ Vocabulary: ${vocabGroups.length} groups`)
  const grammarGroups   = parseGrammar(grammarText, answerMap, opts.level, opts.year)
  console.log(`  ✓ Grammar/Reading: ${grammarGroups.length} groups`)
  const listeningGroups = parseListening(listeningText, answerMap, opts.level, opts.year)
  console.log(`  ✓ Listening: ${listeningGroups.length} groups`)

  // ── Step 4: Map audio files ──────────────────────────────
  if (opts.audioDir) {
    console.log('\n🎵 Mapping audio files...')
    const audioMap = buildAudioMap(opts.audioDir, opts.level, opts.year, opts.month)
    // Attach audio URLs to listening groups
    for (const group of listeningGroups) {
      const audioKey = group.order_index + 1   // group 0 → Q1, group 1 → Q2, etc.
      const url      = audioMap.get(audioKey)
      if (url) group.audio_url = url
    }
    console.log(`  ✓ ${audioMap.size} audio files mapped`)
  }

  // ── Step 5: Assemble & validate ──────────────────────────
  console.log('\n🔧 Assembling exam JSON...')
  const examJson = assembleExam({
    level:          opts.level as 'N1' | 'N2' | 'N3' | 'N4' | 'N5',
    year:           opts.year,
    month:          opts.month as 'july' | 'december',
    vocabGroups,
    grammarGroups,
    listeningGroups,
  })

  console.log('\n✅ Validating schema...')
  validateExam(examJson)

  // ── Step 6: Write output ─────────────────────────────────
  const outputDir  = path.resolve(opts.output)
  fs.mkdirSync(outputDir, { recursive: true })

  const fileName   = `${opts.level.toLowerCase()}_${opts.year}_${opts.month}.json`
  const outputPath = path.join(outputDir, fileName)
  fs.writeFileSync(outputPath, JSON.stringify(examJson, null, 2), 'utf-8')

  console.log(`\n🎉 Done! Output: ${outputPath}`)
  console.log(`   Copy to supabase/seed/${fileName} then run: npm run db:seed -- --file=${fileName}`)
}

run().catch((err: unknown) => {
  console.error('❌ Conversion failed:', err instanceof Error ? err.message : err)
  process.exit(1)
})

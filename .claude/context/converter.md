# Converter Context

## Location
`tools/converter/` — CLI: PDF+audio → validated exam JSON → `supabase/seed/`

## Input
```
tools/converter/input/pdfs/  N5V.pdf N5G.pdf N5L.pdf N5答案.pdf N5听力原文.pdf
tools/converter/input/audio/ N5Q1.mp3 N5Q2.mp3 N5Q3.mp3 N5Q4.mp3
```

## Pipeline
1. `pdfExtractor.ts` — raw text from each PDF, preserve Japanese, identify Q numbers/options
2. `answerParser.ts` — parse answer key → `{questionNumber: correctAnswer}` map
3. `vocabularyParser/grammarParser/listeningParser.ts` — structure into question_groups + questions, apply answer map
4. `imageExtractor.ts` — identify image regions → SVG decision → `svgGenerator.ts` OR save PNG
5. `svgGenerator.ts` — build SVG for simple geometric images, store as inline string
6. `audioMapper.ts` — N5Q1.mp3→もんだい1, N5Q2→もんだい2, N5Q3→もんだい3, N5Q4→もんだい4
7. `jsonGenerator.ts` — assemble + validate against ExamSchema (Zod) → write output/
8. `jsonValidator.ts` — Zod validation, sequential Q numbers, correct_answer 1–4

## SVG vs Upload (see decisions/003)
✅ SVG: no faces, basic shapes, B&W, <20 elements
❌ Upload: human figures, complex scenes, photographic detail, handwriting

## Group ID Format
`{level}-{year}-{section_abbrev}-g{n}` e.g. `n5-2017-v-g1` `n5-2017-gr-g3` `n5-2017-l-g2`
Section abbrevs: v=vocabulary, gr=grammar_reading, l=listening

## CLI
```bash
npm run convert -- --level N5 --year 2017 --month december \
  --vocab N5V.pdf --grammar N5G.pdf --listening N5L.pdf \
  --answers N5答案.pdf --transcript N5听力原文.pdf
# output: tools/converter/output/n5_2017_december.json
```

## Tests
`cd tools/converter && npx vitest run` — 30 tests (answerParser×10, jsonValidator×12, vocabularyParser×8)

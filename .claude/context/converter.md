# Converter Tool Context

---

## Purpose

CLI tool that converts JLPT PDF papers + answer keys + audio
into the standardized exam JSON format for seeding into Supabase.

Location: `tools/converter/`

---

## Input Files

```
tools/converter/input/
  ├── pdfs/
  │   ├── N5V.pdf          ← Vocabulary questions
  │   ├── N5G.pdf          ← Grammar + Reading questions
  │   ├── N5L.pdf          ← Listening question sheet
  │   ├── N5答案.pdf        ← Answer key
  │   └── N5听力原文.pdf    ← Listening transcript
  └── audio/
      ├── N5Q1.mp3
      ├── N5Q2.mp3
      ├── N5Q3.mp3
      └── N5Q4.mp3
```

---

## Output

```
tools/converter/output/
  └── n5_2017_december.json    ← Validated exam JSON
```

Then manually moved to:
```
supabase/seed/n5_2017_december.json
```

---

## Pipeline Steps

```
1. pdfExtractor.ts
   → Extract raw text from each PDF section
   → Preserve Japanese characters
   → Identify question numbers, options, instructions

2. answerParser.ts
   → Parse answer key PDF
   → Build: { questionNumber: correctAnswer } map

3. vocabularyParser.ts / grammarParser.ts / listeningParser.ts
   → Take raw extracted text
   → Structure into question_groups and questions
   → Apply answer map to set correct_answer

4. imageExtractor.ts
   → Identify questions with images
   → Extract image regions from PDF
   → Decision: can this be SVG? → svgGenerator.ts
                               → else: save as PNG for upload

5. svgGenerator.ts
   → Build SVG for simple geometric images
   → e.g. sock patterns, bag outlines, room layouts
   → Store as inline SVG string in JSON

6. audioMapper.ts
   → Map each listening question_group to correct MP3 file
   → N5Q1.mp3 → もんだい1
   → N5Q2.mp3 → もんだい2
   → N5Q3.mp3 → もんだい3
   → N5Q4.mp3 → もんだい4

7. jsonGenerator.ts
   → Assemble full exam JSON
   → Validate against ExamSchema (Zod)
   → Write to output/

8. jsonValidator.ts
   → Run Zod validation
   → Check all question numbers sequential
   → Check all correct_answers 1-4
   → Report any issues
```

---

## Image Strategy (SVG vs Upload)

### Make as SVG ✅
- Sock patterns (Q1 listening)
- Bag silhouettes (Q3 listening)
- Room layout with furniture (reading Q28)
- Apple box (vocab Q27)
- Glasses on desk (vocab Q28)
- Book/page diagrams
- Simple geometric objects
- Icons and symbols

### Upload to Supabase Storage ❌
- Complex scene illustrations (people, faces)
- Restaurant/train/street scenes
- Any image requiring fine detail
- Scanned handwriting

---

## JSON Group ID Format

```
{level}-{year}-{section_abbrev}-g{index}

Examples:
n5-2017-v-g1     ← N5, 2017, Vocabulary, group 1
n5-2017-gr-g3    ← N5, 2017, Grammar/Reading, group 3
n5-2017-l-g2     ← N5, 2017, Listening, group 2
```

---

## Audio File → Section Mapping (N5 2017)

```
N5Q1.mp3  →  もんだい1 (listening section 1, questions 1-7)
N5Q2.mp3  →  もんだい2 (listening section 2, questions 1-6)
N5Q3.mp3  →  もんだい3 (listening section 3, questions 1-5)
N5Q4.mp3  →  もんだい4 (listening section 4, questions 1-6)
```

---

## CLI Usage

```bash
# Convert a specific paper
npm run convert -- \
  --level N5 \
  --year 2017 \
  --month december \
  --vocab tools/converter/input/pdfs/N5V.pdf \
  --grammar tools/converter/input/pdfs/N5G.pdf \
  --listening tools/converter/input/pdfs/N5L.pdf \
  --answers tools/converter/input/pdfs/N5答案.pdf \
  --transcript tools/converter/input/pdfs/N5听力原文.pdf

# Output: tools/converter/output/n5_2017_december.json
```

---

## Converter Status

| File | Status |
|---|---|
| package.json | ⏳ TODO |
| src/index.ts | ⏳ TODO |
| src/extractors/ | ⏳ TODO |
| src/parsers/ | ⏳ TODO |
| src/generators/ | ⏳ TODO |
| src/validators/ | ⏳ TODO |
| N5 2017 JSON | ⏳ TODO |

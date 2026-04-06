import * as fs from 'fs'
import * as path from 'path'

// ================================
// Audio File Mapper
// Maps MP3 files in an audio directory to listening question groups.
// Naming convention: {LEVEL}Q{n}.mp3  →  もんだいn
// e.g. N5Q1.mp3 → group index 0 (もんだい1)
// ================================

/**
 * Scans an audio directory and builds a map from
 * question group number (1-based) → storage URL
 *
 * Storage URL format:
 *   {level}/{year}/{month}/q{n}.mp3
 *
 * The caller attaches these URLs to listening question_groups.
 */
export function buildAudioMap(
  audioDir:  string,
  level:     string,
  year:      number,
  month:     string
): Map<number, string> {
  const map = new Map<number, string>()

  if (!fs.existsSync(audioDir)) {
    console.warn(`⚠️  Audio directory not found: ${audioDir} — skipping audio mapping`)
    return map
  }

  const files = fs.readdirSync(audioDir).filter((f) => f.toLowerCase().endsWith('.mp3'))

  for (const file of files) {
    // Match pattern: {LEVEL}Q{n}.mp3  (case-insensitive)
    const match = file.match(/^[Nn][1-5][Qq](\d+)\.mp3$/i)
    if (!match) {
      console.warn(`⚠️  Unrecognised audio file (skipping): ${file}`)
      continue
    }

    const groupNumber = parseInt(match[1], 10)

    // Build the storage path that will be used after upload
    // Format: n5/2017/december/q1.mp3
    const storagePath = `${level.toLowerCase()}/${year}/${month}/q${groupNumber}.mp3`
    map.set(groupNumber, storagePath)
  }

  return map
}

/**
 * Given a local audio directory, returns the list of MP3 files
 * expected for a given level (for validation purposes).
 *
 * N5/N4: 4 tracks (Q1–Q4)
 * N3:    4 tracks
 * N2/N1: 5 tracks
 */
export function getExpectedAudioCount(level: string): number {
  return level === 'N1' || level === 'N2' ? 5 : 4
}

/**
 * Validates that all expected audio files are present in the directory.
 */
export function validateAudioFiles(
  audioDir: string,
  level:    string
): { valid: boolean; missing: string[] } {
  const expected = getExpectedAudioCount(level)
  const missing: string[] = []

  for (let i = 1; i <= expected; i++) {
    const fileName = `${level}Q${i}.mp3`
    if (!fs.existsSync(path.join(audioDir, fileName))) {
      missing.push(fileName)
    }
  }

  return { valid: missing.length === 0, missing }
}

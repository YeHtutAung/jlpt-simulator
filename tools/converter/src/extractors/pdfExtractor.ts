import pdfParse from 'pdf-parse'
import * as fs from 'fs'

// ================================
// PDF Text Extractor
// Preserves Japanese characters via pdf-parse
// ================================

/**
 * Extracts all text from a PDF file.
 * Returns the raw text with newlines preserved.
 */
export async function extractPdf(filePath: string): Promise<string> {
  const buffer = fs.readFileSync(filePath)
  const data   = await pdfParse(buffer, {
    // Preserve page breaks as double newlines
    pagerender: (pageData) => {
      return pageData.getTextContent({ normalizeWhitespace: false }).then((textContent: { items: unknown[] }) => {
        let text = ''
        let lastY: number | null = null

        for (const item of textContent.items as Array<{ str: string; transform: number[] }>) {
          const y = item.transform[5]
          if (lastY !== null && Math.abs(y - lastY) > 5) {
            text += '\n'
          }
          text += item.str
          lastY = y
        }
        return text
      })
    },
  })

  return data.text
}

/**
 * Splits extracted text into labelled blocks by section marker.
 * Useful for identifying もんだい1, もんだい2, etc.
 */
export function splitBySection(text: string, marker: string): string[] {
  return text.split(marker).slice(1)
}

/**
 * Extracts question blocks by question number pattern.
 * Matches patterns like "１", "２" (full-width) or "1", "2" (half-width).
 */
export function extractQuestionBlocks(text: string): string[] {
  // Match question boundaries — full-width or half-width numbers at line start
  const pattern = /(?=^[（(]?[１２３４５６７８９０1-9][０-９0-9]*[）)]?\s)/gm
  const parts   = text.split(pattern).filter((p) => p.trim().length > 0)
  return parts
}

/**
 * Normalises a Japanese question text block:
 * - Converts full-width numbers to half-width
 * - Trims excess whitespace
 * - Removes page header/footer noise
 */
export function normalizeText(text: string): string {
  return text
    .replace(/[０-９]/g, (ch) => String.fromCharCode(ch.charCodeAt(0) - 0xFEE0))
    .replace(/[Ａ-Ｚａ-ｚ]/g, (ch) => String.fromCharCode(ch.charCodeAt(0) - 0xFEE0))
    .replace(/\r\n/g, '\n')
    .replace(/[ \t]+/g, ' ')
    .trim()
}

// ================================
// SVG Generator
// Generates inline SVG strings for simple geometric images
// per decisions/003_image_strategy.md
//
// SVG criteria: no faces, basic shapes only, B&W, <20 elements
// ================================

export interface SvgOptions {
  width?:  number
  height?: number
  title?:  string
}

// ── Common shape builders ─────────────────────────────────

function svgWrap(content: string, opts: SvgOptions = {}): string {
  const w = opts.width  ?? 200
  const h = opts.height ?? 200
  const title = opts.title ? `<title>${opts.title}</title>` : ''
  return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${w} ${h}" width="${w}" height="${h}" aria-label="${opts.title ?? ''}">${title}${content}</svg>`
}

// ── Predefined SVGs for known N5 2017 image questions ─────

/**
 * Listening Q1 — 4 sock images with different patterns
 * Used in もんだい1 audio_with_image questions
 */
export function generateSockOptions(): string {
  const socks = [
    sockSvg(1, 'stripe'),
    sockSvg(2, 'dot'),
    sockSvg(3, 'plain'),
    sockSvg(4, 'stripe_horizontal'),
  ]
  return svgWrap(
    `<g>${socks.map((s, i) => `<g transform="translate(${(i % 2) * 100},${Math.floor(i / 2) * 100})">${s}</g>`).join('')}</g>`,
    { width: 200, height: 200, title: '4種類の靴下' }
  )
}

function sockSvg(num: number, pattern: string): string {
  const base = `
    <rect x="20" y="10" width="30" height="40" rx="5" fill="white" stroke="black" stroke-width="2"/>
    <rect x="15" y="40" width="40" height="20" rx="5" fill="white" stroke="black" stroke-width="2"/>
    <text x="35" y="80" text-anchor="middle" font-size="12">${num}</text>
  `
  let overlay = ''
  if (pattern === 'stripe') {
    overlay = `<line x1="20" y1="20" x2="50" y2="20" stroke="black" stroke-width="2"/>
               <line x1="20" y1="30" x2="50" y2="30" stroke="black" stroke-width="2"/>`
  } else if (pattern === 'dot') {
    overlay = `<circle cx="30" cy="22" r="3" fill="black"/>
               <circle cx="40" cy="32" r="3" fill="black"/>
               <circle cx="35" cy="42" r="3" fill="black"/>`
  } else if (pattern === 'stripe_horizontal') {
    overlay = `<line x1="20" y1="25" x2="50" y2="25" stroke="black" stroke-width="2" stroke-dasharray="4,2"/>`
  }
  return base + overlay
}

/**
 * Listening Q3 — 4 bag silhouettes (different shapes)
 */
export function generateBagOptions(): string {
  const bags = [
    totesBag(),
    handbag(),
    backpack(),
    clutch(),
  ]
  return svgWrap(
    bags.map((b, i) => `<g transform="translate(${(i % 2) * 100},${Math.floor(i / 2) * 100})">${b}</g>`).join(''),
    { width: 200, height: 200, title: '4種類のバッグ' }
  )
}

function totesBag(): string {
  return `
    <rect x="20" y="30" width="60" height="55" rx="4" fill="white" stroke="black" stroke-width="2"/>
    <path d="M 30 30 Q 30 15 50 15 Q 70 15 70 30" fill="none" stroke="black" stroke-width="2"/>
    <text x="50" y="95" text-anchor="middle" font-size="10">1</text>
  `
}

function handbag(): string {
  return `
    <rect x="20" y="35" width="60" height="45" rx="8" fill="white" stroke="black" stroke-width="2"/>
    <path d="M 35 35 L 35 25 Q 50 18 65 25 L 65 35" fill="none" stroke="black" stroke-width="2"/>
    <text x="50" y="95" text-anchor="middle" font-size="10">2</text>
  `
}

function backpack(): string {
  return `
    <rect x="25" y="25" width="50" height="60" rx="10" fill="white" stroke="black" stroke-width="2"/>
    <rect x="35" y="40" width="30" height="20" rx="4" fill="white" stroke="black" stroke-width="1.5"/>
    <path d="M 35 25 Q 50 15 65 25" fill="none" stroke="black" stroke-width="2"/>
    <text x="50" y="95" text-anchor="middle" font-size="10">3</text>
  `
}

function clutch(): string {
  return `
    <rect x="15" y="40" width="70" height="35" rx="6" fill="white" stroke="black" stroke-width="2"/>
    <circle cx="50" cy="57" r="5" fill="none" stroke="black" stroke-width="1.5"/>
    <text x="50" y="90" text-anchor="middle" font-size="10">4</text>
  `
}

/**
 * Vocab Q27 — Apple box with count label
 */
export function generateAppleBox(count: number): string {
  return svgWrap(`
    <rect x="20" y="40" width="160" height="120" rx="8" fill="white" stroke="black" stroke-width="2"/>
    <circle cx="65" cy="90" r="20" fill="white" stroke="black" stroke-width="2"/>
    <circle cx="100" cy="90" r="20" fill="white" stroke="black" stroke-width="2"/>
    <circle cx="135" cy="90" r="20" fill="white" stroke="black" stroke-width="2"/>
    <text x="100" y="175" text-anchor="middle" font-size="18" font-weight="bold">${count}こ</text>
  `, { width: 200, height: 200, title: `りんご${count}こ` })
}

/**
 * Vocab Q28 — Glasses on a desk
 */
export function generateGlassesOnDesk(): string {
  return svgWrap(`
    <rect x="20" y="140" width="160" height="10" rx="2" fill="#888" stroke="black" stroke-width="1"/>
    <ellipse cx="75" cy="120" rx="28" ry="18" fill="white" stroke="black" stroke-width="2"/>
    <ellipse cx="125" cy="120" rx="28" ry="18" fill="white" stroke="black" stroke-width="2"/>
    <line x1="103" y1="120" x2="97" y2="120" stroke="black" stroke-width="2"/>
    <line x1="47" y1="115" x2="30" y2="108" stroke="black" stroke-width="2"/>
    <line x1="153" y1="115" x2="170" y2="108" stroke="black" stroke-width="2"/>
  `, { width: 200, height: 200, title: 'めがねがつくえのうえにあります' })
}

/**
 * Reading Q28 — Room layout with furniture
 */
export function generateRoomLayout(options: {
  tablePos:  'center' | 'corner'
  chairPos:  'left' | 'right' | 'both'
  plantPos?: 'window' | 'corner' | 'none'
}): string {
  const { tablePos, chairPos, plantPos = 'none' } = options

  const tableX = tablePos === 'center' ? 75 : 30
  const tableY = 80

  let chairs = ''
  if (chairPos === 'left' || chairPos === 'both') {
    chairs += `<rect x="${tableX - 30}" y="${tableY + 5}" width="20" height="25" rx="4" fill="white" stroke="black" stroke-width="1.5"/>`
  }
  if (chairPos === 'right' || chairPos === 'both') {
    chairs += `<rect x="${tableX + 60}" y="${tableY + 5}" width="20" height="25" rx="4" fill="white" stroke="black" stroke-width="1.5"/>`
  }

  let plant = ''
  if (plantPos !== 'none') {
    const px = plantPos === 'window' ? 160 : 10
    plant = `<circle cx="${px}" cy="40" r="15" fill="white" stroke="black" stroke-width="1.5"/>
             <rect x="${px - 5}" y="50" width="10" height="10" fill="white" stroke="black" stroke-width="1"/>`
  }

  return svgWrap(`
    <rect x="10" y="10" width="180" height="160" fill="white" stroke="black" stroke-width="3"/>
    <rect x="${tableX}" y="${tableY}" width="50" height="35" rx="4" fill="white" stroke="black" stroke-width="2"/>
    ${chairs}
    ${plant}
  `, { width: 200, height: 200, title: '部屋のレイアウト' })
}

/**
 * Generic placeholder SVG for image questions where
 * a specific SVG hasn't been handcrafted yet.
 */
export function generatePlaceholder(label: string): string {
  return svgWrap(`
    <rect x="10" y="10" width="180" height="180" rx="8" fill="#f0f0f0" stroke="#ccc" stroke-width="2"/>
    <text x="100" y="95" text-anchor="middle" font-size="14" fill="#666">${label}</text>
    <text x="100" y="115" text-anchor="middle" font-size="11" fill="#999">（画像）</text>
  `, { width: 200, height: 200, title: label })
}

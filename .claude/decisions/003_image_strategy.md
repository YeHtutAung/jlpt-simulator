# D003 — Image Strategy (S1, ✅ final)

## SVG inline ✅ (ALL must be true)
- No human faces/expressions
- Basic shapes only (rect/circle/path/line)
- B&W or simple fills
- <20 elements

## Supabase Storage ❌ (ANY = upload)
- Human figures with expressions
- Complex scenes (restaurant/train/street)
- Photographic detail
- Scanned handwriting/stamps

## Storage
SVG: inline string in `image_data` when `image_type='svg'` — rendered via `dangerouslySetInnerHTML` + DOMPurify
URL: `{SUPABASE_URL}/storage/v1/object/public/images/{level}/{year}/{month}/{filename}`

## N5 2017 Known Images
Listening Q1 socks ✅ | Listening Q3 bags ✅ | Listening Q5 people ❌ | Vocab Q27 apple box ✅ | Vocab Q28 glasses/desk ✅ | Reading Q28 room layouts ✅

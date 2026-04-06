# Decision 003 — Image Strategy (SVG vs Upload)

**Date:** Session 1
**Status:** Finalized

---

## Decision

Use a hybrid approach:
- **SVG inline** for simple geometric images
- **Supabase Storage** for complex scene images

---

## SVG criteria (make as SVG if ALL are true)

1. No human faces or expressions needed
2. Can be described with basic shapes (rect, circle, path, line)
3. Black & white or simple fills only
4. Small number of elements (< 20)

## Upload criteria (use storage if ANY are true)

1. Contains human figures with expressions
2. Complex scene (restaurant, train, street)
3. Requires photographic detail
4. Scanned handwriting or stamps

## SVG storage

SVG stored as inline string in `question_groups.image_data`
when `question_groups.image_type = 'svg'`

Rendered in frontend via `SvgRenderer.tsx` using
`dangerouslySetInnerHTML` with DOMPurify sanitization.

## Storage URL format

```
{SUPABASE_URL}/storage/v1/object/public/images/{level}/{year}/{month}/{filename}
```

Stored in `question_groups.image_data`
when `question_groups.image_type = 'storage'`

## Known SVG images in N5 2017

| Question | Description | Decision |
|---|---|---|
| Listening Q1 | 4 sock images with patterns | ✅ SVG |
| Listening Q3 | 4 bag silhouettes | ✅ SVG |
| Listening Q5 | People in scenes | ❌ Upload |
| Vocab Q27 | Apple box with count | ✅ SVG |
| Vocab Q28 | Glasses on desk | ✅ SVG |
| Reading Q28 | Room layouts | ✅ SVG |

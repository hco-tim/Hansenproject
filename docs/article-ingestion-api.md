# Hansen Projects Article Ingestion API

Endpoint:
`POST https://www.hansenprojects.id/api/integrations/articles`

Authentication:
Send the Vercel environment variable `ARTICLE_INGEST_TOKEN` as a Bearer token. Never expose this token in frontend code or commit it to the repository.

Required header:
`Authorization: Bearer <ARTICLE_INGEST_TOKEN>`

Content type:
`application/json`

Accepted string fields:
- `title` (required)
- `slug` (optional; generated from title when omitted)
- `excerpt`
- `category`
- `coverImage`
- `coverImageAlt`
- `author`
- `publishedAt` (YYYY-MM-DD)
- `body`
- `seoTitle`
- `seoDescription`
- `focusKeyword`

The endpoint always stores incoming articles with `status: "draft"`. It generates the article ID, normalizes the slug, rejects duplicate slugs, and does not overwrite existing articles.

Example request:

```bash
curl -X POST "https://www.hansenprojects.id/api/integrations/articles" \
  -H "Authorization: Bearer $ARTICLE_INGEST_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "title": "Panduan Memilih Kitchen Set Custom",
    "slug": "panduan-memilih-kitchen-set-custom",
    "excerpt": "Panduan menentukan kitchen set berdasarkan kebutuhan ruang.",
    "category": "Kitchen Set",
    "coverImage": "/uploads/articles/kitchen-set.webp",
    "coverImageAlt": "Kitchen set custom berbentuk L dengan kabinet putih dan finishing kayu",
    "body": "## Tentukan kebutuhan dapur\n\nSesuaikan penyimpanan dengan aktivitas harian.",
    "seoTitle": "Panduan Memilih Kitchen Set Custom | Hansen Projects",
    "seoDescription": "Pelajari cara memilih kitchen set custom sesuai ukuran dapur dan kebutuhan rumah.",
    "focusKeyword": "kitchen set custom"
  }'
```

Success response returns HTTP 201 and the new article ID, slug, and draft status. A duplicate slug returns HTTP 409.

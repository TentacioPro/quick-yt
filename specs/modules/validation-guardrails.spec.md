# Living Specification — Validation Guardrails

> Last updated by: Task 07 — Visual Diagram Extraction
> Driven by: `specs/tasks/07-visual-diagram.md`

Every transaction across application/system boundaries must validate payloads using Zod schemas at runtime. This document tracks all active schemas in the monorepo.

---

## 1. Transcript Extractor Boundaries

### Input Schema (`TranscriptInputSchema`)
**File:** `apps/mobile/src/skills/transcript/validation.ts`

```typescript
export const TranscriptInputSchema = z.object({
  youtube_url: z.string().url().regex(/youtube\.com|youtu\.be/),
  language_code: z.string().regex(/^[a-zA-Z-]{2,5}$/).default('en'),
});
```

**Guardrails enforced:**
- `youtube_url` must be a valid URL format AND contain `youtube.com` or `youtu.be`.
- `language_code` must match a strictly formatted language code (2-5 ASCII letters/hyphens), defaulting to `'en'`. Prevents invalid script injection in target URLs.

---

## 2. Gemini API Boundaries

### Request Schema (`GeminiRequestSchema`)
**File:** `apps/mobile/src/skills/gemini/validation.ts`

```typescript
export const GeminiRequestSchema = z.object({
  contents: z.array(
    z.object({
      role: z.enum(['user', 'model']),
      parts: z.array(
        z.object({
          text: z.string().min(1),
        })
      ),
    })
  ).min(1),
  systemInstruction: z.object({
    parts: z.array(
      z.object({
        text: z.string().min(1),
      })
    ),
  }),
});
```

**Guardrails enforced:**
- Ensures the model instructions and user messages contain non-empty parts.
- Validates payload structure strictly before external REST dispatch to avoid API runtime error fees.

---

## 3. Gemini Vision Boundaries

### Request Schema (`GeminiVisionRequestSchema`)
**File:** `apps/mobile/src/skills/vision/validation.ts`

```typescript
export const GeminiVisionRequestSchema = z.object({
  contents: z.array(
    z.object({
      role: z.enum(['user']),
      parts: z.array(
        z.union([
          z.object({
            text: z.string().min(1),
          }),
          z.object({
            inlineData: z.object({
              mimeType: z.enum(['image/jpeg', 'image/png']),
              data: z.string().min(1), // Base64 data
            }),
          }),
        ])
      ).min(1),
    })
  ).min(1),
  systemInstruction: z.object({
    parts: z.array(
      z.object({
        text: z.string().min(1),
      })
    ),
  }),
});
```

**Guardrails enforced:**
- Restricts input formats strictly to image types `image/jpeg` and `image/png`.
- Prevents empty base64 strings or unsupported mimetypes from propagating to the model.

---

## 4. Sync Server Upload Boundaries

### File Metadata Schema (`UploadFileSchema`)
**File:** `tools/sync-server/src/validation.ts`

```typescript
export const UploadFileSchema = z.object({
  originalname: z.string().endsWith('.db'),
  mimetype: z.enum([
    'application/octet-stream',
    'application/x-sqlite3',
    'application/vnd.sqlite3',
  ]),
});
```

**Guardrails enforced:**
- Uploaded database files must strictly carry the `.db` filename extension.
- MIME type of the uploaded payload must match one of the standardized SQLite signatures to prevent script upload vulnerabilities.
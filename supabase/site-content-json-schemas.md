# `site_content.data` — JSON Schemas

`site_content` stores five rows, one per `key`. The `data` column only has a
minimal `jsonb_typeof(data) = 'object'` CHECK at the database level — it does
**not** enforce these shapes. Each shape below is the contract that a
dedicated Zod schema (one per `key`) must implement and validate against on
every write, per `02-security-rules.mdc` ("Validate every Server Action ...
using Zod", "Do not render untrusted HTML directly"). No Server Action may
write to `site_content` without passing the matching Zod schema first —
unvalidated arbitrary JSON must never reach this table.

All `media_id` / `og_media_id` / `logo_media_id` values are `media_library.id`
values. They are **not** enforced by a foreign key (Postgres cannot FK into a
JSONB value) — the Zod schema must check the id exists in `media_library`
before saving, and the media-delete action must scan these paths before
allowing deletion (see the `media_library` table comment in the schema
migration).

## `key = 'homepage'`

```json
{
  "$schema": "http://json-schema.org/draft-07/schema#",
  "title": "site_content.data — homepage",
  "type": "object",
  "additionalProperties": false,
  "required": ["hero", "short_about", "approach", "contact_cta"],
  "properties": {
    "hero": {
      "type": "object",
      "additionalProperties": false,
      "required": ["title", "subtitle", "primary_button", "media_type"],
      "properties": {
        "title": { "type": "string", "minLength": 1, "maxLength": 200 },
        "subtitle": { "type": "string", "minLength": 1, "maxLength": 300 },
        "primary_button": { "$ref": "#/definitions/button" },
        "secondary_button": {
          "oneOf": [{ "$ref": "#/definitions/button" }, { "type": "null" }]
        },
        "media_type": { "type": "string", "enum": ["image", "video"] },
        "media_id": {
          "oneOf": [{ "type": "string", "format": "uuid" }, { "type": "null" }]
        },
        "video_url": {
          "oneOf": [{ "type": "string", "format": "uri" }, { "type": "null" }]
        }
      },
      "allOf": [
        {
          "if": { "properties": { "media_type": { "const": "image" } } },
          "then": { "required": ["media_id"] }
        },
        {
          "if": { "properties": { "media_type": { "const": "video" } } },
          "then": { "required": ["video_url"] }
        }
      ]
    },
    "short_about": { "$ref": "#/definitions/titleText" },
    "approach": { "$ref": "#/definitions/titleText" },
    "contact_cta": {
      "type": "object",
      "additionalProperties": false,
      "required": ["title", "text", "button_label"],
      "properties": {
        "title": { "type": "string", "minLength": 1 },
        "text": { "type": "string", "minLength": 1 },
        "button_label": { "type": "string", "minLength": 1 }
      }
    }
  },
  "definitions": {
    "button": {
      "type": "object",
      "additionalProperties": false,
      "required": ["label", "url"],
      "properties": {
        "label": { "type": "string", "minLength": 1 },
        "url": { "type": "string", "minLength": 1 }
      }
    },
    "titleText": {
      "type": "object",
      "additionalProperties": false,
      "required": ["title", "text"],
      "properties": {
        "title": { "type": "string", "minLength": 1 },
        "text": { "type": "string", "minLength": 1 }
      }
    }
  }
}
```

## `key = 'about'`

```json
{
  "$schema": "http://json-schema.org/draft-07/schema#",
  "title": "site_content.data — about",
  "type": "object",
  "additionalProperties": false,
  "required": ["title", "intro_text", "content"],
  "properties": {
    "title": { "type": "string", "minLength": 1 },
    "intro_text": { "type": "string", "minLength": 1 },
    "content": { "type": "string", "minLength": 1 },
    "cover_media_id": {
      "oneOf": [{ "type": "string", "format": "uuid" }, { "type": "null" }]
    },
    "seo": {
      "type": "object",
      "additionalProperties": false,
      "properties": {
        "title": { "type": "string" },
        "description": { "type": "string" },
        "canonical_url": { "type": "string" }
      }
    }
  }
}
```

## `key = 'business_profile'`

```json
{
  "$schema": "http://json-schema.org/draft-07/schema#",
  "title": "site_content.data — business_profile",
  "type": "object",
  "additionalProperties": false,
  "required": ["business_name", "email", "phone"],
  "properties": {
    "business_name": { "type": "string", "minLength": 1 },
    "legal_name": { "oneOf": [{ "type": "string" }, { "type": "null" }] },
    "registration_number": { "oneOf": [{ "type": "string" }, { "type": "null" }] },
    "email": { "type": "string", "format": "email" },
    "phone": { "type": "string", "minLength": 1 },
    "address": { "oneOf": [{ "type": "string" }, { "type": "null" }] },
    "city": { "oneOf": [{ "type": "string" }, { "type": "null" }] },
    "working_hours": {
      "type": "array",
      "items": {
        "type": "object",
        "additionalProperties": false,
        "required": ["day", "opens", "closes"],
        "properties": {
          "day": {
            "type": "string",
            "enum": ["sunday", "monday", "tuesday", "wednesday", "thursday", "friday", "saturday"]
          },
          "opens": { "type": "string" },
          "closes": { "type": "string" }
        }
      }
    },
    "social": {
      "type": "object",
      "additionalProperties": false,
      "properties": {
        "instagram": { "oneOf": [{ "type": "string", "format": "uri" }, { "type": "null" }] },
        "facebook": { "oneOf": [{ "type": "string", "format": "uri" }, { "type": "null" }] },
        "whatsapp": { "oneOf": [{ "type": "string" }, { "type": "null" }] }
      }
    },
    "logo_media_id": {
      "oneOf": [{ "type": "string", "format": "uuid" }, { "type": "null" }]
    }
  }
}
```

## `key = 'site_settings'`

```json
{
  "$schema": "http://json-schema.org/draft-07/schema#",
  "title": "site_content.data — site_settings",
  "type": "object",
  "additionalProperties": false,
  "required": ["default_seo", "robots_indexing_enabled", "maintenance_mode"],
  "properties": {
    "default_seo": {
      "type": "object",
      "additionalProperties": false,
      "required": ["title", "description"],
      "properties": {
        "title": { "type": "string", "minLength": 1 },
        "description": { "type": "string", "minLength": 1 },
        "og_media_id": {
          "oneOf": [{ "type": "string", "format": "uuid" }, { "type": "null" }]
        }
      }
    },
    "ga4_measurement_id": { "oneOf": [{ "type": "string" }, { "type": "null" }] },
    "google_site_verification": { "oneOf": [{ "type": "string" }, { "type": "null" }] },
    "robots_indexing_enabled": { "type": "boolean" },
    "maintenance_mode": { "type": "boolean" }
  }
}
```

## `key = 'certificates'`

```json
{
  "$schema": "http://json-schema.org/draft-07/schema#",
  "title": "site_content.data — certificates",
  "type": "object",
  "additionalProperties": false,
  "required": ["items"],
  "properties": {
    "items": {
      "type": "array",
      "items": {
        "type": "object",
        "additionalProperties": false,
        "required": ["id", "title", "organization", "media_id", "order"],
        "properties": {
          "id": { "type": "string", "minLength": 1 },
          "title": { "type": "string", "minLength": 1 },
          "organization": { "type": "string", "minLength": 1 },
          "year": {
            "oneOf": [
              { "type": "integer", "minimum": 1950, "maximum": 2100 },
              { "type": "null" }
            ]
          },
          "media_id": { "type": "string", "format": "uuid" },
          "description": { "oneOf": [{ "type": "string" }, { "type": "null" }] },
          "order": { "type": "integer", "minimum": 0 }
        }
      }
    }
  }
}
```

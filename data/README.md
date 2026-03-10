# CMS data

The **Selected work**, **Interactives**, and **Speaking & presentations** sections on the main page are loaded from JSON. Edit the files below—no code changes needed.

- **Selected work** and **Interactives**: `projects.json`
- **Speaking & presentations**: `speaking.json`

## Format

### Selected work (`selectedWork`)

Each item can have:

| Field | Required | Description |
|-------|----------|-------------|
| `url` | Yes | Link to the project or article |
| `title` | Yes | Card title |
| `description` | Yes | Short description |
| `tags` | Yes | Array of tag strings, e.g. `["AI", "search"]` |
| `image` | No | Path to image, e.g. `"assets/thumb.png"`. Omit for placeholder. |
| `imageAlt` | No | Alt text for the image |
| `more` | No | Extra paragraph (e.g. for spotlight cards) |
| `wide` | No | `true` to span 2 columns |
| `spotlight` | No | `true` for spotlight styling |

**Example – new project with image:**

```json
{
  "url": "https://example.com/article",
  "image": "assets/my-thumb.png",
  "imageAlt": "Description of image",
  "title": "My new project",
  "description": "One line about the project.",
  "tags": ["AI", "journalism"]
}
```

**Example – project without image (placeholder):**

```json
{
  "url": "https://example.com/article",
  "title": "Another project",
  "description": "Short description.",
  "tags": ["tag1", "tag2"]
}
```

**Example – wide spotlight card:**

```json
{
  "url": "https://...",
  "image": "assets/...",
  "title": "Spotlight title",
  "description": "Short description.",
  "more": "Longer paragraph for the spotlight.",
  "tags": ["AI"],
  "wide": true,
  "spotlight": true
}
```

### Interactives (`interactives`)

Each item has: `url`, `title`, `description`, `tags` (no image).

## Order

Projects appear in the order they are listed in the JSON. Reorder by moving entries up or down.

---

## Speaking & presentations (`speaking.json`)

The `talks` array drives the Speaking section. Each talk can have:

| Field | Required | Description |
|-------|----------|-------------|
| `date` | Yes | Display date, e.g. `"March 2026"` |
| `org` | Yes | Organizer or event name |
| `title` | Yes | Talk title |
| `titleUrl` | Yes | Link for the title (e.g. event page or video) |
| `desc` | Yes | Short description |
| `links` | No | Array of `{ "label": "Slides", "url": "assets/..." }` for buttons (Slides, GitHub, Session write-up, etc.) |
| `spotlight` | No | `true` to use the spotlight layout (text + video column) |
| `videoEmbed` | No | YouTube video ID only (e.g. `"MsH_5rzTDb8"`). Use with `spotlight: true` to show the embed. |

**Example – regular talk with links:**

```json
{
  "date": "Sept 2025",
  "org": "Online News Association (ONA)",
  "title": "Navigating the shift to generative search",
  "titleUrl": "https://ona25.journalists.org/schedule/",
  "desc": "Description of the session.",
  "links": [
    { "label": "Slides", "url": "assets/ona-2025-generative-search-tipsheet.pdf" }
  ]
}
```

**Example – spotlight talk with video:**

```json
{
  "date": "Feb 2026",
  "org": "Tow Center for Digital Journalism",
  "title": "Search and news",
  "titleUrl": "https://www.youtube.com/watch?v=MsH_5rzTDb8",
  "desc": "Panel on how AI search and chatbots are changing...",
  "links": [{ "label": "Session write-up", "url": "https://..." }],
  "spotlight": true,
  "videoEmbed": "MsH_5rzTDb8"
}
```

Talks appear in the order listed. One talk can have `spotlight: true` and `videoEmbed`; it will render with the video on the right.

---

## Greece gallery (`greece.html`)

The **Scenes from Greece** page loads its images from `greece.json`. Edit the `images` array to reorder or change layout.

| Field   | Required | Description |
|--------|----------|-------------|
| `src`  | Yes      | Path to image, e.g. `"assets/playground/greece/Scenes from Greece.png"` |
| `alt`  | No       | Alt text for the image |
| `span` | No       | `"full"` to make the image span both columns (full width) |

**Example – reorder and one full-width:**

```json
{
  "images": [
    { "src": "assets/playground/greece/Scenes from Greece (4).png", "alt": "Scenes from Greece", "span": "full" },
    { "src": "assets/playground/greece/Scenes from Greece.png", "alt": "Scenes from Greece" },
    { "src": "assets/playground/greece/Scenes from Greece (1).png", "alt": "Scenes from Greece" }
  ]
}
```

Images appear in the order listed. Use `"span": "full"` on any item to make it span the full width of the gallery.

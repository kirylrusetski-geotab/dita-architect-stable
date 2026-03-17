# DITA Architect API

DITA Architect exposes a small read-only API on `localhost:3000` that lets external tools — including Claude Code skills — check what's happening in the editor and read the content of open topics.

All endpoints return JSON. All are read-only (GET). No authentication is required (this is a local dev server).

---

## Quick check: Is the editor running?

```bash
curl -s http://localhost:3000/api/status
```

If you get a JSON response, the editor is up. If the connection is refused, it's not running.

---

## Endpoints

### GET /api/status

Returns the editor's current state at a glance — what version it's running, whether Heretto CMS is connected, how many tabs are open, and which theme is active.

**Request:**
```bash
curl -s http://localhost:3000/api/status | jq
```

**Response:**
```json
{
  "version": "0.7.3",
  "herettoConnected": true,
  "tabCount": 2,
  "activeTabId": "tab-1710612345678",
  "theme": "dark"
}
```

| Field | Type | Description |
|-------|------|-------------|
| `version` | string | DITA Architect version (from package.json) |
| `herettoConnected` | boolean | Whether the editor has valid Heretto CMS credentials configured |
| `tabCount` | number | How many tabs are currently open |
| `activeTabId` | string | The ID of the tab the author is currently looking at |
| `theme` | string | The active app theme (`dark`, `light`, `claude`, `nord`, `solarized`, `geotab`) |

**When to use this:** Before doing anything else — confirm the editor is alive and check if Heretto is connected.

---

### GET /api/tabs

Lists all open tabs with summary metadata. Does not include the actual XML content (use `/api/tabs/:id/content` for that).

**Request:**
```bash
curl -s http://localhost:3000/api/tabs | jq
```

**Response:**
```json
{
  "activeTabId": "tab-1710612345678",
  "tabs": [
    {
      "id": "tab-1710612345678",
      "fileName": "Setting_up_a_Traffic_Analysis.dita",
      "herettoFile": {
        "uuid": "a1b2c3d4-e5f6-7890-abcd-ef1234567890",
        "name": "Setting_up_a_Traffic_Analysis.dita",
        "path": "Altitude_Copy/User_Guide/Traffic_Analytics"
      },
      "dirty": false,
      "xmlErrorCount": 0
    },
    {
      "id": "tab-1710612399999",
      "fileName": "Untitled.dita",
      "herettoFile": null,
      "dirty": true,
      "xmlErrorCount": 2
    }
  ]
}
```

| Field | Type | Description |
|-------|------|-------------|
| `activeTabId` | string | Which tab is currently in focus |
| `tabs[].id` | string | Unique tab identifier — use this with `/api/tabs/:id/content` |
| `tabs[].fileName` | string or null | The file name (from Heretto or local file system) |
| `tabs[].herettoFile` | object or null | If the topic was opened from Heretto, includes `uuid`, `name`, and `path`. Null for local files or new topics. |
| `tabs[].dirty` | boolean | Whether the tab has unsaved changes |
| `tabs[].xmlErrorCount` | number | Number of XML validation errors in this tab |

**When to use this:** To find out what the author has open, pick a tab to read, or check if there are unsaved changes before triggering an action.

---

### GET /api/tabs/:id/content

Returns the full DITA XML content of a specific tab, along with any validation errors.

**Request:**
```bash
# Get the tab ID from /api/tabs first, then:
curl -s http://localhost:3000/api/tabs/tab-1710612345678/content | jq
```

**Response:**
```json
{
  "id": "tab-1710612345678",
  "fileName": "Setting_up_a_Traffic_Analysis.dita",
  "herettoFile": {
    "uuid": "a1b2c3d4-e5f6-7890-abcd-ef1234567890",
    "name": "Setting_up_a_Traffic_Analysis.dita",
    "path": "Altitude_Copy/User_Guide/Traffic_Analytics"
  },
  "dirty": false,
  "xmlErrors": [
    {
      "line": 42,
      "column": 15,
      "message": "Element 'invalid-tag' is not valid in this context",
      "severity": "error"
    }
  ],
  "xml": "<?xml version=\"1.0\" encoding=\"UTF-8\"?>\n<!DOCTYPE task PUBLIC \"-//OASIS//DTD DITA Task//EN\" \"task.dtd\">\n<task id=\"setting-up-traffic-analysis\">..."
}
```

| Field | Type | Description |
|-------|------|-------------|
| `id` | string | Tab identifier |
| `fileName` | string or null | File name |
| `herettoFile` | object or null | Heretto CMS metadata (uuid, name, path) |
| `dirty` | boolean | Whether there are unsaved changes |
| `xmlErrors` | array | List of XML validation issues, each with `line`, `column`, `message`, and `severity` (`"error"` or `"warning"`) |
| `xml` | string | The complete DITA XML content of the topic |

**When to use this:** To read the actual content of a topic — for analysis, transformation, or feeding into another tool.

---

## Common patterns for Claude Code skills

### Check if the editor is available

```bash
STATUS=$(curl -s -o /dev/null -w "%{http_code}" http://localhost:3000/api/status)
if [ "$STATUS" = "200" ]; then
  echo "Editor is running"
else
  echo "Editor is not running"
fi
```

### Get the active tab's content

```bash
# Step 1: Get the active tab ID
ACTIVE_TAB=$(curl -s http://localhost:3000/api/tabs | jq -r '.activeTabId')

# Step 2: Fetch its XML content
curl -s "http://localhost:3000/api/tabs/${ACTIVE_TAB}/content" | jq -r '.xml'
```

### List all dirty (unsaved) tabs

```bash
curl -s http://localhost:3000/api/tabs | jq '.tabs[] | select(.dirty == true) | .fileName'
```

### Check for XML errors across all tabs

```bash
curl -s http://localhost:3000/api/tabs | jq '.tabs[] | select(.xmlErrorCount > 0) | {fileName, xmlErrorCount}'
```

---

## Error responses

| HTTP Status | Meaning |
|-------------|---------|
| 200 | Success |
| 404 | Tab ID not found, or invalid endpoint path |
| 405 | Wrong HTTP method (only GET is supported) |

Error responses return JSON with an `error` field:
```json
{ "error": "Tab not found" }
```

---

## Notes

- These endpoints reflect live editor state — they update as the author opens, edits, and closes tabs.
- The `xml` field in `/api/tabs/:id/content` returns the raw XML exactly as it appears in the Monaco editor, including any unsaved edits.
- If a tab was opened from Heretto, `herettoFile.uuid` can be used to cross-reference with the Heretto CMS REST API.
- All endpoints are read-only. Write endpoints (save, format, update content) are planned as P2-22.

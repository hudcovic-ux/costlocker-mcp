# costlocker-mcp

MCP server for [Costlocker](https://costlocker.com) integration with Claude Desktop. Allows Claude to read and manage projects, timesheets, people, and financial data via the Costlocker API.

## Installation

```bash
npm install -g costlocker-mcp
```

Or run directly with npx:

```bash
npx costlocker-mcp
```

## Setup

### 1. Get Costlocker API credentials

You need a **Personal Access Token** from Costlocker:

1. Log in to Costlocker
2. Go to **Settings > API > Personal access tokens**
3. Create a new token and note the **App name** and **Token**

### 2. Configure Claude Desktop

Add to your Claude Desktop config (`~/Library/Application Support/Claude/claude_desktop_config.json` on macOS):

```json
{
  "mcpServers": {
    "costlocker": {
      "command": "npx",
      "args": ["-y", "costlocker-mcp"],
      "env": {
        "COSTLOCKER_APP_NAME": "your-app-name",
        "COSTLOCKER_API_TOKEN": "your-api-token"
      }
    }
  }
}
```

### 3. Restart Claude Desktop

The server verifies your credentials on startup via the `/me` endpoint. If the token is invalid, it will fail immediately with an error message.

## Available tools

### Projects
- `costlocker_list_projects` - List projects (filter by client, state)
- `costlocker_get_project` - Get project detail
- `costlocker_search_projects` - Search projects by name
- `costlocker_create_project` - Create a new project
- `costlocker_update_project` - Update project (name, dates, state, tags)

### Timesheets
- `costlocker_log_time` - Log a time entry
- `costlocker_get_timesheet` - Get timesheet entries
- `costlocker_get_monthly_timesheet` - Get monthly aggregated data
- `costlocker_get_running_entry` - Get currently running entry
- `costlocker_get_assignments` - Get available assignments

### People
- `costlocker_list_people` - List all people
- `costlocker_get_me` - Get current user info
- `costlocker_get_project_people` - Get people assigned to a project

### Finance
- `costlocker_get_project_budget` - Get project budget
- `costlocker_get_project_billing` - Get project billing items
- `costlocker_get_project_expenses` - Get project expenses

### Lookup
- `costlocker_list_clients` - List all clients
- `costlocker_list_activities` - List all activities
- `costlocker_list_tags` - List all tags
- `costlocker_list_groups` - List all groups

## Security

- Write operations (`create_project`, `update_project`, `log_time`) are marked with `destructiveHint: true` so Claude will ask for confirmation before executing them
- Input validation via Zod on all mutation endpoints
- API access is controlled by your personal access token - you only see data you have permission to access
- Error messages are sanitized to prevent leaking sensitive API response data
- List responses are truncated to 200 items to prevent context overflow

## Environment variables

| Variable | Required | Description |
|---|---|---|
| `COSTLOCKER_APP_NAME` | Yes | Your Costlocker API app name |
| `COSTLOCKER_API_TOKEN` | Yes | Your personal access token |
| `COSTLOCKER_HOST` | No | API host (default: `https://rest.costlocker.com`) |

## License

MIT

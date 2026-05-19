# skillslab-mcp

A Model Context Protocol server that exposes the Singapore Government
Skills Lab as three tools any Claude agent can call:

- `list_skills` — browse the library
- `get_skill(id, task?)` — fetch a skill's full definition, including a
  `reporting_prompt` instructing the agent how to close the feedback loop
- `report_run(skill_id, success, rating?, error_category?, notes?, pull_id?)`
  — POST the outcome after using the skill

## Setup

1. Issue an API key at `https://<your-skills-lab>/settings/api-keys` and
   copy the plaintext.
2. Install dependencies:
   ```bash
   cd mcp-server
   npm install
   ```
3. Wire it into your Claude client. For Claude Desktop, add to
   `~/Library/Application Support/Claude/claude_desktop_config.json`:
   ```json
   {
     "mcpServers": {
       "skillslab": {
         "command": "node",
         "args": ["/absolute/path/to/skillslab/mcp-server/index.js"],
         "env": {
           "SKILLSLAB_API_BASE": "https://skillslab.your.gov.sg",
           "SKILLSLAB_API_KEY": "skl_..."
         }
       }
     }
   }
   ```
   For project-scoped `.mcp.json` (Claude Code), use the same shape under
   `mcpServers`.
4. Restart Claude. The three tools should appear in the tool picker.

## Renewal

Keys expire 90 days after issue but auto-renew every time you log in to
the Skills Lab website. If you stop logging in, you'll get an email
warning 10 days before expiry. A revoked or expired key returns 401 with
identical wording.

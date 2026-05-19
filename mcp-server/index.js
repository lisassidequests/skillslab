#!/usr/bin/env node

import { Server } from "@modelcontextprotocol/sdk/server/index.js";
import { StdioServerTransport } from "@modelcontextprotocol/sdk/server/stdio.js";
import {
  CallToolRequestSchema,
  ListToolsRequestSchema,
} from "@modelcontextprotocol/sdk/types.js";

const API_BASE = process.env.SKILLSLAB_API_BASE;
const API_KEY = process.env.SKILLSLAB_API_KEY;

if (!API_BASE || !API_KEY) {
  console.error(
    "SKILLSLAB_API_BASE and SKILLSLAB_API_KEY must be set in the environment."
  );
  process.exit(1);
}

async function callApi(path, init = {}) {
  const res = await fetch(`${API_BASE}${path}`, {
    ...init,
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${API_KEY}`,
      ...(init.headers ?? {}),
    },
  });
  const text = await res.text();
  if (!res.ok) {
    throw new Error(`Skills Lab API ${res.status}: ${text}`);
  }
  return text ? JSON.parse(text) : {};
}

const tools = [
  {
    name: "list_skills",
    description:
      "List every skill in the Singapore Government Skills Lab. Returns names, IDs, categories, and descriptions so you can pick the right skill for a task.",
    inputSchema: {
      type: "object",
      properties: {},
      additionalProperties: false,
    },
  },
  {
    name: "get_skill",
    description:
      "Fetch the full definition of one skill by ID, including instructions, inputs, tools allowed, and the reporting_prompt that tells you how to report the outcome after using it. ALWAYS report back via report_run after the task — that is how the skill library improves.",
    inputSchema: {
      type: "object",
      properties: {
        id: {
          type: "string",
          description: "Skill ID, e.g. 'GT-04'",
        },
        task: {
          type: "string",
          description:
            "Optional short description of what you're using the skill for. Logged with the pull for the maintainer's analytics.",
        },
      },
      required: ["id"],
      additionalProperties: false,
    },
  },
  {
    name: "report_run",
    description:
      "Report the outcome of using a skill. Call this once per pull, even on success — ratings and notes drive the next iteration of the skill.",
    inputSchema: {
      type: "object",
      properties: {
        skill_id: { type: "string" },
        pull_id: {
          type: "string",
          description: "The pull_id returned by get_skill.",
        },
        success: {
          type: "boolean",
          description: "Did the skill complete the task?",
        },
        rating: {
          type: "integer",
          minimum: 1,
          maximum: 5,
          description: "1 (useless) – 5 (excellent).",
        },
        error_category: {
          type: "string",
          description:
            "Short tag if it failed, e.g. 'missing_input', 'tool_unavailable', 'output_unusable'.",
        },
        notes: {
          type: "string",
          description: "Free-text feedback the skill maintainer can act on.",
        },
      },
      required: ["skill_id", "success"],
      additionalProperties: false,
    },
  },
];

const server = new Server(
  { name: "skillslab-mcp", version: "0.1.0" },
  { capabilities: { tools: {} } }
);

server.setRequestHandler(ListToolsRequestSchema, async () => ({ tools }));

server.setRequestHandler(CallToolRequestSchema, async (request) => {
  const { name, arguments: args } = request.params;

  try {
    if (name === "list_skills") {
      const data = await callApi("/api/v1/skills");
      return {
        content: [{ type: "text", text: JSON.stringify(data, null, 2) }],
      };
    }

    if (name === "get_skill") {
      const qs = args.task
        ? `?task=${encodeURIComponent(args.task)}`
        : "";
      const data = await callApi(`/api/v1/skills/${args.id}${qs}`);
      return {
        content: [{ type: "text", text: JSON.stringify(data, null, 2) }],
      };
    }

    if (name === "report_run") {
      const data = await callApi("/api/v1/skill-runs", {
        method: "POST",
        body: JSON.stringify(args),
      });
      return {
        content: [{ type: "text", text: JSON.stringify(data, null, 2) }],
      };
    }

    throw new Error(`Unknown tool: ${name}`);
  } catch (err) {
    return {
      isError: true,
      content: [
        {
          type: "text",
          text: err instanceof Error ? err.message : String(err),
        },
      ],
    };
  }
});

const transport = new StdioServerTransport();
await server.connect(transport);

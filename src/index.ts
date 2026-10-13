#!/usr/bin/env node
import { Server } from "@modelcontextprotocol/sdk/server/index.js";
import { StdioServerTransport } from "@modelcontextprotocol/sdk/server/stdio.js";
import {
  CallToolRequestSchema,
  ListToolsRequestSchema,
} from "@modelcontextprotocol/sdk/types.js";
import { CreastieApiClient } from "./client.js";
import { dispatchTool } from "./dispatch.js";
import { tools } from "./tools.js";

const baseUrl = process.env.CREASTIE_API_URL;
const token = process.env.CREASTIE_API_TOKEN;

if (!baseUrl || !token) {
  console.error("CREASTIE_API_URL and CREASTIE_API_TOKEN are required");
  process.exit(1);
}

const client = new CreastieApiClient({ baseUrl, token });

const server = new Server(
  { name: "creastie", version: "0.1.0" },
  { capabilities: { tools: {} } },
);

server.setRequestHandler(ListToolsRequestSchema, async () => ({
  tools: tools.map((t) => ({
    name: t.name,
    description: t.description,
    inputSchema: t.inputSchema,
  })),
}));

server.setRequestHandler(CallToolRequestSchema, async (request) => {
  const name = request.params.name;
  const args = (request.params.arguments ?? {}) as Record<string, unknown>;

  try {
    const result = await dispatchTool(client, name, args);
    return {
      content: [{ type: "text", text: JSON.stringify(result, null, 2) }],
    };
  } catch (error) {
    const message = error instanceof Error ? error.message : String(error);
    return {
      isError: true,
      content: [{ type: "text", text: message }],
    };
  }
});

const transport = new StdioServerTransport();
await server.connect(transport);

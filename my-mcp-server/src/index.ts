import { McpAgent } from "agents/mcp";
import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { z } from "zod";

// Define the base URL for the Python API
const PYTHON_API_BASE_URL = "http://localhost:5003";

// Define our MCP agent with tools
export class MyMCP extends McpAgent {
	server = new McpServer({
		name: "Authless Calculator and Attio Tools",
		version: "1.0.1", // Incremented version
	});

	async init() {
		// Simple addition tool
		this.server.tool(
			"add",
			{ a: z.number(), b: z.number() },
			async ({ a, b }) => ({
				content: [{ type: "text", text: String(a + b) }],
			})
		);

		// Calculator tool with multiple operations
		this.server.tool(
			"calculate",
			{
				operation: z.enum(["add", "subtract", "multiply", "divide"]),
				a: z.number(),
				b: z.number(),
			},
			async ({ operation, a, b }) => {
				let result: number;
				switch (operation) {
					case "add":
						result = a + b;
						break;
					case "subtract":
						result = a - b;
						break;
					case "multiply":
						result = a * b;
						break;
					case "divide":
						if (b === 0)
							return {
								content: [
									{
										type: "text",
										text: "Error: Cannot divide by zero",
									},
								],
							};
						result = a / b;
						break;
				}
				return { content: [{ type: "text", text: String(result) }] };
			}
		);

		// Attio: Get Object Definition tool
		this.server.tool(
			"attio_get_object_definition",
			{
				attio_api_key: z.string().min(1, "Attio API key is required."),
				object_slug: z.string().min(1, "Object slug is required."),
			},
			async ({ attio_api_key, object_slug }) => {
				try {
					const response = await fetch(`${PYTHON_API_BASE_URL}/get_object_definition`, {
						method: "POST",
						headers: {
							"Content-Type": "application/json",
						},
						body: JSON.stringify({ attio_api_key, object_slug }),
					});

					const responseData = await response.json();

					if (!response.ok) {
						return {
							content: [
								{
									type: "text",
									text: `Error from Python API: ${JSON.stringify(responseData)} (Status: ${response.status})`,
								},
							],
						};
					}
					return { content: [{ type: "text", text: JSON.stringify(responseData) }] };
				} catch (error: any) {
					return {
						content: [
							{
								type: "text",
								text: `Error calling Python API for get_object_definition: ${error.message || "Unknown error"}`,
							},
						],
					};
				}
			}
		);

		// Attio: Assert Deal tool
		this.server.tool(
			"attio_assert_deal",
			{
				attio_api_key: z.string().min(1, "Attio API key is required."),
				deal_attributes: z.record(z.union([z.string(), z.number(), z.boolean(), z.null()])),
				matching_attribute: z.string().min(1, "Matching attribute slug is required."),
			},
			async ({ attio_api_key, deal_attributes, matching_attribute }) => {
				try {
					const response = await fetch(`${PYTHON_API_BASE_URL}/assert_deal`, {
						method: "POST",
						headers: {
							"Content-Type": "application/json",
						},
						body: JSON.stringify({ attio_api_key, deal_attributes, matching_attribute }),
					});

					const responseData = await response.json();

					if (!response.ok) {
						return {
							content: [
								{
									type: "text",
									text: `Error from Python API: ${JSON.stringify(responseData)} (Status: ${response.status})`,
								},
							],
						};
					}
					return { content: [{ type: "text", text: JSON.stringify(responseData) }] };
				} catch (error: any) {
					return {
						content: [
							{
								type: "text",
								text: `Error calling Python API for assert_deal: ${error.message || "Unknown error"}`,
							},
						],
					};
				}
			}
		);
	}
}

export default {
  async fetch(
    request: Request,
    env: Env,
    ctx: ExecutionContext
  ): Promise<Response> {
    const url = new URL(request.url);

    const agent = new MyMCP(env, ctx);
    await agent.init(); 

    if (url.pathname === "/sse" || url.pathname === "/sse/message") {
      return MyMCP.serveSSE("/sse").fetch(request, env, ctx);
    }

    if (url.pathname === "/mcp") {
      return MyMCP.serve("/mcp").fetch(request, env, ctx);
    }

    return new Response("Not found", { status: 404 });
  },
};

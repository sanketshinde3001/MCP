import { McpServer, ResourceTemplate } from "@modelcontextprotocol/sdk/server/mcp.js";
import { StdioServerTransport } from "@modelcontextprotocol/sdk/server/stdio.js";
import { z } from "zod";

// ---> Define server info here <---
const SERVER_NAME = "GreeterServer";
const SERVER_VERSION = "1.0.0";

async function main() {
    console.error(`Starting ${SERVER_NAME} MCP Server v${SERVER_VERSION}...`); // Log to stderr

    // 1. Create an MCP server instance using the constants
    const server = new McpServer({
        name: SERVER_NAME,
        version: SERVER_VERSION,
        capabilities: {
            resources: {},
            tools: {},
            prompts: {}
        }
    });

    // 2. Define a Tool: 'greet'
    server.tool(
        "greet",
        "Generates a personalized greeting.",
        {
            name: z.string().describe("The name of the person to greet."),
            politeness: z.enum(["formal", "informal"]).optional().default("informal").describe("Desired politeness level."),
        },
        async ({ name, politeness }) => {
            console.error(`Executing greet tool for: ${name}, Politeness: ${politeness}`);
            let greeting = "";
            if (politeness === "formal") {
                greeting = `Esteemed greetings to you, ${name}. It is a pleasure.`;
            } else {
                greeting = `Hey ${name}! What's up?`;
            }
            return {
                content: [{ type: "text", text: greeting }],
            };
        }
    );

    // 3. Define a Resource: 'server-info'
    server.resource(
        "server-info",
        "info://greeter/about",
        async (uri) => {
            console.error(`Reading resource: ${uri.href}`);
            return {
                contents: [{
                    uri: uri.href,
                    mimeType: "text/plain",
                    // ---> Use the constant here <---
                    text: `${SERVER_NAME} MCP Server v${SERVER_VERSION}. Supports greeting people.`
                }]
            };
        }
    );

    // 4. Define a Prompt: 'suggest-greeting'
    server.prompt(
        "suggest-greeting",
        "Suggests how to use the greet tool.",
        {
            name_suggestion: z.string().optional().describe("Optional name suggestion.")
        },
        ({ name_suggestion }) => {
            const exampleName = name_suggestion || "Alice";
            console.error("Generating suggest-greeting prompt");
            return {
                messages: [{
                    role: "user",
                    content: {
                        type: "text",
                        text: `Please greet "${exampleName}" for me.`
                    }
                }, {
                    role: "assistant",
                    content: {
                        type: "text",
                        text: `Okay, I can do that. Should I use a formal or informal tone? (If you don't specify, I'll use informal).`
                    }
                }]
            };
        }
    );

    // 5. Choose and Connect Transport (Stdio)
    const transport = new StdioServerTransport();
    await server.connect(transport);

    console.error(`${SERVER_NAME} MCP Server connected via stdio and ready.`);

    // Keep the server running
    await new Promise(() => { });

}

// Run the server and handle errors
main().catch((error) => {
    console.error("Fatal error:", error);
    process.exit(1);
});
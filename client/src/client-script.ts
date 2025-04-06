import { Client } from "@modelcontextprotocol/sdk/client/index.js";
import { StdioClientTransport } from "@modelcontextprotocol/sdk/client/stdio.js";
import path from "path"; // Import path module
import { fileURLToPath } from "url"; // Helper for __dirname in ESM

// Helper to get directory name in ES Modules
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const serverScriptPath = path.resolve(
    __dirname,
    "../../build/index.js"
);


async function runClient(): Promise<void> {
    console.log(`Client: Attempting to launch server from: ${serverScriptPath}`);

    // 1. Create the Transport (StdioClientTransport launches the server)
    // This transport will start the 'node serverScriptPath' command.
    const transport = new StdioClientTransport({
        command: "node", // Command to run
        args: [serverScriptPath], // Arguments (path to the server script)
        // Optional: Add env vars if your server needs them
        // env: { MY_VAR: "value" }
    });

    // 2. Create the MCP Client instance
    const client = new Client(
        {
            name: "MyGreeterClientScript",
            version: "1.0.0",
        },
        {
            capabilities: {
                tools: {},
                resources: {},
            },
        }
    );

    try {
        // 3. Connect to the server (this also starts the server process via the transport)
        console.log("Client: Connecting to server...");
        await client.connect(transport);
        console.log("Client: Successfully connected!");

        // 4. Interact with the server

        // --- Call the 'greet' tool ---
        console.log("\nClient: Calling 'greet' tool...");
        const greetResult = await client.callTool({
            name: "greet",
            arguments: {
                name: "Programmatic User",
                politeness: "formal",
            },
        });
        interface GreetResultType {
            content: { text: string }[];
          }
          
          const typedGreetResult = greetResult as GreetResultType;
          console.log("Client: 'greet' tool result:", typedGreetResult.content[0]?.text);
          

        // --- Read the 'server-info' resource ---
        console.log("\nClient: Reading 'server-info' resource...");
        const resourceResult = await client.readResource({
            uri: "info://greeter/about"
          });
          
        console.log(
            "Client: 'server-info' resource content:",
            resourceResult.contents[0]?.text
        );

        // --- Get the 'suggest-greeting' prompt ---
        console.log("\nClient: Getting 'suggest-greeting' prompt...");
        const promptResult = await client.getPrompt({
            name: "suggest-greeting",
            arguments: { name_suggestion: "Example" }, // Pass optional arg
        });
        console.log(
            "Client: 'suggest-greeting' prompt messages:",
            JSON.stringify(promptResult.messages, null, 2)
        );
    } catch (error) {
        console.error("Client: An error occurred:", error);
    } finally {
        // 5. Close the connection (this will also typically terminate the server process)
        console.log("\nClient: Closing connection...");
        await client.close();
        console.log("Client: Connection closed.");
    }
}

runClient().catch((error) => {
    console.error("Client: Unhandled error occurred:", error);
});
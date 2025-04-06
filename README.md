# MCP Server and Client Example (TypeScript)

This project demonstrates the creation and interaction of a simple Model Context Protocol (MCP) server and a standalone MCP client using TypeScript and the `@modelcontextprotocol/sdk`.

The setup includes:
1.  **`my-mcp-greeter-server`**: An MCP server that provides greeting-related tools, resources, and prompts.
2.  **`my-mcp-client-script`**: A simple command-line client script that launches the server, connects to it, and interacts with its capabilities programmatically.

Communication between the client and server in this example uses the **stdio (standard input/output)** transport mechanism.

## Overview of the Process Followed

This project was built following these main phases:

1.  **Server Development**: Creating the MCP service provider.
2.  **Client Development**: Creating a script to consume the server's services.
3.  **Testing & Interaction**: Running the client script, which launches the server and demonstrates communication.
4.  **(Optional) Integration**: Discussing how to integrate the server with existing MCP clients like VS Code extensions.

## Prerequisites

Before you begin, ensure you have the following installed:
*   [Node.js](https://nodejs.org/) (v16 or higher recommended)
*   [npm](https://www.npmjs.com/) (usually included with Node.js)
*   A text editor or IDE (like VS Code)
*   `npx` (usually included with npm) - useful for testing with MCP Inspector.

## Phase 1: Building the MCP Server (`my-mcp-greeter-server`)

1.  **Project Setup**:
    *   Created the directory `my-mcp-greeter-server`.
    *   Initialized an npm project: `npm init -y`.
    *   Installed necessary dependencies: `npm install @modelcontextprotocol/sdk zod`.
    *   Installed development dependencies: `npm install -D typescript @types/node`.
    *   Initialized TypeScript configuration: `npx tsc --init`.
    *   Configured `tsconfig.json` (setting `"module": "Node16"`, `"target": "ES2022"`, `"outDir": "./build"`, `"rootDir": "./src"`, etc.).
    *   Updated `package.json` to include `"type": "module"` and added `build`/`start` scripts.
    *   Created the source file `src/index.ts`.

2.  **Server Implementation (`src/index.ts`)**:
    *   Imported required modules (`McpServer`, `StdioServerTransport`, `z`).
    *   Defined constants for server `name` and `version`.
    *   Instantiated `McpServer`, passing the name, version, and declaring its capabilities (tools, resources, prompts).
    *   **Defined a Tool (`greet`)**: Used `server.tool()` to create a function callable by clients. Included a description, defined input parameters with Zod (`name`, `politeness`), and implemented the handler to return a personalized greeting string.
    *   **Defined a Resource (`server-info`)**: Used `server.resource()` to expose static data. Provided a unique URI (`info://greeter/about`) and implemented the handler to return the server's name and version.
    *   **Defined a Prompt (`suggest-greeting`)**: Used `server.prompt()` to create a reusable interaction template. Included a description and implemented the handler to return a predefined set of user/assistant messages to guide an LLM interaction.
    *   **Used Stdio Transport**: Instantiated `StdioServerTransport` as the communication method.
    *   **Connected**: Called `await server.connect(transport)` to make the server ready.
    *   **Logging**: Added `console.error` statements for visibility during execution, especially important for stdio transport where stdout is used for protocol messages.
    *   **Kept Alive**: Ensured the Node.js process didn't exit immediately after connection.

3.  **Building & Fixing**:
    *   Ran `npm run build` to compile TypeScript to JavaScript in the `build` directory.
    *   Fixed a TypeScript error related to accessing server version directly, opting to use predefined constants instead.

## Phase 2: Building the MCP Client Script (`my-mcp-client-script`)

1.  **Project Setup**:
    *   Created a separate directory `my-mcp-client-script`.
    *   Initialized an npm project: `npm init -y`.
    *   Installed necessary dependencies: `npm install @modelcontextprotocol/sdk`.
    *   Installed development dependencies: `npm install -D typescript @types/node`.
    *   Initialized and configured `tsconfig.json` similarly to the server project.
    *   Updated `package.json` with `"type": "module"` and `build`/`start` scripts.
    *   Created the source file `src/client-script.ts`.

2.  **Client Implementation (`src/client-script.ts`)**:
    *   Imported required modules (`Client`, `StdioClientTransport`, `path`, `url`).
    *   **Determined Server Path**: Calculated the path to the *server's* compiled `index.js` file (relative or absolute).
    *   **Configured Stdio Transport**: Instantiated `StdioClientTransport`, providing the `command` (`node`) and `args` (the path to the server script). *This configuration is key, as the client transport launches the server process.*
    *   **Instantiated Client**: Created a `Client` instance, giving it an identity and declaring its intent to use tools and resources.
    *   **Connected**: Called `await client.connect(transport)`, which launched the server process and established the MCP connection over its stdio streams.
    *   **Interacted with Server**:
        *   Called the `greet` tool using `await client.callTool()`.
        *   Read the `server-info` resource using `await client.readResource()`.
        *   Fetched the `suggest-greeting` prompt using `await client.getPrompt()`.
    *   **Logged Results**: Used `console.log` to display the responses received from the server.
    *   **Closed Connection**: Used `await client.close()` in a `finally` block to cleanly shut down the connection and terminate the server process.

## Phase 3: Building and Running

1.  **Build Both Projects**:
    *   `cd my-mcp-greeter-server && npm run build`
    *   `cd ../my-mcp-client-script && npm run build`

2.  **Run the Client**:
    *   `cd my-mcp-client-script`
    *   `npm run start` (or `node build/client-script.js`)
    *   Observed the interleaved output from both the client (`console.log`) and the server (`console.error`), confirming successful communication and execution of tools/resources/prompts.

## Explanation of Roles

*   **The Server (`GreeterServer`)**:
    *   **Provides Services**: Exposes specific capabilities (greeting tool, server info, prompt template).
    *   **Passive Listener (in stdio)**: Waits for a client to connect via its standard streams.
    *   **Executes Logic**: Runs the code associated with a tool/resource/prompt when requested by the client.
    *   **Sends Results**: Formats results according to MCP specs and sends them back to the client.

*   **The Client (`client-script.ts`)**:
    *   **Consumes Services**: Uses the capabilities offered by the server.
    *   **Initiator (in stdio)**: Launches the server process and establishes the connection.
    *   **Sends Requests**: Decides which tool to call, resource to read, or prompt to get, and sends the appropriate MCP request.
    *   **Receives Results**: Processes the responses sent back by the server.
    *   **Controls Flow**: Manages the sequence of interactions and decides when to close the connection.

## Testing the Server Interactively

While the client script tests the programmatic interaction, you can test the server's capabilities individually using the MCP Inspector:

```bash
# Make sure the server is NOT already running
# Replace /path/to/... with the actual absolute path
npx @modelcontextprotocol/inspector node /path/to/my-mcp-greeter-server/build/index.js

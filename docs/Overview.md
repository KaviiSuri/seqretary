# Overview

## What is Seqretary?

**Seqretary** is an AI-powered Logseq plugin that transforms pages tagged with `#agent` into interactive, context-aware AI agents. The plugin leverages Large Language Models (LLMs) to empower users with smart, responsive agents that can process natural language queries, execute tool calls, and store persistent memory—all directly within the Logseq environment.

## Key Features

- **Multi-Agent Support:**  
  Any Logseq page tagged with `#agent` becomes an AI agent. This design allows users to create multiple agents with specialized roles and behaviors within their knowledge graph.

- **System Prompt Parsing:**  
  Each agent page contains a `## SystemPrompt` section where custom instructions are defined. This prompt guides the agent’s behavior during interactions.

- **Tool Integration & Calling:**  
  Agents can execute predefined functions or "tools" listed under a `## Tools` section. These tools extend the agent's capabilities by enabling interactions with external functions—such as performing calculations, querying data, or manipulating content—using real-time streaming and function calling.

- **Memory Persistence:**  
  Agents are able to write artifacts back into Logseq under a `## Memory` section, allowing them to maintain context and recall past interactions over time.

- **Direct LLM Integration:**  
  Users provide their own API keys for various LLM providers, enabling direct API calls from the client-side (within Logseq’s sandboxed environment). This approach supports streaming responses and bypasses the need for a separate backend server.

- **Type Safety:**  
  Built using TypeScript and leveraging the official `@logseq/libs`, Seqretary provides a type-safe development environment for interacting with Logseq’s Plugin API, minimizing runtime errors and streamlining development.

## How It Works

1. **Agent Discovery:**  
   The plugin queries Logseq for pages tagged with `#agent`. For each identified page, it parses content sections like `## SystemPrompt`, `## Tools`, and `## Memory` to initialize the agent's configuration.

2. **LLM Integration:**  
   When a user interacts with an agent, the plugin assembles a request using the agent’s system prompt and any relevant contextual data. It then calls the chosen LLM API directly using the user-provided API key, processing responses in a streaming fashion for a real-time experience.

3. **Tool Calling:**  
   Based on the conversation context, an agent may decide to invoke a tool. Tools are defined with structured input schemas (e.g., using Zod for validation) and are bound to the agent’s functionality. The agent generates tool call requests, and the plugin executes these functions and returns the result back into the conversation.

4. **Memory & Persistence:**  
   The plugin writes relevant conversation artifacts back into Logseq, either appending to the agent’s `## Memory` section or updating existing blocks. This ensures that agents can learn and reference past interactions, making them increasingly effective over time.

## Intended Audience

- **Logseq Users:**  
  Anyone looking to enhance their Logseq experience with AI-powered agents that can process natural language and interact with their personal knowledge base.

- **Developers:**  
  Contributors and maintainers who want to extend or customize the plugin. Detailed documentation and type-safe code help streamline development and integration with additional tools or LLM providers.

---

Seqretary aims to merge the power of AI with the flexibility of Logseq, creating an environment where your knowledge base not only stores information but actively interacts with you to enhance productivity and creativity.

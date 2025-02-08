# Seqretary

**Seqretary** is an AI-powered Logseq plugin that transforms Logseq pages tagged with `#agent` into interactive, context-aware AI agents. Using advanced LLM integrations, tool calling, and memory storage, Seqretary empowers users to create multiple intelligent agents directly within their Logseq workspace.

## Features

- **Multi-Agent Support:**  
  Every page tagged with `#agent` is automatically transformed into an AI agent.
  
- **System Prompt Parsing:**  
  Extract and apply custom system instructions from the `## SystemPrompt` section in each agent page.

- **Tool Integration & Calling:**  
  Define tools via code snippets in a `## Tools` section. Agents can invoke these tools during interactions to perform specific tasks (using streaming and function calling).

- **Memory Persistence:**  
  Store and retrieve conversational artifacts directly into a `## Memory` section on the agent page.

- **LLM Integration:**  
  Directly integrate with multiple LLM providers via client-side API calls. Users supply their own API keys, enabling streaming responses and advanced tool calling—all without hosting a dedicated backend.

- **Type Safety:**  
  Built using TypeScript and leveraging the official `@logseq/libs` to ensure type-safe interactions with Logseq's APIs.

## Installation

1. **Clone the repository:**

   ```bash
   git clone https://github.com/KaviiSuri/seqretary.git
   cd seqretary

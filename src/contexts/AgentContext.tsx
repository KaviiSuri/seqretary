import React, { useEffect, useMemo } from "react";
import { useLogseqQuery } from "@/lib/query";

export interface AgentInfo {
  id: string;
  name: string;
  description: string;
}

interface AgentContextType {
  agents: AgentInfo[];
  loading: boolean;
  selectedAgent: AgentInfo | null;
  setSelectedAgent: (agent: AgentInfo | null) => void;
}

const AgentContext = React.createContext<AgentContextType | undefined>(
  undefined
);

const AGENT_LIST_QUERY = `
  [
    :find (pull ?p [*])
    :where
      [?p :block/name]
      [?p :block/properties ?props]
      [(get ?props :type) ?type]
      [(= ?type "agent")]
  ]
`;

type Page = {
  properties: {
    type: "agent";
    description: string;
  };
  id: number;
  "updated-at": number;
  name: string;
  uuid: string;
  "created-at": number;
  "original-name": string;
  "properties-text-values": {
    type: "agent";
    description: string;
  };
  "journal?": boolean;
  file: {
    id: number;
  };
};

export function AgentProvider({ children }: { children: React.ReactNode }) {
  const [selectedAgent, setSelectedAgent] = React.useState<AgentInfo | null>(
    null
  );
  const { results: pages, loading } = useLogseqQuery<Page[]>(AGENT_LIST_QUERY, {
    enabled: true,
  });

  const agents = useMemo(() => {
    return pages.flat()?.map((page) => ({
      id: page.uuid,
      name: page.name,
      description: page.properties["description"] || "No description available",
    }));
  }, [pages]);

  useEffect(() => {
    console.log("agents", agents);
  }, [agents]);

  return (
    <AgentContext.Provider
      value={{
        agents,
        loading,
        selectedAgent,
        setSelectedAgent,
      }}
    >
      {children}
    </AgentContext.Provider>
  );
}

export function useAgentsInfo() {
  const context = React.useContext(AgentContext);
  if (context === undefined) {
    throw new Error("useAgent must be used within an AgentProvider");
  }
  return context;
}

interface Block {
  content: string;
  children?: Block[];
  "block/children"?: Block[];
  "block/content": string;
}

interface NestedBlock {
  content: string;
  _parent?: NestedBlock[];
}

const getHeadingContentPrompt = (agentInfo: AgentInfo, heading: string) => {
  return `
    [:find (pull ?b [:block/content :block/properties {:block/_parent ...}])
     :where
     [?p :block/name "${agentInfo.name}"]
     [?parent :block/page ?p]
     [?parent :block/content "${heading}"]
     [?b :block/parent ?parent]]
  `;
};

const useHeadingContent = (agentInfo: AgentInfo | null, heading: string) => {
  const query = useMemo(() => {
    if (!agentInfo) return "";
    return getHeadingContentPrompt(agentInfo, heading);
  }, [agentInfo, heading]);

  const { results: blocks, loading } = useLogseqQuery<Block[]>(query, {
    enabled: Boolean(agentInfo?.name),
  });

  return {
    blocks,
    loading,
  };
};

const blockToMarkdown = (block: NestedBlock, level = 0): string => {
  const indent = '  '.repeat(level);
  let markdown = `${indent}- ${block.content}\n`;
  
  if (block._parent && Array.isArray(block._parent)) {
    markdown += block._parent
      .map(child => blockToMarkdown(child, level + 1))
      .join('');
  }
  
  return markdown;
};

const resultsToMarkdown = (results: NestedBlock[][]): string => {
  if (!results || !results.length) return '';
  return results
    .flat()
    .map(block => blockToMarkdown(block))
    .join('');
};

export const usePageSearch = (query: string) => {
  const searchQuery = useMemo(() => {
    if (!query) return '';
    return `
      [:find (pull ?p [:block/name :block/properties])
       :where
       [?p :block/name ?name]
       [(clojure.string/includes? ?name "${query.toLowerCase()}")]]
    `;
  }, [query]);

  const { results: pages, loading } = useLogseqQuery<Page[]>(searchQuery, {
    enabled: Boolean(query),
  });

  return {
    pages: pages.flat() || [],
    loading
  };
};

export function useAgent(agentInfo: AgentInfo | null) {
  const { blocks: systemPrompt, loading: systemPromptLoading } = useHeadingContent(agentInfo, "## System Prompt");
  const { blocks: memory, loading: memoryLoading } = useHeadingContent(agentInfo, "## Memory");

  const systemPromptMarkdown = systemPrompt ? resultsToMarkdown(systemPrompt) : '';
  const memoryMarkdown = memory ? resultsToMarkdown(memory) : '';

  return {
    loading: systemPromptLoading || memoryLoading,
    systemPrompt: systemPromptMarkdown,
    memory: memoryMarkdown,
  };
}

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

const processBlocks = (blocks: Block[]): string => {
  return blocks
    .map((block) => {
      const content = block["block/content"];
      const children = block["block/children"];
      if (!children?.length) return content;
      return `${content}\n${processBlocks(children)
        .split("\n")
        .map((line) => `  ${line}`)
        .join("\n")}`;
    })
    .join("\n");
};
export function useAgent(agentInfo: AgentInfo | null) {
  const query = useMemo(() => {
    if (!agentInfo?.name) return '';
    return `
    [:find (pull ?b [:block/content :block/properties {:block/_parent ...}])
     :where
     [?p :block/name "${agentInfo?.name}"]
     [?parent :block/page ?p]
     [?parent :block/content "## System Prompt"]
     [?b :block/parent ?parent]]
  `;
  }, [agentInfo?.name]);

  const { results: blocks, loading } = useLogseqQuery<Block[]>(
    query,
    {
      enabled: Boolean(agentInfo?.name),
    }
  );

  console.log("blocks", blocks);

  return {
    blocks,
    loading,
  };
}

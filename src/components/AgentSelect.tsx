import React from "react";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useAgentsInfo } from "@/contexts/AgentContext";

export function AgentSelect() {
  const { agents, loading, selectedAgent, setSelectedAgent } = useAgentsInfo();

  const handleSelect = (agentId: string) => {
    const agent = agents.find((a) => a.id === agentId) ?? null;
    setSelectedAgent(agent);
  };

  return (
    <Select onValueChange={handleSelect} disabled={loading} value={selectedAgent?.id}>
      <SelectTrigger className="w-full">
        <SelectValue placeholder={loading ? "Loading agents..." : "Select an agent"} />
      </SelectTrigger>
      <SelectContent>
        {agents.map((agent) => (
          <SelectItem
            key={agent.id}
            value={agent.id}
          >
            <div className="flex flex-col gap-1 text-left">
              <div className="font-medium">{agent.name}</div>
              <div className="text-xs text-muted-foreground">
                {agent.description}
              </div>
            </div>
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  );
}

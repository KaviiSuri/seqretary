import {
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import React from "react";
import { Accordion } from "./components/ui/accordion";
import { ChatInterface } from "./components/ChatInterface";
import { AgentSelect } from "./components/AgentSelect";
import { AgentProvider, useAgentsInfo } from "./contexts/AgentContext";
import { useLogseqReady } from "@/components/LogseqReadyProvider";

function AppContent() {
  const { selectedAgent } = useAgentsInfo();
  const { ready } = useLogseqReady();

  if (!ready) {
    return <div>Loading Logseq...</div>;
  }

  return (
    <div className="w-full p-4">
      <Accordion type="single" collapsible className="w-full">
        <AccordionItem value="item-1">
          <AccordionTrigger>Seqretary</AccordionTrigger>
          <AccordionContent className="p-2 space-y-4">
            <AgentSelect />
            {selectedAgent && <ChatInterface />}
          </AccordionContent>
        </AccordionItem>
      </Accordion>
    </div>
  );
}

function App() {
  return (
    <AgentProvider>
      <AppContent />
    </AgentProvider>
  );
}

export default App;

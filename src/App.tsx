import {
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import React from "react";
import { Accordion } from "./components/ui/accordion";
import { ChatInterface } from "./components/ChatInterface";
import { AgentSelect } from "./components/AgentSelect";
import { AgentProvider, useAgentsInfo, useAgent } from "./contexts/AgentContext";
import { useLogseqReady } from "@/components/LogseqReadyProvider";
import { Button } from "./components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "./components/ui/dialog";
import { ScrollArea } from "./components/ui/scroll-area";
import { Bug } from "lucide-react";

function DebugPanel() {
  const { selectedAgent } = useAgentsInfo();
  const { systemPrompt, memory, loading } = useAgent(selectedAgent);

  return (
    <Dialog>
      <DialogTrigger asChild>
        <Button variant="ghost" size="icon" className="ml-2">
          <Bug className="h-4 w-4" />
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-3xl max-h-[90vh]">
        <DialogHeader>
          <DialogTitle>
            <div className="flex items-center gap-2">
              <Bug className="h-5 w-5" />
              Debug Panel - {selectedAgent?.name}
            </div>
          </DialogTitle>
        </DialogHeader>
        <ScrollArea className="h-[70vh] mt-4">
          <div className="space-y-6">
            <div>
              <div className="flex items-center justify-between mb-2">
                <h3 className="text-lg font-semibold">System Prompt</h3>
                {loading && <div className="text-sm text-muted-foreground">Loading...</div>}
              </div>
              <pre className="bg-muted p-4 rounded-md whitespace-pre-wrap font-mono text-sm overflow-x-auto">
                {systemPrompt || "No system prompt found"}
              </pre>
            </div>
            <div>
              <div className="flex items-center justify-between mb-2">
                <h3 className="text-lg font-semibold">Memory</h3>
                {loading && <div className="text-sm text-muted-foreground">Loading...</div>}
              </div>
              <pre className="bg-muted p-4 rounded-md whitespace-pre-wrap font-mono text-sm overflow-x-auto">
                {memory || "No memory found"}
              </pre>
            </div>
          </div>
        </ScrollArea>
      </DialogContent>
    </Dialog>
  );
}

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
            <div className="flex items-center">
              <AgentSelect />
              {selectedAgent && <DebugPanel />}
            </div>
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

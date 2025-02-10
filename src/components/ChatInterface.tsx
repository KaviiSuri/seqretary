import React from "react";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Button } from "@/components/ui/button";
import { SendHorizontal } from "lucide-react";
import { Editor } from "./Editor";
import { useAgent, useAgentsInfo } from "@/contexts/AgentContext";

interface Message {
  role: "user" | "assistant";
  content: string;
}

export function ChatInterface() {
  const [messages, setMessages] = React.useState<Message[]>([]);
  const [input, setInput] = React.useState("");
  const scrollAreaRef = React.useRef<HTMLDivElement>(null);
  const { selectedAgent } = useAgentsInfo();
  const s = useAgent(selectedAgent);
  const handleSubmit = (e?: React.FormEvent) => {
    e?.preventDefault();
    if (!input.trim()) return;

    setMessages((prev) => [...prev, { role: "user", content: input.trim() }]);
    setInput("");
  };

  return (
    <div className="flex flex-col h-[500px] max-h-[500px]">
      <ScrollArea className="flex-1 p-4 border rounded-md mb-4">
        <div className="space-y-4">
          {messages.map((message, i) => (
            <div
              key={i}
              className={`flex ${
                message.role === "user" ? "justify-end" : "justify-start"
              }`}
            >
              <div
                className={`max-w-[80%] rounded-lg px-4 py-2 ${
                  message.role === "user"
                    ? "bg-primary text-primary-foreground"
                    : "bg-muted"
                }`}
                dangerouslySetInnerHTML={{ __html: message.content }}
              />
            </div>
          ))}
        </div>
      </ScrollArea>

      <form onSubmit={handleSubmit} className="flex gap-2 items-end">
        <Editor content={input} onChange={setInput} onSubmit={handleSubmit} />
        <Button
          type="submit"
          size="icon"
          className="h-[60px] w-[60px] rounded-xl bg-primary hover:bg-primary/90 text-primary-foreground"
        >
          <SendHorizontal className="h-6 w-6" />
        </Button>
      </form>
    </div>
  );
}

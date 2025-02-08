import {
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import React from "react";
import { Accordion } from "./components/ui/accordion";
import { ChatInterface } from "./components/ChatInterface";

function App() {
  return (
    <div className="w-full p-4">
      <Accordion type="single" collapsible className="w-full">
        <AccordionItem value="item-1">
          <AccordionTrigger>Seqretary</AccordionTrigger>
          <AccordionContent className="p-2">
            <ChatInterface />
          </AccordionContent>
        </AccordionItem>
      </Accordion>
    </div>
  );
}

export default App;

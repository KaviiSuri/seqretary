import { ReactRenderer, mergeAttributes } from "@tiptap/react";
import Mention from "@tiptap/extension-mention";
import { usePageSearch } from "@/contexts/AgentContext";
import React, { useCallback, useState } from "react";
import tippy, { Instance, Props } from "tippy.js";
import "tippy.js/dist/tippy.css";
import { SuggestionProps } from "@tiptap/suggestion";

interface PageMentionListProps {
  query: string;
  command: (props: { id: string; label: string }) => void;
  editor: any;
  range: any;
}

interface PageMentionListRef {
  onKeyDown: (event: KeyboardEvent) => boolean;
}

interface MentionNodeAttrs {
  id: string;
  label: string;
}

const PageMentionList = React.forwardRef<PageMentionListRef, PageMentionListProps>(
  (props, ref) => {
    const { pages, loading } = usePageSearch(props.query);
    const [selectedIndex, setSelectedIndex] = useState(0);

    const selectItem = useCallback(
      (index: number) => {
        const page = pages[index];
        if (page) {
          props.command({ id: page.name, label: page.name });
        }
      },
      [props, pages]
    );

    const onKeyDown = useCallback(
      (event: KeyboardEvent) => {
        if (event.key === "ArrowUp") {
          setSelectedIndex((selectedIndex + pages.length - 1) % pages.length);
          return true;
        }

        if (event.key === "ArrowDown") {
          setSelectedIndex((selectedIndex + 1) % pages.length);
          return true;
        }

        if (event.key === "Enter") {
          selectItem(selectedIndex);
          event.preventDefault();
          return true;
        }

        return false;
      },
      [pages, selectedIndex, selectItem]
    );

    React.useImperativeHandle(ref, () => ({
      onKeyDown,
    }));

    if (loading) {
      return (
        <div className="z-50 w-48 overflow-hidden rounded-md border bg-popover text-popover-foreground shadow-md p-2">
          Loading...
        </div>
      );
    }

    return (
      <div className="z-50 w-48 overflow-hidden rounded-md border bg-popover text-popover-foreground shadow-md">
        <div className="p-1">
          {pages.length ? (
            <div className="space-y-1">
              {pages.slice(0, 10).map((page, index) => (
                <div
                  key={index}
                  onClick={() => selectItem(index)}
                  className={`px-2 py-1 text-sm rounded-sm cursor-pointer ${
                    index === selectedIndex
                      ? "bg-accent text-accent-foreground"
                      : ""
                  }`}
                >
                  {page.name}
                </div>
              ))}
            </div>
          ) : (
            <div className="px-2 py-1.5 text-sm text-muted-foreground text-center">
              No pages found
            </div>
          )}
        </div>
      </div>
    );
  }
);

PageMentionList.displayName = "PageMentionList";

export const createPageMentionPlugin = () => {
  return Mention.configure({
    HTMLAttributes: {
      class: "mention",
    },
    renderHTML({ node }) {
      return [
        "span",
        {
          class: "mention font-medium",
          "data-type": "mention",
          "data-id": node.attrs.id,
        },
        `[[${node.attrs.id}]]`,
      ];
    },
    suggestion: {
      char: "[[",
      items: ({ query }) => {
        return []; // Items will be handled by the MentionList component
      },
      render: () => {
        let component: ReactRenderer | null = null;
        let popup: Instance<Props>[] | null = null;

        return {
          onStart: (props: SuggestionProps) => {
            component = new ReactRenderer(PageMentionList, {
              props,
              editor: props.editor,
            });

            const clientRect = props.clientRect?.();
            if (!clientRect) return;

            popup = tippy("body", {
              getReferenceClientRect: () => clientRect,
              appendTo: () => window.parent.document.body,
              content: component.element,
              showOnCreate: true,
              interactive: true,
              trigger: "manual",
              placement: "bottom-start",
              popperOptions: {
                modifiers: [
                  {
                    name: "preventOverflow",
                    options: {
                      boundary: window.parent.document.body,
                    },
                  },
                ],
              },
            });
          },

          onUpdate: (props: SuggestionProps) => {
            component?.updateProps(props);

            const clientRect = props.clientRect?.();
            if (!clientRect) return;

            popup?.[0].setProps({
              getReferenceClientRect: () => clientRect,
            });
          },

          onKeyDown: (props) => {
            if (props.event.key === "Escape") {
              popup?.[0].hide();
              return true;
            }

            return (component?.ref as PageMentionListRef)?.onKeyDown(props.event);
          },

          onExit: () => {
            popup?.[0].destroy();
            component?.destroy();
          },
        };
      },
      allowSpaces: true,
      command: ({ editor, range, props }) => {
        // Insert the mention node with a space after it
        editor
          .chain()
          .focus()
          .insertContentAt(range, [
            {
              type: "mention",
              attrs: props as MentionNodeAttrs,
            },
            {
              type: "text",
              text: " ",
            },
          ])
          .run();
      },
    },
  });
};

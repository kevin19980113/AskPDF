import { cn } from "@/lib/utils";
import { MessageType } from "@/types/types";
import { Icons } from "@/utils/Icons";
import { format } from "date-fns";
import { forwardRef } from "react";
import ReactMarkdown from "react-markdown";

type MessageProps = {
  message: MessageType;
  isNextMessageSamePerson: boolean;
};

const Message = forwardRef<HTMLDivElement, MessageProps>(
  ({ message, isNextMessageSamePerson }, ref) => {
    return (
      <div
        className={cn("flex items-end", {
          "justify-end": message.isUserMessage,
        })}
        ref={ref}
      >
        <div
          className={cn(
            "relative flex size-6 aspect-square items-center justify-center rounded-sm",
            {
              "order-2 bg-purple-600": message.isUserMessage,
              "order-1 bg-gray-300": !message.isUserMessage,
              invisible: isNextMessageSamePerson,
            }
          )}
        >
          {message.isUserMessage ? (
            <Icons.user className="fill-zinc-200 text-zinc-200 size-3/4" />
          ) : (
            <Icons.logo className="fill-zinc-300 size-3/4" />
          )}
        </div>

        <div
          className={cn("flex flex-col space-y-2 text-base max-w-md mx-2", {
            "order-1 items-end": message.isUserMessage,
            "order-2 items-start": !message.isUserMessage,
          })}
        >
          <div
            className={cn("px-4 py-2 rounded-lg inline-block", {
              "bg-purple-600 text-white": message.isUserMessage,
              "bg-gray-200 text-gray-900": !message.isUserMessage,
              "rounded-br-none":
                !isNextMessageSamePerson && message.isUserMessage,
              "rounded-bl-none":
                !isNextMessageSamePerson && !message.isUserMessage,
            })}
          >
            {typeof message.text === "string" ? (
              <ReactMarkdown
                className={cn("max-w-prose", {
                  "text-zinc-50": message.isUserMessage,
                })}
              >
                {message.text}
              </ReactMarkdown>
            ) : (
              message.text
            )}
            {message.id !== "loading-message" ? (
              <div
                className={cn("text-xs select-none mt-2 w-full text-right", {
                  "text-zinc-500": !message.isUserMessage,
                  "text-purple-200": message.isUserMessage,
                })}
              >
                {format(new Date(message.createdAt), "HH:mm")}
              </div>
            ) : null}
          </div>
        </div>
      </div>
    );
  }
);
export default Message;

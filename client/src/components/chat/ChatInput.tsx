import { Send } from "lucide-react";
import { Button } from "../ui/button";
import { Textarea } from "../ui/textarea";
import { useChatContext } from "@/contexts/ChatContext";
import { useRef } from "react";
import { Controller, useForm } from "react-hook-form";
import { ChatInputSchemaType, chatInputSchema } from "@/lib/schema";
import { zodResolver } from "@hookform/resolvers/zod";

type ChatInputProps = {
  isDisabled?: boolean;
};

const ChatInput = ({ isDisabled }: ChatInputProps) => {
  const { sendMessage } = useChatContext();
  const { mutate: askAI, isPending } = sendMessage ?? {};

  const { handleSubmit, control, setValue, reset } =
    useForm<ChatInputSchemaType>({
      resolver: zodResolver(chatInputSchema),
    });

  const handleAskAI = async (formData: ChatInputSchemaType) => {
    if (askAI) {
      askAI({ message: formData.message, reset, setValue });
    }
  };
  return (
    <div className="absolute bottom-0 left-0 w-full">
      <div className="mx-2 flex flex-row gap-3 md:mx-4 md:last:mb-6 lg:mx-auto lg:max-w-2xl xl:max-w-3xl">
        <div className="relative flex h-full flex-1 items-stretch md:flex-col">
          <div className="relative flex flex-col w-full flex-grow p-4">
            <form className="relative" onSubmit={handleSubmit(handleAskAI)}>
              <Controller
                name="message"
                control={control}
                defaultValue=""
                rules={{ required: true }}
                render={({ field }) => (
                  <Textarea
                    {...field}
                    rows={1}
                    maxRows={10}
                    autoFocus
                    onKeyDown={(e) => {
                      if (e.key === "Enter" && !e.shiftKey) {
                        e.preventDefault();
                        if (isPending || isDisabled) return;
                        handleSubmit(handleAskAI)();
                      }
                    }}
                    placeholder="Enter your question..."
                    className="resize-none pr-12 text-base py-3 scrollbar-thumb-purple scrollbar-thumb-rounded scrollbar-track-purple scrollbar-w-2 scroll-smooth"
                  />
                )}
              />

              <Button
                disabled={isPending || isDisabled}
                className="absolute bottom-2 right-2 "
                aria-label="send message"
                type="submit"
              >
                <Send className="size-4" />
              </Button>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
};
export default ChatInput;

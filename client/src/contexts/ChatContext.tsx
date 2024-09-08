import {
  Dispatch,
  ReactNode,
  SetStateAction,
  createContext,
  useCallback,
  useContext,
  useRef,
  useState,
} from "react";
import { UseMutationResult, useMutation } from "@tanstack/react-query";
import { toast } from "sonner";
import { useToken } from "@/hooks/useToken";
import { MessageType } from "@/types/types";
import { UseFormSetValue } from "react-hook-form";

type StreamResponse = {
  isAIThinking: boolean;
  chat: MessageType[];
  setChat: Dispatch<SetStateAction<MessageType[]>>;
  sendMessage: UseMutationResult<
    ReadableStream<Uint8Array> | null,
    Error,
    {
      message: string;
      reset: () => void;
      setValue: UseFormSetValue<{
        message: string;
      }>;
    },
    void
  > | null;
};

export const ChatContext = createContext<StreamResponse>({
  isAIThinking: false,
  chat: [],
  setChat: () => {},
  sendMessage: null,
});

type ChatContextProviderProps = {
  fileId: string;
  children: ReactNode;
};

export const ChatContextProvider = ({
  fileId,
  children,
}: ChatContextProviderProps) => {
  const [chat, setChat] = useState<MessageType[]>([]);
  const [isAIThinking, setIsAIThinking] = useState(false);
  const { accessToken } = useToken();

  const setChatAsync = useCallback(
    (updater: (prevChat: MessageType[]) => MessageType[]): Promise<void> => {
      return new Promise((resolve) => {
        setChat(updater);
        resolve();
      });
    },
    [setChat]
  );

  const sendMessage = useMutation({
    mutationFn: async ({
      message,
      reset,
      setValue,
    }: {
      message: string;
      reset: () => void;
      setValue: UseFormSetValue<{
        message: string;
      }>;
    }) => {
      const res = await fetch("/api/message/send", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          authorization: `Bearer ${accessToken}`,
        },
        body: JSON.stringify({
          fileId,
          message,
        }),
      });

      if (res.status === 404) {
        throw new Error("File not found");
      }

      if (!res.ok) {
        throw new Error("Failed to send message");
      }

      return res.body;
    },
    onMutate: ({ message, reset }) => {
      setIsAIThinking(true);
      // set User's message to the chat
      reset();
      setChat((prevChat) => [
        {
          createdAt: new Date().toISOString(),
          id: crypto.randomUUID(),
          isUserMessage: true,
          text: message,
        },
        ...prevChat,
      ]);
    },
    onSuccess: async (stream, { message, setValue }) => {
      setIsAIThinking(false);
      if (!stream) {
        toast.error(
          "There was a problem sending the message. Please try again later."
        );
        return setValue("message", message);
      }

      const reader = stream.pipeThrough(new TextDecoderStream()).getReader();

      while (true) {
        const { value, done } = await reader.read();
        if (done) break;
        if (value) {
          // set AI's response§
          await setChatAsync((prevChat) => {
            const updatedChat = [...prevChat];
            if (updatedChat[0] && !updatedChat[0].isUserMessage) {
              updatedChat[0] = {
                ...updatedChat[0],
                text: updatedChat[0].text + value,
              };
            } else {
              // Add a new AI message
              updatedChat.unshift({
                createdAt: new Date().toISOString(),
                id: crypto.randomUUID(),
                isUserMessage: false,
                text: value,
              });
            }
            return updatedChat;
          });
        }
      }
    },
    onError: (error: Error, { message, setValue }) => {
      setIsAIThinking(false);
      toast.error(error.message);
      setValue("message", message);
    },
  });

  return (
    <ChatContext.Provider
      value={{
        isAIThinking,
        chat,
        setChat,
        sendMessage,
      }}
    >
      {children}
    </ChatContext.Provider>
  );
};

export const useChatContext = () => {
  return useContext(ChatContext);
};

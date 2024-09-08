import { useToken } from "@/hooks/useToken";
import { MessageType } from "@/types/types";
import { useInfiniteQuery } from "@tanstack/react-query";
import { Loader2, MessagesSquare } from "lucide-react";
import Skeleton from "react-loading-skeleton";
import { toast } from "sonner";
import Message from "./Message";
import { useChatContext } from "../../contexts/ChatContext";
import { Fragment, useEffect, useRef } from "react";
import { useIntersection } from "@mantine/hooks";

const Messages = ({ fileId }: { fileId: string }) => {
  const { accessToken } = useToken();
  const { chat, setChat, isAIThinking } = useChatContext();

  const { fetchNextPage, isFetching } = useInfiniteQuery({
    initialPageParam: 0,
    queryKey: ["messages"],
    queryFn: async ({ pageParam }) => {
      try {
        const res = await fetch(
          `/api/message/get?fileId=${fileId}${
            pageParam ? `&cursor=${pageParam}` : ""
          }`,
          {
            headers: {
              Authorization: `Bearer ${accessToken}`,
            },
          }
        );
        const data = await res.json();

        if (!res.ok) throw new Error(data.error || "Failed to fetch messages");

        setChat((prevChat) => [...prevChat, ...data.messages]);

        return {
          messages: data.messages,
          nextCursor: data.nextCursor,
        }; // one page(last page) of messages with a cursor for the next page
      } catch (error: any) {
        toast.error(error.message);
      }
    },
    getNextPageParam: (lastPage) => lastPage?.nextCursor,
  });

  const containerRef = useRef<HTMLDivElement>(null);

  const loadingMessage: MessageType = {
    createdAt: new Date().toISOString(),
    id: "loading-message",
    isUserMessage: false,
    text: (
      <span className="flex h-full items-center justify-center">
        <Loader2 className="size-4 animate-spin text-purple-400" />
      </span>
    ),
  };

  const combinedMessages = [
    ...(isAIThinking ? [loadingMessage] : []),
    ...(chat ? chat.flat() : []),
  ];

  const ref = useRef<HTMLDivElement>(null);
  const { ref: lastMessageRef, entry } = useIntersection({
    root: ref.current,
    threshold: 0.1,
  });

  useEffect(() => {
    if (entry?.isIntersecting) fetchNextPage();
  }, [entry, fetchNextPage]);

  useEffect(() => {
    if (isAIThinking && containerRef.current) {
      containerRef.current.scrollTop = containerRef.current.scrollHeight;
    }
  }, [isAIThinking]);

  return (
    <div
      ref={containerRef}
      className="flex flex-col-reverse max-h-[calc(100vh-13rem)] border-zinc-200 flex-1 gap-4 p-3 overflow-y-auto scrollbar-thumb-purple scrollbar-thumb-rounded scrollbar-w-2"
    >
      {combinedMessages && combinedMessages.length > 0 ? (
        combinedMessages.map((message, i) => {
          const isNextMessageSamePerson =
            combinedMessages[i - 1]?.isUserMessage ===
            combinedMessages[i]?.isUserMessage;

          //last message in the list passing ref for infinite scroll
          if (i === combinedMessages.length - 1) {
            return (
              <Message
                ref={lastMessageRef}
                message={message}
                isNextMessageSamePerson={isNextMessageSamePerson}
                key={message.id}
              />
            );
          } else
            return (
              <Message
                message={message}
                isNextMessageSamePerson={isNextMessageSamePerson}
                key={message.id}
              />
            );
        })
      ) : isFetching ? (
        <div className="w-full flex flex-col gap-2">
          <Skeleton className="h-16" />
          <Skeleton className="h-16" />
          <Skeleton className="h-16" />
          <Skeleton className="h-16" />
          <Skeleton className="h-16" />
        </div>
      ) : (
        <div className="flex-1 flex flex-col items-center justify-center gap-2">
          <MessagesSquare className="size-8 text-purple-500" />
          <h3 className="font-semibold text-xl">You&apos;re all set!</h3>
          <p className="text-zinc-500 text-sm">
            Ask your first question to get started.
          </p>
        </div>
      )}
    </div>
  );
};
export default Messages;

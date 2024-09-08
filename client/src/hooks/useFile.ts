import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useToken } from "./useToken";
import useAuth from "./useAuth";
import { FileType, FileUploadStatusType } from "@/types/types";
import { toast } from "sonner";
import { Dispatch, SetStateAction } from "react";

const useFile = () => {
  const { getAuthUser } = useAuth();
  const { data: authUser } = getAuthUser;
  const { accessToken } = useToken();
  const queryClient = useQueryClient();

  const getAllFiles = useQuery({
    queryKey: ["files"],
    queryFn: async () => {
      try {
        const res = await fetch(`/api/files/all/${authUser?.id}`, {
          headers: {
            Authorization: `Bearer ${accessToken}`,
          },
        });
        const data = await res.json();

        if (!res.ok) throw new Error(data.error || "Failed to fetch files.");

        return data as FileType[];
      } catch (error: any) {
        toast.error(error.message);
      }
    },
  });

  const getFile = (fileId: string) =>
    useQuery({
      queryKey: ["file"],
      queryFn: async () => {
        try {
          const res = await fetch(`/api/files/${fileId}`, {
            headers: {
              Authorization: `Bearer ${accessToken}`,
            },
          });
          const data = await res.json();

          if (!res.ok) throw new Error(data.error || "Failed to fetch file.");

          return data as FileType;
        } catch (error: any) {
          toast.error(error.message);
        }
      },
    });

  const pollingFile = useMutation({
    mutationFn: async (key: string) => {
      try {
        const res = await fetch(`/api/files/polling/${key}`, {
          headers: {
            Authorization: `Bearer ${accessToken}`,
          },
        });
        const data = await res.json();

        if (!res.ok) throw new Error(data.error || "Failed to fetch file.");

        return data as FileType;
      } catch (error: any) {
        toast.error(error.message);
      }
    },
    retry: true,
    retryDelay: 500,
  });

  const deleteFile = (
    setCurrentDeletingFile: Dispatch<SetStateAction<string | null>>
  ) =>
    useMutation({
      mutationFn: async (fileId: string) => {
        const res = await fetch(`/api/files/delete/${fileId}`, {
          method: "POST",
          headers: {
            Authorization: `Bearer ${accessToken}`,
          },
        });
        const data = await res.json();
        if (!res.ok)
          throw new Error(
            data.error || "Failed to delete file. Please try again later."
          );

        return data as FileType;
      },
      onMutate: (fileId) => {
        setCurrentDeletingFile(fileId);
      },
      onSuccess: (data) => {
        queryClient.invalidateQueries({ queryKey: ["files"] });
        toast.success(`Deleted "${data.name}`);
      },
      onError: (error: Error) => {
        toast.error(error.message);
      },
      onSettled: () => {
        setCurrentDeletingFile(null);
      },
    });

  const getFileUploadStatus = (fileId: string) =>
    useQuery({
      queryKey: ["fileUploadStatus"],
      queryFn: async () => {
        const res = await fetch(`/api/files/${fileId}`, {
          headers: {
            Authorization: `Bearer ${accessToken}`,
          },
        });
        const data = await res.json();

        if (!data) return { status: "PENDING" as const };

        return { status: data.uploadStatus } as FileUploadStatusType;
      },
      refetchInterval: ({ state }) =>
        state.data?.status === "SUCCESS" || state.data?.status === "FAILED"
          ? false
          : 500,
    });

  return { getAllFiles, getFile, deleteFile, pollingFile, getFileUploadStatus };
};

export default useFile;

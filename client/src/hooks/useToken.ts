import { create } from "zustand";

type Token = {
  accessToken: string | null;
  setAccessToken: (accessToken: string | null) => void;
};

export const useToken = create<Token>((set) => ({
  accessToken: null,
  setAccessToken: (accessToken) => set(() => ({ accessToken })),
}));

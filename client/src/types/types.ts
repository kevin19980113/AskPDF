export type UserType = {
  id: string;
  username: string;
};

export type FileType = {
  id: string;
  name: string;
  url: string;
  key: string;
  createdAt: string;
};

export type FileUploadStatusType = {
  status: "PENDING" | "SUCCESS" | "FAILED" | "PROCESSING";
};

export type MessageType = {
  id: string;
  createdAt: Date | string;
  text: string | JSX.Element;
  isUserMessage: boolean;
};

export type subscriptionPlanType = {
  stripeCurrentPeriodEnd: string | null;
  isSubscribed: boolean;
  isCanceled: boolean;
  name?: string;
};

export type ContactNotificationPayload = {
  messageId: string;
  fullName: string;
  email: string;
  phone: string | null;
  message: string;
  createdAt: string;
  businessEmail: string | null;
};

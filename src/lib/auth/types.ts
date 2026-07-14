export type AdminUser = {
  id: string;
  full_name: string;
  email: string | null;
};

export type LoginResult =
  | { success: true }
  | { success: false; error: string };

export type LogoutResult =
  | { success: true }
  | { success: false; error: string };

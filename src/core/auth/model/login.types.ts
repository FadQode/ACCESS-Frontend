export interface LoginFormState {
  email: string;
  password: string;
  rememberMe: boolean;
}

export type LoginRole = "agent" | "manager";

export interface DummyLoginAccount {
  email: string;
  password: string;
  redirectPath: `/${LoginRole}`;
  role: LoginRole;
}

export interface DummyLoginResult {
  account?: DummyLoginAccount;
  error?: string;
}

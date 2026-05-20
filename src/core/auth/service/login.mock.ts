import type {
  DummyLoginAccount,
  DummyLoginResult,
  LoginFormState,
} from "../model/login.types";

export const loginBrandContent = {
  productName: "ACCESS",
  portalLabel: "Portal Agen",
  tagline: "Tangani setiap keluhan dengan lebih percaya diri.",
  description:
    "Ruang kerja terpadu untuk tim layanan pelanggan — keluhan, konteks, dan tindak lanjut dalam satu tempat.",
  copyright: "© 2026 ACCESS",
};

export const loginFormContent = {
  title: "Masuk",
  subtitle: "Masukkan kredensial Anda untuk melanjutkan",
  emailLabel: "Email",
  emailPlaceholder: "nama@perusahaan.com",
  passwordLabel: "Kata Sandi",
  passwordPlaceholder: "••••••••",
  rememberMeLabel: "Ingat saya",
  forgotPasswordLabel: "Lupa kata sandi?",
  submitLabel: "Masuk",
  supportPrefix: "Butuh akses? Hubungi administrator Anda melalui",
  supportEmail: "support@company.com",
};

export const dummyLoginAccounts: DummyLoginAccount[] = [
  {
    email: "agent@company.com",
    password: "agent123",
    redirectPath: "/agent",
    role: "agent",
  },
  {
    email: "manager@company.com",
    password: "manager123",
    redirectPath: "/manager",
    role: "manager",
  },
];

export function validateDummyLogin({
  email,
  password,
}: LoginFormState): DummyLoginResult {
  const normalizedEmail = email.trim().toLowerCase();
  const account = dummyLoginAccounts.find((item) => {
    return item.email === normalizedEmail && item.password === password;
  });

  if (!account) {
    return {
      error: "Email atau kata sandi tidak sesuai dengan akun dummy.",
    };
  }

  return { account };
}

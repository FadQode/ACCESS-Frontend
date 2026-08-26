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
  demoTitle: "Akses demo",
  demoPasswordLabel: "Kata sandi bersama",
  emailLabel: "Email",
  emailPlaceholder: "nama@perusahaan.com",
  passwordLabel: "Kata Sandi",
  passwordPlaceholder: "••••••••",
  submitLabel: "Masuk",
  supportPrefix: "Butuh akses? Hubungi administrator Anda melalui",
  supportEmail: "support@company.com",
};

export const dummyLoginAccounts: DummyLoginAccount[] = [
  {
    email: "agent3@access.test",
    password: "password123",
    redirectPath: "/agent",
    role: "agent",
  },
  {
    email: "manager2@access.test",
    password: "password123",
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

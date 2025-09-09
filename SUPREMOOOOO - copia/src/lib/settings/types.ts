export type LanguageCode = "es" | "en" | "ca";

export interface AccountBasics {
  avatarUrl?: string | null;
  name: string;
  email: string;
  emailVerified: boolean;
}

export interface AuthChanges {
  newEmail?: string;
  currentPassword?: string;
  newPassword?: string;
}

export interface SessionInfo {
  id: string;
  createdAt: string;
  lastActiveAt?: string | null;
  ip?: string | null;
  device?: string | null;
  current?: boolean;
}

export interface LocalePrefs {
  timezone?: string | null;
  dateFormat?: "DMY" | "MDY" | "YMD";
  currency?: string | null;
}

export interface CompanyProfile {
  legalName: string;
  tradeName?: string;
  taxId: string; // CIF/NIF
  sector?: string;
  description?: string;
  website?: string;
  phone?: string;
  address?: string;
  latitude?: number | null;
  longitude?: number | null;
  logoUrl?: string | null;
  coverUrl?: string | null;
  social?: Partial<Record<"linkedin"|"twitter"|"instagram"|"facebook"|"youtube"|"tiktok", string>>;
  certifications?: Array<{ name: string; fileUrl: string }>;
  visibility: "public" | "private";
  verificationStatus?: "pending" | "approved" | "rejected";
}

export interface PersonalProfile {
  firstName: string;
  lastName: string;
  phone?: string;
  phoneVisible?: boolean;
  avatarUrl?: string | null;
  role?: string;
  bio?: string;
}

export interface NotificationPrefs {
  channels: { email: boolean; webPush: boolean };
  types: {
    messages: boolean;
    offers: boolean;
    favorites: boolean;
    productState: boolean;
    system: boolean;
  };
  frequency: "immediate" | "daily" | "weekly";
  mutedConversationIds?: string[];
  weeklyDigest?: boolean;
}

export interface PrivacyPrefs {
  contactPolicy: "all" | "verified" | "previous";
  blockedUsers?: string[];
  blockedCompanies?: string[];
  lastSeenVisible: boolean;
  analyticsConsent?: boolean;
  cookiesConsent?: boolean;
}

export interface BillingProfile {
  legalName: string;
  taxId: string;
  billingAddress: string;
  vatPreference: "included" | "excluded";
  euVatNumber?: string;
  defaultPickupAddresses?: string[];
  defaultShippingAddresses?: string[];
}

export interface PaymentMethod {
  id: string;
  provider: "stripe";
  last4?: string;
  brand?: string;
  expMonth?: number;
  expYear?: number;
  default?: boolean;
}

export interface Preferences {
  language: LanguageCode;
  fallbackLanguage: LanguageCode;
  defaultUnit?: string;
  shippingAvailableDefault?: boolean;
  minStockDefault?: number;
  templates?: {
    offer?: string;
    contract?: string;
  };
}

export interface SecuritySettings {
  twoFAEnabled: boolean;
  recoveryCodes?: string[];
  passwordPolicy?: {
    minLength?: number;
    requireSymbols?: boolean;
    requireNumbers?: boolean;
    expireDays?: number | null;
  };
  recentActivity?: Array<{
    at: string;
    ip?: string | null;
    device?: string | null;
    event: "login"|"logout"|"2fa_enabled"|"2fa_disabled"|"password_changed"|"email_changed";
  }>
}

export interface IntegrationSettings {
  calendarConnected?: boolean;
  webhooks?: Array<{ id: string; url: string; events: string[]; active: boolean }>;
  apiKeys?: Array<{ id: string; name: string; createdAt: string; scopes: string[] }>;
  erpConnected?: boolean;
}

export interface AppearanceSettings {
  theme: "light" | "dark" | "system";
  fontScale?: number; // 0.9, 1, 1.1
  highContrast?: boolean;
  reduceMotion?: boolean;
  tableDensity?: "compact" | "comfortable";
}

export interface LegalMeta {
  termsVersionAccepted?: string;
  privacyVersionAccepted?: string;
  acceptedAt?: string;
}

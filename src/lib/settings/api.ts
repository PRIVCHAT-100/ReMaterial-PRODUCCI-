/**
 * Placeholder API layer.
 * Wire these functions to your Supabase tables / RPCs.
 */
import type {
  AccountBasics, AuthChanges, SessionInfo, LocalePrefs, CompanyProfile, PersonalProfile,
  NotificationPrefs, PrivacyPrefs, BillingProfile, PaymentMethod, Preferences, SecuritySettings,
  IntegrationSettings, AppearanceSettings, LegalMeta
} from "./types";

// Example: read current account basics
export async function getAccountBasics(): Promise<AccountBasics> {
  // TODO: Replace with Supabase call
  return {
    avatarUrl: null,
    name: "Usuario",
    email: "user@example.com",
    emailVerified: true,
  };
}

export async function updateAccountBasics(patch: Partial<AccountBasics>): Promise<void> {
  // TODO: Supabase update
}

// Email / password changes
export async function changeAuth(payload: AuthChanges): Promise<void> {
  // TODO: Supabase auth update
}

// Sessions
export async function getSessions(): Promise<SessionInfo[]> {
  return [];
}
export async function revokeAllSessions(): Promise<void> {}

// Locale
export async function getLocalePrefs(): Promise<LocalePrefs> { return { timezone: "Europe/Madrid", dateFormat: "DMY", currency: "EUR" }; }
export async function updateLocalePrefs(patch: Partial<LocalePrefs>): Promise<void> {}

// Personal
export async function getPersonalProfile(): Promise<PersonalProfile> {
  return { firstName: "Nombre", lastName: "Apellido", phoneVisible: true };
}
export async function updatePersonalProfile(patch: Partial<PersonalProfile>): Promise<void> {}

// Company
export async function getCompanyProfile(): Promise<CompanyProfile> {
  return { legalName: "", tradeName: "", taxId: "", visibility: "public" };
}
export async function updateCompanyProfile(patch: Partial<CompanyProfile>): Promise<void> {}

// Notifications
export async function getNotificationPrefs(): Promise<NotificationPrefs> {
  return {
    channels: { email: true, webPush: false },
    types: { messages: true, offers: true, favorites: true, productState: true, system: true },
    frequency: "immediate",
    weeklyDigest: true,
  };
}
export async function updateNotificationPrefs(patch: Partial<NotificationPrefs>): Promise<void> {}

// Privacy
export async function getPrivacyPrefs(): Promise<PrivacyPrefs> {
  return { contactPolicy: "all", lastSeenVisible: true, analyticsConsent: true, cookiesConsent: true };
}
export async function updatePrivacyPrefs(patch: Partial<PrivacyPrefs>): Promise<void> {}

// Billing
export async function getBillingProfile(): Promise<BillingProfile> {
  return { legalName: "", taxId: "", billingAddress: "", vatPreference: "included" };
}
export async function updateBillingProfile(patch: Partial<BillingProfile>): Promise<void> {}
export async function getPaymentMethods(): Promise<PaymentMethod[]> { return []; }

// Preferences (product defaults)
export async function getPreferences(): Promise<Preferences> {
  return { language: "es", fallbackLanguage: "en", defaultUnit: "kg", shippingAvailableDefault: true, minStockDefault: 1 };
}
export async function updatePreferences(patch: Partial<Preferences>): Promise<void> {}

// Security
export async function getSecuritySettings(): Promise<SecuritySettings> {
  return { twoFAEnabled: false, recoveryCodes: [], recentActivity: [] };
}
export async function enable2FA(): Promise<{ recoveryCodes: string[] }> { return { recoveryCodes: ["AAAA-BBBB-CCCC", "DDDD-EEEE-FFFF"] }; }
export async function disable2FA(): Promise<void> {}
export async function regenerateRecoveryCodes(): Promise<string[]> { return ["GGGG-HHHH-IIII"]; }

// Integrations
export async function getIntegrations(): Promise<IntegrationSettings> { return { calendarConnected: false, webhooks: [], apiKeys: [], erpConnected: false }; }
export async function createWebhook(url: string, events: string[]): Promise<void> {}
export async function deleteWebhook(id: string): Promise<void> {}
export async function createApiKey(name: string, scopes: string[]): Promise<{ id: string; key: string }> { return { id: "new", key: "SECRET" }; }
export async function revokeApiKey(id: string): Promise<void> {}

// Appearance
export async function getAppearance(): Promise<AppearanceSettings> {
  return { theme: "system", fontScale: 1, highContrast: false, reduceMotion: false, tableDensity: "comfortable" };
}
export async function updateAppearance(patch: Partial<AppearanceSettings>): Promise<void> {}

// Legal/Support
export async function getLegalMeta(): Promise<LegalMeta> {
  return { termsVersionAccepted: "1.0.0", privacyVersionAccepted: "1.0.0", acceptedAt: new Date().toISOString() };
}

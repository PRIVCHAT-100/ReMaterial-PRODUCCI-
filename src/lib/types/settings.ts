
// === Existing types (Notifications, Privacy, Billing) ===
export type Frequency = "immediate" | "daily" | "weekly";

export type NotificationChannels = {
  email: boolean;
  web_push: boolean;
};

export type NotificationTypes = {
  messages: boolean;
  offers: boolean;
  favorites: boolean;
  product_state: boolean;
  system: boolean;
};

export type NotificationPrefs = {
  channels: NotificationChannels;
  types: NotificationTypes;
  frequency: Frequency;
  muted_conversation_ids: string[];
  weekly_digest: boolean;
};

export type ContactPermission = "all" | "verified" | "prior_contacts";

export type PrivacyPrefs = {
  who_can_contact: ContactPermission;
  blocklist: string[];
  show_last_seen: boolean;
  consent_analytics: boolean;
  consent_cookies: boolean;
};

export type TaxData = {
  legal_name: string;
  tax_id: string;
  billing_address: string;
  vat_preference: "included" | "excluded";
  eu_vat_number?: string;
};

export type Address = {
  id?: string;
  label: string;
  address: string;
  is_default_pickup?: boolean;
  is_default_shipping?: boolean;
};

export type PaymentMethod = {
  id: string;
  brand: string;
  last4: string;
  exp_month: number;
  exp_year: number;
  is_default: boolean;
};

export type Invoice = {
  id: string;
  created_at: string;
  amount: number;
  currency: string;
  download_url?: string;
};

export type BillingData = {
  tax: TaxData;
  vat_number_valid?: boolean;
  payment_methods: PaymentMethod[];
  invoices: Invoice[];
  addresses: Address[];
};

// === NEW: 8) Preferences ===
export type Language = "es" | "en" | "ca";
export type Unit = "u" | "kg" | "g" | "l" | "m" | "m2" | "m3" | "cm" | "mm";

export type OfferTemplate = {
  id?: string;
  name: string;
  body: string;
};

export type UserPreferences = {
  language: Language;
  fallback_language: Language;
  default_unit: Unit;
  default_shipping_available: boolean;
  default_min_stock: number;
  offer_templates: OfferTemplate[];
};

// === NEW: 9) Integrations ===
export type CalendarProvider = "none" | "google" | "outlook" | "custom";
export type ApiScope = "read" | "write" | "webhooks";

export type ApiKey = {
  id: string;
  name: string;
  token: string;       // NOTE: in production, store hash only
  scopes: ApiScope[];
  created_at: string;
};

export type Integrations = {
  calendar_enabled: boolean;
  calendar_provider: CalendarProvider;
  api_keys: ApiKey[];
};

// === NEW: 10) Accessibility & Appearance ===
export type Theme = "light" | "dark" | "system";
export type FontSize = "small" | "medium" | "large";
export type TableDensity = "compact" | "comfortable";

export type A11yAppearance = {
  theme: Theme;
  font_size: FontSize;
  high_contrast: boolean;
  reduce_motion: boolean;
  table_density: TableDensity;
};

// === NEW: 11) Support & Legal ===
export type LegalAcceptance = {
  terms_version: string | null;
  privacy_version: string | null;
  accepted_at: string | null;
};

export type SupportTicket = {
  id: string;
  subject: string;
  message: string;
  status: "open" | "closed";
  created_at: string;
};

export type SupportLegal = {
  legal: LegalAcceptance;
  tickets: SupportTicket[];
};

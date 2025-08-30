
export const FEATURE_FLAGS = {
  settings: {
    account: { enabled: true, change_email: false },
    security: { enabled: true },
    notifications: { enabled: true, mute_conversations: false },
    privacy: { enabled: false },
    billing: { enabled: true },
    company: { enabled: true },
    preferences: { enabled: true },
    integrations: { enabled: false },
    a11y: { enabled: true },
    support: { enabled: true, status: false },
  },
} as const;

/**
 * This file provides mock data for the settings pages when API calls fail.
 * Used for development and testing purposes only.
 */

export const MOCK_SETTINGS = {
  profile: {
    firstName: "John",
    lastName: "Doe",
    email: "john.doe@example.com",
    phone: "+1 (555) 123-4567",
    company: "Acme Inc.",
    jobTitle: "Product Manager",
    address: "123 Main Street\nSan Francisco, CA 94103",
    bio: "Experienced product manager with a passion for user-centric design and development.",
    avatarUrl: "https://randomuser.me/api/portraits/men/43.jpg"
  },
  security: {
    twoFactorEnabled: false,
    lastPasswordChange: "2023-10-15T14:30:45Z",
    notifyOnNewLogin: true
  },
  notifications: {
    email: true,
    push: true,
    updates: true,
    marketing: false
  },
  team: {
    members: [
      {
        id: "usr_1",
        name: "John Doe",
        email: "john.doe@example.com",
        role: "admin",
        avatar: "https://randomuser.me/api/portraits/men/43.jpg",
        joinedAt: "2022-05-10T09:12:33Z"
      },
      {
        id: "usr_2",
        name: "Jane Smith",
        email: "jane.smith@example.com",
        role: "manager",
        avatar: "https://randomuser.me/api/portraits/women/22.jpg",
        joinedAt: "2022-06-15T14:30:00Z"
      },
      {
        id: "usr_3",
        name: "Robert Johnson",
        email: "robert.j@example.com",
        role: "marketer",
        avatar: "https://randomuser.me/api/portraits/men/76.jpg",
        joinedAt: "2022-09-20T11:05:45Z"
      },
      {
        id: "usr_4",
        name: "Emily Davis",
        email: "emily.d@example.com",
        role: "viewer",
        avatar: "https://randomuser.me/api/portraits/women/45.jpg",
        joinedAt: "2023-01-12T16:45:22Z"
      }
    ]
  },
  billing: {
    plan: "Pro",
    nextBilling: "2023-12-31",
    paymentMethod: "Visa ending in 4242",
    invoices: [
      {
        id: "inv_2023_11",
        date: "2023-11-01",
        amount: 29.99,
        status: "paid"
      },
      {
        id: "inv_2023_10",
        date: "2023-10-01",
        amount: 29.99,
        status: "paid"
      }
    ]
  },
  email: {
    provider: "SMTP",
    host: "smtp.example.com",
    port: "587",
    username: "notifications@yourdomain.com",
    password: "••••••••••••",
    fromEmail: "notifications@yourdomain.com",
    fromName: "Your App Notifications"
  },
  whatsapp: {
    enabled: true,
    apiKey: "••••••••••••••••••••••",
    phoneNumber: "+1 (555) 987-6543",
    businessName: "Your Business"
  },
  dashboard: {
    layout: "grid",
    widgets: ["analytics", "recent-activity", "team-status", "campaign-performance"],
    refreshInterval: 5,
    defaultView: "weekly",
    theme: "light"
  }
}; 
import { AppConfigPublic } from "./types";

export const appConfig: AppConfigPublic = {
  projectName: "Rebound Relay",
  projectSlug: "rebound-relay",
  tagline: "The premier higher education consulting network",
  keywords: [
    "Rebound",
    "Relay",
    "Adaptive Group",
    "Consulting",
    "B2B",
  ],
  description:
    "Rebound Relay is the dedicated consulting platform for Adaptive Group.",
  legal: {
    address: {
      street: "Plot No 337, Workyard, Phase 2, Industrial Business &amp; Park",
      city: "Chandigarh",
      state: "Punjab",
      postalCode: "160002",
      country: "India",
    },
    email: "ssent.hq@gmail.com",
    phone: "+91 9876543210",
  },
  social: {
    twitter: "https://twitter.com/cjsingg",
    instagram: "https://instagram.com/-",
    linkedin: "https://linkedin.com/-",
    facebook: "https://facebook.com/-",
    youtube: "https://youtube.com/-",
  },
  email: {
    senderName: "Adaptive Group",
    senderEmail: "admin@adaptivegroup.com",
  },
  auth: {
    enablePasswordAuth: false, // Set to true to enable password authentication
  },
};

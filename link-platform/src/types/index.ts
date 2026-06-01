export interface Link {
  id: string;
  workspaceId: string;
  domainId?: string | null;
  folderId?: string | null;
  userId?: string | null;
  shortCode: string;
  url: string;
  title?: string | null;
  description?: string | null;
  ogTitle?: string | null;
  ogDescription?: string | null;
  ogImage?: string | null;
  utmSource?: string | null;
  utmMedium?: string | null;
  utmCampaign?: string | null;
  utmTerm?: string | null;
  utmContent?: string | null;
  password?: string | null;
  expiresAt?: Date | null;
  expiredUrl?: string | null;
  ios?: string | null;
  android?: string | null;
  geo?: string | null;
  cloaking?: boolean;
  archived?: boolean;
  publicStats?: boolean;
  clicks: number;
  lastClicked?: Date | null;
  createdAt: Date;
  updatedAt: Date;
  domain?: Domain | null;
  tags?: Tag[];
}

export interface Domain {
  id: string;
  workspaceId: string;
  slug: string;
  verified: boolean;
  primary: boolean;
  createdAt: Date;
}

export interface Tag {
  id: string;
  workspaceId: string;
  name: string;
  color: string;
  createdAt: Date;
}

export interface Folder {
  id: string;
  workspaceId: string;
  name: string;
  color: string;
  createdAt: Date;
}

export interface Workspace {
  id: string;
  name: string;
  slug: string;
  logo?: string | null;
  plan: "free" | "pro" | "business" | "enterprise";
  linksLimit: number;
  domainsLimit: number;
  usersLimit: number;
  createdAt: Date;
  updatedAt: Date;
}

export interface User {
  id: string;
  name: string;
  email: string;
  avatarUrl?: string | null;
  role: "admin" | "member" | "viewer";
  createdAt: Date;
  updatedAt: Date;
}

export interface ClickEvent {
  id: string;
  linkId: string;
  workspaceId: string;
  timestamp: Date;
  country?: string | null;
  city?: string | null;
  region?: string | null;
  device?: string | null;
  browser?: string | null;
  os?: string | null;
  referrer?: string | null;
  referrerDomain?: string | null;
}

export interface AnalyticsData {
  totalClicks: number;
  uniqueClicks: number;
  clicksByDate: { date: string; clicks: number }[];
  clicksByCountry: { country: string; clicks: number }[];
  clicksByDevice: { device: string; clicks: number }[];
  clicksByBrowser: { browser: string; clicks: number }[];
  clicksByOs: { os: string; clicks: number }[];
  clicksByReferrer: { referrer: string; clicks: number }[];
  topLinks: { shortCode: string; url: string; clicks: number }[];
}

export interface CreateLinkInput {
  url: string;
  shortCode?: string;
  title?: string;
  description?: string;
  domainId?: string;
  folderId?: string;
  tagIds?: string[];
  ogTitle?: string;
  ogDescription?: string;
  ogImage?: string;
  utmSource?: string;
  utmMedium?: string;
  utmCampaign?: string;
  utmTerm?: string;
  utmContent?: string;
  password?: string;
  expiresAt?: string;
  expiredUrl?: string;
  ios?: string;
  android?: string;
  geo?: Record<string, string>;
  cloaking?: boolean;
  publicStats?: boolean;
}

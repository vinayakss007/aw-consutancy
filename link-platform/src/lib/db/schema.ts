import { sqliteTable, text, integer, real } from "drizzle-orm/sqlite-core";
import { relations } from "drizzle-orm";

// ============ USERS & AUTH ============

export const users = sqliteTable("users", {
  id: text("id").primaryKey(),
  name: text("name").notNull(),
  email: text("email").notNull().unique(),
  passwordHash: text("password_hash").notNull(),
  avatarUrl: text("avatar_url"),
  role: text("role", { enum: ["admin", "member", "viewer"] }).default("member"),
  createdAt: integer("created_at", { mode: "timestamp" }).notNull(),
  updatedAt: integer("updated_at", { mode: "timestamp" }).notNull(),
});

// ============ WORKSPACES ============

export const workspaces = sqliteTable("workspaces", {
  id: text("id").primaryKey(),
  name: text("name").notNull(),
  slug: text("slug").notNull().unique(),
  logo: text("logo"),
  plan: text("plan", { enum: ["free", "pro", "business", "enterprise"] }).default("free"),
  linksLimit: integer("links_limit").default(25),
  domainsLimit: integer("domains_limit").default(3),
  usersLimit: integer("users_limit").default(1),
  createdAt: integer("created_at", { mode: "timestamp" }).notNull(),
  updatedAt: integer("updated_at", { mode: "timestamp" }).notNull(),
});

export const workspaceMembers = sqliteTable("workspace_members", {
  id: text("id").primaryKey(),
  workspaceId: text("workspace_id").notNull().references(() => workspaces.id),
  userId: text("user_id").notNull().references(() => users.id),
  role: text("role", { enum: ["owner", "admin", "member", "viewer"] }).default("member"),
  createdAt: integer("created_at", { mode: "timestamp" }).notNull(),
});

// ============ DOMAINS ============

export const domains = sqliteTable("domains", {
  id: text("id").primaryKey(),
  workspaceId: text("workspace_id").notNull().references(() => workspaces.id),
  slug: text("slug").notNull().unique(), // e.g., "myco.link"
  verified: integer("verified", { mode: "boolean" }).default(false),
  primary: integer("primary", { mode: "boolean" }).default(false),
  createdAt: integer("created_at", { mode: "timestamp" }).notNull(),
});

// ============ TAGS ============

export const tags = sqliteTable("tags", {
  id: text("id").primaryKey(),
  workspaceId: text("workspace_id").notNull().references(() => workspaces.id),
  name: text("name").notNull(),
  color: text("color").default("#4c6ef5"),
  createdAt: integer("created_at", { mode: "timestamp" }).notNull(),
});

// ============ FOLDERS ============

export const folders = sqliteTable("folders", {
  id: text("id").primaryKey(),
  workspaceId: text("workspace_id").notNull().references(() => workspaces.id),
  name: text("name").notNull(),
  color: text("color").default("#4c6ef5"),
  createdAt: integer("created_at", { mode: "timestamp" }).notNull(),
});

// ============ LINKS ============

export const links = sqliteTable("links", {
  id: text("id").primaryKey(),
  workspaceId: text("workspace_id").notNull().references(() => workspaces.id),
  domainId: text("domain_id").references(() => domains.id),
  folderId: text("folder_id").references(() => folders.id),
  userId: text("user_id").references(() => users.id),

  // Core link data
  shortCode: text("short_code").notNull().unique(),
  url: text("url").notNull(), // destination URL
  title: text("title"),
  description: text("description"),

  // Custom social preview
  ogTitle: text("og_title"),
  ogDescription: text("og_description"),
  ogImage: text("og_image"),

  // UTM parameters
  utmSource: text("utm_source"),
  utmMedium: text("utm_medium"),
  utmCampaign: text("utm_campaign"),
  utmTerm: text("utm_term"),
  utmContent: text("utm_content"),

  // Advanced features
  password: text("password"), // password protection
  expiresAt: integer("expires_at", { mode: "timestamp" }),
  expiredUrl: text("expired_url"), // redirect when expired

  // Targeting
  ios: text("ios"), // iOS redirect URL
  android: text("android"), // Android redirect URL
  geo: text("geo"), // JSON: { "US": "url", "UK": "url" }

  // Settings
  cloaking: integer("cloaking", { mode: "boolean" }).default(false),
  archived: integer("archived", { mode: "boolean" }).default(false),
  publicStats: integer("public_stats", { mode: "boolean" }).default(false),

  // Metrics cache
  clicks: integer("clicks").default(0),
  lastClicked: integer("last_clicked", { mode: "timestamp" }),

  createdAt: integer("created_at", { mode: "timestamp" }).notNull(),
  updatedAt: integer("updated_at", { mode: "timestamp" }).notNull(),
});

// ============ LINK TAGS (many-to-many) ============

export const linkTags = sqliteTable("link_tags", {
  id: text("id").primaryKey(),
  linkId: text("link_id").notNull().references(() => links.id),
  tagId: text("tag_id").notNull().references(() => tags.id),
});

// ============ CLICKS / ANALYTICS ============

export const clicks = sqliteTable("clicks", {
  id: text("id").primaryKey(),
  linkId: text("link_id").notNull().references(() => links.id),
  workspaceId: text("workspace_id").notNull().references(() => workspaces.id),

  // Event data
  timestamp: integer("timestamp", { mode: "timestamp" }).notNull(),
  
  // Geo data
  country: text("country"),
  city: text("city"),
  region: text("region"),
  latitude: real("latitude"),
  longitude: real("longitude"),

  // Device data
  device: text("device"), // desktop, mobile, tablet
  browser: text("browser"),
  browserVersion: text("browser_version"),
  os: text("os"),
  osVersion: text("os_version"),

  // Referrer
  referrer: text("referrer"),
  referrerDomain: text("referrer_domain"),

  // Request data
  ip: text("ip"),
  userAgent: text("user_agent"),

  // UTM captured at click time
  utmSource: text("utm_source"),
  utmMedium: text("utm_medium"),
  utmCampaign: text("utm_campaign"),
});

// ============ RELATIONS ============

export const usersRelations = relations(users, ({ many }) => ({
  workspaceMembers: many(workspaceMembers),
  links: many(links),
}));

export const workspacesRelations = relations(workspaces, ({ many }) => ({
  members: many(workspaceMembers),
  domains: many(domains),
  tags: many(tags),
  folders: many(folders),
  links: many(links),
  clicks: many(clicks),
}));

export const linksRelations = relations(links, ({ one, many }) => ({
  workspace: one(workspaces, { fields: [links.workspaceId], references: [workspaces.id] }),
  domain: one(domains, { fields: [links.domainId], references: [domains.id] }),
  folder: one(folders, { fields: [links.folderId], references: [folders.id] }),
  user: one(users, { fields: [links.userId], references: [users.id] }),
  clicks: many(clicks),
  tags: many(linkTags),
}));

export const clicksRelations = relations(clicks, ({ one }) => ({
  link: one(links, { fields: [clicks.linkId], references: [links.id] }),
  workspace: one(workspaces, { fields: [clicks.workspaceId], references: [workspaces.id] }),
}));

export const linkTagsRelations = relations(linkTags, ({ one }) => ({
  link: one(links, { fields: [linkTags.linkId], references: [links.id] }),
  tag: one(tags, { fields: [linkTags.tagId], references: [tags.id] }),
}));

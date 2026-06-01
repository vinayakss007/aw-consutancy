import Database from "better-sqlite3";
import { drizzle } from "drizzle-orm/better-sqlite3";
import * as schema from "./schema";
import path from "path";
import fs from "fs";

const dbPath = path.join(process.cwd(), "data", "links.db");

// Ensure data directory exists
const dataDir = path.dirname(dbPath);
if (!fs.existsSync(dataDir)) {
  fs.mkdirSync(dataDir, { recursive: true });
}

const sqlite = new Database(dbPath);
sqlite.pragma("journal_mode = WAL");
sqlite.pragma("foreign_keys = ON");

export const db = drizzle(sqlite, { schema });

// Initialize tables if they don't exist
sqlite.exec(`
  CREATE TABLE IF NOT EXISTS users (
    id TEXT PRIMARY KEY,
    name TEXT NOT NULL,
    email TEXT NOT NULL UNIQUE,
    password_hash TEXT NOT NULL,
    avatar_url TEXT,
    role TEXT DEFAULT 'member',
    created_at INTEGER NOT NULL,
    updated_at INTEGER NOT NULL
  );

  CREATE TABLE IF NOT EXISTS workspaces (
    id TEXT PRIMARY KEY,
    name TEXT NOT NULL,
    slug TEXT NOT NULL UNIQUE,
    logo TEXT,
    plan TEXT DEFAULT 'free',
    links_limit INTEGER DEFAULT 25,
    domains_limit INTEGER DEFAULT 3,
    users_limit INTEGER DEFAULT 1,
    created_at INTEGER NOT NULL,
    updated_at INTEGER NOT NULL
  );

  CREATE TABLE IF NOT EXISTS workspace_members (
    id TEXT PRIMARY KEY,
    workspace_id TEXT NOT NULL REFERENCES workspaces(id),
    user_id TEXT NOT NULL REFERENCES users(id),
    role TEXT DEFAULT 'member',
    created_at INTEGER NOT NULL
  );

  CREATE TABLE IF NOT EXISTS domains (
    id TEXT PRIMARY KEY,
    workspace_id TEXT NOT NULL REFERENCES workspaces(id),
    slug TEXT NOT NULL UNIQUE,
    verified INTEGER DEFAULT 0,
    "primary" INTEGER DEFAULT 0,
    created_at INTEGER NOT NULL
  );

  CREATE TABLE IF NOT EXISTS tags (
    id TEXT PRIMARY KEY,
    workspace_id TEXT NOT NULL REFERENCES workspaces(id),
    name TEXT NOT NULL,
    color TEXT DEFAULT '#4c6ef5',
    created_at INTEGER NOT NULL
  );

  CREATE TABLE IF NOT EXISTS folders (
    id TEXT PRIMARY KEY,
    workspace_id TEXT NOT NULL REFERENCES workspaces(id),
    name TEXT NOT NULL,
    color TEXT DEFAULT '#4c6ef5',
    created_at INTEGER NOT NULL
  );

  CREATE TABLE IF NOT EXISTS links (
    id TEXT PRIMARY KEY,
    workspace_id TEXT NOT NULL REFERENCES workspaces(id),
    domain_id TEXT REFERENCES domains(id),
    folder_id TEXT REFERENCES folders(id),
    user_id TEXT REFERENCES users(id),
    short_code TEXT NOT NULL UNIQUE,
    url TEXT NOT NULL,
    title TEXT,
    description TEXT,
    og_title TEXT,
    og_description TEXT,
    og_image TEXT,
    utm_source TEXT,
    utm_medium TEXT,
    utm_campaign TEXT,
    utm_term TEXT,
    utm_content TEXT,
    password TEXT,
    expires_at INTEGER,
    expired_url TEXT,
    ios TEXT,
    android TEXT,
    geo TEXT,
    cloaking INTEGER DEFAULT 0,
    archived INTEGER DEFAULT 0,
    public_stats INTEGER DEFAULT 0,
    clicks INTEGER DEFAULT 0,
    last_clicked INTEGER,
    created_at INTEGER NOT NULL,
    updated_at INTEGER NOT NULL
  );

  CREATE TABLE IF NOT EXISTS link_tags (
    id TEXT PRIMARY KEY,
    link_id TEXT NOT NULL REFERENCES links(id),
    tag_id TEXT NOT NULL REFERENCES tags(id)
  );

  CREATE TABLE IF NOT EXISTS clicks (
    id TEXT PRIMARY KEY,
    link_id TEXT NOT NULL REFERENCES links(id),
    workspace_id TEXT NOT NULL REFERENCES workspaces(id),
    timestamp INTEGER NOT NULL,
    country TEXT,
    city TEXT,
    region TEXT,
    latitude REAL,
    longitude REAL,
    device TEXT,
    browser TEXT,
    browser_version TEXT,
    os TEXT,
    os_version TEXT,
    referrer TEXT,
    referrer_domain TEXT,
    ip TEXT,
    user_agent TEXT,
    utm_source TEXT,
    utm_medium TEXT,
    utm_campaign TEXT
  );

  CREATE INDEX IF NOT EXISTS idx_links_workspace ON links(workspace_id);
  CREATE INDEX IF NOT EXISTS idx_links_short_code ON links(short_code);
  CREATE INDEX IF NOT EXISTS idx_clicks_link ON clicks(link_id);
  CREATE INDEX IF NOT EXISTS idx_clicks_workspace ON clicks(workspace_id);
  CREATE INDEX IF NOT EXISTS idx_clicks_timestamp ON clicks(timestamp);
`);

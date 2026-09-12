CREATE TABLE IF NOT EXISTS users (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  username TEXT UNIQUE NOT NULL,
  email TEXT UNIQUE NOT NULL,
  password_hash TEXT NOT NULL,
  full_name TEXT NOT NULL,
  role TEXT NOT NULL DEFAULT 'Standard User',
  role_type TEXT NOT NULL DEFAULT 'user',
  is_admin BOOLEAN NOT NULL DEFAULT FALSE,
  organization TEXT,
  bio TEXT,
  avatar_color TEXT,
  initials TEXT,
  plan TEXT,
  joined_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS urls (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  counter_id BIGINT,
  short_code TEXT UNIQUE NOT NULL,
  original_url TEXT NOT NULL,
  custom_alias TEXT,
  created_by TEXT NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  expires_at TIMESTAMPTZ,
  clicks INTEGER NOT NULL DEFAULT 0,
  xor_applied BOOLEAN NOT NULL DEFAULT FALSE
);

CREATE INDEX IF NOT EXISTS urls_created_by_idx ON urls (created_by);
CREATE INDEX IF NOT EXISTS urls_created_at_idx ON urls (created_at DESC);

CREATE TABLE IF NOT EXISTS click_events (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  url_id UUID NOT NULL REFERENCES urls (id) ON DELETE CASCADE,
  occurred_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  country TEXT,
  country_code TEXT,
  referrer TEXT,
  device TEXT,
  browser TEXT,
  cache_hit BOOLEAN NOT NULL DEFAULT FALSE,
  latency_ms REAL
);

CREATE INDEX IF NOT EXISTS click_events_url_id_idx ON click_events (url_id, occurred_at DESC);

-- Rode este arquivo no SQL Editor do Neon (uma vez).
CREATE TABLE IF NOT EXISTS contacts (
  id                BIGINT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
  name              TEXT        NOT NULL,
  email             TEXT        NOT NULL,
  project_type      TEXT        NOT NULL,
  message           TEXT        NOT NULL,
  ip_hash           TEXT,
  user_agent        TEXT,
  autoreply_sent_at TIMESTAMPTZ,
  autoreply_error   TEXT,
  created_at        TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS contacts_email_created_idx ON contacts (email, created_at DESC);
CREATE INDEX IF NOT EXISTS contacts_ip_created_idx    ON contacts (ip_hash, created_at DESC);

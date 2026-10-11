CREATE TABLE challenge_attempts (
  id uuid PRIMARY KEY,
  challenge_id text NOT NULL CHECK (challenge_id = '001'),
  challenge_version text NOT NULL,
  secret_digest text NOT NULL CHECK (secret_digest ~ '^[a-f0-9]{64}$'),
  stage text NOT NULL CHECK (stage IN ('predict','run','investigate','modify','validate','reflect','completed')),
  created_at timestamptz NOT NULL,
  updated_at timestamptz NOT NULL,
  expires_at timestamptz NOT NULL,
  completed_at timestamptz,
  prediction text CHECK (char_length(prediction) BETWEEN 1 AND 200),
  prediction_at timestamptz,
  revealed_at timestamptz,
  validation_count integer NOT NULL DEFAULT 0 CHECK (validation_count >= 0),
  CHECK (expires_at = created_at + interval '168 hours'),
  CHECK ((prediction IS NULL) = (prediction_at IS NULL)),
  CHECK (revealed_at IS NULL OR prediction_at IS NOT NULL),
  CHECK ((stage = 'completed') = (completed_at IS NOT NULL))
);
CREATE INDEX challenge_attempts_expiration ON challenge_attempts(expires_at);
CREATE TABLE attempt_evidence (
  id uuid PRIMARY KEY,
  attempt_id uuid NOT NULL REFERENCES challenge_attempts(id) ON DELETE CASCADE,
  type text NOT NULL CHECK (type IN ('investigation','modification_draft','reflection','ai_use_declaration')),
  content text NOT NULL CHECK (char_length(content) BETWEEN 1 AND 4000),
  created_at timestamptz NOT NULL,
  updated_at timestamptz NOT NULL,
  UNIQUE(attempt_id, type),
  CHECK (type <> 'modification_draft' OR char_length(content) <= 200),
  CHECK (type <> 'ai_use_declaration' OR char_length(content) <= 2000)
);
CREATE TABLE validation_runs (
  id uuid PRIMARY KEY,
  attempt_id uuid NOT NULL REFERENCES challenge_attempts(id) ON DELETE CASCADE,
  expression text NOT NULL CHECK (char_length(expression) <= 200),
  result jsonb NOT NULL CHECK (jsonb_typeof(result) = 'object' AND octet_length(result::text) <= 4096),
  sequence integer NOT NULL CHECK (sequence > 0),
  created_at timestamptz NOT NULL,
  UNIQUE(attempt_id, sequence)
);
CREATE INDEX validation_runs_history ON validation_runs(attempt_id, sequence DESC);

-- ============================================
-- Job Copilot — Migration initiale
-- Enums, Tables, RLS, Triggers
-- ============================================

-- ============================================
-- 1. ENUMS
-- ============================================

CREATE TYPE remote_preference_enum AS ENUM ('remote', 'hybrid', 'onsite', 'any');
CREATE TYPE remote_status_enum AS ENUM ('remote', 'hybrid', 'onsite', 'unknown');
CREATE TYPE interaction_type_enum AS ENUM ('view', 'save', 'dismiss', 'apply');
CREATE TYPE application_status_enum AS ENUM ('saved', 'applied', 'done');

-- ============================================
-- 2. TABLES
-- ============================================

-- profiles
CREATE TABLE profiles (
  id                  uuid PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  email               text NOT NULL,
  full_name           text,
  target_titles       text[] NOT NULL DEFAULT '{}',
  locations           text[] NOT NULL DEFAULT '{}',
  remote_preference   remote_preference_enum NOT NULL DEFAULT 'any',
  min_salary          integer,
  contract_types      text[] NOT NULL DEFAULT '{}',
  excluded_companies  text[] NOT NULL DEFAULT '{}',
  include_keywords    text[] NOT NULL DEFAULT '{}',
  exclude_keywords    text[] NOT NULL DEFAULT '{}',
  onboarding_completed boolean NOT NULL DEFAULT false,
  created_at          timestamptz NOT NULL DEFAULT now(),
  updated_at          timestamptz NOT NULL DEFAULT now()
);

-- jobs
CREATE TABLE jobs (
  id            uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  title         text NOT NULL,
  company       text NOT NULL,
  location      text,
  remote_status remote_status_enum NOT NULL DEFAULT 'unknown',
  salary_min    integer,
  salary_max    integer,
  contract_type text,
  description   text,
  source        text NOT NULL,
  source_url    text NOT NULL UNIQUE,
  source_id     text,
  published_at  timestamptz,
  dedup_hash    text NOT NULL UNIQUE,
  created_at    timestamptz NOT NULL DEFAULT now(),
  updated_at    timestamptz NOT NULL DEFAULT now()
);

-- cvs
CREATE TABLE cvs (
  id         uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id    uuid NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  label      text NOT NULL,
  tag        text,
  file_path  text NOT NULL,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

-- user_job_interactions
CREATE TABLE user_job_interactions (
  id             uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id        uuid NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  job_id         uuid NOT NULL REFERENCES jobs(id) ON DELETE CASCADE,
  type           interaction_type_enum NOT NULL,
  dismiss_reason text,
  note           text,
  score          integer,
  created_at     timestamptz NOT NULL DEFAULT now(),
  updated_at     timestamptz NOT NULL DEFAULT now(),
  UNIQUE (user_id, job_id, type)
);

-- applications
CREATE TABLE applications (
  id             uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id        uuid NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  job_id         uuid NOT NULL REFERENCES jobs(id) ON DELETE CASCADE,
  status         application_status_enum NOT NULL DEFAULT 'saved',
  note           text,
  last_action_at timestamptz NOT NULL DEFAULT now(),
  created_at     timestamptz NOT NULL DEFAULT now(),
  updated_at     timestamptz NOT NULL DEFAULT now(),
  UNIQUE (user_id, job_id)
);

-- ============================================
-- 3. TRIGGERS : updated_at
-- ============================================

CREATE OR REPLACE FUNCTION set_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trg_profiles_updated_at
  BEFORE UPDATE ON profiles
  FOR EACH ROW EXECUTE FUNCTION set_updated_at();

CREATE TRIGGER trg_jobs_updated_at
  BEFORE UPDATE ON jobs
  FOR EACH ROW EXECUTE FUNCTION set_updated_at();

CREATE TRIGGER trg_cvs_updated_at
  BEFORE UPDATE ON cvs
  FOR EACH ROW EXECUTE FUNCTION set_updated_at();

CREATE TRIGGER trg_user_job_interactions_updated_at
  BEFORE UPDATE ON user_job_interactions
  FOR EACH ROW EXECUTE FUNCTION set_updated_at();

CREATE TRIGGER trg_applications_updated_at
  BEFORE UPDATE ON applications
  FOR EACH ROW EXECUTE FUNCTION set_updated_at();

-- ============================================
-- 4. TRIGGER : création automatique de profil
-- ============================================

CREATE OR REPLACE FUNCTION handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.profiles (id, email)
  VALUES (NEW.id, NEW.email);
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE TRIGGER trg_on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION handle_new_user();

-- ============================================
-- 5. ROW LEVEL SECURITY
-- ============================================

ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE jobs ENABLE ROW LEVEL SECURITY;
ALTER TABLE cvs ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_job_interactions ENABLE ROW LEVEL SECURITY;
ALTER TABLE applications ENABLE ROW LEVEL SECURITY;

-- profiles : SELECT et UPDATE pour le propriétaire uniquement
CREATE POLICY "profiles: owner select"
  ON profiles FOR SELECT
  USING (auth.uid() = id);

CREATE POLICY "profiles: owner update"
  ON profiles FOR UPDATE
  USING (auth.uid() = id);

-- jobs : SELECT pour tout utilisateur authentifié
-- INSERT/UPDATE réservé au service_role (pas de policy = bloqué pour les users)
CREATE POLICY "jobs: authenticated select"
  ON jobs FOR SELECT
  TO authenticated
  USING (true);

-- cvs : toutes opérations pour le propriétaire
CREATE POLICY "cvs: owner all"
  ON cvs FOR ALL
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

-- user_job_interactions : toutes opérations pour le propriétaire
CREATE POLICY "user_job_interactions: owner all"
  ON user_job_interactions FOR ALL
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

-- applications : toutes opérations pour le propriétaire
CREATE POLICY "applications: owner all"
  ON applications FOR ALL
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

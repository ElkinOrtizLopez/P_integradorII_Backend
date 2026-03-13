-- ─────────────────────────────────────────────────────────────
-- AppCitas — Schema PostgreSQL
-- Ejecutar en Neon.tech (SQL Editor) antes de desplegar
-- ─────────────────────────────────────────────────────────────

-- Usuarios
CREATE TABLE IF NOT EXISTS users (
  id            SERIAL PRIMARY KEY,
  firebase_uid  VARCHAR(255) UNIQUE NOT NULL,
  email         VARCHAR(255) UNIQUE NOT NULL,
  name          VARCHAR(255),
  role          VARCHAR(50)  DEFAULT 'user',
  created_at    TIMESTAMP    DEFAULT NOW()
);

-- Credenciales (login email/contraseña)
CREATE TABLE IF NOT EXISTS auth_credentials (
  id            SERIAL PRIMARY KEY,
  user_id       INTEGER REFERENCES users(id) ON DELETE CASCADE,
  password_hash VARCHAR(255) NOT NULL,
  last_login    TIMESTAMP
);

-- Especialistas
CREATE TABLE IF NOT EXISTS especialistas (
  id            SERIAL PRIMARY KEY,
  nombre        VARCHAR(255) NOT NULL,
  especialidad  VARCHAR(255),
  biografia     TEXT,
  foto_url      VARCHAR(255),
  disponible    BOOLEAN DEFAULT true
);

-- Citas
CREATE TABLE IF NOT EXISTS citas (
  id                    SERIAL PRIMARY KEY,
  usuario_id            INTEGER REFERENCES users(id)        ON DELETE CASCADE,
  especialista_id       INTEGER REFERENCES especialistas(id) ON DELETE CASCADE,
  fecha                 DATE      NOT NULL,
  hora                  TIME      NOT NULL,
  estado                VARCHAR(50) DEFAULT 'activa',
  recordatorio_enviado  BOOLEAN     DEFAULT false,
  created_at            TIMESTAMP   DEFAULT NOW()
);

-- Servicios / Especialidades (catálogo)
CREATE TABLE IF NOT EXISTS servicios (
  id          SERIAL PRIMARY KEY,
  nombre      VARCHAR(255) NOT NULL,
  descripcion TEXT,
  precio      DECIMAL(10,2),
  duracion    INTEGER  -- minutos
);
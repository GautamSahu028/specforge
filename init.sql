-- SpecForge — MySQL initialization script
-- Runs once when the container is first created (empty volume).
-- SQLAlchemy creates the actual tables on backend startup via lifespan.

ALTER DATABASE specforge
  CHARACTER SET utf8mb4
  COLLATE utf8mb4_unicode_ci;

import "dotenv/config";
import { defineConfig } from "prisma/config";

// Robust loading for environment variables
if (!process.env.DATABASE_URL) {
  // If not in process.env, try to load it manually just in case
  // although "dotenv/config" should have handled it if .env is in CWD
}

export default defineConfig({
  schema: "prisma/schema.prisma",
  migrations: {
    path: "prisma/migrations",
  },
  datasource: {
    url: process.env.DATABASE_URL || "file:./dev.db",
  },
});

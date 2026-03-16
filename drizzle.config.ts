import { defineConfig } from 'drizzle-kit'

export default defineConfig({
  schema: './server/schema.ts',
  out: './drizzle',
  dialect: 'sqlite',
  dbCredentials: {
    url: process.env.DB_PATH || './data/tally.db',
  },
})

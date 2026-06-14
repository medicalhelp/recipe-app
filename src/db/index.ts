import { drizzle } from 'drizzle-orm/postgres-js'
import postgres from 'postgres'
import * as schema from './schema'

type Db = ReturnType<typeof drizzle<typeof schema>>
declare global { var __db: Db | undefined }

function createDb(): Db {
  const client = postgres(process.env.DATABASE_URL!, { ssl: 'require', prepare: false })
  return drizzle(client, { schema })
}

export const db = globalThis.__db ?? createDb()
if (process.env.NODE_ENV !== 'production') globalThis.__db = db

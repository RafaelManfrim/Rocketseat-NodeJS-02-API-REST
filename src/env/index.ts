import { config } from 'dotenv'

import { z } from 'zod'

if (process.env.NODE_ENV === 'test') {
  config({ path: '.env.test' })
} else {
  config()
}

const envSchema = z.object({
  NODE_ENV: z.enum(['development', 'test', 'production']).default('production'),
  DATABASE_URL: z.string(),
  PORT: z.coerce.number().default(3333),
  DATABASE_CLIENT: z.enum(['sqlite', 'pg']),
})

const { success, data, error } = envSchema.safeParse(process.env)

if (!success) {
  const message = 'Variáveis de ambiente inválidas'
  console.error(message, error.format())
  throw new Error(message)
}

export const env = data

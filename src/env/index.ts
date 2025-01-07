import 'dotenv/config'

import { z } from 'zod'

const envSchema = z.object({
  NODE_ENV: z.enum(['development', 'test', 'production']).default('production'),
  DATABASE_URL: z.string(),
  PORT: z.number().default(3333),
})

const { success, data, error } = envSchema.safeParse(process.env)

if (!success) {
  const message = 'Variáveis de ambiente inválidas'
  console.error(message, error.format())
  throw new Error(message)
}

export const env = data

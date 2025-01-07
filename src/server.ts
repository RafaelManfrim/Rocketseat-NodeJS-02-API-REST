import fastify from 'fastify'
import { knex } from './database'
import { env } from './env'

const app = fastify()

app.get('/hello', async (req, res) => {
  const tables = await knex('sqlite_schema').select('*')
  return tables
})

app
  .listen({
    port: env.PORT,
  })
  .then(() => {
    console.log('HTTP Server is running on http://localhost:3333')
  })

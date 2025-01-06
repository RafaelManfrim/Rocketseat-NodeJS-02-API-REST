import fastify from 'fastify'
import { knex } from './database'

const app = fastify()

app.get('/hello', async (req, res) => {
  const teste = await knex('sqlite_schema').select('*')
  return teste
})

app
  .listen({
    port: 3333,
  })
  .then(() => {
    console.log('HTTP Server is running on http://localhost:3333')
  })

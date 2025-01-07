import { FastifyInstance } from 'fastify'

import { knex } from '../database'

export async function transactionsRoutes(app: FastifyInstance) {
  app.get('/hello', async (req, res) => {
    const tables = await knex('sqlite_schema').select('*')
    return tables
  })
}

import { FastifyInstance } from 'fastify'
import { randomUUID } from 'crypto'
import { z } from 'zod'

import { knex } from '../database'
import { checkSessionIdExists } from '../middlewares/check-session-id-exists'

export async function transactionsRoutes(app: FastifyInstance) {
  app.get(
    '/',
    {
      preHandler: [checkSessionIdExists],
    },
    async (req, res) => {
      const sessionId = req.cookies.sessionId

      const transactions = await knex('transactions')
        .where('session_id', sessionId)
        .select('*')
      return res.send({ transactions })
    },
  )

  app.get(
    '/:id',
    {
      preHandler: [checkSessionIdExists],
    },
    async (req, res) => {
      const getTransactionParamsSchema = z.object({
        id: z.string().uuid(),
      })

      const { id } = getTransactionParamsSchema.parse(req.params)

      const sessionId = req.cookies.sessionId

      const transaction = await knex('transactions')
        .where({
          id,
          session_id: sessionId,
        })
        .first()

      if (!transaction) {
        return res.status(404).send()
      }

      return res.send({ transaction })
    },
  )

  app.post('/', async (req, res) => {
    const createTransactionBodySchema = z.object({
      title: z.string(),
      amount: z.number(),
      type: z.enum(['credit', 'debit']),
    })

    const { title, amount, type } = createTransactionBodySchema.parse(req.body)

    let sessionId = req.cookies.sessionId

    if (!sessionId) {
      sessionId = randomUUID()

      res.cookie('sessionId', sessionId, {
        path: '/',
        maxAge: 60 * 60 * 24 * 7, // 7 Days
      })
    }

    await knex('transactions')
      .insert({
        id: randomUUID(),
        title,
        amount: type === 'credit' ? amount : amount * -1,
        session_id: sessionId,
      })
      .returning('*')

    return res.status(201).send()
  })

  app.put(
    '/:id',
    {
      preHandler: [checkSessionIdExists],
    },
    async (req, res) => {
      const updateTransactionParamsSchema = z.object({
        id: z.string().uuid(),
      })

      const { id } = updateTransactionParamsSchema.parse(req.params)

      const updateTransactionBodySchema = z.object({
        title: z.string(),
        amount: z.number(),
        type: z.enum(['credit', 'debit']),
      })

      const { title, amount } = updateTransactionBodySchema.parse(req.body)

      const sessionId = req.cookies.sessionId

      const transaction = await knex('transactions')
        .where({
          id,
          session_id: sessionId,
        })
        .first()

      if (!transaction) {
        return res.status(404).send()
      }

      await knex('transactions').where('id', id).update({
        title,
        amount,
      })

      return res.send()
    },
  )

  app.delete(
    '/:id',
    {
      preHandler: [checkSessionIdExists],
    },
    async (req, res) => {
      const deleteTransactionParamsSchema = z.object({
        id: z.string().uuid(),
      })

      const { id } = deleteTransactionParamsSchema.parse(req.params)

      const sessionId = req.cookies.sessionId

      const transaction = await knex('transactions')
        .where({
          id,
          session_id: sessionId,
        })
        .first()

      if (!transaction) {
        return res.status(404).send()
      }

      await knex('transactions').where('id', id).delete()

      return res.send()
    },
  )

  app.get(
    '/summary',
    {
      preHandler: [checkSessionIdExists],
    },
    async (req, res) => {
      const sessionId = req.cookies.sessionId

      const summary = await knex('transactions')
        .where('session_id', sessionId)
        .sum('amount', { as: 'amount' })
        .first()

      return res.send({ summary })
    },
  )
}

import { FastifyInstance } from 'fastify'
import { randomUUID } from 'crypto'
import { z } from 'zod'

import { knex } from '../database'

export async function transactionsRoutes(app: FastifyInstance) {
  app.get('/', async (_, res) => {
    const transactions = await knex('transactions').select('*')
    return res.send({ transactions })
  })

  app.get('/:id', async (req, res) => {
    const getTransactionParamsSchema = z.object({
      id: z.string().uuid(),
    })

    const { id } = getTransactionParamsSchema.parse(req.params)

    const transaction = await knex('transactions').where('id', id).first()

    if (!transaction) {
      return res.status(404).send()
    }

    return res.send({ transaction })
  })

  app.post('/', async (req, res) => {
    const createTransactionBodySchema = z.object({
      title: z.string(),
      amount: z.number(),
      type: z.enum(['credit', 'debit']),
    })

    const { title, amount, type } = createTransactionBodySchema.parse(req.body)

    await knex('transactions')
      .insert({
        id: randomUUID(),
        title,
        amount: type === 'credit' ? amount : amount * -1,
      })
      .returning('*')

    return res.status(201).send()
  })

  app.put('/:id', async (req, res) => {
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

    const transaction = await knex('transactions').where('id', id).first()

    if (!transaction) {
      return res.status(404).send()
    }

    await knex('transactions').where('id', id).update({
      title,
      amount,
    })

    return res.send()
  })

  app.delete('/:id', async (req, res) => {
    const deleteTransactionParamsSchema = z.object({
      id: z.string().uuid(),
    })

    const { id } = deleteTransactionParamsSchema.parse(req.params)

    const transaction = await knex('transactions').where('id', id).first()

    if (!transaction) {
      return res.status(404).send()
    }

    await knex('transactions').where('id', id).delete()

    return res.send()
  })

  app.get('/summary', async (req, res) => {
    const summary = await knex('transactions')
      .sum('amount', { as: 'amount' })
      .first()

    return res.send({ summary })
  })
}

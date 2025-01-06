import fastify from "fastify"

const app = fastify()

app.get('/', (req, res) => {
  res.send({ hello: 'world' })
})

app.listen({
  port: 3333
}).then(() => {
  console.log('HTTP Server is running on http://localhost:3333')
})

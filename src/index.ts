import express, { NextFunction, Request, Response } from 'express'
import { deployRoute } from './routes/deploy.js'
import { errorHandler } from './errorHandler.js'
import 'dotenv/config'

const app = express()

app.use(express.json())

app.use(deployRoute)

app.use(errorHandler)

app.listen(8080, () => {
  console.log('Server started and listening on :8080')
})
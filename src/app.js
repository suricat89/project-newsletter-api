import express from 'express'
import logger from 'morgan'
import dotenv from 'dotenv-safe'

import indexRouter from './routes/index'
dotenv.config()

const app = express()

app.use(logger('dev'))
app.use(express.json())
app.use(express.urlencoded({ extended: false }))

app.use('/', indexRouter)

export default app

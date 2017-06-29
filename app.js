// @flow

import Koa from 'koa'
import views from 'koa-views'
import json from 'koa-json'
import onerror from 'koa-onerror'
import bodyparser from 'koa-bodyparser'
import logger from 'koa-logger'
import session from 'koa-session'
import index from './routes/index'
import users from './routes/users'
import install from './routes/install'
import auth from './routes/auth'

const app = new Koa()

// error handler
onerror(app)

app.keys = ['app']

// middlewares
app.use(bodyparser({
  enableTypes:['json', 'form', 'text']
}))
app.use(session(app))
app.use(json())
app.use(logger())
app.use(require('koa-static')(__dirname + '/public'))

app.use(views(__dirname + '/views', {
  extension: 'pug'
}))

// logger
app.use(async (ctx, next) => {
  const start = new Date()
  await next()
  const ms = new Date() - start
  console.log(`${ctx.method} ${ctx.url} - ${ms}ms`)
})

// routes
app.use(index.routes(), index.allowedMethods())
app.use(users.routes(), users.allowedMethods())
app.use(install.routes(), install.allowedMethods())
app.use(auth.routes(), auth.allowedMethods())

export default app

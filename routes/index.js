import fs from 'fs'
import path from 'path'
import Router from 'koa-router'

const router = Router()

router.get('/', async (ctx, next) => {


  await (new Promise((resolve, reject) => {
    fs.stat(path.resolve(__dirname, 'installed.lock'), (err, stat) => {
      if (err.code === 'ENOENT') {
        reject(err.code)
      } else {
        resolve()
      }
    })
  }))
  .then(() => {
    return ctx.render('index', {
      title: 'Hello koa2'
    })
  }, () => {
    return ctx.redirect('/install/')
  })
})

router.get('/string', async (ctx, next) => {
  ctx.body = 'koa2 string'
})

router.get('/json', async (ctx, next) => {
  ctx.body = {
    title: 'koa2 json'
  }
})

export default router

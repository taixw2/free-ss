import path from 'path'
import Router from 'koa-router'
import { fileExist } from '../lib/util.js'

const router = Router()

router.get('/', async (ctx) => {

  try {
    await fileExist(path.resolve(__dirname, '../installed.lock'))
    return ctx.render('index', {
      title: 'Hello koa2'
    })    
  } catch(e) {
    return ctx.redirect('/install/')
  }

})

router.get('/string', async (ctx) => {
  ctx.body = 'koa2 string'
})

router.get('/json', async (ctx) => {
  ctx.body = {
    title: 'koa2 json'
  }
})

export default router

import Router from 'koa-router'

import AuthController from '../controllers/AuthController.js'
import { genCode } from '../lib/util.js'

const router = Router()

const auth = new AuthController()

router.prefix('/auth')

// 登录
router.get('/login', async (ctx) => {
  await ctx.render('login', {
    token: Math.random(),
  })  
})

// 登录流程
router.post('/login', async (ctx) => {
  const { user, password, vercode } = ctx.request.body
  const verCodeResult = auth.checkCode(vercode, ctx)

  if (verCodeResult !== true) {
    await ctx.render('error', verCodeResult)
    return
  }

  const loginResult = await auth.login(user, password)
  if (loginResult.user) {
    ctx.session.loginState = loginResult
    await ctx.redirect('/')
    // wait
  } else {
    await ctx.render('error', loginResult)
  }
})

// 注册
router.get('/regist', async (ctx) => {
  await ctx.render('regist', {
    token: Math.random(),
  })
})

// 注册流程
router.post('/regist', async (ctx) => {
  const { user, password, vercode } = ctx.request.body
  const verCodeResult = auth.checkCode(vercode, ctx)

  if (verCodeResult !== true) {
    await ctx.render('error', verCodeResult)
    return
  }

  const registResult = await auth.regist(user, password, 1)

  if (registResult === true) {
    await ctx.redirect('/auth/login')
  } else {
    await ctx.render('error', registResult) 
  }

})

/**
 * 验证码
 */
router.get('/vercode', async (ctx) => {
  const buf = await genCode(ctx)
  ctx.body = buf
})


/**
 * 退出
 */
router.get('/logout', async (ctx) => {
  ctx.session.loginState = null
  await ctx.redirect('/')
})

export default router


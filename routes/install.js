import Router from 'koa-router'
import shelljs from 'shelljs'

import step0 from './install/step0.js'
import step1 from './install/step1.js'


const router = Router()


router.prefix('/install')


/**
 * 安装首页
 */
router.get('/', async (ctx, next) => {
  await ctx.render('install', step0())
})


/**
 * 安装第二步
 */
router.get('/install-step2', async (ctx) => {
  await ctx.render('install-step2')
})

/**
 * 第二步提交表单
 */
router.post('/install-step2', async (ctx) => {
  const result = await step1(ctx.request.body)
  await ctx.redirect('/install/install-step3')
})

/**
 * 第三步
 */
router.get('/install-step3', async (ctx) => {

})


export default router

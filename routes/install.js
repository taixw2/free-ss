import Router from 'koa-router'
// import shelljs from 'shelljs'

// import step0 from './install/step0.js'
// import step1 from './install/step1.js'

import InstallController from '../controllers/InstallController.js'

import { SUCCESS } from '../config/CONSTANT.js'

const router = Router()
const install = new InstallController()



router.prefix('/install')


/**
 * 安装首页
 */
router.get('/', async (ctx) => {
  await ctx.render('install', install.step1())
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
  const result = await install.step2()
  if (result.ec === SUCCESS) {
    ctx.body = 1
  } else {
    await ctx.render('error', result)
  }

})


export default router

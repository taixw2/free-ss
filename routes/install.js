const router = require('koa-router')()
const shelljs = require('shelljs')



router.prefix('/install')


/**
 * 安装首页
 */
router.get('/', async (ctx, next) => {
  await ctx.render('install', require('./install/step0.js')())
})


/**
 * 安装第二步
 */
router.get('/install-step2', async (ctx) => {
  await ctx.render('install-step2')
})


router.post('/install-step2', async (ctx) => {

  const mysqlConf = ctx.request.body

  

  ctx.body = await require('./install/step1.js')(mysqlConf)
  
})


module.exports = router

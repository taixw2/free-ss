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

/**
 * 第二步提交表单
 */
router.post('/install-step2', async (ctx) => {
  await require('./install/step1.js')(ctx.request.body)
  ctx.redirect('/install/install-step3')
})

/**
 * 第三步
 */
router.get('/install-step3', async (ctx) => {

})


module.exports = router

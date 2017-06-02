const router = require('koa-router')()
const shelljs = require('shelljs')
const formidable = require('formidable')

const form = new formidable.IncomingForm()

router.prefix('/install')

router.get('/', async (ctx, next) => {

  const testList = ['mysql', 'ssserver', 'crontab']

  const res = {
    mysql: '',
    ssserver: '',
    crontab: '',
    result: false,
  }

  let testResult = true

  testList.forEach((v) => {
    let curTest = !!shelljs.which(v)
    res[v] = curTest
    if (!curTest) testResult = false
  })

  res.result = testResult

  await ctx.render('install', Object.assign({
      otherParameters: '...',
    }, res))
})


router.get('/install-step2', async (ctx) => {
  await ctx.render('install-step2')
})

router.post('/install-step2', async (ctx) => {

  ctx.body = ctx.request.body
  
})




module.exports = router

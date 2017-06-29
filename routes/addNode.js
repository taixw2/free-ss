import Router from 'koa-router'
import NodeController from '../controllers/NodeController.js'

const nodeController = new NodeController()

const router = Router()

router.prefix('/addNodes')

// 添加节点页
router.get('/', async (ctx) => {
  await ctx.render('addNodes', {
    state: ctx.query.state,
  })
})

// 添加节点组
router.post('/addGroup', async (ctx) => {
  const result = await nodeController.addNodeGroup(ctx.request.body.groupName)

  if (result === true) {
    await ctx.redirect('/addNodes/?state=success')
  } else {
    await ctx.render('error', result)
  }

})


export default router

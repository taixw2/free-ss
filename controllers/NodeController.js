
import SQLHandle from '../lib/SQLHandle.js'
import { PARAM_MISS, SERVER_ERROR } from '../config/CONSTANT.js'
import response from './ResponseController'
import { getGuid } from '../lib/util.js'

const NodeGroup = new SQLHandle('node_group')

export default class NodeController {

  constructor() {}

  async addNodeGroup(nodeName: string): any {

    if (!nodeName) return response(PARAM_MISS)

    try {
      await NodeGroup.insert({
        node_group_id: getGuid(12),
        node_group_name: nodeName,
      }).query()
    } catch(e) {
      return response(SERVER_ERROR, e)
    }

    return true    
            
  }
  
  addNode() {

  }

  getNodeList() {

  }

  async getNodeGroupList() {
    try {
      return await NodeGroup.select('*').query()
    } catch(e) {
      return response(SERVER_ERROR, e)
    }

  }

}

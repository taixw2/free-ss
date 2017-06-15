import fs from 'fs'
import path from 'path'
import shelljs from 'shelljs' 
import ValidatorJSON from '../lib/ValidatorJSON.js'
import ImportSQL from '../lib/ImportSQL.js'
import response from './ResponseController.js'
import AuthController from './AuthController.js'

import { PARAM_MISS, SERVER_ERROR } from '../config/CONSTANT.js'
import { query } from '../sql/conn.js'

const auth = new AuthController()


/**
 * 把配置写到配置文件中
 * @param {Object} config 
 */
function insertConf(config) {
  return new Promise((resolve, reject) => {
    fs.writeFile(path.resolve(__dirname, '../sql/conf.json'), JSON.stringify(config), (err) => {
      if (err) reject(err)
      resolve()
    })
  })
}

/**
 * 加载sql文件
 * @param {*} conn mysql  
 * @param {*} callback 
 */
async function source(config) {
  try {
    const importSql = new ImportSQL(path.resolve(__dirname, '../sql/free-ss.sql'))
    await importSql.createConnectionConfig(config).importSQL()
  } catch(e) {
    console.log(e)
  }
}

export default class InstallControll{

  constructor(){

  }

  /**
   * 安装第一步，雀氏纸尿裤
   * 判定必要程序是否已经安装
   */
  step1() {

    const appList = ['mysql', 'ssserver', 'crontab']
    const appInstallResult = {
      result: true,
    }

    for(let app of appList) {
      const isExists = !!shelljs.which(app)
      appInstallResult[app] = isExists
      
      if (isExists === false) {
        appInstallResult.result = false
      }
    }

    return appInstallResult
  }

  /**
   * 安装第二步
   * 判断mysql配置信息是否正确
   * 导入free-ss.sql
   * 创建管理员用户
   */
  async step2(requestBody) {
    const mysqlConfigScheam = {
      host: { require: true, type: String },
      port: { type: [String, Number] },
      database: { type: String },
      user: { require: true, type: String },
      password: { type: String },
      adminuser: { require: true, type: String },
      adminpassword: { require: true, type: String },
    }

    try {
      const validatorConfig = new ValidatorJSON(requestBody, mysqlConfigScheam)
      await validatorConfig.validator()
    } catch(e) {
      return response(PARAM_MISS, e)
    }

    const connectionObject = {
      host: requestBody.host,
      database: requestBody.database,
      user: requestBody.user,
      password: requestBody.password,
    }

    
    // 创建数据库/ 把sql文件导入到数据库中
    try {

      if (!connectionObject.database) {
        const database = `free_ss_${Date.now().toString(16)}`
        await query(`create database ${database}`)
        connectionObject.database = database
      }

    } catch(e) {
      return response(SERVER_ERROR, e)
    }

    try {
      await insertConf(connectionObject)
    } catch(e) {
      return response(SERVER_ERROR, e)
    }
    
    try {
      await source(connectionObject)
    } catch(e) {
      return response(SERVER_ERROR, e)
    }

    const registResult = await auth.regist(requestBody.adminuser, requestBody.adminpassword, 999)

    if (registResult !== true) {
      return registResult
    }

    try {
      await this.writeSuccessLock()
    } catch(e) {
      return response(SERVER_ERROR, e)
    }

    return true    

  }

  writeSuccessLock() {
    return new Promise((resolve, reject) => {
      fs.writeFile(path.resolve(__dirname, '../installed.lock'), '', (err) => {
        if (err) reject(err)
        resolve()
      })
    })
  }

}

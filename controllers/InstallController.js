import fs from 'fs'
import path from 'path'
import shelljs from 'shelljs' 
import ValidatorJSON from '../lib/ValidatorJSON.js'
import ImportSQL from '../lib/ImportSQL.js'
import response from './ResponseController.js'
import Model from '../sql/sql.js'

import { PARAM_MISS, SERVER_ERROR, SUCCESS } from '../config/CONSTANT.js'
import { connection, query } from '../sql/conn.js'

/**
 * 把配置写到配置文件中
 * @param {Object} config 
 */
function insertConf(config) {
  return new Promise((resolve, reject) => {
    fs.writeFile(path.resolve(__dirname, '../../sql/conf.json'), JSON.stringify(config), (err) => {
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
function source(conn) {

  return new ImportSQL(path.resolve(__dirname, '../../sql/free-ss.sql'), conn)
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

    const conn = await connection(connectionObject)
    
    // 创建数据库/ 把sql文件导入到数据库中
    try {
      if (!connectionObject.database) {
        const database = `free_ss_${Date.now().toString(16)}`
        await query(conn, `create database ${database}`)
        connectionObject.database = database
        await insertConf(connectionObject)
        await source(connectionObject)
      } else {
        await insertConf(connectionObject)
        await source(connectionObject)
      }
    } catch(e) {
      console.log(e)
      return response(SERVER_ERROR, e)
    }

    const User = new Model(conn, 'user')

    try {
      await User.insert({
        user_id: +((Date.now() * Math.floor(Math.random() * 100)).toString().substr(0, 10)),
        user_type: 999,
        reg_time: ~~(Date.now() / 1000),
        last_login_time: 0,
        user: requestBody.adminuser,
        password: requestBody.adminpasswd,      
      })
      .query()
      conn.release()
    } catch(e) {
      conn.release()
      console.log(e)
      return response(SERVER_ERROR, e)
    }

    return response(SUCCESS)
    



  }

}

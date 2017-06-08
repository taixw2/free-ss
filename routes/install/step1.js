import fs from 'fs'
import path from 'path'

import { connection, query } from '../../sql/conn.js'
import { ImportSQL }  from '../../lib/ImportSQL.js'

import Sql from '../../sql/sql.js'

export default (conf) => {

  /**
   * 加载sql文件
   * @param {*} conn mysql
   * @param {*} callback 
   */
  function source(conn) {

    return new ImportSQL(path.resolve(__dirname, '../../sql/free-ss.sql'), conn)
  }

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
   * 导入sql文件到数据库
   * 如果不存在数据库则先创建一个free_ss_xxx
   */
  return new Promise(async (resolve, reject) => {
    try{

      const database = `free_ss_${Date.now().toString(16)}`

      const connectionObject = {
        host: conf.host,
        database: conf.database,
        user: conf.user,
        password: conf.password,
      }

      const conn = await connection(connectionObject)

      console.log('here1')

      if (!conf.database) {
        await query(conn, `create database ${database}`)
        conf.database = database
        await insertConf(connectionObject)
        await source(connectionObject)
      } else {
        await insertConf(connectionObject)
        await source(connectionObject)
      }

      // (new Sql(conn, 'user'))
      // .insert({
      //   user_id: (Date.now() * Math.floor(Math.random() * 100)).toString().substr(0, 10),
      //   user_type: 999,
      //   reg_time: Date.now(),
      //   last_login_time: 0,
      //   user: conf.adminuser,
      //   password: conf.adminpasswd,
      // })
      // .query()
      // conn.end()

      resolve('success')
      
    } catch(e) {
      console.log('here2')
      console.log(e)
      reject(e)
    }
  })



}





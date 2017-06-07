import fs from 'fs'
import path from 'path'

import { connection, query } from '../../sql/conn.js'
import { loadSqlFile } from '../../commons.js'

import Sql from '../../sql/sql.js'

export default (conf) => {

  /**
   * 加载sql文件
   * @param {*} conn mysql
   * @param {*} callback 
   */
  function source(conn) {
    return loadSqlFile(path.resolve(__dirname, '../../sql/free-ss.sql'))
  }

  /**
   * 导入sql文件到数据库
   * 如果不存在数据库则先创建一个free_ss_xxx
   */
  return new Promise(async (resolve, reject) => {
    try{

      const conn = await connection({
        host: conf.host,
        database: conf.database,
        user: conf.user,
        password: conf.password,
      })
      

      if (!conf.database) {
        const database = `free_ss_${Date.now().toString(16)}`
        await query(conn, `create database ${database}`)
        await source()
        conf.database = database
      } else {
        await source()
      }

      (new Sql(conn, 'user'))
      .insert({
        user_id: (Date.now() * Math.floor(Math.random() * 100)).toString().substr(0, 10),
        user_type: 999,
        reg_time: Date.now(),
        last_login_time: 0,
        user: conf.adminuser,
        password: conf.adminpasswd,
      })
      .query()

      conn.end()

      fs.writeFile(path.resolve(__dirname, '../../sql/conf.json'), JSON.stringify(conf), (err) => {
        if (err) reject(err)
        resolve()
      })
      
    } catch(e) {
      reject(e)
    }
  })



}
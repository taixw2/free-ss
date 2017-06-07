const fs = require('fs')
const path = require("path")
const { connection, query } = require("../../sql/conn.js")
const { loadSqlFile } = require("../../commons.js")

module.exports = (conf) => {

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

      

      const conn = await connection(conf)

      if (!conf.database) {
        const database = `free_ss_${Date.now().toString(16)}`
        await query(conn, `create database ${database}`)
        await source()
        conf.database = database
      } else {
        await source()
      }

      // await query(conn, 'insert ')

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
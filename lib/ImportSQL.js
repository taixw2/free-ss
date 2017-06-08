import fs from 'fs'
import mysql from 'mysql'

export default class ImportSql {

  /**
   * 
   * @param {*} conn 连接器， 允许为空
   * @param {*} filePath 
   */
  constructor(filePath, conn) {

    this.path = filePath
    this.conn = conn
    this.querys = []
    this.originalQuery = ''
    this.mysqlConf = null
  }

  /**
   * 加载sql文件
   */
  importSQL() {

    const getFileData =  new Promise((resolve, reject) => {
      fs.readFile(this.path, (err, data) => {
        if (err) {
          reject(err)
        }
        resolve(data.toString())
      })
    })

    return getFileData.then((data) => {
      this.originalQuery = data
      return this.splitSQL()
    })
  }

  /**
   * 拆分sql语句
   */
  splitSQL() {
    
    if (!this.originalQuery) return
    
    this.querys = this.originalQuery
                    .replace(/(?:\r\n|\r|\n)/g, ' ').trim() // 删除换换
                    .replace(/\/\*.*?\*\//g, ' ').trim() // 删除注释 /** */
                    .split(';')
                    .map(v => v.replace(/--.*-+/g, '  ').trim())  // 删除 -- 123注释
      
    return new Promise((resolve, reject) => {

      this.runSQL((err) => {
        if (err) reject(err)
        resolve()
      })
      .then(() => {
        // console.log('DONE')
      })
    })
                    
  }

  /**
   * 准备执行SQL
   */
  runSQL(callback) {

    if (!this.querys.length) {
      callback()
      return
    }


    this.createConnect()
    .then((conn) => {
      
      this.conn = conn
      this.runSqlQueue(callback)
    })
    
    

  }

  /**
   * 执行sql列队
   */
  runSqlQueue(callback) {

    if (!this.querys.length) {
      callback()
      return
    }
    this.conn.query(this.querys.shift(), err => callback(err))
  }

  /**
   * mysql连接
   */
  createConnect() {
    return new Promise((resolve, reject) => {
      if (this.conn) {
        resolve(this.conn)
        return
      }
      mysql.createConnection(this.mysqlConf, (err, conn) => {
        if (err) {
          reject(err)
          return
        }
        resolve(conn)
      })
    })
  }
  
  /**
   * 设置mysql的配置
   * @param {Object} config 
   */
  createConnectionConfig(config) {
    this.mysqlConf = config
  }


}


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
                    .filter(v => !!v) //后面为什么会多出一个空格来
      
    return this.connectSQL()
                    
  }

  /**
   * 连接数据库
   * 执行每一条sql语句
   */
  connectSQL(callback) {


    if (!this.querys.length) {
      callback()
      return
    }


    return this.createConnect()
    .then((pool) => {
      return new Promise((resolve, reject) => {
        this.runSqlQueue(pool, (err) => { // 这里必须一个一个按列队顺序执行，执行完或者失败后执行一下callback
          if (err) reject(err)
          resolve(pool)
        })  
      })
    })
    
    

  }

  /**
   * 执行sql列队
   */
  runSqlQueue(pool, callback, queueError) {

    if (queueError) {
      callback(queueError)
      return
    }

    if (!this.querys.length) {
      callback()
      return
    }

    pool.getConnection((err, conn) => {
      if (err) {
        conn.release()
        callback(err)
        return
      }
      const query = this.querys.shift()
      conn.query(query, (err) => {        
        conn.release()
        this.runSqlQueue(pool, callback, err)
      })
    })

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
      
      const pool = mysql.createPool(this.mysqlConf)

      pool.getConnection((err) => {
        if (err) reject(err)
        resolve(pool)
      })

    })
  }
  
  /**
   * 设置mysql的配置
   * @param {Object} config 
   */
  createConnectionConfig(config) {
    this.mysqlConf = config
    return this 
  }


}


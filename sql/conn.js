const _ = require('lodash')
const mysql = require('mysql')
const { mysqlConf } = require('./conf.js')

export function connection(conf) {
  return new Promise((resolve, reject) => {
    const conn = mysql.createConnection(mysqlConf(conf))
    conn.connect((err) => {
      if (err) {
        reject(err)
        conn.end()
      }
      resolve(conn)
    })
  })
}

export function query(conn, query) {
  return new Promise((resolve, reject) => {
    conn.query(query, (err, rows, fields) => {
      if (err) reject(err)

      resolve(rows)
    })
  })
}

export function commSql(queryString) {  
  return new Promise(async (resolve, reject) => {

    try {
      if (!!_.trim(queryString) === false) return
      const conn = await connection()
      const rows = await query(conn, _.trim(queryString))
      resolve(rows)
      conn.end()
    } catch(e) {
      reject(e)
    }

    
  })
  
}




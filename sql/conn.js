// import _ from 'lodash'
import mysql from 'mysql'
import { mysqlConf } from './conf.js'

const poolCache = {}

/**
 * 建立连接池并缓存
 * @param {Object} conf 
 */
export function connection(conf) {
  return new Promise(async (resolve, reject) => {

    // 没有失败并且已经换成了pool
    if (!poolCache['err'] && poolCache['pool']) {
      resolve(poolCache['pool'])
      return
    }

    const pool = mysql.createPool(await mysqlConf(conf))

    pool.getConnection((err, conn) => {
      poolCache.error = err
      conn.release()
      if (err) {
        reject(err)
      } else {
        poolCache.pool = pool
        resolve(pool)
      }
    })    
  })
}

/**
 * 查询
 * @param {String} query 查询语句
 */
export function query(query) {
  return new Promise(async (resolve, reject) => {

    const pool = await connection()

    pool.getConnection((err, conn) => {
      if (err) {
        poolCache.error = true
        conn.release()
        reject(err)
      }
      conn.query(query, (queryError, rows) => {
        conn.release()
        if (queryError) {
          reject(queryError)
        }
        resolve(rows[0])
      })
    })

  })
}



// export function commSql(queryString) {
//   return new Promise(async (resolve, reject) => {
//     try {
//       if (!!_.trim(queryString) === false) {
//         resolve(null) 
//         return
//       }
//       const conn = await connection()
//       const rows = await query(conn, _.trim(queryString))
//       resolve(rows)
//     } catch (e) {
//       console.log('????')
//       reject(e)
//     }
//   })
// }




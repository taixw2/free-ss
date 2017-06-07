import fs from 'fs'
import { commSql } from './sql/conn.js'


export const loadSqlFile = (sqlPath) => {
  return new Promise((resolve, reject) => {
    fs.readFile(sqlPath, (err, data) => {
      if (err) reject(err)
      const sqls = data.toString().split(';')
      sqls.forEach(async (sql) => {
        try{
          await commSql(sql)
        } catch(e) {
          console.log(e)
          reject(e)
        }
      })
      resolve()
    })    
  })
}

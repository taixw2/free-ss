const fs = require('fs')
const { commSql } = require('./sql/conn.js')

exports.loadSqlFile = (sqlPath) => {

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

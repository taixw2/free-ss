import fs from 'fs'
import path from 'path'


let confCache = null
export async function mysqlConf(options) {
  const conf = await (new Promise((resolve, reject) => {
    if (confCache) {
      resolve(confCache)
      return
    }
    fs.readFile(path.resolve(__dirname, './conf.json'), (err, data) => {
      if (err) {
        reject(err)
      }
      confCache = data.toString()
      resolve(confCache)
    })
  }))

  try {
   return Object.assign(conf ? JSON.parse(conf) : {}, options)
  } catch(e) {
    if (options) {
      return Object.assign({}, options)
    } else {
      throw new Error(e)
    }
  }
}
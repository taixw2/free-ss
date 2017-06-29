import fs from 'fs'
import captcha from 'trek-captcha'

export function fileExist(filePath) {
  return new Promise((resolve, reject) => {
    fs.stat(filePath, (err) => {
      if (err && err.code === 'ENOENT') {
        reject(err.code)
      } else {
        resolve()
      }
    })
  })
}

export async function genCode(ctx) {
  const { token, buffer } = await captcha()
  console.log(token)
  ctx.session.vercode = token
  return buffer
}

export function getGuid(maxBit = 10000) {
  return (Math.random() * Math.random()).toString().substr(2, maxBit)
}

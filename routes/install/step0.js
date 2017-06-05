const shelljs = require('shelljs')

module.exports = () => {
  const testList = ['mysql', 'ssserver', 'crontab']

  const res = {
    result: true,
  }

  testList.forEach((v) => {
    let testResult = !!shelljs.which(v)
    res[v] = testResult

    if (!testResult) {
      res.result = false
    }

  })


  return res

}


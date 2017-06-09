import { SUCCESS, PARAM_MISS, SERVER_ERROR, NO_PERMISSION, PASSWORD_FAIL, USER_FAIL } from '../config/CONSTANT.js'

const ERROR_MAP = {
  [SUCCESS]: 'ok',
  [PARAM_MISS]: '缺少必要参数',
  [SERVER_ERROR]: '服务器繁忙',
  [NO_PERMISSION]: '没有权限',
  [PASSWORD_FAIL]: '密码错误',
  [USER_FAIL]: '账号错误',
}

export default (code, data) => {
  
  return {
    ec: code,
    data: data,
    msg: ERROR_MAP[code],
  }
}

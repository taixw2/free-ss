/**
 * 注册登录验证
 */
import md5 from 'md5'
import SQLHandle from '../sql/SQLHandle.js'
import response from '../controllers/ResponseController'
import { USER_FAIL, SERVER_ERROR, PASSWORD_FAIL, CODE_FAIL } from '../config/CONSTANT.js'


export default class AuthController{

  constructor() {
    this.user = ''
    this.password = ''
    this.code = ''
  }

  /**
   * 
   * @param {String} user 
   * @param {String} password 
   * @param {Boolean} isBackgroundLogin 是否为后台登录， 场景：注册成功后直接登录
   */
  async login(user, password) {    
    const User = new SQLHandle('user')
    let userInfo = null
    
    try{
      userInfo = await User.select('user, password, auth_code').where('user', user).query()
    } catch(e) {
      return response(SERVER_ERROR, e)
    }

    if (!userInfo[0]) {
      return response(USER_FAIL)
    }

    let pwd = md5(password)

    if (userInfo.auth_code != 0) {
      pwd = md5(pwd + userInfo[0].auth_code)      
    }

    if (pwd != userInfo[0].password) {
      return response(PASSWORD_FAIL)
    }
    return userInfo[0]
   
  }


  /**
   * 注册
   * @param {String} user 
   * @param {String} password 
   */
  async regist(user, password, userType = 1) {
    this.user = user
    this.password = password

    const checkUser = await this.checkUser(user)

    if (checkUser !== false) {
      return response(USER_FAIL)
    }

    const User = new SQLHandle('user')

    try{

      const authCode = ~~(Math.random() * 10000)

      await User.insert({
        user_id: +((Date.now() * Math.floor(Math.random() * 100)).toString().substr(0, 10)),
        user_type: userType,
        reg_time: ~~(Date.now() / 1000),
        last_login_time: 0,
        user: user,
        auth_code: authCode,
        password: md5(`${md5(password)}${authCode}`),
      })
      .query()
    } catch(e) {
      return response(SERVER_ERROR, e)
    }

    return true
        

  }

  /**
   * 校验账号
   * @param {*} user 
   */
  async checkUser(user) {
    const User = new SQLHandle('user')

    const hasUser = await User.select('user').where('user', user).query()
    
    if (!hasUser[0]) return false

    return hasUser[0]
  }

  /**
   * 校验用户密码
   * @param {*} user 
   * @param {*} password 
   */
  checkPwd(password, userInfo) {

  }


  logout() {}

  checkCode(code, ctx) {
    if (code === ctx.session.vercode) return true
    return response(CODE_FAIL)
  }

}








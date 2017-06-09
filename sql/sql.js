import _ from 'lodash'
import mysql from 'mysql'


export default class Sql {

  /**
   * sql构造器
   * @param {*} conn mysql连接对象
   * @param {*} table 要操作的数据表
   */
  constructor(conn, table) {
    this.conn = conn
    this.table = table
    this.sqls = []
    // 前期规定必须绝对顺序 如: select(xxx).where({ userid: 0 }).limit(0, 5)
    // 后期sql可改为数组，在query的时候重新排序后生产sql语句，则顺序可打乱,如: select(xxx).limit(0, 5).where({ userid: 0 })

    // sqls 
    // {
    //   sql: '***',
    //   result: '***'
    // }
  }
  


  /**
   * 增
   * @param {Object} queryParam insert数据
   */
  insert(queryParam, table) {

    const insertOnTable = this.genTable(table)

    if (!_.isPlainObject(queryParam)) return

    const fields = []
    const values = []

    _.forEach(queryParam, (value, key) => {
      fields.push(key)
      values.push(this.escape(value))
    })

    this.sqls.push({
      type: 'insert',
      sql: `INSERT INTO ${insertOnTable} (${fields.join(',')}) VALUES (${values.join(',')})`,
      result: null,
    })

    return this

  }

  /**
   * 删
   * @param {String} table 
   */
  del(table) {
    const deleteOnTable = this.genTable(table)
    this.sqls.push({
      type: 'delete',
      sql: `DELETE FROM ${deleteOnTable}`,
      result: null,
    })
  }

  /**
   * 改
   * @param {Object} queryParam 
   * @param {string} table 
   */
  update(queryParam, table) {
    
    const updateOnTable = this.genTable(table)

    if (!_.isPlainObject(queryParam)) return

    const queryFields = _.map(queryParam, (value, key) => {
      return [key, value].join('=')
    }).join(',')

    this.sqls.push({
      type: 'update',
      sql: `UPDATE ${updateOnTable} ${queryFields}`,
      result: null,
    })

  }

  /**
   * 查
   * @param {Array,String} queryParam select数据
   */
  select(queryParam, table) {

    const selectOnTable = this.genTable(table)

    queryParam = this.escape(queryParam)

    if (_.isArray(queryParam)) {
      queryParam = queryParam.join(',')
    }

    this.sqls.push({
      type: 'select',
      sql: `SELECT ${queryParam} FROM ${selectOnTable}`,
      result: null,
    })

    return this

  }
  
  /**
   * where子句
   * @param {String,Array,Object} queryParam 
   */
  where(queryParam) {

    let whereParam = queryParam

    if (arguments.length === 2) {
      whereParam = {
        [arguments[0]]: arguments[1]
      }
    }

    if (arguments.length === 3) {
      whereParam = {
        [arguments[0]]: arguments[2],
        _type: arguments[1],
      }
    }

    this.lastSqlJoin(this.genWhere(whereParam))
  }

  /**
   * 构建where子句
   * @param {String,Array,Object} queryParam 
   */
  genWhere(queryParam) {
    if(_.isString(queryParam)) return queryParam

    if (_.isArray(queryParam)) {
      return _.map(queryParam, (value) => {
        return this.genWhere(value)
      }).join(',')
    }

    if (_.isPlainObject(queryParam)) {
      return _.map(queryParam, (value, key) => {
        if (key !== '_type') {
          return [key, queryParam['_type'] || '=', value ].join('')
        }
      })
    }
  }

  /**
   * 分页
   * @param {Number} offset 偏移
   * @param {Number} rows 数量
   */
  limit(offset, rows) {
    this.lastSqlJoin(`limit ${[offset, rows].join(',')}`)
    return this
  }

  /**
   * 排序
   * @param {*Array, String} fields 排序字段
   * @param {*} asc 排序方式
   */
  orderBy(fields, asc = 'ASC') {
    if (_.isArray(fields)) {
      fields = fields.join(',')
    }
    this.lastSqlJoin(`ORDER BY ${fields} ${asc}`)
    return this
  }

  /**
   * 查询
   */
  query() {

    return Promise.all(_.map(this.sqls, (v) => {
      return new Promise((resolve, reject) => {
        this.conn.query(v, (err, rows) => {
          if (err) {
            reject(err)
          } else{
            resolve(rows)
          }
        })
      })
    }))
  }

  /**
   * 连接到最后一条查询语句
   */
  lastSqlJoin(query) {
    const lastSql = _.last(this.sqls)
    if (!lastSql || lastSql.type === 'insert') return

    lastSql.sql = `${lastSql.sql} ${query}}`
  }

  /**
   * 构建table
   * @param {Array, String} tables 
   */
  genTable(tables) {
    tables = tables || this.tables
    return _.isArray(tables) ? tables.join(',') : tables
  }

  // 转义sql语句
  escape(params) {

    if (!_.isObject(params)) {
      return mysql.escape(params)
    }

    // object/array
    if (_.isPlainObject(params) || _.isArray(params)) {
      _.forEach(params, (v, k) => {
        params[k] = escape(v)
      })
      return params
    }
  }
}
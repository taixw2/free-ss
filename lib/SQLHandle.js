// @flow
import _ from 'lodash/fp'
import mysql from 'mysql'
import { query } from '../sql/conn.js'

export type sqlType = {
  type?: string,
  sql?: string,
  result?: any,
}

export default class Sql {

  table: string;
  sqls: Array<sqlType>;

  constructor(table: string) {
    this.table = table
    this.sqls = []
  }
  


  /**
   * 增
   * @param {Object} queryParam insert数据
   */
  insert(queryParam: string, table: string) {

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
  del(table: string) {
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
  update(queryParam: any, table: string) {
    
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
  select(queryParam: Array<string> | string, table: string) {

    const selectOnTable = this.genTable(table)

    // queryParam = this.escape(queryParam)

    if (Array.isArray(queryParam)) {
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
  where(queryParam: any) {

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


    this.lastSqlJoin(`WHERE ${this.genWhere(whereParam)}`)

    return this
  }

  /**
   * 构建where子句
   * @param {String,Array,Object} queryParam 
   */
  genWhere(queryParam: any):string {
    if(typeof queryParam === 'string') return queryParam

    if (_.isArray(queryParam)) {
      return _.map(queryParam, (value) => {
        return this.genWhere(value)
      }).join(',')
    }

    if (_.isPlainObject(queryParam)) {
      return _.map(queryParam, (value, key) => {
        if (key !== '_type') {
          return `${key} ${queryParam['_type'] || '='} ${this.escape(value)}`
        }
      }).join('')
    }

    return ''
  }

  /**
   * 分页
   * @param {Number} offset 偏移
   * @param {Number} rows 数量
   */
  limit(offset: number, rows: number) {
    this.lastSqlJoin(`limit ${[offset, rows].join(',')}`)
    return this
  }

  /**
   * 排序
   * @param {*Array, String} fields 排序字段
   * @param {*} asc 排序方式
   */
  orderBy(fields:Array<string> | string, asc: string = 'ASC') {
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

    return Promise.all(_.map(this.sqls, (v, i) => {
      return new Promise((resolve, reject) => {
        console.log(v.sql)
        query(v.sql)
        .then(resolve)
        .catch(reject)
      })
    }))
  }

  /**
   * 连接到最后一条查询语句
   */
  lastSqlJoin(query: string) {
    const lastSql: any = _.last(this.sqls)
    if (!lastSql || lastSql.type === 'insert') return

    lastSql.sql = `${lastSql.sql} ${query}`
  }

  /**
   * 构建table
   * @param {Array, String} tables 
   */
  genTable(tables: Array<string> | string): string {
    tables = tables || this.table
    return Array.isArray(tables) ? tables.join(',') : tables
  }

  // 转义sql语句
  escape(params: any): string {

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

    return ''
  }
}
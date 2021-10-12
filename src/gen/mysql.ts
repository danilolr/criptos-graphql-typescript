import mysql from "mysql"

export abstract class DbConnection {

  abstract query(sql: string, params?: any): Promise<DbQueryResult>
  abstract insert(sql: string, params?: any): Promise<DbInsertResult>
  abstract update(sql: string, params?: any): Promise<DbUpdateResult>

}

export interface DbQueryResult {
  ok: boolean
  results: any[]
  fields: any[]
}

export interface DbInsertResult {
  ok: boolean
  id: number
}

export interface DbUpdateResult {
  ok: boolean
}

export class DbConnectionMysql extends DbConnection {

  private connection: any

  constructor() {
    super()
    this.connection = mysql.createConnection({
      host: process.env.CRIPTOS_MYSQL_SERVER,
      user: process.env.CRIPTOS_MYSQL_USER,
      password: process.env.CRIPTOS_MYSQL_PASSWORD,
      database: process.env.CRIPTOS_MYSQL_DATABASE
   })
  }

  async query(sql: string, params?: any): Promise<DbQueryResult> {
    return new Promise((resolve, reject) => {
      this.connection.query(sql, params, function (error, results, fields) {
        if (error) {
          console.log(error)
          reject({ok: false})
          return
        }
        resolve({ok: true, results, fields})
      })
    })
  }

  async insert(sql: string, params?: any): Promise<DbInsertResult> {
    return new Promise((resolve, reject) => {
      this.connection.query(sql, params, function (error, results) {
        console.log(error)
        if (error) {
          console.log(error)
          reject({ok: false})
          return
        }
        resolve({ok: true, id: results.insertId})
      })
    })
  }

  async update(sql: string, params?: any): Promise<DbUpdateResult> {
    return new Promise((resolve, reject) => {
      this.connection.query(sql, params, function (error, results) {
        console.log(error)
        if (error) {
          console.log(error)
          reject({ok: false})
          return
        }
        resolve({ok: true})
      })
    })
  }

}
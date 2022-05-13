/** User class for message.ly */
const bcrypt = require('bcrypt');
const db = require('../db');
const jwt = require("jsonwebtoken");
const {SECRET_KEY} = require("../config");
const ExpressError = require("../expressError");
const { BCRYPT_WORK_FACTOR, DB_URI } = require("../config");



/** User of the site. */

class User {

  /** register new user -- returns
   *    {username, password, first_name, last_name, phone}
   */

  static async register({username, password, first_name, last_name, phone}) { 
    this.username = username;
    this.password = password;
    this.first_name = first_name;
    this.last_name = last_name;
    this.phone = phone;
    var current = new Date();
    let joined = current.toLocaleString;
    try{
      //hash password
      const hashedPwd = await bcrypt.hash(this.password, BCRYPT_WORK_FACTOR);
      //save the password to db
      const results = await db.query(
        `INSERT INTO users (username, password, first_name, last_name, phone, join_at, last_login_at)
        VALUES ($1, $2, $3, $4, $5, $6, $7)
        RETURNING username`,
        [this.username, hashedPwd, this.first_name, 
          this.last_name, this.phone, joined, joined]);
      
          return results.rows[0];
    }
    catch(e){
      if (e.code === '23505') {
          return next(new ExpressError("Username taken. Please pick another!", 400));
      }
    }
  }

  /** Authenticate: is this username/password valid? Returns boolean. */

  static async authenticate(username, password) { 
    this.username = username;
    this.password = password;
    try {
      const result = await db.query(
        "SELECT password FROM users WHERE username = $1",
        [username]);
    let user = result.rows[0];

    return user && await bcrypt.compare(password, user.password);
    } 
    catch (e) {
      return false;
    }

  }

  /** Update last_login_at for user */

  static async updateLoginTimestamp(username) { 
    this.username = username;
    let last_login_at = current.toLocaleString;
      const result = await db.query(
        `UPDATE users SET last_login_at=$1
        WHERE username=$2
        RETURNING username`,
        [last_login_at, this.username]);    
  }

  /** All: basic info on all users:
   * [{username, first_name, last_name, phone}, ...] */

  static async all() { 
    try{
      const results = await db.query(
        `SELECT * FROM users`);
      
          return res.json(results.rows);
    }
    catch(e){
      return next();
    }
  }

  /** Get: get user by username
   *
   * returns {username,
   *          first_name,
   *          last_name,
   *          phone,
   *          join_at,
   *          last_login_at } */

  static async get(username) {
    this.username = username;
    const results = await db.query(
      `SELECT * FROM users WHERE username = $1`,
      [this.username]);

    const user = results.rows[0];

    if (user === undefined) {
      const err = new Error(`No such user: ${this.username}`);
      err.status = 404;
      throw err;
    }

    return results.rows[0];
  }

  /** Return messages from this user.
   *
   * [{id, to_user, body, sent_at, read_at}]
   *
   * where to_user is
   *   {username, first_name, last_name, phone}
   */

  static async messagesFrom(username) { 
    this.username = username;
    const results = await db.query(
      `SELECT * FROM messages AS m 
      JOIN users AS u ON m.to_username = u.username
      WHERE to_username = $1`,
      [this.username]);

    const msg = results.rows.map(m => ({
      to_user: m.first_name,
      body: m.body
    }));

    return msg;
  }

  /** Return messages to this user.
   *
   * [{id, from_user, body, sent_at, read_at}]
   *
   * where from_user is
   *   {username, first_name, last_name, phone}
   */

  static async messagesTo(username) {
    this.username = username;
    const results = await db.query(
      `SELECT * FROM messages AS m
      JOIN users AS u ON m.from_username = u.username
      WHERE from_username = $1`,
      [this.username]);

    const msg = results.rows.map(m => ({
      id: m.id,
      from_user: m.first_name,
      body : m.body
    }));

    return msg;
   }
}


module.exports = User;
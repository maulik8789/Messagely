const express = require('express');
const router = new express.Router();
const ExpressError = require("../expressError");
const db = require("../db");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const {BCRYPT_WORK_FACTOR, SECRET_KEY} = require("../config");
const { ensureCorrectUser, authenticateJWT, ensureLoggedIn,} = require("../middleware/auth");
const User = require("../models/user");
// const { user } = require('pg/lib/defaults');

router.get('/', (res, req, next) => {
    res.send("App is working!!");
})

/** POST /login - login: {username, password} => {token}
 *
 * Make sure to update their last-login!
 *
 **/
router.post("/login", async (res,req,next) => {
    try{
        const { username, password } = req.body;
        if(!username || !password){
            throw new ExpressError("Username and Password required!", 400);
        }
        // const result = await db.query(
        //     `SELECT username, password
        //     FROM users
        //     WHERE username= $1`,
        //     [username]
        // );
        // const user = result.rows[0];
        user1.get(username);
        if(!user1){
            throw new ExpressError("Username/Password INVALID", 400);
        }
        else{
            if(await bcrypt.compare(password, user1.password)){
                const token = jwt.sign({ username }, SECRET_KEY);
                User.updateLogiTimestamp(username);
                return res.json({message: "Logged In!", token});
            }
        }
    }
    catch(e){
        return next(e);
    }
})


/** POST /register - register user: registers, logs in, and returns token.
 *
 * {username, password, first_name, last_name, phone} => {token}.
 *
 *  Make sure to update their last-login!
 */

router.post("/register", async(res, req, next) => {
    try{
        const {username, password, first_name, last_name, phone} = req.body;
        if(!username || !password || !first_name || !last_name){
            throw new ExpressError("Provide all details", 400);
        }
        let result = await User.register(username, password, first_name, last_name, phone);
        const token = jwt.sign({ username }, SECRET_KEY);
        User.updateLoginTimestamp(username);
        return res.json({message: " Successfully Signed IN and Now you are Logged In!", token});

    }
    catch(e){
        return next(e);
    }
})

module.exports = router;
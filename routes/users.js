const express = require('express');
const router = new express.Router();
const { ensureCorrectUser, authenticateJWT, ensureLoggedIn,} = require("../middleware/auth");
const User = require("../models/user");
const Message = require("../models/message");

/** GET / - get list of users.
 *
 * => {users: [{username, first_name, last_name, phone}, ...]}
 *
 **/
router.get("/all", async (res,req,next) => {
    const results = await User.all();
    return res.json({results})
})


/** GET /:username - get detail of users.
 *
 * => {user: {username, first_name, last_name, phone, join_at, last_login_at}}
 *
 **/
 router.get("/:username", ensureCorrectUser, async (res,req,next) => {
    try{
        const user = await User.get(req.params.username);
        return res.json({user});
    }
    catch(e){
        return next(e);
    }
})


/** GET /:username/to - get messages to user
 *
 * => {messages: [{id,
 *                 body,
 *                 sent_at,
 *                 read_at,
 *                 from_user: {username, first_name, last_name, phone}}, ...]}
 *
 **/
 router.get("/:username/to", ensureCorrectUser, async (res,req,next) => {
    const messages = await Message.get(req.params.username);
    return res.json({messages});
})


/** GET /:username/from - get messages from user
 *
 * => {messages: [{id,
 *                 body,
 *                 sent_at,
 *                 read_at,
 *                 to_user: {username, first_name, last_name, phone}}, ...]}
 *
 **/
 router.get("/:username/from", ensureCorrectUser, async (res,req,next) => {
    const messages = await Message.get(req.params.username);
    return res.json({messages});
})
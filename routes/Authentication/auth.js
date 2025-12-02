require('dotenv').config();

const express = require('express');
const bcrypt = require('bcrypt');
const router = express.Router();
const User = require('../../models/Users');
const { generateAccessToken, authenticateToken } = require('../../middleware/authMiddleware');



//Create a new user account Request Body
router.post('/register', async (req, res) => {
    try {
        const user = new User(req.body);
        const hashedPwd = await bcrypt.hash(req.body.password, 10);
        user.password = hashedPwd;

        const saved = await user.save();
        res.status(201).send({message: 'Account created successfully'});

    } catch (error) {
        //Duplicate Key error code
        if (error.code === 11000) {
            return (res.status(400).send('Email already exists'));
        } else {
            return (res.status(500).send('Internal server error'));
        }
    }
});

//Logs in a user Request Body
router.get('/login', async (req, res) => {
    try {

        //User using their email since it's unique for each user
        const user = await User.find({email: req.body.email});
        if (user.length === 0) return res.status(400).json({ message:'Cannot find user'});
        
        try {
            const currentUser = {name: user[0].name, email: user[0].email, role: user[0].role, id: user[0]._id};
            if (await bcrypt.compare(req.body.password, user[0].password)) {
                const accessToken = generateAccessToken(currentUser);
                res.json({token: accessToken, user: currentUser});
            } else {
                res.json({ message: 'Not allowed'})
            }
        } catch (error) {
            res.status(500).json({message: error.message});
        }

    } catch (error) {
        res.status(500).send({message: error.message});
    }
});

//Returns current logged-in user Response
router.get('/me', authenticateToken(['admin']), async (req, res) => {
    try {

        const user = await User.find();
        const userObj = {
            'id': user[0]['_id'],
            'name': user[0]["name"],
            'email': user[0]['email'],
            'role': user[0]['role']
        };

        res.json(userObj);

    } catch (error) {
        res.status(500).json({ message: error.message});
    }
});

module.exports = router;
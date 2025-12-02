const express = require('express');
const router = express.Router();
const User = require('../../models/Users');
const { authenticateToken } = require('../../middleware/authMiddleware');

const allowedRoles = ['manager'];

//Returns all users
router.get('/users', authenticateToken(allowedRoles), async (req, res) => {
    try {
        const users = await User.find();
        if (users.length === 0) return res.status(401).json({ message:'Cannot find users'});

        res.json(users);
    } catch (error) {
        res.status(500).send({message: error.message});
    }
});


//Returns a single user profile
router.get('/users/:id', authenticateToken(allowedRoles), async (req, res) => {
    try {
        const user = await User.findById(req.params.id);
        
        if (!user) return res.status(401).json({ message: "Cannot find users" });
        if (req.params.id !== user._id.toString()) return res.status(403).json({ message: "Not allowed" });

        res.json(user);
    } catch (error) {
        res.status(500).send({message: error.message});
    }
});


// Update user
router.put('/users/:id', authenticateToken(allowedRoles), async (req, res) => {
    const restricted = ['_id', 'password', 'hiredate', 'createdAt'];
    for (field of restricted) {
        if (req.body[field]) return res.status(400).json({ message: "Not allowed to modify " + field });
    }

    try {

        const user = await User.findById(req.params.id);
        if (!user) return res.status(401).json({ message: "Cannot find user" });

        const updatedUser = await User.findByIdAndUpdate(req.params.id, req.body, { new: true });
        if (!updatedUser) return res.status(500).json({ message: "Update failed" });
        
        res.send(updatedUser);
    } catch (error) {
        res.status(500).send({message: error.message});
    }
});


//Delete a user account 
router.delete('/users/:id', authenticateToken(allowedRoles), async (req, res) => {
    try {
        const user = await User.findById(req.params.id);
        if (!user) return res.status(401).json({ message: "Cannot find user" });
        
        await User.findByIdAndDelete(req.params.id);
        res.send({message: 'User has been removed'});
    } catch (error) {
        res.status(500).send({message: error.message});
    }
});


module.exports = router;
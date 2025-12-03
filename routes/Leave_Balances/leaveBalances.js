const express = require('express');
// const Leave = require('../../models/LeaveRequests');
const Users = require('../../models/Users');
const { authenticateToken } = require('../../middleware/authMiddleware');
const router = express.Router();

const allowedRoles = ['manager', 'admin', 'employee'];
const adminOnly = ['admin']

//Returns leave balances for current user
router.get('/balance', authenticateToken(allowedRoles), async (req, res) => {
    try {
        const user = await Users.findById(req.user.id);
        if (user.length === 0) return res.status(400).json({ message:'Cannot find user'});

        res.json(user.leaveBalances);
    } catch (error) {
        return (res.send({message: error.message}));
    }
});


//Adjust leave balances manually
router.put('/balance/:id', authenticateToken(adminOnly), async (req, res) => {
    try {
        const user = await Users.findByIdAndUpdate(req.params.id);
        if (!user) return res.status(400).json({ message:'Cannot find user'});

        const updatedBalance = await Users.findByIdAndUpdate(req.params.id, req.body, {new: true});
        res.json(updatedBalance.leaveBalances);
    } catch (error) {
        return (res.send({message: error.message}));
    }
});

module.exports = router;
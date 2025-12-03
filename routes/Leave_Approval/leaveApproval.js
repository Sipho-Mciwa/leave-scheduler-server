const express = require('express');
const Leave = require('../../models/LeaveRequests');
const Users = require('../../models/Users');
const { authenticateToken } = require('../../middleware/authMiddleware');
const router = express.Router();

const allowedRoles = ['manager', 'admin'];


//
router.post('/leave/:id/approve', authenticateToken(allowedRoles), async (req, res) => {
    try {
        const leaveRequest = await Leave.findById(req.params.id);
        const leaveType = leaveRequest.leaveType;
        const days = leaveRequest.days;

        if (!leaveRequest) return (res.send({message: 'Cannot find Leave Request'}));

        if (leaveRequest.leaveStatus === 'pending') {
            const user = await Users.findById(leaveRequest.employeeID);

            if (user.length === 0) return res.status(400).json({ message:'Cannot find user'});
            if (user.leaveBalances[leaveType] < days) return res.status(400).json({ message:'Insufficient leave days'});
            
            await Users.findByIdAndUpdate(leaveRequest.employeeID, {"leaveBalances": {
                'sick': (leaveType === 'sick' ? user.leaveBalances[leaveType] - days : user.leaveBalances['sick']),
                'personal': (leaveType === 'personal' ? user.leaveBalances[leaveType] - days : user.leaveBalances['personal']),
                'vacation': (leaveType === 'vacation' ? user.leaveBalances[leaveType] - days : user.leaveBalances['vacation'])
            }});

            await Leave.findByIdAndUpdate(req.params.id, {
                'leaveStatus': 'approved',
                'approverId': req.user.id
            }, {new: true});

        
            res.send({message: "Leave approved"});
        } else {
            res.send({message: "Leave already approved"});   
        }
        
    } catch (error) {
        return (res.send({message: error.message}));
    }
});


//
router.post('/leave/:id/reject', authenticateToken(allowedRoles), async (req, res) => {
    try {
        const leaveRequest = await Leave.findById(req.params.id);
        if (!leaveRequest) return (res.send({message: 'Cannot find Leave Request'}));

        if (leaveRequest.leaveStatus === 'pending') {
            await Leave.findByIdAndUpdate(req.params.id, {
                'leaveStatus': 'approved',
                'approverId': req.user.id
            }, {new: type});
            res.send({message: "Leave rejected"});
        }
        return (res.send({message: error.message}));
    } catch (error) {
        return (res.send({message: error.message}));
    }
});

module.exports = router
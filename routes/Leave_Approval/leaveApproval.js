const express = require('express');
const Leave = require('../../models/LeaveRequests');
const Users = require('../../models/Users');
const { authenticateToken } = require('../../middleware/authMiddleware');
const router = express.Router();

const allowedRoles = ['manager', 'admin'];


//
router.post('/leave/:id/approve', authenticateToken(allowedRoles), async (req, res) => {
    try {

        console.log();
        const leaveRequest = await Leave.findById(req.params.id)
        if (!leaveRequest) return (res.send({message: 'Cannot find Leave Request'}));
       
        const leaveType = leaveRequest.leaveType;
        const days = leaveRequest.days;


        if (leaveRequest.leaveStatus === 'pending') {
            const user = await Users.findById(leaveRequest.employeeId);

            if (user.length === 0) return res.status(400).json({ message:'Cannot find user'});
            if (user.leaveBalances[leaveType] < days) return res.status(400).json({ message:'Insufficient leave days'});
            
            await Users.findByIdAndUpdate(leaveRequest.employeeId, {"leaveBalances": {
                'sick': (leaveType === 'sick' ? user.leaveBalances[leaveType] - days : user.leaveBalances['sick']),
                'personal': (leaveType === 'personal' ? user.leaveBalances[leaveType] - days : user.leaveBalances['personal']),
                'vacation': (leaveType === 'vacation' ? user.leaveBalances[leaveType] - days : user.leaveBalances['vacation'])
            }});

            await Leave.findByIdAndUpdate(req.params.id, {
                'leaveStatus': 'approved',
                'approverId': req.user.id,
                'comment': req.body.comment
            }, {new: true});

        
            res.send({message: "Leave approved"});
        } else {
            res.send({message: "Leave already approved"});   
        }
        
    } catch (error) {
        return (res.send({message: error.message}));
    }
});


router.post('/leave/:id/reject', authenticateToken(allowedRoles), async (req, res) => {
    try {
        const leaveRequest = await Leave.findById(req.params.id);
        if (!leaveRequest) {
            return res.status(404).json({ message: 'Cannot find Leave Request' });
        }

        if (leaveRequest.leaveStatus !== 'pending') {
            return res.status(400).json({ message: 'Leave already processed' });
        }

        await Leave.findByIdAndUpdate(
            req.params.id,
            {
               'leaveStatus': 'rejected',
                'approverId': req.user.id,
                'comment': req.body.comment
            },
            { new: true }
        );

        return res.json({ message: "Leave rejected" });

    } catch (error) {
        return res.status(500).json({ message: error.message });
    }
});


module.exports = router
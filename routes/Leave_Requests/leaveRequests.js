const express = require('express');
const router = express.Router();
const Leave = require('../../models/LeaveRequests');
const { authenticateToken } = require('../../middleware/authMiddleware');
const moment = require('moment'); 

function getLeaveDays(startDateStr, endDateStr) {
    const startDate = moment(startDateStr);
    const endDate = moment(endDateStr);

    if (!startDate.isValid() || !endDate.isValid()) {
        return
    }

    return ({days: endDate.diff(startDate, 'days'), startDate: startDate, endDate: endDate});
}

function filterForEmployee(leaveRequests, userId) {
    const employeeLeaves = []
    leaveRequests.forEach((leave) => {
        if (leave.employeeID.toString() === userId) {
            employeeLeaves.push(leave);
        }
    });
    return (employeeLeaves);
}

const allowedRoles = ['admin', 'manager', 'employee'];

//Submit a leave request
router.post('/leave', authenticateToken(allowedRoles), async (req, res) => {

    if (!req.body.startDate || !req.body.endDate) return res.status(400).send({message: 'Please Provide dates'});
    
    try {
        const startDataObj = new Date(req.body.startDate);
        const endDateObj = new Date(req.body.endDate);
        const date = getLeaveDays(startDataObj, endDateObj);

        const leaveRequest = new Leave({
            leaveType: req.body.leaveType,
            startDate: startDataObj,
            endDate: endDateObj,
            days: date.days,
            reason: req.body.reason,
            employeeID: req.user.id,
            
        });
    
        await leaveRequest.save();
        res.status(201).send({message: 'Leave request submitted'});

    } catch (error) {
        return res.status(400).send({message: 'Invalid date format provided.'});
    }
    
});

//Returns leave requests
router.get('/leave', authenticateToken(allowedRoles), async (req, res) => {
    try {
        const leaveRequests = await Leave.find();
        if (leaveRequests.length === 0) return res.status(401).json({ message:'Cannot find leave Requests'});
        
        if (req.user.role === 'employee') return (res.json(filterForEmployee(leaveRequests, req.user.id.toString())));
        
        res.json(leaveRequests);
    } catch (error) {
        return res.status(400).send({message: error.message});
    }
});

//Return a single leave request
router.get('/leave/:id', authenticateToken(allowedRoles), async (req, res) => {
    try{
        const leaveRequest = await Leave.findById(req.params.id);
        if (!leaveRequest) return (res.send({message: 'Cannot find Leave Request'}));

        res.json(leaveRequest);
    } catch (error) {
        return (res.send({message: error.message}))
    }
});

//Update a leave request (Allowed before approval)
router.put('/leave/:id', authenticateToken(allowedRoles), async (req, res) => {
     const restricted = ['_id', 'leaveStatus', 'hiredate', 'createdAt', 'employeeID', 'days', 'updatedAt'];
    for (field of restricted) {
        if (req.body[field]) return res.status(400).json({ message: "Not allowed to modify " + field });
    }
    
    try{
        const leaveRequest = await Leave.findById(req.params.id);
        if (!leaveRequest) return (res.send({message: 'Cannot find Leave Request'}));

        if (leaveRequest.leaveStatus === 'approved') return (res.send({message: 'Cannot Update Leave Request'}));

        const updatedRequest = await Leave.findByIdAndUpdate(req.params.id, req.body, {new: true});
        if (!updatedRequest) return res.status(500).json({ message: "Cannot Update Leave Request" });

        res.json(updatedRequest);
    } catch (error) {
        return (res.send({message: error.message}))
    }
});

//Cancel a leave request
router.delete('/leave/:id', authenticateToken(allowedRoles), async (req, res) => {
    try {
        const leaveRequest = await Leave.findById(req.params.id);
        if (!leaveRequest) return res.status(401).json({ message: "Cannot find user" });
        
        await Leave.findByIdAndDelete(req.params.id);
        res.send({message: 'User has been removed'});
    } catch (error) {
        res.status(500).send({message: error.message});
    }
});


module.exports = router
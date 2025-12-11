const mongoose = require('mongoose');

const leaveSchema = new mongoose.Schema({
    employeeId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        default: null
    },
    startDate: {type: Date, default: Date.now()},
    endDate: {type: Date},
    days: {type: Number, default: 0},
    leaveType: { type: String, enum: ['personal', 'sick', 'vacation'], default: 'personal'},
    leaveStatus: { type: String, enum: ['approved', 'rejected', 'pending'], default: 'pending'},
    reason: {type: String, maxLength: 500},
    approverId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        default: null
    },
    comment: { type: String, default: ''}
}, {timestamps: true});

module.exports = mongoose.model('Leave', leaveSchema);
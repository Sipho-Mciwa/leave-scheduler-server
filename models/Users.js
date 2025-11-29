const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({
    name: {type: String, required: true, trim: true},
    email: {type: String, required: true, unique: true, lowercase: true, trim: true},
    password: {type: String, required: true},
    role: { type: String, enum: ['admin', 'manager', 'employee'], default: 'employee'},
    department: {type: String, require: true},
    hireData: {type: Date, default: Date.now},
    leaveBalances: { type: Object, default: {
        vacation: 18,
        sick: 10,
        personal: 5
    }},
}, {timestamps: true});

module.exports = mongoose.model('User', userSchema);
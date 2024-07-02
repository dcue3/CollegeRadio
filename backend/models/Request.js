// models/Request.js
const mongoose = require('mongoose');

const collegeSchema = new mongoose.Schema({
    college: { type: String, required: true, maxlength: 60 },
    letters: { type: String, required: true, maxlength: 10 },
    frequency: { type: String, required: true, maxlength: 10 }
});

module.exports = mongoose.model('Request', collegeSchema);

// models/College.js
const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const CollegeSchema = new Schema({
  letters: { type: String, required: true },
  city: { type: String, required: true },
  state: { type: String, required: true },
  link: { type: String, required: false },
  college: { type: String, required: true },
  freq: { type: String, required: true },
  location: {
    lat: { type: Number, required: false },
    lng: { type: Number, required: false }
  }
});

const College = mongoose.model('College', CollegeSchema);

module.exports = College;

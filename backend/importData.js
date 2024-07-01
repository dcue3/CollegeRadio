// importData.js
const mongoose = require('mongoose');
const College = require('./models/College'); // Import your Mongoose model
const fs = require('fs');
const path = require('path');

const mongoURI = 'mongodb://localhost:27017/colleges'; // Replace with your MongoDB URI
mongoose.connect(mongoURI, { useNewUrlParser: true, useUnifiedTopology: true });

// Read the JSON file
const jsonData = fs.readFileSync(path.resolve(__dirname, 'colleges_with_locations.json'), 'utf8');
const colleges = JSON.parse(jsonData);

// Function to import data into MongoDB
const importData = async () => {
  try {
    await College.insertMany(colleges);
    console.log('Data imported successfully');
    mongoose.connection.close();
  } catch (err) {
    console.error('Error importing data:', err);
  }
};

// Run the import function
importData();

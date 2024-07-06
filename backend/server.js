const express = require('express');
const cors = require('cors');
const axios = require('axios');
const bodyParser = require('body-parser');
const mongoose = require('mongoose');
const College = require('./models/College');
const Request = require('./models/Request');
// require('dotenv').config();
const app = express();
const port = process.env.PORT || 3001; // You can choose any port you like


app.use(cors({
  origin: 'https://dcue3.github.io', // Allow requests from this origin
  methods: ['GET', 'POST'], // Allow GET and POST requests
  allowedHeaders: ['Content-Type', 'Authorization'], // Allow these headers
}));

// Body parser middleware
app.use(express.json()); 


mongoose.connect(process.env.MONGO_URI, { useNewUrlParser: true, useUnifiedTopology: true,ssl: true,
  tlsAllowInvalidCertificates: false,
  tlsAllowInvalidHostnames: false });



  app.get('/api/maps', async (req, res) => {
  res.json({ apiKey: process.env.REACT_APP_GOOGLE_MAPS_API_KEY });
});


app.get('/api/colleges', async (req, res) => {
  try {
    const db = mongoose.connection;
    db.on('error', (error) => {
      console.error('MongoDB connection error:', error);
    });
    db.once('open', () => {
      console.log('Connected to MongoDB');
    });
    
    const colleges = await College.find({});
    console.log('Colleges fetched:', colleges);
    res.json(colleges);
  } catch (error) {
    console.error('Error fetching colleges:', error);
    res.status(500).send('Error fetching data:'+ error);
  }
});

app.get('/api/station/:callLetters/:frequency/:city', async (req, res) => {
  const { callLetters, frequency, city } = req.params;
  try {
    const response = await axios.get(`https://de1.api.radio-browser.info/json/stations/byname/${callLetters.substring(0,4)}`);
    const station = response.data.find(st => st.name.includes(frequency) );
    const stationTag = response.data.find(st => (st.tags.includes("student") || st.tags.includes("college") || st.tags.includes("university")) );
    const stationCity = response.data.find(st => st.name.includes(callLetters.substring(0,4)) );
    const response2 = await axios.get(`https://de1.api.radio-browser.info/json/stations/byname/${frequency}`);
    const stationCity2 = response2.data.find(st => st.name.includes(city) );
    const lastResort = response2.data.find(st => (st.countrycode.includes("US") && st.language.includes("english")) );
    if(stationTag){res.json({ url: stationTag.url_resolved });}
    else if (station) {
      res.json({ url: station.url });
    } else {
      if(stationCity){res.json({ url: stationCity.url });}
      else{if(stationCity2){res.json({ url: stationCity2.url });}
          else{
            if(lastResort){
              res.json({ url: lastResort.url });}
            else{res.status(404).json({ error: 'Error' });}}
          }
    }
  } catch (error) {
    res.status('Error 2');
  }
});

app.post('/api/colleges', async (req, res) => {
  const { college, letters, frequency } = req.body;

  // Validate received data
  if (!college || !letters || !frequency || college.length >= 60 || letters.length >= 10 || frequency.length >= 10) {
      return res.status(400).json({ message: 'Invalid input data' });
  }

  // Save data to MongoDB
  const newCollege = new Request({ college, letters, frequency });
  try {
      await newCollege.save();
      res.status(200).json({ message: 'Request information submitted successfully' });
  } catch (error) {
      console.error('Error saving data to MongoDB:', error);
      res.status(500).json({ message: 'Failed to save request information' });
  }// comment
});  

app.listen(port, () => console.log('Server running on port 3001'));

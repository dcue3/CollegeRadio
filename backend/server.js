const express = require('express');
const cors = require('cors');
const axios = require('axios');
const bodyParser = require('body-parser');
const mongoose = require('mongoose');
const College = require('./models/College');
const Request = require('./models/Request');
require('dotenv').config();
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
    // const db = mongoose.connection;
    // db.on('error', (error) => {
    //   console.error('MongoDB connection error:', error);
    // });
    // db.once('open', () => {
    //   console.log('Connected to MongoDB');
    // });
    const db2 = mongoose.connection.useDb('collegeradiocluster');
    const CollegeModel = db2.model('College', College.schema);
    const colleges = await CollegeModel.find();
    // const colleges = await College.find({});
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
    const response = await axios.get(`https://de1.api.radio-browser.info/json/stations/byname/${callLetters.substring(0, 4)}`);
    const stations = response.data;

    // Prioritize stations with "student", "college", or "university" tags
    const stationTag = stations.find(st => 
      st.tags.includes("student") || st.tags.includes("college") || st.tags.includes("university")
    );

    if (stationTag) {
      return res.json({ url: stationTag.url_resolved });
    }

    // Then check for the station by frequency
    const stationByFrequency = stations.find(st => st.name.includes(frequency));
    if (stationByFrequency) {
      return res.json({ url: stationByFrequency.url_resolved });
    }

    // Then check for the station by call letters
    const stationByCallLetters = stations.find(st => st.name.includes(callLetters.substring(0, 4)));
    if (stationByCallLetters) {
      return res.json({ url: stationByCallLetters.url_resolved });
    }

    // Fetch additional data by frequency
    const response2 = await axios.get(`https://de1.api.radio-browser.info/json/stations/byname/${frequency}`);
    const stationsByFrequency = response2.data;

    //fetch by frequency AND tagged student radio
    const stationTagFreq = stationsByFrequency.find(st => 
      st.tags.includes("student") || st.tags.includes("college") || st.tags.includes("university")
    );
    if (stationTagFreq) {
      return res.json({ url: stationTagFreq.url_resolved });
    }

    // Check for the station by city in the additional data
    const stationByCity = stationsByFrequency.find(st => st.name.includes(city));
    if (stationByCity) {
      return res.json({ url: stationByCity.url_resolved });
    }

    // Fallback to the last resort
    const lastResort = stationsByFrequency.find(st => st.countrycode.includes("US") && st.language.includes("english"));
    if (lastResort) {
      return res.json({ url: lastResort.url_resolved });
    }

    // If no stations are found
    res.status(404).json({ error: 'No matching station found' });
  } catch (error) {
    res.status(500).json({ error: 'Internal Server Error' });
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

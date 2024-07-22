import React, { useEffect, useState, useRef } from 'react';
import axios from 'axios';
import { Loader } from '@googlemaps/js-api-loader';

const GoogleMap = () => {
  const [map, setMap] = useState(null);
  const [nowPlaying, setNowPlaying] = useState({ college: '', station: '', logo: '' });
  const audioPlayerRef = useRef(null);
  const [formData, setFormData] = useState({
    college: '',
    letters: '',
    frequency: '',
  });

  useEffect(() => {
    const fetchApiKey = async () => {
      try {
        const response = await axios.get('https://collegeradiobackend-16c4036a90b1.herokuapp.com/api/maps');
        const apiKey = response.data.apiKey;

        const loader = new Loader({
          apiKey: apiKey,
          version: 'weekly',
        });

        loader.load().then(() => {
          const map = new window.google.maps.Map(document.getElementById('map'), {
            center: { lat: 39.8283, lng: -98.5795 }, // Center of the US
            zoom: 4,
            mapId: '9ec1858c928df1cc',
          });
          setMap(map);
        }).catch(error => {
          console.error('Error loading Google Maps API:', error);
        });
      } catch (error) {
        console.error('Error fetching API key:', error);
      }
    };

    fetchApiKey();
  }, []);


  useEffect(() => {
    const fetchColleges = async () => {
      try {
        const response = await axios.get('https://collegeradiobackend-16c4036a90b1.herokuapp.com/api/colleges');
        const collegelist = response.data;
        console.log("Colleges: " + response.data);
        if (map) {
          collegelist.forEach((college) => {
            if (college.location) {
              let imgurl = college.link;
              if (!imgurl) {
                imgurl = 'https://cdn-icons-png.flaticon.com/512/89/89037.png';
              }
              placeMarkerByName(college.college, imgurl, college.letters, college.freq, college.location, college.state);
            }
          });
        }
      } catch (error) {
        console.error('Error fetching colleges:', error);
      }
    };

    fetchColleges();
  }, [map]);

  const fetchStreamUrl = async (callLetters, frequency,city) => {
    try {
      const response = await axios.get(`https://collegeradiobackend-16c4036a90b1.herokuapp.com/api/station/${callLetters}/${frequency.substring(0, frequency.length - 3)}/${city}`);
      return response.data.url;
    } catch (error) {
      console.error('Error fetching stream URL:', error);
      return null;
    }
  };

  const playStation = async (college, callLetters, frequency, logo, city) => {
    const url = await fetchStreamUrl(callLetters, frequency, city);
    if (url && checkStreamUrl(url) ) {
      try{
      const audioPlayer = audioPlayerRef.current;
      audioPlayer.src = url;
      audioPlayer.style.display = 'block';
      console.log("NOERROR");
      console.log(url);
      audioPlayer.play();
      setNowPlaying({ college, station: callLetters, logo }); 
      console.log("NOERROR");
    }catch(error){
      handleAudioError();
      console.log("NOERROR 3");
      alert('Streaming URL not found: Station may be outdated or moved to web only, submit a request to add it below!');}
    } else {
      alert('Streaming URL not found: Station may be outdated or moved to web only, submit a request to add it below!');
    }
  };

  const placeMarkerByName = (name, logoUrl, stationlet, stationfreq, location, city) => {
    if (location) { if(!stationfreq.includes("web")){
      const sizeV = logoUrl === 'https://cdn-icons-png.flaticon.com/512/89/89037.png' ? 10 : 25;
      const marker = new window.google.maps.Marker({
        position: location,
        map: map,
        title: name,
        icon: {
          url: logoUrl.startsWith('http') ? logoUrl : `https://${logoUrl}`,
          scaledSize: new window.google.maps.Size(sizeV, sizeV), // Adjust the size as needed
        },
      });

      const contentString = document.createElement('div');
      contentString.innerHTML = (
       `<div>
           <h2>${name}</h2>
           ${stationfreq ? `<p>Radio Station: ${stationlet}</p><p>Frequency: ${stationfreq}</p>` : '<p>No radio station available</p>'}
           <button>Play</button>
         </div>`
        );


      const playButton = contentString.querySelector('button');
      playButton.addEventListener('click', () => playStation(name, stationlet, stationfreq, logoUrl, city));

      const infowindow = new window.google.maps.InfoWindow({
        content: contentString,
      });

      marker.addListener('click', () => {
        infowindow.open(map, marker);
      });
    }}
  };

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const renderNowPlaying = () => { //im too lazy to catch errors so this exists
    try {
      if (!nowPlaying.college) {
        return null;
      }
      return (
        nowPlaying.college && (
          <div className="now-playing">
            <img
              src={nowPlaying.logo.startsWith('http') ? nowPlaying.logo : `https://${nowPlaying.logo}`}
              style={{ padding: '10px', width: '50px', height: '50px' }}
              alt="Now Playing Logo"
            />
            <div>
              <p>
                Now playing: {nowPlaying.station} - {nowPlaying.college}
              </p>
            </div>
          </div>
        )
      );
    } catch (error) {
      alert('Streaming URL not found: Station may be outdated or moved to web only, submit a request to add it below!');
      return null;
    }
  };

  const handleAudioError = () => {
    const audioPlayer = audioPlayerRef.current;
    audioPlayer.src = 'http://stream.whrb.org:8000/whrb-mp3'; // Reset the source
    audioPlayer.style.display = 'none'; // Hide the player
    alert('Failed to load audio. Invalid source or unsupported format.');
  };

  const checkStreamUrl = async (url) => {
    try {
      const response = await fetch(url, { method: 'HEAD' }); // Use HEAD to only fetch headers
      // Check if the response status is OK and content-type is audio
      if (response.ok && response.headers.get('content-type')?.startsWith('audio')) {
        return true;
      } else {
        return false;
      }
    } catch (error) {
      console.error('Error checking stream URL:', error);
      return false;
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (formData.college && formData.letters && formData.frequency
      && (formData.college.toLowerCase().includes("university") ||formData.college.toLowerCase().includes("School") || formData.college.toLowerCase().includes("College") )
    ) {
      try {
        await axios.post('https://collegeradiobackend-16c4036a90b1.herokuapp.com/api/colleges', formData);
        alert('College information submitted successfully');
        setFormData({ college: '', letters: '', frequency: '' });
      } catch (error) {
        console.error('Error submitting college information:', error);
        alert('Failed to submit college information');
      }
    } else {
      alert('Please fill out all fields correctly');
    }
  };

  return (
    <div class = "background" style={{height:'950px', width: '100%'}}>
      <div className="college-radio-title">
      <img src={require('./CollegeRadioTitle.png')} alt="College Radio Title" />
      </div>
     
      <div id="map" style={{ borderRadius: '5px',margin: '0 auto', top: '30px', width: '95%', height: '585px' }}></div>
      <div className="audio-player">
        <audio ref={audioPlayerRef} controls onError={handleAudioError} style={{ display: 'none' }} />
        {renderNowPlaying()}
      </div>
      <body className="body-one">College not mapped? Station outdated? Submit a request to add it here!</body>
      <form onSubmit={handleSubmit} className="form-container">
        <input
          type="text"
          name="college"
          placeholder="College name"
          value={formData.college}
          onChange={handleChange}
          style={{ marginRight: '10px' }}
        />
        <input
          type="text"
          name="letters"
          placeholder="Station letters"
          value={formData.letters}
          onChange={handleChange}
          style={{ marginRight: '10px' }}
        />
        <input
          type="text"
          name="frequency"
          placeholder="Station frequency"
          value={formData.frequency}
          onChange={handleChange}
          style={{ marginRight: '10px' }}
        />
        <button type="submit">Submit</button>
      </form>
      <section class="about-author">
      <h2>About</h2>
      <p>Project: This website uses Google Maps' API for displaying colleges and their locations, as well as the RadioBrowser API to find and play their corresponding
        radio stations. At the start of every other week, the website is refreshed, checking for station updates as well as processing
        requests to add new colleges/stations. Code is available through the GitHub link below. <br/> <br/> 
        Limitations: This project uses data on college radio stations from Wikipedia and Radio Browser. Some may be outdated, or no longer available due to 
        many college stations being taken off air and moved to online only. If a station takes longer than a few seconds to load, it is likely no longer available.
        <br/> <br/>Author:
        My name is David Cue, I am a third-year computer science student at the University of Southern California.
      </p>
      <a href="https://github.com/dcue3/CollegeRadio" target="_blank">GitHub</a>
      </section>
      <style>
        {`
        .background{
          background-color: #f9f5f0;
          opacity: 1;
          width: 100%;
          background-size: 10px 10px;
        }
        .about-author {
          position: relative; /* Position at the bottom, stays fixed */
          float: left;
          top: 100px;
          width: 95%; /* Set the width to half the page */
          padding-left: 1rem; /* Add some padding for content */
          padding-right: 4rem; /* Add some padding for content */
          background-color: #f9f5f0; /* Set a light background color */
          overflow-x: auto; /* Enable horizontal scroll if content overflows */
          border-radius: 5px;
        }
        .body-one{
          position: relative;  /* Ensure form is positioned relative to its container */
          top: 70px;
          margin: auto;   /* Center the form horizontally and provide top margin */
          max-width: 600px;    /* Example: limit the maximum width of the form */
          text: bold;
        }
        .form-container {
          position: relative;  /* Ensure form is positioned relative to its container */
          top: 75px;
          margin: auto;   /* Center the form horizontally and provide top margin */
          width: 80%;          /* Adjust width as needed */
          max-width: 600px;    /* Example: limit the maximum width of the form */
          background: #fff;    /* Example: add a background color */
          padding: 10px;       /* Example: add padding */
          box-shadow: 0 0 10px rgba(0,0,0,0.1); /* Example: add a box shadow */
          border-radius: 5px;
        }  
          .audio-player {
            position: fixed;
            max-width: 600px;
            top: 10px;
            right: 30px;
            z-index: 1000;
            background: rgba(255, 255, 255, 0.8);
            padding: 10px;
            border-radius: 5px;
            display: flex;
            align-items: center;
          }
          .audio-player audio {
            display: none;
          }
          .now-playing {
            display: flex;
            align-items: center;
          }
          .now-playing img {
            margin-right: 10px;
          }
          .now-playing-error {
            color: red;
            margin-top: 10px;
          }
          .college-radio-title {
            position: relative;
            top: 20px;
            margin-left: 50px;
            text-align: left;
          }
          .college-radio-title img {
            max-width: 40%;
            height: auto;
          }
          `
        }
      </style>
    </div>
  );
};

export default GoogleMap;
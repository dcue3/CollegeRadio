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
        const response = await axios.get('http://localhost:3001/api/maps');
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
        const response = await axios.get('http://localhost:3001/api/colleges');
        const collegelist = response.data;
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
      const response = await axios.get(`http://localhost:3001/api/station/${callLetters}/${frequency.substring(0, frequency.length - 3)}/${city}`);
      return response.data.url;
    } catch (error) {
      console.error('Error fetching stream URL:', error);
      return null;
    }
  };

  const playStation = async (college, callLetters, frequency, logo, city) => {
    const url = await fetchStreamUrl(callLetters, frequency, city);
    if (url) {
      try{
      const audioPlayer = audioPlayerRef.current;
      audioPlayer.src = url;
      audioPlayer.style.display = 'block';
      audioPlayer.play();
      setNowPlaying({ college, station: callLetters, logo }); 
    }catch(error){alert('Streaming URL not found: Station may be outdated or moved to web only, submit a request to add it below!');}
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

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (formData.college && formData.letters && formData.frequency) {
      try {
        await axios.post('http://localhost:3001/api/colleges', formData);
        alert('College information submitted successfully');
        setFormData({ college: '', letters: '', frequency: '' });
      } catch (error) {
        console.error('Error submitting college information:', error);
        alert('Failed to submit college information');
      }
    } else {
      alert('Please fill out all fields');
    }
  };

  return (
    <div style={{height:'1000px'}}>
      <h1 className="image-container">
        <img src="https://content.sportslogos.net/logos/30/642/thumbs/7482.gif" alt="Image 1" />
        <img src="https://content.sportslogos.net/logos/33/797/thumbs/by8dfvb6j89hs5nrvlb1ibx5e.gif" alt="Image 2" />
        <img src="https://content.sportslogos.net/logos/32/736/thumbs/73667562019.gif" alt="Image 3" />
        <img src="https://content.sportslogos.net/logos/32/729/thumbs/72944222014.gif" alt="Image 4" />
        <img src="https://content.sportslogos.net/logos/31/666/thumbs/66649782014.gif" alt="Image 5" />
        <img src="https://content.sportslogos.net/logos/31/687/thumbs/68757442015.gif" alt="Image 6" />
        <img src="https://content.sportslogos.net/logos/31/669/thumbs/66988442013.gif" alt="Image 7" />
      </h1>
      <h2 className="image-container-two">
        <img src="https://content.sportslogos.net/logos/33/813/thumbs/81337422010.gif" alt="Image 9" />
        <img src="https://content.sportslogos.net/logos/30/597/thumbs/59771422018.gif" alt="Image 10" />
        <img src="https://content.sportslogos.net/logos/31/663/thumbs/66395011978.gif" alt="Image 11" />
        <img src="https://content.sportslogos.net/logos/32/706/thumbs/70667022022.gif" alt="Image 12" />
        <img src="https://content.sportslogos.net/logos/33/791/thumbs/79176452013.gif" alt="Image 13" />
      </h2>
      <div id="map" style={{ margin: '0 auto', top: '170px', width: '95%', height: '630px' }}></div>
      <div className="audio-player">
        <audio ref={audioPlayerRef} controls style={{ display: 'none' }} />
        {nowPlaying.college && (
          <div className="now-playing">
            <img src={nowPlaying.logo.startsWith('http') ? nowPlaying.logo : `https://${nowPlaying.logo}`} style={{ padding: '10px', width: '50px', height: '50px' }} />
            <div>
              <p>Now playing: {nowPlaying.station} - {nowPlaying.college}</p>
            </div>
          </div>
        )}
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
      <p>Project: This website uses Google Maps' API, as well as the RadioFinder API to map colleges and play their corresponding
        radio stations. At the start of every week, the website is refreshed, checking for station updates as well as processing
        requests to add new colleges/stations. Code is available through the GitHub link below. <br/> <br/> Author:
        My name is David Cue, I am a third-year computer science student at the University of Southern California.
      </p>
      <a href="#">GitHub</a>
      </section>
      <style>
        {`
        .about-author {
          position: relative; /* Position at the bottom, stays fixed */
          float: left;
          top: 225px;
          width: 100%; /* Set the width to half the page */
          padding: 1rem; /* Add some padding for content */
          background-color: #f5f5f5; /* Set a light background color */
          overflow-x: auto; /* Enable horizontal scroll if content overflows */
          border-radius: 5px;
        }
        .body-one{
          position: relative;  /* Ensure form is positioned relative to its container */
          top: 205px;
          margin: 10px auto;   /* Center the form horizontally and provide top margin */
          width: 80%;          /* Adjust width as needed */
          max-width: 600px;    /* Example: limit the maximum width of the form */
          text: bold;
        }
        .form-container {
          position: relative;  /* Ensure form is positioned relative to its container */
          top: 200px;
          margin: 20px auto;   /* Center the form horizontally and provide top margin */
          width: 80%;          /* Adjust width as needed */
          max-width: 600px;    /* Example: limit the maximum width of the form */
          background: #fff;    /* Example: add a background color */
          padding: 10px;       /* Example: add padding */
          box-shadow: 0 0 10px rgba(0,0,0,0.1); /* Example: add a box shadow */
        }
          .image-container {
            display: flex;         /* Use flexbox for layout */
            max-width: 25%;        /* Limit width to 50% of the viewport */
            position: absolute;
          }
          .image-container-two {
            display: flex;         /* Use flexbox for layout */
            max-width: 25%;        /* Limit width to 50% of the viewport */
            position: absolute;
            top: 75px;
            left: 75px;
          }

          .image-container-two img {
            max-width: 25%;       /* Ensure images don't exceed container width */
            display: block;
          }
          
          .image-container img {
            max-width: 25%;       /* Ensure images don't exceed container width */
            display: block;
          }
                  
          .audio-player {
            position: fixed;
            max-width: 700px;
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
          }`
        }
      </style>
    </div>
  );
};

export default GoogleMap;
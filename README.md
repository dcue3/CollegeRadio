## Overview

The College Radio website is a project that displays a map of U.S. colleges and their student radio stations! Users can select a college and play its respective radio station directly from the map. The application leverages Google's Maps API to display the colleges and the RadioBrowser API to fetch and play the radio stations. 
### VIEW LIVE WEBSITE:
https://dcue3.github.io/CollegeRadio/

## Features

- **Interactive Map**: Uses Google Maps API to display colleges on a map.
- **Radio Station Playback**: Allows users to select and play radio stations directly from the map.
- **Radio Station Submission**: Users can submit requests to add or update college radio stations.

## Technologies Used

### Frontend

- **React**: Frontend framework for building the user interface.
- **Google Maps API**: For displaying the map and placing markers.
- **Axios**: For making HTTP requests to the backend.

### Backend

- **Express.js**: Web framework for the backend.
- **RadioBrowser API**: For searching/fetching radio station streams.
- **MongoDB**: Database for storing college and radio station data.
- **Python**: Used for web scraping to obtain data on radio stations from wikipedia.
- **BeautifulSoup**: For web scraping to gather data.
- **Selenium**: For web scraping dynamic content.



## Usage

### Frontend

1. **View the Map**: Open the application in your browser. The map will display the locations of U.S. colleges.

2. **Play a Radio Station**: Click on a college marker to open an info window with a "Play" button. Click the button to start playing the station.

3. **Submit a Radio Station**: If a college or station is missing or outdated, fill out the submission form at the bottom of the page to request an update.

### Backend

1. **Fetch Data**: The backend periodically fetches and updates the college radio station data using a Python script run by heroku bi-weekly. It processess all requests/updates to information.

2. **Noteable Backend Endpoints**:
    - `GET /api/colleges`: Fetch the list of colleges and their radio stations.
    - `GET /api/station/{callLetters}/{frequency}/{city}`: Fetch the stream URL for a specific radio station.

### Limitations
Some of the icons on the map may be lacking a working station - this is due to missing/incorrect data coming from the radiobrowser API. The vast majority of schools come up when searching using radiobrowser, however the stream links may not always be up to date. 
There are other APIs I could have used to find stations, but unfortunately most of them are paid. My next steps for this project if I had the money to spend would be to expand my radio searching algorithm to multiple APIs and ensure a working stream for all colleges.
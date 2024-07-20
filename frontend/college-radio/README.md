## Overview

The College Radio Player is a web application that displays a map of U.S. colleges and their student radio stations. Users can select a college and play its respective radio station directly from the map. The application leverages Google's Maps API to display the colleges and the RadioBrowser API to fetch and play the radio stations. The frontend uses React, backend uses Flask, and the database used is MongoDB. 

### VIEW LIVE WEBSITE:
https://dcue3.github.io/CollegeRadio/

## Features

- **Interactive Map**: Uses Google Maps API to display colleges on a map.
- **Radio Station Playback**: Allows users to select and play radio stations directly from the map.
- **Radio Station Submission**: Users can submit requests to add or update college radio stations.
- **Now Playing Display**: Shows the currently playing station and its details.

## Technologies Used

### Frontend

- **React**: Frontend framework for building the user interface.
- **Google Maps API**: For displaying the map and placing markers.
- **RadioBrowser API**: For fetching radio station streams.
- **Axios**: For making HTTP requests to the backend.

### Backend

- **Python**: Backend language.
- **Flask**: Web framework for the backend.
- **MongoDB**: Database for storing college and radio station data.
- **BeautifulSoup**: For web scraping to gather data.
- **Selenium**: For web scraping dynamic content.

## Installation

### Frontend

1. Clone the repository:
    ```bash
    git clone https://github.com/dcue3/CollegeRadio.git
    cd CollegeRadio
    ```

2. Install dependencies:
    ```bash
    npm install
    ```

3. Start the development server:
    ```bash
    npm start
    ```

### Backend

1. Navigate to the `backend` directory:
    ```bash
    cd backend
    ```

2. Create and activate a virtual environment:
    ```bash
    python -m venv venv
    source venv/bin/activate  # On Windows, use `venv\Scripts\activate`
    ```

3. Install the required packages:
    ```bash
    pip install -r requirements.txt
    ```

4. Run the backend server:
    ```bash
    python app.py
    ```

## Usage

### Frontend

1. **View the Map**: Open the application in your browser. The map will display the locations of U.S. colleges.

2. **Play a Radio Station**: Click on a college marker to open an info window with a "Play" button. Click the button to start playing the station.

3. **Submit a Radio Station**: If a college or station is missing or outdated, fill out the submission form at the bottom of the page to request an update.

### Backend

1. **Fetch Data**: The backend periodically fetches and updates the college radio station data using a Python script.

2. **API Endpoints**:
    - `GET /api/maps`: Fetch the Google Maps API key.
    - `GET /api/colleges`: Fetch the list of colleges and their radio stations.
    - `GET /api/station/{callLetters}/{frequency}/{city}`: Fetch the stream URL for a specific radio station.
    - `POST /api/colleges`: Submit new or updated college radio station information.

## Components

### Frontend

- **GoogleMap**: The main component that initializes and displays the map, places markers, and handles user interactions.
- **NowPlaying**: Displays the currently playing station and its details.
- **Form**: Allows users to submit new or updated radio station information.

### Backend

- **app.py**: Main Flask application file.
- **fetch_data.py**: Script to fetch and update college radio station data.
- **requirements.txt**: Lists the required Python packages.
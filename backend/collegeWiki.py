import requests
from bs4 import BeautifulSoup
import json
import os
from dotenv import load_dotenv
from pymongo import MongoClient

# Load environment variables from .env file
load_dotenv()

# Accessing environment variables
google_maps_api_key = os.getenv('REACT_APP_GOOGLE_MAPS_API_KEY')
mongo_uri = os.getenv('MONGO_URI') 

def fetch_location(college_name):
    base_url = 'https://maps.googleapis.com/maps/api/geocode/json'
    params = {
        'address': college_name,
        'key': google_maps_api_key
    }

    try:
        response = requests.get(base_url, params=params)
        if response.status_code == 200:
            data = response.json()
            if data['status'] == 'OK' and len(data['results']) > 0:
                location = data['results'][0]['geometry']['location']
                return location
            else:
                print(f"No results found for {college_name}")
        else:
            print(f"Failed to fetch data for {college_name}. Status code: {response.status_code}")
    except Exception as e:
        print(f"Error fetching data for {college_name}: {str(e)}")
    
    return None

# URL of the website with the table
url = 'https://en.wikipedia.org/wiki/List_of_campus_radio_stations'

# Custom headers
headers = {
    'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 '
                  '(KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36',
    'Accept-Language': 'en-US,en;q=0.9',
    'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,image/apng,*/*;q=0.8',
    'Accept-Encoding': 'gzip, deflate, br',
    'Connection': 'keep-alive',
    'Referer': url
}

# Initialize MongoDB client
client = MongoClient(mongo_uri)
db = client.get_database()  # Use default database from MongoDB URI
collection = db['colleges']  # MongoDB collection name


# Send a GET request to the URL with custom headers
response = requests.get(url, headers=headers)

# Check if the request was successful
if response.status_code == 200:
    # Parse the HTML content of the page
    soup = BeautifulSoup(response.content, 'html.parser')

    # Find the table element (adjust the selector as necessary)
    tables = soup.find_all('tbody')

    if tables[2]:
        table = tables[2]
        # Initialize lists to store headers and rows
        rows = []
        headers = ["letters","city","state","college","freq"]
        # Extract table rows
        for tr in table.find_all('tr'):
            row_data = {}
            cells = tr.find_all('td')
            g = 0
            for i in cells:
                if g >= len(headers): continue
                try:
                    if g == 3:
                        url2 = 'https://en.wikipedia.org/wiki/' + i.text.strip().replace(" ", "_")
                        headers2 = {
                            'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 '
                                          '(KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36',
                            'Accept-Language': 'en-US,en;q=0.9',
                            'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,image/apng,*/*;q=0.8',
                            'Accept-Encoding': 'gzip, deflate, br',
                            'Connection': 'keep-alive',
                            'Referer': url2
                        }
                        response2 = requests.get(url2, headers=headers2)
                        if response2.status_code == 200:
                            # Parse the HTML content of the page
                            soup2 = BeautifulSoup(response2.content, 'html.parser')
                            # Find the table element (adjust the selector as necessary)
                            image = soup2.find('td',{"class": "infobox-image"})
                            b2 = image.find('img')['src']
                            row_data['link'] = b2[2:]
                        else: print("FAILED TO GET LINK")
                except: print(response2.status_code)
                row_data[headers[g]] = i.text.strip()
                g=g+1

            if row_data:
                college_name = row_data.get('college')
                if college_name:
                    location = fetch_location(college_name)
                    if location:
                        row_data['location'] = location
                rows.append(row_data)
            else:
                print(f"Skipping row with mismatched number of cells: {len(cells)} (expected {len(headers)})")


        #TAKE EVERY ROW AND SAVE IT TO THE MONGODB DATABASE
        try:
            for row in rows:
                filter_criteria = {'college': row['college']}  # Assuming '_id' is the unique identifier
                update_data = {'$set': row}  # Replace entire document with 'row'
                collection.update_one(filter_criteria, update_data, upsert=True)
            print(f"Data inserted successfully. Inserted IDs: {result.inserted_ids}")
        except Exception as e:
            print(f"Error inserting data into MongoDB: {str(e)}")



        # Save the data to a JSON file
        with open('wiki_data.json', 'w') as f:
            json.dump(rows, f, indent=4)

        print("Data has been saved to wiki_data.json")
    else:
        print("No table found on the webpage.")
else:
    print(f"Failed to retrieve the webpage. Status code: {response.status_code}")

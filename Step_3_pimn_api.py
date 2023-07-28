# This program sets up a Flask API to acquire two datasets from a local MongoDB database
# and expose them to be acquired through a web browser.

from flask import Flask, jsonify
from pymongo import MongoClient
from geojson import Feature, Point

# connect to local Mongo db
mclient = MongoClient(port=27017)
db = mclient.healthbycountydata

gj_formatted = []
gj = {}

def geoJSON_format(dataset):
    """Put the EPA FRS Environmental Interest Sites data into geoJSON format"""
    for i in dataset:
        # get values
        registry_ID = i["REGISTRY_ID"]
        site_name = i["SITE PRIMARY NAME"]
        site_address = i["SITE_ADDRESS"]
        site_type = i["SITE_TYPE_NAME"]
        interest_types = i["INTEREST_TYPES"]
        county_name = i["COUNTY_NAME"]
        if "," in interest_types:
            interest_types = interest_types.split(", ")
        lat = i["LATITUDE"]
        lon = i["LONGITUDE"]
        
        # build geoJSON formatted dataset
        this_point = Point((lon, lat))
        properties = dict([('reg_ID', registry_ID), ('site_name', site_name), ('site_address', site_address),  ('county_name', county_name),
                       ('site_type', site_type), ('interest_types', interest_types)])
        gj = Feature(geometry=this_point, properties=properties)
               
        gj_formatted.append(gj)        
    return gj_formatted


# define Flask object

app = Flask(__name__)


#################################################
# Flask Routes
#################################################

@app.route("/api/v1.0/pimn/frs")
def epa_sites():
    """Return the EPA FRS Environmental Interest Sites data as json, then pass it to the geoJSON_format
    function to get the data back in geoJSON format. Return the entire dataset in geoJSON format."""
    query = {}
    projection = {"_id": 0}
    epa_frs_data = list(db.modified_final_epa_frs_clean.find(query, projection))
    geodata = geoJSON_format(epa_frs_data)
    return jsonify(geodata)


@app.route("/api/v1.0/pimn/mnhealth")
def mn_health():
    """Return the health outcomes, asthma rates, and cancer rates data as json."""
    query = {}
    projection = {"_id": 0}
    mn_health_data = list(db.merged_collection.find(query, projection))
    return jsonify(list(mn_health_data))

@app.route("/")
def welcome():
    return (
        f'''<h1>Welcome to the Pollution Isn't Minnesota Nice API!</h1>
        <p>Available Routes:<br/>
        <ul>
        <li><b>EPA FRS (Facility Registry Service) Environmental Interest Sites in Minnesota:</b>
        <ul style="list-style-type:none"><li>/api/v1.0/pimn/frs</ul><br />
        <li><b>Health outcomes, asthma rates, and cancer rates by county in Minnesota:</b>
        <ul style="list-style-type:none"><li>/api/v1.0/pimn/mnhealth</ul>
        </ul></p>'''
    )   

if __name__ == "__main__":
    app.run(debug=True)
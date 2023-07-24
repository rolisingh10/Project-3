# Pollution Isn't Minnesota Nice: EPA FRS-Monitored Sites vs. Health Outcomes, Asthma Rates, and Cancer Rates by County

# Kendal Bergman, Joanna DeLaune, Greg Michalak, Aaron Otto, Roli Singh

This project is a full-stack web application that examines the relationship between the presence and concentration of EPA Facility Registry Service (FRS) -monitored sites in Minnesota and health outcomes in each county, as well as asthma and cancer rates by county.

(more details here about analysis including some screenshots of the visualizations)

# Build Process
![Project_Process](https://github.com/rolisingh10/Project-3/assets/102549713/3e60bdc1-331c-437b-afe8-8c75fb867158)

**Data Sourcing and Cleaning**

We located and evaluated appropriate datasets and cleaned the data for ingestion into the database layer.

(more discussion here)

**MongoDB**

We wrote Python code (see Jupyter notebook file 'Make_DB_file_v1a.ipynb') to create a MongoDB database and populate it with our data.

(further discussion here)

**Flask API**

We created a Flask API (see 'pimn_api.py') to get both datasets from the MongoDB database and expose them to be acquired via web browser.

Since the EPA FRS sites have longitude and latitude specified, we wrote a function to transform this dataset to geoJSON format for added functionality in the next step.

Note: In this particular instance, our database is static and it is not expected that it will be updated regularly. It would therefore have been more efficient to write the code to fetch the data once rather than each time the API is called. However, in most cases an API would be serving data in real time, and so we elected to write code that would function as desired in the more commonly encountered situation.

**Interactive Web page with Visualizations**

(discussion here)

# Pollution Isn't Minnesota Nice: EPA FRS-Monitored Sites vs. Health Outcomes, Asthma Rates, and Cancer Rates by County

# Kendal Bergman, Joanna DeLaune, Greg Michalak, Aaron Otto, Roli Singh

This project is a full-stack web application that examines the relationship between the presence and concentration of EPA Facility Registry Service (FRS) -monitored sites in Minnesota and health outcome and health factor scores in each county, as well as asthma and cancer rates by county.

The full website is available here: https://rolisingh10.github.io/Project-3/

The primary visualization shows a heatmap of the sites we selected as relevant to our analysis, and users can select a county either by clicking on it or via drop-down menu to see statistics particular to that county.

![image](https://github.com/rolisingh10/Project-3/assets/102549713/01f106ef-5d91-4831-8e9f-29ab9300c42d)

Secondary visualizations are a bar graph and a correlation matrix.

Users can select a statistic and view a bar graph that selects and displays the 20 "worst" states for that metric:

![image](https://github.com/rolisingh10/Project-3/assets/102549713/3b9542da-f3c7-497a-bf03-74f0c6361948)

The correlation matrix compares the Asthma Rate, Cancer Rate, Health Outcome Z-Score, and Number of Sites in each county.

![image](https://github.com/rolisingh10/Project-3/assets/102549713/b5741af1-b692-4370-8603-286f8616fced)

# Build Process
![Project_Process](https://github.com/rolisingh10/Project-3/assets/102549713/3e60bdc1-331c-437b-afe8-8c75fb867158)

**Data Sourcing and Cleaning**

We located and evaluated appropriate datasets and cleaned the data for ingestion into the database layer. We wanted to study the effects of environmental pollution on the health of residents. We wanted to study these effects locally, so we chose Minnesota and we further divided the state into counties. After narrowing down, we decided to include asthma and cancer as the ailments. We also included the health outcome and health factors scores of each county, which are calculated by County Health Rankings & Roadmaps (CHR&R), University of Wisconsin Population Health Institute. The datasets of the health outcome and health factors included Z-scores which show how the data is distributed. We also chose to use the U.S. Environmental Protection Agency (EPA) Federal Registry Service (FRS) website to find EPA-regulated facilities within Minnesota. These sites range from very small quantity generators of air pollutants to large coal or nuclear power plants to community water treatment systems to superfund sites -- but they are all subject to at least one environmental regulation under the purview of the U.S. EPA. 

We extracted four datasets for our study. These are as follows:

Asthma hospitalization rates for 2018-2020 by county
Cancer rates by county 2015-2019
Health Outcomes and Factors Rankings 2023
EPA FRS Sites in Minnesota

**The steps taken in data cleaning:**

We extracted the CSV files of asthma data and cancer rate data and transformed them into dataframes using Pandas (python). The same was done to the excel file of health outcomes. We looked at all the columns in the dataframe. We looked for null values, dropped the columns and renamed columns. The EPA dataset was extracted as a CSV after a query of the EPA FRS website. The CSV file was read into pandas via python and transformed into a dataframe. From there the data needed to be cleaned (certain columns dropped, column names changed, data filtered, etc.). The main cleaning that needed to be done on the EPA site data was to filter down to sites that we believed to be most relevant for the project. The original dataset has over 200,000 sites, and our final dataset has just under 3,000. We filtered out entries with no geographic data, as well as filtering by "Interest Types." Determining which interest types would be most relevant to cancer and asthma rates was largely subjective, and we could spend weeks defining how to best define the sites we think have the greatest impact. 

We jsonified all four of the datasets to be ingested into the MongoDB database. 

**MongoDB**

We wrote Python code (see Jupyter notebook file 'Step_2_Make_DB_file.ipynb') to create a MongoDB database and populate it with our data.  The PyMongo scripts will load all data sets located in Project_3_Data file.  The PyMongo was writen to be able to add multiple new features and files by adding a file path and var name for each new file needing loading.  The notebook will print out meta examples of each file and their corresponding structures for purposes of the API developer and others understanding. 

Step 1: Imports libraries and creates the mongodb client as well as database is named.  
Step 2: Loads all the corresponding files through a for loop. This is the step where we can add any feature or other file in with one line of code.  
Step 3: Prints out feature collections and one document meta
Step 4: Merges the the feature files into one Json for API cosumption. Prints out a success measure and top one record to show structure of final merged features file.  

**Flask API**

We created a Flask API (see 'Step_3_pimn_api.py') to get both datasets from the MongoDB database and expose them to be acquired via web browser.

Since the EPA FRS sites have longitude and latitude specified, we wrote a function to transform this dataset to geoJSON format for added functionality in the next step.

Note: In this particular instance, our database is static and it is not expected that it will be updated regularly. It would therefore have been more efficient to write the code to fetch the data once rather than each time the API is called. However, in most cases an API would be serving data in real time, and so we elected to write code that would function as desired in the more commonly encountered situation.

**Interactive Web page with Visualizations**

We created an interactive webpage using Javascript and several associated libraries. The D3 library was used to import the .json and .geojson datasets, which contained the county health statistics, the EPA sites, and the Minnesota county boundaries. Leaflet was used to create an interactive map of the Minnesota counties, where the user can select the county of interest and display the health statistics, as well as view a heatmap of the EPA sites. The Turf library is an advanced geospatial analysis library, and was used to determine the number of sites located in each county using their coordinates. The Plotly library was used to build an interactive bar graph where the user can select the health statistic of interest and display these data by county. A third display panel was added to show the correlations between countywide caner rates, asthma rates, health outcome Z-scores, and number of EPA regualted sites. The webpage has been deployed live using GitHub pages.

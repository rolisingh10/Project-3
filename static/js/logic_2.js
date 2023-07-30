let dataType = "Cancer";

let countiesMN = [];

//Data import
d3.json("static/gz_2010_us_050_00_500k.json").then((importedData) => {
  let geoData = importedData.features;
  
  countiesMN = geoData.filter(function(data){
    return data.properties.STATE == 27; //State ID for Minnesota is 27
  });

    d3.json("static/health_outcomes_0727.json").then((importedData) => {
      let healthData = importedData;

      d3.json("static/frs_0727.geojson").then((importedData) => {
        let siteData = importedData;
        populateList()
        mapMN(countiesMN, healthData, siteData)
      })
    })
  }
)

//Populate the dropdown list on the map

function populateList()
{
  let dropdown = document.getElementById("Menu");
  for (var i = 0; i < countiesMN.length; ++i) {
    dropdown[dropdown.length] = new Option(countiesMN[i].properties.NAME);
}
};

//Make barchart

function barChart(dataArray){

let field = "cancer_rate_per_100k"

keys = {FIPS: "FIPS",
Asthma: "asthma_rate_per_100k",
Cancer: "cancer_rate_per_100k",
Cases: "count_of_cases",
County: "county",
Population: "county_population",
HLT_Factor_Rank: "hlt_factor_rank",
HLT_Factor_Z:"hlt_factor_z",
HLT_Outcome_Rank: "hlt_outcome_rank",
HLT_Outcome_Z: "hlt_outcome_z"}

console.log(keys[dataType])

let dataSorted = dataArray.sort((a, b) => b[keys[dataType]] - a[keys[dataType]]);
top10 = dataSorted.slice(0, 20);
  
let trace = {
    x: top10.map(object => object.county),
    y: top10.map(object => object[keys[dataType]]),
    type: "bar",
    orientation: "v"
  };

  let traceData = [trace];

  let layout = {
    title: dataType
    };

Plotly.newPlot("bar", traceData, layout);
}

//Begin main program

function mapMN(counties, health, site){

  barChart(health);

  //Dropdown menu to select county parameter of interest

  document.getElementById('dropdown').addEventListener('change', function() {
    dataType = this.value;
    console.log(dataType)
    barChart(health)
  });

  //Listen for change in dropdown for county selection on map, then make poper changes to map

  document.getElementById('Menu').addEventListener('change', function() {

    countiesGeoJSON.eachLayer(function(layer){
        layer.setStyle({fillOpacity: 0})
      }
    )

    let newCounty = this.value;

    if (newCounty !== "None"){

    countiesGeoJSON.eachLayer(function(layer){
        if (layer.feature.properties.NAME === newCounty){
          layer.setStyle({fillOpacity: 0.5})
          myMap.fitBounds(layer.getBounds())
          let pointsMatch = "";
          let healthMatch = "";
                healthMatch = health.filter(function(data){
                  return data.county === layer.feature.properties.NAME;
                });
                pointsMatch = corr.filter(function(data){
                  return data.county === layer.feature.properties.NAME;
                });
              demoDisp = d3.select('#sample-metadata');
              demoDisp.html(`<b>${layer.feature.properties.NAME} County</b> <br> 
              Population: ${healthMatch[0]["county_population"]}<br>
              Total number of sites: ${pointsMatch[0]["Total_number_of_sites"]}<br>
              FIPS: ${healthMatch[0]["FIPS"]}<br>
              Asthma rate per 100k: ${healthMatch[0]["asthma_rate_per_100k"]}<br>
              Cancer rate per 100k: ${healthMatch[0]["cancer_rate_per_100k"]}<br>
              Asthma ED vistis: ${healthMatch[0]["count_of_cases"]}<br>
              HLT factor rank: ${healthMatch[0]["hlt_factor_rank"]}<br>
              HLT factor Z-score: ${healthMatch[0]["hlt_factor_z"]}<br>
              HLT outcome rank: ${healthMatch[0]["hlt_outcome_rank"]}<br>
              HLT outcome Z-score: ${healthMatch[0]["hlt_outcome_z"]}
              `)
        }
    })
  }

    else if (newCounty === "None"){
      countiesGeoJSON.eachLayer(function(layer){
          layer.setStyle({fillOpacity: 0})
        })
        demoDisp = d3.select('#sample-metadata')
        demoDisp.html("")
    }
  }
  )

  //Extracting the epa site coordinates

  let sites = []
  for (let i = 0; i < site.length; i++) {
    sites.push(
      L.marker([site[i].geometry.coordinates[1], site[i].geometry.coordinates[0]], {
        style: function(feature) {
          return {
            color: '#000',
            weight: 0.5
          };
        }
      }).bindPopup(`<h3>Site Name: ${site[i]["PRIMARY_NAME"]}<h3>`)
    )
  };

  //Making the heatmap of epa sites

  let heatmapPoints = [];
  let sitePoints = [];

  sites.forEach(function(feature){
      heatmapPoints.push([feature._latlng.lat, feature._latlng.lng])
      sitePoints.push([feature._latlng.lng, feature._latlng.lat]) //Turf puts the longitude first
  });

  var heat = L.heatLayer(heatmapPoints  //DO NOT PUT BRACKETS AROUND THE INPUT ARRAY!!!!
  ,{
    minOpacity: 0.5, 
    radius: 10})

  //Data for correlation matrix

  let corr = [];

  counties.forEach(function(layer){
  
      let corrHealthMatch = health.filter(function(data){
        return data.county === layer.properties.NAME;
      });
  
        let points = turf.points(sitePoints);
        var totalPoints = 0;
  
        if(layer.geometry.coordinates[0].length===1) {
          layer.geometry.coordinates.forEach(function(coords) {
            var searchWithin = turf.polygon(coords);
            var ptsWithin = turf.pointsWithinPolygon(points, searchWithin);
            totalPoints += ptsWithin.features.length;
          });
        } else {
          var searchWithin = turf.polygon(layer.geometry.coordinates);
          var ptsWithin = turf.pointsWithinPolygon(points, searchWithin);
          totalPoints += ptsWithin.features.length;
        }
        
        let entry = {}
        entry["asthma_rate_per_100k"] = corrHealthMatch[0]["asthma_rate_per_100k"];
        entry["cancer_rate_per_100k"] = corrHealthMatch[0]["cancer_rate_per_100k"];
        entry["hlt_outcome_z"] = corrHealthMatch[0]["hlt_outcome_z"];
        entry["Total_number_of_sites"] = totalPoints;
        entry["county"] = corrHealthMatch[0]["county"]
        corr.push(entry)
  
  })

  //Making the county boarders with geoJSON

  countiesGeoJSON = L.geoJSON(counties, {
    style: function (feature) {
        return {
          fillOpacity: 0,
          weight: 0.5
        };
    },
    onEachFeature: function(feature,layer) {
      layer.on('click',function() {
        countiesGeoJSON.eachLayer(function(layer){
          layer.setStyle({fillOpacity: 0})
          document.getElementById('Menu').selectedIndex=0;
        })
        layer.setStyle({fillOpacity: 0.5})
        document.getElementById('Menu').selectedIndex=0;
        let pointsMatch = "";
        let healthMatch = "";
                healthMatch = health.filter(function(data){
                  return data.county === layer.feature.properties.NAME;
                });
                pointsMatch = corr.filter(function(data){
                  return data.county === layer.feature.properties.NAME;
                });
              demoDisp = d3.select('#sample-metadata');
              demoDisp.html(`<b>${layer.feature.properties.NAME} County</b> <br>
              Population: ${healthMatch[0]["county_population"]}<br> 
              Total number of sites: ${pointsMatch[0]["Total_number_of_sites"]}<br>
              FIPS: ${healthMatch[0]["FIPS"]}<br>
              Asthma rate per 100k: ${healthMatch[0]["asthma_rate_per_100k"]}<br>
              Cancer rate per 100k: ${healthMatch[0]["cancer_rate_per_100k"]}<br>
              Asthma ED visits: ${healthMatch[0]["count_of_cases"]}<br>
              HLT factor rank: ${healthMatch[0]["hlt_factor_rank"]}<br>
              HLT factor Z-score: ${healthMatch[0]["hlt_factor_z"]}<br>
              HLT outcome rank: ${healthMatch[0]["hlt_outcome_rank"]}<br>
              HLT outcome Z-score: ${healthMatch[0]["hlt_outcome_z"]}
              `)
      })
      }
    }
  )

  //Setting up the map visualization

  let street = L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
    attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
  })

  let topo = L.tileLayer('https://{s}.tile.opentopomap.org/{z}/{x}/{y}.png', {
	  attribution: 'Map data: &copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors, <a href="http://viewfinderpanoramas.org">SRTM</a> | Map style: &copy; <a href="https://opentopomap.org">OpenTopoMap</a> (<a href="https://creativecommons.org/licenses/by-sa/3.0/">CC-BY-SA</a>)'
  });

  let satelite = L.tileLayer('https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}', {
	  attribution: 'Tiles &copy; Esri &mdash; Source: Esri, i-cubed, USDA, USGS, AEX, GeoEye, Getmapping, Aerogrid, IGN, IGP, UPR-EGP, and the GIS User Community'
  });
  
  // Create a baseMaps object.
  let baseMaps = {
    "Street Map": street,
    // "Topographic Map": topo,
    // "Satelite": satelite
  };

// Create an overlay object.
let overlayMaps = {
  "County Lines": countiesGeoJSON,
  //"EPA Sites": epaSites,
  //"Fake Data": addedGeoJSON, //You do not need to create a layerGroup if the data are in the same form as addedGeoJSON
  "Heatmap": heat
};

// Define a map object.
let myMap = L.map("map", {
  center: [44.95, -93.09], //coordinates for St. Paul, MN
  zoom: 7,
  layers: [street, countiesGeoJSON]
});

// Pass our map layers to our layer control.
// Add the layer control to the map.
L.control.layers(baseMaps, overlayMaps, {
  collapsed: false
}).addTo(myMap);

//Making a correlation matrix

// Dimension of the whole chart. Only one size since it has to be square
const marginWhole = {top: 10, right: 10, bottom: 10, left: 10},
sizeWhole = 640 - marginWhole.left - marginWhole.right

// Create the svg area
const svg = d3.select("#my_dataviz")
.append("svg")
.attr("width", sizeWhole  + marginWhole.left + marginWhole.right)
.attr("height", sizeWhole  + marginWhole.top + marginWhole.bottom)
.append("g")
.attr("transform", `translate(${marginWhole.left},${marginWhole.top})`);


// What are the numeric variables in this dataset? How many do I have
const allVar = ["asthma_rate_per_100k", "cancer_rate_per_100k", "hlt_outcome_z", "Total_number_of_sites"]
const numVar = allVar.length

// Now I can compute the size of a single chart
mar = 20
size = sizeWhole / numVar


// ----------------- //
// Scales
// ----------------- //

// Create a scale: gives the position of each pair each variable
const position = d3.scalePoint()
.domain(allVar)
.range([0, sizeWhole-size])

// Color scale: give me a specie name, I return a color
const color = d3.scaleOrdinal()
.domain(["setosa", "versicolor", "virginica" ])
.range([ "#402D54", "#D18975", "#8FD175"])


// ------------------------------- //
// Add charts
// ------------------------------- //
for (i in allVar){
for (j in allVar){

  // Get current variable name
  const var1 = allVar[i]
  const var2 = allVar[j]

  // If var1 == var2 i'm on the diagonal, I skip that
  if (var1 === var2) { continue; }

  // Add X Scale of each graph
  xextent = d3.extent(corr, function(d) { return +d[var1] })
  const x = d3.scaleLinear()
    .domain(xextent).nice()
    .range([ 0, size-2*mar ]);

  // Add Y Scale of each graph
  yextent = d3.extent(corr, function(d) { return +d[var2] })
  const y = d3.scaleLinear()
    .domain(yextent).nice()
    .range([ size-2*mar, 0 ]);

  // Add a 'g' at the right position
  const tmp = svg
    .append('g')
    .attr("transform", `translate(${position(var1)+mar},${position(var2)+mar})`);

  // Add X and Y axis in tmp
  tmp.append("g")
    .attr("transform", `translate(0,${size-mar*2})`)
    .call(d3.axisBottom(x).ticks(3));
  tmp.append("g")
    .call(d3.axisLeft(y).ticks(3));

  // Add circle
  tmp
    .selectAll("myCircles")
    .data(corr)
    .join("circle")
      .attr("cx", function(d){ return x(+d[var1]) })
      .attr("cy", function(d){ return y(+d[var2]) })
      .attr("r", 3)
      //.attr("fill", function(d){ return color(d.Species)})
}
}


// ------------------------------- //
// Add variable names = diagonal
// ------------------------------- //
for (i in allVar){
for (j in allVar){
  // If var1 == var2 i'm on the diagonal, otherwisee I skip
  if (i != j) { continue; }
  // Add text
  const var1 = allVar[i]
  const var2 = allVar[j]
  svg
    .append('g')
    .attr("transform", `translate(${position(var1)},${position(var2)})`)
    .append('text')
      .attr("x", size/2)
      .attr("y", size/2)
      .text(var1)
      .attr("text-anchor", "middle")

}
}


}; //end of mapMN


  
  





    
// cancerData = [];
// countiesMN = [];
// geoData = [];

let dataType = "Cancer";

let countiesMN = [];

//Data import
d3.json("gz_2010_us_050_00_500k.json").then((importedData) => {
  let geoData = importedData.features;
  
  countiesMN = geoData.filter(function(data){
    return data.properties.STATE == 27; //State ID for Minnesota is 27
  });

    d3.json("health_outcomes_0725.json").then((importedData) => {
      let healthData = importedData;

      d3.json("frs_0725.geojson").then((importedData) => {
        let siteData = importedData;
        populateList()
        mapMN(countiesMN, healthData, siteData)
      })
    })
  }
)

function populateList()
{
  let dropdown = document.getElementById("Menu");
  for (var i = 0; i < countiesMN.length; ++i) {
    dropdown[dropdown.length] = new Option(countiesMN[i].properties.NAME);
}
};

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

  console.log(traceData)

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

  //Dropdown for county selection on map

  document.getElementById('Menu').addEventListener('change', function() {

    countiesGeoJSON.eachLayer(function(layer){
        layer.setStyle({fillOpacity: 0})
      }
    )

    let newCounty = this.value;

  if (newCounty !== "None"){
    
    let ddHealthMatch = "";

    for (let i = 0; i < counties.length; i++) {

      ddHealthMatch = health.filter(function(data){
        return data.county === newCounty;
      })
    }

    countiesGeoJSON.eachLayer(function(layer){
        if (layer.feature.properties.NAME === newCounty){
          layer.setStyle({fillOpacity: 0.5})
          myMap.fitBounds(layer.getBounds())
        }
    })
    demoDisp = d3.select('#sample-metadata');
    demoDisp.html(`${newCounty} County<br>
    Cancer Rate per 100,000: ${ddHealthMatch[0]["cancer_rate_per_100k"]}<br>
    Health Outcome Z-Score: ${ddHealthMatch[0]["hlt_outcome_z"]}
    `);
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
        let points = turf.points(sitePoints);
        var totalPoints = 0;
        let healthMatch = "";
							console.log(layer.feature.properties.NAME)
              for (let i = 0; i < counties.length; i++) {
                healthMatch = health.filter(function(data){
                  return data.county === layer.feature.properties.NAME;
                });
              };
              console.log(healthMatch[0]["cancer_rate_per_100k"]);
							if(layer.feature.geometry.coordinates[0].length===1) {
								layer.feature.geometry.coordinates.forEach(function(coords) {
									var searchWithin = turf.polygon(coords);
									var ptsWithin = turf.pointsWithinPolygon(points, searchWithin);
									totalPoints += ptsWithin.features.length;
								});
							} else {
								var searchWithin = turf.polygon(layer.feature.geometry.coordinates);
								var ptsWithin = turf.pointsWithinPolygon(points, searchWithin);
								//console.log(ptsWithin)
								totalPoints += ptsWithin.features.length;
							}
              console.log(totalPoints);
              demoDisp = d3.select('#sample-metadata');
              demoDisp.html(`${layer.feature.properties.NAME} County<br> 
              Total number of sites: ${totalPoints}<br>
              Cancer Rate per 100,000: ${healthMatch[0]["cancer_rate_per_100k"]}<br>
              Health Outcome Z-Score: ${healthMatch[0]["hlt_outcome_z"]}
              `)
      })
      // layer.on('mouseout',function() {
      //   layer.setStyle({fillOpacity: 0})
      //   demoDisp = d3.select('#sample-metadata');
      //   demoDisp.html("")
      // })
      // layer.on('click', function(){
      //   countiesGeoJSON.eachLayer(function(layer){
      //     layer.setStyle({fillOpacity: 0})
      //     document.getElementById('Menu').selectedIndex=0;
      //   })
      //   layer.setStyle({fillOpacity: 0.5})
      // })
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

  
  let epaSites = L.layerGroup(sites);
  
  // Create a baseMaps object.
  let baseMaps = {
    "Street Map": street,
    "Topographic Map": topo,
    "Satelite": satelite
  };

//Using our "fake data" in geojson format
// let geojson = {
//   "type": "FeatureCollection",
//   "features": [
//     {
//       "type": "Feature",
//       "properties": {},
//       "geometry": {
//         "coordinates": [
//           -93.3724637877016,
//           45.36993222472972
//         ],
//         "type": "Point"
//       }
//     },
//     {
//       "type": "Feature",
//       "properties": {},
//       "geometry": {
//         "coordinates": [
//           -94.10153196179377,
//           44.698611036565154
//         ],
//         "type": "Point"
//       }
//     },
//     {
//       "type": "Feature",
//       "properties": {},
//       "geometry": {
//         "coordinates": [
//           -92.99759471602371,
//           44.420863040972336
//         ],
//         "type": "Point"
//       }
//     },
//     {
//       "type": "Feature",
//       "properties": {},
//       "geometry": {
//         "coordinates": [
//           -93.07471274441056,
//           46.579167842257135
//         ],
//         "type": "Point"
//       }
//     },
//     {
//       "type": "Feature",
//       "properties": {},
//       "geometry": {
//         "coordinates": [
//           -94.0910131487442,
//           45.85788261695188
//         ],
//         "type": "Point"
//       }
//     }
//   ]
// }

// var addedGeoJSON = L.geoJSON(geojson, {
//   style : function(feature) {
//     return {
//       color: '#000',
//       weight: 0.5
//     }
//   }, 
//   onEachFeature: function(feature, layer){
//     layer.bindPopup(`<h3>Lat: ${feature.geometry.coordinates[0]}<h3><h3>Long: ${feature.geometry.coordinates[1]}<h3>`);
//   }
//   // pointToLayer: function(geoJsonPoint, latlng) {
//   //   return L.marker(latlng);
//   // }
// });

// Create an overlay object.
let overlayMaps = {
  "County Lines": countiesGeoJSON,
  "EPA Sites": epaSites,
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

}; //end of mapMN


  
  





    
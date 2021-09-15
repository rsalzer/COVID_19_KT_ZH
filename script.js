var data;

//const cantons = ['AG', 'AI', 'AR', 'BE', 'BL', 'BS', 'FR', 'GE', 'GL', 'GR', 'JU', 'LU', 'NE', 'NW', 'OW', 'SG', 'SH', 'SO', 'SZ', 'TG', 'TI', 'UR', 'VD', 'VS', 'ZG', 'ZH', 'FL'];
const cantons = ['ZH'];

const population = {
  "CH": 8619259,
  "AG": 687491,
  "AI": 16136,
  "AR": 55388,
  "BE": 1040412,
  "BL": 289534,
  "BS": 196386,
  "FR": 322658,
  "GE": 504205,
  "GL": 40713,
  "GR": 198787,
  "JU": 73490,
  "LU": 414364,
  "NE": 176340,
  "NW": 43039,
  "OW": 37906,
  "SG": 511811,
  "SH": 82454,
  "SO": 275661,
  "SZ": 160289,
  "TG": 280068,
  "TI": 350887,
  "UR": 36732,
  "VD": 808652,
  "VS": 345875,
  "ZG": 127387,
  "ZH": 1542594,
  "FL": 38749
};

const names = {
  101: "Affoltern",
  102: "Andelfingen",
  103: "Bülach",
  104: "Dielsdorf",
  105: "Hinwil",
  106: "Horgen",
  107: "Meilen",
  108: "Pfäffikon",
  109: "Uster",
  110: "Winterthur",
  111: "Dietikon",
  112: "Zürich"
};
const colors2 = ["#a6cee3","#b2df8a","#33a02c","#fb9a99","#e31a1c","#fdbf6f","#ff7f00","#cab2d6","#6a3d9a","#ffff99","#b15928","#1f78b4"];
const colors3 = ["#a5df8a", "#ffff99", "#fdbf6f", "#fa9530", "#ff817e", "#e31a1d", "#b15928"];
const colors4 = ["#ceeacd", "#c4f3af", "#ffffa6", "#fdbf6f", "#fa9530", "#f57229", "#e36f6c", "#e7485f", "#e31a1d", "#b40d0f", "#821f10"];
//["#8dd3c7","#ffffb3","#bebada","#fb8072","#80b1d3","#fdb462","#b3de69","#fccde5","#d9d9d9","#bc80bd","#ccebc5","#ffed6f"]
/*
const oldColors = {
  101: "#00876c",
  102: "#479972",
  103: "#6fab79",
  104: "#94bd83",
  105: "#b9ce91",
  106: "#dcdfa1",
  107: "#fff1b5",
  108: "#f9d796",
  109: "#f4bb7b",
  110: "#ee9f67",
  111: "#e88159",
  112: "#e06152",
  113: "#d43d51" //Extra color...
};
*/
const cartesianAxesTypes = {
  LINEAR: 'linear',
  LOGARITHMIC: 'logarithmic'
};

var verbose = false;
var actualData = [];
var actualDeaths = [];
var actualHospitalisation = [];
Chart.defaults.global.defaultFontFamily = "IBM Plex Sans";
document.getElementById("loaded").style.display = 'none';

//setLanguageNav();
includeHTML();
getPLZ();
getCantonZH();
getTests();
getBezirke();
getSpitalAuslastung();
//getAge();

function getCantonZH() {
  var url = 'https://raw.githubusercontent.com/openZH/covid_19/master/fallzahlen_kanton_total_csv_v2/COVID19_Fallzahlen_Kanton_ZH_total.csv';
  d3.csv(url, function(error, csvdata) {
    data = csvdata;
    prepareData();
    barChartCases();
    barChartZHDeaths();
    barChartHospitalisations();
    document.getElementById("loadingspinner").style.display = 'none';
    document.getElementById("loaded").style.display = 'block';
  });
}

function getTests() {
  var url = 'https://raw.githubusercontent.com/openZH/covid_19/master/fallzahlen_kanton_zh/COVID19_Anteil_positiver_Test_pro_KW.csv';
  d3.csv(url, function(error, csvdata) {
    chartTests(csvdata);
  });
}

function getBezirke() {
  var url = 'https://raw.githubusercontent.com/openZH/covid_19/master/fallzahlen_bezirke/fallzahlen_kanton_ZH_bezirk.csv';
  d3.queue()
    .defer(d3.json, "https://raw.githubusercontent.com/rsalzer/COVID_19_KT_ZH/master/bezirke.json")
    .defer(d3.csv, url)
    .await(function(error, topo, csvdata) {
      drawBezirke(csvdata, topo);
      lastBezirksData(csvdata);
      chartBezirke(csvdata, true);
      chartBezirkeDeaths(csvdata, true);
      chartBezirke(csvdata, false);
      chartBezirkeDeaths(csvdata, false);
    });
}

var plzdata = null;
var plzgeojson = null;
function getPLZ() {
  var url = 'https://raw.githubusercontent.com/openZH/covid_19/master/fallzahlen_plz/fallzahlen_kanton_ZH_plz.csv';
  d3.queue()
    .defer(d3.json, "https://raw.githubusercontent.com/openZH/covid_19/master/fallzahlen_plz/PLZ_gen_epsg4326_F_KTZH_2020.json")
    .defer(d3.csv, url)
    .await(function(error, topo, csvdata) {
      plzdata = csvdata;
      plzgeojson = topo;
      drawPLZTable();
      getVaccination();
    });
}

function getVaccination() {
  var url = 'https://raw.githubusercontent.com/openZH/covid_19_vaccination_campaign_ZH/master/COVID19_Impfungen_pro_Woche_PLZ.csv';
  d3.csv(url, function(error, csvdata) {
      drawVaccTable(csvdata);
  });
}


var ageMax = 0;
function getAge() {
  var url = 'https://raw.githubusercontent.com/openZH/covid_19/master/fallzahlen_kanton_alter_geschlecht_csv/COVID19_Fallzahlen_Kanton_ZH_alter_geschlecht.csv';
  var ages = [];
  for(var i=1; i<=120; i++) {
    ages.push(i);
  }
  d3.csv(url, function(error, csvdata) {
      parseAgeRange(csvdata, ages, 7);
      parseAge(csvdata, ages);
  });
}

var spitaldata;
function getSpitalAuslastung() {
  var url = 'https://raw.githubusercontent.com/openZH/covid_19/master/fallzahlen_kanton_zh/COVID19_Belegung_Intensivpflege.csv';
  d3.csv(url, function(error, csvdata) {
      spitaldata = csvdata;
      parseSpital();
      parseSpitalHistory();
  });
}

var mainData;
function prepareData() {
  //console.log("Start Processing Data");
  var mode = 0;
  var date = new Date();
  date.setTime(getDateForMode(mode).getTime());
  var now = new Date();
  now.setMinutes(now.getMinutes()-now.getTimezoneOffset());
  //alert(now.toISOString());
  var dataPerDay = [];
  var emptyFirst = {};
  emptyFirst.data = [];
  for(var j=0; j<cantons.length; j++) {
    var canton = cantons[j];
    var cantonTotal = {
      canton: canton,
      date_ncumul_conf: "Keine Daten",
      date_ncumul_deceased: "Keine Daten",
      date_current_hosp: "Keine Daten",
      ncumul_conf: 0,
      ncumul_deceased: 0,
      current_hosp: 0,
      current_icu: 0,
      current_vent: 0,
      current_isolated: 0,
      current_quarantined: 0
    };
    emptyFirst.data.push(cantonTotal);
  }
  dataPerDay.push(emptyFirst);
  var completeIndex = 0;
  // console.log("Start preping CH cases");
  while(date<now) {
    var dateString = date.toISOString();
    dateString = dateString.substring(0,10);
    // if(dateString=="2020-06-02") {
    //   console.log("2020-06-02: Index: "+dataPerDay.length);
    // }
    var singleDayObject = {};
    singleDayObject.date = dateString;
    singleDayObject.data = [];
    for(var i=0; i<cantons.length; i++) {
      var canton = cantons[i];
      var cantonTotal = getDataForDay(canton, date);
      if(cantonTotal==null) {
        cantonTotal = Object.assign({}, dataPerDay[dataPerDay.length-1].data[i]);
        cantonTotal.diff_ncumul_deceased = null;
        cantonTotal.diff_ncumul_conf = null;
        cantonTotal.diff_current_hosp = null;
        cantonTotal.diff_current_vent = null;
        cantonTotal.diff_current_icu = null;
        cantonTotal.diffAvg7Days = null;
        cantonTotal.incidences14Days = null;
      }
      else {
          if(Number.isNaN(cantonTotal.ncumul_conf)) {
            cantonTotal.ncumul_conf = dataPerDay[dataPerDay.length-1].data[i].ncumul_conf;
            cantonTotal.date_ncumul_conf = dataPerDay[dataPerDay.length-1].data[i].date_ncumul_conf;
            cantonTotal.diff_ncumul_conf = null;
            cantonTotal.diffAvg7Days = null;
            cantonTotal.incidences14Days = null;
            //console.log("Old ncumul conf for: "+canton+" date: "+dateString);
          }
          else {
            cantonTotal.diff_ncumul_conf = cantonTotal.ncumul_conf - dataPerDay[dataPerDay.length-1].data[i].ncumul_conf;
            if(dataPerDay.length>9) {
              var diff7Days = cantonTotal.ncumul_conf - dataPerDay[dataPerDay.length-7].data[i].ncumul_conf;
              cantonTotal.diffAvg7Days = Math.round(diff7Days / 7);
              if(dataPerDay.length>15) {
                var diff14Days = cantonTotal.ncumul_conf - dataPerDay[dataPerDay.length-14].data[i].ncumul_conf;
                cantonTotal.incidences14Days = Math.round(diff14Days / population[canton] * 100000);
              }
            }
          }
          if(Number.isNaN(cantonTotal.ncumul_deceased)) {
            cantonTotal.ncumul_deceased = dataPerDay[dataPerDay.length-1].data[i].ncumul_deceased;
            cantonTotal.date_ncumul_deceased = dataPerDay[dataPerDay.length-1].data[i].date_ncumul_deceased;
            cantonTotal.diff_ncumul_deceased = null;
            //console.log("Old ncumul death for: "+canton+" date: "+dateString);
          }
          else {
            cantonTotal.diff_ncumul_deceased = cantonTotal.ncumul_deceased - dataPerDay[dataPerDay.length-1].data[i].ncumul_deceased;
          }
          if(Number.isNaN(cantonTotal.current_hosp)) {
            cantonTotal.current_hosp = dataPerDay[dataPerDay.length-1].data[i].current_hosp;
            cantonTotal.current_vent = dataPerDay[dataPerDay.length-1].data[i].current_vent;
            cantonTotal.current_icu = dataPerDay[dataPerDay.length-1].data[i].current_icu;
            cantonTotal.date_current_hosp = dataPerDay[dataPerDay.length-1].data[i].date_current_hosp;
            cantonTotal.diff_current_hosp = null;
            cantonTotal.diff_current_vent = null;
            cantonTotal.diff_current_icu = null;
            //console.log("Old ncumul death for: "+canton+" date: "+dateString);
          }
          else {
            cantonTotal.diff_current_hosp = cantonTotal.current_hosp - dataPerDay[dataPerDay.length-1].data[i].current_hosp;
            if(cantonTotal.current_vent!=null) cantonTotal.diff_current_vent = cantonTotal.current_vent - dataPerDay[dataPerDay.length-1].data[i].current_vent;
            else cantonTotal.diff_current_vent = null;
            if(cantonTotal.current_icu!=null) cantonTotal.diff_current_icu = cantonTotal.current_icu - dataPerDay[dataPerDay.length-1].data[i].current_icu;
            else cantonTotal.diff_current_icu = null;
          }
      }
      singleDayObject.data.push(cantonTotal);
    }
    dataPerDay.push(singleDayObject);
    date.setTime(date.getTime()+86400000);
  }
  dataPerDay.splice(0,1);
  mainData = {};
  mainData.days = dataPerDay;
  mainData.completeIndex = dataPerDay.length - completeIndex;
  total = mainData.days[mainData.days.length-1].total_ncumul_conf;
  //console.log("CompleteIndex: " + mainData.completeIndex);
  //console.log("Finished processing data");
}

function getDataForDay(canton, date) {
  var dateString = date.toISOString();
  dateString = dateString.substring(0,10);
  var filteredData = data.filter(function(d) { if(d.abbreviation_canton_and_fl==canton && d.date==dateString) return d});
  if(filteredData.length>0) {
    if(filteredData.length>1) console.log("More then 1 line for "+canton+" date: "+dateString);
    var obj = {
      canton: canton,
      ncumul_conf: parseInt(filteredData[filteredData.length-1].ncumul_conf),
      ncumul_deceased: parseInt(filteredData[filteredData.length-1].ncumul_deceased),
      current_hosp: parseInt(filteredData[filteredData.length-1].current_hosp),
      current_icu: filteredData[filteredData.length-1].current_icu!=""?parseInt(filteredData[filteredData.length-1].current_icu):null,
      current_vent: filteredData[filteredData.length-1].current_vent!=""?parseInt(filteredData[filteredData.length-1].current_vent):null,
      date_ncumul_conf: dateString,
      date_ncumul_deceased: dateString,
      date_current_hosp: dateString,
      current_isolated: filteredData[filteredData.length-1].current_isolated!=""?parseInt(filteredData[filteredData.length-1].current_isolated):null,
      current_quarantined: filteredData[filteredData.length-1].current_quarantined!=""?parseInt(filteredData[filteredData.length-1].current_quarantined):null
    };
    return obj;
  }
  return null;
}

var activeFilter;
function filterAllCH(mode) {
  var dataPerDay;
  switch (mode) {
    case 0:
      dataPerDay = mainData.days.slice(0);
      break;
    case 1:
      dataPerDay = mainData.days.slice(99);
      break;
    case 2:
      dataPerDay = mainData.days.slice(mainData.days.length-daysBack);
      break;
  }
  var dateLabels = dataPerDay.map(function(d) {
    var dateSplit = d.date.split("-");
    var day = parseInt(dateSplit[2]);
    var month = parseInt(dateSplit[1])-1;
    var year = parseInt(dateSplit[0]);
    var date = new Date(year,month,day);
    return date;
  });
  //console.log("Finished filtering");
  //console.log(dataPerDay);
  activeFilter = {
    "dataPerDay": dataPerDay,
    "dateLabels": dateLabels
  };
  return activeFilter;
}

var hospDate = null;
function hospBackward() {
  var dateSplit = hospDate.split("-");
  var day = parseInt(dateSplit[2]);
  var month = parseInt(dateSplit[1])-1;
  var year = parseInt(dateSplit[0]);
  var d = new Date(Date.UTC(year,month,day))
  d.setDate(d.getDate() - 1);
  var dateString = d.toISOString();
  dateString = dateString.substring(0,10);
  parseSpital(dateString);
}

function hospForward() {
  var dateSplit = hospDate.split("-");
  var day = parseInt(dateSplit[2]);
  var month = parseInt(dateSplit[1])-1;
  var year = parseInt(dateSplit[0]);
  var d = new Date(Date.UTC(year,month,day))
  d.setDate(d.getDate() + 1);
  var dateString = d.toISOString();
  dateString = dateString.substring(0,10);
  parseSpital(dateString);
}

function parseSpital(date) {
  if(date==null) {
    date = spitaldata[spitaldata.length-1].date;
  }
  var lastData = spitaldata.filter(d=>d.date==date);
  var mode = "current_icu_service_certified";
  var sortedLastData = Array.from(lastData).sort(function(a, b){return b[mode]-a[mode]});
  if(lastData.length==0) return;
  hospDate = date;
  var title = document.getElementById("hospitalisierungstitle");
  title.innerHTML = "Aktuelle Auslastung der Intensivstationen ("+date+")";
  var table = document.getElementById("hospitalisationtable");
  table.innerHTML = "";
  for(var i=0; i<sortedLastData.length; i++) {
    var row = sortedLastData[i];
    var tr = document.createElement("tr");
    var total = parseInt(row.current_icu_covid)+parseInt(row.current_icu_not_covid);
    var auslastung = Math.round(total * 100 / parseInt(row.current_icu_service_certified));
    tr.innerHTML="<td>"+row.hospital_name+"</td><td>"+row.current_icu_covid+"</td><td>"+row.current_icu_not_covid+"</td><td>"+total+"</td><td>"+row.current_icu_service_certified+"</td><td>"+auslastung+"%</td>";
    table.appendChild(tr);
  }

  var totalCovid = lastData.reduce( (prev, curr) => prev+parseInt(curr.current_icu_covid), 0);
  var totalNonCovid = lastData.reduce( (prev, curr) => prev+parseInt(curr.current_icu_not_covid), 0);
  var totalCapacity = lastData.reduce( (prev, curr) => prev+parseInt(curr.current_icu_service_certified), 0);
  var totalBoth = totalCovid+totalNonCovid;
  var totalAuslastung = Math.round(totalBoth * 100 / totalCapacity);
  //console.log(totalCovid);
  var tr = document.createElement("tr");
  tr.innerHTML = "<td><b>TOTAL</b></td><td><b>"+totalCovid+"</b></td><td><b>"+totalNonCovid+"</b></td><td><b>"+totalBoth+"</b></td><td><b>"+totalCapacity+"</b></td><td><b>"+totalAuslastung+"%</b></td>";
  table.appendChild(tr);
}

function parseSpitalHistory() {
  let allDates = spitaldata.map(d => d.date);
  let uniqueDates = [...new Set(allDates)];
  let spitalHistory = [];
  for(let i=0; i<uniqueDates.length; i++) {
    let singleDate = uniqueDates[i];
    var dataForDate = spitaldata.filter(d=>d.date==singleDate);
    var totalCovid = dataForDate.reduce( (prev, curr) => prev+parseInt(curr.current_icu_covid), 0);
    var totalNonCovid = dataForDate.reduce( (prev, curr) => prev+parseInt(curr.current_icu_not_covid), 0);
    var totalCapacity = dataForDate.reduce( (prev, curr) => prev+parseInt(curr.current_icu_service_certified), 0);
    var totalBoth = totalCovid+totalNonCovid;
    var totalAuslastung = Math.round(totalBoth * 100 / totalCapacity);
    spitalHistory.push({
      date: singleDate,
      totalCovid: totalCovid,
      totalNonCovid: totalNonCovid,
      totalCapacity: totalCapacity,
      totalBoth: totalBoth,
      totalAuslastung: totalAuslastung
    });
  }
  let auslastung = spitalHistory.map(d=>d.totalAuslastung);
  var covidAuslastung = spitalHistory.map(d=> {
    return Math.round(d.totalCovid*100/d.totalCapacity);
  });
  var dateLabels = spitalHistory.map(function(d) {
    var dateSplit = d.date.split("-");
    var day = parseInt(dateSplit[2]);
    var month = parseInt(dateSplit[1])-1;
    var year = parseInt(dateSplit[0]);
    var date = new Date(year,month,day);
    return date;
  });
  let datasets = [];
  datasets.push({
      label: 'Auslastung in %',
      data: auslastung,
      fill: false,
      cubicInterpolationMode: 'monotone',
      spanGaps: true,
      borderColor: '#CCCC00',
      backgroundColor: '#CCCC00'
  });
  datasets.push({
      label: 'Auslastung durch Covid in %',
      data: covidAuslastung,
      fill: false,
      cubicInterpolationMode: 'monotone',
      spanGaps: true,
      borderColor: '#CC0000',
      backgroundColor: '#CC0000'
  });
  let chartSpital = new Chart("spitalcanvas", {
    type: 'line',
    options: {
      responsive: false,
      layout: {
          padding: {
              right: 20
          }
      },
      legend: {
        display: false
      },
      title: {
        display: true,
        text: 'Auslastung in %'
      },
      scales: {
        xAxes: [{
          type: 'time',
          time: {
            tooltipFormat: 'ddd DD.MM.YYYY',
            unit: 'day',
            displayFormats: {
              day: 'DD.MM'
            }
          },
          ticks: {
            max: new Date()
          },
          gridLines: {
              color: inDarkMode() ? 'rgba(255, 255, 255, 0.2)' : 'rgba(0, 0, 0, 0.1)'
          }
        }],
        yAxes: [{
          type: cartesianAxesTypes.LINEAR,
          position: 'right',
          ticks: {
            beginAtZero: true,
            suggestedMax: 100,
          },
          gridLines: {
              color: inDarkMode() ? 'rgba(255, 255, 255, 0.2)' : 'rgba(0, 0, 0, 0.1)'
          }
        }]
      },
      plugins: {
        datalabels: false
      }
    },
    data: {
      labels: dateLabels,
      datasets: datasets
    }
  });
}



function parseAgeRange(csvdata, ages, range) {
  var allDates = csvdata.map(d => d.Date);
  let unique = allDates.filter((item, i, ar) => ar.indexOf(item) === i);
  let last7 = unique.slice(unique.length-range);

  var firstRowDate = last7[0];
  var dateSplit = firstRowDate.split("-");
  var day = parseInt(dateSplit[2]);
  var month = parseInt(dateSplit[1]);
  var year = parseInt(dateSplit[0]);
  var firstDateString = day+"."+month+"."+year;

  var latestRowDate = last7[last7.length-1];
  dateSplit = latestRowDate.split("-");
  day = parseInt(dateSplit[2]);
  month = parseInt(dateSplit[1]);
  year = parseInt(dateSplit[0]);
  var secondDateString = day+"."+month+"."+year;
  var title = document.getElementById("agetitle_range");
  title.innerHTML = title.innerHTML + " ("+firstDateString+" - "+secondDateString+")";

  var latestData = csvdata.filter(function(d) { if(d.NewDeaths == "0" && last7.includes(d.Date)) return d});
  var median = "";
  if(latestData.length%2==0) {
    var upperMedian = parseInt(latestData[latestData.length/2].AgeYear);
    var lowerMedian = parseInt(latestData[latestData.length/2-1].AgeYear);
    var median = Math.round((upperMedian+lowerMedian)*10/2)/10;
  }
  else {
    var median = latestData[Math.floor(latestData.length/2)].AgeYear;
  }
  // console.log(latestData);
  const sex = ["F", "M"];
  const names = ["Weiblich", "Männlich"];
  const colors = ["red", "blue"];
  var datasets = [];
  ageMax = 0;
  var ageMin = 200;
  var total = 0;
  var totalCases = 0;
  for(var i in sex) {
    var singleSex = sex[i];
    var filteredForSex = latestData.filter(function(d) { if(d.Gender == singleSex) return d });
    // console.log(filteredForSex);
    var arr = new Array(121).fill(null);
    for(var j=0; j<filteredForSex.length; j++) {
      var singleCase = filteredForSex[j];
      var age = parseInt(singleCase.AgeYear);
      if(age>ageMax) ageMax = age;
      if(age<ageMin) ageMin = age;
      var cases = parseInt(singleCase.NewConfCases);
      arr[age-1] = arr[age-1]+cases;
      total += (cases * age);
      totalCases += cases
    }
    datasets.push({
      label: names[i],
      data: arr,
      borderColor: colors[i],
      backgroundColor: colors[i]
    });
  }
  // console.log("Total (7 days): "+total);
  // console.log("Total Nr of Cases: "+totalCases);
  // console.log("Average: "+(total/totalCases));
  var average = Math.round(total/totalCases*10)/10;
  var p = document.getElementById("weekagenotes");
  p.innerHTML = p.innerHTML + average+" ; Median: "+median;

  if(getDeviceState()==2) {
    var div = document.getElementById("agecanvasweek");
    div.scrollLeft = 250;
    div = document.getElementById("agecanvas");
    div.scrollLeft = 250;
  }
  var chart = new Chart('agecanvasweek', {
    type: 'bar',
    options: {
      layout: {
          padding: {
              right: 20
          }
      },
      responsive: false,
      legend: {
        display: false
      },
      title: {
        display: false,
        text: 'Bestätigte Fälle'
      },
      tooltips: {
        mode: 'x',
        intersect: false,
        bodyFontFamily: 'IBM Plex Mono',
        callbacks: {
          label: function(tooltipItem, data) {
            if(tooltipItem.value == "NaN") return null;
            else return data.datasets[tooltipItem.datasetIndex].label+": "+tooltipItem.value;
          },
          title: function(tooltipItem, data) {
              return tooltipItem[0].label+ " Jahre";
          }
        }
      },
      scales: {
        xAxes: [{
            stacked: true,
            ticks: {
              min: 0,//(Math.floor(ageMin/10))*10,
              max: (Math.ceil(ageMax/10))*10,
              autoSkip: false,
              stepSize: 10,
              callback: function(value, index, values) {
                    return value%10==0?value:null;
              }
            },
            gridLines: {
                color: inDarkMode() ? 'rgba(255, 255, 255, 0.2)' : 'rgba(0, 0, 0, 0.1)',
                offsetGridLines: false
            }
        }],
        yAxes: [{
            stacked: true,
            ticks: {
              beginAtZero: true,
              suggestedMax: 1,
              stepSize: 1,
            },
            gridLines: {
                color: inDarkMode() ? 'rgba(255, 255, 255, 0.2)' : 'rgba(0, 0, 0, 0.1)'
            }
        }],
      },
      plugins: {
        datalabels: false
      }
  },
  data: {
    labels: ages,
    datasets: datasets
  }
});
}


function parseAge(csvdata, ages) {
  var allDates = csvdata.map(d => d.Date);
  var latestRowDate = csvdata[csvdata.length-1].Date;
  var dateSplit = latestRowDate.split("-");
  var day = parseInt(dateSplit[2]);
  var month = parseInt(dateSplit[1]);
  var year = parseInt(dateSplit[0]);
  var title = document.getElementById("agetitle");
  title.innerHTML = title.innerHTML + " " + day+"."+month+"."+year;
  var latestData = csvdata.filter(function(d) { if(d.Date==latestRowDate && d.NewDeaths == "0") return d});
  // console.log(latestData);
  var median = "";
  if(latestData.length%2==0) {
    var upperMedian = parseInt(latestData[latestData.length/2].AgeYear);
    var lowerMedian = parseInt(latestData[latestData.length/2-1].AgeYear);
    var median = Math.round((upperMedian+lowerMedian)*10/2)/10;
  }
  else {
    var median = latestData[Math.floor(latestData.length/2)].AgeYear;
  }
  const sex = ["F", "M"];
  const names = ["Weiblich", "Männlich"];
  const colors = ["red", "blue"];
  var datasets = [];
  var ageMin = 200;
  var total = 0;
  var totalCases = 0;
  for(var i in sex) {
    var singleSex = sex[i];
    var filteredForSex = latestData.filter(function(d) { if(d.Gender == singleSex) return d });
    // console.log(filteredForSex);
    var arr = new Array(121).fill(null);
    for(var j=0; j<filteredForSex.length; j++) {
      var singleCase = filteredForSex[j];
      var age = parseInt(singleCase.AgeYear);
      if(age>ageMax) ageMax = age;
      if(age<ageMin) ageMin = age;
      var cases = parseInt(singleCase.NewConfCases);
      arr[age-1] = arr[age-1]+cases;
      total += (cases * age);
      totalCases += cases
    }
    datasets.push({
      label: names[i],
      data: arr,
      borderColor: colors[i],
      backgroundColor: colors[i]
    });
  }
  // console.log("Total: "+total);
  // console.log("Total Nr of Cases: "+totalCases);
  // console.log("Average: "+(total/totalCases));
  var average = Math.round(total/totalCases*10)/10;
  var p = document.getElementById("agenotes");
  p.innerHTML = p.innerHTML + average+" ; Median: "+median;


  var chart = new Chart('agecanvas', {
    type: 'bar',
    options: {
      layout: {
          padding: {
              right: 20
          }
      },
      responsive: false,
      legend: {
        display: false
      },
      title: {
        display: false,
        text: 'Bestätigte Fälle'
      },
      tooltips: {
        mode: 'x',
        intersect: false,
        bodyFontFamily: 'IBM Plex Mono',
        callbacks: {
          label: function(tooltipItem, data) {
            if(tooltipItem.value == "NaN") return null;
            else return data.datasets[tooltipItem.datasetIndex].label+": "+tooltipItem.value;
          },
          title: function(tooltipItem, data) {
              return tooltipItem[0].label+ " Jahre";
          }
        }
      },
      scales: {
        xAxes: [{
            stacked: true,
            ticks: {
              min: 0,//(Math.floor(ageMin/10))*10,
              max: (Math.ceil(ageMax/10))*10,
              autoSkip: false,
              stepSize: 10,
              callback: function(value, index, values) {
                    return value%10==0?value:null;
              }
            },
            gridLines: {
                color: inDarkMode() ? 'rgba(255, 255, 255, 0.2)' : 'rgba(0, 0, 0, 0.1)',
                offsetGridLines: false
            }
        }],
        yAxes: [{
            stacked: true,
            ticks: {
              beginAtZero: true,
              suggestedMax: 1,
              stepSize: 1,
            },
            gridLines: {
                color: inDarkMode() ? 'rgba(255, 255, 255, 0.2)' : 'rgba(0, 0, 0, 0.1)'
            }
        }],
      },
      plugins: {
        datalabels: false
      }
  },
  data: {
    labels: ages,
    datasets: datasets
  }
});
}

function lastBezirksData(data) {
  var table = document.getElementById("confirmed_1");
  for(var i=101; i<=112; i++) {
    var filtered = data.filter(function(d) { if(d.DistrictId==i) return d});
    //console.log(filtered);
    var last = filtered[filtered.length-1];

    if(i==101) {
      var week = last.Week;
      var year = last.Year;
      var dateOfWeek = getDateOfISOWeek(week, year);
      var endDay = new Date(dateOfWeek);
      endDay.setDate(endDay.getDate()+6);
      var text = `Aktueller Stand Bezirke (${formatDate(dateOfWeek)} - ${formatDate(endDay)})`;
      var lastTitle = document.getElementById("lastTitle");
      lastTitle.innerHTML = text;
    }

    var tr = document.createElement("tr");
    tr.id = i;
    var td = document.createElement("td");
    var span = document.createElement("span");
    span.className = "flag _"+i;
    var text = document.createTextNode(names[i]);
    span.appendChild(text);
    td.appendChild(span);
    tr.appendChild(td);

    td = document.createElement("td");
    text = document.createTextNode(last.TotalConfCases);
    td.appendChild(text);
    tr.appendChild(td);

    td = document.createElement("td");
    text = document.createTextNode(last.NewConfCases);
    td.appendChild(text);
    tr.appendChild(td);

    table.appendChild(tr);
  }
}

function drawBezirke(csvdata,topodata) {
  var svg = d3.select("#bezirkssvg"),//.style("background-color", 'red'),
      width = +svg.attr("width"),
      height = +svg.attr("height");
    svg.selectAll("*").remove();
  var smaller = width<height ? width : height;
  const projection = d3.geoMercator()
      .center([8.675, 47.43])                // GPS of location to zoom on
      .scale(40000*(smaller/600))                       // This is like the zoom
      .translate([ width/2, height/2 ])
  const path = d3.geoPath().projection(projection);

    // Draw the map
  svg.append("g")
      .selectAll("path")
      .data(topodata.features)
      .enter()
      .append("path")
      .attr("fill", "grey")
      .attr("d", path)
      .style("stroke", "white")
      .on("mouseover", mouseOverHandler)
      .on("mouseout", mouseOutHandler);
};

function mouseOverHandler(d, i) {
  d3.select(this).attr("fill", "#5592ED");
  document.getElementById(d.properties.BEZ_ID).className = "active";
  oldSelected = d.properties.BEZ_ID;
}

function mouseOutHandler(d, i) {
  d3.select(this).attr("fill", "grey");
  document.getElementById(d.properties.BEZ_ID).className = "";
}

function drawPLZ(csvdata,topodata, mode) {
  var svg = d3.select("#plzsvg"),//.style("background-color", 'red'),
      width = +svg.attr("width"),
      height = +svg.attr("height");
    svg.selectAll("*").remove();
  var smaller = width<height ? width : height;
  const projection = d3.geoMercator()
      .center([8.675, 47.43])                // GPS of location to zoom on
      .scale(40000*(smaller/600))                       // This is like the zoom
      .translate([ width/2, height/2 ])
  const path = d3.geoPath().projection(projection);

    // Draw the map
  svg.append("g")
      .selectAll("path")
      .data(topodata.features)
      .enter()
      .append("path")
      .attr("d", path)
      .attr("id", function(d,i) {
        var plz = ""+d.properties.PLZ;
        return "svg"+plz;
      })
      .style("stroke", "white")
      .attr('fill', getColor(mode))
      .on("mouseover", mouseOverHandlerPLZ)
      .on("mouseout", mouseOutHandlerPLZ(mode));
};

let incidenceColors = {
  "low": "#008000",
  "medium": "#ffa500",
  "high": "#ff0000",
  "higher": "#b33c7c",
  "highest": "#842b9e",
  "extreme": "#45239f"
};

function getColor(mode) {
    return function (d, i) {
        var plz = ""+d.properties.PLZ;
        if(d.properties.Ortschaftsname=="See") return "blue";
        var filtered = plzdata.filter(function(d) { if(d.PLZ==plz) return d});
        if(filtered.length>0) { // &&
          if(mode==1) {
            var cases = filtered[filtered.length-1].NewConfCases_7days;
            if(cases=="0-3") return "grey";
            else if(cases=="4-6") return colors4[0];
            else if(cases=="7-9") return colors4[1];
            else if(cases=="10-12") return colors4[2];
            else if(cases=="13-15") return colors4[3];
            else if(cases=="16-18") return colors4[4];
            else if(cases=="19-21") return colors4[5];
            else if(cases=="22-24") return colors4[6];
            else if(cases=="25-27") return colors4[7];
            else if(cases=="28-30") return colors4[8];
            else if(cases=="31-33") return colors4[9];
            else return colors4[10]; //>21
          }
          var incidence = filtered[filtered.length-1].incidence;
          var risk = "low";
          if(incidence>=60) risk = "medium";
          if(incidence>=120) risk = "high";
          if(incidence>=240) risk = "higher";
          if(incidence>=480) risk = "highest";
          if(incidence>=960) risk = "extreme";
          return incidenceColors[risk];
        }
        return "grey";
      };
}

function mouseOverHandlerPLZ(d, i) {
  if(old) {
    var evt2 = new MouseEvent("mouseout");
    d3.select(old).node().dispatchEvent(evt2);
    old = null;
  }
  if(d.properties.Ortschaftsname=="See") return;
  d3.select(this).attr("fill", "#5592ED");
  var tr = document.getElementById("plz"+d.properties.PLZ);
  var div = document.getElementById("scrolldiv");
  if(tr!=null) {
    tr.className = "active";
    if(scroll) div.scrollTop = tr.offsetTop-175;
  }
  if(document.getElementById("plzchange"+d.properties.PLZ)) document.getElementById("plzchange"+d.properties.PLZ).className = "active";
}

function mouseOutHandlerPLZ(mode) {
  return function(d, i) {
    d3.select(this).attr("fill", getColor(mode));
    var tr = document.getElementById("plz"+d.properties.PLZ);
    if(tr!=null) tr.className = "";
    if(document.getElementById("plzchange"+d.properties.PLZ)) document.getElementById("plzchange"+d.properties.PLZ).className = "";
  }
}

function drawVaccTable(vaccdata) {
  var tbody = document.getElementById("vaccbody");
  var untilDate = vaccdata[vaccdata.length-1].week_until;
  var dateSplit = untilDate.split("-");
  var day = parseInt(dateSplit[2]);
  var month = parseInt(dateSplit[1])-1;
  var year = parseInt(dateSplit[0]);
  var h3 = document.getElementById("lastVaccSubtitle");
  h3.innerHTML = h3.innerHTML + " " + day+"."+(month+1)+"."+year;
  var filteredPLZData = vaccdata.filter(function(d) { if(d.week_until==untilDate) return d});
  for(var i=0; i<filteredPLZData.length; i++) {
    var singlePLZ = filteredPLZData[i];
    var plz = ""+singlePLZ.plz;
    var tr = document.createElement("tr");
    tr.id = "vaccplz"+plz;
    let population = parseInt(singlePLZ.population); //.toString().replace(/\B(?=(\d{3})+(?!\d))/g, "’");
    let firstVacc = parseInt(singlePLZ.ncumul_firstvacc);
    let secondVacc = parseInt(singlePLZ.ncumul_secondvacc);
    let percentFirstVacc = Math.round(firstVacc*1000/population)/10+"%";
    let percentSecondVacc = Math.round(secondVacc*1000/population)/10+"%";
    singlePLZ.percentFirstVacc = Math.round(firstVacc*1000/population)/10;
    var name = plzNames[plz];
    if(name==undefined) {
      name = plz;
      plz = "";
      percentFirstVacc = firstVacc;
      percentSecondVacc = secondVacc;
    }
    tr.innerHTML = "<td>"+plz+"</td><td>"+name+"</td><td>"+percentFirstVacc+"</td><td>"+percentSecondVacc+"</td>";
    //tr.onclick = clickElement;
    tbody.append(tr);
  }
  drawVacc(filteredPLZData,plzgeojson);
}

function mouseOverHandlerVacc(d, i) {
  if(d.properties.Ortschaftsname=="See") return;
  //d3.select(this).attr("fill", "#5592ED");
  var tr = document.getElementById("vaccplz"+d.properties.PLZ);
  var div = document.getElementById("vaccdiv");
  if(tr!=null) {
    tr.className = "active";
    if(scroll) div.scrollTop = tr.offsetTop-175;
  }
}

function mouseOutHandlerVacc(d, i) {
    //d3.select(this).attr("fill", getColor(mode));
    var tr = document.getElementById("vaccplz"+d.properties.PLZ);
    if(tr!=null) tr.className = "";
}

function drawVacc(csvdata,topodata, mode) {
  var svg = d3.select("#vaccsvg"),//.style("background-color", 'red'),
      width = +svg.attr("width"),
      height = +svg.attr("height");
    svg.selectAll("*").remove();
  var smaller = width<height ? width : height;
  const projection = d3.geoMercator()
      .center([8.675, 47.43])                // GPS of location to zoom on
      .scale(40000*(smaller/600))                       // This is like the zoom
      .translate([ width/2, height/2 ])
  const path = d3.geoPath().projection(projection);

    // Draw the map
  svg.append("g")
      .selectAll("path")
      .data(topodata.features)
      .enter()
      .append("path")
      .attr("d", path)
      .attr("id", function(d,i) {
        var plz = ""+d.properties.PLZ;
        return "svgvacc"+plz;
      })
      .style("stroke", "white")
      .attr('fill', getVaccColor(csvdata))
      .on("mouseover", mouseOverHandlerVacc)
      .on("mouseout", mouseOutHandlerVacc);
};

function getVaccColor(csvdata) {
  return function (d, i) {
      var plz = ""+d.properties.PLZ;
      if(d.properties.Ortschaftsname=="See") return "blue";
      var filtered = csvdata.filter(function(d) { if(d.plz==plz) return d});
      if(filtered.length>0) { // &&
          var cases = filtered[filtered.length-1].percentFirstVacc;
          if(cases<30) return colors3[10];
          else if(cases<35) return colors4[9];
          else if(cases<40) return colors4[8];
          else if(cases<45) return colors4[7];
          else if(cases<55) return colors4[6];
          else if(cases<60) return colors4[5];
          else if(cases<65) return colors4[4];
          else if(cases<70) return colors4[3];
          else if(cases<75) return colors4[2];
          else if(cases<80) return colors4[1];
          else return "#008000"; //>21
      }
      return "grey";
    }
}

var whichclicked = "";
var lastDate;
function drawPLZTable() {
  var tbody = document.getElementById("plzbody");
  lastDate = plzdata[plzdata.length-1].Date;
  var dateSplit = lastDate.split("-");
  var day = parseInt(dateSplit[2]);
  var month = parseInt(dateSplit[1])-1;
  var year = parseInt(dateSplit[0]);
  // var d = new Date(Date.UTC(year,month,day))
  // d.setDate(d.getDate() - 7);
  // dateString = d.toISOString();
  // dateString = dateString.substring(0,10);
  var h3 = document.getElementById("lastPLZSubtitle");
  h3.innerHTML = h3.innerHTML + " " + day+"."+(month+1)+"."+year;
  var filteredPLZData = plzdata.filter(function(d) { if(d.Date==lastDate) return d});
  for(var i=0; i<filteredPLZData.length; i++) {
    var singlePLZ = filteredPLZData[i];
    var plz = ""+singlePLZ.PLZ;
    var tr = document.createElement("tr");
    tr.id = "plz"+plz;
    tr.onclick = clickElement;
    tbody.append(tr);
  }
  updatePLZTable(0); //0 == incidences
  addPLZModeButtons();
  //drawChangesTable(changes);
}

function addPLZModeButtons() {
  var button = document.getElementById('incbutton');
  button.addEventListener('click', function() {
    this.classList.add('active');
    getSiblings(this, '.chartButton.active').forEach(element => element.classList.remove('active'));
    updatePLZTable(0);
  });
  button = document.getElementById('absbutton');
  button.addEventListener('click', function() {
    this.classList.add('active');
    getSiblings(this, '.chartButton.active').forEach(element => element.classList.remove('active'));
    updatePLZTable(1);
  });
}

function updatePLZTable(mode) { //0 = incidences; 1 = absolute
  var changes = [];
  var filteredPLZData = plzdata.filter(function(d) { if(d.Date==lastDate) return d});
  for(var i=0; i<filteredPLZData.length; i++) {
    var singlePLZ = filteredPLZData[i];
    var plz = ""+singlePLZ.PLZ;
    var tr = document.getElementById("plz"+plz);
    var filterForPLZ = plzdata.filter(function(d) { if(d.PLZ==plz) return d});
    var yesterday = filterForPLZ[filterForPLZ.length-2];
    var casesYesterdayString = yesterday.NewConfCases_7days;
    if(casesYesterdayString != singlePLZ.NewConfCases_7days) {
      singlePLZ.oldNewConfCases_7days = casesYesterdayString;
      singlePLZ.oldDate = yesterday.Date;
      changes.push(singlePLZ);
    }
    var daysAgo7 = filterForPLZ[filterForPLZ.length-8];
    var name = plzNames[plz];
    if(name==undefined) name = "";
    var cases = '';
    cases = `${singlePLZ.NewConfCases_7days}`;
    var cases7DaysAgo = daysAgo7.NewConfCases_7days;

    let population = parseInt(singlePLZ.Population); //.toString().replace(/\B(?=(\d{3})+(?!\d))/g, "’");
    let casesToday = parseInt(cases);
    let casesYesterday = parseInt(casesYesterdayString);
    var symbol = "";
    if(casesToday > casesYesterday) symbol = "&#8599;&#xFE0E;";
    else if(casesYesterday > casesToday) symbol = "&#8600;&#xFE0E;"
    let casesAWeekAgo = parseInt(cases7DaysAgo);
    var incidence = Math.round((casesToday + casesAWeekAgo)*100000/population);
    singlePLZ.incidence = incidence;
    var risk = "low";
    if(incidence>=60) risk = "medium";
    if(incidence>=120) risk = "high";
    if(incidence>=240) risk = "higher";
    if(incidence>=480) risk = "highest";
    if(incidence>=960) risk = "extreme";
    if(mode==0) {
      if(plz.length>4) {
        tr.innerHTML = "<td colspan=\"2\">"+plz+"</td><td style=\"text-align: right;\">"+cases7DaysAgo+"</td><td style=\"text-align: right;\">"+cases+"</td><td><span class=\"risk "+risk+"\">"+incidence+"</span></td>";
      }
      else {
        tr.innerHTML = "<td>"+plz+"</td><td>"+name+"</td><td>"+cases7DaysAgo+"</td><td>"+cases+"</td><td><span class=\"risk "+risk+"\">"+incidence+"</span></td>";
      }
    }
    else if(mode==1) {
      if(plz.length>4) {
        tr.innerHTML = "<td colspan=\"2\">"+plz+"</td><td style=\"text-align: right;\">"+casesYesterdayString+"</td><td style=\"text-align: right;\">"+cases+"</td><td>"+symbol+"</td>";
      }
      else {
        tr.innerHTML = "<td>"+plz+"</td><td>"+name+"</td><td>"+casesYesterdayString+"</td><td>"+cases+"</td><td>"+symbol+"</td>";
      }
    }
  }
  var trHead = document.getElementById("plzheadtr");
  if(mode==0) trHead.innerHTML = "<th>PLZ</th><th>Ort</th><th colspan=\"2\">Letzte 2W.<th>Inz</th>";
  else if(mode==1) trHead.innerHTML = "<th>PLZ</th><th>Ort</th><th>Bis gestern</th><th>Bis heute</th><th></th>";
  drawPLZ(plzdata, plzgeojson, mode);
}

function drawChangesTable(changes) {
  var tbody = document.getElementById("plzchangesbody");
  for(var i=0; i<changes.length; i++) {
    var change = changes[i];
    var yesterday = change.oldNewConfCases_7days;
    var today = change.NewConfCases_7days;
    if(i==0) {
      var tday = document.getElementById("tday");
      var yday = document.getElementById("yday");
      var dateSplit = change.Date.split("-");
      var day = parseInt(dateSplit[2]);
      var month = parseInt(dateSplit[1]);
      tday.innerHTML = day+"."+month+".";
      dateSplit = change.oldDate.split("-");
      day = parseInt(dateSplit[2]);
      month = parseInt(dateSplit[1]);
      yday.innerHTML = day+"."+month+".";
    }
    var yesterdayParsed = parseInt(yesterday.split("-")[0]);
    var todayParsed = parseInt(today.split("-")[0]);
    var symbol = "";
    if(todayParsed > yesterdayParsed) symbol = "&#8599;&#xFE0E;";
    else symbol = "&#8600;&#xFE0E;"
    //console.log("Changes: "+change.PLZ+" - Old: "+yesterday+" New: "+today);
    var tr = document.createElement("tr");
    tr.id = "plzchange"+change.PLZ;
    var population = '';
    population = change.Population.toString().replace(/\B(?=(\d{3})+(?!\d))/g, "’");;
    var name = plzNames[change.PLZ];
    if(name==undefined) name = "";
    if(change.PLZ.length>4) {
      tr.innerHTML = "<td colspan=\"2\">"+change.PLZ+"</td><td style=\"text-align: right;\">"+yesterday+"</td><td style=\"text-align: right;\">"+today+"</td><td>"+symbol+"</td>";
    }
    else {
      tr.innerHTML = "<td>"+change.PLZ+"</td><td>"+name+"</td><td>"+yesterday+"</td><td>"+today+"</td><td>"+symbol+"</td>";
    }
    tr.onclick = clickChange;
    tbody.append(tr);
  }
}

var old = null;
var scroll = true;
function clickElement(event) {
  var evt = new MouseEvent("mouseover");
  var which = event.currentTarget.id.replace("plz", "#svg");
  scroll = false;
  d3.select(which).node().dispatchEvent(evt);
  scroll = true;
  old = which;
}

function clickChange(event) {
  var evt = new MouseEvent("mouseover");
  var which = event.currentTarget.id.replace("plz", "#svg");
  which = which.replace("change", "");
  d3.select(which).node().dispatchEvent(evt);
  old = which;
}

Chart.Tooltip.positioners.custom = function(elements, eventPosition) { //<-- custom is now the new option for the tooltip position
    /** @type {Chart.Tooltip} */
    var tooltip = this;

    /* ... */

    var half = eventPosition.x - 81 - 10;
    if(half< 81 + 60) half = 81 + 60;
    return {
        x: half,
        y: 30
    };
}

function toggleLength(e) {
  var short = false;
  if(chartZH.data.datasets[0].data.length>200) short = true;
  if(short) e.target.innerHTML = "Ab März";
  else e.target.innerHTML = "Ab Juni";
  //console.log("Length = "+chartZH.data.datasets[0].data.length);
  var filteredCases = filterCasesZH(short);
  var dateLabels = filteredCases[0];
  var diff = filteredCases[1];
  var avgs = filteredCases[2];
  var cases = filteredCases[3];
  chartZH.data.labels = dateLabels;
  chartZH.data.datasets[0].data = avgs;
  chartZH.data.datasets[1].data = diff;
  chartZH.options.scales.xAxes[0].ticks.min = short ? new Date("2020-05-31T23:00:00") : new Date("2020-02-24T23:00:00");
  chartZH.update(0);
}

function filterCasesZH(short) {
  var place = "ZH";
  var filteredData = data.filter(function(d) { if(d.abbreviation_canton_and_fl==place) return d});
  if(!filteredData || filteredData.length<2) return;
  var moreFilteredData = filteredData.filter(function(d) { if(d.ncumul_conf!="") return d});
  if(short) {
    var referenceDate = new Date("2020-05-31T23:00:00");
    moreFilteredData = moreFilteredData.filter(function(d) {
      var dateSplit = d.date.split("-");
      var day = parseInt(dateSplit[2]);
      var month = parseInt(dateSplit[1])-1;
      var year = parseInt(dateSplit[0]);
      var date = new Date(year,month,day);
      if(date>referenceDate) return true;
    });
  }
  var dateLabels = moreFilteredData.map(function(d) {
    var dateSplit = d.date.split("-");
    var day = parseInt(dateSplit[2]);
    var month = parseInt(dateSplit[1])-1;
    var year = parseInt(dateSplit[0]);
    var date = new Date(year,month,day);
    return date;
  });
  var cases = moreFilteredData.map(function(d) {return d.ncumul_conf});
  var diff = [0];
  var avgs = [0];
  for (var i = 1; i < cases.length; i++) {
    var singleDiff = cases[i] - cases[i - 1]
    diff.push(singleDiff);
    var sum = singleDiff;
    var num = 1;
    for(var j=1; j<7; j++) {
      var x = i-j;
      if(x<0) break;
      num++;
      sum+=diff[x];
    }
    var avg = Math.round(sum/num);
    avgs.push(avg);
  }
  return [dateLabels, diff, avgs, cases];
}

function filterCases(placenr, mode) {
  var place = cantons[placenr];
  //var filteredData = data.filter(function(d) { if(d.abbreviation_canton_and_fl==place) return d});
  var filteredData = mainData.days.map(function(d) { var canton = d.data[placenr]; canton.date = d.date; return canton;});
  //console.log(testData);
  if(!filteredData || filteredData.length<2) return;
  var moreFilteredData = filteredData.filter(function(d) { if(d.ncumul_conf!=null) return d});
  if(mode!=0) {
    var referenceDate = getDateForMode(mode);
    moreFilteredData = moreFilteredData.filter(function(d) {
      var dateSplit = d.date.split("-");
      var day = parseInt(dateSplit[2])+1; //So we dont get 0 for first diff
      var month = parseInt(dateSplit[1])-1;
      var year = parseInt(dateSplit[0]);
      var date = new Date(year,month,day);
      if(date>referenceDate) return true;
    });
  }
  var dateLabels = moreFilteredData.map(function(d) {
    var dateSplit = d.date.split("-");
    var day = parseInt(dateSplit[2]);
    var month = parseInt(dateSplit[1])-1;
    var year = parseInt(dateSplit[0]);
    var date = new Date(year,month,day);
    return date;
  });
  var cases = moreFilteredData.map(d => d.ncumul_conf);
  var diff = moreFilteredData.map(d => d.diff_ncumul_conf);
  var avgs = moreFilteredData.map(d => d.diffAvg7Days);
  var incidences = moreFilteredData.map(d => d.incidences14Days);


  return {
    "cases": cases,
    "dateLabels": dateLabels,
    "diff": diff,
    "avgs": avgs,
    "incidences": incidences,
  }
}

function filterDeaths(placenr, mode) {
  var place = cantons[placenr];
  //var filteredData = data.filter(function(d) { if(d.abbreviation_canton_and_fl==place) return d});
  var filteredData = mainData.days.map(function(d) { var canton = d.data[placenr]; canton.date = d.date; return canton;});
  //console.log(testData);
  if(!filteredData || filteredData.length<2) return;
  var moreFilteredData = filteredData.filter(function(d) { if(d.ncumul_conf!=null) return d});
  if(mode!=0) {
    var referenceDate = getDateForMode(mode);
    moreFilteredData = moreFilteredData.filter(function(d) {
      var dateSplit = d.date.split("-");
      var day = parseInt(dateSplit[2])+1; //So we dont get 0 for first diff
      var month = parseInt(dateSplit[1])-1;
      var year = parseInt(dateSplit[0]);
      var date = new Date(year,month,day);
      if(date>referenceDate) return true;
    });
  }
  var dateLabels = moreFilteredData.map(function(d) {
    var dateSplit = d.date.split("-");
    var day = parseInt(dateSplit[2]);
    var month = parseInt(dateSplit[1])-1;
    var year = parseInt(dateSplit[0]);
    var date = new Date(year,month,day);
    return date;
  });
  var deaths = moreFilteredData.map(d => d.ncumul_deceased);
  var diff = moreFilteredData.map(d => d.diff_ncumul_deceased);
  return {
    "cases": deaths,
    "dateLabels": dateLabels,
    "diff": diff
  }
}

function filterHosp(placenr, mode) {
  var place = cantons[placenr];
  //var filteredData = data.filter(function(d) { if(d.abbreviation_canton_and_fl==place) return d});
  var filteredData = mainData.days.map(function(d) { var canton = d.data[placenr]; canton.date = d.date; return canton;});
  //console.log(testData);
  if(!filteredData || filteredData.length<2) return;
  var moreFilteredData = filteredData.filter(function(d) { if(d.ncumul_conf!=null) return d});
  if(mode!=0) {
    var referenceDate = getDateForMode(mode);
    moreFilteredData = moreFilteredData.filter(function(d) {
      var dateSplit = d.date.split("-");
      var day = parseInt(dateSplit[2])+1; //So we dont get 0 for first diff
      var month = parseInt(dateSplit[1])-1;
      var year = parseInt(dateSplit[0]);
      var date = new Date(year,month,day);
      if(date>referenceDate) return true;
    });
  }
  var dateLabels = moreFilteredData.map(function(d) {
    var dateSplit = d.date.split("-");
    var day = parseInt(dateSplit[2]);
    var month = parseInt(dateSplit[1])-1;
    var year = parseInt(dateSplit[0]);
    var date = new Date(year,month,day);
    return date;
  });
  //Hospitalisations:
  var datasets = [];
  var casesHosp = moreFilteredData.map(function(d) {if(d.diff_current_hosp==null) return null; return d.current_hosp});
  datasets.push({
    label: 'Hospitalisiert',
    data: casesHosp,
    fill: false,
    cubicInterpolationMode: 'monotone',
    spanGaps: true,
    borderColor: '#CCCC00',
    backgroundColor: '#CCCC00',
    datalabels: {
      align: 'end',
      anchor: 'end'
    }
  });
  var filteredForICU = moreFilteredData.filter(function(d) { if(d.diff_current_icu!=null) return d});
  if(filteredForICU.length>0) {
    var casesICU = moreFilteredData.map(function(d) {if(d.diff_current_icu==null) return null; return d.current_icu});
    datasets.push({
      label: 'In Intensivbehandlung',
      data: casesICU,
      fill: false,
      cubicInterpolationMode: 'monotone',
      spanGaps: true,
      borderColor: '#CF5F5F',
      backgroundColor: '#CF5F5F',
      datalabels: {
        align: 'end',
        anchor: 'end'
      }
    });
  }
  var filteredForVent = moreFilteredData.filter(function(d) { if(d.diff_current_vent!=null) return d});
  if(filteredForVent.length>0) {
    var casesVent = moreFilteredData.map(function(d) {if(d.diff_current_vent==null) return null; return d.current_vent});
    datasets.push({
      label: 'Künstlich beatmet',
      data: casesVent,
      fill: false,
      cubicInterpolationMode: 'monotone',
      spanGaps: true,
      borderColor: '#115F5F',
      backgroundColor: '#115F5F',
      datalabels: {
        align: 'end',
        anchor: 'end'
      }
    });
  }
  var datasets2 = [];
  var casesQuarantined = moreFilteredData.map(function(d) {if(d.current_quarantined==null) return null; return d.current_quarantined});
  datasets2.push({
    label: 'In Quarantäne',
    data: casesQuarantined,
    fill: false,
    cubicInterpolationMode: 'monotone',
    spanGaps: true,
    borderColor: '#3333AA',
    backgroundColor: '#3333AA',
    datalabels: {
      align: 'end',
      anchor: 'end'
    }
  });
  var casesIsolated = moreFilteredData.map(function(d) {if(d.current_isolated==null) return null; return d.current_isolated});
  datasets2.push({
    label: 'In Isolation',
    data: casesIsolated,
    fill: false,
    cubicInterpolationMode: 'monotone',
    spanGaps: true,
    borderColor: '#AF5500',
    backgroundColor: '#AF5500',
    datalabels: {
      align: 'end',
      anchor: 'end'
    }
  });
  return {
    "dateLabels": dateLabels,
    "datasets": datasets,
    "datasets2": datasets2
  }
}

function barChartCases() {
  var place = 'ZH';
  var div = document.getElementById("overview_zh");
  var canvas = document.getElementById("zh");
  canvas.id = 'zh';
  if(getDeviceState()==2) {
    canvas.height=200;
  }
  else {
    canvas.height=250;
  }
  var filter = filterCases(0, 2);
  var chart = new Chart(canvas.id, {
    type: 'bar',
    options: {
      layout: {
          padding: {
              right: 20
          }
      },
      responsive: false,
      legend: {
        display: false
      },
      title: {
        display: true,
        text: 'Bestätigte Fälle'
      },
      tooltips: {
        mode: 'index',
        intersect: false,
        bodyFontFamily: 'IBM Plex Mono',
        callbacks: getCallbacks(filter),
      },
      scales: getScales(2),
      plugins: {
        datalabels: {
          display: false,
          color: inDarkMode() ? '#ccc' : 'black',
          font: {
            weight: 'bold'
          }
        }
      }
  },
  data: {
    labels: filter.dateLabels,
    datasets: [
      {
        label: '7d-Avg',
        data: filter.avgs,
        cubicInterpolationMode: 'monotone',
        spanGaps: true,
        pointRadius: 0,
        borderWidth: 2,
        backgroundColor: inDarkMode() ? '#FFFFFF80' : '#77777780',
        borderColor: inDarkMode() ? '#FFFFFF80' : '#77777780',
        fill: false,
        type: 'line'
      },
      {
        label: 'Diff. ',
        data: filter.diff,
        fill: false,
        cubicInterpolationMode: 'monotone',
        spanGaps: true,
        borderColor: '#F15F36',
        backgroundColor: '#F15F36',
        datalabels: {
          align: 'end',
          anchor: 'end',
          display: true
        }
      }
    ]
  }
});
addFilterLengthButtons(canvas, 0, chart, null);
}

function getCallbacks(filter, isDeath) {
  return {
    title: function(tooltipItems, data) {
      var str = tooltipItems[0].label;
      str = str.replace("Mon", "Montag");
      str = str.replace("Tue", "Dienstag");
      str = str.replace("Wed", "Mittwoch");
      str = str.replace("Thu", "Donnerstag");
      str = str.replace("Fri", "Freitag");
      str = str.replace("Sat", "Samstag");
      str = str.replace("Sun", "Sonntag");
      return str;
    },
    afterLabel: function(tooltipItems, data) {
      if(tooltipItems.datasetIndex==0 && !isDeath) return "";
      var index = tooltipItems.index;
      var value = filter.cases[index];
      var padding = isDeath?"    ":"";
      return "Total "+padding+": "+value;
    }
  };
}

function getScales(mode) {
  return {
    xAxes: [{
      type: 'time',
      time: {
        tooltipFormat: 'ddd DD.MM.YYYY',
        unit: 'day',
        displayFormats: {
          day: 'DD.MM'
        }
      },
      ticks: {
        min: getDateForMode(mode),
        max: new Date(),
      },
      gridLines: {
          color: inDarkMode() ? 'rgba(255, 255, 255, 0.2)' : 'rgba(0, 0, 0, 0.1)'
      }
    }],
    yAxes: [{
      type: cartesianAxesTypes.LINEAR,
      position: 'right',
      ticks: {
        beginAtZero: true,
        suggestedMax: 7,
      },
      gridLines: {
          color: inDarkMode() ? 'rgba(255, 255, 255, 0.2)' : 'rgba(0, 0, 0, 0.1)'
      }
    }]
  };
}

function getDataLabels() {
  return {
      color: inDarkMode() ? '#ccc' : 'black',
      font: {
        weight: 'bold',
      },
      formatter: function(value, context) {
        var index = context.dataIndex;
        if(index==0) return "";
        var lastValue = context.dataset.data[index-1];
        var percentageChange = value/lastValue - 1;
        var rounded = Math.round(percentageChange * 100);
        var label = ""+rounded;
        if(rounded >= 0) label = "+"+label+"%";
        else label = "-"+label+"%";

        var change = value-lastValue;
        var label = change>0 ? "+"+change : change;
        return label;
      }
  };
}

function barChartZHDeaths(data) {
  var place = "ZH";
  var filter = filterDeaths(0,2);
  var div = document.getElementById("container_"+place);
  var canvas = document.createElement("canvas");
  canvas.id = "death"+place;
  canvas.height=250;
  div.appendChild(canvas);
  div.scrollLeft = 2300;
  var cases = filter.cases;
  var diff = filter.diff;
  var chart = new Chart(canvas.id, {
      type: 'bar',
      options: {
        layout: {
            padding: {
                right: 20
            }
        },
        responsive: false,
        legend: {
          display: false
        },
        title: {
          display: true,
          text: 'Todesfälle'
        },
        tooltips: {
          mode: 'index',
          intersect: false,
          bodyFontFamily: 'IBM Plex Mono',
          callbacks: getCallbacks(filter, true)
        },
        scales: getScales(),
        plugins: {
          datalabels: {
            display: false,
            color: inDarkMode() ? '#ccc' : 'black',
            font: {
              weight: 'bold'
            }
          }
        }
    },
    data: {
      labels: filter.dateLabels,
      datasets: [
        {
          label: 'Todesfälle',
          data: diff,
          fill: false,
          cubicInterpolationMode: 'monotone',
          spanGaps: true,
          borderColor: inDarkMode() ? 'rgba(150, 150, 150, 1)' : '#010101',
          backgroundColor: inDarkMode() ? 'rgba(150, 150, 150, 1)' : '#010101',
          datalabels: {
            align: 'end',
            anchor: 'end',
            display: true
          }
        }
      ]
    }
  });

  addDeathFilterLengthButtons(canvas, 0, chart);
}

function chartTests(data) {
  var div = document.getElementById("container_test");
  var canvas = document.createElement("canvas");
  canvas.id = "testscanvas";
  canvas.height=300;
  div.appendChild(canvas);
  div.scrollLeft = 1700;
  var datasets = [];
  var labels;
  var labels = data.map(function(d) {
    var start = d.Woche_von;
    var dateSplit = start.split("-");
    var day = parseInt(dateSplit[2]);
    var month = parseInt(dateSplit[1])-1;
    var year = parseInt(dateSplit[0]);
    var startDate = new Date(year,month,day);

    var end = d.Woche_bis;
    var dateSplit = end.split("-");
    var day = parseInt(dateSplit[2]);
    var month = parseInt(dateSplit[1])-1;
    var year = parseInt(dateSplit[0]);
    var endDate = new Date(year,month,day);

    return /*`Woche ${week}:*/ `${formatDate(startDate)} - ${formatDate(endDate)}`;
  });
  var totalTests = data.map(function(d) {
    return parseInt(d.Anzahl_positiv)+parseInt(d.Anzahl_negativ);
  });
  var positivity = data.map(function(d) {
    return d.Anteil_positiv;
  });

  var chart = new Chart(canvas.id, {
      type: 'bar',
      options: {
        layout: {
            padding: {
                right: 20
            }
        },
        responsive: false,
        legend: {
          display: false
        },
        title: {
          display: true,
          text: 'Tests / Positivtätsrate'
        },
        tooltips: {
          mode: 'index',
          intersect: false,
          bodyFontFamily: 'IBM Plex Mono',
          //callbacks: getCallbacks(filter),
        },
        scales: {
          xAxes: [{
            /*type: 'time',
            time: {
              tooltipFormat: 'DD.MM.YYYY',
              unit: 'day',
              displayFormats: {
                day: 'DD.MM'
              }
            },*/
            ticks: {
              minRotation: 45
            },

            gridLines: {
                color: inDarkMode() ? 'rgba(255, 255, 255, 0.2)' : 'rgba(0, 0, 0, 0.1)'
            }

          }],
          yAxes: [{
            id: 'tests',
            type: 'linear',
            position: 'left',
            ticks: {
              beginAtZero: true,
            },
            gridLines: {
                color: inDarkMode() ? 'rgba(255, 255, 255, 0.2)' : 'rgba(0, 0, 0, 0.1)'
            }
          },
          {
            id: 'positivity',
            type: 'linear',
            position: 'right',
            gridLines: false,
            ticks: {
              beginAtZero: true
            }
          }]
        },
        plugins: {
          datalabels: false
        }
    },
    data: {
      labels: labels,
      datasets: [
        {
          label: 'Positivätsrate',
          data: positivity,
          cubicInterpolationMode: 'monotone',
          spanGaps: true,
          pointRadius: 0,
          borderWidth: 2,
          borderColor: '#F15F36',
          backgroundColor: '#F15F36',
          fill: false,
          type: 'line',
          yAxisID: 'positivity',
        },
        {
          label: 'Anzahl Tests',
          data: totalTests,
          fill: false,
          cubicInterpolationMode: 'monotone',
          spanGaps: true,
          borderColor: '#5F36F1',
          backgroundColor: '#5F36F1',
          yAxisID: 'tests'
        }
      ]
    }
  });
}

function chartBezirke(data, absolute) {
  var place = "bezirke";
  if(!absolute) place += "relativ";
  var section = document.getElementById("detail");
  var article = document.createElement("article");
  article.id="detail_"+place;
  var h3 = document.createElement("h3");
  //h3.className = "flag "+place;
  if(absolute) {
    var text = document.createTextNode("Absolute Fallzahlen Bezirke");
  } else {
    var text = document.createTextNode("Relative Fallzahlen Bezirke");
  }
  h3.appendChild(text);
  var a = document.createElement("a");
  a.href = "#top";
  a.innerHTML = "&#x2191;&#xFE0E;";
  a.className = "toplink";
  h3.appendChild(a);
  article.appendChild(h3);
  var div = document.createElement("div");
  div.className = "canvas-dummy";
  div.id = "container_"+place;
  var canvas = document.createElement("canvas");
  canvas.id = place;
  canvas.height=400;
  div.appendChild(canvas);
  article.appendChild(div);
  section.appendChild(article);
  div.scrollLeft = 1700;
  var datasets = [];
  var labels;
  for(var i=101; i<=112; i++) {
    var filtered = data.filter(function(d) { if(d.DistrictId==i) return d});
    if(i==101) {
      labels = filtered.map(function(d) {
        var week = d.Week;
        var year = d.Year;
        var dateOfWeek = getDateOfISOWeek(week, year);
        var endDay = new Date(dateOfWeek);
        endDay.setDate(endDay.getDate()+6);
        return /*`Woche ${week}:*/ `${formatDate(dateOfWeek)} - ${formatDate(endDay)}`;
      });
    }
    if(absolute) {
      var cases = filtered.map(function(d) {return d.TotalConfCases});
    }
    else {
      var cases = filtered.map(function(d) {return Math.round(d.TotalConfCases / d.Population * 10000 *1000) / 1000});
    }
    var diffs = [];
    cases.forEach((item, i) => {
      var last = 0;
      if(i!=0) last = cases[i-1];
      var diff = Math.round((item-last)*100)/100;
      diffs.push(diff);
    });
    datasets.push({
      label: names[i],
      data: diffs,
      fill: false,
      cubicInterpolationMode: 'monotone',
      spanGaps: true,
      borderColor: colors2[i-101],
      backgroundColor: colors2[i-101],
      datalabels: {
        align: 'end',
        anchor: 'end'
      }
    });
  }

  var chart = new Chart(canvas.id, {
    type: 'line',
    options: {
      responsive: false,
      layout: {
          padding: {
              right: 20
          }
      },
      legend: {
        display: true,
        position: 'bottom'
      },
      title: {
        display: true,
        text: (absolute ? 'Bestätigte Fälle nach Bezirk' : "Bestätigte Fälle nach Bezirk pro 10'000 Einwohner")
      },
      tooltips: {
        mode: 'index',
        intersect: false,
        bodyFontFamily: 'IBM Plex Mono',
        itemSort: (a, b, data) => b.yLabel - a.yLabel,
        callbacks: {
          label: function(tooltipItems, data) {
            var value = tooltipItems.value;
            var index = tooltipItems.index;
            var datasetIndex = tooltipItems.datasetIndex;
            var changeStr = "";
            var title = data.datasets[datasetIndex].label+": ";
            var titletabbing = 19-title.length;
            var titlepadding = " ".repeat(titletabbing);
            if(index>0) {
                var change = parseInt(value)-parseInt(data.datasets[datasetIndex].data[index-1]);
                var label = change>0 ? "+"+change : change;
                changeStr = " ("+label+")";
                if(Number.isNaN(change)) changeStr = "";
            }
            var tabbing = 8-value.length;
            if(tabbing<0) tabbing = 0;
            var padding = " ".repeat(tabbing);
            if(!absolute) changeStr = "";
            return title+titlepadding+value+padding+changeStr;
          }
        }
      },
      scales: getWeekScales(),
      plugins: {
        datalabels: false
      }
    },
    data: {
      labels: labels,
      datasets: datasets
    }
  });

  addAxisButtons(canvas, chart);
}

function chartBezirkeDeaths(data, absolute) {
  var place = "bezirke";
  if(!absolute) place += "relativ";
  var div = document.getElementById("container_"+place);
  var canvas = document.createElement("canvas");
  canvas.id = place+"deaths";
  canvas.height=400;
  div.appendChild(canvas);
  div.scrollLeft = 2300;
  var datasets = [];
  var labels;
  for(var i=101; i<=112; i++) {
    var filtered = data.filter(function(d) { if(d.DistrictId==i) return d});
    if(i==101) {
      labels = filtered.map(function(d) {
        var week = d.Week;
        var year = d.Year;
        var dateOfWeek = getDateOfISOWeek(week, year);
        var endDay = new Date(dateOfWeek);
        endDay.setDate(endDay.getDate()+6);
        return /*`Woche ${week}:*/ `${formatDate(dateOfWeek)} - ${formatDate(endDay)}`;
      });
    }
    if(absolute) {
      var cases = filtered.map(function(d) {return d.TotalDeaths});
    }
    else {
      var cases = filtered.map(function(d) {return Math.round(d.TotalDeaths / d.Population * 10000 *1000) / 1000});
    }
    var diffs = [];
    cases.forEach((item, i) => {
      var last = 0;
      if(i!=0) last = cases[i-1];
      var diff = Math.round((item-last)*100)/100;
      diffs.push(diff);
    });
    datasets.push({
      label: names[i],
      data: diffs,
      fill: false,
      cubicInterpolationMode: 'monotone',
      spanGaps: true,
      borderColor: colors2[i-101],
      backgroundColor: colors2[i-101],
      datalabels: {
        align: 'end',
        anchor: 'end'
      }
    });
  }

  var chart = new Chart(canvas.id, {
    type: 'line',
    options: {
      responsive: false,
      layout: {
          padding: {
              right: 20
          }
      },
      legend: {
        display: true,
        position: 'bottom'
      },
      title: {
        display: true,
        text: (absolute ? "Todesfälle nach Bezirk" : "Todesfälle nach Bezirk pro 10'000 Einwohner")
      },
      tooltips: {
        mode: 'index',
        intersect: false,
        bodyFontFamily: 'IBM Plex Mono',
        itemSort: (a, b, data) => b.yLabel - a.yLabel,
        callbacks: {
          label: function(tooltipItems, data) {
            var value = tooltipItems.value;
            var index = tooltipItems.index;
            var datasetIndex = tooltipItems.datasetIndex;
            var changeStr = "";
            var title = data.datasets[datasetIndex].label+": ";
            var titletabbing = 19-title.length;
            var titlepadding = " ".repeat(titletabbing);
            if(index>0) {
                var change = parseInt(value)-parseInt(data.datasets[datasetIndex].data[index-1]);
                var label = change>0 ? "+"+change : change;
                changeStr = " ("+label+")";
                if(Number.isNaN(change)) changeStr = "";
            }
            var tabbing = 6-value.length;
            var padding = " ".repeat(tabbing);
            if(!absolute) changeStr = "";
            return title+titlepadding+value+padding+changeStr;
          }
        }
      },
      scales: getWeekScales(),
      plugins: {
        datalabels: false
      }
    },
    data: {
      labels: labels,
      datasets: datasets
    }
  });

  addAxisButtons(canvas, chart);
}

function toggleHospitalisationLength(e) {
  var short = false;
  if(chartHosp.data.datasets[0].data.length>150) short = true;
  if(short) e.target.innerHTML = "Ab März";
  else e.target.innerHTML = "Ab Juni";
  //console.log("Length = "+chartHosp.data.datasets[0].data.length);
  var filter = filterHospitalisations(short);

  chartHosp.data.labels = filter.dateLabels;
  chartHosp.data.datasets[0].data = filter.casesHosp;
  var i=1;
  if(filter.casesICU.length>0) {
    chartHosp.data.datasets[i].data = filter.casesICU;
    i++;
  }
  if(filter.casesVent.length>0) {
    chartHosp.data.datasets[i].data = filter.casesVent;
    i++;
  }
  chartHosp.options.scales.xAxes[0].ticks.min = short ? new Date("2020-05-31T23:00:00") : new Date("2020-02-24T23:00:00");

  chartIso.data.labels = filter.dateLabels;
  i=0;
  if(filter.casesIsolated.length>0) {
    chartIso.data.datasets[i].data = filter.casesIsolated;
    i++;
  }
  if(filter.casesQuarantined.length>0) {
    chartIso.data.datasets[i].data = filter.casesQuarantined;
  }
  chartIso.options.scales.xAxes[0].ticks.min = short ? new Date("2020-05-31T23:00:00") : new Date("2020-02-24T23:00:00");

  chartHosp.update();
  chartIso.update();
}

var chartHosp;
var chartIso;
function filterHospitalisations(short) {
  var place = "ZH";
  var filteredData = data.filter(function(d) { if(d.abbreviation_canton_and_fl==place) return d});
  if(!filteredData || filteredData.length<2) return;
  var moreFilteredData = filteredData.filter(function(d) { if(d.current_hosp!="") return d});
  if(short) {
    var referenceDate = new Date("2020-05-31T23:00:00");
    moreFilteredData = moreFilteredData.filter(function(d) {
      var dateSplit = d.date.split("-");
      var day = parseInt(dateSplit[2]);
      var month = parseInt(dateSplit[1])-1;
      var year = parseInt(dateSplit[0]);
      var date = new Date(year,month,day);
      if(date>referenceDate) return true;
    });
  }
  var dateLabels = moreFilteredData.map(function(d) {
    var dateSplit = d.date.split("-");
    var day = parseInt(dateSplit[2]);
    var month = parseInt(dateSplit[1])-1;
    var year = parseInt(dateSplit[0]);
    var date = new Date(year,month,day);
    return date;
  });
  var casesHosp = moreFilteredData.map(function(d) {if(d.current_hosp=="") return null; return d.current_hosp});
  var filteredForICU = moreFilteredData.filter(function(d) { if(d.current_icu!="") return d});
  var casesICU = moreFilteredData.map(function(d) {if(d.current_icu=="") return null; return d.current_icu});
  var filteredForVent = moreFilteredData.filter(function(d) { if(d.current_vent!="") return d});
  var casesVent = moreFilteredData.map(function(d) {if(d.current_vent=="") return null; return d.current_vent});
  var filteredForIsolated = moreFilteredData.filter(function(d) { if(d.current_isolated!="") return d});
  var casesIsolated = moreFilteredData.map(function(d) {if(d.current_isolated=="") return null; return d.current_isolated});
  var filteredForQuarantined = moreFilteredData.filter(function(d) { if(d.current_quarantined!="") return d});
  var casesQuarantined = moreFilteredData.map(function(d) {if(d.current_quarantined=="") return null; return d.current_quarantined});
  return {
    "dateLabels": dateLabels,
    "casesHosp": casesHosp,
    "casesICU": casesICU,
    "casesVent": casesVent,
    "casesIsolated": casesIsolated,
    "casesQuarantined": casesQuarantined
  };
}

function barChartHospitalisations(place) {
  var filter = filterHosp(0, 2);
  var div = document.getElementById("container_hosp");
  var canvas = document.createElement("canvas");

  //canvas.className  = "myClass";
  canvas.id = "hosp"+place;
  canvas.height=250;
  div.appendChild(canvas);


  var canvas2 = document.createElement("canvas");

  //canvas.className  = "myClass";
  canvas2.id = "iso"+place;
  canvas2.height=250;
  div.appendChild(canvas2);
  div.scrollLeft = 1900;

  // if(filter.casesIsolated.length>0) {
  //   datasets2.push({
  //     label: 'In Isolation',
  //     data: filter.casesIsolated,
  //     fill: false,
  //     cubicInterpolationMode: 'monotone',
  //     spanGaps: true,
  //     borderColor: '#AF5500',
  //     backgroundColor: '#AF5500',
  //     datalabels: {
  //       align: 'end',
  //       anchor: 'end'
  //     }
  //   });
  // }
  // if(filter.casesQuarantined.length>0) {
  //   datasets2.push({
  //     label: 'In Quarantäne',
  //     data: filter.casesQuarantined,
  //     fill: false,
  //     cubicInterpolationMode: 'monotone',
  //     spanGaps: true,
  //     borderColor: '#3333AA',
  //     backgroundColor: '#3333AA',
  //     datalabels: {
  //       align: 'end',
  //       anchor: 'end'
  //     }
  //   });
  // }
  chartHosp = new Chart(canvas.id, {
    type: 'line',
    options: {
      responsive: false,
      layout: {
          padding: {
              right: 20
          }
      },
      legend: {
        display: true,
        position: 'bottom'
      },
      title: {
        display: true,
        text: 'Hospitalisierte Fälle'
      },
      tooltips: {
        mode: 'index',
        intersect: false,
        bodyFontFamily: 'IBM Plex Mono',
        callbacks: {
          label: function(tooltipItems, data) {
            var value = tooltipItems.value;
            var index = tooltipItems.index;
            var datasetIndex = tooltipItems.datasetIndex;
            var changeStr = "";
            var title = data.datasets[datasetIndex].label+": ";
            var titletabbing = 25-title.length;
            var titlepadding = " ".repeat(titletabbing);
            if(index>0) {
                var change = parseInt(value)-parseInt(data.datasets[datasetIndex].data[index-1]);
                var label = change>0 ? "+"+change : change;
                changeStr = " ("+label+")";
                if(Number.isNaN(change)) changeStr = "";
            }
            var tabbing = 3-value.length;
            var padding = " ".repeat(tabbing);
            return title+titlepadding+value+padding+changeStr;
          }
        }
      },
      scales: getScales(),
      plugins: {
        datalabels: false
      }
    },
    data: {
      labels: filter.dateLabels,
      datasets: filter.datasets
    }
  });

  // addAxisButtons(canvas, chart);

  chartIso = new Chart(canvas2.id, {
    type: 'line',
    options: {
      responsive: false,
      layout: {
          padding: {
              right: 20
          }
      },
      legend: {
        display: true,
        position: 'bottom'
      },
      title: {
        display: true,
        text: 'Fälle in Isolation / Quarantäne'
      },
      tooltips: {
        mode: 'index',
        intersect: false,
        bodyFontFamily: 'IBM Plex Mono',
        callbacks: {
          label: function(tooltipItems, data) {
            var value = tooltipItems.value;
            var index = tooltipItems.index;
            var datasetIndex = tooltipItems.datasetIndex;
            var changeStr = "";
            var title = data.datasets[datasetIndex].label+": ";
            var titletabbing = 19-title.length;
            var titlepadding = " ".repeat(titletabbing);
            if(index>0) {
                var change = parseInt(value)-parseInt(data.datasets[datasetIndex].data[index-1]);
                var label = change>0 ? "+"+change : change;
                changeStr = " ("+label+")";
                if(Number.isNaN(change)) changeStr = "";
            }
            var tabbing = 4-value.length;
            if(tabbing<0) tabbing = 0;
            var padding = " ".repeat(tabbing);
            return title+titlepadding+value+padding+changeStr;
          }
        }
      },
      scales: getScales(),
      plugins: {
        datalabels: false
      }
    },
    data: {
      labels: filter.dateLabels,
      datasets: filter.datasets2
    }
  });

  addHospFilterLengthButtons(canvas, 0, chartHosp, chartIso);
}

function getWeekScales() {
  return {
    xAxes: [{
      /*type: 'time',
      time: {
        tooltipFormat: 'DD.MM.YYYY',
        unit: 'day',
        displayFormats: {
          day: 'DD.MM'
        }
      },*/
      ticks: {
        minRotation: 45
      },

      gridLines: {
          color: inDarkMode() ? 'rgba(255, 255, 255, 0.2)' : 'rgba(0, 0, 0, 0.1)'
      }

    }],
    yAxes: [{
      type: cartesianAxesTypes.LINEAR,
      position: 'right',
      ticks: {
        beginAtZero: true,
        suggestedMax: 2,
      },
      gridLines: {
          color: inDarkMode() ? 'rgba(255, 255, 255, 0.2)' : 'rgba(0, 0, 0, 0.1)'
      }
    }]
  };
}

function getDataLabels() {
  //return false;
  //if(getDeviceState()==2) return false;
  return {
      color: inDarkMode() ? '#ccc' : 'black',
      font: {
        weight: 'bold'
      },
      formatter: function(value, context) {
        var index = context.dataIndex;
        if(index==0) return "";
        var lastValue = context.dataset.data[index-1];
        var percentageChange = value/lastValue - 1;
        var rounded = Math.round(percentageChange * 100);
        var label = ""+rounded;
        if(rounded >= 0) label = "+"+label+"%";
        else label = "-"+label+"%";

        var change = value-lastValue;
        var label = change>0 ? "+"+change : change;
        return label;
      }
  };
}

// Create the state-indicator element
var indicator = document.createElement('div');
indicator.className = 'state-indicator';
document.body.appendChild(indicator);

// Create a method which returns device state
function getDeviceState() {
    return parseInt(window.getComputedStyle(indicator).getPropertyValue('z-index'), 10);
}

var language;
function setLanguageNav() {
  var lang = window.navigator.userLanguage || window.navigator.language;
  var langParameter = getParameterValue("lang");
  if (langParameter != "") lang = langParameter;
  lang = lang.split("-")[0]; //not interested in de-CH de-DE etc.
  switch(lang) {
    case 'de':
    case 'fr':
    case 'it':
      break;
    default:
      lang = 'en';
  }
  language = lang;
  var href;
  var ul = document.getElementsByTagName("ul")[0];
  var li = document.createElement("li");
  if(lang=="de") {
    li.className = "here";
    href = "#"
  }
  else {
    href = "index.html?lang=de";
  }
  li.innerHTML = '<a href="'+href+'">DE</a>';
  ul.appendChild(li);
  li = document.createElement("li");
  if(lang=="fr") {
    li.className = "here";
    href = "#"
  }
  else {
    href = "index.html?lang=fr";
  }
  li.innerHTML = '<a href="'+href+'">FR</a>';
  ul.appendChild(li);
  li = document.createElement("li");
  if(lang=="it") {
    li.className = "here";
    href = "#"
  }
  else {
    href = "index.html?lang=it";
  }
  li.innerHTML = '<a href="'+href+'">IT</a>';
  ul.appendChild(li);
  li = document.createElement("li");
  if(lang=="en") {
    li.className = "here";
    href = "#"
  }
  else {
    href = "index.html?lang=en";
  }
  li.innerHTML = '<a href="'+href+'">EN</a>';
  ul.appendChild(li);
}

function addAxisButtons(elementAfter, chart) {
  var div = document.createElement('div');
  div.className = "chartButtons";
  addAxisButton(div, chart, 'Logarithmisch', cartesianAxesTypes.LOGARITHMIC, false);
  addAxisButton(div, chart, 'Linear', cartesianAxesTypes.LINEAR, true);
  elementAfter.before(div);
}

function addAxisButton(container, chart, name, cartesianAxisType, isActive) {
  var button = document.createElement('button');
  button.className = "chartButton";
  if (isActive) button.classList.add('active');
  button.innerHTML = name;
  button.addEventListener('click', function() {
    this.classList.add('active');
    getSiblings(this, '.chartButton.active').forEach(element => element.classList.remove('active'));

    chart.options.scales.yAxes[0].type = cartesianAxisType;
    chart.update();
  });
  container.append(button);
}

function getSiblings(element, selector) {
	var siblings = [];
  var sibling = element.parentNode.firstChild;

	while (sibling) {
		if (sibling.nodeType === 1 && sibling !== element && sibling.matches(selector)) {
			siblings.push(sibling);
		}
		sibling = sibling.nextSibling
	}

	return siblings;
}

function inDarkMode() {
  if (window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches) {
    return true;
  }
  return false;
}

function formatDate(date) {
  var dd = date.getDate();
  var mm = date.getMonth()+1;
  if(dd<10) dd='0'+dd;
  if(mm<10) mm='0'+mm;
  return dd+"."+mm+"."
}

function getDateOfISOWeek(w, y) {
    var simple = new Date(y, 0, 1 + (w - 1) * 7);
    var dow = simple.getDay();
    var ISOweekStart = simple;
    if (dow <= 4)
        ISOweekStart.setDate(simple.getDate() - simple.getDay() + 1);
    else
        ISOweekStart.setDate(simple.getDate() + 8 - simple.getDay());
    return ISOweekStart;
}

var plzNames = {
5462: "Siglistorf",
6340: "Baar, Sihlbrugg",
8001: "Zürich",
8002: "Zürich",
8003: "Zürich",
8004: "Zürich",
8005: "Zürich",
8006: "Zürich",
8008: "Zürich",
8032: "Zürich",
8037: "Zürich",
8038: "Zürich",
8041: "Zürich",
8044: "Gockhausen,<br/>Zürich",
8045: "Zürich",
8046: "Zürich",
8047: "Zürich",
8048: "Zürich",
8049: "Zürich",
8050: "Zürich",
8051: "Zürich",
8052: "Zürich",
8053: "Zürich",
8055: "Zürich",
8057: "Zürich",
8064: "Zürich",
8102: "Oberengstringen",
8103: "Unterengstringen",
8104: "Weiningen ZH",
8105: "Regensdorf,<br/>Watt",
8106: "Adlikon b. Regensd.",
8107: "Buchs ZH",
8108: "Dällikon",
8109: "Kloster Fahr",
8112: "Otelfingen",
8113: "Boppelsen",
8114: "Dänikon ZH",
8115: "Hüttikon",
8117: "Fällanden",
8118: "Pfaffhausen",
8121: "Benglen",
8122: "Binz",
8123: "Ebmatingen",
8124: "Maur",
8125: "Zollikerberg",
8126: "Zumikon",
8127: "Forch",
8132: "Egg b. Zürich,<br/>Hinteregg",
8133: "Esslingen",
8134: "Adliswil",
8135: "Langnau am A.,<br/>Sihlbrugg St.,<br/>Sihlwald",
8136: "Gattikon",
8142: "Uitikon Waldegg",
8143: "Stallikon,<br/>Uetliberg",
8152: "Glattbrugg,<br/>Opfikon,<br/>Glattpark (Opfikon)",
8153: "Rümlang",
8154: "Oberglatt ZH",
8155: "Niederhasli,<br/>Nassenwil",
8156: "Oberhasli",
8157: "Dielsdorf",
8158: "Regensberg",
8162: "Steinmaur,<br/>Sünikon",
8164: "Bachs",
8165: "Oberweningen,<br/>Schleinikon,<br/>Schöfflisd.",
8166: "Niederweningen",
8172: "Niederglatt ZH",
8173: "Neerach",
8174: "Stadel",
8175: "Windlach",
8180: "Bülach",
8181: "Höri",
8182: "Hochfelden",
8184: "Bachenbülach",
8185: "Winkel",
8187: "Weiach",
8192: "Glattfelden,<br/>Zweidlen",
8193: "Eglisau",
8194: "Hüntwangen",
8195: "Wasterkingen",
8196: "Wil ZH",
8197: "Rafz",
8212: "Nohl,<br/>Neuhausen am Rf.",
8245: "Feuerthalen",
8246: "Langwiesen",
8247: "Flurlingen",
8248: "Uhwiesen",
8302: "Kloten",
8303: "Bassersdorf",
8304: "Wallisellen",
8305: "Dietlikon",
8306: "Brüttisellen",
8307: "Effretikon,<br/>Ottikon",
8308: "Illnau,<br/>Agasul",
8309: "Nürensdorf",
8310: "Kemptthal,<br/>Grafstal",
8311: "Brütten",
8312: "Winterberg ZH",
8314: "Kyburg",
8315: "Lindau",
8317: "Tagelswangen",
8320: "Fehraltorf",
8322: "Madetswil,<br/>Gündisau",
8330: "Pfäffikon ZH",
8331: "Auslikon",
8332: "Russikon,<br/>Rumlikon",
8335: "Hittnau",
8340: "Hinwil",
8342: "Wernetshausen",
8344: "Bäretswil",
8345: "Adetswil",
8352: "Elsau,<br/>Ricketwil (W.)",
8353: "Elgg",
8354: "Hofstetten,<br/>Dickbuch",
8355: "Aadorf",
8363: "Bichelsee",
8400: "Winterthur",
8403: "Winterthur",
8404: "Winterthur,<br/>Reutlingen (Wi.),<br/>Stadel (Wi.)",
8405: "Winterthur",
8406: "Winterthur",
8408: "Winterthur",
8409: "Winterthur",
8412: "Aesch (Neft.),<br/>Riet (Neft.),<br/>Hünikon (Neft.)",
8413: "Neftenbach",
8414: "Buch am Irchel",
8415: "Berg am Irchel,<br/>Gräslikon",
8416: "Flaach",
8418: "Schlatt ZH",
8421: "Dättlikon",
8422: "Pfungen",
8424: "Embrach",
8425: "Oberembrach",
8426: "Lufingen",
8427: "Freienstein,<br/>Rorbas",
8428: "Teufen ZH",
8442: "Hettlingen",
8444: "Henggart",
8447: "Dachsen",
8450: "Andelfingen",
8451: "Kleinandelf.",
8452: "Adlikon b. And.",
8453: "Alten",
8457: "Humlikon",
8458: "Dorf",
8459: "Volken",
8460: "Marthalen",
8461: "Oerlingen",
8462: "Rheinau",
8463: "Benken ZH",
8464: "Ellikon am Rhein",
8465: "Rudolfingen,<br/>Wildensbuch",
8466: "Trüllikon",
8467: "Truttikon",
8468: "Waltalingen,<br/>Guntalingen",
8471: "Rutschwil,<br/>Dägerlen,<br/>Oberwil,<br/>Berg,<br/>Bänk",
8472: "Seuzach",
8474: "Dinhard",
8475: "Ossingen",
8476: "Unterstammheim",
8477: "Oberstammheim",
8478: "Thalheim ad. Thur",
8479: "Altikon",
8482: "Sennhof (Winterthur)",
8483: "Kollbrunn",
8484: "Weisslingen,<br/>Neschwil,<br/>Theilingen",
8486: "Rikon im Tösstal",
8487: "Zell ZH,<br/>Rämismühle",
8488: "Turbenthal",
8489: "Wildberg,<br/>Schalchen,<br/>Ehrikon",
8492: "Wila",
8493: "Saland",
8494: "Bauma",
8495: "Schmidrüti",
8496: "Steg im Tösstal",
8497: "Fischenthal",
8498: "Gibswil",
8499: "Sternenberg",
8500: "Frauenfeld,<br/>Gerlikon",
8523: "Hagenbuch ZH",
8525: "Wilen b. Neunforn,<br/>Niederneunforn",
8542: "Wiesendangen",
8543: "Bertschikon,<br/>Gundetswil,<br/>Kefikon ZH",
8544: "Attikon",
8545: "Rickenbach ZH,<br/>Rickenbach Sulz",
8546: "Menzengrüt,<br/>Islikon,<br/>Kefikon TG",
8548: "Ellikon an der Thur",
8600: "Dübendorf",
8602: "Wangen",
8603: "Schwerzenbach",
8604: "Volketswil",
8605: "Gutenswil",
8606: "Greifensee,<br/>Nänikon",
8607: "Aathal-Seegräben",
8608: "Bubikon",
8610: "Uster",
8614: "Bertschikon,<br/>Sulzbach",
8615: "Wermatswil,<br/>Freudwil",
8616: "Riedikon",
8617: "Mönchaltorf",
8618: "Oetwil am See",
8620: "Wetzikon ZH",
8623: "Wetzikon ZH",
8624: "Grüt (Gossau ZH)",
8625: "Gossau ZH",
8626: "Ottikon (Gossau ZH)",
8627: "Grüningen",
8630: "Rüti ZH",
8632: "Tann",
8633: "Wolfhausen",
8634: "Hombrechtikon",
8635: "Dürnten",
8636: "Wald ZH",
8637: "Laupen ZH",
8700: "Küsnacht ZH",
8702: "Zollikon",
8703: "Erlenbach ZH",
8704: "Herrliberg",
8706: "Meilen",
8707: "Uetikon am See",
8708: "Männedorf",
8712: "Stäfa",
8713: "Uerikon",
8714: "Feldbach",
8800: "Thalwil",
8802: "Kilchberg ZH",
8803: "Rüschlikon",
8804: "Au ZH",
8805: "Richterswil",
8810: "Horgen",
8815: "Horgenberg",
8816: "Hirzel",
8820: "Wädenswil",
8824: "Schönenberg ZH",
8825: "Hütten",
8833: "Samstagern",
8902: "Urdorf",
8903: "Birmensdorf ZH",
8904: "Aesch ZH",
8906: "Bonstetten",
8907: "Wettswil",
8908: "Hedingen",
8909: "Zwillikon",
8910: "Affoltern am Albis",
8911: "Rifferswil",
8912: "Obfelden",
8913: "Ottenbach",
8914: "Aeugst am Albis,<br/>Aeugstertal",
8915: "Hausen am Albis",
8925: "Ebertswil",
8926: "Kappel am Albis,<br/>Hauptikon,<br/>Uerzlikon",
8932: "Mettmenstetten",
8933: "Maschwanden",
8934: "Knonau",
8942: "Oberrieden",
8951: "Fahrweid",
8952: "Schlieren",
8953: "Dietikon",
8954: "Geroldswil",
8955: "Oetwil ad. L."
};

var dateNow = null;
var daysBack = null;
function getDateForMode(mode) {
  if(dateNow==null) {
    daysBack = getDeviceState()==2?20:50;
    dateNow = new Date();
    dateNow.setDate(dateNow.getDate()-daysBack);
  }
  switch(mode) {
    case 0:
      //return new Date("2020-02-24T23:00:00");
      return new Date(Date.UTC(2020,1,25))
    case 1:
      //return new Date("2020-05-31T23:00:00");
      return new Date(Date.UTC(2020,8,1))
    case 2:
      return dateNow;
  }
}

function addDeathFilterLengthButtons(elementAfter, placenr, chart) {
  var div = document.createElement('div');
  div.className = "chartButtons";
  var span = document.createElement("span");
  addDeathFilterLengthButton(span, placenr, `Letzte ${daysBack} Tage`, 2, true, chart);
  addDeathFilterLengthButton(span, placenr, 'Ab September', 1, false, chart);
  addDeathFilterLengthButton(span, placenr, 'Ganz', 0, false, chart);
  div.appendChild(span)
  elementAfter.before(div);
}

function addDeathFilterLengthButton(container, placenr, name, mode, isActive, chart) {
  var button = document.createElement('button');
  button.className = "chartButton";
  if (isActive) button.classList.add('active');
  button.innerHTML = name;
  button.addEventListener('click', function() {
    this.classList.add('active');
    getSiblings(this, '.chartButton.active').forEach(element => element.classList.remove('active'));
    var filter = filterDeaths(placenr, mode);
    if(chart!=null) {
      chart.data.labels = filter.dateLabels;
      chart.data.datasets[0].data = filter.diff;
      chart.data.datasets[0].datalabels.display = (mode!=2) ? false : true;
      chart.options.scales.xAxes[0].ticks.min = getDateForMode(mode);
      chart.options.tooltips.callbacks = getCallbacks(filter, true);
      chart.update(0);
    }
  });
  container.append(button);
}

function addHospFilterLengthButtons(elementAfter, placenr, chartHosp, chartIso) {
  var div = document.createElement('div');
  div.className = "chartButtons";
  var span = document.createElement("span");
  addHospFilterLengthButton(span, placenr, `Letzte ${daysBack} Tage`, 2, true, chartHosp, chartIso);
  addHospFilterLengthButton(span, placenr, 'Ab September', 1, false, chartHosp, chartIso);
  addHospFilterLengthButton(span, placenr, 'Ganz', 0, false, chartHosp, chartIso);
  div.appendChild(span)
  elementAfter.before(div);
}

function addHospFilterLengthButton(container, placenr, name, mode, isActive, chartHosp, chartIso) {
  var button = document.createElement('button');
  button.className = "chartButton";
  if (isActive) button.classList.add('active');
  button.innerHTML = name;
  button.addEventListener('click', function() {
    this.classList.add('active');
    getSiblings(this, '.chartButton.active').forEach(element => element.classList.remove('active'));
    var filter = filterHosp(placenr, mode);
    if(chartHosp!=null) {
      chartHosp.data.labels = filter.dateLabels;
      chartHosp.data.datasets = filter.datasets;
      var pointRadius = mode==2?4:0;
      chartHosp.data.datasets[0].pointRadius = pointRadius;
      chartHosp.data.datasets[1].pointRadius = pointRadius;
      chartHosp.data.datasets[2].pointRadius = pointRadius;
      chartHosp.options.scales.xAxes[0].ticks.min = getDateForMode(mode);
      chartHosp.update(0);
    }
    if(chartIso!=null) {
      chartIso.data.labels = filter.dateLabels;
      chartIso.data.datasets = filter.datasets2;
      var pointRadius = mode==2?4:0;
      chartIso.data.datasets[0].pointRadius = pointRadius;
      chartIso.data.datasets[1].pointRadius = pointRadius;
      chartIso.options.scales.xAxes[0].ticks.min = getDateForMode(mode);
      chartIso.update(0);
    }
  });
  container.append(button);
}

function addFilterLengthButtons(elementAfter, placenr, chart, chartHosp) {
  var div = document.createElement('div');
  div.className = "chartButtons";
  var span = document.createElement("span");
  addFilterLengthButton(span, placenr, 'Inz/100k', -1, false, chart, chartHosp, true);
  addFilterLengthButton(span, placenr, `Letzte ${daysBack} Tage`, 2, true, chart, chartHosp, false);
  addFilterLengthButton(span, placenr, 'Ab September', 1, false, chart, chartHosp, false);
  addFilterLengthButton(span, placenr, 'Ganz', 0, false, chart, chartHosp, false);
  div.appendChild(span)
  elementAfter.before(div);
}

function addFilterLengthButton(container, placenr, name, mode, isActive, chart, chartHosp, isIncidenceButton) {
  var button = document.createElement('button');
  button.className = "chartButton";
  if (isActive) button.classList.add('active');
  button.innerHTML = name;
  button.addEventListener('click', function() {
    if(isIncidenceButton) {
      if(this.classList.contains('active')) {
        this.classList.remove('active');
        chart.showIncidences = false;
      }
      else {
        this.classList.add('active');
        chart.showIncidences = true;
      }
    }
    else {
      this.classList.add('active');
      getSiblings(this, '.chartButton.active').forEach(element => element.classList.remove('active'));
    }
    if(mode==-1) {
      chart.mode = chart.mode!=undefined?chart.mode:2;
    }
    else {
      chart.mode = mode;
    }
    var filter = filterCases(placenr, chart.mode);
    chart.data.labels = filter.dateLabels;
    var pointBackgroundColor = filter.incidences.map(function (d) { return (d<60)?"green":(d>=120?"red":"orange");});
    chart.data.datasets[0].data = chart.showIncidences?filter.incidences:filter.avgs;
    chart.data.datasets[0].label = chart.showIncidences?'Inz/100k':'7d-Avg';
    chart.data.datasets[0].pointBackgroundColor = pointBackgroundColor;
    chart.data.datasets[0].pointBorderColor = pointBackgroundColor;
    chart.data.datasets[0].pointRadius = chart.showIncidences?(chart.mode!=2?1:4):0;
    chart.data.datasets[1].data = chart.showIncidences?null:filter.diff;
    chart.options.title.text = chart.showIncidences?'Inzidenz per 100k über die letzten 14 Tage':'Bestätigte Fälle';
    chart.data.datasets[1].datalabels.display = (chart.mode!=2) ? false : true; //{ display: true, color: inDarkMode() ? '#ccc' : 'black', font: { weight: 'bold'} };
    chart.options.scales.xAxes[0].ticks.min = getDateForMode(mode);
    chart.options.tooltips.callbacks = getCallbacks(filter);
    chart.update(0);

    if(chartHosp!=null) {
    chartHosp.data.labels = filter.dateLabels;
    chartHosp.data.datasets = filter.datasets;
    chartHosp.options.scales.xAxes[0].ticks.min = getDateForMode(mode);
    chartHosp.update(0);
    }
  });
  if(isIncidenceButton) {
    var span = document.createElement('span');
    span.append(button);
    container.append(span);
  }
  else
    container.append(button);
}

function includeHTML() {
  var z, i, elmnt, file, xhttp;
  /* Loop through a collection of all HTML elements: */
  z = document.getElementsByTagName("nav");
  for (i = 0; i < z.length; i++) {
    elmnt = z[i];
    /*search for elements with a certain atrribute:*/
    file = elmnt.getAttribute("url");
    if (file) {
      /* Make an HTTP request using the attribute value as the file name: */
      xhttp = new XMLHttpRequest();
      xhttp.onreadystatechange = function() {
        if (this.readyState == 4) {
          if (this.status == 200) {elmnt.insertAdjacentHTML("afterbegin", this.responseText);}
          if (this.status == 404) {elmnt.insertAdjacentHTML("afterbegin", "Page not found.");}
          /* Remove the attribute, and call this function once more: */
          elmnt.removeAttribute("url");
          document.getElementById("pagenav_zh").className = "here";
        }
      }
      xhttp.open("GET", file, true);
      xhttp.send();
      /* Exit the function: */
      return;
    }
  }
}
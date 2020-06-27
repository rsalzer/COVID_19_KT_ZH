var data;

const cantons = ['AG', 'AI', 'AR', 'BE', 'BL', 'BS', 'FR', 'GE', 'GL', 'GR', 'JU', 'LU', 'NE', 'NW', 'OW', 'SG', 'SH', 'SO', 'SZ', 'TG', 'TI', 'UR', 'VD', 'VS', 'ZG', 'ZH', 'FL'];

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

getCantonZH();
getBezirke();
getAge();

function getCantonZH() {
  var url = 'https://raw.githubusercontent.com/openZH/covid_19/master/fallzahlen_kanton_total_csv_v2/COVID19_Fallzahlen_Kanton_ZH_total.csv';
  d3.csv(url, function(error, csvdata) {
    barChartZH(csvdata);
    barChartZHDeaths(csvdata);
    barChartHospitalisations('ZH', csvdata);
    document.getElementById("loadingspinner").style.display = 'none';
    document.getElementById("loaded").style.display = 'block';
  });
}

function getBezirke() {
  var url = 'https://raw.githubusercontent.com/openZH/covid_19/master/fallzahlen_bezirke/fallzahlen_kanton_ZH_bezirk.csv';
  d3.queue()
    .defer(d3.json, "bezirke.json")
    .defer(d3.csv, "https://raw.githubusercontent.com/openZH/covid_19/master/fallzahlen_bezirke/fallzahlen_kanton_ZH_bezirk.csv")
    .await(function(error, topo, csvdata) {
      draw(csvdata, topo);
      lastBezirksData(csvdata);
      chartBezirke(csvdata, true);
      chartBezirkeDeaths(csvdata, true);
      chartBezirke(csvdata, false);
      chartBezirkeDeaths(csvdata, false);
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
  p.innerHTML = p.innerHTML + average;

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
  p.innerHTML = p.innerHTML + average;


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
    var last = filtered[filtered.length-1];

    if(i==101) {
      var week = last.Week;
      var dateOfWeek = getDateOfISOWeek(week, 2020);
      var endDay = new Date(dateOfWeek);
      endDay.setDate(endDay.getDate()+6);
      var text = `Aktueller Stand Bezirke (${formatDate(dateOfWeek)} - ${formatDate(endDay)})`;
      var lastTitle = document.getElementById("lastTitle");
      lastTitle.innerHTML = text;
    }

    var tr = document.createElement("tr");
    tr.id = i;
    var td = document.createElement("td");
    var text = document.createTextNode(names[i]);
    td.appendChild(text);
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

function draw(csvdata,topodata) {
  var svg = d3.select("svg"),//.style("background-color", 'red'),
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
      // .on("click", clickHandler);

  // svg.append("g")
  //   .selectAll("text")
  //   .data(topodata.features)
  //   .enter()
  //   .append("text")
  //   .attr("transform", d => `translate(${path.centroid(d)})`)
  //   .attr("text-anchor", "middle")
  //   .attr("font-size", 15)
  //   .attr("dy", 15)
  //   .attr("dx", -5)
  //   .text(function(d) {
  //     var id = d.properties.BEZ_ID;
  //     var filtered = data.filter(function(d) { if(d.DistrictId==id && d.Week==week) return d});
  //     var lastFiltered = filtered[filtered.length-1];
  //     return `${lastFiltered.NewConfCases}`;
  //     //return `<tspan x='0' dy='1.2em'>Woche ${lastFiltered.Week}:</tspan><tspan x='0' dy='1.2em'>${d.properties.NAME}: ${lastFiltered.NewConfCases}</tspan>`;
  //   });
};

var oldSelected = null;
function clickHandler(d, i) {

}

function mouseOverHandler(d, i) {
  d3.select(this).attr("fill", "#5592ED");
  // if(oldSelected!=null)
  //   document.getElementById(oldSelected).className = "";
  document.getElementById(d.properties.BEZ_ID).className = "active";
  oldSelected = d.properties.BEZ_ID;
}

function mouseOutHandler(d, i) {
  d3.select(this).attr("fill", "grey");
  document.getElementById(d.properties.BEZ_ID).className = "";
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

function barChartZH(data) {
  var place = "ZH";
  var filteredData = data.filter(function(d) { if(d.abbreviation_canton_and_fl==place) return d});
  if(!filteredData || filteredData.length<2) return;
  var moreFilteredData = filteredData.filter(function(d) { if(d.ncumul_conf!="") return d});
  var dateLabels = moreFilteredData.map(function(d) {
    var dateSplit = d.date.split("-");
    var day = parseInt(dateSplit[2]);
    var month = parseInt(dateSplit[1])-1;
    var year = parseInt(dateSplit[0]);
    var date = new Date(year,month,day);
    return date;
  });
  var div = document.getElementById("overview_zh");
  var canvas = document.getElementById("zh");
  div.scrollLeft = 2300;
  var cases = moreFilteredData.map(function(d) {return d.ncumul_conf});
  var diff = [0];
  for (var i = 1; i < cases.length; i++) diff.push(cases[i] - cases[i - 1]);
  var chart = new Chart('zh', {
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
        callbacks: {
          label: function(tooltipItems, data) {
            var index = tooltipItems.index;
            var value = cases[index];
            var changeStr = "";
            if(index>0) {
                var change = parseInt(value)-parseInt(cases[index-1]);
                var label = change>0 ? "+"+change : change;
                changeStr = " ("+label+")";
            }
            return value+changeStr;
          }
        }
      },
      scales: getScales(),
      plugins: {
        datalabels: {
          color: inDarkMode() ? '#ccc' : 'black',
          font: {
            weight: 'bold'
          }
        }
      }
  },
  data: {
    labels: dateLabels,
    datasets: [
      {
        data: diff,
        fill: false,
        cubicInterpolationMode: 'monotone',
        spanGaps: true,
        borderColor: '#F15F36',
        backgroundColor: '#F15F36',
        datalabels: {
          align: 'end',
          anchor: 'end'
        }
      }
    ]
  }
});

addAxisButtons(canvas, chart);

}

function barChartZHDeaths(data) {
  var place = "ZH";
  var filteredData = data.filter(function(d) { if(d.abbreviation_canton_and_fl==place) return d});
  if(!filteredData || filteredData.length<2) return;
  var moreFilteredData = filteredData.filter(function(d) { if(d.ncumul_deceased!="") return d});
  var dateLabels = moreFilteredData.map(function(d) {
    var dateSplit = d.date.split("-");
    var day = parseInt(dateSplit[2]);
    var month = parseInt(dateSplit[1])-1;
    var year = parseInt(dateSplit[0]);
    var date = new Date(year,month,day);
    return date;
  });
  var div = document.getElementById("container_"+place);
  var canvas = document.createElement("canvas");
  canvas.id = "death"+place;
  canvas.height=250;
  div.appendChild(canvas);
  div.scrollLeft = 2300;
  var cases = moreFilteredData.map(function(d) {return d.ncumul_deceased});
  var diff = [0];
  for (var i = 1; i < cases.length; i++) diff.push(cases[i] - cases[i - 1]);
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
        callbacks: {
          label: function(tooltipItems, data) {
            var index = tooltipItems.index;
            var value = cases[index];
            var changeStr = "";
            if(index>0) {
                var change = parseInt(value)-parseInt(cases[index-1]);
                var label = change>0 ? "+"+change : change;
                changeStr = " ("+label+")";
            }
            return value+changeStr;
          }
        }
      },
      scales: getScales(),
      plugins: {
        datalabels: {
          color: inDarkMode() ? '#ccc' : 'black',
          font: {
            weight: 'bold'
          }
        }
      }
  },
  data: {
    labels: dateLabels,
    datasets: [
      {
        data: diff,
        fill: false,
        cubicInterpolationMode: 'monotone',
        spanGaps: true,
        borderColor: inDarkMode() ? 'rgba(150, 150, 150, 1)' : '#010101',
        backgroundColor: inDarkMode() ? 'rgba(150, 150, 150, 1)' : '#010101',
        datalabels: {
          align: 'end',
          anchor: 'end'
        }
      }
    ]
  }
});

addAxisButtons(canvas, chart);

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
        var dateOfWeek = getDateOfISOWeek(week, 2020);
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
    datasets.push({
      label: names[i],
      data: cases,
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
        var dateOfWeek = getDateOfISOWeek(week, 2020);
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
    datasets.push({
      label: names[i],
      data: cases,
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
            var tabbing = 5-value.length;
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

function barChartCases(place) {
  var filteredData = data.filter(function(d) { if(d.abbreviation_canton_and_fl==place) return d});
  var section = document.getElementById("detail");
  var article = document.createElement("article");
  article.id="detail_"+place;
  var h3 = document.createElement("h3");
  h3.className = "flag "+place;
  var text = document.createTextNode(_(names[place]));
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
  //canvas.className  = "myClass";
  if(filteredData.length==0) {
    div.appendChild(document.createTextNode(_("Keine Daten")));
  }
  else if(filteredData.length==1) {
    div.appendChild(document.createTextNode(_("Ein Datensatz")+": "+filteredData[0].ncumul_conf+" " + _("Fälle am")+" "+filteredData[0].date));
  }
  else {
    canvas.id = place;
    canvas.height=250;
    //canvas.width=350+filteredData.length*40;
    div.appendChild(canvas);
  }
  article.appendChild(div);
  section.appendChild(article);
  div.scrollLeft = 2300;
  if(!filteredData || filteredData.length<2) return;
  var moreFilteredData = filteredData.filter(function(d) { if(d.ncumul_conf!="") return d});
  var dateLabels = moreFilteredData.map(function(d) {
    var dateSplit = d.date.split("-");
    var day = parseInt(dateSplit[2]);
    var month = parseInt(dateSplit[1])-1;
    var year = parseInt(dateSplit[0]);
    var date = new Date(year,month,day);
    return date;
  });
  var cases = moreFilteredData.map(function(d) {return d.ncumul_conf});
  var chart = new Chart(canvas.id, {
    type: 'line',
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
        text: _('Bestätigte Fälle')
      },
      tooltips: {
        mode: 'index',
        intersect: false,
        bodyFontFamily: 'IBM Plex Mono',
        callbacks: {
          label: function(tooltipItems, data) {
            var value = tooltipItems.value;
            var index = tooltipItems.index;
            var changeStr = "";
            if(index>0) {
                var change = parseInt(value)-parseInt(cases[index-1]);
                var label = change>0 ? "+"+change : change;
                changeStr = " ("+label+")";
            }
            return value+changeStr;
          }
        }
      },
      scales: getScales(),
      plugins: {
        datalabels: getDataLabels()
      }
  },
  data: {
    labels: dateLabels,
    datasets: [
      {
        data: cases,
        fill: false,
        cubicInterpolationMode: 'monotone',
        spanGaps: true,
        borderColor: '#F15F36',
        backgroundColor: '#F15F36',
        datalabels: {
          align: 'center',
          anchor: 'center',

        }
      }
    ]
  }
});

  addAxisButtons(canvas, chart);
}

function barChartHospitalisations(place, data) {
  var filteredData = data.filter(function(d) { if(d.abbreviation_canton_and_fl==place) return d});
  var hospitalFiltered = filteredData.filter(function(d) { if(d.current_hosp!="") return d});
  if(hospitalFiltered.length==0) return;
  var div = document.getElementById("container_hosp");
  var canvas = document.createElement("canvas");

  //canvas.className  = "myClass";
  canvas.id = "hosp"+place;
  canvas.height=250;
  div.appendChild(canvas);
  div.scrollLeft = 1900;
  if(!filteredData || filteredData.length<2) return;
  var moreFilteredData = filteredData; //.filter(function(d) { if(d.ncumul_conf!="") return d});
  var dateLabels = moreFilteredData.map(function(d) {
    var dateSplit = d.date.split("-");
    var day = parseInt(dateSplit[2]);
    var month = parseInt(dateSplit[1])-1;
    var year = parseInt(dateSplit[0]);
    var date = new Date(year,month,day);
    return date;
  });
  var datasets = [];
  var casesHosp = moreFilteredData.map(function(d) {if(d.current_hosp=="") return null; return d.current_hosp});
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
  var filteredForICU = moreFilteredData.filter(function(d) { if(d.current_icu!="") return d});
  if(filteredForICU.length>0) {
    var casesICU = moreFilteredData.map(function(d) {if(d.current_icu=="") return null; return d.current_icu});
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
  var filteredForVent = moreFilteredData.filter(function(d) { if(d.current_vent!="") return d});
  if(filteredForVent.length>0) {
    var casesVent = moreFilteredData.map(function(d) {if(d.current_vent=="") return null; return d.current_vent});
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
  var filteredForIsolated = moreFilteredData.filter(function(d) { if(d.current_isolated!="") return d});
  if(filteredForIsolated.length>0) {
    var casesIsolated = moreFilteredData.map(function(d) {if(d.current_isolated=="") return null; return d.current_isolated});
    datasets.push({
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
  }
  var filteredForQuarantined = moreFilteredData.filter(function(d) { if(d.current_quarantined!="") return d});
  if(filteredForQuarantined.length>0) {
    var casesQuarantined = moreFilteredData.map(function(d) {if(d.current_quarantined=="") return null; return d.current_quarantined});
    datasets.push({
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
            var titletabbing = 19-title.length;
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
      labels: dateLabels,
      datasets: datasets
    }
  });

  addAxisButtons(canvas, chart);
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
        suggestedMax: 4,
      },
      gridLines: {
          color: inDarkMode() ? 'rgba(255, 255, 255, 0.2)' : 'rgba(0, 0, 0, 0.1)'
      }
    }]
  };
}

function getScales() {
  return {
    xAxes: [{
      type: 'time',
      time: {
        tooltipFormat: 'DD.MM.YYYY',
        unit: 'day',
        displayFormats: {
          day: 'DD.MM'
        }
      },
      ticks: {
        min: new Date("2020-02-24T23:00:00"),
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
        suggestedMax: 10,
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

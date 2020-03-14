var allCases;
var singleCases;

d3.csv('https://raw.githubusercontent.com/openZH/covid_19/master/COVID19_Fallzahlen_Kanton_ZH_total.csv', function (error, csvdata) {
  allCases = csvdata;
  barChartConfirmedCases(allCases);
  barChartTestedCases(allCases);
  barChartRecoveredCases(allCases);
  barChartDeadCases(allCases);
});

d3.csv('https://raw.githubusercontent.com/openZH/covid_19/master/COVID19_Fallzahlen_Kanton_ZH_alter_geschlecht.csv', function (error, csvdata) {
  singleCases = csvdata;
  pieChartGender(singleCases);
  barChartAgeGroups(singleCases);
});

function barChartConfirmedCases(data) {
  var dateLabels = data.map(function(d) {return d.Date});
  var cases = data.map(function(d) {return d.TotalConfCases});
  var chart = new Chart('confchart', {
    type: 'bar',
    options: {
      responsive: true,
      legend: {
        display: false
      },
      title: {
        display: true,
        text: 'Bestätigte Fälle'
      },
      plugins: {
        labels: {
          render: function (args) {
               var index = args.index;
               var value = args.value;
               if(index==0) return "";
               var lastValue = args.dataset.data[index-1];
               var percentageChange = value/lastValue - 1;
               var rounded = Math.round(percentageChange * 100);
               var label = ""+rounded;
               if(rounded >= 0) label = "+"+label+"%";
               else label = "-"+label+"%";
               return label;
            }
          }
        }
    },
    data: {
      labels: dateLabels,
      datasets: [
        {
          data: cases,
          backgroundColor: '#F15F36'
        }
      ]
    }
  });
}

function barChartTestedCases(data) {
  var dateLabels = data.filter(function(d) { if(d.TotalTestedCases) return d}).map(function(d) {return d.Date});
  var cases = data.filter(function(d) { if(d.TotalTestedCases) return d}).map(function(d) {return d.TotalTestedCases});
  var chart = new Chart('testedchart', {
    type: 'bar',
    options: {
      responsive: false,
      legend: {
        display: false
      },
      title: {
        display: true,
        text: 'Getestete Personen'
      },
      scales: {
            yAxes: [
                {
                    ticks: {
                        beginAtZero: true,
                        min: 0,
                      	suggestedMin: 0
                    }
                }
            ]
        },
        plugins: {
          labels: false
        }
    },
    data: {
      labels: dateLabels,
      datasets: [
        {
          data: cases,
          backgroundColor: '#00F0F0'
        }
      ]
    }
  });
}

function barChartRecoveredCases(data) {
  var dateLabels = data.filter(function(d) { if(d.TotalCured) return d}).map(function(d) {return d.Date});
  var cases = data.filter(function(d) { if(d.TotalCured) return d}).map(function(d) {return d.TotalCured});
  var chart = new Chart('recoveredchart', {
    type: 'bar',
    options: {
      responsive: false,
      legend: {
        display: false
      },
      title: {
        display: true,
        text: 'Geheilte Personen'
      },
      scales: {
            yAxes: [
                {
                    ticks: {
                        beginAtZero: true,
                        min: 0,
                      	suggestedMin: 0
                    }
                }
            ]
      },
      plugins: {
        labels: false
      }
    },
    data: {
      labels: dateLabels,
      datasets: [
        {
          data: cases,
          backgroundColor: '#aaF0aa'
        }
      ]
    }
  });
}

function barChartDeadCases(data) {
  var dateLabels = data.filter(function(d) { if(d.TotalDeaths) return d}).map(function(d) {return d.Date});
  var cases = data.filter(function(d) { if(d.TotalDeaths) return d}).map(function(d) {return d.TotalDeaths});
  if(dateLabels.length==0) {
    dateLabels = ["Bisher"];
    cases = [0];
  }
  var chart = new Chart('deadchart', {
    type: 'bar',
    options: {
      responsive: false,
      legend: {
        display: false
      },
      title: {
        display: true,
        text: 'Gestorbene Personen'
      },
      scales: {
            yAxes: [
                {
                    ticks: {
                        beginAtZero: true,
                        min: 0,
                      	suggestedMin: 0,
                        suggestedMax: 5,
                        stepSize: 1
                    }
                }
            ]
      },
      plugins: {
        labels: false
      }
    },
    data: {
      labels: dateLabels,
      datasets: [
        {
          data: cases,
          backgroundColor: '#F0aaaa'
        }
      ]
    }
  });
}

function pieChartGender(data) {
  var m = 0;
  var f = 0;
  var n = 0;
  for(var i=0; i<data.length; i++) {
    var singleEntry = data[i];
    if(singleEntry.NewConfCases=="" && singleEntry.NewPosTests1=="") {
      console.log("We have a case which is not postested but something else...");
      console.log(JSON.stringify(singleEntry));
      continue;
    }
    var singleEntryGender = singleEntry.Gender;
    switch(singleEntryGender) {
      case "f": f++; break;
      case "m": m++; break;
      default: n++; break;
    }
  }
  var lastDate = data[data.length-1].Date;
  var total = f+m+n;
  var pieChartLabel = 'Anzahl Fälle nach Geschlecht bis '+lastDate+' (Total: '+total+')';
  var config = {
    type: 'doughnut',
    data: {
      datasets: [{
        data: [
            f,
            m,
            n
        ],
        backgroundColor: [
          'rgba(255, 80, 80, 1.0)',
          'rgba(80, 80, 255, 1.0)',
          '#CCCCCC'
        ],
        label: pieChartLabel
      }],
      labels: [
        'Frauen',
        'Männer',
        'Ohne Angabe'
      ]
    },
    options: {
      responsive: true,
      legend: {
        display: true
      },
      title: {
        display: true,
        text: pieChartLabel
      },
      plugins: {
        labels: false
      }
    }
    };
    var chart = new Chart('piechart',config);
}

function barChartAgeGroups(data) {
  var u18,u30,u40,u50,u60,u70,u80,u90,ü90,nd;
  u18=u30=u40=u50=u60=u70=u80=u90=ü90=nd=0;
  for(var i=0; i<data.length; i++) {
    var singleEntry = data[i];
    if(singleEntry.NewConfCases=="" && singleEntry.NewPosTests1=="") {
      console.log("We have a case which is not postested but something else...");
      console.log(JSON.stringify(singleEntry));
      continue;
    }
    var singleEntryAge = singleEntry.AgeYear;
    switch(true) {
      case (singleEntryAge==""): nd++; break;
      case (singleEntryAge<=18): u18++; break;
      case (singleEntryAge<=30): u30++; break;
      case (singleEntryAge<=40): u40++; break;
      case (singleEntryAge<=50): u50++; break;
      case (singleEntryAge<=60): u60++; break;
      case (singleEntryAge<=70): u70++; break;
      case (singleEntryAge<=80): u80++; break;
      case (singleEntryAge<=90): u90++; break;
      case (singleEntryAge>90): ü90++; break;
      default: nd++; break;
    }
  }
  var ageData = [
    u18,
    u30,
    u40,
    u50,
    u60,
    u70,
    u80,
    u90,
    ü90,
    nd
  ];
  var lastDate = data[data.length-1].Date;
  var pieChartLabel = 'Anzahl Fälle nach Alter bis '+lastDate+' (Total: '+data.length+')';
    var config = {
      type: 'horizontalBar',
      data: {
        datasets: [{
          data: ageData,
          backgroundColor: [
            'rgb(44, 106, 105)',
            'rgb(54, 147, 129)',
            'rgb(76, 178, 134)',
            'rgb(104, 200, 128)',
            'rgb(134, 212, 117)',
            'rgb(161, 215, 108)',
            'rgb(179, 209, 109)',
            'rgb(184, 193, 127)',
            'rgb(183, 191, 130)',
            'rgb(170, 170, 170)'
          ]
        }],
        labels: [
          '0-18',
          '19-30',
          '31-40',
          '41-50',
          '51-60',
          '61-70',
          '71-80',
          '81-90',
          '90+',
          'Ohne Angabe'
        ]
      },
      options: {
        responsive: true,
        legend: {
          display: false,
          position: 'left',
          labels: {
            generateLabels: function(chart) {
const data = chart.data;
if (data.labels.length && data.datasets.length) {
return data.labels.map((label, i) => {
  const meta = chart.getDatasetMeta(0);
  const style = meta.controller.getStyle(i);

  return {
    text: label+' :'+ageData[i],
    fillStyle: style.backgroundColor,
    strokeStyle: style.borderColor,
    lineWidth: style.borderWidth,

    // Extra data used for toggling the correct item
    index: i
  };
});
}
return [];
}
          }
        },
        title: {
          display: true,
          text: pieChartLabel
        }
      }
    };
    var chart = new Chart('age',config);
}

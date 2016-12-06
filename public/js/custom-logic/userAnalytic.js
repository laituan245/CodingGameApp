$( document ).ready(function() {
    createPieChartOfSubmissions(getSubmissionDataForPieChart(submissionDataForSection1));
});

function getSubmissionDataForPieChart(submissionData) {
    // Responsibility: Tuan Lai
    if (submissionData.length == 0)
        return null;
    var submissionDataForPieChart = {}
    submissionDataForPieChart.totalNbSubmissions = submissionData.length;
    submissionDataForPieChart.correctAnsSubmissions = 0;
    tmpDict = {}
    var totalErrorCount = 0.0;
    for (var i = 0; i < submissionData.length; i++) {
        if (submissionData[i].isSuccess) {
            submissionDataForPieChart.correctAnsSubmissions += 1;
        } else {
            totalErrorCount += 1;
            if (submissionData[i].errorType in tmpDict) {
                tmpDict[submissionData[i].errorType] += 1;
            } else {
                tmpDict[submissionData[i].errorType] = 1;
            }
        }
    }

    submissionDataForPieChart.wrongAndErrorAnsData = []

    for (var errorType in tmpDict) {
      if (tmpDict.hasOwnProperty(errorType)) {
          var ratio = 100 * parseFloat(tmpDict[errorType]) / totalErrorCount;
          submissionDataForPieChart.wrongAndErrorAnsData.push([errorType, ratio]);
      }
    }
    return submissionDataForPieChart
}

function createPieChartOfSubmissions(submissionDataForPieChart) {
    // Responsibility: Tuan Lai
    // General View: Wrong answer/Errors vs Correct
    // Specific View of Error types: Syntax Error, Infinite loop error, ...
    if (submissionDataForPieChart === null) {
        $('#nosubmissions_h2').show();
        return;
    }
    // Create the chart if the supplied data is not null
    var totalNbSubmissions = parseFloat(submissionDataForPieChart.totalNbSubmissions);
    var correctAnsSubmissions = parseFloat(submissionDataForPieChart.correctAnsSubmissions);
    var percentCorrect = correctAnsSubmissions/totalNbSubmissions * 100;
    var wrongAndErrorAnsData = submissionDataForPieChart.wrongAndErrorAnsData;
    var resultSeries = [{
        name: 'Results',
        data: [{
            name: 'Correct',
            y: percentCorrect,
        }, {
            name: 'Not correct',
            y: 100 - percentCorrect,
            drilldown: 'Not correct'
        }]
    }];
    if (percentCorrect == 100) {
        resultSeries = [{
            name: 'Results',
            data: [{
                name: 'Correct',
                y: percentCorrect,
            }, {
                name: 'Not correct',
                y: 100 - percentCorrect
            }]
        }];
    }

    Highcharts.chart('overall_stat_piechart_container', {
        chart: {
            type: 'pie'
        },
        title: {
            text: 'Results of your submissions'
        },
        subtitle: {
            text: 'Click the slices to view versions.'
        },
        plotOptions: {
            series: {
                dataLabels: {
                    enabled: true,
                    format: '{point.name}: {point.y:.1f}%'
                }
            }
        },

        tooltip: {
            headerFormat: '<span style="font-size:11px">{series.name}</span><br>',
            pointFormat: '<span style="color:{point.color}">{point.name}</span>: <b>{point.y:.2f}%</b> of total<br/>'
        },
        series: resultSeries,
        drilldown: {
            series: [
            {
                name: 'Not correct',
                id: 'Not correct',
                data: wrongAndErrorAnsData
            }]
        }
    });
}

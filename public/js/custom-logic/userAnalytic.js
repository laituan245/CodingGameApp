$( document ).ready(function() {
    createPieChartOfSubmissions(getSubmissionDataForPieChart());
});

function getSubmissionDataForPieChart() {
    // Responsibility: Tuan Lai
    var submissionDataForPieChart = {}
    submissionDataForPieChart.totalNbSubmissions = 333;
    submissionDataForPieChart.correctAnsSubmissions = 245;
    submissionDataForPieChart.wrongAndErrorAnsData = [
        ['Semantic Error', 0.34],
        ['Syntax Error', 0.24],
        ['Division By Zero Error', 0.17],
        ['Infinite Loop Error', 0.16]
    ]
    return submissionDataForPieChart
}

function createPieChartOfSubmissions(submissionDataForPieChart) {
    // Responsibility: Tuan Lai
    // General View: Wrong answer/Errors vs Correct
    // Specific View of Error types: Syntax Error, Infinite loop error, ...
    // Create the chart
    var totalNbSubmissions = parseFloat(submissionDataForPieChart.totalNbSubmissions);
    var correctAnsSubmissions = parseFloat(submissionDataForPieChart.correctAnsSubmissions);
    var percentCorrect = correctAnsSubmissions/totalNbSubmissions * 100;
    var wrongAndErrorAnsData = submissionDataForPieChart.wrongAndErrorAnsData;
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
        series: [{
            name: 'Results',
            data: [{
                name: 'Correct',
                y: percentCorrect,
            }, {
                name: 'Not correct',
                y: 100 - percentCorrect,
                drilldown: 'Not correct'
            }]
        }],
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

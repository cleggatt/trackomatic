'use strict';

angular.module('trackomatic.controllers', ['trackomatic.services', 'googlechart']).
controller('SingleMeasurementCtrl', ['$scope', 'repo', function ($scope, repo) {

    $scope.measurements = repo.measurements;

    $scope.add = function() {
        // TODO Ensure value is numeric
        if ($scope.valueToAdd) {
            repo.add($scope.valueToAdd);
        }

        $scope.valueToAdd = '';
    };

    $scope.remove = function(index) {
       repo.remove(index);
    }
}]).
controller('AllMeasurementsCtrl', ['$scope', 'repo', function ($scope, repo) {

    $scope.measurements = repo.measurements;

}]).
controller('ChartCtrl', ['$scope', 'repo', function ($scope, repo) {

    var measurementsAsRows = [];
    var ourChartWrapper;

    $scope.measurements = repo.measurements;
    $scope.$watch('measurements', function() {
        // Just update the entire array and let the googlecharts API handle working out what the change was
        measurementsAsRows.length = 0;
        for (var i = 0; i < repo.measurements.length; i++) {
            var measurement = repo.measurements[i];
            measurementsAsRows.push({ c: [
                {v: measurement.time},
                {v: measurement.value}
            ] });
        }
    }, true);

    $scope.onReady = function(chartwrapper) {
        ourChartWrapper = chartwrapper;
        ourChartWrapper.getChart().setAction({
            id: 'remove',
            text: 'Remove',
            action: function() {
                var selections = ourChartWrapper.getChart().getSelection();
                if (selections.length) {
                    var selection = selections[0];
                    if (selection.row) {
                        $scope.$apply(function(scope) {
                            repo.remove(selection.row);
                        });
                    }
                }
            }
        });
    };

    $scope.chart = {
        "type": "LineChart",
        "displayed": true,
        "cssStyle": "height:600px; width:100%;",
        "data": {
            "cols": [
                {
                    "id": "time",
                    "label": "Time",
                    "type": "string"
                },
                {
                    "id": "value",
                    "label": "Value",
                    "type": "number"
                }
            ],
            "rows": measurementsAsRows
        },
        "options": {
            seriesType: "line",
            series: {
                0: { type: "line" }
            },
            "hAxis": {
                "title": "Date"
            },
            animation:{
                duration: 1000,
                easing: 'inAndOut'
            },
            tooltip: {
                trigger: 'selection'
            }
        }
    };
}]);
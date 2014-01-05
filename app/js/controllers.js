'use strict';

angular.module('trackomatic.controllers', ['trackomatic.services', 'googlechart']).
controller('SingleMeasurementCtrl', ['$scope', 'repo', function ($scope, repo) {

    $scope.measurements = repo.measurements;
    $scope.ideal = repo.ideal;

    $scope.add = function() {
        // TODO Validate that value is numeric
        var value = $scope.valueToAdd.trim();
        if (value) {
            value = parseInt(value);
        }
        repo.add(value);

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

    // TODO Should put this in the parent scope of all controllers?
    $scope.repo = repo;
    $scope.$watch('repo.measurements', function() {
        // Just update the entire array and let the googlecharts API handle working out what the change was
        measurementsAsRows.length = 0;
        for (var i = 0; i < repo.measurements.length; i++) {
            var measurement = repo.measurements[i];

            // TODO Handle multiple nulls in a row
            var value = measurement.value;
            if (value == null && i > 0 && i < repo.measurements.length - 1) {
                value = (repo.measurements[i - 1].value + repo.measurements[i + 1].value) / 2;
            }

            measurementsAsRows.push({ c: [
                {v: measurement.time},
                {v: value},
                {v: null },
                {v: null }
            ] });
        }
    }, true);
    $scope.$watch('repo.ideal', function() {
       if (repo.ideal.maximum > repo.ideal.minimum) {
            // The min/max series are stacked so the max line value needs to be the difference of max and min
            var maxLine = repo.ideal.maximum - repo.ideal.minimum;
            // TODO Handle undefined min or max
            for (var i = 0; i < measurementsAsRows.length; i++) {
                // TODO Need to make these unselectable with no hover details
                measurementsAsRows[i].c[2].v = repo.ideal.minimum;
                measurementsAsRows[i].c[3].v = maxLine;
            }
       }
    }, true);

    $scope.onReady = function(chartwrapper) {
        ourChartWrapper = chartwrapper;
        ourChartWrapper.getChart().setAction({
            id: 'remove',
            text: 'Remove',
            action: function() {
                // TODO If we can't make the ideal lines unselectable, ignore here
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
                },
                // TODO Remove label when minimum is undefined
                {
                    "id": "ideal-min",
                    "label": "Ideal min",
                    "type": "number"
                },
                // TODO Remove label when maximum is undefined
                {
                    "id": "ideal-max",
                    "label": "Ideal max",
                    "type": "number"
                }
            ],
            "rows": measurementsAsRows
        },
        "options": {
            seriesType: "line",
            isStacked : true,
            series: {
                0: { type: "line" },
                1: { type: "area" },
                2: { type: "area" }
            },
            colors : ['#3366cc', '#dc3912', 'green'],
            "hAxis": {
                "title": "Time"
            },
            // TODO This value should be set to ensure the lowest value is visible
            "vAxis": {
                "viewWindow":  {
                    "min" : 60
                }
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
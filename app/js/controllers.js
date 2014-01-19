'use strict';

angular.module('trackomatic.controllers', ['trackomatic.services', 'googlechart']).
controller('SingleMeasurementCtrl', ['$scope', 'repo', function ($scope, repo) {

    $scope.measurements = repo.measurements;
    $scope.ideal = repo.ideal;

    $scope.add = function() {

        var value = parseFloat($scope.valueToAdd);
        if (_.isNaN(value)) {
            // TODO Present validation error if caused by invalid format/value
            value = undefined;
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
controller('ChartCtrl', ['$scope', 'repo', 'bestFitProvider', function ($scope, repo, bestFitProvider) {

    var addMeasurement = function(rows, time, value, minLine, maxLine) {
        rows.push({ c: [
            {v: time},
            {v: value },
            // TODO Handle undefined min
            // TODO Need to make min unselectable with no hover details
            {v: minLine },
            // TODO Handle undefined max
            // TODO Need to make max unselectable with no hover details
            {v: maxLine }
        ] });
    };

    /**
     * Returns the index within measurements of the first entry that has a non-null value, starting the search at the
     * specified index.
     *
     * @param measurements The array to search
     * @param {number} startIndex The index to start the search from
     * @returns {number} the index of the first occurrence of an entry that has a non-null value, or measurements.length
     *      if such an entry cannot be found
     */
    var findNextValueIndex = function(measurements, startIndex) {
        var end = (startIndex < 0) ? 0 : startIndex;
        for (; end < measurements.length; end++) {
            if (measurements[end].value != null) {
                return end;
            }
        }
        return end;
    }

    /**
     * Returns the corresponding increment along the Y-axis for an increment of 1.0 on the X-axis, to interpolate
     * points between p1 and p2 (in a straight line).
     *
     * @param measurements The array of measurement value
     * @param p1 The leftmost point
     * @param p2 The rightmost point
     * @returns {number} the corresponding increment along the Y-axis for an increment of 1.0 on the X-axis
     */
    var calculateIncrement = function(measurements, p1, p2) {
        var difference = measurements[p2].value - measurements[p1].value;
        var gap = p2 - p1;
        var increment = difference / gap;
        return increment;
    }



    // TODO Should put this in the parent scope of all controllers?
    $scope.repo = repo;
    $scope.$watch('repo.measurements', function() {
        var rows = [];
        // The min/max series are stacked so the max line value needs to be the difference of max and min
        // TODO Handle undefined min or max
        var maxLine = repo.ideal.maximum - repo.ideal.minimum;
        var measurements = repo.measurements;
        if (measurements.length == 0) {
            // Add a single dummy row to keep the charts library happy
            addMeasurement(rows, null, null, repo.ideal.minimum, maxLine);
        } else {
            // Have we encountered a non-null data value, and do we have non-null data values left.
            var processing = false;
            var bestFit = bestFitProvider.getInstance();
            // Just update the entire array and let the googlecharts API handle working out what the change was
            for (var idx = 0; idx < measurements.length; idx++) {
                var measurement = measurements[idx];
                if (processing) {
                    if (measurement.value == null) {
                        // Attempt to find the 2 points to use as the basis of our interpolation. Note, idx will never be 0 here
                        var p1 = idx - 1;
                        var p2 = findNextValueIndex(measurements, p1 + 1);
                        // If we can't find a second point, we have run out of data
                        if (p2 == measurements.length) {
                            processing = false;
                        } else {
                            // Since we're assuming regular sampling, we use idx as the X value for interpolation. If we
                            // were plotting time as X, we wouldn't need interpolation
                            var base = measurements[p1].value;
                            var increment = calculateIncrement(measurements, p1, p2);
                            for (var interpolated = base + increment; idx < p2; interpolated += increment, idx++) {
                                // TODO Need to make these unselectable with no hover detail
                                bestFit.add(idx, interpolated);
                                addMeasurement(rows, measurements[idx].time, interpolated, repo.ideal.minimum, maxLine);
                            }
                            // Rollback index by one as outer loop will increment it
                            idx = idx - 1;
                            continue;
                        }
                    }
                } else if (measurement.value != null) {
                    processing = true;
                }
                if (measurement.value != null) {
                    bestFit.add(idx, measurement.value);
                }
                addMeasurement(rows, measurement.time, measurement.value, repo.ideal.minimum, maxLine);
            }
            if (bestFit.done()) {
                for (var idx = 0; idx < measurements.length; idx++) {
                    var measurement = measurements[idx];
                    if (measurement.value == null) {
                        rows[idx].c[1].v = bestFit.getY(idx);
                    }
                }
            }
        }
        $scope.chart.data.rows = rows;
    },true);
    $scope.$watch('repo.ideal', function() {
       if (repo.ideal.maximum > repo.ideal.minimum) {
           // TODO Handle undefined min or max
            // The min/max series are stacked so the max line value needs to be the difference of max and min
            var maxLine = repo.ideal.maximum - repo.ideal.minimum;
            for (var i = 0; i < $scope.chart.data.rows.length; i++) {
                // TODO Need to make min unselectable with no hover details
                $scope.chart.data.rows[i].c[2].v = repo.ideal.minimum;
                // TODO Need to make max unselectable with no hover details
                $scope.chart.data.rows[i].c[3].v = maxLine;
            }
       }
    }, true);

    var ourChartWrapper;
    $scope.onReady = function(chartWrapper) {
        // On ready is called every when the chart is ready to interact with after changes
        if (ourChartWrapper !== chartWrapper) {
            ourChartWrapper = chartWrapper;
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
                                // TODO Do nothing for value averaged for nulls
                                repo.remove(selection.row);
                            });
                        }
                    }
                }
            });
        }
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
                    // TODO This is actually a number
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
            // We'll overwrite this (with ideals) as soon as the repo has loaded
            "rows": [
                {c: [
                    {v: null},
                    {v: null},
                    {v: null},
                    {v: null}
                ]}
            ]
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
            // FIXME This value should be set to ensure some value is visible (the chart library will fail otherwise)
//            "vAxis": {
//                "viewWindow":  {
//                    "min" : 60
//                }
//            },
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
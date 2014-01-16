'use strict';

describe('SingleMeasurementCtrl', function() {

    // TODO Inject into tests
    var repo;

    beforeEach(module('trackomatic.controllers'));

    beforeEach(function () {
        module(function($provide) {
            repo = jasmine.createSpyObj('measurement repo', ['add', 'remove']);
            repo.measurements = [
                { time: 1, value: 13 },
                { time: 2, value: 42 }
            ];
            repo.ideal = {
                minimum: 10,
                maximum: 20
            };

            $provide.value('repo', repo);
        });
    });

    it('puts measurements from repo in scope', inject(function($rootScope, $controller) {
        // Set up
        var scope = $rootScope.$new(),
            ctrl = $controller("SingleMeasurementCtrl", { $scope: scope });
        // Exercise
        var measurements = scope.measurements;
        // Verify
        expect(measurements).toEqual([
            { time: 1, value: 13 },
            { time: 2, value: 42 }
        ]);
    }));

    it('puts ideals from repo in scope', inject(function($rootScope, $controller) {
        // Set up
        var scope = $rootScope.$new(),
            ctrl = $controller("SingleMeasurementCtrl", { $scope: scope });
        // Exercise
        var ideal = scope.ideal;
        // Verify
        expect(ideal).toEqual({
            minimum: 10,
            maximum: 20
        });
    }));

    it('defines an add() function', inject(function($rootScope, $controller) {
        // Set up
        var scope = $rootScope.$new(),
            ctrl = $controller("SingleMeasurementCtrl", { $scope: scope });
        // Exercise
        var fn = scope.add;
        // Verify
        expect(fn).toBeDefined();
    }));

    it('defines a remove() function', inject(function($rootScope, $controller) {
        // Set up
        var scope = $rootScope.$new(),
            ctrl = $controller("SingleMeasurementCtrl", { $scope: scope });
        // Exercise
        var fn = scope.remove;
        // Verify
        expect(fn).toBeDefined();
    }));

    _.each([ { scope: 42, expected: 42 },
             { scope: '42', expected: 42 },
             { scope: ' 42 ', expected: 42 },
             { scope: 90.5, expected: 90.5 },
             { scope: '90.5', expected: 90.5 },
             { scope: ' 90.5 ', expected: 90.5 },
             { scope: NaN, expected: undefined },
             { scope: '  ', expected: undefined },
             { scope: '', expected: undefined },
             { scope: null, expected: undefined },
             { scope: undefined, expected: undefined} ], function(data) {
        it('stores valueToAdd from scope when add() is called', inject(function($rootScope, $controller) {
            // Set up
            var scope = $rootScope.$new(),
                ctrl = $controller("SingleMeasurementCtrl", { $scope: scope });
            // Exercise
            scope.valueToAdd = data.scope;
            scope.add();
            // Verify
            expect(repo.add).toHaveBeenCalledWith(data.expected);
        }));
    });

    it('clears valueToAdd in scope when add is called', inject(function($rootScope, $controller) {
        // Set up
        var scope = $rootScope.$new(),
            ctrl = $controller("SingleMeasurementCtrl", { $scope: scope });
        // Exercise
        scope.valueToAdd = '42';
        scope.add();
        // Verify
        expect(scope.valueToAdd).toEqual('');
    }));

    it('removes value at passed index when remove() is called', inject(function($rootScope, $controller) {
        // Set up
        var scope = $rootScope.$new(),
            ctrl = $controller("SingleMeasurementCtrl", { $scope: scope });
        // Exercise
        scope.remove(7);
        // Verify
        expect(repo.remove).toHaveBeenCalledWith(7);
    }));
});

describe('AllMeasurementsCtrl', function() {

    // TODO Inject into tests
    var repo;

    beforeEach(module('trackomatic.controllers'));

    beforeEach(function () {
        module(function($provide) {
            repo = jasmine.createSpyObj('measurement repo', ['add', 'remove']);
            repo.measurements = [
                { time: 1, value: 13 },
                { time: 2, value: 42 }
            ];

            $provide.value('repo', repo);
        });
    });

    it('puts measurements from repo in scope', inject(function($rootScope, $controller) {
        // Set up
        var scope = $rootScope.$new(),
            ctrl = $controller("AllMeasurementsCtrl", { $scope: scope });
        // Exercise
        var measurements = scope.measurements;
        // Verify
        expect(measurements).toEqual([
            { time: 1, value: 13 },
            { time: 2, value: 42 }
        ]);
    }));
});

describe('ChartCtrl', function() {

    beforeEach(module('trackomatic.controllers'));

    beforeEach(function () {
        module(function($provide) {
            var repo = jasmine.createSpyObj('measurement repo', ['add', 'remove']);
            repo.measurements = [
                { time: 1, value: 13 }
            ];
            repo.ideal = {
                minimum: 10,
                maximum: 20
            };

            $provide.value('repo', repo);
        });
    });

    it('updates measurementsAsRows values when repo measurements change', inject(function($rootScope, $controller, repo) {
        // Set up
        var scope = $rootScope.$new(),
            ctrl = $controller("ChartCtrl", { $scope: scope });
        scope.$apply();
        // Exercise
        repo.measurements.push({ time: 2, value: 42 });
        scope.$apply();
        // Verify
        expect(scope.chart.data.rows).toEqual([
            { c: [ {v: 1}, {v: 13}, {v: 10}, {v: 10} ] },
            { c: [ {v: 2}, {v: 42}, {v: 10}, {v: 10}  ] }
        ]);
    }));

    it('updates ideals only when ideal min changes', inject(function($rootScope, $controller, repo) {
        // Set up
        var scope = $rootScope.$new(),
            ctrl = $controller("ChartCtrl", { $scope: scope });
        scope.$apply();
        // Exercise
        repo.ideal.minimum = 7;
        scope.$apply();
        // Verify
        expect(scope.chart.data.rows).toEqual([
            { c: [ {v: 1}, {v: 13}, {v: 7}, {v: 13} ] }
        ]);
    }));

    it('updates ideals only when ideal max changes', inject(function($rootScope, $controller, repo) {
        // Set up
        var scope = $rootScope.$new(),
            ctrl = $controller("ChartCtrl", { $scope: scope });
        scope.$apply();
        // Exercise
        repo.ideal.maximum = 25;
        scope.$apply();
        // Verify
        expect(scope.chart.data.rows).toEqual([
            { c: [ {v: 1}, {v: 13}, {v: 10}, {v: 15} ] }
        ]);
    }));

    it('updates ideals when ideal object changes', inject(function($rootScope, $controller, repo) {
        // Set up
        var scope = $rootScope.$new(),
            ctrl = $controller("ChartCtrl", { $scope: scope });
        scope.$apply();
        // Exercise
        repo.ideal= { minimum : 3, maximum: 30 };
        scope.$apply();
        // Verify
        expect(scope.chart.data.rows).toEqual([
            { c: [ {v: 1}, {v: 13}, {v: 3}, {v: 27} ] }
        ]);
    }));

    _.each([
        { ideals : { minimum : 50, maximum : 50 }, expectedMinimum: 10, expectedMaximum: 10 },
        { ideals : { minimum : 51, maximum : 50 }, expectedMinimum: 10, expectedMaximum: 10 },
        { ideals : { minimum : 50, maximum : 51 }, expectedMinimum: 50, expectedMaximum: 1 }
    ], function(testData) {
        it('ignores ideals when max is not greater than the minimum', inject(function($rootScope, $controller, repo) {
            // Set up
            var scope = $rootScope.$new(),
                ctrl = $controller("ChartCtrl", { $scope: scope });
            scope.$apply();
            // Exercise
            repo.ideal= testData.ideals;
            scope.$apply();
            // Verify
            expect(scope.chart.data.rows).toEqual([
                { c: [ {v: 1}, {v: 13}, {v: testData.expectedMinimum}, {v: testData.expectedMaximum} ] }
            ]);
        }));
    });

    _.each([
        // Inside in a sequence
        { actual : [10, null, 20], expected :[10, 15, 20] },
        { actual : [30, null, null, 36], expected :[30, 32, 34, 36] },
        // Start of a sequence, can't calculate line of best fit
        { actual : [null, 15], expected :[null, 15 ] },
        { actual : [null, null, 34], expected :[null, null, 34 ] },
        // Start of a sequence, can calculate line of best fit at some point
        { actual : [null, 15, 20], expected :[10, 15, 20] },
        { actual : [null, null, 34, 36], expected :[30, 32, 34, 36] },
        // End of a sequence, can't calculate line of best fit
        { actual : [15, null], expected :[15, null] },
        { actual : [32, null, null], expected :[32, null, null] },
        // End of a sequence, can calculate line of best fit
        { actual : [10, 15, null], expected :[10, 15, 20] },
        { actual : [30, 32, null, null], expected :[30, 32, 34, 36] },
        // Some edge cases
        { actual : [10, null, 20, null, 30], expected :[10, 15, 20, 25, 30] },
        { actual : [null, null, null], expected :[null, null, null] }
    ], function(data) {
        it('interpolates null values where possible', inject(function($rootScope, $controller, repo) {
            // Set up
            var scope = $rootScope.$new(),
                ctrl = $controller("ChartCtrl", { $scope: scope });
            // Exercise
            repo.measurements.length = 0;
            _.each(data.actual, function(value, idx) {
                repo.measurements.push({ time: idx + 1, value: value });
            });
            scope.$apply();
            // Verify
            var expected = [];
            _.each(data.expected, function(value, idx) {
                expected.push({ c: [ {v:  idx + 1}, {v: value}, {v: 10}, {v: 10} ] });
            });
            expect(scope.chart.data.rows).toEqual(expected);
        }));
    });
});
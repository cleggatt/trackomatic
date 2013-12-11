'use strict';

describe('SingleMeasurementCtrl', function() {

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

    it('stores valueToAdd from scope when add() is called', inject(function($rootScope, $controller) {
        // Set up
        var scope = $rootScope.$new(),
            ctrl = $controller("SingleMeasurementCtrl", { $scope: scope });
        // Exercise
        scope.valueToAdd = 42;
        scope.add();
        // Verify
        expect(repo.add).toHaveBeenCalledWith(42);
    }));

    it('ignores empty valueToAdd from scope when add is called', inject(function($rootScope, $controller) {
        // Set up
        var scope = $rootScope.$new(),
            ctrl = $controller("SingleMeasurementCtrl", { $scope: scope });
        // Exercise
        scope.valueToAdd = '';
        scope.add();
        // Verify
        expect(repo.add).not.toHaveBeenCalled();
    }));

    it('clears valueToAdd in scope when add is called', inject(function($rootScope, $controller) {
        // Set up
        var scope = $rootScope.$new(),
            ctrl = $controller("SingleMeasurementCtrl", { $scope: scope });
        // Exercise
        scope.valueToAdd = 42;
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

    var repo;

    beforeEach(module('trackomatic.controllers'));

    beforeEach(function () {
        module(function($provide) {
            repo = jasmine.createSpyObj('measurement repo', ['add', 'remove']);
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

    it('updates measurementsAsRows when repo measurements change', inject(function($rootScope, $controller) {
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

    it('updates ideals when ideal min changes', inject(function($rootScope, $controller) {
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

    it('updates ideals when ideal max changes', inject(function($rootScope, $controller) {
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

    it('updates ideals when ideal object changes', inject(function($rootScope, $controller) {
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

    var newIdeals = [
        { minimum : 50, maximum : 50 },
        { minimum : 51, maximum : 50}
    ];
    _.each(newIdeals, function(newIdeal) {
        it('ignores ideals when max is not greater than the minimum', inject(function($rootScope, $controller) {
            // Set up
            var scope = $rootScope.$new(),
                ctrl = $controller("ChartCtrl", { $scope: scope });
            scope.$apply();
            // Exercise
            repo.ideal= newIdeal;
            scope.$apply();
            // Verify
            expect(scope.chart.data.rows).toEqual([
                { c: [ {v: 1}, {v: 13}, {v: 10}, {v:10} ] }
            ]);
        }));
    });
});
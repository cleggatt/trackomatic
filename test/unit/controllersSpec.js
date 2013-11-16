'use strict';

describe('MeasurementCtrl', function() {

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
            ctrl = $controller("MeasurementCtrl", { $scope: scope });
        // Exercise
        var measurements = scope.measurements;
        // Verify
        expect(measurements).toEqual([
            { time: 1, value: 13 },
            { time: 2, value: 42 }
        ]);
    }));

    it('defines an add() function', inject(function($rootScope, $controller) {
        // Set up
        var scope = $rootScope.$new(),
            ctrl = $controller("MeasurementCtrl", { $scope: scope });
        // Exercise
        var fn = scope.add;
        // Verify
        expect(fn).toBeDefined();
    }));

    it('defines a remove() function', inject(function($rootScope, $controller) {
        // Set up
        var scope = $rootScope.$new(),
            ctrl = $controller("MeasurementCtrl", { $scope: scope });
        // Exercise
        var fn = scope.remove;
        // Verify
        expect(fn).toBeDefined();
    }));

    it('stores valueToAdd from scope when add() is called', inject(function($rootScope, $controller) {
        // Set up
        var scope = $rootScope.$new(),
            ctrl = $controller("MeasurementCtrl", { $scope: scope });
        // Exercise
        scope.valueToAdd = 42;
        scope.add();
        // Verify
        expect(repo.add).toHaveBeenCalledWith(42);
    }));

    it('ignores empty valueToAdd from scope when add is called', inject(function($rootScope, $controller) {
        // Set up
        var scope = $rootScope.$new(),
            ctrl = $controller("MeasurementCtrl", { $scope: scope });
        // Exercise
        scope.valueToAdd = '';
        scope.add();
        // Verify
        expect(repo.add).not.toHaveBeenCalled();
    }));

    it('clears valueToAdd in scope when add is called', inject(function($rootScope, $controller) {
        // Set up
        var scope = $rootScope.$new(),
            ctrl = $controller("MeasurementCtrl", { $scope: scope });
        // Exercise
        scope.valueToAdd = 42;
        scope.add();
        // Verify
        expect(scope.valueToAdd).toEqual('');
    }));

    it('removes value at passed index when remove() is called', inject(function($rootScope, $controller) {
        // Set up
        var scope = $rootScope.$new(),
            ctrl = $controller("MeasurementCtrl", { $scope: scope });
        // Exercise
        scope.remove(7);
        // Verify
        expect(repo.remove).toHaveBeenCalledWith(7);
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

            $provide.value('repo', repo);
        });
    });

    it('updates measurementsAsRows when repo measurements change', inject(function($rootScope, $controller) {
        // Set up
        var scope = $rootScope.$new(),
            ctrl = $controller("ChartCtrl", { $scope: scope });
        // Exercise
        repo.measurements.push({ time: 2, value: 42 });
        scope.$apply();
        // Verify
        expect(scope.chart.data.rows).toEqual([
            { c: [ {v: 1}, {v: 13} ] },
            { c: [ {v: 2}, {v: 42} ] }
        ]);
    }));
});
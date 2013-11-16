'use strict';

describe('a measurement repository', function() {

    beforeEach(module('trackomatic.services'));

    it('will be defined', inject(function(repo) {
        expect(repo).toBeDefined();
    }));

    // TODO Can we fix the reporting for nested describes?
    describe('an empty repository', function() {

        beforeEach(function () {
            module(function($provide) {
                $provide.value('$window', {
                    localStorage: {
                        removeItem : function(key) {}
                    }
                });
            });
        });

        it('will contain no data', inject(function(repo) {
            // Exercise
            var measurements = repo.measurements;

            // Verify
            expect(measurements).toBeEmpty();
        }));

        it('will store data', inject(function(repo) {
            // Exercise
            repo.add(42);
            // Verify
            var measurements = repo.measurements;
            expect(measurements).toEqual([
                {time: 1, value: 42}
            ]);
        }));

        it('will set local storage when data is added', inject(function(repo, $window) {
            // Exercise
            repo.add(42);
            // Verify
            var storedValue = $window.localStorage.measurements;
            expect(storedValue).toEqual('[{"time":1,"value":42}]');
        }));
    });

    describe('a populated repository', function() {

        beforeEach(function () {
            module(function($provide) {
                $provide.value('$window', {
                    localStorage: {
                        measurements : [
                            { time: 1, value: 13 },
                            { time: 2, value: 42 }
                        ],
                        removeItem : function(key) {}
                    }
                });
            });
        });

        it('will contain data', inject(function(repo) {
             // Exercise
            var measurements = repo.measurements;
            // Verify
            expect(measurements).toEqual([
                { time: 1, value: 13 },
                { time: 2, value: 42 }
            ]);
        }));

        it('will store data', inject(function(repo) {
            // Exercise
            repo.add(53);
            // Verify
            var measurements = repo.measurements;
            expect(measurements).toEqual([
                { time: 1, value: 13 },
                { time: 2, value: 42 },
                { time: 3, value: 53 }
            ]);
        }));

        it('will update local storage when data is added', inject(function(repo, $window) {
            // Exercise
            repo.add(53);
            // Verify
            var storedValue = $window.localStorage.measurements;
            expect(storedValue).toEqual('[{"time":1,"value":13},{"time":2,"value":42},{"time":3,"value":53}]');
        }));

        it('will remove data', inject(function(repo) {
            // Exercise
            repo.remove(0);
            // Verify
            var measurements = repo.measurements;
            expect(measurements).toEqual([
                { time: 2, value: 42 }
            ]);
        }));

        it('will update local storage when data is removed', inject(function(repo, $window) {
            // Exercise
            repo.remove(0);
            // Verify
            var storedValue = $window.localStorage.measurements;
            expect(storedValue).toEqual('[{"time":2,"value":42}]');
        }));

        it('will remove all data', inject(function(repo) {
            // Exercise
            repo.remove(1);
            repo.remove(0);
            // Verify
            var measurements = repo.measurements;
            expect(measurements).toEqual([]);
        }));

        it('will clear local storage when all data is removed', inject(function(repo, $window) {
            // Set up
            spyOn($window.localStorage, 'removeItem');
            // Exercise
            repo.remove(1);
            repo.remove(0);
            // Verify
            expect($window.localStorage.removeItem).toHaveBeenCalledWith('measurements');
        }));
    });
});
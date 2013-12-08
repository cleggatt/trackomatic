'use strict';

describe('a measurement repository', function() {

    beforeEach(module('trackomatic.services'));

    describe('loading a populated repository', function () {

        beforeEach(function () {
            module(function ($provide) {
                $provide.value('clcStorage', jasmine.createSpyObj('clcStorage', ['getItem']));
            });
        });

        it('will be defined', inject(function(repo) {
            expect(repo).toBeDefined();
        }));

        it('will initially be empty', inject(function (repo) {
            // Exercise
            var measurements = repo.measurements;
            // Verify
            expect(measurements).toBeEmpty();
        }));

        it('will load data using the correct key', inject(['repo', 'clcStorage', function (repo, storage) {
            expect(storage.getItem.mostRecentCall.args[0]).toEqual('measurements');
        }]));

        it('will load data asynchronously', inject(['repo', 'clcStorage', function (repo, storage) {
            // Exercise
            storage.getItem.mostRecentCall.args[1]("[{\"time\":1,\"value\":13},{\"time\":2,\"value\":42}]");
            // Verify
            var measurements = repo.measurements;
            expect(measurements).toEqual([
                { time: 1, value: 13 },
                { time: 2, value: 42 }
            ]);
        }]));

        it('will load maintain the same array instance', inject(['repo', 'clcStorage', function (repo, storage) {
            // Set up
            var measurements = repo.measurements;
            // Exercise
            storage.getItem.mostRecentCall.args[1]("[{\"time\":1,\"value\":13}]");
            // Verify
            expect(measurements).toEqual([
                { time: 1, value: 13 }
            ]);
        }]));
    });

    // TODO Can we fix the reporting for nested describes?
    describe('an empty repository', function() {

        beforeEach(function () {
            module(function($provide) {
                $provide.value('clcStorage', {
                    getItem : function(key, callback) {
                        callback(null);
                    },
                    setItem : function(key, data) {}
                });
            });
        });

        it('will contain no data', inject(['repo', function(repo) {
            // Exercise
            var measurements = repo.measurements;

            // Verify
            expect(measurements).toBeEmpty();
        }]));

        it('will store data', inject(['repo', function(repo) {
            // Exercise
            repo.add(42);
            // Verify
            var measurements = repo.measurements;
            expect(measurements).toEqual([
                {time: 1, value: 42}
            ]);
        }]));

        it('will set local storage when data is added', inject(['repo', 'clcStorage', function(repo, storage) {
            // Set up
            spyOn(storage, 'setItem');
            // Exercise
            repo.add(42);
            // Verify
            expect(storage.setItem).toHaveBeenCalledWith('measurements', '[{"time":1,"value":42}]');
        }]));
    });

    describe('a populated repository', function() {

        beforeEach(function () {
            module(function($provide) {
                $provide.value('clcStorage', {
                    getItem : function(key, callback) {
                        callback([
                            { time: 1, value: 13 },
                            { time: 2, value: 42 }
                        ]);
                    },
                    setItem : function(key, data) {},
                    removeItem : function(key) {}
                });
            });
        });

        it('will store data', inject(['repo', function(repo) {
            // Exercise
            repo.add(53);
            // Verify
            var measurements = repo.measurements;
            expect(measurements).toEqual([
                { time: 1, value: 13 },
                { time: 2, value: 42 },
                { time: 3, value: 53 }
            ]);
        }]));

        it('will update local storage when data is added', inject(['repo', 'clcStorage', function(repo, storage) {
            // Set up
            spyOn(storage, 'setItem');
            // Exercise
            repo.add(53);
            // Verify
            expect(storage.setItem).toHaveBeenCalledWith('measurements', '[{"time":1,"value":13},{"time":2,"value":42},{"time":3,"value":53}]');
        }]));

        it('will remove data', inject(['repo', function(repo) {
            // Exercise
            repo.remove(0);
            // Verify
            var measurements = repo.measurements;
            expect(measurements).toEqual([
                { time: 2, value: 42 }
            ]);
        }]));

        it('will update local storage when data is removed', inject(['repo', 'clcStorage', function(repo, storage) {
            // Set up
            spyOn(storage, 'setItem');
            // Exercise
            repo.remove(0);
            // Verify
            expect(storage.setItem).toHaveBeenCalledWith('measurements', '[{"time":2,"value":42}]');
        }]));

        it('will remove all data', inject(['repo', function(repo) {
            // Exercise
            repo.remove(1);
            repo.remove(0);
            // Verify
            var measurements = repo.measurements;
            expect(measurements).toEqual([]);
        }]));

        it('will clear local storage when all data is removed', inject(['repo', 'clcStorage', function(repo, storage) {
            // Set up
            spyOn(storage, 'removeItem');
            // Exercise
            repo.remove(1);
            repo.remove(0);
            // Verify
            expect(storage.removeItem).toHaveBeenCalledWith('measurements');
        }]));
    });
});
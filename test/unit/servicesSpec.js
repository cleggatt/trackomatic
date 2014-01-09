'use strict';

describe('a measurement repository', function() {

    beforeEach(module('trackomatic.services'));

    describe('loading a populated repository', function () {

        beforeEach(function () {
            module(function ($provide) {
                $provide.value('clcStorage', jasmine.createSpyObj('clcStorage', ['getItem' ]));
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

        it('will initially have no ideal bounds defined', inject(function(repo) {
            // Exercise
            var ideal = repo.ideal;
            // Verify
            expect(ideal).toEqual({});
        }));

        // We inject repo so that it's initialised
        it('will load data using the correct key', inject(['repo', 'clcStorage', function (repo, storage) {
            // TODO Fix this fragile test - it relies on the correct function call order
            expect(storage.getItem.calls[0].args[0]).toEqual('measurements');
        }]));

        it('will load data asynchronously', inject(['repo', 'clcStorage', function (repo, storage) {
            // Exercise
            // TODO Fix this fragile test - it relies on the correct function call order
            storage.getItem.calls[0].args[1]("[{\"time\":1,\"value\":13},{\"time\":2,\"value\":42}]");
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
            // TODO Fix this fragile test - it relies on the correct function call order
            storage.getItem.calls[0].args[1]("[{\"time\":1,\"value\":13}]");
            // Verify
            expect(measurements).toEqual([
                { time: 1, value: 13 }
            ]);
        }]));

        // We inject repo so that it's initialised
        it('will load ideals using the correct key', inject(['repo', 'clcStorage', function (repo, storage) {
            // TODO Fix this fragile test - it relies on the correct function call order
            expect(storage.getItem.calls[1].args[0]).toEqual('min');
            expect(storage.getItem.calls[2].args[0]).toEqual('max');
        }]));

        it('will load ideal asynchronously', inject(['repo', 'clcStorage', function (repo, storage) {
            // Exercise
            // TODO Fix this fragile test - it relies on the correct function call order
            storage.getItem.calls[1].args[1](13);
            storage.getItem.calls[2].args[1](42);
            // Verify
            var measurements = repo.measurements;
            expect(repo.ideal).toEqual({
                'minimum' : 13,
                'maximum' : 42
            });
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

        it('will have no ideal bounds defined',  inject(['repo', function(repo) {
            // Exercise
            var ideal = repo.ideal;
            // Verify
            expect(ideal).toEqual({});
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

        it('will set minimum ideal bound',  inject(['repo', function(repo) {
            // Exercise
            repo.ideal.minimum = 23;
            // Verify
            expect(repo.ideal).toEqual({ minimum : 23 });
        }]));

        it('will set local storage when minimum ideal bound is set', inject(['repo', 'clcStorage', function (repo, storage) {
            // Set up
            spyOn(storage, 'setItem');
            // Exercise
            repo.ideal.minimum = 23;
            // Verify
            expect(storage.setItem).toHaveBeenCalledWith('min', 23);
        }]));

        it('will set maximum ideal bound',  inject(['repo', function(repo) {
            // Exercise
            repo.ideal.maximum = 52;
            // Verify
            expect(repo.ideal).toEqual({ maximum : 52 });
        }]));

        it('will set local storage when maximum ideal bound is set', inject(['repo', 'clcStorage', function (repo, storage) {
            // Set up
            spyOn(storage, 'setItem');
            // Exercise
            repo.ideal.maximum = 52;
            // Verify
            expect(storage.setItem).toHaveBeenCalledWith('max', 52);
        }]));

        it('will set local storage when ideal bounds are updated', inject(['repo', 'clcStorage', function (repo, storage) {
            // Set up
            spyOn(storage, 'setItem');
            // Exercise
            repo.ideal = { minimum : 23, maximum: 52 };
            // Verify
            expect(storage.setItem).toHaveBeenCalledWith('min', 23);
            expect(storage.setItem).toHaveBeenCalledWith('max', 52);
        }]));

        it('will not allow ideal property to be deleted',inject(['repo', function (repo) {
            expect(function() {
                delete repo.ideal;
            }).toThrow();
        }]));

        it('will not allow ideal minimum property to be deleted',inject(['repo', function (repo) {
            expect(function() {
                delete repo.ideal.minimum;
            }).toThrow();
        }]));

        it('will not allow ideal maximum property to be deleted',inject(['repo', function (repo) {
            expect(function() {
                delete repo.ideal.maximum;
            }).toThrow();
        }]));
    });

    describe('a populated repository', function() {

        beforeEach(function () {
            module(function($provide) {

                var data = {
                    'measurements' : "[{\"time\":1,\"value\":13},{\"time\":2,\"value\":42}]",
                    'min' : '13',
                    'max' :'42'
                };

                // TODO Use a Jasmine spy object to avoid the need call "spyOn"
                $provide.value('clcStorage', {
                    getItem : function(key, callback) {
                        callback(data[key]);
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

        it('will update minimum ideal bound, leaving maximum bound as it', inject(['repo', function(repo) {
            // Exercise
            repo.ideal.minimum = 23;
            // Verify
            expect(repo.ideal).toEqual({ minimum : 23, maximum : 42});
        }]));

        it('will clear minimum ideal bound when it is set to undefined, leaving maximum bound as it', inject(function(repo) {
            // Exercise
            repo.ideal.minimum = undefined;
            // Verify
            expect(repo.ideal).toEqual({ maximum : 42});
        }));

        _.each([ undefined, null], function(value) {
            it('will update local storage when minimum ideal bound is set to ' + value, inject(['repo', 'clcStorage', function(repo, storage) {
                // Set up
                spyOn(storage, 'removeItem');
                // Exercise
                repo.ideal.minimum = value;
                // Verify
                expect(storage.removeItem).toHaveBeenCalledWith('min');
            }]));
        });

        it('will update maximum ideal bound, leaving minimum bound as it', inject(function(repo) {
            // Exercise
            repo.ideal.maximum = 62;
            // Verify
            expect(repo.ideal).toEqual({ minimum : 13, maximum: 62 });
        }));

        it('will clear maximum ideal bound when it is set to undefined, leaving minimum bound as it', inject(function(repo) {
            // Exercise
            repo.ideal.maximum = undefined;
            // Verify
            expect(repo.ideal).toEqual({ minimum : 13 });
        }));

        _.each([ undefined, null], function(value) {
            it('will update local storage when maximum ideal bound is set to ' + value, inject(['repo', 'clcStorage', function(repo, storage) {
                // Set up
                spyOn(storage, 'removeItem');
                // Exercise
                repo.ideal.maximum = value;
                // Verify
                expect(storage.removeItem).toHaveBeenCalledWith('max');
            }]));
        });

        it('will update ideal bounds', inject(['repo', function(repo) {
            // Exercise
            repo.ideal = { minimum : 9, maximum: 55 };
            // Verify
            expect(repo.ideal).toEqual({ minimum : 9, maximum: 55 });
        }]));

        it('will update local storage when ideal bounds are updated', inject(['repo', 'clcStorage', function(repo, storage) {
            // Set up
            spyOn(storage, 'setItem');
            // Exercise
            repo.ideal = { minimum : 9, maximum: 55 };
            // Verify
            expect(storage.setItem).toHaveBeenCalledWith('min', 9);
            expect(storage.setItem).toHaveBeenCalledWith('max', 55);
        }]));
    });

    describe('adding data to a repository', function () {

        beforeEach(function () {
            module(function($provide) {
                // TODO Use a Jasmine spy object to avoid the need call "spyOn"
                // TODO Move this to a single factory method for use by all tests
                $provide.value('clcStorage', {
                    getItem : function(key, callback) {},
                    setItem : function(key, data) {},
                    removeItem : function(key) {}
                });
            });
        });

        afterEach(inject(['repo', function(repo) {
            repo.remove(0);
        }]));

        _.each([ undefined, null, ''], function(value) {
            it('will store empty values as null', inject(['repo', function(repo) {
                // Exercise
                repo.add(value);
                // Verify
                var measurements = repo.measurements;
                expect(measurements).toEqual([
                    {time: 1, value: null}
                ]);
            }]));

            it('will set local storage when data is added', inject(['repo', 'clcStorage', function(repo, storage) {
                // Set up
                spyOn(storage, 'setItem');
                // Exercise
                repo.add(value);
                // Verify
                expect(storage.setItem).toHaveBeenCalledWith('measurements', '[{"time":1,"value":null}]');
            }]));
        });

        _.each([ { value: 42, expected: 42 },
                 { value: '42', expected: 42 },
                 { value: ' 42 ', expected: 42 },
                 { value: '  ', expected: null },
                 { value: '', expected: null },
                 { value: null, expected: null },
                 { value: undefined, expected: null }], function(data) {
            it('will translate values', inject(['repo', function(repo) {
                // Exercise
                repo.add(data.value);
                // Verify
                var measurements = repo.measurements;
                expect(measurements).toEqual([
                    {time: 1, value: data.expected}
                ]);
            }]));

            it('will set local storage when data is added', inject(['repo', 'clcStorage', function(repo, storage) {
                // Set up
                spyOn(storage, 'setItem');
                // Exercise
                repo.add(data.value);
                // Verify
                var valueAsString = String(data.expected);
                expect(storage.setItem).toHaveBeenCalledWith('measurements', '[{"time":1,"value":' + valueAsString + '}]');
            }]));
        });
    });
});
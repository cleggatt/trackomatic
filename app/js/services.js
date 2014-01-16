'use strict';

angular.module('trackomatic.services', ['cleggatt.chromeapputil.storageClient']).
factory('storage', ['$window', function ($window) {
    return $window.localStorage;
}]).
factory('repo', ['clcStorage', function (storage) {

    var repo = {};

    repo.measurements = [];
    // TODO We should enter a loading state and ignore any mods that occur
    storage.getItem('measurements', function (item) {
        if (item) {
            // TODO Store version information for upgrades
            var measurements = angular.fromJson(item);

            repo.measurements.length = 0;
            for (var i = 0; i < measurements.length; i++) {
                repo.measurements.push(measurements[i]);
            }
        }
    });

    repo.add = function(value) {
        // TODO Validate that value is numeric
        var valueToStore = parseFloat(value);
        if (!valueToStore) {
            valueToStore = null;
        }

        var time = this.measurements.length + 1;

        this.measurements[this.measurements.length] = {time: time, value: valueToStore};

        storage.setItem('measurements', angular.toJson(this.measurements));
    }

    repo.remove = function(index) {
        this.measurements.splice(index, 1);

        if (this.measurements.length == 0)  {
            storage.removeItem('measurements');
        }
        else {
            storage.setItem('measurements', angular.toJson(this.measurements));
        }
    }

    var _min;
    var _max;
    var _ideal = {};

    Object.defineProperty(_ideal, "minimum", {
        get: function() {
            return _min;
        },
        set: function(min) {
            _min = min;

            if (_min)  {
                storage.setItem('min', _min);
            }
            else {
                storage.removeItem('min');
            }
        },
        configurable : false,
        enumerable : true
    });
    Object.defineProperty(_ideal, "maximum", {
        get: function() {
            return _max;
        },
        set: function(max) {
            _max = max;
            if (_max)  {
                storage.setItem('max', _max);
            }
            else {
                storage.removeItem('max');
            }
        },
        configurable : false,
        enumerable : true
    });
    Object.defineProperty(repo, "ideal", {
        get: function() {
            return _ideal;
        },
        set: function(ideal) {
            _ideal.minimum = ideal.minimum;
            _ideal.maximum = ideal.maximum;
        },
        configurable : false,
        enumerable : true
    });

    storage.getItem('min', function (item) {
       console.log
       if (item) {
            _min = parseInt(item);
       }
    });
    var _max;
    storage.getItem('max', function (item) {
       if (item) {
            _max = parseInt(item);
       }
    });

    return repo;
}]);
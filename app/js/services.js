'use strict';

angular.module('trackomatic.services', ['cleggatt.chromeapputil.storageClient']).
factory('storage', ['$window', function ($window) {
    return $window.localStorage;
}]).
factory('repo', ['clcStorage', function (storage) {

    var repo = {};
    repo.measurements = [];
    // TODO We should enter a loading state and ignore any mods that occur
    var measurements = storage.getItem('measurements', function (item) {
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
        var time = this.measurements.length + 1;
        this.measurements[this.measurements.length] = {time: time, value: value};

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

    return repo;
}]);
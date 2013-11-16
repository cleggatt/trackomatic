'use strict';

angular.module('trackomatic.services', []).
factory('storage', ['$window', function ($window) {
    return $window.localStorage;
}]).
factory('repo', ['storage', function (storage) {

    // TODO Store version information for upgrades
    var measurements = storage.getItem('measurements');

    var repo = {};
    repo.measurements = measurements ? angular.fromJson(measurements) : [];

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
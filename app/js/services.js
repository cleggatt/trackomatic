'use strict';

angular.module('trackomatic.services', []).
factory('repo', ['$window', function ($window) {

    // TODO Store version information for upgrades
    var measurements = $window.localStorage['measurements'];

    var repo = {};
    repo.measurements = measurements ? angular.fromJson(measurements) : [];

    repo.add = function(value) {
        var time = this.measurements.length + 1;
        this.measurements[this.measurements.length] = {time: time, value: value};

        $window.localStorage['measurements'] = angular.toJson(this.measurements);
    }

    repo.remove = function(index) {
        this.measurements.splice(index, 1);

        if (this.measurements.length == 0)  {
            $window.localStorage.removeItem('measurements');
        }
        else {
            $window.localStorage['measurements'] = angular.toJson(this.measurements);
        }
    }

    return repo;
}]);
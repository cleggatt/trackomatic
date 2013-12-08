'use strict';

angular.module('main', ['cleggatt.chromeapputil.storageServer']).

run(['clcChromeStorageServer', function (storageServer) {
    storageServer.init();
}]);
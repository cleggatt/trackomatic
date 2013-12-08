'use strict';

angular.module('trackomatic', ['cleggatt.chromeapp-util.general', 'googlechart', 'ui.bootstrap', 'trackomatic.controllers']).

config(['clcIsChromeAppProvider', 'googleJsapiUrlProvider', function (isChromeAppProvider, googleJsapiUrlProvider) {
    if (isChromeAppProvider.$get()) {
        googleJsapiUrlProvider.setProtocol('http:');
    }
}]);

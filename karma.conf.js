module.exports = function(config){

    config.set({
        basePath : '',

        frameworks: [ 'jasmine' ],

        files : [
            // Need to load libraries first
            // TODO Fix ordering issue - use reguirejs
            'app/js/lib/angular/angular.js',
            'test/lib/angular-mocks/angular-mocks.js',
            'app/js/lib/**/*.js',
            'app/js/*.js',
            'test/unit/testHelpers.js',
            'test/unit/**/*.js'
        ],

        reporters: ['dots', 'coverage' ],

        preprocessors: {
            // TODO Once we can bring in bootstrap as a lib we can use a wildcard alone
            'app/js/*s.js': ['coverage']
        },

        coverageReporter: {
            type : 'html',
            dir : 'coverage/'
        },

        browsers : ['PhantomJS'],

        captureTimeout: 60000,

        singleRun: true
    })}
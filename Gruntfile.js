module.exports = function(grunt) {

    grunt.initConfig({
        bower: {
            install: {
                options: {
                    targetDir: './app/js/lib'
                }
            }
        },
        clean: {
            testLibs: ['test/lib/**']
        },
        rename: {
            testLibs: {
                src: 'app/js/lib/angular-mocks',
                dest: 'test/lib/angular-mocks'
            }
        },
        connect : {
            server: {
                options : {
                    port: 8888,
                    base: './app',
                    keepalive: true
                }
            }
        },
        karma: {
            unit: {
                configFile: 'karma.conf.js'
            }
        },
        coveralls: {
            options: {
                coverage_dir: 'coverage'
            }
        }
    });

    grunt.loadNpmTasks('grunt-bower-task');
    grunt.loadNpmTasks('grunt-contrib-clean');
    grunt.loadNpmTasks('grunt-rename');
    grunt.loadNpmTasks('grunt-contrib-connect');
    grunt.loadNpmTasks('grunt-karma');
    grunt.loadNpmTasks('grunt-karma-coveralls');

    // TODO Update bower task to treat dev dependencies differently
    grunt.registerTask('bower-custom', ['bower', 'clean:testLibs', 'rename:testLibs']);
    grunt.registerTask('travis', ['bower-custom', 'karma', 'coveralls']);
    grunt.registerTask('default', ['bower-custom', 'karma']);
};
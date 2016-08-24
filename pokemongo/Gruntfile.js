'use strict';

module.exports = function(grunt) {

	grunt.initConfig({
		less: {
			compileCore: {
				options: {
					strictMath: false,
					compress: true
				},
				files: [
					{
						expand: true,
			cwd: "./web/default/less",
			src: [ "**/*.less" ],
			dest: "./web/static/css",
			ext: ".css"
					}
				]
			}
		},

		uglify: {
				static: {
					files: [
					{
						expand: true,
						cwd: './web/static/js',
						src: ['**/*.js', '!vendor/**'],
						dest: './web/static/js',
						ext: '.min.js'
					}
				]
			}
		}
	});
	
	grunt.loadNpmTasks('grunt-contrib-less');
	grunt.loadNpmTasks('grunt-contrib-uglify');
	
	grunt.registerTask('default', ['less', 'uglify']);
};
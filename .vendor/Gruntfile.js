module.exports = function(grunt) {

	// Project configuration.
	grunt.initConfig({
		pkg: grunt.file.readJSON('package.json'),
		exec: {
			build_svg_edit: {
				command: 'cd svg-edit; make; cp --recursive editor ../../public/svg-edit',
				stdout: false,
				stderr: true
			},
			build_webxray: {
				command: 'cd webxray; python go.py compile; cp --recursive static-files ../../public/webxray',
				stdout: false,
				stderr: true
			},
			remove_logs: {
				command: 'rm -f *.log',
				stdout: false,
				stderr: false
			},
			list_files: {
				cmd: 'ls -l **'
			},
			echo_grunt_version: {
				cmd: function() { return 'echo ' + this.version; }
			},
			echo_name: {
				cmd: function(firstName, lastName) {
					var formattedName = [
						lastName.toUpperCase(),
						firstName.toUpperCase()
					].join(', ');

					return 'echo ' + formattedName;
				}
			}
		}
	});

	// Load the plugin that provides the "uglify" task.
	grunt.loadNpmTasks('grunt-exec');

	// Default task(s).
	grunt.registerTask('default', ['exec:build_svg_edit']);

}

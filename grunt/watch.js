module.exports = {
	express: {
		files: [
			'keystone.js',
			'public/js/lib/**/*.{js,json}',
		],
		tasks: ['concurrent:dev'],
	},
	less: {
		files: ['public/styles/**/*.less'],
		tasks: ['less'],
	},
	livereload: {
		files: [
			'public/styles/**/*.css',
		],
		options: {
			livereload: true,
		},
	},
};

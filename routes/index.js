/**
 * This file is where you define your application routes and controllers.
 *
 * Start by including the middleware you want to run for every request;
 * you can attach middleware to the pre('routes') and pre('render') events.
 *
 * For simplicity, the default setup for route controllers is for each to be
 * in its own file, and we import all the files in the /routes/views directory.
 *
 * Each of these files is a route controller, and is responsible for all the
 * processing that needs to happen for the route (e.g. loading data, handling
 * form submissions, rendering the view template, etc).
 *
 * Bind each route pattern your application should respond to in the function
 * that is exported from this module, following the examples below.
 *
 * See the Express application routing documentation for more information:
 * http://expressjs.com/api.html#app.VERB
 */

var keystone = require('keystone');
var middleware = require('./middleware');
var importRoutes = keystone.importer(__dirname);

// Common Middleware
keystone.pre('routes', middleware.initLocals);
keystone.pre('routes', middleware.attachRedis);
keystone.pre('routes', middleware.checkUserAuthentication);
keystone.pre('render', middleware.flashMessages);
keystone.pre('routes', middleware.addMoment);


// Import Route Controllers
var routes = {
	views: importRoutes('./views'),
	apis: importRoutes('./apis'),
	oneTimeJobs: importRoutes('./oneTimeJobs')
};


// Setup Route Bindings
exports = module.exports = function (app) {
	// Views
	app.get('/', routes.views.index);
	app.get('/languages', routes.views.languages);
	app.get('/:language/lessonlist', routes.views.lessonList);
	app.get('/login', routes.views.UserLogin.login);
	app.get('/signup', routes.views.UserLogin.signup);
	app.get('/logout', routes.apis.UserLogin.logout);
	// NOTE: To protect a route so that only admins can see it, use the requireUser middleware:
	// app.get('/protected', middleware.requireUser, routes.views.protected);
	app.post('/login', routes.apis.UserLogin.login);

	app.post('/signup', routes.apis.UserLogin.signup);

	//games
	app.get('/play/:language/:lessonID/:gameID', routes.views.playGame);

	// tutorials
	app.get('/study/:language/:lessonID', routes.views.studyTutorial);

	//compiler
	app.post('/compiler', routes.apis.compiler);
	//"/play/python/basicsyntax/game1"
	//demo game
	app.get('/demogame', routes.views.demo.demogame);


	// Get search result
	app.get('/search', routes.views.search)

	// Get user results
	app.post('/get_user_result', routes.apis.getUserResult);
	app.post('/checkFirstEnteringGame', routes.apis.checkFirstEnteringGame);
	
	//One-time jobs
	app.get('/onetimejobs/createmap', routes.oneTimeJobs.createMapTemplate.createMap);
	app.get('/onetimejobs/createtutorial', routes.oneTimeJobs.createLessonTutorials.createLessonTutorials);
	app.get('/userAnalytic', routes.views.userAnalytic);
	
};

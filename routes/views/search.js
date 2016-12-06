var keystone = require('keystone');

exports = module.exports = function (req, res) {
    var availableSearchData = {
        'python': [['/python/lessonList', 'List of lessons for learning Python']],
        'basicsyntax': [
            ['/study/python/basicsyntax/', 'Tutorial about the basic syntax of Python'],
            ['/play/python/basicsyntax/lgame', 'Do exercise that lets you practice the basic syntax of Python']],
        'variables': [
            ['/study/python/variables/', 'Tutorial about variables in Python'],
            ['/play/python/variables/lgamevariable', 'Do exercise that lets you learn about variables in Python']],
        'conditionalstatements': [
            ['/study/python/condition/', 'Tutorial about conditional statements in Python'],
            ['/play/python/condition/cgame', 'Do exercise that lets you learn about conditional statements in Python']],
        'loops': [
            ['/study/python/whileloop/', 'Tutorial about loops in Python'],
            ['/play/python/whileloop/findtreasure', 'Do exercise that lets you learn about loops in Python']],
    }
    var view = new keystone.View(req, res);
    var locals = res.locals;
    if (!locals.authenticated) {
		res.redirect('/login');
		return;
	}
    var userQuery = req.query.q;
    userQuery = userQuery.toLowerCase();
    var results = [];
    if (userQuery.indexOf('python') > -1) {
        results.push(availableSearchData['python'][0])
    }
    if (userQuery.indexOf('basic') > -1 || userQuery.indexOf('syntax') > -1) {
        results.push(availableSearchData['basicsyntax'][0])
        results.push(availableSearchData['basicsyntax'][1])
    }
    if (userQuery.indexOf('variable') > -1) {
        results.push(availableSearchData['variables'][0])
        results.push(availableSearchData['variables'][1])
    }
    if (userQuery.indexOf('loop') > -1 || userQuery.indexOf('for') > -1 || userQuery.indexOf('while') > -1) {
        results.push(availableSearchData['loops'][0])
        results.push(availableSearchData['loops'][1])
    }
    if (userQuery.indexOf('condition') > -1 || userQuery.indexOf('if') > -1 || userQuery.indexOf('else') > -1) {
        results.push(availableSearchData['conditionalstatements'][0])
        results.push(availableSearchData['conditionalstatements'][1])
    }
    if (userQuery.indexOf('exercise') > -1 || userQuery.indexOf('practice') > -1) {
        results.push(availableSearchData['basicsyntax'][1])
        results.push(availableSearchData['conditionalstatements'][1])
        results.push(availableSearchData['loops'][1])
        results.push(availableSearchData['variables'][1])
    }
    if (userQuery.indexOf('tutorial') > -1 || userQuery.indexOf('study') > -1 || userQuery.indexOf('learn') > -1) {
        results.push(availableSearchData['basicsyntax'][0])
        results.push(availableSearchData['conditionalstatements'][0])
        results.push(availableSearchData['loops'][0])
        results.push(availableSearchData['variables'][0])
    }
    locals.searchResults = results;
    locals.userQuery = req.query.q;
    view.render('showsearchresults');
}

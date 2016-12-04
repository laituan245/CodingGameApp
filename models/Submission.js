var keystone = require('keystone');
var Types = keystone.Field.Types;

/**
 * Submission Model
 * ==========
 */
var Submission = new keystone.List('Submission');

Submission.add({
	userID: {type: Types.Text},
	createdAt: { type: Types.Datetime, default: Date.now },
	isSuccess: {type: Types.Boolean},
	errorType: {type: Types.Text},
	///
	mapID: { type: Types.Text},
	language: {type: Types.Text},
	code: {type: Types.Text},
	timeToFinish: {type: Types.Number}, //second
	rank: {type: Types.Number} 
});


/**
 * Registration
 */
Submission.defaultColumns = 'userID, createdAt, isSuccess, mapID, timeToFinish';
Submission.register();

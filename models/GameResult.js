var keystone = require('keystone');
var Types = keystone.Field.Types;

/**
 * GameResult Model
 * ==========
 */
var GameResult = new keystone.List('GameResult');

GameResult.add({
	userID: {type: Types.Text},
	mapID: {type: Types.Text},
	userNickname: {type: Types.Text},
	createdAt: { type: Types.Datetime, default: Date.now },
	isCompleted: {type: Types.Boolean, default: false}, //
	language: {type: Types.Text},
	timeToFinish: {type: Types.Number}, //second
	latestSubmissionID: {type: Types.Text},
	bestSubmissionID: {type: Types.Text}, 
});

GameResult.schema.add({
    createdTime : { type : Date, default: Date.now }
});


/**
 * Registration
 */
GameResult.defaultColumns = 'userID, mapID, createdAt, isCompleted, timeToFinish';
GameResult.register();

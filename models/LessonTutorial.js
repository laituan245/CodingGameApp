var keystone = require('keystone');
var Types = keystone.Field.Types;

/**
 * LessonTutorial Model
 * ==========
 */
var LessonTutorial = new keystone.List('LessonTutorial');

LessonTutorial.add({
	tutorialID: { type: Types.Text, initial:true, required: true, index: true, unique: true},
	title: { type: Types.Text, initial:true, required: true, index: true },
});

/**
 * Registration
 */
LessonTutorial.defaultColumns = 'id, title';
LessonTutorial.register();

var keystone = require('keystone');
var Types = keystone.Field.Types;

/**
 * User Model
 * ==========
 */
var User = new keystone.List('User');

User.add({
	name: { type: Types.Name, required: true, index: true },
	nickname: {type: Types.Text},
	email: {type: Types.Email},
	//useremail: { type: Types.Text },
	password: { type: Types.Password, initial: true, required: true },
	timeToFinish : {type: Types.Text}

}, 'Permissions', {
	isAdmin: { type: Boolean, label: 'Can access Keystone', index: true },
});

// Provide access to Keystone
User.schema.virtual('canAccessKeystone').get(function () {
	return this.isAdmin;
});


/**
 * Registration
 */
User.defaultColumns = 'name, nickname, useremail, isAdmin';
User.register();

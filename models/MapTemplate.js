var keystone = require('keystone');
var Types = keystone.Field.Types;

/**
 * MapTemplate Model
 * ==========
 */
var MapTemplate = new keystone.List('MapTemplate');

MapTemplate.add({
	mapID: { type: Types.Text, initial:true,required: true, index: true, unique: true},
	name: { type: Types.Text, required: true, index: true },
	map_height: { type: Types.Number, initial:true, required: true, index: true },
	map_width: { type: Types.Number, initial:true, required: true },
	instruction: {type: Types.Text}
});

MapTemplate.schema.add({
    startPoint: { type: Array },
    endPoint: { type: Array },
    map: {type: Array}
});

/**
 * Registration
 */
MapTemplate.defaultColumns = 'name, map_width, map_height';
MapTemplate.register();

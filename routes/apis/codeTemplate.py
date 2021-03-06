import math
import sys
import json

map_file_path = sys.argv[1]
# map_file_path = "/home/vucuong12/Desktop/workspace/codinggameapp/routes/apis/tmp/mapbasicsyntax_lgame.txt"
map = ''
f = open(map_file_path, 'r')
for line in f:
	map = map + line
map = json.loads(map)

map_height = int(map['map_height'])
map_width = int(map['map_width']);
cur_x, cur_y = map['startPoint']
cur_x = int(cur_x)
cur_y = int(cur_y)
end_x, end_y = map['endPoint']
end_x = int(end_x)
end_y = int(end_y)
instruction_arr = []
#for game 3: lgamevariables
correctWordSum = ""
correctValueSum = 0

class SemanticError(Exception):
	pass


def out_of_board(x, y):
	global map_height
	global map_width
	if (x < 0 or y < 0 or x >= map_height or y >= map_width):
		return True
	return False

def is_on_obstacle(x, y):
	global map
	my_map = map['map']
	try:
		if 'obstacle' in my_map[x][y]['roles']:
			return True
	except:
		pass
	return False

def is_on_fake_endPoint(x, y):
	global map
	my_map = map['map']
	try:
		if 'fakeEndPoint' in my_map[x][y]['roles']:
			return True
	except:
		pass
	return False

def raiseExeption(x, y):
	if out_of_board(x,y):
		throw_out_of_board_exception()
	if is_on_obstacle(x,y):
		throw_running_into_obstacle_exception()
	if is_on_fake_endPoint(x,y):
		throw_running_into_fake_endpoint_exception()


def is_valid(x, y):
	return (not out_of_board(x,y)) and (not is_on_obstacle(x, y) and (not is_on_fake_endPoint(x, y)))

def throw_out_of_board_exception():
	raise SemanticError("Your robot is running out of the board")

def throw_running_into_obstacle_exception():
	raise SemanticError("Your robot is running into an obstacle");

def throw_running_into_fake_endpoint_exception():
	raise SemanticError("Sorry! Your robot is trapped by the fake endpoint! Game over!");

def goRight():
	global cur_x
	global cur_y
	instruction_arr.append({'doHere': 'none', 'doNext': 'right', 'pos': [cur_x, cur_y]})
	if is_valid(cur_x, cur_y + 1):
		cur_y += 1
	else:
		raiseExeption(cur_x, cur_y + 1)
	if map['mapID'] == "whileloop_findtreasure":
		instruction_arr[-1]['doHere'] = {
			'action': "showLetter",
			'data': None
		}
	if map['mapID'] == "variables_lgamevariable":
		instruction_arr[-1]['doHere'] = {
			'action': "showNumber",
			'data': None
		}

def goLeft():
	global cur_x
	global cur_y
	instruction_arr.append({'doHere': 'none', 'doNext': 'left', 'pos': [cur_x, cur_y]})
	if is_valid(cur_x, cur_y - 1):
		cur_y -= 1
	else:
		raiseExeption(cur_x, cur_y - 1)
	if map['mapID'] == "whileloop_findtreasure":
		instruction_arr[-1]['doHere'] = {
			'action': "showLetter",
			'data': None
		}
	if map['mapID'] == "variables_lgamevariable":
		instruction_arr[-1]['doHere'] = {
			'action': "showNumber",
			'data': None
		}

def onTreasure():
	global cur_x
	global cur_y
	global end_x
	global end_y
	return (cur_x == end_x and cur_y == end_y)

def readLetter():
	global cur_x
	global cur_y
	global map
	my_map = map['map']
	instruction_arr.append({
		'doHere': {
			'action': "showLetterContent",
			'data': {
				'message': my_map[cur_x][cur_y]['message']
			}
		},
		'doNext': 'none', })
	return my_map[cur_x][cur_y]['direction']

def readValue():
	global cur_x
	global cur_y
	global map
	global correctValueSum
	my_map = map['map']
	correctValueSum += int(my_map[cur_x][cur_y]['value'])
	return int(my_map[cur_x][cur_y]['value'])

def readWord():
	global cur_x
	global cur_y
	global map
	global correctWordSum
	my_map = map['map']
	correctWordSum += my_map[cur_x][cur_y]['word']
	return my_map[cur_x][cur_y]['word']

variable_game = False;

def announceSums(valueSum, wordSum):
	global map
	global variable_game
	correctWordSum = (map['correctWordSum'])
	correctValueSum = int(map['correctValueSum'])
	instruction_arr.append({
		'doHere': {
			'action': "announceSums",
			'data': {
				'valueSum': valueSum,
				'wordSum': wordSum,
				'correctWordSum': correctWordSum,
				'correctValueSum': correctValueSum
			}
		},
		'doNext': 'none', })
	if (correctValueSum != valueSum or correctWordSum != wordSum):
		raise SemanticError('Your calculated results are not correct')
	variable_game =	True


def goDown():
	global cur_x
	global cur_y
	instruction_arr.append({'doHere': 'none', 'doNext': 'down', 'pos': [cur_x, cur_y]})
	if is_valid(cur_x+1, cur_y):
		cur_x += 1
	else:
		raiseExeption(cur_x + 1, cur_y)
	if map['mapID'] == "whileloop_findtreasure":
		instruction_arr[-1]['doHere'] = {
			'action': "showLetter",
			'data': None
		}
	if map['mapID'] == "variables_lgamevariable":
		instruction_arr[-1]['doHere'] = {
			'action': "showNumber",
			'data': None
		}

def goUp():
	global cur_x
	global cur_y
	instruction_arr.append({'doHere': 'none', 'doNext': 'up', 'pos': [cur_x, cur_y]})
	if is_valid(cur_x-1, cur_y):
		cur_x -= 1
	else:
		raiseExeption(cur_x-1, cur_y)
	if map['mapID'] == "whileloop_findtreasure":
		instruction_arr[-1]['doHere'] = {
			'action': "showLetter",
			'data': None
		}
	if map['mapID'] == "variables_lgamevariable":
		instruction_arr[-1]['doHere'] = {
			'action': "showNumber",
			'data': None
		}

def toJSONString(error, my_data):
	complete = False
	if error == "none":
		if map['mapID'] == "variables_lgamevariable" and not variable_game:
			error = "SemanticError: Fail to complete the task (you forget to call announceSums)"
			return json.dumps({"error": error, "data": my_data, "complete": complete}, ensure_ascii=False)
		do_here = 'none'
		if cur_x == end_x and cur_y == end_y:
			complete = True


			do_here =  {"action": 'showVictory', "data": []}
			my_data.append({'doHere': do_here, 'doNext': 'none', 'pos': [cur_x, cur_y]})
		else:
			complete = False
			error = "SemanticError: Fail to complete the task"
	return json.dumps({"error": error, "data": my_data, "complete": complete}, ensure_ascii=False)

errorMessage = "none"

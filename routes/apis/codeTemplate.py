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

class OutOfBoardException(Exception):
	pass

class RunningIntoObstacleException(Exception):
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

def raiseExeption(x, y):
	if out_of_board(x,y):
		throw_out_of_board_exception()
	if is_on_obstacle(x,y):
		throw_running_into_obstacle_exception()


def is_valid(x, y):
	return (not out_of_board(x,y)) and (not is_on_obstacle(x, y))

def throw_out_of_board_exception():
	raise OutOfBoardException("Your robot is running out of the board")

def throw_running_into_obstacle_exception():
	raise RunningIntoObstacleException("Your robot is running into an obstacle");

def goRight():
	global cur_x
	global cur_y
	instruction_arr.append({'doHere': 'none', 'doNext': 'right', 'pos': [cur_x, cur_y]})
	if is_valid(cur_x, cur_y + 1):
		cur_y += 1
	else:
		raiseExeption(cur_x, cur_y + 1)

def goLeft():
	global cur_x
	global cur_y
	instruction_arr.append({'doHere': 'none', 'doNext': 'left', })
	if is_valid(cur_x, cur_y - 1):
		cur_y -= 1
	else:
		raiseExeption(cur_x, cur_y - 1)

def goDown():
	global cur_x
	global cur_y
	instruction_arr.append({'doHere': 'none', 'doNext': 'down'})
	if is_valid(cur_x+1, cur_y):
		cur_x += 1
	else:
		raiseExeption(cur_x + 1, cur_y)

def goUp():
	global cur_x
	global cur_y
	instruction_arr.append({'doHere': 'none', 'doNext': 'up'})
	if is_valid(cur_x-1, cur_y):
		cur_x -= 1
	else:
		raiseExeption(cur_x-1, cur_y)


def toJSONString(error, my_data):
	if error == "none":
		do_here = 'none'
		if cur_x == end_x and cur_y == end_y:
			do_here =  {"action": 'showVictory', "data": []}
		my_data.append({'doHere': do_here, 'doNext': 'none', 'pos': [cur_x, cur_y]})
	return json.dumps({"error": error, "data": my_data}, ensure_ascii=False)

errorMessage = "none"

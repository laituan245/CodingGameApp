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

cur_x, cur_y = map['startPoint']
cur_x = int(cur_x)
cur_y = int(cur_y)
instruction_arr = []

def goRight():
	global cur_x
	global cur_y
	cur_y += 1
	instruction_arr.append({'doHere': 'Nothing', 'doNext': 'right'})

def goLeft():
	global cur_x
	global cur_y
	cur_y -= 1
	instruction_arr.append({'doHere': 'Nothing', 'doNext': 'left'})

def goDown():
	global cur_x
	global cur_y
	cur_x += 1
	instruction_arr.append({'doHere': 'Nothing', 'doNext': 'down'})

def goUp():
	global cur_x
	global cur_y
	cur_x -= 1
	instruction_arr.append({'doHere': 'Nothing', 'doNext': 'up'})

def toJSONString(my_data):
	return json.dumps({"data": my_data}, ensure_ascii=False)

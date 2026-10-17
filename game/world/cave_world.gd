extends Node2D

const DoorScript := preload("res://world/cave_door.gd")
const WORLD_SIZE := Vector2(2800, 1550)
const SPAWN := Vector2(250, 1090)

var platforms: Array[Rect2] = []
var stone_blocks: Array[Rect2] = []
var ladders: Array[Rect2] = []
var section_bounds := {
	"Galería de entrada": Rect2(0, 720, 900, 700),
	"Pozo central": Rect2(900, 650, 850, 800),
	"Galerías altas": Rect2(500, 250, 1800, 470),
	"Túnel profundo": Rect2(1750, 900, 1050, 550),
}


func _ready() -> void:
	add_to_group("cave_world")
	_build_layout()
	queue_redraw()


func _build_layout() -> void:
	_add_block(Rect2(0, 0, 70, WORLD_SIZE.y))
	_add_block(Rect2(WORLD_SIZE.x - 70, 0, 70, WORLD_SIZE.y))
	_add_block(Rect2(0, 0, WORLD_SIZE.x, 70))
	_add_block(Rect2(0, 1450, WORLD_SIZE.x, 100))

	_add_platform(Rect2(70, 1160, 790, 42))
	_add_platform(Rect2(1010, 1160, 650, 42))
	_add_platform(Rect2(1770, 1160, 530, 42))
	_add_platform(Rect2(2370, 1390, 360, 42))
	_add_platform(Rect2(520, 760, 690, 42))
	_add_platform(Rect2(1340, 760, 480, 42))
	_add_platform(Rect2(1900, 610, 380, 42))
	_add_platform(Rect2(1500, 410, 470, 42))
	_add_platform(Rect2(750, 410, 620, 42))
	_add_platform(Rect2(150, 920, 290, 32))

	_add_block(Rect2(860, 1040, 150, 410))
	_add_block(Rect2(1660, 1030, 110, 420))
	_add_block(Rect2(2300, 1080, 70, 370))
	_add_block(Rect2(1210, 700, 130, 460))
	_add_block(Rect2(1820, 540, 80, 620))
	_add_block(Rect2(1370, 350, 130, 410))

	_add_ladder(Rect2(785, 745, 48, 425))
	_add_ladder(Rect2(1090, 390, 48, 380))
	_add_ladder(Rect2(1570, 740, 48, 430))
	_add_ladder(Rect2(2080, 590, 48, 580))
	_add_ladder(Rect2(2520, 1140, 48, 270))

	_add_door("central_gate", "Compuerta del pozo", Vector2(1470, 704), false)
	_add_door("future_east", "Umbral del sector oriental", Vector2(2640, 1334), true)


func _add_platform(rectangle: Rect2) -> void:
	platforms.append(rectangle)
	var body := StaticBody2D.new()
	body.position = rectangle.get_center()
	var shape_node := CollisionShape2D.new()
	var shape := RectangleShape2D.new()
	shape.size = rectangle.size
	shape_node.shape = shape
	shape_node.one_way_collision = true
	shape_node.one_way_collision_margin = 10.0
	body.add_child(shape_node)
	add_child(body)


func _add_block(rectangle: Rect2) -> void:
	stone_blocks.append(rectangle)
	var body := StaticBody2D.new()
	body.position = rectangle.get_center()
	var shape_node := CollisionShape2D.new()
	var shape := RectangleShape2D.new()
	shape.size = rectangle.size
	shape_node.shape = shape
	body.add_child(shape_node)
	add_child(body)


func _add_ladder(rectangle: Rect2) -> void:
	ladders.append(rectangle)


func _add_door(id: String, label: String, position_value: Vector2, is_locked: bool) -> void:
	var door := DoorScript.new()
	door.configure(id, label, Vector2(46, 112), is_locked)
	door.position = position_value
	add_child(door)


func _draw() -> void:
	draw_rect(Rect2(Vector2.ZERO, WORLD_SIZE), Color("090d16"), true)
	for band in range(12):
		var y := 90.0 + band * 125.0
		var tone := Color(0.07 + band * 0.002, 0.085 + band * 0.003, 0.12 + band * 0.004, 1.0)
		draw_rect(Rect2(70, y, WORLD_SIZE.x - 140, 72), tone, true)

	for rectangle in stone_blocks:
		draw_rect(rectangle, Color("202534"), true)
		draw_line(rectangle.position, rectangle.position + Vector2(rectangle.size.x, 0), Color("354052"), 4.0)
	for rectangle in platforms:
		draw_rect(rectangle, Color("28303e"), true)
		draw_line(rectangle.position, rectangle.position + Vector2(rectangle.size.x, 0), Color("65706f"), 5.0)
		draw_line(rectangle.position + Vector2(0, 10), rectangle.position + Vector2(rectangle.size.x, 10), Color("323b48"), 2.0)

	for ladder in ladders:
		var left := ladder.position.x + 9.0
		var right := ladder.end.x - 9.0
		draw_line(Vector2(left, ladder.position.y), Vector2(left, ladder.end.y), Color("776653"), 5.0)
		draw_line(Vector2(right, ladder.position.y), Vector2(right, ladder.end.y), Color("776653"), 5.0)
		var rung_y := ladder.position.y + 12.0
		while rung_y < ladder.end.y:
			draw_line(Vector2(left, rung_y), Vector2(right, rung_y), Color("9a805e"), 3.0)
			rung_y += 24.0

	for crystal in [Vector2(330, 1125), Vector2(690, 725), Vector2(1290, 1120), Vector2(1710, 720), Vector2(2180, 570), Vector2(2460, 1350)]:
		draw_colored_polygon(
			PackedVector2Array([crystal + Vector2(-6, 0), crystal + Vector2(0, -18), crystal + Vector2(7, 0), crystal + Vector2(0, 9)]),
			Color("568b91")
		)
		draw_circle(crystal + Vector2(0, -3), 22.0, Color(0.2, 0.52, 0.58, 0.06))

	for crack_x in range(180, 2700, 310):
		var base := Vector2(crack_x, 105 + (crack_x % 5) * 30)
		draw_polyline(PackedVector2Array([base, base + Vector2(18, 24), base + Vector2(7, 51), base + Vector2(30, 78)]), Color("293243"), 3.0)


func is_on_ladder(point: Vector2) -> bool:
	for ladder in ladders:
		if ladder.grow(10.0).has_point(point):
			return true
	return false


func get_spawn_position() -> Vector2:
	return SPAWN


func describe_location(point: Vector2) -> String:
	for location_name: String in section_bounds:
		if section_bounds[location_name].has_point(point):
			return "%s  ·  profundidad %d m" % [location_name, roundi(point.y / 10.0)]
	return "Paso sin cartografiar"


func get_interaction_prompt(point: Vector2) -> String:
	var door := _nearest_door(point)
	if door != null:
		return "E  ·  %s" % door.display_name
	return ""


func interact(point: Vector2) -> String:
	var door := _nearest_door(point)
	if door != null:
		return door.toggle()
	return ""


func _nearest_door(point: Vector2) -> Node:
	var nearest: Node = null
	var distance := 105.0
	for door in get_tree().get_nodes_in_group("cave_doors"):
		var current := point.distance_to(door.global_position)
		if current < distance:
			distance = current
			nearest = door
	return nearest


func get_generated_platform_count() -> int:
	return platforms.size()


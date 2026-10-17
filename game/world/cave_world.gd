extends Node2D

const DoorScript := preload("res://world/cave_door.gd")
const WORLD_SIZE := Vector2(4800, 2200)
const SPAWN := Vector2(260, 1630)

var platforms: Array[Rect2] = []
var stone_blocks: Array[Rect2] = []
var ladders: Array[Rect2] = []
var safe_markers: Array[Vector2] = []
var crystals: Array[Vector2] = [
	Vector2(310, 1652), Vector2(700, 1252), Vector2(1120, 802),
	Vector2(1540, 1252), Vector2(2110, 1372), Vector2(2550, 932),
	Vector2(3050, 1402), Vector2(3440, 852), Vector2(3930, 1302),
	Vector2(4380, 2002), Vector2(2190, 312), Vector2(650, 472),
]
var section_bounds := {
	"Vestíbulo hundido": Rect2(0, 1150, 900, 950),
	"Falla central": Rect2(900, 900, 950, 1200),
	"Galerías altas": Rect2(250, 250, 2100, 650),
	"Bosque mineral": Rect2(1850, 850, 1000, 1000),
	"Cisterna seca": Rect2(2750, 1150, 900, 950),
	"Aguja oriental": Rect2(2850, 300, 1050, 850),
	"Umbral oriental": Rect2(3650, 650, 1150, 1450),
}
var section_links := {
	"Vestíbulo hundido": ["Falla central", "Galerías altas"],
	"Falla central": ["Vestíbulo hundido", "Galerías altas", "Bosque mineral"],
	"Galerías altas": ["Vestíbulo hundido", "Falla central", "Bosque mineral", "Aguja oriental"],
	"Bosque mineral": ["Falla central", "Galerías altas", "Cisterna seca"],
	"Cisterna seca": ["Bosque mineral", "Aguja oriental", "Umbral oriental"],
	"Aguja oriental": ["Galerías altas", "Cisterna seca", "Umbral oriental"],
	"Umbral oriental": ["Cisterna seca", "Aguja oriental"],
}


func _ready() -> void:
	add_to_group("cave_world")
	_build_layout()
	_add_ambient_lights()
	_add_dust()
	queue_redraw()


func _build_layout() -> void:
	# Contorno exterior.
	_add_block(Rect2(0, 0, 70, WORLD_SIZE.y))
	_add_block(Rect2(WORLD_SIZE.x - 70, 0, 70, WORLD_SIZE.y))
	_add_block(Rect2(0, 0, WORLD_SIZE.x, 70))
	_add_block(Rect2(0, 2100, WORLD_SIZE.x, 100))

	# Ruta profunda, de oeste a este.
	_add_platform(Rect2(70, 1700, 760, 48))
	_add_platform(Rect2(960, 1700, 720, 48))
	_add_platform(Rect2(1810, 1700, 720, 48))
	_add_platform(Rect2(2630, 1960, 800, 48))
	_add_platform(Rect2(3500, 1860, 660, 48))
	_add_platform(Rect2(4260, 2060, 470, 40))

	# Ruta media y cámaras principales.
	_add_platform(Rect2(420, 1300, 820, 46))
	_add_platform(Rect2(1360, 1300, 570, 46))
	_add_platform(Rect2(2030, 1420, 700, 46))
	_add_platform(Rect2(2840, 1450, 700, 46))
	_add_platform(Rect2(3640, 1360, 680, 46))
	_add_platform(Rect2(4380, 1510, 350, 40))

	# Ruta alta y miradores.
	_add_platform(Rect2(800, 850, 720, 44))
	_add_platform(Rect2(1630, 720, 700, 44))
	_add_platform(Rect2(2400, 980, 600, 44))
	_add_platform(Rect2(3060, 900, 560, 44))
	_add_platform(Rect2(3700, 760, 890, 44))
	_add_platform(Rect2(340, 520, 660, 40))
	_add_platform(Rect2(1100, 420, 550, 40))
	_add_platform(Rect2(2040, 360, 680, 40))
	_add_platform(Rect2(3090, 480, 650, 40))

	# Roca estructural: forma pozos, chimeneas y estrechamientos.
	_add_block(Rect2(830, 1570, 130, 530))
	_add_block(Rect2(1680, 1540, 130, 560))
	_add_block(Rect2(2530, 1600, 100, 500))
	_add_block(Rect2(3430, 1760, 70, 340))
	_add_block(Rect2(4160, 1760, 100, 340))
	_add_block(Rect2(1240, 1240, 120, 460))
	_add_block(Rect2(1930, 1240, 100, 460))
	_add_block(Rect2(2730, 1340, 110, 610))
	_add_block(Rect2(3540, 1260, 100, 600))
	_add_block(Rect2(1520, 660, 110, 640))
	_add_block(Rect2(2330, 650, 70, 770))
	_add_block(Rect2(3000, 820, 60, 630))
	_add_block(Rect2(3620, 680, 80, 680))
	_add_block(Rect2(1000, 350, 100, 500))
	_add_block(Rect2(1650, 350, 390, 70))
	_add_block(Rect2(2720, 290, 370, 70))

	# Conexiones verticales. Sus extremos se solapan con plataformas transitables.
	_add_ladder(Rect2(670, 1280, 50, 430))
	_add_ladder(Rect2(1090, 830, 50, 480))
	_add_ladder(Rect2(1490, 1280, 50, 430))
	_add_ladder(Rect2(2160, 700, 50, 730))
	_add_ladder(Rect2(2440, 1400, 50, 310))
	_add_ladder(Rect2(3250, 880, 50, 580))
	_add_ladder(Rect2(3880, 740, 50, 630))
	_add_ladder(Rect2(3880, 1340, 50, 530))
	_add_ladder(Rect2(4510, 740, 50, 780))
	_add_ladder(Rect2(4510, 1490, 50, 580))

	_add_door("fault_gate", "Compuerta de la falla", Vector2(1810, 1242), false)
	_add_door("cistern_gate", "Compuerta de la cisterna", Vector2(3390, 1392), false)
	_add_door("future_east", "Umbral del sector oriental", Vector2(4640, 2003), true)

	# Puntos seguros usados al recuperar al personaje de una caída.
	safe_markers.assign([
		Vector2(260, 1630), Vector2(700, 1230), Vector2(1110, 780),
		Vector2(1500, 1230), Vector2(2200, 1350), Vector2(3250, 1380),
		Vector2(3900, 1290), Vector2(4470, 1440),
	])


func _add_platform(rectangle: Rect2) -> void:
	platforms.append(rectangle)
	var body := StaticBody2D.new()
	body.position = rectangle.get_center()
	var shape_node := CollisionShape2D.new()
	var shape := RectangleShape2D.new()
	shape.size = rectangle.size
	shape_node.shape = shape
	shape_node.one_way_collision = true
	shape_node.one_way_collision_margin = 12.0
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
	door.configure(id, label, Vector2(48, 116), is_locked)
	door.position = position_value
	add_child(door)


func _draw() -> void:
	_draw_background_depth()
	for block_index in stone_blocks.size():
		_draw_stone_block(stone_blocks[block_index], block_index)
	for platform_index in platforms.size():
		_draw_rock_platform(platforms[platform_index], platform_index)
	for ladder in ladders:
		_draw_ladder(ladder)
	for crystal_index in crystals.size():
		_draw_crystal_cluster(crystals[crystal_index], crystal_index)
	_draw_cave_details()


func _draw_background_depth() -> void:
	draw_rect(Rect2(Vector2.ZERO, WORLD_SIZE), Color("070a12"), true)
	# Estratos suaves, con tonos más fríos en las zonas profundas.
	for band in range(18):
		var band_y := 110.0 + float(band) * 115.0
		var alpha := 0.08 + float(band % 3) * 0.018
		draw_rect(Rect2(70, band_y, WORLD_SIZE.x - 140, 58), Color(0.16, 0.22, 0.29, alpha), true)
		draw_line(Vector2(70, band_y), Vector2(WORLD_SIZE.x - 70, band_y + sin(float(band)) * 18.0), Color(0.25, 0.31, 0.38, 0.09), 3.0)

	# Grandes siluetas al fondo rompen la cuadrícula y dan sensación de profundidad.
	for layer in range(3):
		var points := PackedVector2Array([Vector2(70, WORLD_SIZE.y)])
		for index in range(25):
			var x := 70.0 + float(index) * 195.0
			var wave := sin(float(index) * 1.71 + float(layer)) * 95.0
			var y := 1810.0 - float(layer) * 270.0 + wave
			points.append(Vector2(x, y))
		points.append(Vector2(WORLD_SIZE.x - 70, WORLD_SIZE.y))
		var shade := Color(0.055 + layer * 0.018, 0.075 + layer * 0.022, 0.11 + layer * 0.025, 0.72)
		draw_colored_polygon(points, shade)

	# Pozos de luz mineral.
	for shaft_x in [620.0, 2140.0, 3280.0, 4460.0]:
		var shaft := PackedVector2Array([
			Vector2(shaft_x - 55, 70), Vector2(shaft_x + 45, 70),
			Vector2(shaft_x + 180, 1850), Vector2(shaft_x - 210, 1850),
		])
		draw_colored_polygon(shaft, Color(0.25, 0.47, 0.53, 0.025))


func _draw_stone_block(rectangle: Rect2, index: int) -> void:
	var base_color := Color("171e2a") if index % 2 == 0 else Color("1b2330")
	draw_rect(rectangle, base_color, true)
	draw_line(rectangle.position, rectangle.position + Vector2(rectangle.size.x, 0), Color("3b4855"), 4.0)
	draw_line(rectangle.position + Vector2(rectangle.size.x, 0), rectangle.end, Color(0.08, 0.1, 0.15, 0.8), 5.0)
	var vein_y := rectangle.position.y + 32.0
	while vein_y < rectangle.end.y:
		draw_line(Vector2(rectangle.position.x + 8, vein_y), Vector2(rectangle.end.x - 8, vein_y + sin(vein_y) * 7.0), Color(0.28, 0.32, 0.38, 0.12), 2.0)
		vein_y += 74.0


func _draw_rock_platform(rectangle: Rect2, index: int) -> void:
	var surface := PackedVector2Array()
	var segments: int = maxi(3, int(rectangle.size.x / 55.0))
	for step in range(segments + 1):
		var ratio := float(step) / float(segments)
		var jitter := sin(float(index * 31 + step * 17)) * 4.0
		surface.append(Vector2(rectangle.position.x + rectangle.size.x * ratio, rectangle.position.y + jitter))
	surface.append(rectangle.end)
	surface.append(Vector2(rectangle.position.x, rectangle.end.y))
	draw_colored_polygon(surface, Color("293341"))
	draw_polyline(surface.slice(0, segments + 1), Color("71827f"), 4.0, true)
	draw_line(rectangle.position + Vector2(0, 13), rectangle.position + Vector2(rectangle.size.x, 13), Color(0.12, 0.16, 0.21, 0.8), 3.0)
	# Pequeños salientes erosionados bajo cada plataforma.
	for tooth in range(1, segments, 2):
		var tooth_x := rectangle.position.x + rectangle.size.x * float(tooth) / float(segments)
		var length := 8.0 + float((tooth + index) % 4) * 5.0
		draw_colored_polygon(PackedVector2Array([
			Vector2(tooth_x - 7, rectangle.end.y - 2), Vector2(tooth_x + 8, rectangle.end.y - 2),
			Vector2(tooth_x + 2, rectangle.end.y + length),
		]), Color("202936"))


func _draw_ladder(ladder: Rect2) -> void:
	var left := ladder.position.x + 10.0
	var right := ladder.end.x - 10.0
	draw_line(Vector2(left + 3, ladder.position.y), Vector2(left, ladder.end.y), Color("4a3e35"), 8.0)
	draw_line(Vector2(right - 3, ladder.position.y), Vector2(right, ladder.end.y), Color("4a3e35"), 8.0)
	draw_line(Vector2(left + 3, ladder.position.y), Vector2(left, ladder.end.y), Color("a38660"), 3.0)
	draw_line(Vector2(right - 3, ladder.position.y), Vector2(right, ladder.end.y), Color("a38660"), 3.0)
	var rung_y := ladder.position.y + 13.0
	while rung_y < ladder.end.y:
		draw_line(Vector2(left, rung_y), Vector2(right, rung_y + 1), Color("9a7957"), 4.0)
		rung_y += 24.0


func _draw_crystal_cluster(origin: Vector2, index: int) -> void:
	var hue := Color("55a6ad") if index % 3 != 0 else Color("9477b8")
	for shard in range(3):
		var offset := Vector2(float(shard - 1) * 9.0, 0)
		var height := 14.0 + float((index + shard) % 4) * 5.0
		draw_colored_polygon(PackedVector2Array([
			origin + offset + Vector2(-5, 0), origin + offset + Vector2(0, -height),
			origin + offset + Vector2(6, 0), origin + offset + Vector2(0, 7),
		]), hue.darkened(float(shard) * 0.08))
		draw_line(origin + offset + Vector2(0, -height + 4), origin + offset + Vector2(1, -2), hue.lightened(0.35), 1.0)
	draw_circle(origin + Vector2(0, -8), 38.0, Color(hue.r, hue.g, hue.b, 0.045))


func _draw_cave_details() -> void:
	# Estalactitas del techo.
	for index in range(27):
		var x := 120.0 + float(index) * 172.0
		var length := 28.0 + float((index * 37) % 85)
		draw_colored_polygon(PackedVector2Array([
			Vector2(x - 16, 69), Vector2(x + 18, 69), Vector2(x + 4, 69 + length),
		]), Color("1c2632"))
	# Raíces y grietas en paredes abiertas.
	for index in range(15):
		var base := Vector2(150.0 + float(index) * 320.0, 105.0 + float(index % 4) * 46.0)
		draw_polyline(PackedVector2Array([
			base, base + Vector2(24, 29), base + Vector2(11, 62), base + Vector2(38, 102),
		]), Color(0.25, 0.31, 0.38, 0.34), 3.0)


func _add_ambient_lights() -> void:
	var texture := _make_radial_texture()
	for index in range(crystals.size()):
		if index % 2 != 0:
			continue
		var light := PointLight2D.new()
		light.position = crystals[index] + Vector2(0, -12)
		light.texture = texture
		light.texture_scale = 1.1
		light.energy = 0.38
		light.color = Color("58aab0") if index % 4 != 0 else Color("9477b8")
		add_child(light)


func _make_radial_texture() -> GradientTexture2D:
	var gradient := Gradient.new()
	gradient.colors = PackedColorArray([Color(1, 1, 1, 0.72), Color(1, 1, 1, 0)])
	var texture := GradientTexture2D.new()
	texture.width = 192
	texture.height = 192
	texture.fill = GradientTexture2D.FILL_RADIAL
	texture.fill_from = Vector2(0.5, 0.5)
	texture.fill_to = Vector2(1.0, 0.5)
	texture.gradient = gradient
	return texture


func _add_dust() -> void:
	var particles := CPUParticles2D.new()
	particles.position = WORLD_SIZE * 0.5
	particles.amount = 120
	particles.lifetime = 16.0
	particles.randomness = 0.8
	particles.emission_shape = CPUParticles2D.EMISSION_SHAPE_RECTANGLE
	particles.emission_rect_extents = WORLD_SIZE * 0.48
	particles.direction = Vector2(0.2, -1.0)
	particles.spread = 35.0
	particles.initial_velocity_min = 3.0
	particles.initial_velocity_max = 10.0
	particles.gravity = Vector2(1.0, -1.5)
	particles.scale_amount_min = 0.35
	particles.scale_amount_max = 0.9
	particles.color = Color(0.66, 0.76, 0.78, 0.22)
	particles.z_index = -1
	add_child(particles)


func is_on_ladder(point: Vector2) -> bool:
	for ladder in ladders:
		if ladder.grow(12.0).has_point(point):
			return true
	return false


func get_ladder_center_x(point: Vector2) -> float:
	for ladder in ladders:
		if ladder.grow(12.0).has_point(point):
			return ladder.get_center().x
	return point.x


func get_spawn_position() -> Vector2:
	return SPAWN


func get_world_rect() -> Rect2:
	return Rect2(Vector2.ZERO, WORLD_SIZE)


func get_nearest_safe_point(point: Vector2) -> Vector2:
	var nearest := SPAWN
	var best_distance := INF
	for marker in safe_markers:
		var marker_distance := point.distance_squared_to(marker)
		if marker_distance < best_distance:
			best_distance = marker_distance
			nearest = marker
	return nearest


func describe_location(point: Vector2) -> String:
	for location_name: String in section_bounds:
		if section_bounds[location_name].has_point(point):
			return "%s  ·  cota %d m" % [location_name, roundi((WORLD_SIZE.y - point.y) / 10.0)]
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
	var distance := 110.0
	for door in get_tree().get_nodes_in_group("cave_doors"):
		var current: float = point.distance_to(door.global_position)
		if current < distance:
			distance = current
			nearest = door
	return nearest


func validate_layout() -> PackedStringArray:
	var errors := PackedStringArray()
	var bounds := get_world_rect()
	if not _point_has_support(SPAWN):
		errors.append("spawn_without_platform")
	for platform in platforms:
		if platform.size.x <= 0 or platform.size.y <= 0 or not bounds.encloses(platform):
			errors.append("invalid_platform")
	for ladder in ladders:
		if ladder.size.y < 120 or not bounds.encloses(ladder):
			errors.append("invalid_ladder")
	if not _all_sections_connected():
		errors.append("disconnected_section_graph")
	if get_tree().get_nodes_in_group("cave_doors").size() < 3:
		errors.append("missing_doors")
	return errors


func _point_has_support(point: Vector2) -> bool:
	for platform in platforms:
		if point.x >= platform.position.x and point.x <= platform.end.x and absf(point.y + 70.0 - platform.position.y) < 20.0:
			return true
	return false


func _all_sections_connected() -> bool:
	var pending: Array[String] = ["Vestíbulo hundido"]
	var visited: Dictionary = {}
	while not pending.is_empty():
		var current: String = pending.pop_front()
		if visited.has(current):
			continue
		visited[current] = true
		for neighbor: String in section_links.get(current, []):
			if not visited.has(neighbor):
				pending.append(neighbor)
	return visited.size() == section_bounds.size()


func get_generated_platform_count() -> int:
	return platforms.size()


func get_ladder_count() -> int:
	return ladders.size()


func get_section_count() -> int:
	return section_bounds.size()

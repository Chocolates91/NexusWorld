extends Control

var world_size := Vector2(4800, 2200)
var player_position := Vector2.ZERO

const NODES := [
	Vector2(0.10, 0.75), Vector2(0.28, 0.68), Vector2(0.27, 0.28),
	Vector2(0.49, 0.60), Vector2(0.66, 0.78), Vector2(0.69, 0.33), Vector2(0.88, 0.65),
]
const LINKS := [
	Vector2i(0, 1), Vector2i(0, 2), Vector2i(1, 2), Vector2i(1, 3),
	Vector2i(2, 3), Vector2i(2, 5), Vector2i(3, 4), Vector2i(4, 5),
	Vector2i(4, 6), Vector2i(5, 6),
]


func _ready() -> void:
	mouse_filter = Control.MOUSE_FILTER_IGNORE
	queue_redraw()


func update_player_position(value: Vector2) -> void:
	player_position = value
	queue_redraw()


func _draw() -> void:
	draw_style_box(_panel_style(), Rect2(Vector2.ZERO, size))
	draw_string(ThemeDB.fallback_font, Vector2(13, 20), "MAPA DEL SECTOR", HORIZONTAL_ALIGNMENT_LEFT, -1, 12, Color("91aab2"))
	var map_rect := Rect2(12, 29, size.x - 24, size.y - 40)
	for link in LINKS:
		var from := map_rect.position + Vector2(NODES[link.x].x * map_rect.size.x, NODES[link.x].y * map_rect.size.y)
		var to := map_rect.position + Vector2(NODES[link.y].x * map_rect.size.x, NODES[link.y].y * map_rect.size.y)
		draw_line(from, to, Color(0.33, 0.46, 0.5, 0.55), 2.0)
	for node in NODES:
		var point := map_rect.position + Vector2(node.x * map_rect.size.x, node.y * map_rect.size.y)
		draw_circle(point, 3.5, Color("668991"))
	var normalized := Vector2(
		clampf(player_position.x / world_size.x, 0.0, 1.0),
		clampf(player_position.y / world_size.y, 0.0, 1.0)
	)
	var player_point := map_rect.position + normalized * map_rect.size
	draw_circle(player_point, 5.0, Color(0.94, 0.72, 0.32, 0.18))
	draw_circle(player_point, 2.5, Color("f1c66c"))


func _panel_style() -> StyleBoxFlat:
	var style := StyleBoxFlat.new()
	style.bg_color = Color(0.025, 0.036, 0.06, 0.84)
	style.border_color = Color(0.24, 0.34, 0.4, 0.72)
	style.set_border_width_all(1)
	style.set_corner_radius_all(7)
	return style


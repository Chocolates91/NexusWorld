extends StaticBody2D

signal state_changed(message: String)

var door_id := "door"
var display_name := "Compuerta"
var door_size := Vector2(48, 116)
var opened := false
var locked := false
var open_progress := 0.0
var collision_shape: CollisionShape2D


func configure(id: String, label: String, size: Vector2, is_locked := false) -> void:
	door_id = id
	display_name = label
	door_size = size
	locked = is_locked


func _ready() -> void:
	add_to_group("cave_doors")
	collision_shape = CollisionShape2D.new()
	var rectangle := RectangleShape2D.new()
	rectangle.size = door_size
	collision_shape.shape = rectangle
	add_child(collision_shape)
	queue_redraw()


func _process(delta: float) -> void:
	var target := 1.0 if opened else 0.0
	var previous := open_progress
	open_progress = move_toward(open_progress, target, delta * 2.8)
	if not is_equal_approx(previous, open_progress):
		queue_redraw()


func toggle() -> String:
	if locked:
		return "%s conduce a una sección aún no cartografiada." % display_name
	opened = not opened
	collision_shape.set_deferred("disabled", opened)
	var message := "%s abierta." % display_name if opened else "%s cerrada." % display_name
	state_changed.emit(message)
	return message


func _draw() -> void:
	# Arco de piedra y canal metálico.
	draw_arc(Vector2(0, -door_size.y * 0.43), door_size.x * 0.72, PI, TAU, 18, Color("1a202b"), 16.0)
	draw_line(Vector2(-door_size.x * 0.72, -door_size.y * 0.42), Vector2(-door_size.x * 0.72, door_size.y * 0.52), Color("242c39"), 12.0)
	draw_line(Vector2(door_size.x * 0.72, -door_size.y * 0.42), Vector2(door_size.x * 0.72, door_size.y * 0.52), Color("242c39"), 12.0)
	draw_arc(Vector2(0, -door_size.y * 0.43), door_size.x * 0.57, PI, TAU, 18, Color("65717a"), 2.0)

	var slab_offset := Vector2(0, -open_progress * (door_size.y + 12.0))
	var slab_rect := Rect2(-door_size * 0.5 + slab_offset, door_size)
	var slab_color := Color("4c5362") if not locked else Color("292f3a")
	draw_rect(slab_rect, slab_color, true)
	draw_rect(slab_rect.grow(-3.0), Color("343c4b") if not locked else Color("222833"), false, 2.0)
	for offset in [-14.0, 0.0, 14.0]:
		draw_line(Vector2(offset, -door_size.y * 0.44) + slab_offset, Vector2(offset, door_size.y * 0.44) + slab_offset, Color("75808c"), 2.0)

	# Indicador legible incluso con poca luz.
	var indicator := Vector2(13, 2) + slab_offset
	draw_circle(indicator, 7.0, Color(0.9, 0.66, 0.25, 0.08))
	draw_circle(indicator, 3.0, Color("d6ad61") if not locked else Color("65717c"))
	if locked:
		draw_line(Vector2(-8, -7) + slab_offset, Vector2(8, 7) + slab_offset, Color("9a5961"), 3.0)
		draw_line(Vector2(8, -7) + slab_offset, Vector2(-8, 7) + slab_offset, Color("9a5961"), 3.0)

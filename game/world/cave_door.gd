extends StaticBody2D

signal state_changed(message: String)

var door_id := "door"
var display_name := "Compuerta"
var door_size := Vector2(46, 112)
var opened := false
var locked := false
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


func toggle() -> String:
	if locked:
		return "%s conduce a una sección aún no cartografiada." % display_name
	opened = not opened
	collision_shape.set_deferred("disabled", opened)
	queue_redraw()
	var message := "%s abierta." % display_name if opened else "%s cerrada." % display_name
	state_changed.emit(message)
	return message


func _draw() -> void:
	if opened:
		draw_rect(Rect2(-door_size.x * 0.5, -door_size.y * 0.5, 8, door_size.y), Color("394450"), true)
		draw_line(Vector2(-18, -door_size.y * 0.45), Vector2(-18, door_size.y * 0.45), Color("8b6e4e"), 3.0)
		return
	var color := Color("55495f") if not locked else Color("343845")
	draw_rect(Rect2(-door_size * 0.5, door_size), color, true)
	for offset in [-14.0, 0.0, 14.0]:
		draw_line(Vector2(offset, -door_size.y * 0.45), Vector2(offset, door_size.y * 0.45), Color("786379"), 2.0)
	draw_circle(Vector2(12, 2), 3.0, Color("d0a85e") if not locked else Color("64717a"))


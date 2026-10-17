extends Control

const BUTTON_RADIUS := 38.0

var finger_actions: Dictionary = {}
var buttons: Dictionary = {}


func _ready() -> void:
	set_anchors_and_offsets_preset(Control.PRESET_FULL_RECT)
	mouse_filter = Control.MOUSE_FILTER_IGNORE
	visibility_changed.connect(queue_redraw)
	resized.connect(_update_layout)
	_update_layout()


func _exit_tree() -> void:
	for action: String in finger_actions.values():
		Input.action_release(action)
	finger_actions.clear()


func _input(event: InputEvent) -> void:
	if not visible:
		return
	if event is InputEventScreenTouch:
		var touch := event as InputEventScreenTouch
		if touch.pressed:
			_set_finger_action(touch.index, _action_at(touch.position))
		else:
			_set_finger_action(touch.index, "")
		get_viewport().set_input_as_handled()
	elif event is InputEventScreenDrag:
		var drag := event as InputEventScreenDrag
		_set_finger_action(drag.index, _action_at(drag.position))
		get_viewport().set_input_as_handled()


func _update_layout() -> void:
	var height := size.y
	var width := size.x
	buttons = {
		"move_left": Vector2(64, height - 92),
		"move_right": Vector2(154, height - 92),
		"move_up": Vector2(109, height - 142),
		"move_down": Vector2(109, height - 42),
		"jump": Vector2(width - 74, height - 73),
		"interact": Vector2(width - 165, height - 123),
	}
	queue_redraw()


func _set_finger_action(finger: int, action: String) -> void:
	var previous: String = finger_actions.get(finger, "")
	if previous == action:
		return
	if not previous.is_empty():
		Input.action_release(previous)
		finger_actions.erase(finger)
	if not action.is_empty():
		Input.action_press(action)
		finger_actions[finger] = action
	queue_redraw()


func _action_at(point: Vector2) -> String:
	for action: String in buttons:
		if point.distance_to(buttons[action]) <= BUTTON_RADIUS * 1.15:
			return action
	return ""


func _draw() -> void:
	for action: String in buttons:
		var center: Vector2 = buttons[action]
		var pressed := action in finger_actions.values()
		var fill := Color(0.12, 0.18, 0.24, 0.72) if not pressed else Color(0.35, 0.52, 0.57, 0.82)
		draw_circle(center, BUTTON_RADIUS, fill)
		draw_arc(center, BUTTON_RADIUS, 0.0, TAU, 32, Color(0.48, 0.63, 0.66, 0.8), 2.0)
		_draw_button_symbol(action, center)


func _draw_button_symbol(action: String, center: Vector2) -> void:
	var color := Color("d7e4df")
	if action == "jump":
		draw_string(ThemeDB.fallback_font, center + Vector2(-18, 6), "SALTO", HORIZONTAL_ALIGNMENT_LEFT, -1, 12, color)
		return
	if action == "interact":
		draw_string(ThemeDB.fallback_font, center + Vector2(-6, 7), "E", HORIZONTAL_ALIGNMENT_LEFT, -1, 18, Color("f0c775"))
		return
	var direction := {
		"move_left": Vector2(-1, 0), "move_right": Vector2(1, 0),
		"move_up": Vector2(0, -1), "move_down": Vector2(0, 1),
	}[action] as Vector2
	var perpendicular := Vector2(-direction.y, direction.x)
	var tip := center + direction * 15.0
	var back := center - direction * 10.0
	draw_colored_polygon(PackedVector2Array([
		tip, back + perpendicular * 10.0, back - perpendicular * 10.0,
	]), color)


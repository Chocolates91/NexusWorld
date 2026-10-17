extends Control


func _ready() -> void:
	mouse_filter = Control.MOUSE_FILTER_IGNORE
	set_anchors_and_offsets_preset(Control.PRESET_FULL_RECT)
	queue_redraw()


func _draw() -> void:
	var layers := 10
	for index in range(layers):
		var inset := float(index) * 5.0
		var alpha := 0.055 * (1.0 - float(index) / float(layers))
		draw_rect(Rect2(inset, inset, size.x - inset * 2.0, size.y - inset * 2.0), Color(0.0, 0.01, 0.025, alpha), false, 10.0)

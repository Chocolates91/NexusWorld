extends CharacterBody2D

const WALK_SPEED := 210.0
const CLIMB_SPEED := 150.0
const JUMP_VELOCITY := -390.0
const BODY_SIZE := Vector2(28, 52)

var gravity: float = 980.0
var climbing := false
var facing := 1.0
var walk_phase := 0.0
var world: Node


func _ready() -> void:
	world = get_tree().get_first_node_in_group("cave_world")
	var shape := CollisionShape2D.new()
	var rectangle := RectangleShape2D.new()
	rectangle.size = BODY_SIZE
	shape.shape = rectangle
	add_child(shape)

	var camera := Camera2D.new()
	camera.position = Vector2(0, -55)
	camera.position_smoothing_enabled = true
	camera.position_smoothing_speed = 6.0
	camera.limit_left = 0
	camera.limit_top = 0
	camera.limit_right = 2800
	camera.limit_bottom = 1550
	add_child(camera)

	_add_lantern_light()
	queue_redraw()


func _physics_process(delta: float) -> void:
	var horizontal := Input.get_axis("move_left", "move_right")
	var vertical := Input.get_axis("move_up", "move_down")
	var on_ladder: bool = world != null and world.is_on_ladder(global_position)

	if on_ladder and absf(vertical) > 0.1:
		climbing = true
	elif climbing and not on_ladder:
		climbing = false
	elif climbing and Input.is_action_just_pressed("jump"):
		climbing = false
		velocity.y = JUMP_VELOCITY * 0.75

	velocity.x = move_toward(velocity.x, horizontal * WALK_SPEED, 950.0 * delta)
	if absf(horizontal) > 0.05:
		facing = signf(horizontal)
		walk_phase += delta * 11.0
	else:
		walk_phase = move_toward(walk_phase, 0.0, delta * 8.0)

	if climbing:
		velocity.y = vertical * CLIMB_SPEED
	elif not is_on_floor():
		velocity.y = minf(velocity.y + gravity * delta, 650.0)
	elif Input.is_action_just_pressed("jump"):
		velocity.y = JUMP_VELOCITY

	if Input.is_action_pressed("move_down") and Input.is_action_just_pressed("jump"):
		position.y += 8.0

	move_and_slide()
	queue_redraw()


func _draw() -> void:
	var bob := sin(walk_phase) * 1.5 if absf(velocity.x) > 8.0 and is_on_floor() else 0.0
	var step := sin(walk_phase) * 5.0 if absf(velocity.x) > 8.0 else 0.0
	_draw_shadow_ellipse(Vector2(0, 27), Vector2(18, 5), Color(0.01, 0.015, 0.025, 0.55))
	draw_colored_polygon(
		PackedVector2Array([Vector2(-14, -5 + bob), Vector2(14, -5 + bob), Vector2(11, 22), Vector2(-11, 22)]),
		Color("39405a")
	)
	draw_line(Vector2(-7, 20), Vector2(-6 + step, 29), Color("202638"), 5.0)
	draw_line(Vector2(7, 20), Vector2(6 - step, 29), Color("202638"), 5.0)
	draw_circle(Vector2(0, -15 + bob), 12.0, Color("b8a889"))
	draw_arc(Vector2(0, -15 + bob), 12.5, PI, TAU, 16, Color("5c5066"), 5.0)
	draw_circle(Vector2(5 * facing, -16 + bob), 1.6, Color("d9c77f"))
	draw_circle(Vector2(13 * facing, -7 + bob), 3.0, Color("e2b866"))


func _draw_shadow_ellipse(center: Vector2, radii: Vector2, color: Color) -> void:
	var points := PackedVector2Array()
	for index in range(24):
		var angle := TAU * float(index) / 24.0
		points.append(center + Vector2(cos(angle) * radii.x, sin(angle) * radii.y))
	draw_colored_polygon(points, color)


func _add_lantern_light() -> void:
	var gradient := Gradient.new()
	gradient.colors = PackedColorArray([Color(1.0, 0.72, 0.32, 0.72), Color(0.35, 0.46, 0.55, 0.0)])
	var texture := GradientTexture2D.new()
	texture.width = 256
	texture.height = 256
	texture.fill = GradientTexture2D.FILL_RADIAL
	texture.fill_from = Vector2(0.5, 0.5)
	texture.fill_to = Vector2(1.0, 0.5)
	texture.gradient = gradient
	var light := PointLight2D.new()
	light.texture = texture
	light.texture_scale = 1.8
	light.energy = 0.8
	light.position = Vector2(12, -5)
	add_child(light)


func reset_to(target: Vector2) -> void:
	global_position = target
	velocity = Vector2.ZERO


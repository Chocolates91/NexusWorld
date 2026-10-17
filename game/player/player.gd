extends CharacterBody2D

const WALK_SPEED := 230.0
const GROUND_ACCELERATION := 1450.0
const AIR_ACCELERATION := 720.0
const CLIMB_SPEED := 165.0
const JUMP_VELOCITY := -410.0
const BODY_SIZE := Vector2(28, 52)
const COYOTE_TIME := 0.12
const JUMP_BUFFER_TIME := 0.14

var gravity: float = 1050.0
var climbing := false
var facing := 1.0
var walk_phase := 0.0
var idle_phase := 0.0
var coyote_remaining := 0.0
var jump_buffer_remaining := 0.0
var landing_squash := 0.0
var was_on_floor := false
var last_safe_position := Vector2.ZERO
var world: Node
var camera: Camera2D


func _ready() -> void:
	world = get_tree().get_first_node_in_group("cave_world")
	last_safe_position = global_position
	var shape := CollisionShape2D.new()
	var rectangle := RectangleShape2D.new()
	rectangle.size = BODY_SIZE
	shape.shape = rectangle
	add_child(shape)

	camera = Camera2D.new()
	camera.position = Vector2(0, -62)
	camera.position_smoothing_enabled = true
	camera.position_smoothing_speed = 7.5
	if world != null:
		var bounds: Rect2 = world.get_world_rect()
		camera.limit_left = int(bounds.position.x)
		camera.limit_top = int(bounds.position.y)
		camera.limit_right = int(bounds.end.x)
		camera.limit_bottom = int(bounds.end.y)
	add_child(camera)

	_add_lantern_light()
	queue_redraw()


func _physics_process(delta: float) -> void:
	idle_phase += delta * 2.2
	landing_squash = move_toward(landing_squash, 0.0, delta * 5.0)
	var horizontal := Input.get_axis("move_left", "move_right")
	var vertical := Input.get_axis("move_up", "move_down")
	var on_ladder: bool = world != null and world.is_on_ladder(global_position)

	_update_jump_timers(delta)
	_update_climbing(on_ladder, vertical)
	_update_horizontal(horizontal, delta)
	_update_vertical(vertical, delta)
	move_and_slide()
	_update_after_movement()
	_update_camera(delta)
	queue_redraw()


func _update_jump_timers(delta: float) -> void:
	if is_on_floor():
		coyote_remaining = COYOTE_TIME
	else:
		coyote_remaining = maxf(0.0, coyote_remaining - delta)
	if Input.is_action_just_pressed("jump"):
		jump_buffer_remaining = JUMP_BUFFER_TIME
	else:
		jump_buffer_remaining = maxf(0.0, jump_buffer_remaining - delta)


func _update_climbing(on_ladder: bool, vertical: float) -> void:
	if on_ladder and absf(vertical) > 0.1:
		climbing = true
	elif climbing and not on_ladder:
		climbing = false
	elif climbing and Input.is_action_just_pressed("jump"):
		climbing = false
		velocity.y = JUMP_VELOCITY * 0.72
		jump_buffer_remaining = 0.0
	if climbing and world != null:
		global_position.x = move_toward(global_position.x, world.get_ladder_center_x(global_position), 3.8)


func _update_horizontal(horizontal: float, delta: float) -> void:
	var target_speed := horizontal * WALK_SPEED
	if climbing:
		target_speed *= 0.28
	var acceleration := GROUND_ACCELERATION if is_on_floor() else AIR_ACCELERATION
	velocity.x = move_toward(velocity.x, target_speed, acceleration * delta)
	if absf(horizontal) > 0.05:
		facing = signf(horizontal)
		walk_phase += delta * (12.5 if is_on_floor() else 6.0)


func _update_vertical(vertical: float, delta: float) -> void:
	if climbing:
		velocity.y = vertical * CLIMB_SPEED
		return
	if jump_buffer_remaining > 0.0 and coyote_remaining > 0.0:
		velocity.y = JUMP_VELOCITY
		jump_buffer_remaining = 0.0
		coyote_remaining = 0.0
	elif not is_on_floor():
		velocity.y = minf(velocity.y + gravity * delta, 720.0)
	if Input.is_action_just_released("jump") and velocity.y < -150.0:
		velocity.y *= 0.55
	if Input.is_action_pressed("move_down") and Input.is_action_just_pressed("jump"):
		position.y += 10.0
		jump_buffer_remaining = 0.0


func _update_after_movement() -> void:
	if is_on_floor():
		last_safe_position = global_position
		if not was_on_floor and velocity.y >= 0.0:
			landing_squash = 1.0
	was_on_floor = is_on_floor()


func _update_camera(delta: float) -> void:
	var look_ahead := Vector2(facing * 72.0, clampf(velocity.y * 0.12, -45.0, 65.0) - 62.0)
	camera.position = camera.position.lerp(look_ahead, minf(1.0, delta * 3.0))


func _draw() -> void:
	var moving := absf(velocity.x) > 12.0
	var bob := sin(walk_phase) * 1.8 if moving and is_on_floor() else sin(idle_phase) * 0.7
	var step := sin(walk_phase) * 6.0 if moving else 0.0
	var squash_y := landing_squash * 3.0
	var origin := Vector2(0, bob + squash_y)

	_draw_shadow_ellipse(Vector2(0, 28), Vector2(19 + landing_squash * 4.0, 5), Color(0.005, 0.008, 0.015, 0.65))
	# Mochila y silueta exterior.
	draw_circle(origin + Vector2(-8 * facing, 1), 10.0, Color("20283a"))
	draw_colored_polygon(PackedVector2Array([
		origin + Vector2(-15, -7), origin + Vector2(14, -7),
		origin + Vector2(12, 21 - squash_y), origin + Vector2(-12, 21 - squash_y),
	]), Color("39445c"))
	draw_polyline(PackedVector2Array([
		origin + Vector2(-15, -7), origin + Vector2(14, -7), origin + Vector2(12, 21 - squash_y),
	]), Color("68738b"), 2.0)
	# Botas con paso alterno.
	draw_line(origin + Vector2(-7, 19), origin + Vector2(-7 + step, 29 - squash_y), Color("161d2b"), 6.0)
	draw_line(origin + Vector2(7, 19), origin + Vector2(7 - step, 29 - squash_y), Color("161d2b"), 6.0)
	draw_line(origin + Vector2(-7 + step, 29 - squash_y), origin + Vector2(-2 + step, 29 - squash_y), Color("566070"), 3.0)
	draw_line(origin + Vector2(7 - step, 29 - squash_y), origin + Vector2(12 - step, 29 - squash_y), Color("566070"), 3.0)
	# Cabeza, capucha y rostro.
	draw_circle(origin + Vector2(0, -17), 13.0, Color("b9aa8c"))
	draw_arc(origin + Vector2(0, -17), 13.5, PI, TAU, 18, Color("5c536c"), 6.0)
	draw_arc(origin + Vector2(0, -17), 10.5, 0.1, PI - 0.1, 14, Color(0.25, 0.2, 0.29, 0.65), 2.0)
	draw_circle(origin + Vector2(5 * facing, -18), 1.7, Color("e9d58f"))
	# Linterna: carcasa, núcleo y destello.
	var lantern := origin + Vector2(16 * facing, -4)
	draw_line(origin + Vector2(9 * facing, -3), lantern, Color("87909b"), 3.0)
	draw_rect(Rect2(lantern - Vector2(3, 4), Vector2(6, 9)), Color("7c633e"), true)
	draw_circle(lantern, 2.7, Color("ffd37a"))
	draw_circle(lantern, 7.0, Color(1.0, 0.72, 0.28, 0.08))


func _draw_shadow_ellipse(center: Vector2, radii: Vector2, color: Color) -> void:
	var points := PackedVector2Array()
	for index in range(24):
		var angle := TAU * float(index) / 24.0
		points.append(center + Vector2(cos(angle) * radii.x, sin(angle) * radii.y))
	draw_colored_polygon(points, color)


func _add_lantern_light() -> void:
	var gradient := Gradient.new()
	gradient.colors = PackedColorArray([Color(1.0, 0.74, 0.34, 0.85), Color(0.42, 0.44, 0.52, 0.0)])
	var texture := GradientTexture2D.new()
	texture.width = 256
	texture.height = 256
	texture.fill = GradientTexture2D.FILL_RADIAL
	texture.fill_from = Vector2(0.5, 0.5)
	texture.fill_to = Vector2(1.0, 0.5)
	texture.gradient = gradient
	var light := PointLight2D.new()
	light.texture = texture
	light.texture_scale = 2.1
	light.energy = 0.95
	light.position = Vector2(15, -5)
	light.shadow_enabled = true
	add_child(light)


func recover() -> void:
	global_position = last_safe_position if last_safe_position != Vector2.ZERO else world.get_spawn_position()
	velocity = Vector2.ZERO
	climbing = false


func reset_to(target: Vector2) -> void:
	global_position = target
	last_safe_position = target
	velocity = Vector2.ZERO
	climbing = false

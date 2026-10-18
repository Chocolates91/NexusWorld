extends Node2D

const API_URL := "http://127.0.0.1:8765/health"
const CaveWorldScript := preload("res://world/cave_world.gd")
const PlayerScript := preload("res://player/player.gd")
const CaveMapScript := preload("res://ui/cave_map.gd")
const VignetteScript := preload("res://ui/vignette.gd")
const TouchControlsScript := preload("res://ui/touch_controls.gd")

var world: Node2D
var player: CharacterBody2D
var agent_label: Label
var location_label: Label
var action_label: Label
var prompt_label: Label
var minimap: Control
var smoke_test := false
var api_connected := false
var movement_smoke_ok := false
var climbing_smoke_ok := false


func _ready() -> void:
	smoke_test = "--smoke-test" in OS.get_cmdline_user_args()
	RenderingServer.set_default_clear_color(Color("080b12"))
	world = CaveWorldScript.new()
	world.name = "CaveWorld"
	add_child(world)

	player = PlayerScript.new()
	player.name = "Explorer"
	player.position = world.get_spawn_position()
	add_child(player)
	_build_interface()
	if OS.has_feature("web") or OS.has_feature("preview"):
		api_connected = true
		agent_label.text = "Vista web: simulación local" if OS.has_feature("web") else "Vista Windows: simulación local"
	else:
		_connect_agent()

	if smoke_test:
		_exercise_player_movement()
		get_tree().create_timer(4.5).timeout.connect(_finish_smoke_test)


func _process(_delta: float) -> void:
	if not is_instance_valid(player):
		return
	location_label.text = world.describe_location(player.global_position)
	minimap.update_player_position(player.global_position)
	var nearby: String = world.get_interaction_prompt(player.global_position)
	prompt_label.visible = not nearby.is_empty()
	prompt_label.text = nearby
	if Input.is_action_just_pressed("interact"):
		var result: String = world.interact(player.global_position)
		if not result.is_empty():
			action_label.text = result
	var world_rect: Rect2 = world.get_world_rect()
	if player.global_position.y > world_rect.end.y + 80.0 or player.global_position.x < -40.0 or player.global_position.x > world_rect.end.x + 40.0:
		player.recover()
		action_label.text = "La senda te devuelve al último punto estable."


func _build_interface() -> void:
	var layer := CanvasLayer.new()
	add_child(layer)

	var panel := ColorRect.new()
	panel.position = Vector2(18, 18)
	panel.size = Vector2(350, 116)
	panel.color = Color(0.035, 0.045, 0.075, 0.88)
	layer.add_child(panel)

	var title := Label.new()
	title.position = Vector2(16, 10)
	title.text = "NEXUS WORLD  /  RED DE CAVERNAS"
	title.add_theme_color_override("font_color", Color("c5d7df"))
	title.add_theme_font_size_override("font_size", 17)
	panel.add_child(title)

	location_label = Label.new()
	location_label.position = Vector2(16, 39)
	location_label.add_theme_color_override("font_color", Color("8fb8bd"))
	panel.add_child(location_label)

	agent_label = Label.new()
	agent_label.position = Vector2(16, 63)
	agent_label.text = "Agente simulado: conectando…"
	agent_label.add_theme_color_override("font_color", Color("d6a85f"))
	panel.add_child(agent_label)

	action_label = Label.new()
	action_label.position = Vector2(16, 87)
	action_label.text = "Explora el sistema de galerías."
	action_label.add_theme_color_override("font_color", Color("a89ab8"))
	panel.add_child(action_label)

	var controls := Label.new()
	controls.position = Vector2(18, 495)
	controls.text = "A/D o ←/→  mover     W/S o ↑/↓  escalar     ESPACIO  saltar     E  interactuar"
	controls.add_theme_color_override("font_color", Color("91a0ac"))
	controls.add_theme_font_size_override("font_size", 13)
	controls.visible = not OS.has_feature("web") and not DisplayServer.is_touchscreen_available()
	layer.add_child(controls)

	prompt_label = Label.new()
	prompt_label.position = Vector2(335, 445)
	prompt_label.size = Vector2(290, 42)
	prompt_label.horizontal_alignment = HORIZONTAL_ALIGNMENT_CENTER
	prompt_label.add_theme_color_override("font_color", Color("ecd296"))
	prompt_label.add_theme_font_size_override("font_size", 16)
	layer.add_child(prompt_label)

	minimap = CaveMapScript.new()
	minimap.position = Vector2(710, 18)
	minimap.size = Vector2(232, 124)
	layer.add_child(minimap)

	var vignette := VignetteScript.new()
	layer.add_child(vignette)

	var touch_controls := TouchControlsScript.new()
	touch_controls.visible = OS.has_feature("web") or DisplayServer.is_touchscreen_available()
	layer.add_child(touch_controls)


func _connect_agent() -> void:
	var request := HTTPRequest.new()
	add_child(request)
	request.request_completed.connect(_on_agent_response.bind(request))
	var error := request.request(API_URL)
	if error != OK:
		agent_label.text = "Agente simulado: desconectado"


func _on_agent_response(
	_result: int,
	response_code: int,
	_headers: PackedStringArray,
	body: PackedByteArray,
	request: HTTPRequest
) -> void:
	if response_code == 200:
		var response = JSON.parse_string(body.get_string_from_utf8())
		if response is Dictionary and response.get("status") == "ok":
			api_connected = true
			agent_label.text = "Agente simulado: conectado (%s)" % response.get("provider", "mock")
			print("NEXUS_SMOKE_OK provider=%s" % response.get("provider", "mock"))
	if not api_connected:
		agent_label.text = "Agente simulado: servidor no iniciado"
	request.queue_free()


func _finish_smoke_test() -> void:
	var ladder_ok: bool = world.is_on_ladder(Vector2(695, 1450))
	var door_result: String = world.interact(Vector2(1810, 1242))
	var door_ok := door_result == "Compuerta de la falla abierta."
	var layout_errors: PackedStringArray = world.validate_layout()
	if not movement_smoke_ok:
		layout_errors.append("movement_failed")
	if not climbing_smoke_ok:
		layout_errors.append("climbing_failed")
	if not ladder_ok:
		layout_errors.append("ladder_detection_failed")
	if not door_ok:
		layout_errors.append("door_interaction_failed")
	if api_connected and movement_smoke_ok and climbing_smoke_ok and world.get_generated_platform_count() >= 20 and world.get_ladder_count() >= 10 and world.get_section_count() >= 7 and ladder_ok and door_ok and layout_errors.is_empty():
		print("NEXUS_PHYSICS_OK walk=true climb=true door=true")
		print("NEXUS_WORLD_OK platforms=%d ladders=%d sections=%d" % [world.get_generated_platform_count(), world.get_ladder_count(), world.get_section_count()])
		get_tree().quit(0)
	else:
		print("NEXUS_WORLD_FAILED errors=%s" % ",".join(layout_errors))
		get_tree().quit(1)


func _exercise_player_movement() -> void:
	await get_tree().create_timer(0.65).timeout
	var start_x: float = player.global_position.x
	Input.action_press("move_right")
	await get_tree().create_timer(0.45).timeout
	Input.action_release("move_right")
	await get_tree().create_timer(0.15).timeout
	movement_smoke_ok = player.global_position.x > start_x + 45.0 and player.is_on_floor()

	player.reset_to(Vector2(695, 1640))
	await get_tree().physics_frame
	var start_y: float = player.global_position.y
	Input.action_press("move_up")
	await get_tree().create_timer(0.55).timeout
	Input.action_release("move_up")
	climbing_smoke_ok = player.global_position.y < start_y - 45.0
	player.reset_to(world.get_spawn_position())


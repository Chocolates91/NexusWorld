extends Node2D

const API_URL := "http://127.0.0.1:8765/health"
const CaveWorldScript := preload("res://world/cave_world.gd")
const PlayerScript := preload("res://player/player.gd")

var world: Node2D
var player: CharacterBody2D
var agent_label: Label
var location_label: Label
var action_label: Label
var prompt_label: Label
var smoke_test := false
var api_connected := false


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
	_connect_agent()

	if smoke_test:
		get_tree().create_timer(4.0).timeout.connect(_finish_smoke_test)


func _process(_delta: float) -> void:
	if not is_instance_valid(player):
		return
	location_label.text = world.describe_location(player.global_position)
	var nearby: String = world.get_interaction_prompt(player.global_position)
	prompt_label.visible = not nearby.is_empty()
	prompt_label.text = nearby
	if Input.is_action_just_pressed("interact"):
		var result: String = world.interact(player.global_position)
		if not result.is_empty():
			action_label.text = result
	if player.global_position.y > 1540:
		player.reset_to(world.get_spawn_position())
		action_label.text = "Has regresado al refugio inicial."


func _build_interface() -> void:
	var layer := CanvasLayer.new()
	add_child(layer)

	var panel := ColorRect.new()
	panel.position = Vector2(18, 18)
	panel.size = Vector2(315, 112)
	panel.color = Color(0.035, 0.045, 0.075, 0.88)
	layer.add_child(panel)

	var title := Label.new()
	title.position = Vector2(16, 10)
	title.text = "NEXUS WORLD  /  SECTOR 01"
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
	layer.add_child(controls)

	prompt_label = Label.new()
	prompt_label.position = Vector2(335, 445)
	prompt_label.size = Vector2(290, 42)
	prompt_label.horizontal_alignment = HORIZONTAL_ALIGNMENT_CENTER
	prompt_label.add_theme_color_override("font_color", Color("ecd296"))
	prompt_label.add_theme_font_size_override("font_size", 16)
	layer.add_child(prompt_label)


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
	var ladder_ok: bool = world.is_on_ladder(Vector2(809, 900))
	var door_result: String = world.interact(Vector2(1470, 704))
	var door_ok := door_result == "Compuerta del pozo abierta."
	if api_connected and world.get_generated_platform_count() >= 8 and ladder_ok and door_ok:
		print("NEXUS_WORLD_OK platforms=%d" % world.get_generated_platform_count())
		get_tree().quit(0)
	else:
		print("NEXUS_WORLD_FAILED")
		get_tree().quit(1)


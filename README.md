# Nexus World

Prototipo experimental de un mundo virtual 2D con Godot y un controlador de agente en Python.

## Prototipo explorable — sector ampliado

El sector inicial es una cueva 2D de 4800 × 2200 píxeles diseñada como un laberinto vertical. Incluye:

- siete zonas conectadas con rutas altas, medias y profundas;
- 21 plataformas, 10 escaleras, pozos y pasos alternativos;
- movimiento lateral con aceleración, salto variable, tolerancia al borde y ascenso o descenso;
- cámara suave con anticipación de movimiento y recuperación desde caídas;
- dos compuertas operativas y un umbral reservado para una futura ampliación;
- interfaz con ubicación, cota, estado del agente y mapa del sector;
- roca irregular, estratos, siluetas de profundidad, polvo, estalactitas y cristales luminosos;
- personaje original con animación procedural, linterna y luz dinámica;
- API HTTP local con un proveedor simulado determinista.

La memoria SQLite, las acciones autónomas y la conversación dentro del juego pertenecen a los siguientes hitos.

## Requisitos

- Godot 4.x Standard (GDScript)
- Python 3.12 o posterior

No se necesita Ollama en esta fase.

## Ejecutar en Windows

Desde PowerShell, en la carpeta del proyecto:

```powershell
py -m agent.api.server
```

Deja esa ventana abierta. En otra ventana, abre `game/project.godot` con Godot y pulsa **F6** o **F5**. La interfaz debe mostrar `Agente simulado: conectado (mock)`.

También puedes ejecutar `start_windows.bat`. El script busca los comandos `godot` y `godot4`; si no los encuentra, intenta abrir el archivo del proyecto con la asociación de Windows.

## Controles

| Acción | Teclas |
| --- | --- |
| Mover | `A` / `D` o flechas izquierda / derecha |
| Escalar | `W` / `S` o flechas arriba / abajo |
| Saltar | `Espacio` |
| Atravesar una plataforma hacia abajo | `S` + `Espacio` |
| Abrir o examinar una compuerta | `E` |

## Pruebas

```powershell
py -m unittest discover -v
```

La prueba integrada necesita el servidor Python en ejecución:

```powershell
godot --headless --path game -- --smoke-test
```

Comprueba conexión HTTP, movimiento, aterrizaje, escalada, puertas y consistencia del mapa. Al terminar debe mostrar `NEXUS_SMOKE_OK` y `NEXUS_WORLD_OK`.

Los datos persistentes se guardarán más adelante dentro de `data/`, que Git ignora.

Consulta [docs/ADDING_SECTIONS.md](docs/ADDING_SECTIONS.md) para ampliar el mundo.

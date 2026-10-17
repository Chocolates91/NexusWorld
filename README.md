# Nexus World

Prototipo experimental de un mundo virtual 2D con Godot y un controlador de agente en Python.

## Primer prototipo explorable

El sector inicial es una cueva 2D de 2800 × 1550 píxeles diseñada como un pequeño laberinto vertical. Incluye:

- cuatro zonas conectadas a distintas alturas;
- diez plataformas, cinco escaleras y varios pozos;
- movimiento lateral, salto y ascenso o descenso;
- cámara suave que sigue al personaje;
- una compuerta operativa y un umbral reservado para una futura ampliación;
- interfaz con ubicación, profundidad y estado del agente simulado;
- gráficos provisionales originales dibujados en Godot, sin recursos externos;
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

Los datos persistentes se guardarán más adelante dentro de `data/`, que Git ignora.

Consulta [docs/ADDING_SECTIONS.md](docs/ADDING_SECTIONS.md) para ampliar el mundo.

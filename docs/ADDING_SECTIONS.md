# Ampliar el mundo

El prototipo genera el sector inicial desde `game/world/cave_world.gd`. El mapa usa coordenadas globales y cuatro tipos de piezas:

- `_add_platform(Rect2(...))` crea un suelo que puede atravesarse desde abajo;
- `_add_block(Rect2(...))` crea roca sólida;
- `_add_ladder(Rect2(...))` crea una ruta vertical;
- `_add_door(...)` crea una compuerta interactiva o un límite cerrado para un sector futuro.

`section_bounds` asigna nombres legibles a regiones del mapa. La interfaz usa esas regiones para mostrar dónde está el personaje.

Para añadir una sección:

1. Amplía `WORLD_SIZE` y los límites de la cámara del jugador si la sección sale del área actual.
2. Añade plataformas, bloques y conexiones dentro de `_build_layout()`.
3. Registra la nueva zona en `section_bounds`.
4. Coloca una puerta o escalera donde se conecte con el sector existente.
5. Ejecuta la carga sin interfaz y la prueba integrada descritas abajo.

```bash
godot --headless --path game --editor --quit
python -m agent.api.server
godot --headless --path game -- --smoke-test
```

La siguiente evolución prevista es trasladar la descripción de cada sección a recursos independientes de Godot. De ese modo cada región podrá desarrollarse y cargarse como una escena separada cuando el mundo supere el tamaño del prototipo.

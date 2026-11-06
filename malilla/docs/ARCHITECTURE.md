# Arquitectura técnica

Aplicación estática independiente en `malilla/`. No altera el prototipo Godot/Python existente en la raíz. Node 22.12+ (validado 24.22.1), Three.js 0.180.0, Vite 7.2.2. Dependencias fijadas por lockfile. Solo recursos de mismo origen; no requiere API, autenticación, backend ni CDN al ejecutarse.

- `data/source-plan.js`: contrato métrico extraído de la fuente, propuestas y catálogo.
- `architecture.js`: extrusiones de los polígonos reales, huecos sin tapar, hojas abiertas, carpinterías, rodapiés, techo independiente y cortinas.
- `furniture.js`: sustituciones procedurales de los objetos principales y decoración. No se altera la posición, giro o envolvente nominal del objeto fuente para diseñar otro piso. Ropa de cama y cortinas sobresalen unos centímetros como textiles reales.
- `legacy-furniture.js`: rutinas de objetos secundarios extraídas de la fuente, con la biblioteca de materiales nueva. Conserva escritorios, cuna, almacenaje y aparatos.
- `materials.js` y `public/textures/`: materiales físicos y mapas locales. `scripts/textures.py` regenera los mapas con semilla fija (NumPy y Pillow).
- `lighting.js`: sol con shadow map, luces rectangulares de ventana, ambiente PMREM, focos y conjunto limitado de lámparas próximas. La luz indirecta es una aproximación; las luces rectangulares no proyectan sombras en el renderizador WebGL de Three.
- `main.js`: SSAO, salida ACES/sRGB, SMAA, reflejos planares de ambos espejos, interfaz y capturas verificadas.
- `collision.js`, `data/colliders.js`, `navigation.js`: polígonos de muros, hojas, vidrios y muebles, círculo de radio 15 cm, resolución separada por eje y subpasos de máximo 3,5 cm. La cámara libre no lleva colisiones; el paseo sí. No hay salto ni mecánicas ajenas a la visita.

## Capturas

`capture()` cambia realmente la resolución del renderizador y del compositor a 3840 × 2160 con DPR 1. Actualiza proyección y efectos, compara `getDrawingBufferSize()` con la petición, genera PNG del búfer y restaura tamaños y cámara en `finally`. No captura el HTML de la interfaz ni amplía un PNG pequeño. Consulta límites reales de textura/renderbuffer y rechaza resoluciones no soportadas. La asignación GPU puede fallar aun estando por debajo de esos límites. No hay capturas por mosaicos: el SSAO y las reflexiones necesitan tratamiento de solapamiento para evitar costuras; no se anuncia esa prestación.

## Rendimiento

Alta: DPR hasta 1,5, sombra solar 2048². Ultra: DPR hasta 2, sombra solar 4096². Ambos conservan materiales, modelos y SSAO. Target HDR de media precisión y SMAA; MSAA del contexto para pase directo. Los espejos son reflejos de la escena, activos a menos de 3,5 m para evitar pases ocultos tras paredes. Mallas estáticas agrupadas por material y flags de sombra; hojas, transparencias y espejos conservados. Ocho luces puntuales de lámpara próximas al observador evitan decenas de luces en cada shader. Diez focos interiores, con sombras en tres focos de salón y en el sol. Las sombras estáticas se actualizan al cambiar la luz, el techo o la calidad; la vista quieta no vuelve a renderizar continuamente.

No existe path tracing, GI horneada, SSR general, SSS volumétrico o teselación/displacement. Normales y rugosidad no equivalen a esos efectos. El entorno PMREM representa un estudio luminoso aproximado; no reconstruye las vistas reales del inmueble.

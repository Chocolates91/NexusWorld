# Modelos, materiales y procedencia

| Recurso | Procedencia / derechos |
|---|---|
| HTML conservado, datos, catálogo, arte original y rutinas secundarias | Archivo aportado por el usuario. Se conserva su procedencia; no se presume ni impone una licencia nueva sobre él. |
| Sofá, cama y duvet, sillas curvas, cocina, sanitarios, plantas, carpinterías y decoración añadida | Geometría procedural creada en esta tarea. Sin descargas de modelos de terceros. |
| Oak, timber, linen, stone, plaster, rug: 18 mapas 2048² | Generador original `scripts/textures.py`, semillas fijas. No fotografías ni escaneados comerciales; no se presentan como tales. |
| Three.js y addons, incluidas geometrías, PMREM, SSAO, reflectores, controles y SMAA | MIT, distribución npm `three@0.180.0`; licencia incluida en el paquete. |
| Vite | MIT, herramienta de desarrollo/compilación. |
| Playwright | Apache-2.0, solo comprobación de desarrollo. Chromium es una instalación del entorno. |
| Tipografías | Arial/Helvetica y Georgia del sistema. Sin Google Fonts ni llamadas remotas. |

No se han añadido GLB de origen incierto ni HDRI sin licencia identificada. Blender está instalado, pero la geometría se genera directamente en Three.js para mantener dimensiones paramétricas y evitar modelos sustitutos genéricos. Las superficies tienen base color, normal y roughness. Los metales emplean metalness escalar; el sombreado de contacto usa SSAO y shadow maps. No se han añadido canales AO/height ficticios solo para completar una lista.

Escala: arquitectura UV métrica (muestra de parquet 2,4m, piedra 1,2m); superficies de muebles usan UV de sus primitivas y repetición controlada. Esta última no ofrece la uniformidad texel por metro de un unwrap artístico manual y se registra como limitación. Texturas 2K en los materiales principales; ampliar a 4K sin una fuente de más detalle no aportaría información.

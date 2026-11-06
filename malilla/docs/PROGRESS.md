# Registro de avances

## Hito 1 — Auditoría y contrato geométrico

- Copia original conservada; módulo extraído con coordenadas, aberturas, elementos fijos, catálogo y tres propuestas.
- Detectada y documentada la discrepancia 83,75 / 86,85 m².
- Base Vite/Three.js fijada con lockfile. Nueva aplicación separada del prototipo Godot de NexusWorld.

## Hito 2 — Vivienda ejecutable

- Reconstrucción de muros de origen, banda curva, pavimentos y huecos; carpintería, rodapiés, herrajes, techo y peto.
- 55 objetos de la propuesta A y 11 fijos. Sustituciones procedurales detalladas para sofá, cama, sillas, mesa de centro, TV, cocina, sanitarios y vegetación. Resto derivado de las rutinas originales y rematerializado.
- 18 mapas PBR originales 2048², escala métrica en arquitectura, costuras, duvet triangulado, paños de cortina plegados, decoración.
- Tres ambientes, luces de ventana rectangulares, sol y focos con sombras, entorno PMREM, SSAO, espejos planos, ACES y SMAA.
- Cámaras, paseo con colisiones de radio y subpasos, interfaz, perfiles y exportador con comprobación de búfer.
- Primera compilación de producción correcta. Primera captura real revisada: detectada vegetación demasiado próxima al punto de cámara inicial; corregido el encuadre.

## Hito 3 — Control visual y rendimiento

Se inició la revisión de todas las vistas, navegación y exportación PNG 4K. No se cerraron las fases únicamente por compilar. Los resultados finales se detallan en el hito siguiente y en QA.md.

## Hito 3 — Validación y correcciones guardadas

- Revisión real de 12 cámaras y 3 ambientes, seguida de correcciones de geometría de detalle, encuadres y equilibrio nocturno.
- Prueba funcional separada terminada: colisiones, movimiento, Ultra, techo, móvil y descarga PNG 3840 × 2160 real. 6/6 pruebas numéricas y de activos; build de producción correcto.
- Evidencia, límites y mejoras priorizadas en QA.md. Código formateado y scripts de revisión reproducibles.

| Fase solicitada | Estado concreto |
|---|---|
| 1 Auditoría | Contrato extraído, copia verificada y discrepancias documentadas. |
| 2 Arquitectura | Construcción ejecutable con coordenadas originales y acabados estimados. |
| 3 Mobiliario | Cobertura completa A + fijos; modelos procedurales principales mejorados. Calidad artística profesional pendiente. |
| 4 Materiales | PBR con 18 mapas 2K; sin escaneados ni unwrap artístico uniforme. |
| 5 Iluminación | Tres ambientes probados; GI solo aproximada. Horneado pendiente. |
| 6 Decoración | Objetos fuente conservados y detalles añadidos; vegetación aún procedural. |
| 7 Cámaras | 12 vistas y paseo con colisiones, pruebas ejecutadas. |
| 8 Renderizado | Alta/Ultra y PNG 4K verificados; mosaicos no implementados. |
| 9 Optimización | Agrupación estática, luces limitadas, reflejos próximos, sombras retenidas y render bajo demanda. Falta perfilado GPU real. |
| 10 QA | Capturas inspeccionadas, correcciones aplicadas y resultados guardados. No equivale a aprobación estética profesional. |

## Hito 4 — Referencias de baño y armario

Se incorporan los acabados observados en las cinco fotografías, manteniendo el contrato geométrico. Nuevos modelos para los sanitarios y el empotrado, nueva cámara de inspección del armario y cinco conjuntos de materiales locales. Se corrige la carcasa maciza que invadía la cubeta del lavabo. Referencias, decisiones y cotas estimadas documentadas en REFERENCES.md. La validación dirigida se registra al final de QA.md.

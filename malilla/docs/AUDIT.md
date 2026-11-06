# Auditoría del archivo de origen

Fuente: `legacy/Piso Malilla (3).html`, copia binaria del adjunto. El módulo `src/data/source-plan.js` contiene el bloque de datos del HTML sin alterar sus números ni sus propuestas. Prueba de paridad mediante ejecución del bloque original en un contexto Node aislado.

## Geometría

Metros; X hacia el este, Z hacia el sur (en el HTML se llama Y). 43 polígonos macizos, incluido el tramo curvo, más banda de ventana curva. Envolvente aproximadamente 10,71 × 9,69 m, no un rectángulo habitable. Esquina curva: centro (1,92; 8,10), radio 1,95. No se han corregido ni simplificado tabiques estrechos de 5 cm ni encuentros solapados ya presentes en el dibujo. No existe otro apartamento, fachada añadida, calle ni personaje.

8 huecos: entrada; dormitorios 3, 2 y 1; baños 2 y 1; cocina; doble hoja del cuarto de aguas. Correderas originales retraídas y batientes abiertas para poder recorrer los huecos. Entrada y aguas cerradas. Acristalamientos: 6 rectángulos y 2 segmentos de la esquina curva. Las correderas de terraza se representan parcialmente abiertas. El peto macizo original de 1 m se conserva.

**Estimaciones verticales heredadas**: techo 2,55 m; puertas 2,10 m; ventanas ordinarias antepecho 0,90 y dintel 2,20; baño 1,15/2,10; puertas terraza 0/2,20. Las medidas de carpintería, espesores de textiles, detalles, mecanismos, lámparas técnicas y acabados añadidos son estimaciones de visualización, no levantamiento de obra. La fuente atribuye las coordenadas a un plano del promotor con escala 5 m = 218 pt; no disponemos de ese plano para corroborarlo.

| Estancia | Área rotulada, m² |
|---|---:|
| Dormitorio 3, infantil | 9,31 |
| Baño 2 | 4,61 |
| Aguas | 1,35 |
| Vestíbulo | 1,95 |
| Distribuidor | 7,58 |
| Dormitorio 2, despacho | 8,49 |
| Cocina | 8,99 |
| Salón-comedor | 21,35 |
| Dormitorio 1, principal | 13,58 |
| Baño 1 | 3,43 |
| Terraza | 6,21 |

**Discrepancia de origen**: suma de las etiquetas = 86,85 m² incluyendo terraza, 80,64 sin terraza. No coincide con los aproximadamente 83,75 m² de la solicitud. No se ha reescalado ninguna estancia ni presentado esa cifra como medición verificada. Las áreas son etiquetas del HTML, no áreas recalculadas de los pavimentos.

## Mobiliario

11 elementos fijos: cocina 3,15 × 0,62; bañera 1,52 × 0,66; dos lavabos 0,60 × 0,46; dos WC 0,38 × 0,66; ducha 0,68 × 0,88; aerotermia 0,56 × 0,56; tres armarios empotrados. Se conservan centros, giros y tamaños de sus envolventes de origen.

Propuesta A (predeterminada del HTML): 55 objetos móviles. Salón: chaise 2,72 × 1,60, alfombra 2,30 × 1,60, mesa 1,20 × 0,60, TV 1,80 × 0,40, ventilador y lámpara. Comedor: mesa 1,60 × 0,90, cuatro sillas, lámpara, planta y estantería escalonada separadora. Infantil: cuna, cambiador, juguetero, butaca y alfombra. Despacho: escritorio con dos monitores, silla, estantería y lámpara. Principal: cama 1,60 × 2,10, dos mesillas y cómoda. Distribuidor: librería y zapatero. Cocina: barra, dos taburetes y colgantes, frigorífico. Aguas: lavadora. Terraza: bistró, dos sillas, alfombra, olivo, dos macetas, dos faroles y guirnalda. Además cuadros y lámparas de sobremesa.

Conservados también catálogo y propuestas B (acuario) y C (celosía, cabecero ovalado y comedor ovalado) en el módulo fuente. El visor nuevo presenta A; la edición y selección de propuestas sigue en el HTML original, dependiente de su CDN. No se arrastran datos privados de localStorage ni la integración `window.claude` a la aplicación nueva.

## Auditoría de todo el HTML

Se revisaron los bloques de estilo/interfaz, datos geométricos, catálogo y propuestas, detección de colisiones/giro de puertas, planta 2D y cotas, importmap Three 0.160, visor/mobiliario/materiales, cámara de paseo, inspector/editor, persistencia local y opcional remota, arranque responsive. La nueva aplicación usa únicamente el contrato arquitectónico y las rutinas de mobiliario indicadas en `legacy-furniture.js`; no necesita servicios de base de datos, fuentes remotas ni credenciales. `legacy/` conserva las funciones secundarias intactas.

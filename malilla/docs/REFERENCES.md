# Ajuste a las referencias fotográficas

Se utilizaron las cinco fotografías aportadas en la continuación de la conversación como referencia visual. No se utilizan como texturas: los nuevos mapas se generan con `scripts/reference-textures.py`. Las imágenes de QA son capturas del visor.

## Observado y aplicado

| Referencia | Cambio en la representación |
|---|---|
| Baño con ducha e inodoro contiguos | Se aplica al Baño 1 del HTML por coincidencia de disposición: ducha y ventana en un extremo, WC contiguo, lavabo en la pared opuesta. La asignación es una inferencia, no una identificación certificada. |
| Revestimiento blanco de formato horizontal | Porcelánico blanco, juntas estrechas y discretas. Se conserva el hueco de ventana; desaparece el montante central añadido que no aparece en la referencia. Hoja blanca, junta de vidrio, bisagras y manilla. |
| Paño de madera de suelo a techo en la ducha | Cerámica de efecto madera con veta vertical, ubicada en el tramo de pared sur que limita el plato. No se cambia ningún tabique. |
| Plato claro y desagüe cuadrado | Plato de resina con pendiente leve, rejilla perforada y hueco real; columna termostática cromada con teleducha, flexible y rociador perforado sobre el plato. La columna anterior en un borde libre se corrige y queda fijada al muro. |
| Ducha sin mampara en las fotos | Se retira la mampara añadida en este baño para representar lo observado. El plano de partida y las aberturas arquitectónicas permanecen intactos. |
| Lavabo rectangular encastrado | Cerámica de una pieza con reborde y cubeta, desagüe, rebosadero y grifo central de palanca. Se sustituye el lavabo de sobreponer propuesto en la primera entrega. |
| Mueble de lavabo de roble claro | Carcasa hueca, una puerta lateral, dos cajones a la derecha, franja superior, tiradores integrados y patas metálicas. Se evita que el cuerpo del mueble atraviese el interior de la cubeta. |
| Suelo blanco con vetas cálidas | Nuevo material de porcelánico inspirado en piedra con veta ocre, solo en Baño 1. Base color 4096²; normal y rugosidad 2048². No es el escaneado exacto de la baldosa fotografiada. |
| Inodoro de tapa cerrada y cuerpo continuo | Perfil cerámico carenado, asiento/tapa redondeados, cisterna y pulsador doble; proporciones del elemento fijo original. |
| Armario blanco abierto | Los tres empotrados adoptan puertas blancas con rebaje discreto, interior beige, balda alta y barra metálica. Un módulo del principal queda abierto con bisagras visibles y colisiones en ambas hojas. |
| Pavimento junto al armario | Acabado del parquet menos anaranjado, con roble claro desaturado. Su continuidad al resto de zonas de madera es una hipótesis de acabado; no se deduce de la foto que todas las habitaciones tengan exactamente la misma tarima. |

## Estimaciones y límites

Las anchuras, fondos, alturas nominales, centros y giros de los elementos fijos siguen siendo los del HTML. No se han tomado medidas de una persona ni de la perspectiva de las fotos. El formato 60 × 30 cm del azulejo, 15 × 60 cm de la cerámica de madera, altura/diámetro del rociador, cotas de accesorios y despiece de carpintería son **estimaciones visuales**. `src/data/reference-spec.js` las identifica como tales.

La foto del armario no permite identificar qué dormitorio es. La apertura de un módulo del armario principal, su ángulo de 105° y la distribución interior repetida en otros empotrados son una propuesta de representación. Las envolventes fijas del plano se conservan. Las hojas abiertas añaden únicamente su espesor y giro, con polígonos de colisión asociados; no son puertas animadas ni un editor nuevo.

Las fotografías muestran el baño antes de instalar espejo y luminaria. Se mantiene un espejo como propuesta de interior terminado, ahora rectangular y sin marco decorativo grueso; no se presenta como un elemento confirmado por la fotografía. No se reproducen los cables sueltos de obra. El resto de acabados del Baño 2 no se homogeneiza con este baño sin referencia.

Los mapas son interpretaciones procedurales originales, no materiales fotografiados ni productos de un catálogo identificado. El color observado varía con exposición, balance de blancos y luz de cada fotografía; no es una especificación de fabricante.

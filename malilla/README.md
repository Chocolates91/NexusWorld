# Malilla — Interior 03

Visor arquitectónico de la vivienda contenida en el HTML aportado, con su distribución y mobiliario originales. Vive en esta carpeta y no reemplaza el proyecto NexusWorld.

```sh
cd /workspace/NexusWorld/malilla
npm ci
npm run dev
```

El servidor se limita a loopback para desarrollo privado. Para compilar: `npm run build`. Para comprobar geometría y recursos: `npm test`. Para QA visual con el Chromium instalado: `npm run test:visual` con el servidor en ejecución. Los resultados se guardan en `artifacts/` (ignorado). `CHROMIUM_PATH` y `APP_URL` permiten configurar el ejecutable y destino local.

Controles: arrastrar gira, rueda acerca, botón derecho desplaza. En Caminar: WASD/flechas, arrastrar para mirar, doble clic bloquea el puntero y Esc lo libera. Selector de estancias, ambientes Día/Atardecer/Noche, perfiles Alta/Ultra, exposición, techo y pantalla completa. Captura 4K genera un PNG de **3840 × 2160** cuando la GPU lo admite, sin interfaz superpuesta.

La propuesta A es la vista inicial del archivo. El editor original sigue intacto en `legacy/Piso Malilla (3).html`; necesita su CDN y es una aplicación separada. Las tres propuestas están conservadas en el módulo de datos.

Consulta [auditoría](docs/AUDIT.md), [arquitectura](docs/ARCHITECTURE.md), [activos y licencias](docs/ASSETS-LICENSES.md), [registro](docs/PROGRESS.md) y [QA y limitaciones](docs/QA.md). No se ha desplegado públicamente.

Las referencias fotográficas de baño y armario se incorporan en la misma rama. Véase [correspondencia y estimaciones](docs/REFERENCES.md). La vista «Armario principal» permite inspeccionar su interior. `node scripts/reference-qa.mjs` revisa las cinco vistas afectadas; `CAPTURE_4K=1 node scripts/reference-qa.mjs` también verifica un PNG 4K del baño.

Las referencias de entrada y salón añaden la vista «Entrada · detalles», registros técnicos, tres paños de terraza y una iluminación diurna revisada. `CAPTURE_4K=1 node scripts/entry-qa.mjs` verifica las colisiones y exporta el salón. El panorama de vegetación es ilustrativo y conserva su licencia local.

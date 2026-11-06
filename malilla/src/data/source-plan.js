// Extracted verbatim from the supplied HTML; coordinates are metres, x east / z south.
const H = 2.55;           // altura libre estimada
const DOOR_H = 2.10;
const ARC_C = [1.92, 8.10], ARC_R = 1.95;
const arc = (a0, a1, n) => { const p=[]; for(let i=0;i<=n;i++){ const a=(a0+(a1-a0)*i/n)*Math.PI/180; p.push([ARC_C[0]+ARC_R*Math.cos(a), ARC_C[1]+ARC_R*Math.sin(a)]);} return p; };

const WALLS = [
  // fachada norte
  [0,0.08,0.65,0.6],[0.25,0.35,8.94,0.6],[3.51,0.6,6.49,0.64],[9.94,0.35,10.71,0.6],
  // fachada este
  [10.45,0.6,10.71,1.49],[10.59,1.49,10.71,5.49],[10.47,5.49,10.71,8.23],[10.42,8.23,10.71,9.97],
  // fachada oeste
  [0,0.6,0.25,1.59],[0,3.19,0.25,4.06],[0,5.37,0.25,7.35],[0.25,5.49,0.58,6.01],
  // baños, aguas y distribuidor
  [3.41,0.6,3.51,2.34],[3.51,2.19,3.56,2.29],[4.46,2.19,7.54,2.29],[6.49,0.6,6.59,2.21],[7.44,2.16,7.54,2.29],
  // franja de armarios entre dormitorios 2 y 3
  [3.41,3.24,3.51,4.0],[0.25,3.28,1.95,3.36],[1.72,3.36,1.87,3.95],[1.72,3.87,3.41,3.95],
  // dormitorio 2 / dormitorio 1
  [3.41,4.92,3.51,6.5],[0.25,6.4,3.41,6.5],[3.51,5.19,3.56,5.29],[4.48,5.19,5.23,6.11],[4.54,6.11,4.64,6.22],
  // cocina
  [5.13,3.48,5.23,5.19],[5.13,6.11,5.23,8.0],[5.13,3.48,6.06,3.58],[6.96,3.48,7.6,3.58],[7.5,3.58,7.6,5.23],
  [7.04,5.23,7.6,5.33],[7.04,5.33,7.14,7.41],[7.04,7.41,7.6,8.23],
  // baño 1 y fachada sur
  [3.46,8.0,3.56,9.79],[4.46,8.0,5.83,8.09],[5.64,8.09,5.83,8.23],[5.64,8.23,5.91,8.85],[5.64,9.35,6.23,10.04],
  [5.83,8.23,6.13,8.48],[3.46,9.74,5.64,10.04],[6.98,8.23,7.87,8.48]
].map(r => ({poly: rectPoly(r), h: H}));
// esquina curva: tramo macizo y tramo con ventanas
const P_SOLID = [[1.25,9.64],[1.6,9.75],[1.66,9.44],[2.36,9.44],[2.36,9.79],[3.46,9.79],[3.46,10.04],...arc(90,110,6)];
const P_WINBAND = [[0.25,8.21],[0.58,9.07],[1.25,9.64],...arc(110,180,14),[0,8.1],[0,8.21]];
WALLS.push({poly:P_SOLID,h:H});
const RAILING = {poly: rectPoly([6.23,9.94,10.42,10.04]), h:1.0};

const DOORS = [ // huecos de paso: [x0,y0,x1,y1]
  {r:[8.94,0.35,9.94,0.6], name:'Entrada', swing:{c:[9.94,0.6], r:0.92, a0:180, a1:90}},
  {r:[3.41,2.34,3.51,3.24], name:'Dormitorio 3', slide:true},
  {r:[3.56,2.19,4.46,2.29], name:'Baño 2', slide:true},
  {r:[7.44,0.6,7.54,2.16], name:'Cuarto de aguas', swing2:[{c:[7.54,0.62],r:0.76,a0:90,a1:0},{c:[7.54,2.16],r:0.76,a0:-90,a1:0}], closed:true},
  {r:[6.06,3.48,6.96,3.58], name:'Cocina', slide:true},
  {r:[3.41,4.0,3.51,4.92], name:'Dormitorio 2', swing:{c:[3.46,4.0], r:0.87, a0:90, a1:180}},
  {r:[3.56,5.19,4.48,5.29], name:'Dormitorio 1', swing:{c:[4.48,5.24], r:0.88, a0:180, a1:90}},
  {r:[3.56,8.0,4.46,8.09], name:'Baño 1', slide:true},
];
const WINDOWS = [ // r: hueco; sill/head: alturas estimadas; glass: línea del vidrio
  {r:[0,1.59,0.25,3.19], sill:0.9, head:2.2},
  {r:[0,4.06,0.25,5.37], sill:0.9, head:2.2},
  {r:[0,7.35,0.25,8.21], sill:0.9, head:2.2},
  {r:[5.64,8.85,5.91,9.35], sill:1.15, head:2.1},
  {r:[6.13,8.23,6.98,8.48], sill:0, head:2.2, door:true},
  {r:[7.87,8.23,10.42,8.48], sill:0, head:2.2, door:true},
];
const CURVED_GLASS = [[[0.2,8.22],[0.53,9.07]],[[0.57,9.11],[1.21,9.68]]];
const FOOTPRINT = [[0,0.35],[10.71,0.35],[10.71,10.04],...arc(90,180,24),[0,8.1]];
const FLOORS = [
  {name:'tile', poly:[[5.23,3.58],[7.5,3.58],[7.5,5.23],[7.04,5.23],[7.04,8.23],[5.83,8.23],[5.83,8.0],[5.23,8.0]]},
  {name:'bath', poly:rectPoly([3.51,0.64,6.49,2.19])},
  {name:'bath', poly:rectPoly([3.56,8.09,5.64,9.74])},
  {name:'ext',  poly:rectPoly([5.91,8.48,10.42,9.94])},
];
const ROOMS = [
  {n:'Dormitorio 3', a:'9,31', p:[1.75,2.25]}, {n:'Baño 2', a:'4,61', p:[4.9,1.62]}, {n:'Aguas', a:'1,35', p:[7.0,0.95]},
  {n:'Vestíbulo', a:'1,95', p:[9.55,1.3]}, {n:'Distribuidor', a:'7,58', p:[4.15,2.85]}, {n:'Dormitorio 2', a:'8,49', p:[1.75,4.55]},
  {n:'Cocina', a:'8,99', p:[6.35,4.15]}, {n:'Salón-comedor', a:'21,35', p:[8.95,5.0]}, {n:'Dormitorio 1', a:'13,58', p:[2.3,8.75]},
  {n:'Baño 1', a:'3,43', p:[4.25,8.55]}, {n:'Terraza', a:'6,21', p:[9.4,9.45]},
];
// elementos fijos (ya instalados o del plano): no se mueven
const FIXED = [
  {id:'f-coc', type:'kitchen', name:'Encimera de cocina', x:5.54, y:6.425, w:3.15, d:0.62, h:0.9, rot:270, color:'#5b4a3f'},
  {id:'f-ban', type:'tub', name:'Bañera', x:6.145, y:1.415, w:1.52, d:0.66, h:0.55, rot:90, color:'#ffffff'},
  {id:'f-lav2', type:'sink', name:'Lavabo', x:4.03, y:0.875, w:0.6, d:0.46, h:0.85, rot:0, color:'#a88b6c'},
  {id:'f-wc2', type:'wc', name:'Inodoro', x:4.8, y:0.97, w:0.38, d:0.66, h:0.78, rot:0, color:'#ffffff'},
  {id:'f-wc1', type:'wc', name:'Inodoro', x:5.3, y:8.44, w:0.38, d:0.66, h:0.78, rot:90, color:'#ffffff'},
  {id:'f-duc', type:'shower', name:'Plato de ducha', x:5.3, y:9.28, w:0.68, d:0.88, h:0.04, rot:0, color:'#f2efe9'},
  {id:'f-lav1', type:'sink', name:'Lavabo', x:4.03, y:9.5, w:0.6, d:0.46, h:0.85, rot:180, color:'#a88b6c'},
  {id:'f-aer', type:'boiler', name:'Aerotermia (agua caliente)', x:6.89, y:1.93, w:0.56, d:0.56, h:1.85, rot:0, color:'#f4f4f2'},
  {id:'f-ar3', type:'builtin', name:'Armario empotrado', x:2.64, y:3.575, w:1.54, d:0.59, h:H, rot:180, color:'#f1efea'},
  {id:'f-ar2', type:'builtin', name:'Armario empotrado', x:0.985, y:3.655, w:1.47, d:0.59, h:H, rot:0, color:'#f1efea'},
  {id:'f-ar1', type:'builtin', name:'Armario empotrado', x:4.885, y:7.11, w:1.78, d:0.49, h:H, rot:90, color:'#f1efea'},
];
function rectPoly([x0,y0,x1,y1]){ return [[x0,y0],[x1,y0],[x1,y1],[x0,y1]]; }

/* ───────────────────────── Catálogo ───────────────────────── */
const PAL = ['#e6dccd','#d6c2a3','#c49a6c','#b5603b','#93432a','#c98c3a','#a87a52','#6b4a33','#8c9a78','#7f8a5c','#3a3532','#f1ebe0'];
const CATALOG = [
  ['Salón', [
    ['chaise','Sofá con chaise longue',2.70,1.60,0.80,'#e6dccd'], ['sofa','Sofá 3 plazas',2.10,0.95,0.82,'#e6dccd'],
    ['sofa','Sofá 2 plazas',1.70,0.90,0.82,'#e6dccd'], ['armchair','Butaca',0.80,0.85,0.80,'#c49a6c'],
    ['coffee','Mesa de centro rústica',1.20,0.60,0.40,'#8a5c3b'], ['tvunit','Mueble TV + tele 55"',1.80,0.40,0.50,'#a87a52'],
    ['stepshelf','Estantería escalonada',1.20,0.35,1.40,'#a87a52'], ['slats','Celosía de listones',1.50,0.05,2.55,'#a87a52'], ['aquarium','Acuario 120 cm',1.20,0.40,1.35,'#6b4a33'],
    ['shelf','Estantería',0.80,0.35,1.90,'#a87a52'], ['sideboard','Aparador',1.60,0.42,0.80,'#a87a52'],
    ['rug','Alfombra de yute 160×230',2.30,1.60,0.01,'#b8956a'], ['rug','Alfombra 200×300',3.00,2.00,0.01,'#c9ad86'],
    ['fan','Ventilador de techo con luz',1.32,1.32,0.35,'#a87a52'], ['pendant','Lámpara de papel colgante',0.90,0.90,0.70,'#f1ebe0'],
    ['lamp','Lámpara de pie',0.40,0.40,1.55,'#f1ebe0'], ['tablelamp','Lámpara de mesa',0.28,0.28,0.45,'#c98c3a',0.75], ['art','Cuadro Dune',0.80,0.03,0.60,'#c98c3a',1.3],
    ['plant','Planta grande',0.50,0.50,1.30,'#7f8a5c'] ]],
  ['Comedor', [
    ['ovaltable','Mesa ovalada 160×90',1.60,0.90,0.75,'#a87a52'], ['table','Mesa 160×90',1.60,0.90,0.75,'#a87a52'], ['table','Mesa 140×80',1.40,0.80,0.75,'#a87a52'],
    ['roundtable','Mesa redonda Ø110',1.10,1.10,0.75,'#a87a52'], ['chair','Silla',0.45,0.50,0.85,'#c49a6c'] ]],
  ['Dormitorio', [
    ['bed','Cama 150×200',1.60,2.10,0.55,'#e6dccd'], ['bed','Cama 135×190',1.45,2.00,0.55,'#e6dccd'],
    ['bed','Cama 105×190',1.15,2.00,0.55,'#e6dccd'], ['bed','Cama 90×190',1.00,2.00,0.55,'#e6dccd'],
    ['headboard','Cabecero ovalado',1.80,0.07,1.50,'#d6b58e',0.12], ['nightstand','Mesita de noche',0.45,0.40,0.50,'#a87a52'], ['dresser','Cómoda de cajones',1.00,0.45,0.85,'#a87a52'],
    ['wardrobe','Armario 100 cm',1.00,0.60,2.00,'#e6dccd'] ]],
  ['Infantil', [
    ['crib','Cuna 60×120',0.66,1.26,0.90,'#d9c3a0'], ['changer','Cómoda cambiador',0.80,0.50,0.90,'#f1ebe0'],
    ['cubes','Juguetero de cubos',1.05,0.35,0.75,'#e9e0d2'], ['armchair','Butaca de lactancia',0.75,0.80,0.85,'#d6c2a3'],
    ['rug','Alfombra infantil',1.40,1.00,0.01,'#d9a46b'], ['nightlight','Lámpara quitamiedos',0.18,0.18,0.22,'#f1ebe0',0.75] ]],
  ['Despacho', [
    ['deskpc','Escritorio con 2 pantallas',1.60,0.70,0.75,'#a87a52'], ['desk','Escritorio 120×60',1.20,0.60,0.75,'#a87a52'],
    ['officechair','Silla de oficina',0.65,0.65,1.10,'#3a3532'], ['sofabed','Sofá cama',1.90,0.90,0.85,'#c49a6c'] ]],
  ['Pasillo y entrada', [
    ['shoerack','Zapatero alto',0.90,0.35,1.80,'#e9e0d2'], ['shelf','Librería estrecha',2.40,0.25,2.00,'#a87a52'] ]],
  ['Cocina y aguas', [
    ['fridge','Frigorífico combi',0.60,0.65,1.85,'#d9dcdf'], ['washer','Lavadora',0.60,0.60,0.85,'#f5f3ee'],
    ['washer','Secadora',0.60,0.60,0.85,'#f5f3ee'], ['bar','Barra de desayuno',1.20,0.40,1.05,'#a87a52'],
    ['barstool','Taburete alto',0.38,0.38,0.75,'#c49a6c'], ['pendant2','Lámpara colgante pequeña',0.30,0.30,0.75,'#b5603b'], ['stool','Taburete',0.40,0.40,0.65,'#3a3532'] ]],
  ['Terraza', [
    ['bistro','Mesa bistró Ø60',0.60,0.60,0.72,'#3a3532'], ['bistrochair','Silla bistró',0.45,0.50,0.82,'#3a3532'],
    ['lantern','Farolillo',0.25,0.25,0.45,'#3a3532'], ['garland','Guirnalda de luces',4.00,0.05,2.35,'#ffd089'],
    ['olive','Olivo en maceta',0.60,0.60,1.60,'#8a9467'], ['plant','Maceta',0.40,0.40,0.80,'#8c9a78'],
    ['lounger','Tumbona',0.65,1.90,0.40,'#d6c2a3'], ['rug','Alfombra exterior',1.80,1.10,0.01,'#c49a6c'] ]],
  ['Otros', [
    ['shoe','Mueble bajo',0.80,0.30,1.00,'#e9e0d2'], ['box','Bloque a medida',1.00,0.50,0.80,'#b9b3a9'] ]],
];
const NO_COLLIDE = new Set(['rug','pendant','garland','fan','pendant2','art','tablelamp','nightlight','headboard']);
const CEIL = new Set(['pendant','garland','fan','pendant2']);
const ONTOP = new Set(['art','tablelamp','nightlight','headboard']);
const FLIP = new Set(['chaise','stepshelf']);
const SEATS = new Set(['chair','officechair','stool','bistrochair','barstool']), TABLES = new Set(['table','ovaltable','desk','deskpc','roundtable','bistro','bar']);
const tucks = (a,b) => (SEATS.has(a.type)&&TABLES.has(b.type)) || (SEATS.has(b.type)&&TABLES.has(a.type));

/* Distribuciones de partida: dos versiones idénticas salvo el separador del salón */
const TPL_COMMON = [
  // salón
  ['chaise','Sofá con chaise longue',9.67,6.86,90,2.72,1.60,0.80,'#e6dccd',1],
  ['rug','Alfombra de yute',8.75,7.0,90,2.30,1.60,0.01,'#b8956a'],
  ['coffee','Mesa de centro rústica',8.7,7.25,90,1.20,0.60,0.40,'#8a5c3b'],
  ['tvunit','Mueble TV + tele 55"',7.35,6.5,270,1.80,0.40,0.50,'#a87a52'],
  ['fan','Ventilador de techo con luz',9.7,7.1,0,1.32,1.32,0.35,'#a87a52'],
  ['lamp','Lámpara de pie',9.28,8.0,0,0.40,0.40,1.55,'#f1ebe0'],
  // comedor
  ['table','Mesa 160×90',9.79,3.6,0,1.60,0.90,0.75,'#a87a52'],
  ['chair','Silla',9.4,3.0,0,0.45,0.50,0.85,'#c49a6c'], ['chair','Silla',10.15,3.0,0,0.45,0.50,0.85,'#c49a6c'],
  ['chair','Silla',9.4,4.2,180,0.45,0.50,0.85,'#c49a6c'], ['chair','Silla',10.15,4.2,180,0.45,0.50,0.85,'#c49a6c'],
  ['pendant','Lámpara de papel colgante',9.79,3.6,0,0.70,0.70,0.80,'#f1ebe0'],
  ['plant','Planta grande',7.9,4.9,0,0.50,0.50,1.30,'#7f8a5c'],
  // dormitorio 3: habitación infantil
  ['crib','Cuna 60×120',0.95,0.94,90,0.66,1.26,0.90,'#d9c3a0'],
  ['changer','Cómoda cambiador',2.3,0.86,0,0.80,0.50,0.90,'#f1ebe0'],
  ['cubes','Juguetero de cubos',3.235,1.35,90,1.05,0.35,0.75,'#e9e0d2'],
  ['armchair','Butaca de lactancia',0.66,2.55,270,0.75,0.80,0.85,'#d6c2a3'],
  ['rug','Alfombra infantil',1.9,2.05,0,1.40,1.00,0.01,'#d9a46b'],
  // dormitorio 2: despacho
  ['deskpc','Escritorio con 2 pantallas',1.75,6.05,180,1.60,0.70,0.75,'#a87a52'],
  ['officechair','Silla de oficina',1.75,5.35,0,0.65,0.65,1.10,'#3a3532'],
  ['shelf','Estantería',3.235,5.5,90,0.80,0.35,1.90,'#a87a52'],
  ['lamp','Lámpara de pie',2.95,6.15,0,0.40,0.40,1.55,'#f1ebe0'],
  // dormitorio 1 (principal)
  ['bed','Cama 150×200',1.55,7.55,0,1.60,2.10,0.55,'#e6dccd'],
  ['nightstand','Mesita de noche',0.5,6.72,0,0.45,0.40,0.50,'#a87a52'], ['nightstand','Mesita de noche',2.6,6.72,0,0.45,0.40,0.50,'#a87a52'],
  ['dresser','Cómoda de cajones',2.91,9.565,180,1.00,0.45,0.85,'#a87a52'],
  // pasillo
  ['shelf','Librería estrecha',5.8,2.415,0,2.40,0.25,2.00,'#a87a52'],
  ['shoerack','Zapatero alto',4.955,4.3,90,0.90,0.35,1.80,'#e9e0d2'],
  // luz cálida y cuadros
  ['tablelamp','Lámpara de mesa',7.35,5.78,0,0.28,0.28,0.45,'#c98c3a',0,0.5],
  ['tablelamp','Lámpara de mesa',2.98,9.6,0,0.28,0.28,0.45,'#c98c3a',0,0.85],
  ['nightlight','Lámpara quitamiedos',3.235,1.0,0,0.18,0.18,0.22,'#f1ebe0',0,0.75],
  ['tablelamp','Lámpara de mesa',1.07,6.28,0,0.26,0.26,0.42,'#b5603b',0,0.75],
  ['art','Cuadro',10.455,7.28,90,1.00,0.03,0.70,'#c98c3a',0,1.25],
  ['art','Cuadro',7.615,4.1,270,0.60,0.03,0.80,'#b5603b',0,1.3],
  ['art','Cuadro',1.55,6.515,0,1.20,0.03,0.50,'#d6c2a3',0,1.35],
  ['art','Cuadro',1.75,6.385,180,0.70,0.03,0.50,'#93432a',0,1.55],
  ['art','Cuadro',5.6,3.465,180,0.50,0.03,0.70,'#c49a6c',0,1.35],
  // cocina: barra de desayuno
  ['bar','Barra de desayuno',7.3,4.4,90,1.20,0.40,1.05,'#a87a52'],
  ['barstool','Taburete alto',6.86,4.1,90,0.38,0.38,0.75,'#c49a6c'], ['barstool','Taburete alto',6.86,4.7,90,0.38,0.38,0.75,'#c49a6c'],
  ['pendant2','Lámpara colgante pequeña',7.3,4.1,0,0.30,0.30,0.75,'#b5603b'], ['pendant2','Lámpara colgante pequeña',7.3,4.7,0,0.30,0.30,0.75,'#b5603b'],
  // cocina y aguas
  ['fridge','Frigorífico combi',5.555,4.5,270,0.60,0.65,1.85,'#d9dcdf'],
  ['washer','Lavadora',6.9,1.05,90,0.60,0.60,0.85,'#f5f3ee'],
  // terraza
  ['rug','Alfombra exterior',7.45,9.25,0,1.80,1.10,0.01,'#c49a6c'],
  ['bistro','Mesa bistró Ø60',7.45,9.25,0,0.60,0.60,0.72,'#3a3532'],
  ['bistrochair','Silla bistró',6.9,9.25,270,0.45,0.50,0.82,'#3a3532'], ['bistrochair','Silla bistró',8.0,9.25,90,0.45,0.50,0.82,'#3a3532'],
  ['olive','Olivo en maceta',10.05,8.88,0,0.60,0.60,1.60,'#8a9467'],
  ['plant','Maceta',10.12,9.62,0,0.40,0.40,0.80,'#7f8a5c'], ['plant','Maceta',6.45,9.68,0,0.40,0.40,0.80,'#8c9a78'],
  ['lantern','Farolillo',9.55,9.7,0,0.25,0.25,0.45,'#3a3532'], ['lantern','Farolillo',8.6,9.75,0,0.22,0.22,0.35,'#3a3532'],
  ['garland','Guirnalda de luces',8.2,9.0,0,4.00,0.05,2.35,'#ffd089'],
];
const TPL_SEP = {
  A: [['stepshelf','Estantería escalonada',9.84,5.315,0,1.50,0.35,1.75,'#a87a52']],
  B: [['aquarium','Acuario 120 cm',9.99,5.29,0,1.20,0.40,1.35,'#6b4a33']],
};
// Versión C: celosía de listones, chaise junto al ventanal, cabecero ovalado y mesa ovalada
const TPL_C_EXTRA = [
  ['slats','Celosía de listones',9.84,5.465,0,1.50,0.05,H,'#a87a52'],
  ['headboard','Cabecero ovalado',1.55,6.535,0,1.80,0.07,1.50,'#d6b58e',0,0.12],
];
function tplC(){ return TPL_COMMON.filter(t=>!(t[0]==='art' && t[2]===1.55)).map(t=>{ const q=[...t];
  if(q[0]==='chaise') q[9]=0;
  if(q[1]==='Mesa de centro rústica') q[2]=8.55;
  if(q[0]==='lamp' && q[2]===9.28){ q[2]=9.25; q[3]=5.75; }
  if(q[0]==='table'){ q[0]='ovaltable'; q[1]='Mesa ovalada 160×90'; q[2]=9.69; q[3]=3.3; }
  if(q[0]==='chair' && q[2]>9){ q[2]=q[2]<9.8?9.3:10.08; q[3]=q[3]<3.5?2.7:3.9; }
  if(q[0]==='pendant' && q[3]<5){ q[2]=9.69; q[3]=3.3; }
  if(q[0]==='bed'){ q[3]=7.62; q[11]={nohb:true}; }
  return q; }).concat(TPL_C_EXTRA); }
function template(kind){
  if (kind === 'empty') return [];
  const L = kind==='C' ? tplC() : [...TPL_COMMON, ...TPL_SEP[kind==='B'?'B':'A']];
  return L.map(([type,name,x,y,rot,w,d,h,color,flip,elev,extra]) => ({id:uid(), type,name,x,y,rot,w,d,h,color, ...(flip?{flip:true}:{}), ...(elev?{elev}:{}), ...(extra||{})}));
}


function uid(){return "source-"+(++uid.counter)}; uid.counter=0;

export { H, DOOR_H, ARC_C, ARC_R, WALLS, P_SOLID, P_WINBAND, RAILING, DOORS, WINDOWS, CURVED_GLASS, FOOTPRINT, FLOORS, ROOMS, FIXED, TPL_COMMON, TPL_SEP, template, rectPoly };

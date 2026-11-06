import * as THREE from 'three';
import {RoundedBoxGeometry} from 'three/addons/geometries/RoundedBoxGeometry.js';
import {H} from './data/source-plan.js';
import {material,M as MAT} from './materials.js';
const rad=a=>a*Math.PI/180;
const state={lights:true};
let seed=7; const rnd=()=>{ seed=(seed*16807)%2147483647; return seed/2147483647; };
function canvasTex(size, draw){ const cv=document.createElement('canvas'); cv.width=cv.height=size; const x=cv.getContext('2d'); draw(x,size); const t=new THREE.CanvasTexture(cv); t.wrapS=t.wrapT=THREE.RepeatWrapping; t.colorSpace=THREE.SRGBColorSpace; t.anisotropy=4; return t; }
const TX = {
  fabric: canvasTex(256,(x,s)=>{ x.fillStyle='#f4f4f4'; x.fillRect(0,0,s,s); for(let i=0;i<9000;i++){ const v=205+rnd()*50|0; x.fillStyle=`rgb(${v},${v},${v})`; x.beginPath(); x.arc(rnd()*s,rnd()*s,0.6+rnd()*1.5,0,7); x.fill(); } }),
  grain: canvasTex(256,(x,s)=>{ x.fillStyle='#efe9e2'; x.fillRect(0,0,s,s); for(let i=0;i<70;i++){ const y=rnd()*s, a=rnd()*6; x.strokeStyle=`rgba(90,60,40,${0.05+rnd()*0.1})`; x.lineWidth=0.6+rnd()*2; x.beginPath(); x.moveTo(0,y); for(let xx=0;xx<=s;xx+=16) x.lineTo(xx,y+Math.sin(xx/40+a)*3); x.stroke(); } }),
  jute: canvasTex(256,(x,s)=>{ x.fillStyle='#e9e2d6'; x.fillRect(0,0,s,s); const n=16, c=s/n; for(let i=0;i<n;i++) for(let j=0;j<n;j++){ const v=(i+j)%2?212:244; x.fillStyle=`rgb(${v},${v-6},${v-16})`; x.beginPath(); x.ellipse((i+0.5)*c,(j+0.5)*c,c*0.5,c*0.34,((i+j)%2)*Math.PI/2,0,7); x.fill(); } }),
};
TX.jute.repeat.set(3,3);
const MC = {};
function mt(color,kind=null,opts={}){return material(color,kind,opts);}
function mesh(geo, material, x=0,y=0,z=0){ const m=new THREE.Mesh(geo,material); m.position.set(x,y,z); m.castShadow=true; m.receiveShadow=true; return m; }
function box(w,h,d,color,x=0,y=0,z=0,kind=null,opts={}){ return mesh(new THREE.BoxGeometry(w,h,d), mt(color,kind,opts), x,y+h/2,z); }
function rbox(w,h,d,color,x=0,y=0,z=0,r=0.03,kind=null,opts={}){ const rr=Math.max(0.002,Math.min(r,w/2-0.001,h/2-0.001,d/2-0.001)); return mesh(new RoundedBoxGeometry(w,h,d,3,rr), mt(color,kind,opts), x,y+h/2,z); }
function cyl(r,h,color,x=0,y=0,z=0,seg=24,r2,kind=null,opts={}){ return mesh(new THREE.CylinderGeometry(r2??r,r,h,seg), mt(color,kind,opts), x,y+h/2,z); }
function sph(r,color,x,y,z,opts={}){ return mesh(new THREE.SphereGeometry(r,16,12), mt(color,null,opts), x,y,z); }
function glow(color, intensity, dist, x,y,z){ const l=new THREE.PointLight(color, intensity, dist, 2); l.position.set(x,y,z); l.userData.lamp=true; l.visible=state.lights; return l; }
function lampMat(color, base, extra={}){ const m=new THREE.MeshStandardMaterial({color, roughness:0.8, emissive:'#ffd29a', ...extra, emissiveIntensity: state.lights?base:0}); m.userData.lampBase=base; return m; }
const ART={};
function artTexture(it){ const key=it.id+'|'+it.color+'|'+it.w+'|'+it.h; if(ART[key]) return ART[key];
  const W=1024, Hh=Math.max(64,Math.round(1024*it.h/it.w)); const cv=document.createElement('canvas'); cv.width=W; cv.height=Hh; const x=cv.getContext('2d');
  seed=3000+[...String(it.id)].reduce((a,ch)=>a+ch.charCodeAt(0),0); x.fillStyle='#efe4d3'; x.fillRect(0,0,W,Hh); const v=(rnd()*3)|0, acc=it.color||'#c98c3a';
  if(v===0){ x.fillStyle=acc; x.beginPath(); x.arc(W*(0.3+rnd()*0.4),Hh*0.36,Math.min(W,Hh)*0.17,0,7); x.fill(); }
  const layers=['#dcc7a6', hex2(acc,0.16), acc, hex2(acc,-0.12)];
  for(let i=0;i<3;i++){ x.fillStyle=layers[i+(v===1?1:0)]; const y0=Hh*(0.56+i*0.13); x.beginPath(); x.moveTo(0,y0+rnd()*Hh*0.08); x.bezierCurveTo(W*0.3,y0-Hh*(0.04+rnd()*0.1),W*0.62,y0+Hh*rnd()*0.08,W,y0-Hh*rnd()*0.05); x.lineTo(W,Hh); x.lineTo(0,Hh); x.fill(); }
  if(v===2){ x.strokeStyle='#3a3532'; x.lineWidth=2; x.beginPath(); x.arc(W/2,Hh*0.44,Math.min(W,Hh)*0.2,Math.PI,0); x.stroke(); }
  const t=new THREE.CanvasTexture(cv); t.colorSpace=THREE.SRGBColorSpace; return ART[key]=t; }
function hex2(c,f){ const col=new THREE.Color(c); const hsl={}; col.getHSL(hsl); col.setHSL(hsl.h,hsl.s,Math.max(0,Math.min(1,hsl.l+f))); return '#'+col.getHexString(); }
const UP = new THREE.Vector3(0,1,0);

export function buildLegacyItem(it, fixed=false){
  const g3=new THREE.Group(); const w=it.w, d=it.d, h=it.h, c=it.color||'#cccccc', dk=hex2(c,-0.10), lt=hex2(c,0.05), hw=w/2, hd=d/2;
  const metal='#2f2b28', dark='#3a3530';
  seed = 1000 + [...String(it.id||it.type)].reduce((a,ch)=>a+ch.charCodeAt(0),0);
  const books=(x0,x1,y,depth,z=0,maxH=0.28)=>{ const cols=['#93432a','#c98c3a','#e6dccd','#6b4a33','#8c9a78','#b5603b','#3a3532','#d6c2a3']; let x=x0; while(x<x1-0.03){ const bw=0.022+rnd()*0.02, bh=Math.max(0.08,Math.min(maxH,0.16+rnd()*0.1)); if(x+bw>x1) break; g3.add(box(bw,bh,depth*(0.7+rnd()*0.2),cols[(rnd()*cols.length)|0],x+bw/2,y,z)); x+=bw+0.003; if(rnd()<0.1) x+=0.06; } };
  const potPlant=(x,y,z,s=1,col='#7f8a5c')=>{ g3.add(cyl(0.06*s,0.1*s,'#d9c6a8',x,y,z,14,0.075*s)); for(let k=0;k<4;k++) g3.add(mesh(new THREE.IcosahedronGeometry(0.06*s,0), mt(hex2(col,(k-2)*0.03),null,{flatShading:true}), x+(rnd()-0.5)*0.07*s, y+0.15*s+rnd()*0.06*s, z+(rnd()-0.5)*0.07*s)); };
  const vase=(x,y,z,s=1)=>{ g3.add(cyl(0.045*s,0.17*s,'#efe6d8',x,y,z,16,0.028*s)); };
  switch(it.type){
    case 'sofa': case 'sofabed': case 'armchair': {
      const arm=Math.min(0.2,w*0.16), back=Math.min(0.24,d*0.27), seatH=0.42;
      g3.add(box(w-0.06,0.06,d-0.06,dark,0,0,0));
      g3.add(rbox(w-arm*2+0.02,seatH-0.06,d-back,c,0,0.06,back/2,0.05,'fabric'));
      g3.add(rbox(w,h-0.06,back+0.04,c,0,0.06,-hd+back/2+0.02,0.08,'fabric'));
      for(const sx of[-1,1]) g3.add(rbox(arm,0.6-0.06,d,c,sx*(hw-arm/2),0.06,0,0.08,'fabric'));
      const n = it.type==='armchair'?1:(w>1.9?3:2), cw=(w-arm*2)/n;
      for(let i=0;i<n;i++) g3.add(rbox(cw-0.015,0.13,d-back-0.03,lt,-hw+arm+cw*(i+0.5),seatH,back/2,0.06,'fabric'));
      if(it.type!=='armchair'){ g3.add(rbox(0.42,0.4,0.14,'#f1ebe0',-hw+arm+0.3,seatH+0.1,-hd+back+0.09,0.07,'fabric')); g3.add(rbox(0.42,0.4,0.14,'#b5603b',hw-arm-0.3,seatH+0.1,-hd+back+0.09,0.07,'fabric')); }
      break; }
    case 'chaise': {
      const sd=Math.min(0.95,d), cwid=Math.min(0.85,w), back=0.24, arm=0.2, seatH=0.42;
      g3.add(box(w-0.06,0.06,sd-0.06,dark,0,0,-hd+sd/2)); g3.add(box(cwid-0.06,0.06,d-sd,dark,hw-cwid/2,0,-hd+sd+(d-sd)/2-0.03));
      g3.add(rbox(w-arm,seatH-0.06,sd-back,c,-hw+arm+(w-arm)/2,0.06,-hd+back+(sd-back)/2,0.05,'fabric'));
      g3.add(rbox(cwid,seatH-0.06,d-sd+0.02,c,hw-cwid/2,0.06,-hd+sd+(d-sd)/2-0.01,0.08,'fabric'));
      g3.add(rbox(w,h-0.06,back,c,0,0.06,-hd+back/2,0.09,'fabric'));
      g3.add(rbox(arm,0.6-0.06,sd,c,-hw+arm/2,0.06,-hd+sd/2,0.09,'fabric'));
      const mw=w-arm-cwid, cw=mw/2;
      for(let i=0;i<2;i++) g3.add(rbox(cw-0.015,0.13,sd-back-0.03,lt,-hw+arm+cw*(i+0.5),seatH,-hd+back+(sd-back)/2,0.06,'fabric'));
      g3.add(rbox(cwid-0.02,0.13,d-back-0.03,lt,hw-cwid/2,seatH,-hd+back+(d-back)/2,0.07,'fabric'));
      const pills=[['#f1ebe0',-hw+arm+0.32],['#d6c2a3',-hw+arm+0.85],['#b5603b',hw-cwid/2-0.05]];
      for(const [pc,px] of pills) g3.add(rbox(0.44,0.42,0.15,pc,px,seatH+0.1,-hd+back+0.09,0.08,'fabric'));
      break; }
    case 'bed': {
      g3.add(rbox(w,0.26,d,'#a87a52',0,0.08,0,0.02,'grain')); for(const sx of[-1,1]) for(const sz of[-1,1]) g3.add(cyl(0.025,0.08,dark,sx*(hw-0.1),0,sz*(hd-0.1),10));
      g3.add(rbox(w-0.06,0.22,d-0.1,'#f7f3ec',0,0.34,0.04,0.07,'fabric'));
      if(!it.nohb) g3.add(rbox(w,1.05,0.1,hex2(c,-0.07),0,0.06,-hd+0.05,0.05,'fabric'));
      if(!it.nohb){ const st=mesh(new THREE.BoxGeometry(w-0.1,0.012,0.012), lampMat('#fff2dc',2.4,{emissive:'#ffc98a'}),0,1.12,-hd+0.02); st.castShadow=false; g3.add(st); g3.add(glow('#ffbf7a',0.7,2.2,0,1.25,-hd+0.12)); }
      g3.add(rbox(w-0.01,0.08,d*0.68,c,0,0.53,d*0.16,0.04,'fabric'));
      g3.add(rbox(w,0.085,0.34,'#b5603b',0,0.535,hd-0.3,0.04,'fabric'));
      const n=w>1.25?2:1, pw=n===2?(w-0.3)/2:w-0.2; for(let i=0;i<n;i++) g3.add(rbox(pw,0.14,0.34,'#fbf8f2',-hw+0.1+pw/2+i*(pw+0.1),0.56,-hd+0.32,0.07,'fabric'));
      g3.add(rbox(0.38,0.3,0.12,'#c98c3a',0,0.62,-hd+0.48,0.06,'fabric'));
      break; }
    case 'crib': {
      g3.add(rbox(w-0.05,0.11,d-0.05,'#fbf8f2',0,0.3,0,0.04,'fabric')); g3.add(box(w,0.03,d,c,0,0.27,0,'grain'));
      for(const [x0,z0,x1,z1] of [[-hw,-hd,hw,-hd],[-hw,hd,hw,hd],[-hw,-hd,-hw,hd],[hw,-hd,hw,hd]]){ const L=Math.hypot(x1-x0,z1-z0), n=Math.max(2,Math.round(L/0.075)); for(let i=0;i<=n;i++){ const t=i/n; g3.add(cyl(0.011,h-0.06,c,x0+(x1-x0)*t,0.03,z0+(z1-z0)*t,8)); } }
      for(const z of[-hd,hd]) g3.add(rbox(w+0.03,0.045,0.045,c,0,h-0.045,z,0.018,'grain')); for(const x of[-hw,hw]) g3.add(rbox(0.045,0.045,d,c,x,h-0.045,0,0.018,'grain'));
      g3.add(sph(0.06,'#c49a6c',hw*0.3,0.47,hd*0.3)); g3.add(sph(0.045,'#c49a6c',hw*0.3,0.56,hd*0.3));
      break; }
    case 'table': { g3.add(rbox(w,0.045,d,c,0,h-0.045,0,0.012,'grain')); for(const sx of[-1,1]) for(const sz of[-1,1]) g3.add(box(0.055,h-0.045,0.055,dk,sx*(hw-0.08),0,sz*(hd-0.08),'grain')); break; }
    case 'desk': case 'deskpc': {
      g3.add(rbox(w,0.035,d,c,0,h-0.035,0,0.01,'grain')); for(const sx of[-1,1]) g3.add(box(0.04,h-0.035,d-0.1,metal,sx*(hw-0.06),0,0));
      if(it.type==='deskpc'){
        for(const sx of[-1,1]){ const mon=new THREE.Group(); mon.add(box(0.62,0.37,0.025,'#141416',0,0.12,0,null,{roughness:0.4})); mon.add(box(0.595,0.345,0.002,'#2d3e50',0,0.132,0.0135,null,{emissive:'#3a5470',emissiveIntensity:0.7,roughness:0.2})); mon.add(box(0.04,0.13,0.04,'#2a2a2a',0,0,-0.03)); mon.add(box(0.22,0.012,0.16,'#2a2a2a',0,0,-0.02)); mon.position.set(sx*0.32,h,-hd+0.2); mon.rotation.y=-sx*0.22; mon.traverse(o=>{o.castShadow=true;}); g3.add(mon); }
        g3.add(rbox(0.44,0.02,0.14,'#e6e2dc',0,h,0.07,0.006)); g3.add(rbox(0.06,0.02,0.1,'#e6e2dc',0.33,h,0.08,0.01)); g3.add(rbox(0.2,0.45,0.42,'#2a2a2a',hw-0.25,0,-hd+0.3,0.01)); vase(-hw+0.12,h,-hd+0.12,0.8);
      }
      break; }
    case 'coffee': { g3.add(rbox(w,0.06,d,c,0,h-0.06,0,0.012,'grain')); for(const sx of[-1,1]) g3.add(box(0.1,h-0.06,d-0.14,c,sx*(hw-0.25),0,0,'grain')); vase(0.18,h,0.03,1.2); books(-0.3,-0.12,h,0.2,0,0.04); break; }
    case 'roundtable': { g3.add(cyl(Math.min(hw,hd),0.04,c,0,h-0.04,0,40,undefined,'grain')); g3.add(cyl(0.05,h-0.04,dk,0,0,0)); g3.add(cyl(0.25,0.03,dk,0,0,0)); break; }
    case 'bistro': { const R=Math.min(hw,hd); g3.add(cyl(R,0.025,c,0,h-0.025,0,36,undefined,null,{metalness:0.4,roughness:0.5})); g3.add(cyl(0.022,h-0.025,c,0,0,0,10)); g3.add(cyl(0.2,0.02,c,0,0,0,24)); g3.add(mesh(new THREE.CylinderGeometry(0.035,0.035,0.07,12), lampMat('#fbf3e6',1.2,{emissive:'#ffb357'}),0.08,h+0.035,0.05)); g3.add(glow('#ffb46a',0.5,2.2,0.08,h+0.15,0.05)); break; }
    case 'chair': { g3.add(rbox(w,0.05,d-0.06,c,0,0.42,0.03,0.02,'fabric')); g3.add(rbox(w,h-0.47,0.045,c,0,0.47,-hd+0.025,0.02,'fabric')); for(const sx of[-1,1]) for(const sz of[-1,1]) g3.add(cyl(0.016,0.42,'#6b4a33',sx*(hw-0.04),0,sz*(hd-0.05),8)); break; }
    case 'bistrochair': { const R=Math.min(hw,hd)*0.85; g3.add(cyl(R,0.03,c,0,0.44,0.03,24)); const bk=new THREE.Mesh(new THREE.TorusGeometry(R,0.012,6,24,Math.PI), mt(c)); bk.position.set(0,0.62,-hd+0.08); bk.castShadow=true; g3.add(bk); for(const sx of[-1,1]) g3.add(cyl(0.012,0.18,c,sx*R,0.44,-hd+0.08,6)); for(const sx of[-1,1]) for(const sz of[-1,1]) g3.add(cyl(0.012,0.44,c,sx*(R-0.04),0,0.03+sz*(R-0.04),6)); break; }
    case 'officechair': { g3.add(cyl(0.3,0.03,'#2a2a2a',0,0.05,0,5)); g3.add(cyl(0.03,0.4,'#555555',0,0.05,0,10)); g3.add(rbox(0.5,0.08,0.48,c,0,0.45,0.03,0.03,'fabric')); g3.add(rbox(0.48,0.55,0.06,c,0,0.55,-hd+0.08,0.03,'fabric')); break; }
    case 'stool': { g3.add(cyl(Math.min(hw,hd),0.05,c,0,h-0.05,0,24)); g3.add(cyl(0.025,h-0.05,dk,0,0,0,10)); g3.add(cyl(0.16,0.02,dk,0,0,0,20)); break; }
    case 'tvunit': {
      g3.add(rbox(w,h-0.08,d,c,0,0.08,0,0.012,'grain')); for(const sx of[-1,1]) g3.add(box(0.03,0.08,0.03,dark,sx*(hw-0.06),0,0));
      const n=Math.max(2,Math.round(w/0.45)); for(let i=1;i<n;i++) g3.add(box(0.004,h-0.12,0.004,dk,-hw+i*w/n,0.1,hd+0.001));
      const tw=Math.min(w-0.1,1.23); g3.add(box(tw,0.72,0.035,'#111113',0,h+0.07,-hd+0.08,null,{roughness:0.3})); g3.add(box(0.3,0.07,0.18,'#111113',0,h,-hd+0.1));
      potPlant(-hw+0.2,h,0.02); break; }
    case 'sideboard': case 'dresser': case 'nightstand': case 'shoe': case 'changer': {
      const body=h-0.1; g3.add(rbox(w,body,d,c,0,0.1,0,0.012,'grain')); for(const sx of[-1,1]) for(const sz of[-1,1]) g3.add(cyl(0.015,0.1,dark,sx*(hw-0.05),0,sz*(hd-0.05),8));
      if(it.type==='dresser'||it.type==='nightstand'||it.type==='changer'){ const rows=it.type==='nightstand'?2:3; for(let r=1;r<rows;r++) g3.add(box(w-0.02,0.004,0.004,dk,0,0.1+body*r/rows,hd+0.001)); for(let r=0;r<rows;r++) g3.add(box(0.12,0.012,0.02,'#c9b28f',0,0.1+body*(r+0.5)/rows,hd+0.01,null,{metalness:0.4,roughness:0.4})); }
      else { const n=Math.max(2,Math.round(w/0.45)); for(let i=1;i<n;i++) g3.add(box(0.004,body-0.04,0.004,dk,-hw+i*w/n,0.12,hd+0.001)); }
      if(it.type==='changer') g3.add(rbox(w-0.08,0.09,d-0.06,'#fbf8f2',0,h,0,0.04,'fabric'));
      if(it.type==='sideboard'){ vase(-hw+0.25,h,0,1.3); potPlant(hw-0.25,h,0,1.3); books(-0.2,0.2,h,0.22,0,0.05); }
      if(it.type==='dresser'){ vase(hw-0.2,h,0,1.1); books(-hw+0.1,-hw+0.36,h,d*0.7,0,0.22); }
      if(it.type==='nightstand'){ g3.add(cyl(0.06,0.2,'#c98c3a',0,h,0,16,0.04)); const sh=mesh(new THREE.CylinderGeometry(0.1,0.12,0.14,24,1,true), lampMat('#f4ead8',0.5,{map:TX.fabric,side:THREE.DoubleSide,emissive:'#ffd9a0'}),0,h+0.27,0); sh.castShadow=false; g3.add(sh); g3.add(glow('#ffc98a',0.5,2,0,h+0.3,0)); }
      break; }
    case 'shelf': {
      const t=0.02, n=Math.max(4,Math.round(h/0.36)), cols=Math.max(1,Math.round(w/0.8));
      for(const sx of[-1,1]) g3.add(box(t,h,d,c,sx*(hw-t/2),0,0,'grain'));
      for(let i=0;i<=n;i++) g3.add(box(w-t*2,t,d,c,0,i*(h-t)/n,0,'grain'));
      for(let k=1;k<cols;k++) g3.add(box(t,h,d,c,-hw+k*w/cols,0,0,'grain'));
      g3.add(box(w,h,0.008,dk,0,0,-hd+0.004,'grain'));
      for(let i=0;i<n;i++){ const by=i*(h-t)/n+t, sh=(h-t)/n-t; for(let k=0;k<cols;k++){ const x0=-hw+k*w/cols+t, x1=-hw+(k+1)*w/cols-t, r=rnd();
        if(r<0.6) books(x0+0.02, x1-(r<0.3?0.22:0.02), by, d*0.85, 0.01, sh-0.03);
        if(r<0.3) vase(x1-0.11,by,0,Math.min(1,sh/0.2)); else if(r>=0.6&&r<0.8) potPlant((x0+x1)/2,by,0,Math.min(1.2,sh/0.26)); } }
      break; }
    case 'stepshelf': {
      const n=Math.max(2,Math.round(w/0.3)), cw=w/n, ch=h/n, t=0.022;
      for(let i=0;i<n;i++){ const x0=-hw+i*cw; for(let r=0;r<=i+1;r++) g3.add(box(cw,t,d,c,x0+cw/2,Math.min(r*ch,h-t),0,'grain')); }
      for(let k=0;k<=n;k++){ const hh=Math.min(n,k+1)*ch; g3.add(box(t,hh,d,c,Math.max(-hw+t/2,Math.min(hw-t/2,-hw+k*cw)),0,0,'grain')); }
      for(let i=0;i<n;i++){ const st=mesh(new THREE.BoxGeometry(cw-0.04,0.008,0.012), lampMat('#fff2dc',2.2,{emissive:'#ffcf8a'}), -hw+(i+0.5)*cw, (i+1)*ch-0.03, hd-0.03); st.castShadow=false; g3.add(st); }
      g3.add(glow('#ffc477',0.9,2.4,0,h*0.5,hd+0.15));
      for(let i=0;i<n;i++) for(let r=0;r<=i;r++){ const cx=-hw+(i+0.5)*cw, by=r*ch+t, q=rnd();
        if(q<0.34) books(cx-cw/2+0.03,cx+cw/2-0.03,by,d*0.8,0,ch-0.06); else if(q<0.6) potPlant(cx,by,0,Math.min(1.1,(ch-0.05)/0.26)); else if(q<0.78) vase(cx,by,0,Math.min(1,(ch-0.04)/0.2)); }
      break; }
    case 'aquarium': {
      const standH=Math.min(0.75,h*0.56), tankH=h-standH-0.03;
      g3.add(rbox(w,standH,d,c,0,0,0,0.012,'grain')); const n=Math.max(2,Math.round(w/0.5)); for(let i=1;i<n;i++) for(const zz of[hd+0.001,-hd-0.001]) g3.add(box(0.004,standH-0.06,0.004,dk,-hw+i*w/n,0.03,zz));
      const glassM=new THREE.MeshStandardMaterial({color:'#e4f3f6',transparent:true,opacity:0.16,roughness:0.03,side:THREE.DoubleSide,depthWrite:false});
      const tank=new THREE.Mesh(new THREE.BoxGeometry(w,tankH,d),glassM); tank.position.y=standH+tankH/2; g3.add(tank);
      const edges=new THREE.LineSegments(new THREE.EdgesGeometry(new THREE.BoxGeometry(w,tankH,d)), new THREE.LineBasicMaterial({color:'#2a2a2a'})); edges.position.copy(tank.position); g3.add(edges);
      const waterM=new THREE.MeshStandardMaterial({color:'#58aec2',transparent:true,opacity:0.3,roughness:0.1,emissive:'#1d6a7c',emissiveIntensity:0.45,depthWrite:false});
      const water=new THREE.Mesh(new THREE.BoxGeometry(w-0.02,tankH-0.06,d-0.02),waterM); water.position.y=standH+0.01+(tankH-0.06)/2; g3.add(water);
      g3.add(box(w-0.02,0.05,d-0.02,'#e2cfa4',0,standH,0));
      for(let k=0;k<4;k++){ const rk=mesh(new THREE.DodecahedronGeometry(0.05+rnd()*0.05,0), mt('#8d8478',null,{flatShading:true}), -hw+0.15+rnd()*(w-0.3), standH+0.07, (rnd()-0.5)*(d-0.14)); rk.scale.y=0.7; g3.add(rk); }
      const plantC=['#4f8a3c','#6aa84f','#3f7a46','#8cbf5a'];
      for(let k=0;k<16;k++){ const hh=0.1+rnd()*(tankH-0.2); const pl=mesh(new THREE.ConeGeometry(0.014+rnd()*0.014,hh,5), mt(plantC[k%4],null,{flatShading:true}), -hw+0.06+rnd()*(w-0.12), standH+0.05+hh/2, (rnd()-0.5)*(d-0.1)); pl.rotation.z=(rnd()-0.5)*0.3; g3.add(pl); }
      const fishC=['#ff8a3d','#ffb347','#ff6b4a','#3fb6e8','#ffd166','#f25c54'];
      for(let k=0;k<12;k++){ const col=fishC[k%fishC.length], fm=mt(col,null,{emissive:col,emissiveIntensity:0.3}); const f=new THREE.Group(); const b=new THREE.Mesh(new THREE.SphereGeometry(0.022,10,8),fm); b.scale.set(1.8,1,0.6); f.add(b); const tl=new THREE.Mesh(new THREE.ConeGeometry(0.018,0.03,4),fm); tl.rotation.z=Math.PI/2; tl.position.x=-0.05; f.add(tl); f.position.set(-hw+0.12+rnd()*(w-0.24), standH+0.12+rnd()*(tankH-0.25), (rnd()-0.5)*(d-0.12)); f.rotation.y=rnd()<0.5?0:Math.PI; g3.add(f); }
      g3.add(box(w-0.04,0.025,0.08,'#1d1d1f',0,standH+tankH,-hd+0.06)); g3.add(glow('#9fe3ff',0.6,1.8,0,standH+tankH-0.05,0));
      break; }
    case 'shoerack': {
      const t=0.02; g3.add(box(w,0.08,d,c,0,0,0,'grain')); for(const sx of[-1,1]) g3.add(box(t,h,d,c,sx*(hw-t/2),0,0,'grain')); g3.add(box(w,t,d,c,0,h-t,0,'grain')); g3.add(box(w,h,0.008,dk,0,0,-hd+0.004));
      const n=6, shoeC=['#3a3530','#e6dccd','#93432a','#c49a6c','#f4f1ea','#5b4a3f','#2f3e4f','#b5603b'];
      for(let i=0;i<n;i++){ const by=0.08+i*(h-0.1)/n; if(i>0) g3.add(box(w-t*2,0.015,d,c,0,by-0.015,0,'grain'));
        let x=-hw+0.05; while(x<hw-0.2){ const col=shoeC[(rnd()*shoeC.length)|0], hi=rnd()<0.2?0.18:0.09; for(const off of[0,0.085]) g3.add(rbox(0.075,hi,Math.min(0.26,d-0.04),col,x+off+0.0375,by,0.02,0.03)); x+=0.2+rnd()*0.03; } }
      break; }
    case 'cubes': {
      const cols=Math.max(1,Math.round(w/0.35)), rows=Math.max(1,Math.round(h/0.36)), cw=w/cols, ch=h/rows, t=0.02;
      for(let r=0;r<=rows;r++) g3.add(box(w,t,d,c,0,Math.min(r*ch,h-t),0,'grain'));
      for(let k=0;k<=cols;k++) g3.add(box(t,h,d,c,Math.max(-hw+t/2,Math.min(hw-t/2,-hw+k*cw)),0,0,'grain'));
      g3.add(box(w,h,0.006,dk,0,0,-hd+0.003));
      const binC=['#c98c3a','#e6dccd','#8c9a78','#b5603b','#d6c2a3'];
      for(let r=0;r<rows;r++) for(let k=0;k<cols;k++){ const cx=-hw+(k+0.5)*cw, by=r*ch+t, q=rnd(); if(q<0.55) g3.add(rbox(cw-0.06,ch-0.08,d-0.05,binC[(rnd()*binC.length)|0],cx,by,0.01,0.02,'fabric')); else if(q<0.85){ g3.add(sph(0.06,'#ffb347',cx-0.05,by+0.06,0)); g3.add(rbox(0.08,0.08,0.08,'#8cc7e8',cx+0.06,by,0,0.01)); } }
      g3.add(sph(0.075,'#c49a6c',hw-0.16,h+0.075,0)); g3.add(sph(0.055,'#c49a6c',hw-0.16,h+0.19,0));
      break; }
    case 'wardrobe': case 'builtin': {
      g3.add(box(w,h,d,c,0,0,0,it.type==='wardrobe'?'grain':null,{roughness:0.8})); const n=Math.max(1,Math.round(w/0.5));
      for(let i=1;i<n;i++) g3.add(box(0.006,h-0.06,0.01,hex2(c,-0.15),-hw+i*w/n,0.03,hd+0.003));
      for(let i=0;i<n;i++) g3.add(box(0.015,0.25,0.02,'#c9b28f',-hw+(i+0.5)*w/n+(i%2?-0.12:0.12)*(w/n>0.4?1:0.5),1.0,hd+0.01,null,{metalness:0.4,roughness:0.4}));
      break; }
    case 'rug': { const m=box(w,0.012,d,c,0,0,0,'jute'); m.castShadow=false; g3.add(m); break; }
    case 'lamp': { g3.add(cyl(0.15,0.025,dark,0,0,0,24)); g3.add(cyl(0.012,h-0.3,'#6b4a33',0,0.025,0,8)); const sh=mesh(new THREE.CylinderGeometry(0.17,0.21,0.3,32,1,true), lampMat('#f4ead8',0.6,{map:TX.fabric,side:THREE.DoubleSide,emissive:'#ffd9a0'}),0,h-0.15,0); sh.castShadow=false; g3.add(sh); g3.add(glow('#ffc98a',1.6,4,0,h-0.22,0)); break; }
    case 'pendant': {
      const R=Math.min(hw,hd), top=H-0.02, drop=Math.min(h, H-1.7); g3.add(cyl(0.004,drop,dark,0,top-drop,0,6));
      const pm=lampMat('#f6efe3',0.55,{map:TX.fabric,side:THREE.DoubleSide,emissive:'#ffdcae'});
      for(let k=0;k<3;k++){ const rr=R*(1-k*0.06); const cone=new THREE.Mesh(new THREE.CylinderGeometry(rr*0.1,rr,0.13,48,1,true),pm); cone.position.y=top-drop-0.07-k*0.12; g3.add(cone); }
      g3.add(glow('#ffc98a',3.0,5,0,top-drop-0.4,0)); break; }
    case 'lantern': {
      const s=Math.min(hw,hd); g3.add(box(s*2,0.02,s*2,c,0,0,0)); g3.add(box(s*2,0.02,s*2,c,0,h-0.08,0)); for(const sx of[-1,1]) for(const sz of[-1,1]) g3.add(box(0.012,h-0.08,0.012,c,sx*(s-0.006),0,sz*(s-0.006)));
      const gm=new THREE.Mesh(new THREE.BoxGeometry(s*2-0.02,h-0.1,s*2-0.02), new THREE.MeshStandardMaterial({color:'#fff3df',transparent:true,opacity:0.18,roughness:0.1,depthWrite:false})); gm.position.y=0.02+(h-0.1)/2; g3.add(gm);
      g3.add(mesh(new THREE.CylinderGeometry(0.03,0.03,0.08,12), lampMat('#fbf3e6',1.4,{emissive:'#ffb357'}),0,0.06,0)); g3.add(cyl(0.05,0.06,c,0,h-0.08,0,4,0.02)); g3.add(glow('#ffae5c',0.7,2.5,0,0.2,0)); break; }
    case 'garland': {
      const top=Math.min(h,H-0.05), sag=0.3, n=Math.max(8,Math.round(w/0.25)), pts=[];
      for(let i=0;i<=n;i++){ const t=i/n; pts.push(new THREE.Vector3(-hw+w*t, top-sag*4*t*(1-t), 0)); }
      g3.add(new THREE.Line(new THREE.BufferGeometry().setFromPoints(pts), new THREE.LineBasicMaterial({color:'#3a3530'})));
      const bm=lampMat('#fff1d0',2.6,{emissive:'#ffc566'}); for(let i=1;i<n;i++){ const b=new THREE.Mesh(new THREE.SphereGeometry(0.04,10,8),bm); b.position.copy(pts[i]); b.position.y-=0.04; g3.add(b); }
      g3.add(glow('#ffc477',0.9,3.5,-hw*0.5,top-0.35,0)); g3.add(glow('#ffc477',0.9,3.5,hw*0.5,top-0.35,0)); break; }
    case 'plant': case 'olive': {
      const R=Math.min(hw,hd), potH=Math.min(0.45,h*0.32);
      g3.add(cyl(R*0.62,potH,it.type==='olive'?'#b5603b':'#d9c6a8',0,0,0,24,R*0.8)); g3.add(cyl(R*0.6,0.02,'#5a4636',0,potH-0.03,0,20));
      if(it.type==='olive'){ g3.add(cyl(0.03,h*0.45,'#6b5a45',0,potH,0,8,0.02)); for(let k=0;k<10;k++){ const b=mesh(new THREE.IcosahedronGeometry(R*(0.32+rnd()*0.2),1), mt(hex2(c,(rnd()-0.5)*0.08),null,{flatShading:true}), (rnd()-0.5)*R*1.4, potH+h*0.42+rnd()*Math.max(0.1,h-potH-h*0.42-0.15), (rnd()-0.5)*R*1.4); b.scale.y=0.75; g3.add(b); } }
      else { const n=9; for(let k=0;k<n;k++){ const len=(h-potH)*(0.55+rnd()*0.45), a=k/n*Math.PI*2+rnd(), tilt=0.2+rnd()*0.45; const dir=new THREE.Vector3(Math.cos(a)*Math.sin(tilt),Math.cos(tilt),Math.sin(a)*Math.sin(tilt));
        const leaf=mesh(new THREE.SphereGeometry(1,10,8), mt(hex2(c,(rnd()-0.5)*0.1),null,{flatShading:true})); leaf.scale.set(R*0.22,len/2,R*0.07); leaf.quaternion.setFromUnitVectors(UP,dir); leaf.position.set(dir.x*len/2,potH+dir.y*len/2,dir.z*len/2); g3.add(leaf); } }
      break; }
    case 'fridge': { g3.add(rbox(w,h,d,c,0,0,0,0.02,null,{roughness:0.3,metalness:0.2})); g3.add(box(w-0.02,0.008,0.01,'#9aa0a6',0,h*0.62,hd+0.003)); g3.add(box(0.02,0.35,0.03,'#9aa0a6',hw-0.06,h*0.65,hd+0.01)); break; }
    case 'washer': { g3.add(rbox(w,h,d,c,0,0,0,0.02,null,{roughness:0.4})); const door=new THREE.Mesh(new THREE.CircleGeometry(0.17,32), mt('#5d6670',null,{roughness:0.2})); door.position.set(0,0.45,hd+0.002); g3.add(door); break; }
    case 'lounger': { g3.add(rbox(w,0.22,d-0.6,c,0,0.1,0.3,0.05,'fabric')); const b=rbox(w,0.07,0.65,c,0,0,0,0.03,'fabric'); b.position.set(0,0.46,-hd+0.32); b.rotation.x=0.6; g3.add(b); for(const sx of[-1,1]) for(const sz of[-1,1]) g3.add(cyl(0.015,0.1,'#4b4f57',sx*(hw-0.05),0,sz*(hd-0.08),8)); break; }
    case 'kitchen': {
      g3.add(box(w,0.86,d,'#5b4a3f',0,0,0,'grain')); g3.add(box(w+0.01,0.04,d+0.01,'#cbbfb1',0,0.86,0));
      const hob=new THREE.Mesh(new THREE.BoxGeometry(0.58,0.006,0.5), mt('#151515',null,{roughness:0.2})); hob.position.set(-0.72,0.903,0); g3.add(hob);
      g3.add(box(0.5,0.02,0.38,'#b9bec4',0.6,0.89,0,null,{metalness:0.6,roughness:0.3})); g3.add(box(0.03,0.28,0.03,'#b9bec4',0.6,0.9,-hd+0.06,null,{metalness:0.6,roughness:0.3}));
      g3.add(box(w,0.7,0.34,'#f4f2ee',0,1.5,-hd+0.17)); g3.add(box(0.6,0.5,0.6,'#202022',-0.72,0.15,0.01));
      { const st=mesh(new THREE.BoxGeometry(w-0.1,0.01,0.015), lampMat('#fff4e0',2.2,{emissive:'#ffd59a'}),0,1.49,-hd+0.3); st.castShadow=false; g3.add(st); g3.add(glow('#ffd29a',1.1,3,0,1.3,-hd+0.35)); }
      break; }
    case 'tub': { g3.add(rbox(w,h,d,'#ffffff',0,0,0,0.03,null,{roughness:0.3})); g3.add(box(w-0.12,0.02,d-0.12,'#e8eef2',0,h-0.01,0)); break; }
    case 'sink': { g3.add(rbox(w,0.5,d-0.02,c,0,0.32,0.01,0.01,'grain')); g3.add(rbox(w,0.04,d,'#ffffff',0,0.82,0,0.01,null,{roughness:0.3})); g3.add(box(0.03,0.15,0.03,'#c0c4c8',0,0.86,-hd+0.06,null,{metalness:0.7,roughness:0.25})); { const sh=new THREE.Shape(), Rm=0.3, N=48; for(let k=0;k<=N;k++){ const a=k/N*Math.PI*2, rr=Rm*(1+0.06*Math.sin(a*3+1.3)+0.04*Math.sin(a*5+0.4)); const px=Math.cos(a)*rr, py=Math.sin(a)*rr*1.08; k?sh.lineTo(px,py):sh.moveTo(px,py); } const mir=new THREE.Mesh(new THREE.ShapeGeometry(sh), new THREE.MeshStandardMaterial({color:'#e3eaec',metalness:0.95,roughness:0.06,envMapIntensity:1.3})); mir.position.set(0,1.45,-hd+0.014); g3.add(mir); const bk=new THREE.Mesh(new THREE.ExtrudeGeometry(sh,{depth:0.012,bevelEnabled:false}), mt('#c49a6c','grain')); bk.scale.set(1.07,1.07,1); bk.position.set(0,1.45,-hd+0.001); g3.add(bk); } break; }
    case 'wc': { g3.add(rbox(w*0.9,0.38,0.18,'#ffffff',0,0.42,-hd+0.09,0.03,null,{roughness:0.3})); const b=cyl(0.19,0.4,'#ffffff',0,0,0.08,24,0.17); b.scale.z=1.25; g3.add(b); break; }
    case 'shower': { g3.add(box(w,0.04,d,c,0,0,0,null,{roughness:0.5})); const scr=new THREE.Mesh(new THREE.PlaneGeometry(d,1.9), MAT.glass); scr.position.set(-hw,1.0,0); scr.rotation.y=Math.PI/2; g3.add(scr); break; }
    case 'boiler': { g3.add(cyl(Math.min(hw,hd),h-0.35,'#f4f4f2',0,0.35,0)); for(const sx of[-1,1]) for(const sz of[-1,1]) g3.add(cyl(0.012,0.35,'#9a9a9a',sx*0.18,0,sz*0.18,6)); break; }
    case 'fan': { const top=H-0.01, drop=Math.min(h,0.5), rr=Math.min(hw,hd); g3.add(cyl(0.06,0.04,'#2f2b28',0,top-0.04,0,16)); g3.add(cyl(0.012,drop-0.12,'#2f2b28',0,top-drop+0.08,0,8)); g3.add(cyl(0.11,0.09,'#2f2b28',0,top-drop,0,24));
      for(let k=0;k<5;k++){ const bl=new THREE.Group(); bl.add(rbox(rr-0.12,0.012,0.15,c,0.12+(rr-0.12)/2,0,0,0.006,'grain')); bl.add(box(0.12,0.01,0.03,'#2f2b28',0.06,0,0)); bl.rotation.y=k/5*Math.PI*2; bl.position.y=top-drop+0.05; bl.traverse(o=>{o.castShadow=true;}); g3.add(bl); }
      const bowl=mesh(new THREE.SphereGeometry(0.13,20,12,0,Math.PI*2,Math.PI/2,Math.PI/2), lampMat('#fbf3e3',1.1),0,top-drop,0); bowl.castShadow=false; g3.add(bowl); g3.add(glow('#ffc98a',3.2,5.5,0,top-drop-0.25,0)); break; }
    case 'pendant2': { const top=H-0.02, drop=Math.min(h,H-1.75), rr=Math.min(hw,hd); g3.add(cyl(0.003,drop,'#2f2b28',0,top-drop,0,6));
      const dome=new THREE.Mesh(new THREE.SphereGeometry(rr,24,12,0,Math.PI*2,0,Math.PI/2), mt(c,'fabric',{side:THREE.DoubleSide})); dome.position.y=top-drop-rr*0.95; dome.castShadow=true; g3.add(dome);
      const bulb=mesh(new THREE.SphereGeometry(0.04,12,8), lampMat('#fff1d6',2.2,{emissive:'#ffcf8a'}),0,top-drop-rr*0.85,0); bulb.castShadow=false; g3.add(bulb); g3.add(glow('#ffc477',1.3,3,0,top-drop-rr-0.12,0)); break; }
    case 'tablelamp': { const rr=Math.min(hw,hd); g3.add(cyl(rr*0.45,h*0.5,c,0,0,0,20,rr*0.25,null,{roughness:0.5})); const sh=mesh(new THREE.CylinderGeometry(rr*0.75,rr,h*0.45,28,1,true), lampMat('#f4ead8',0.9,{map:TX.fabric,side:THREE.DoubleSide,emissive:'#ffd9a0'}),0,h*0.5+h*0.225,0); sh.castShadow=false; g3.add(sh); g3.add(glow('#ffc98a',1.1,3,0,h*0.62,0)); break; }
    case 'nightlight': { const rr=Math.min(hw,hd); g3.add(cyl(rr*0.95,0.02,'#c49a6c',0,0,0,20)); const b=mesh(new THREE.SphereGeometry(rr,20,14,0,Math.PI*2,0,Math.PI/2), lampMat('#ffe7c2',1.5,{emissive:'#ffbf73'}),0,0.02,0); b.castShadow=false; g3.add(b); g3.add(glow('#ffbf73',0.6,1.8,0,0.15,0)); break; }
    case 'bar': { g3.add(rbox(w,0.04,d,c,0,h-0.04,0,0.01,'grain')); for(const sx of[-1,1]) g3.add(box(0.03,h-0.04,0.03,'#2f2b28',sx*(hw-0.08),0,hd-0.06)); g3.add(box(w-0.1,0.025,0.025,'#2f2b28',0,0.25,hd-0.06)); g3.add(box(w,0.06,0.02,c,0,h-0.1,-hd+0.01,'grain'));
      g3.add(rbox(0.2,0.3,0.26,'#2a2a2a',-hw+0.2,h,-hd+0.15,0.03,null,{roughness:0.35,metalness:0.3})); g3.add(rbox(0.18,0.04,0.2,'#c0c4c8',-hw+0.2,h+0.3,-hd+0.15,0.01,null,{metalness:0.7,roughness:0.3}));
      for(const xx of[-hw+0.45,-hw+0.56]) g3.add(cyl(0.035,0.08,'#f1ebe0',xx,h,0.05,14,0.04));
      g3.add(cyl(0.12,0.07,'#c49a6c',hw-0.3,h,0,20,0.08,'grain')); for(let k=0;k<4;k++) g3.add(sph(0.04,['#e85d3a','#f2a93b','#d64a2c','#9cbf4a'][k],hw-0.3+(k%2?0.045:-0.045),h+0.1+(k>1?0.045:0),(k<2?0.03:-0.02))); break; }
    case 'barstool': { const rr=Math.min(hw,hd); g3.add(cyl(rr,0.05,c,0,h-0.05,0,24,undefined,'fabric')); for(let k=0;k<4;k++){ const a=k*Math.PI/2+Math.PI/4; g3.add(cyl(0.014,h-0.05,'#2f2b28',Math.cos(a)*rr*0.72,0,Math.sin(a)*rr*0.72,8)); } const ring=new THREE.Mesh(new THREE.TorusGeometry(rr*0.72,0.01,6,20), mt('#2f2b28')); ring.rotation.x=Math.PI/2; ring.position.y=0.28; g3.add(ring); break; }
    case 'slats': { const n=Math.max(2,Math.floor(w/0.09)), t=0.045; for(let i=0;i<n;i++) g3.add(box(t,h-0.06,t,c,-hw+(i+0.5)*w/n,0.03,0,'grain')); g3.add(box(w,0.03,0.07,c,0,0,0,'grain')); g3.add(box(w,0.03,0.07,c,0,h-0.03,0,'grain')); break; }
    case 'ovaltable': { const top=mesh(new THREE.CylinderGeometry(0.5,0.5,0.045,56), mt(c,'grain')); top.scale.set(w,1,d); top.position.y=h-0.0225; g3.add(top); for(const sx of[-1,1]){ g3.add(cyl(0.07,h-0.045,dk,sx*w*0.24,0,0,20,0.045,'grain')); const ft=mesh(new THREE.CylinderGeometry(0.5,0.5,0.025,28), mt(dk,'grain')); ft.scale.set(0.32,1,d*0.55); ft.position.set(sx*w*0.24,0.0125,0); g3.add(ft); } break; }
    case 'headboard': { const sh=new THREE.Shape(); sh.absellipse(0,h/2,hw,h/2,0,Math.PI*2,false,0); const hb=mesh(new THREE.ExtrudeGeometry(sh,{depth:d-0.02,bevelEnabled:true,bevelThickness:0.01,bevelSize:0.02,bevelSegments:3,curveSegments:64}), mt(c,'fabric')); hb.position.set(0,0,-hd+0.01); g3.add(hb); g3.add(glow('#ffbf7a',0.7,2.0,0,h+0.04,-hd+0.06)); break; }
    case 'art': { g3.add(box(w,h,d,'#d9c6a8',0,0,0,'grain')); const pic=new THREE.Mesh(new THREE.PlaneGeometry(w-0.05,h-0.05), new THREE.MeshStandardMaterial({map:artTexture(it),roughness:0.9,envMapIntensity:0.3})); pic.position.set(0,h/2,hd+0.002); g3.add(pic); break; }
    default: g3.add(rbox(w,h,d,c,0,0,0,0.02));
  }
  g3.position.set(it.x,it.elev||0,it.y); g3.rotation.y=-rad(it.rot); g3.scale.x = it.flip ? -1 : 1;
  g3.traverse(o=>{ o.userData.itemId = fixed?null:it.id; });
  return g3;
}


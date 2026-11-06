import * as T from 'three';
const loader=new T.TextureLoader();
const sets={};
export const materialCache=new Map();
export function maps(name,repeat=1){
 const key=name+repeat;if(sets[key])return sets[key];
 const set={};for(const [channel,suffix] of [['map','color'],['normalMap','normal'],['roughnessMap','rough']]){
  const t=loader.load(`${import.meta.env.BASE_URL}textures/${name}-${suffix}.webp`);t.wrapS=t.wrapT=T.RepeatWrapping;t.repeat.set(repeat,repeat);t.anisotropy=8;if(channel==='map')t.colorSpace=T.SRGBColorSpace;set[channel]=t;
 }return sets[key]=set;
}
export function material(color='#eee8dc',kind=null,opts={}){
 const key=JSON.stringify([color,kind,opts]);if(materialCache.has(key))return materialCache.get(key);
 const set=kind?maps(({grain:'timber',fabric:'linen',jute:'rug'})[kind]||kind,kind==='fabric'?3:kind==='jute'?6:1):{};
 const m=new T.MeshPhysicalMaterial({color,roughness:kind==='fabric'||kind==='jute'?.96:.65,metalness:0,envMapIntensity:.65,...set,...(kind==='fabric'?{sheen:1,sheenColor:new T.Color('#f5efdf'),sheenRoughness:.85,normalScale:new T.Vector2(.22,.22)}:{}),...(kind==='grain'?{normalScale:new T.Vector2(.16,.16),clearcoat:.12,clearcoatRoughness:.55}:{}),...opts});
 materialCache.set(key,m);return m;
}
export const M={
 wall:material('#ffffff','plaster'),floor:material('#ffffff','oak'),stone:material('#ffffff','stone'),terrace:material('#c3b7a3','stone'),
 wood:material('#e1c6a1','grain'),linen:material('#eae0cf','fabric'),white:material('#f9f6ed',null,{roughness:.25,clearcoat:.35}),
 metal:material('#b2aca0',null,{metalness:1,roughness:.22}),brass:material('#ad8960',null,{metalness:.85,roughness:.3}),black:material('#282b29',null,{roughness:.35}),
 glass:material('#eef5f2',null,{roughness:.06,metalness:0,transparent:true,opacity:.14,depthWrite:false,side:T.DoubleSide,envMapIntensity:1.8}),
 mirror:material('#ffffff',null,{metalness:1,roughness:.035,envMapIntensity:1.3}),frame:material('#eeeae2',null,{roughness:.4})
};
// Real metre UVs are assigned to architecture; maps span 2.4m for parquet, 1.2m for stone.
export function worldUV(g,scale=1){const p=g.attributes.position,n=g.attributes.normal,uv=[];for(let i=0;i<p.count;i++){const ax=Math.abs(n.getX(i)),ay=Math.abs(n.getY(i)),az=Math.abs(n.getZ(i));if(ay>ax&&ay>az)uv.push(p.getX(i)/scale,p.getZ(i)/scale);else if(ax>az)uv.push(p.getZ(i)/scale,p.getY(i)/scale);else uv.push(p.getX(i)/scale,p.getY(i)/scale);}g.setAttribute('uv',new T.Float32BufferAttribute(uv,2));return g;}
export async function waitForTextures(){await new Promise((resolve,reject)=>{if(T.DefaultLoadingManager.isLoading===false)return resolve();const old=T.DefaultLoadingManager.onLoad;T.DefaultLoadingManager.onLoad=()=>{old?.();resolve();};T.DefaultLoadingManager.onError=url=>reject(new Error(`Texture failed: ${url}`));setTimeout(resolve,15000);});}

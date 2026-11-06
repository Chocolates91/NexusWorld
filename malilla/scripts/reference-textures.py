"""Original PBR maps interpreted from reference finishes, not photographs or scans.
The supplied photographs (which include people) are not copied into public assets.
Python dependencies: NumPy, Pillow. Fixed seeds keep all maps reproducible.
"""
from pathlib import Path
import numpy as np
from PIL import Image
OUT=Path(__file__).resolve().parents[1]/'public/textures'

def generate(name,n,kind,seed):
 rng=np.random.default_rng(seed)
 y,x=np.mgrid[0:n,0:n].astype(np.float32)/n
 def smooth(k):
  return (np.asarray(Image.fromarray(rng.integers(0,255,(k,k),dtype=np.uint8)).resize((n,n),Image.Resampling.BICUBIC)).astype(np.float32)-128)/128
 low=smooth(16); mid=smooth(128); fine=rng.normal(0,1,(n,n)).astype(np.float32)
 if kind=='tile':
  # A 1.2m sample: 600 x 300mm tiles, joints ~1.5mm.
  joint=(np.mod(x*2,1)<.0025)|(np.mod(y*4,1)<.005)
  tile_tone=np.sin(np.floor(x*2)*51+np.floor(y*4)*29)*.7
  v=low*.6+mid*.3+fine*.12+tile_tone
  rgb=np.dstack((239+v,238+v,233+v));rgb[joint]-=18
  height=mid*.004+fine*.001-joint*.35; rough=.29+low*.018+joint*.28
 elif kind in ['vanity','woodtile','floor']:
  # Long grain and end-grain knots run vertically in vanity/ceramic wall tiles.
  warp=x*65+np.sin(y*11)*.6+low*.9
  grain=np.sin(warp*2*np.pi)*1.3+np.sin(warp*5*np.pi)*.7
  knot=np.sin(np.sqrt(((x-.29)*6)**2+((y-.66)*1.3)**2)*80+low)*np.exp(-((x-.29)**2*140+(y-.66)**2*5))*3
  tone=low*6+mid*3+grain*2.2+knot*2.4+fine*.5
  if kind=='floor':
   row=np.floor(y*12);phase=(row%3)*.333
   joint=(np.mod(y*12,1)<.006)|(np.mod(x*2+phase,1)<.0015)
   tone=low*4+mid*1.4+np.sin(y*1200+np.sin(x*17)*3+low)*1.4+np.sin(row*7)*3+fine*.4
   rgb=np.dstack((176+tone,164+tone,143+tone));rgb[joint]-=17
   height=tone*.012-joint*.24;rough=.69+mid*.025
  else:
   base=(173,161,140) if kind=='woodtile' else (180,167,144)
   rgb=np.dstack(tuple(c+tone for c in base))
   height=grain*.025+fine*.008;rough=.55+mid*.04
   if kind=='woodtile':
    joint=(np.mod(x*8,1)<.009)|(np.mod(y*2,1)<.003)
    rgb[joint]-=19;height-=joint*.28;rough+=joint*.14
 else:
  # Cream porcelain with branching warm stone veins, 1.2m / four 600mm tiles.
  rgb=np.dstack((231+low*2+fine*.2,229+low*2+fine*.2,221+low*2+fine*.2))
  vein=np.zeros_like(x)
  for k,(phase,angle,weight) in enumerate([(0.09,.64,1),(.62,.67,.6),(.28,-.75,.35)]):
   f=x+angle*y-phase+.037*np.sin(y*17+k)+low*.021+mid*.002
   dist=np.abs(np.sin(f*np.pi*1.65))
   broad=np.exp(-(dist/.032)**2)*weight
   core=np.exp(-(dist/.006)**2)*weight
   vein=np.maximum(vein,broad*.45+core*.55)
   rgb-=broad[:,:,None]*np.array([12,20,32])+core[:,:,None]*np.array([22,38,58])
   for j in range(2):
    d=np.abs(np.sin((f+(y-.5)*(.13+j*.15)+.04*j)*np.pi*1.65))
    twig=np.exp(-(d/.0025)**2)*np.exp(-((y-(.2+j*.45))/.22)**2)*.7
    rgb-=twig[:,:,None]*np.array([14,25,39])
  joint=(np.mod(x*2,1)<.002)|(np.mod(y*2,1)<.002)
  rgb[joint]-=23;height=mid*.002-joint*.3;rough=.31+mid*.018+vein*.012+joint*.25
 Image.fromarray(np.uint8(np.clip(rgb,0,255))).save(OUT/f'{name}-color.webp',quality=94)
 dy,dx=np.gradient(height);normal=np.dstack((-dx*3,-dy*3,np.ones_like(dx)));normal/=np.linalg.norm(normal,axis=2,keepdims=True)
 im=Image.fromarray(np.uint8((normal*.5+.5)*255));im.resize((2048,2048),Image.Resampling.LANCZOS).save(OUT/f'{name}-normal.webp',quality=94)
 im=Image.fromarray(np.uint8(np.clip(rough,0,1)*255));im.resize((2048,2048),Image.Resampling.LANCZOS).save(OUT/f'{name}-rough.webp',quality=91)
 print(name,n,flush=True)
for args in [('porcelain-white',2048,'tile',21),('wood-ceramic',2048,'woodtile',42),('oak-vanity',2048,'vanity',53),('grey-oak',2048,'floor',64),('calacatta-warm',4096,'marble',75)]:generate(*args)

"""Deterministic original PBR maps. No downloaded or unlicensed textures."""
from pathlib import Path
import numpy as np
from PIL import Image, ImageFilter
OUT=Path(__file__).resolve().parents[1]/'public/textures'; OUT.mkdir(parents=True,exist_ok=True)
N=2048
rng=np.random.default_rng(311)
y,x=np.mgrid[0:N,0:N].astype(np.float32)/N
noise=rng.normal(0,1,(N,N)).astype(np.float32)
def smooth(scale):
 a=Image.fromarray(rng.integers(0,255,(scale,scale),dtype=np.uint8)).resize((N,N),Image.Resampling.BICUBIC)
 return (np.asarray(a).astype(np.float32)-128)/128
low=smooth(16); medium=smooth(128)
def save(name,base,height,rough,strength):
 base=np.clip(base,0,255).astype(np.uint8)
 Image.fromarray(base).save(OUT/f'{name}-color.webp',quality=92)
 dy,dx=np.gradient(height)
 normal=np.dstack((-dx*strength, -dy*strength, np.ones_like(dx)))
 normal/=np.linalg.norm(normal,axis=2,keepdims=True)
 Image.fromarray(np.uint8((normal*.5+.5)*255)).save(OUT/f'{name}-normal.webp',quality=95)
 Image.fromarray(np.uint8(np.clip(rough,0,1)*255)).save(OUT/f'{name}-rough.webp',quality=90)
# 2.4 x 2.4 m oak parquet sample: 8 rows, staggered 1.2m boards.
row=np.floor(y*8); grain=np.sin(x*1800+np.sin(x*27+row*2)*4+medium*1.5)
v=low*7+medium*3+grain*2.2+noise*.7
joints=(np.mod(y*8,1)<.006)|(np.mod(x*2+(row%3)*.33,1)<.003)
plank=np.sin(row*33+np.floor(x*2+(row%3)*.33)*9)*7
wood=np.dstack((181+v+plank,146+v+plank,105+v+plank))
wood[joints]*=.66
save('oak',wood,v*.15-joints*4,np.clip(.65+v*.006,.4,.85),3)
# Unjoined furniture oak with fine long grain
v=low*5+medium*3+np.sin(x*1600+np.sin(y*10)*6+low*3)*2+noise*.6
save('timber',np.dstack((192+v,159+v,117+v)),v*.2,.6+low*.05,3)
# Woven linen, approximately 30cm sample, individually crossing threads
weave=np.sin(x*2*np.pi*250)*np.cos(y*2*np.pi*250)
v=weave*5+medium*3+noise*1.5
save('linen',np.dstack((238+v,232+v,219+v)),weave*.7+noise*.15,np.full((N,N),.95)+medium*.025,2)
# Honed limestone, 1.2m sample; 60cm joints
vein=np.sin(x*14+y*7+low*4); v=low*7+medium*2+noise*.7+vein*1.5
joints=(np.mod(x*2,1)<.0025)|(np.mod(y*2,1)<.0025)
a=np.dstack((210+v,204+v,192+v)); a[joints]-=23
save('stone',a,v*.04-joints*.8,.63+medium*.06,4)
# Subtle plaster micro-relief
v=medium*2+noise*.9
save('plaster',np.dstack((244+v,241+v,232+v)),v*.03,np.full((N,N),.9)+medium*.02,2)
# Larger rug loop weave, 30cm sample
v=np.sin(x*2*np.pi*95)*np.sin(y*2*np.pi*110)
q=medium*4+v*6+noise
save('rug',np.dstack((207+q,190+q,162+q)),v*.6+noise*.12,np.full((N,N),.98),3)
print('Generated 18 original 2048px maps')

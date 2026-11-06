import {DOORS,WINDOWS} from './source-plan.js';
const entrance=DOORS.find(d=>d.name==='Entrada');
const glazing=WINDOWS.find(w=>w.door&&w.r[0]>7);
export const entrySpec={
 entrance:{rect:[...entrance.r],height:2.10,hinge:'right',closed:true,estimated:true},
 intercom:{width:.15,height:.23,handset:.23,mountHeight:1.38,estimated:true},
 services:{width:.34,depth:.012,heights:[.35,.43,.43],bottom:.20,gap:.035,estimated:true},
 glazing:{rect:[...glazing.r],height:glazing.head,panes:3,movingPane:1,openAngle:82,estimated:true},
 beam:{bottom:2.27,estimated:true},
 daylight:{position:[13.5,6.8,15.5],target:[5,0,4],estimated:true},
};
// Static open central leaf: fixed panes remain obstacles, while its aperture is walkable.
export function terraceLeafPlan(){const[x0,z0,x1,z1]=entrySpec.glazing.rect,z=(z0+z1)/2,pane=(x1-x0)/3,w=pane-.065,hinge=x0+2*pane-.0325,a=entrySpec.glazing.openAngle*Math.PI/180;return {z,pane,width:w,hinge,angle:a,poly:[[-w,-.025],[0,-.025],[0,.025],[-w,.025]].map(([x,dz])=>[hinge+x*Math.cos(a)+dz*Math.sin(a),z-x*Math.sin(a)+dz*Math.cos(a)])};}

import {WALLS,P_WINBAND,RAILING} from './source-plan.js';
export const architectureColliders=[...WALLS.map(w=>w.poly),P_WINBAND,RAILING.poly];

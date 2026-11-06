// Visual observations from the five reference photos supplied in chat.
// No dimensions are measured from a person or from perspective-distorted images.
export const referenceSpec = {
  bathroomId: 'bath1',
  fixtureIds: {sink:'f-lav1',toilet:'f-wc1',shower:'f-duc'},
  wallTile: {width:0.60,height:0.30,joint:0.0015,estimated:true},
  woodTile: {width:0.15,height:0.60,estimated:true},
  shower: {headDiameter:0.23,headHeight:2.08,mixerHeight:1.02,drainWidth:0.085,screen:false,estimated:true},
  vanity: {topThickness:0.045,feetHeight:0.10,leftDoorFraction:0.58,estimated:true},
  wardrobe: {openId:'f-ar1',openAngle:105,shelfFraction:0.79,estimated:true},
  mapSizes: {'porcelain-white':2048,'wood-ceramic':2048,'oak-vanity':2048,'grey-oak':2048,'calacatta-warm':4096},
};

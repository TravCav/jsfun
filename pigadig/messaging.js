const msgTypes = {
  none: 0,
  quest: 1,
  fight: 2,
  attacks: 4,
  itemEffect: 8
};

const outputs = msgTypes.fight | msgTypes.quest | msgTypes.attacks | msgTypes.itemEffects;

exports.msgTypes = msgTypes;
exports.canOutput = function (type) {
  return ((outputs & type) === type);
};
let Items = require('./items');
let messaging = require('./messaging');

//stuff you can encounter in adventure
const entities = [{
    name: "guineapig",
    attacks: [{
        name: "poopy turd",
        damage: 1,
        description: "a basic attack"
    }]
},
{
    name: "flower",
    dropitems: [{
      item:"oxygen",
      qty:1
    }],
    attacks: [{
      name:"pollination",
      damage:1,
      description: "a basic attack"
    }]
},
{
    name: "potato"
},
{
    name: "watermelone",
    hp: 5,
    dropitems: [{
        item: "water",
        qty: 2
    }]
},
{
  name: "nacho",
  hp:4,
  dropitems:[{
      item:"coin",
      qty:1
  }],
  attacks: [{
    name:"cheesy lava",
    damage:2,
    description: "intermediate attack"
  }]
},
{
  name: "grumpy narwhal",
  hp:10,
  dropitems:[{
      item:"water",
      qty:3
  }],
  attacks: [{
    name:"pokey splash",
    damage:1,
    description: "a basic attack"
  }]
},
{
  name: "pickle",
  hp:1,
  dropitems:[{
      item:"vinegar",
      qty:1
  }],
  attacks: [{
    name:"acidic spit",
    damage:1,
    description: "a basic attack"
  }]
},
{
  name: "cheap skate",
  hp:12,
  dropitems:[{
      item:"stone",
      qty:1
  }],
  attacks: [{
    name:"penny pinch",
    damage:1,
    description: "a basic attack"
  }]
},
{
  name: "slipper",
  hp:3,
  dropitems:[{
      item:"wood",
      qty:1
  }],
  attacks: [{
    name:"slipper slap",
    damage:1,
    description: "a basic attack"
  }]
},
{
  name: "chunky monkey",
  hp:6,
  dropitems:[{
      item:"milk",
      qty:1
  }],
  attacks: [{
    name:"dairy devil spin",
    damage:2,
    description: "intermediate attack"
  }]
},
{
  name: "canada geese",
  hp:2,
  dropitems:[{
      item:"feather",
      qty:1
  }],
  attacks: [{
    name:"noisy gaggle",
    damage:1,
    description: "a basic attack"
  }]
},
{
  name: "olaf",
  hp:4,
  dropitems:[{
      item:"water",
      qty:1
  }],
  attacks: [{
    name:"cold shoulder",
    damage:1,
    description: "a basic attack"
  }]
},
{
  name: "overwatch community",
  hp:6,
  dropitems:[{
      item:"salt",
      qty:1
  }],
  attacks: [{
    name:"poser mentality",
    damage:2,
    description: "intermediate attack"
  }]
}
];



class Entity {
    constructor(parameters) {
      this.name = parameters.name;
      this.maxHp = parameters.hp || 1;
      this.hp = parameters.hp || 1;
      this.str = parameters.str || 1;
      this.dropitems = parameters.dropitems || [];
      this.inventory = [];
      this.timeSpent = 0;
      this.attacks = parameters.attacks || [{
        name: "melee",
        damage: 1 + this.str,
        description: "a basic attack"
      }];
    }
  
    Attack(entity, attack) {
      if (messaging.canOutput(messaging.msgTypes.attacks)) {
        console.log(
          this.name + " attacks " + entity.name + " with " + attack.name
        );
      }
      this.timeSpent++;
      entity.TakeDamage(attack);
      this.str += 0.01;
    }
  
    DeconstructItem(itemName) {
      console.log("You attempt to break apart " + itemName);
      const item = Items.LookupItem(itemName);
  
      if (item.dependencies.length > 0) {
        let itemRemoved = this.RemoveItemsFromInventory(itemName, 1);
        if (itemRemoved) {
          item.dependencies.forEach(dependency => {
            Items.GiveItems(this, dependency.item, dependency.qty);
          });
  
          this.timeSpent += item.craftTime / 2;
          console.log("You are successful and store the parts in your bag.");
        } else {
          console.log(
            "Turns out you didn't have any " +
            itemName +
            " to break apart anyway."
          );
        }
      } else {
        console.log("You try to break it but, nothing happens.");
      }
    }
  
    HasItems(itemName, qty) {
      let hasItems = false;
  
      this.inventory.forEach(item => {
        if (item.name === itemName) {
          if (item.qty >= qty) {
            hasItems = true;
          }
        }
      });
  
      return hasItems;
    }
  
    MakeItem(itemName) {
      console.log("You set out to make " + itemName);
      const item = Items.LookupItem(itemName);
      let canMakeItem = false;
  
      // does it have any requirements
      if (item.dependencies != undefined && item.dependencies.length > 0) {
        let missingItems = false;
        // can we meet the requirements
        item.dependencies.forEach(dependency => {
          missingItems |= !this.HasItems(dependency.item, dependency.qty);
        });
  
        if (!missingItems) {
          item.dependencies.forEach(dependency => {
            this.RemoveItemsFromInventory(dependency.item, dependency.qty);
          });
  
          canMakeItem = true;
        }
      }
  
      // We meet the requirements. Make the Item.
      if (canMakeItem) {
        console.log("After a bit of work you make " + item.name);
        this.timeSpent += item.craftTime;
        Items.GiveItems(this, item.name, 1);
      } else {
        console.log(
          "Realizing you don't have the parts you need, you hang your head in shame."
        );
      }
    }
  
    RemoveItemsFromInventory(itemName, qty) {
      for (let index = 0; index < this.inventory.length; index++) {
        let item = this.inventory[index];
        if (item.name == itemName) {
          if (item.qty >= qty) {
            item.qty -= qty;
            if (item.qty === 0) {
              // that was the last one.
              this.inventory.splice(index, 1);
            }
  
            return true;
          } else {
            console.log("don't have enough of those.");
  
            return false;
          }
        }
      }
    }
  
    SellItem(itemName) {
      const item = Items.LookupItem(itemName);
      if (this.HasItems(itemName, 1)) {
        this.RemoveItemsFromInventory(itemName, 1);
        Items.GiveItems(this, 'coin', item.value);
      }
    }
  
    BuyItem(itemName) {
      const item = Items.LookupItem(itemName);
      if (this.HasItems('coin', item.value)) {
        this.RemoveItemsFromInventory('coin', item.value);
        Items.GiveItems(this, itemName, 1);
        console.log('You bought a ' + item.name);
      } else {
        console.log('You don\'t have enough coin.');
      }
    }
  
    TakeDamage(attack) {
      this.hp -= attack.damage;
      if (this.hp <= 0) {
        console.log(this.name + " has died to death.");
      }
    }
  
    UseItem(itemName) {
      const item = Items.LookupItem(itemName);
      if (this.HasItems(item.name, 1)) {
        console.log("You used " + item.name + ".");
        item.effect(this);
        this.RemoveItemsFromInventory(item.name, 1);
      }
    }
  }


//returns a random object for the encounter
function GetRandomEntity() {
    return new Entity(entities[Math.floor(Math.random() * entities.length)]);
  }
  
  
  exports.Entity = Entity;
  exports.GetRandomEntity = GetRandomEntity;

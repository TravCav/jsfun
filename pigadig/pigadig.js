let Items = require('./items');
let messaging = require('./messaging');
let Entity = require('./Entity');
let readline = require('readline');
let readline2 = require('readline');
let fs = require('fs');

let player = new Entity.Entity({
  name: "player",
  hp: 10
});

function D20() {
  return Math.floor(Math.random() * 20) + 1;
}

//Adventure activity in which you encounter an object
function FightSomething() {
  let entity = Entity.GetRandomEntity();
  console.log("You encounter a", entity.name);
  Fight(entity);

  entity.dropitems.forEach(dropitem => {
    Items.GiveItems(player, dropitem.item, dropitem.qty);
  });
}

function DeliveryQuest() {
  console.log(
    "Nameless NPC needs " + Items.GetRandomItem().name + " to be delivered."
  );

  if (D20() < 5) {
    console.log("The delivery is not as uneventful as you had hoped.");
    FightSomething();
  }

  if (player.hp <= 0) {
    return;
  }

  console.log("You make the delivery and Nameless NPC is grateful.");
}

function WanderAbout() {
  let randomItem = Items.GetRandomItem();
  Items.GiveItems(player, randomItem.name, 1);
  player.timeSpent += 5;
  console.log(
    "You wander aimlessly, but find no adventuring to be had. You did happen to find some " +
    randomItem.name +
    " though."
  );
}

function GoAdventuring() {
  switch (Math.floor(Math.random() * 3)) {
    case 0:
      // Kill quest
      FightSomething();
      break;
    case 1:
      // Delivery quest
      DeliveryQuest();
      break;
      // // case 2:
      // //   // Gather quest
      // //   console.log("Nothing needs gathered.");
      // //   break;
      // // case 3:
      // //   // Escort quest
      // //   console.log("Nothing needs escorted.");
      // //   break;
    default:
      WanderAbout();
      break;
  }
}


//action taken against an entity in an encounter
function Fight(entity) {
  console.log("You fight the", entity.name);

  while (player.hp > 0 && entity.hp > 0) {
    let playerAttack =
      player.attacks[Math.floor(Math.random() * player.attacks.length)];
    player.Attack(entity, playerAttack);

    if (entity.hp > 0) {
      let entityAttack =
        entity.attacks[Math.floor(Math.random() * entity.attacks.length)];
      entity.Attack(player, entityAttack);
    }
  }
}


function DoAdventure() {

  console.log("And here our adventure begins...");

  while (player.hp > 0) {
    while (player.HasItems('hydrogen', 2) && player.HasItems('oxygen', 1)) {
      player.MakeItem('water');
    }

    while (player.hp < player.maxHp && player.HasItems('water', 1)) {
      player.UseItem("water");
    }

    GoAdventuring();
  }

  // // // // player.SellItem('water');
  // // // // player.BuyItem('hydrogen');
  // // WanderAbout();
  // // DeliveryQuest();
  // // FightSomething();

  // // Items.GiveItems(player, 'hydrogen', 2);
  // // Items.GiveItems(player, 'oxygen', 1);
  // // player.MakeItem('water');
  // // player.UseItem('water');

  // // Items.GiveItems(player, 'water', 1);
  // // player.DeconstructItem('water');

  // // player.SellItem('hydrogen');

  // // player.BuyItem('oxygen');

  console.log("Finished with: \r\n", player);
  console.log("Farewell");
}

function InteractiveMode() {

  let rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout
  });

  rl.question('What is your name? ', (answer) => {
    console.log(`Thanks for playing ${answer}`);
    console.log('Please choose what you want to do next.');
    console.log('You can Adventure, Quest, Fight, or Quit.');
    console.log('What do you want to do?');
    //DoAdventure();

  });


  rl.on('line', (line) => {
    console.log(`You chose to ${line}`);
    switch (line.toLowerCase()) {
      case 'adventure':
        DoAdventure();
        console.log('You can Adventure, Quest, Fight, or Quit.');
        console.log('What do you want to do?');
        break;
      case 'quest':
        DeliveryQuest();
        console.log('You can Adventure, Quest, Fight, or Quit.');
        console.log('What do you want to do?');
        break;
      case 'fight':
        FightSomething();
        console.log('You can Adventure, Quest, Fight, or Quit.');
        console.log('What do you want to do?');
        break;
      case 'quit':
        console.log('Thanks for playing.');
        rl.close();
        break;
      default:
        WanderAbout();
        console.log('You can Adventure, Quest, Fight, or Quit.');
        console.log('What do you want to do?');
        break;
    }
  });
}


DoAdventure();
//InteractiveMode();

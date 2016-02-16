/*~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~
          ______     ______     ______   __  __     __     ______
          /\  == \   /\  __ \   /\__  _\ /\ \/ /    /\ \   /\__  _\
          \ \  __<   \ \ \/\ \  \/_/\ \/ \ \  _"-.  \ \ \  \/_/\ \/
          \ \_____\  \ \_____\    \ \_\  \ \_\ \_\  \ \_\    \ \_\
           \/_____/   \/_____/     \/_/   \/_/\/_/   \/_/     \/_/


This is a sample Slack bot built with Botkit.

This bot demonstrates a multi-stage conversation

# RUN THE BOT:

  Get a Bot token from Slack:

    -> http://my.slack.com/services/new/bot

  Run your bot from the command line:

    token=<MY TOKEN> node demo_bot.js

# USE THE BOT:

  tbd.

# EXTEND THE BOT:

  Botkit is has many features for building cool and useful bots!

  Read all about it here:

    -> http://howdy.ai/botkit

~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~*/

var Botkit = require('./node_modules/botkit/lib/Botkit.js');

var restaurants = [];
var groups = [];

// groups = [
//   {
//     restaurant: 'Chopsticks',
//     users: ['@romans', '@dominike', '@carmen']
//   }
// ];


if (!process.env.token) {
  console.log('Error: Specify token in environment');
  process.exit(1);
}

var controller = Botkit.slackbot({
  debug: true
});

var bot = controller.spawn({
  token: process.env.token
});

bot.startRTM(function(err) {
  if (err) {
    throw new Error(err);
  }
});

bot.utterances = {
  yes: new RegExp(/^(ja|jo|japp|si|jepp|jep|ok|y|yeah|yah)/i),
  no: new RegExp(/^(nein|nö|ne|no|nah|nope|n)/i),
};

controller.hears(['hi', 'hallo', 'hey', 'help', 'hilfe'] ,['direct_message'], function(bot, message) {
  fetchUser(message.user, function(err, response) {
    bot.reply(message, 'Hi, ' + response.user.profile.first_name + '!');
    bot.reply(message, 'Ich kann Dir dabei helfen, dich mit Deinen Kollegen zum Mittagessen zu verabreden.');
    bot.reply(message, 'Du kannst `pläne` aufrufen, um die Essenspläne Deiner Kollegen zu sehen oder `hunger`, um Dich mit Ihnen zu verabreden.');
  });
});

controller.hears(['Plan', 'Pläne'] ,['direct_message'], function(bot, message) {
  showGroups(bot, message);
});

controller.hears(['hunger', 'kohldampf'] ,['direct_message'], function(bot, message) {
  showGroups(bot, message);
  bot.startConversation(message, askFood);
});

// Conversation elements

askFood = function(response, convo) {
  if (groups.length > 0) {
    askToJoin(response, convo);
  } else {
    askForRestaurant(response, convo);
  }
}

askToJoin = function(response, convo) {
  convo.ask('Möchtest Du Dich irgendwo anschließen?', [{
      pattern: bot.utterances.yes,
      callback: function(response, convo) {
        askForGroup(response, convo);
        convo.next();
      }
    },
    {
      pattern: bot.utterances.no,
      default: true,
      callback: function(response, convo) {
        askForRestaurant(response, convo);
        convo.next();
      }
    }
  ]);
}

askForGroup = function(response, convo) {
  convo.ask('Wo möchtest Du Dich anschließen?', function(response, convo) {
    fetchUser(response.user, function(err, fetchResponse) {
      addUser(fetchResponse.user.name, response.text);
      convo.say('Ich habe Dich zur Gruppe `' + response.text + '` hinzugefügt!');
      convo.next();
    });
  });
}

askForRestaurant = function(response, convo) {
  convo.ask('Wo möchtest Du denn essen?', function(response, convo) {
    fetchUser(response.user, function(err, fetchResponse) {
      addUser(fetchResponse.user.name, response.text);
      convo.say('Ich habe Deinen Wunsch entgegen genommen!');
      convo.next();
    });
  });
}

// Helpers

addUser = function(user, restaurant) {
  var group;
  var found = false;
  var userString = '@' + user;

  for (var i = 0; i < groups.length && !found; i++) {
    group = groups[i];
    if (group.restaurant === restaurant) {
      group.users.push(userString);
      found = true;
    }
  }

  if (!found) {
    var newGroup = {
      restaurant: restaurant,
      users: [userString]
    }
    groups.push(newGroup);
  }
}

fetchUser = function(id, callback) {
  bot.api.users.info({ user: id }, callback);
}

printGroup = function(group) {
  var groupString = '';
  for (var i = 0; i < group.length; i++) {
    groupString += group[i] + ' ';
  }
  return groupString;
}

showGroups = function (bot, message) {
  if (groups.length > 0) {
    bot.reply(message, "Es gibt folgende Pläne:");
    for (var i = 0; i < groups.length; i++) {
      var group = groups[i];
      bot.reply(message, group.restaurant + ': ' + printGroup(group.users));
    }
  } else {
    bot.reply(message, "Es gibt noch keine Pläne.");
  }
}

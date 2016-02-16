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

  Find your bot inside Slack

  Say: "pizzatime"

  The bot will reply "What flavor of pizza do you want?"

  Say what flavor you want.

  The bot will reply "Awesome" "What size do you want?"

  Say what size you want.

  The bot will reply "Ok." "So where do you want it delivered?"

  Say where you want it delivered.

  The bot will reply "Ok! Good by."

  ...and will refrain from billing your card because this is just a demo :P

# EXTEND THE BOT:

  Botkit is has many features for building cool and useful bots!

  Read all about it here:

    -> http://howdy.ai/botkit

~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~*/

var Botkit = require('./node_modules/botkit/lib/Botkit.js');

if (!process.env.token) {
  console.log('Error: Specify token in environment');
  process.exit(1);
}

var controller = Botkit.slackbot({
  debug: true
});

controller.spawn({
  token: process.env.token
}).startRTM(function(err) {
  if (err) {
    throw new Error(err);
  }
});

controller.hears(['hi', 'hallo', 'hello', 'Pläne', 'Plan'],['direct_message'], function(bot, message) {
  bot.api.users.info({ user: message.user },function(err,response) {
    bot.reply(message, 'Hi, ' + response.user.profile.first_name + '!');
    bot.startConversation(message, askFood);
  })
});

askFood = function(response, convo) {
  // Show plans/groups
  // User: Ich möchte mich x anschließen oder Ich gehe zu X

  convo.ask("Wo möchtest Du essen gehen?", function(response, convo) {
    convo.say("Cool, dann fahr da doch hin.");
    convo.next();
  });
}

// askFlavor = function(response, convo) {
//   convo.ask("What flavor of pizza do you want?", function(response, convo) {
//     convo.say("Awesome.");
//     askSize(response, convo);
//     convo.next();
//   });
// }
// askSize = function(response, convo) {
//   convo.ask("What size do you want?", function(response, convo) {
//     convo.say("Ok.")
//     askWhereDeliver(response, convo);
//     convo.next();
//   });
// }
// askWhereDeliver = function(response, convo) {
//   convo.ask("So where do you want it delivered?", function(response, convo) {
//     convo.say("Ok! Good by.");
//     convo.next();
//   });
// }

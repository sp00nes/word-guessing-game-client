'use strict';

const inquirer = require('inquirer');
const User = require('./roles/userClass');
const GM = require('./roles/gmClass');
const chalk = require('chalk');

// const { } = require('./handler');

const { io } = require('socket.io-client');
const socket = io.connect('http://localhost:3001/game');

const questions = [
  {
    type: 'input',
    name: 'name',
    message: chalk.green('What is your name?'),
  },
  {
    type: 'list',
    name: 'role',
    message: 'Are you a Player or a Game Master?',
    choices: ['Player', 'Game Master'],
  },
];

inquirer.prompt(questions).then((answers) => {
  socket.emit('CLIENT-CONNECT', answers);
}).catch((error) => {
  if (error.isTtyError) {
    console.log('Prompt could not be rendered in the current environment');
  } else {
    console.log('Something else went wrong');
  }
});

socket.on('USER-CONNECTED', (payload) => {
  console.log(chalk.green('User connected'));
  let user = new User(payload);
  console.log(user);
});

socket.on('GM-CONNECTED', (payload) => {
  console.log(chalk.green('GM connected'));
  let gm = new GM(payload);
  console.log(gm);
});

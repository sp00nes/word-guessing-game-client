'use strict';

const inquirer = require('inquirer');
const chalk = require('chalk');
const GM = require('../roles/gmClass');
// const { } = require('./handler');
var Chance = require('chance');
var chance = new Chance();

const { io } = require('socket.io-client');
const socket = io.connect('http://localhost:3001/game');

const questions = [
  {
    type: 'input',
    name: 'name',
    message: chalk.blue('What is your name?'),
  },
  {
    type: 'input',
    name: 'clue',
    message: chalk.blue('What is the clue?'),
  },
];
let gm = {};

inquirer.prompt(questions[0]).then((answers) => {
  socket.emit('CLIENT-CONNECT', { ...answers, role: 'Game Master' });
}).catch((error) => {
  if (error.isTtyError) {
    console.log('Prompt could not be rendered in the current environment');
  } else {
    console.log('Something else went wrong');
  }
});

socket.on('GM-CONNECTED', (payload) => {
  console.log(chalk.green('GM connected'));
  gm = new GM(payload);
  console.log(gm);
  let secretWord = chance.animal();
  console.log(chalk.red(`your secret word is ${secretWord}`));
  inquirer.prompt([questions[1]]).then((answers) => {
    socket.emit('CLUE', { ...answers, secretWord: secretWord});
  }).catch((error) => {
    if (error.isTtyError) {
      console.log('Prompt could not be rendered in the current environment');
    } else {
      console.log('Something else went wrong');
    }
  });
});

socket.on('WRONG-GUESS', (payload) => {
  console.log(chalk.red(`${payload.user.name} guessed ${payload.guess}`));
  inquirer.prompt([questions[1]]).then((answers) => {
    socket.emit('CLUE', { ...payload, ...answers});
  }).catch((error) => {
    if (error.isTtyError) {
      console.log('Prompt could not be rendered in the current environment');
    } else {
      console.log('Something else went wrong');
    }
  });
});

socket.on('CORRECT-GUESS', (payload) => {
  console.log(chalk.green(`${payload.user.name} guessed correctly!`));
  process.exit(0);
});

// {
//   type: 'list',
//   name: 'role',
//   message: 'Are you a Player or a Game Master?',
//   choices: ['Player', 'Game Master'],
// },

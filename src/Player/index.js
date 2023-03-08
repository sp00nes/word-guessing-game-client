'use strict';

const inquirer = require('inquirer');
const chalk = require('chalk');
const User = require('../roles/userClass');
// const { } = require('./handler');

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
    name: 'guess',
    message: chalk.blue('What is your guess?'),
  },
];
let user = {};

inquirer.prompt([questions[0]]).then((answers) => {
  socket.emit('CLIENT-CONNECT', { ...answers, role: 'Player' });
}).catch((error) => {
  if (error.isTtyError) {
    console.log('Prompt could not be rendered in the current environment');
  } else {
    console.log('Something else went wrong');
  }
});

socket.on('USER-CONNECTED', (payload) => {
  console.log(chalk.green('User connected'));
  user = new User(payload);
});

socket.on('CLUE', (payload) => {
  console.log(chalk.blue(`Your clue is ${payload.clue}`));
  inquirer.prompt([questions[1]]).then((answers) => {
    if (payload.secretWord === answers.guess) {
      socket.emit('CORRECT-GUESS', {...answers, ...payload, user: user});
      console.log(chalk.green('CORRECT GUESS!!'));
      process.exit(0);
    } else {
      socket.emit('WRONG-GUESS', {...answers, ...payload, user: user});
    }
  }).catch((error) => {
    if (error.isTtyError) {
      console.log('Prompt could not be rendered in the current environment');
    } else {
      console.log('Something else went wrong');
    }
  });
});

socket.on('CORRECT-GUESS', (payload) => {
  console.log(chalk.green(`${payload.user.name} has guessed the correct word! The word was ${payload.secretWord}`));
  process.exit(0);
});

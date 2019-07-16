#!/usr/bin/node
"use strict";

var inquirer = require("inquirer");
var chalk = require("chalk");

var response = chalk.bold.green;

var resume = require("./resumeInfo.json");

const MAX_ALLOWED_CHAR_PER_LINE = 70;
const MIN_CHAR_LIMIT_FOR_NO_FORMATTING = 50;

var resumePrompts = {
  type: "list",
  name: "resumeOptions",
  message: "What do you want to know about me?",
  choices: [...Object.keys(resume), "Exit"]
};

function main() {
  console.log("Hello,This is Arnab\nWelcome to my resume");
  resumeHandler();
}

function determineMinimumIndentation(keys){
    let minIndentation = 5;
    keys.forEach(key =>{
        minIndentation = Math.max(minIndentation, key.length + 5);
    });
    return minIndentation;
}

function buildAppropriateIndentation(key, minIndentation){
    let spaces = "";
    for(let i = 0; i < minIndentation - key.length; i++){
        spaces += " ";
    }
    return spaces;
}

function isObject(a) {
    return (!!a) && (a.constructor === Object);
};

function isArray(a) {
    return (!!a) && (a.constructor === Array);
};

function justifyLine(line, maxAllowedCharacter, currentIndentation){
    let words = line.split(" ");
    let formattedLine = "";
    let currentCharCount = 0;
    words.forEach(word => {
        if(currentCharCount + word.length <= maxAllowedCharacter){
            formattedLine += word + " ";
            currentCharCount += word.length + 1;
        }
        else{
            formattedLine += '\n';
            formattedLine += buildAppropriateIndentation("", currentIndentation);
            formattedLine += word + " ";
            currentCharCount = word.length + 2 + currentIndentation;
        }
    });
    formattedLine += '\n'
    return formattedLine;
}

function printBulletPoint(initialIndentation, bulletPoint){
    bulletPoint = bulletPoint.length <= MIN_CHAR_LIMIT_FOR_NO_FORMATTING ? bulletPoint : justifyLine(bulletPoint, MAX_ALLOWED_CHAR_PER_LINE, initialIndentation + 6);
  console.log(response(buildAppropriateIndentation("", initialIndentation) + "|  => " + bulletPoint));
  return;
}

function printEntry(initialIndentation, info, isMetaKey){
    let minIndentation = determineMinimumIndentation(Object.keys(info));
    Object.keys(info).forEach(key => {
      if(isObject(info[key])){
        console.log(response(buildAppropriateIndentation("", initialIndentation) + "|" + key + buildAppropriateIndentation(key, minIndentation) + "=> "));
        printEntry(minIndentation + 3, info[key], false);
      }
      else if(isArray(info[key])){
        console.log(response(buildAppropriateIndentation("", initialIndentation) + "|" + key + buildAppropriateIndentation(key, minIndentation) + "=> "));
        info[key].forEach(bulletPoint => {
            printBulletPoint(minIndentation + 3, bulletPoint)
        })
      }
      else{
        console.log(response(buildAppropriateIndentation("", initialIndentation) + "|" + key + buildAppropriateIndentation(key, minIndentation) + "=> " + info[key]));
      }
    });
    return;
}

function resumeHandler() {
  inquirer.prompt(resumePrompts).then(answer => {
    if (answer.resumeOptions == "Exit") {
      return;
    }
    var option = answer.resumeOptions;
    var iterations = 0;
    console.log(response("-----------------------------------------------------------------------------"));
    resume[`${option}`].forEach(info => {
      if(iterations > 0){
        console.log("\n")
      }
      printEntry(0, info, true);
      iterations++;
      
    });
    console.log(response("-----------------------------------------------------------------------------"));

    inquirer
      .prompt({
        type: "list",
        name: "exitBack",
        message: "Go back or Exit?",
        choices: ["Back", "Exit"]
      })
      .then(choice => {
        if (choice.exitBack == "Back") {
          resumeHandler();
        } else {
          return;
        }
      });
  });
}

main();
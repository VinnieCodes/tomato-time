import workComplete from "./assets/workComplete.mp3";
import breakComplete from "./assets/breakComplete.mp3";
import click from './assets/click.mp3';

function workCompleteSound() {
  new Audio(workComplete).play();
}

function breakCompleteSound() {
  new Audio(breakComplete).play();
}

function clickSound() {
  new Audio(click).play();
}

export {workCompleteSound, breakCompleteSound, clickSound};

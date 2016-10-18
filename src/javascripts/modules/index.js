/*
  Automatically instantiates modules based on data-attrubiutes
  specifying module file-names.
*/

Array.from(document.querySelectorAll('[data-module]')).forEach((el) =>{
  const name = el.getAttribute('data-module')
  const Module = require(`./${name}`).default
  new Module(el)
});

/*
  Usage:
  ======

  html
  ----
  <button data-module="disappear">disappear!</button>

  js
  --
  // modules/disappear.js
  export default class Disappear {
    constructor(el) {
      el.style.display = none
    }
  }
*/

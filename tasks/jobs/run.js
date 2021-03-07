const Job = require('../job');

module.exports = class RunJob extends Job {
  stdin;
  constructor({id, source, lang, timelimit, scenario, stdin}) {
    super({id, source, lang, timelimit, scenario});
    this.stdin = stdin;
  }
};

const Job = require('../job');

module.exports = class SubmitJob extends Job {
  testcases;
  constructor({id, source, lang, timelimit, scenario, testcases}) {
    super({id, source, lang, timelimit, scenario});
    this.testcases = testcases;
  }
};

const {mkdir, rm} = require('shelljs');
const config = require('../config');
const RunJob = require('./jobs/run');
const RunScenario = require('./scenarios/run');
const path = require('path');

async function execute(job) {
  const currentJobDir = path.join(config.RUNBOX.DIR, job.id.toString());
  mkdir('-p', currentJobDir);
  let scenario;
  if (job instanceof RunJob) scenario = new RunScenario();

  //Setup RUNBOX for execution
  await scenario.setup(currentJobDir, job);

  //Run the program in worker
  await scenario.run(currentJobDir, job);

  // Get result
  const result = await scenario.result(currentJobDir, job);
  rm('-rf', currentJobDir);

  return result;
}

module.exports = execute;

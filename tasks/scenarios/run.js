const config = require('../../config');
const Scenario = require('../scenario');
const fs = require('fs');
const path = require('path');
const {exec, cat} = require('shelljs');

module.exports = class RunScenario extends Scenario {
  setup(currentJobDir, job) {
    const LANG_CONFIG = config.LANGS[job.lang];

    fs.writeFileSync(
      path.join(currentJobDir, LANG_CONFIG.SOURCE_FILE),
      Buffer.from(job.source, 'base64').toString('ascii')
    );
    fs.writeFileSync(
      path.join(currentJobDir, 'run.stdin'),
      Buffer.from(job.stdin, 'base64').toString('ascii')
    );
  }
  async result(currentJobDir, job) {
    const stdout = exec(
      ` head -c ${config.MAX_OUTPUT_BUFFER} ${path.join(currentJobDir, 'run.stdout')}`
    );
    // Check for compile_stderr if can't find a stdout file ; stdout can be ''
    const compileStderr = cat(path.join(currentJobDir, 'compile.stderr')).toString();
    let stderr = compileStderr || cat(path.join(currentJobDir, 'run.stderr').toString());

    const runTime = cat(path.join(currentJobDir, 'runguard.time')).toString();
    const code = cat(path.join(currentJobDir, 'runguard.code')).toString();

    return {
      id: job.id,
      scenario: 'run',
      stderr: Buffer.from(stderr).toString('base64'),
      stdout: Buffer.from(stdout).toString('base64'),
      time: +runTime,
      code: +code,
    };
  }
};

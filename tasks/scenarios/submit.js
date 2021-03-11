const config = require('../../config');
const Scenario = require('../scenario');
const fs = require('fs');
const path = require('path');
const {exec, cat, mkdir} = require('shelljs');

module.exports = class SubmissionScenario extends Scenario {
  setup(currentJobDir, job) {
    const LANG_CONFIG = config.LANGS[job.lang];

    fs.writeFileSync(
      path.join(currentJobDir, LANG_CONFIG.SOURCE_FILE),
      Buffer.from(job.source, 'base64').toString('ascii')
    );
    const testCasesDir = path.join(currentJobDir, 'testcases');
    mkdir('-p', testCasesDir);
    job.testcases.map((testcase) => {
      const rootDir = path.join(testCasesDir, testcase.id);
      mkdir('-p', rootDir);
      fs.writeFileSync(
        path.join(rootDir, 'stdin'),
        Buffer.from(testcase.input, 'base64').toString()
      );
    });
    fs.writeFileSync(
      path.join(currentJobDir, 'run.stdin'),
      Buffer.from(job.stdin, 'base64').toString('ascii')
    );
  }
  async result(currentJobDir, job) {
    // Check for compile_stderr if can't find a stdout file ; stdout can be ''
    const compileStderr = cat(path.join(currentJobDir, 'compile.stderr')).toString();
    if (compileStderr) {
      return {
        id: job.id,
        scenario: 'submit',
        stderr: Buffer.from(stderr).toString('base64'),
        testcases: [],
      };
    }
    const testcases = job.testcases.map((testcase) => {
      const currentTestcaseDir = path.join(currentTestcaseDir, 'testcases', testcase.id);
      fs.writeFileSync(
        path.join(currentTestcaseDir, 'stdout'),
        Buffer.from(testcase.output, 'base64').toString()
      );
      let stderr =
        compileStderr || cat(path.join(currentTestcaseDir, 'run.stderr').toString());

      const time = cat(path.join(currentTestcaseDir, 'runguard.time')).toString();
      const code = cat(path.join(currentTestcaseDir, 'runguard.code')).toString();
      const runOutputFile = path.join(currentTestcaseDir, 'run.stdin');
      const expectedOutputFile = path.join(currentTestcaseDir, 'stdout');
      const diff = exec(
        `diff -b -B -a --suppress-common-lines --speed-large-files ${runOutputFile} ${expectedOutputFile}`
      );
      const score = diff.code === 0 ? 100 : 0;
      const result = new Array(
        +code === 143 && 'TLE',
        +code === 137 && 'MLE',
        +code !== 0 && 'Run Error',
        +code === 0 && score === 0 && 'Wrong Answer',
        +code === 0 && 'Success'
      ).reduce((acc, cur) => acc || cur);
      return {id: testcase.id, time, result, score};
    });
    return {
      id: job.id,
      scenario: 'submit',
      stderr: Buffer.from(compileStderr).toString('base64'),
      testcases,
    };
  }
};

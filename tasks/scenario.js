const {exec} = require('shelljs');
const config = require('../config');

module.exports = class Scenario {
  setup(currentJobDir, job) {
    throw new Error(' Not done yet');
  }
  run(currentJobDir, job) {
    const LANG_CONFIG = config.LANGS[job.lang];
    return exec(`docker run \\
    --cpus="${LANG_CONFIG.CPU_SHARE}" \\
    --memory="${LANG_CONFIG.MEM_LIMIT}" \\
    --ulimit nofile=64:64 \\
    --rm \\
    -v "${currentJobDir}":/usr/src/runbox \\
    -w /usr/src/runbox \\
    devabhijeet/oj-worker-${job.lang} \\
    /bin/judge.sh -t ${job.timelimit || 5} 
        `);
  }
  result(currentJobDir, job) {
    throw new Error('not implemented yet');
  }
};

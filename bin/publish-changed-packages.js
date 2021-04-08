const {execSync} = require('child_process')

let changes

let gitDiff = execSync('git diff --name-only').toString().split('\n')

if (gitDiff.length > 0 && gitDiff[0]) {
  console.error('The repo is not committed.')
  // eslint-disable-next-line no-process-exit
  process.exit(1)
}

function checkAndPublish(dir) {
  const pkg = dir === 'tweedentity' ? '' : '@tweedentity/'
  console.debug(`Checking  ${pkg}${dir}`)
  const version = require(`../packages/${dir}/package.json`).version
  const currVersion = execSync(`npm view ${pkg}${dir} | grep latest`).toString().split('\n')[0].split(' ')[1]
  if (version !== currVersion) {
    console.debug(`Publishing  ${pkg}${dir} v${version}`)
    console.debug(execSync(`cd packages/${dir} && pnpm publish ${/beta/.test(version) ? '--tag beta' : ''}`) .toString())
    changes = true
  }
}

checkAndPublish('solidity', '@tweedentity')

if (!changes) {
  console.debug('No upgrade needed.')
}

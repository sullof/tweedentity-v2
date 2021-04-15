#!/usr/bin/env node
const fs = require('fs-extra')
const path = require('path')

const ABIs = {}
let names = [
  'Tweedentities',
  'IdentityManager',
  'IdentityClaimer',
  'Twiptos'
]

for (let name of names) {
  let source = path.resolve(__dirname, `../artifacts/contracts/${name}.sol/${name}.json`)
  let json = require(source)
  ABIs[name] = json.abi
}

fs.writeFileSync(path.resolve(__dirname, '../../common/src/ABIs.json'), JSON.stringify(ABIs))


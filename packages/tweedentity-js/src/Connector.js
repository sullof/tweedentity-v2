const {Contract} = require('@ethersproject/contracts')
const config = require('../config')
const utils = require('./utils')

class Connector {

  constructor(provider) {
    this.provider = provider
    this.contracts = {}
  }

  async load() {

    let chainId = (await this.provider.getNetwork()).chainId

    let registry = config.deployed.TweedentityRegistry[chainId]
    if (!registry) {
      throw new Error('Unsupported network.')
    }

    this.contracts.TweedentityRegistry = new Contract(registry.address, config.ABIs.contracts.TweedentityRegistry, this.provider)

    const names = [
      'Tweedentities',
      'IdentityManager',
      'TweedentityClaimer'
    ]

    for (let name of names) {
      let bytes32Name = utils.stringToBytes32(name)
      try {
        const address = await this.contracts.TweedentityRegistry.registry(bytes32Name)
        this.contracts[name] = new Contract(address, config.ABIs.contracts[name], this.provider)
      } catch(e) {
        throw new Error(`Contract ${name} not found in registry`)
      }
    }
  }

}

module.exports = Connector

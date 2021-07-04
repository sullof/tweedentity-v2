const sigUtil = require('eth-sig-util')
const _ = require('lodash')
const config = require('../config')
const utils = require('./utils')
const Connector = require('./Connector')

class Client {

  constructor(provider) {
    this.connector = new Connector(provider)
    this.profiles = {}
    this.ready = false
  }

  async load() {
    if (!this.ready) {
      await this.connector.load()
    }
  }

  async getProfile(address, forceReload) {
    await this.load()
    if (address) {
      if (utils.isValidAddress(address)) {

        if (forceReload || !this.profiles[address]) {
          this.profiles[address] = {}
        } else {
          return this.profiles[address]
        }

        let profile = await this.connector.contracts.Tweedentities.profile(address)
        for (let app in config.apps) {
          let id = config.apps[app].id
          if (profile[id]) {
            this.profiles[address][app] = {
              id: profile[id],
              fullId: profile[id] * 100 + id
            }
          }
        }
        return this.profiles[address]

      } else {
        throw new Error('Invalid address')
      }
    } else {
      throw new Error('No address specified')
    }
  }

  static supportedApps() {
    return _.filter(Object.keys(config.apps), e => config.apps[e].active)
  }

}

module.exports = Client

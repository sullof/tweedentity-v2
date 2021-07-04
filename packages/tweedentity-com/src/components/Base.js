
// const PropTypes = require('prop-types')

const Common = require('./Common')
const clientApi = require('../utils/ClientApi')

class Base extends Common {

  constructor(props) {
    super(props)
    this.bindMany([
      'store',
      'request'
    ])
    if (props.api) {
      const api = props.api()
      for (let key in api) {
        this[key] = api[key]
      }
    }
  }

  request(api, method, data = {}, query = {}) {
    let accessToken
    if (this.Store && this.Store.accessToken) {
      accessToken = this.Store.accessToken
    }
    return clientApi.request(api, method, accessToken, data, query)
  }

  store(...params) {
    this.props.setStore(...params)
  }

  shortWallet() {
    if (this.Store && this.Store.wallet) {
      return this.Store.wallet.substring(0, 6)
    }
    return null
  }

  fetch(api, method, body) {
    return clientApi.fetch(api, method, body)
  }

  // appNickname() {
  //   return this.getGlobalState('appNickname')
  // }
  //
  // appId(webApp) {
  //   if (!webApp) {
  //     webApp = this.appNickname()
  //   }
  //   return this.appState().config.appId[webApp]
  // }
  //
  // capitalize(x) {
  //   return x //x.substring(0,1).toUpperCase() + x.substring(1)
  // }
  //
  // getEtherscan(address, netId) {
  //   if (!netId) {
  //     netId = this.appState().netId
  //   }
  //   return `https://${netId === '3' ? 'ropsten.' : ''}etherscan.io/address/${address}`
  // }
  //
  // appName() {
  //   return this.props.webApp
  //     ? this.capitalize(this.props.webApp)
  //     : this.capitalize(this.getGlobalState('appNickname'))
  // }
  //
  // appUid(data, webApp) {
  //   if (!webApp) {
  //     webApp = this.appNickname()
  //   }
  //   if (webApp === 'twitter') {
  //     return data.userId
  //   } else {
  //     return data.username ? data.username.toLowerCase() : null
  //   }
  // }
  //
  // appState() {
  //   // return this.props.app.appState
  // }
  //
  // getGlobalState(prop) {
  //   // const as = this.appState()
  //   // if (as.wallet) {
  //   //   const shortWallet = this.shortWallet()
  //   //   return (as.data[shortWallet]||{})[prop]
  //   // }
  // }
  //
  // setGlobalState(pars, states = {}) {
  //   // if (this.appState().wallet) {
  //   //   this.db.put(this.shortWallet(), pars)
  //   // }
  //   // this.props.app.callMethod('setAppState', states)
  // }

  render() {
    return <div/>
  }
}

module.exports = Base

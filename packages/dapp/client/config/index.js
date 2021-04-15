import BrokenJazz from './BrokenJazz.json'

const config = {
  supported: {
    'Görli Testnet': 5,
    'Binance Smart Chain Testnet': 97
  },
  address: {
    5: '0x4f0341015736F5B757447bDf479402D69BB2283d',
    97: '0x6D87c5460A6E3BB660A32EABB0A983E920b2EEd4',
    1337: '0x5FbDB2315678afecb367f032d93F642f64180aa3'
  },
  abi: BrokenJazz.abi,
  bytecode: BrokenJazz.bytecode

}

config.supportedId = {}
for (let i in config.supported) {
  config.supportedId[config.supported[i]] = i
}

module.exports = config

require("@nomiclabs/hardhat-waffle");
require("@nomiclabs/hardhat-etherscan");
require("hardhat-gas-reporter");

let env = require('./env.json');

// This is a sample Hardhat task. To learn how to create your own go to
// https://hardhat.org/guides/create-task.html
task("accounts", "Prints the list of accounts", async () => {
  const accounts = await ethers.getSigners();

  for (const account of accounts) {
    console.log(account.address);
  }
});

// You need to export an object to set up your config
// Go to https://hardhat.org/config/ to learn more

/**
 * @type import('hardhat/config').HardhatUserConfig
 */
module.exports = {
  solidity: {
    version: '0.8.0',
    settings: {
      optimizer: {
        enabled: true,
        runs: 200,
      },
    },
  },
  networks: {
    hardhat: {
      blockGasLimit: 10000000,
    },
    localhost: {
      url: "http://localhost:8545"
    },
    ganache: {
      url: "http://localhost:7545"
    },
    eth_goerli: {
      url: `https://eth-goerli.alchemyapi.io/v2/${env.goerliAlchemyKey}`,
      accounts: [env.privateKey]
    },
    eth_mainnet: {
      url: `https://eth-mainnet.alchemyapi.io/v2/${env.mainnetAlchemyKey}`,
      accounts: [env.privateKey]
    },
    bsc_testnet: {
      url: "https://data-seed-prebsc-1-s1.binance.org:8545",
      chainId: 97,
      gasPrice: 20000000000,
      accounts: [env.privateKey]
    },
    bsc_mainnet: {
      url: "https://bsc-dataseed.binance.org/",
      chainId: 56,
      gasPrice: 20000000000,
      accounts: [env.privateKey]
    },
    matic_testnet: {
      url: "https://rpc-mumbai.matic.today/",
      chainId: 80001,
      gasPrice: 20000000000,
      accounts: [env.privateKey]
    },
    matic_mainnet: {
      url: `https://rpc-mainnet.maticvigil.com/v1/${env.maticvigilKey}`,
      chainId: 137,
      gasPrice: 20000000000,
      accounts: [env.privateKey]
    },
  },
  etherscan: {
    // apiKey: env.etherscanKey
    apiKey: env.bscscanKey
  },
  gasReporter: {
    currency: 'USD'
  }
};


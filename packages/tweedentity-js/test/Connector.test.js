const {expect, assert} = require("chai");
const {assertThrowsMessage, getSignature, getSignature2} = require('../../contracts/src/helpers')
const Connector = require('../src/Connector')
const utils = require('../src/utils')
const config = require('../config')
const {deployAll} = require('./helpers')

describe("Connector", async function () {

  let store
  let claimer
  let identity
  let registry

  const apps = {
    twitter: [1, true],
    reddit: [2, false],
    facebook: [3, true]
  }

  let owner, oracle, org, bob, alice
  let signature
  let tid = '273645362718263746'
  let tid2 = '3627534'
  let addr0 = '0x0000000000000000000000000000000000000000'

  const rid = 'fxP8r3'
  let timestamp;
  let chainId;

  before(async function () {
    const signers = await ethers.getSigners()
    owner = signers[0];
    oracle = signers[1];
    org = signers[2];
    bob = signers[3];
    alice = signers[4];
    await initNetworkAndDeploy()
    chainId = await identity.getChainId()
  })

  async function initNetworkAndDeploy() {

    let contracts = await deployAll(ethers, oracle)

    store = contracts.tweedentities
    claimer = contracts.claimer
    identity = contracts.identityManager
    registry = contracts.tweedentityRegistry

    config.deployed.TweedentityRegistry['31337'] = {
      address: registry.address,
      when: (new Date).toISOString()
    }
  }

  describe('#constructor', async function () {

    beforeEach(async function () {
      await initNetworkAndDeploy();
    });

    it("should build the instance", async function () {

      const connector = new Connector(ethers.provider)
      assert.equal((await connector.provider.getNetwork()).chainId, '31337')

    });

  })

  describe('#load', async function () {

    beforeEach(async function () {
      await initNetworkAndDeploy();
    });

    it("should load the registry contract", async function () {

      const connector = new Connector(ethers.provider, '1337')
      await connector.load()
      assert.equal(connector.contracts.Tweedentities.address, store.address)

    });

  })


});

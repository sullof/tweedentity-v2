const {expect, assert} = require("chai");
const {assertThrowsMessage, getSignature, getSignature2} = require('../../contracts/src/helpers')
const Client = require('../src/Client')
const utils = require('../src/utils')
const config = require('../config')
const {deployAll} = require('./helpers')

describe.only("Client", async function () {

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
  let bobTid = '273645362718263746'
  let bobRid = utils.fromAlphanumericStringToIntegerString('1nihr8b3')
  let aliceTid = '3627534'

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

    timestamp = await getTimestamp()
    signature = getSignature2(ethers, identity, bob.address, [0, 1, 2], [0, bobTid, bobRid], timestamp)
    await identity.connect(bob).setMultipleIdentities([0, 1, 2], [0, bobTid, bobRid], timestamp, signature)

    timestamp = await getTimestamp()
    signature = getSignature2(ethers, identity, alice.address, [0, 1], [0, aliceTid], timestamp)
    await identity.connect(alice).setMultipleIdentities([0, 1], [0, aliceTid], timestamp, signature)

    config.deployed.TweedentityRegistry['31337'] = {
      address: registry.address,
      when: (new Date).toISOString()
    }
  }

  async function getTimestamp() {
    return (await ethers.provider.getBlock()).timestamp
  }

  //

  describe('#constructor', async function () {

    beforeEach(async function () {
      await initNetworkAndDeploy();
    });

    it("should build the instance", async function () {

      const client = new Client(ethers.provider)
      assert.equal((await client.connector.provider.getNetwork()).chainId, '31337')

    });

  })

  describe('#getProfile', async function () {

    beforeEach(async function () {
      await initNetworkAndDeploy();
    });

    it("should load Bob's profile", async function () {

      const client = new Client(ethers.provider)
      let bobProfile = await client.getProfile(bob.address)
      assert.equal(bobProfile.tweedentity.id, 1)
      assert.equal(bobProfile.twitter.id, bobTid)
      assert.equal(bobProfile.reddit.fullId, bobRid * 100 + 2)

    });

  })

  describe('#supportedApps', async function () {

    it("should load the supported apps", async function () {

      const supported = Client.supportedApps()
      assert.equal(supported.length, 3)
      assert.equal(supported[2], 'reddit')

    });

  })



});

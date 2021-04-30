const {expect, assert} = require("chai");
const {assertThrowsMessage, getSignature, getSignature2} = require('../../contracts/src/helpers')
const {utils} = require('../../contracts/src')

describe("Client", async function () {

  let Tweedentities
  let store
  let Claimer
  let claimer
  let IdentityManager
  let identity
  let Twiptos;
  let tweedentity;
  let Registry
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

    // store
    Tweedentities = await ethers.getContractFactory("Tweedentities");
    store = await Tweedentities.deploy(addr0, 0);
    await store.deployed();
    //claimer
    Claimer = await ethers.getContractFactory("IdentityClaimer");
    claimer = await Claimer.deploy(addr0, store.address);
    await claimer.deployed();
    await store.addManager(claimer.address)
    // identity manager
    IdentityManager = await ethers.getContractFactory("IdentityManager");
    identity = await IdentityManager.deploy(oracle.address, store.address, claimer.address);
    await identity.deployed();
    await store.addManager(identity.address);
    await claimer.addManager(identity.address);
    // token token
    Twiptos = await ethers.getContractFactory("Twiptos");
    tweedentity = await Twiptos.deploy(
        oracle.address,
        org.address,
        "https://store.token.com/metadata/{id}.json",
        store.address
    );
    await tweedentity.deployed();

    names = [
      'Tweedentities',
      'IdentityManager',
      'IdentityClaimer',
      'Twiptos'
    ]
    bytes32Names = names.map(e => ethers.utils.formatBytes32String(e))

    addresses = [
      store.address,
      identity.address,
      claimer.address,
      tweedentity.address
    ]

    Registry = await ethers.getContractFactory("ZeroXNilRegistry");
    registry = await Registry.deploy(
        bytes32Names,
        addresses
    );
    await registry.deployed();

    let numericRid = utils.fromAlphanumericStringToIntegerString('1nihr8b3')
    timestamp = await getTimestamp()
    signature = getSignature2(ethers, identity, bob.address, [0, 1, 2], [0, tid, numericRid], timestamp)
    await identity.connect(bob).setMultipleIdentities([0, 1, 2], [0, tid, numericRid], timestamp, signature)

    timestamp = await getTimestamp()
    signature = getSignature2(ethers, identity, alice.address, [0, 1], [0, tid2], timestamp)
    await identity.connect(alice).setMultipleIdentities([0, 1], [0, tid2], timestamp, signature)

  }

  async function getTimestamp() {
    return (await ethers.provider.getBlock()).timestamp
  }

  //

  describe('#constructor', async function () {

    beforeEach(async function () {
      await initNetworkAndDeploy();
    });

    it("should verify that the manager can manage store and claimer", async function () {
      // assert.equal(await store.managers(identity.address), true)
    });

  })


});

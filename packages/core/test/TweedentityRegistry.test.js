const {expect, assert} = require("chai");
const {assertThrowsMessage} = require('../src/helpers')
const {utils} = require('../src')

describe("TweedentityRegistry", async function () {

  let Tweedentities
  let store
  let Claimer
  let claimer
  let IdentityManager
  let identity
  let Registry
  let registry

  let names
  let bytes32Names
  let addresses

  let owner, oracle, org, bob, alice, mark, joe, bill, wikileaks, assange
  let addr0 = '0x0000000000000000000000000000000000000000'

  before(async function () {
    const signers = await ethers.getSigners()
    owner = signers[0];
    oracle = signers[1];
    org = signers[2];
    bob = signers[3];
    alice = signers[4];
    wikileaks = signers[5];
    assange = signers[6];
    mark = signers[7];
    joe = signers[8];
    bill = signers[9];
  })

  async function initNetworkAndDeploy() {
    // store
    Tweedentities = await ethers.getContractFactory("Tweedentities");
    store = await Tweedentities.deploy(0);
    await store.deployed();
    //claimer
    Claimer = await ethers.getContractFactory("IdentityClaimer");
    claimer = await Claimer.deploy(store.address);
    await claimer.deployed();
    // identity manager
    IdentityManager = await ethers.getContractFactory("IdentityManager");
    identity = await IdentityManager.deploy(oracle.address, store.address, claimer.address);
    await identity.deployed();

    const MANAGER_ROLE = await store.MANAGER_ROLE()
    await store.grantRole(MANAGER_ROLE, identity.address)
    await store.grantRole(MANAGER_ROLE, claimer.address)
    await claimer.grantRole(MANAGER_ROLE, identity.address)

    names = [
        'Tweedentities',
        'IdentityManager',
        'IdentityClaimer'
    ]
    bytes32Names = names.map(e => ethers.utils.formatBytes32String(e))

    addresses = [
        store.address,
        identity.address,
        claimer.address
    ]

    Registry = await ethers.getContractFactory("TweedentityRegistry");
    registry = await Registry.deploy(
        bytes32Names,
        addresses
    );
    await registry.deployed();

  }

  async function getTimestamp() {
    return (await ethers.provider.getBlock()).timestamp
  }

  describe('#constructor', async function () {

    beforeEach(async function () {
      await initNetworkAndDeploy();
    });

    it("should verify that all the contracts are set", async function () {

      for (let i=0;i< names.length;i++) {
        assert.equal(await registry.registry(bytes32Names[i]), addresses[i])
      }

    });

  })

});

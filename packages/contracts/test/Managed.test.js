const {expect, assert} = require("chai");
const {assertThrowsMessage} = require('./helpers')
const {utils} = require('@tweedentity/common')

describe("Managed", async function () {

  let Managed, managed
  let IsManaged, isManaged

  const apps = {
    twitter: [1, true],
    reddit: [2, false],
    facebook: [3, true]
  }

  let owner, manager, manager2
  let addr0 = '0x0000000000000000000000000000000000000000'

  let twitter = ethers.utils.formatBytes32String('twitter')
  let reddit = ethers.utils.formatBytes32String('reddit')

  let timestamp;
  let chainId;

  before(async function () {
    const signers = await ethers.getSigners()
    owner = signers[0];
    manager = signers[1];
    manager2 = signers[2];
    // await initNetworkAndDeploy()
    // chainId = await managed.getChainId()
  })

  async function initNetworkAndDeploy() {
    Managed = await ethers.getContractFactory("Managed");
    managed = await Managed.deploy(manager.address);
    await managed.deployed();
    IsManaged = await ethers.getContractFactory("IsManagedMock");
    isManaged = await IsManaged.deploy(manager.address);
    await isManaged.deployed();
  }

  async function getTimestamp() {
    return (await ethers.provider.getBlock()).timestamp
  }

  //

  describe('#constructor', async function () {

    beforeEach(async function () {
      await initNetworkAndDeploy();
    });

    it("should verify that the default manager is active", async function () {

      assert.equal(await managed.managers(manager.address), true)
    });

  })

  describe('#addManager', async function () {

    beforeEach(async function () {
      await initNetworkAndDeploy();
    });


    it("should add a manager", async function () {
      await expect(managed.addManager(manager2.address))
          .to.emit(managed, 'ManagerAdded')
          .withArgs(manager2.address);
      assert.equal((await managed.total()).toNumber(), 2)
    });

    it('should throw adding 0x0 as manager', async function () {
      await assertThrowsMessage(
          managed.addManager(addr0),
          'Null address'
      )
    })

    it('should throw adding again as manager', async function () {
      await assertThrowsMessage(
          managed.addManager(manager.address),
          'Manager already set'
      )
    })

  })

  describe('#removeManager', async function () {

    beforeEach(async function () {
      await initNetworkAndDeploy();
    });

    it("should remove a manager", async function () {
      await expect(managed.removeManager(manager.address))
          .to.emit(managed, 'ManagerRemoved')
          .withArgs(manager.address);
      assert.equal(await managed.total(), 0)
    });

    it('should throw removing a not manager', async function () {
      await assertThrowsMessage(
          managed.removeManager(manager2.address),
          'Manager not found'
      )
    })

  })

  describe('#onlyManager modifier', async function () {

    beforeEach(async function () {
      await initNetworkAndDeploy();
    });

    it("should try to update a data as a manager", async function () {
      await isManaged.connect(manager).setVal(3)
      assert.equal(await isManaged.val(), 3)
    });

    it("should fail trying to update a data not as a manager", async function () {
      await assertThrowsMessage(
          isManaged.setVal(3),
          'Not authorized'
      );
    });

  })

});

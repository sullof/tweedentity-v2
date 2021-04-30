const {expect, assert} = require("chai");
const {assertThrowsMessage} = require('../src/helpers')
const {utils} = require('../src')
const ethUtils = require('ethereumjs-util')

describe("Tweedentities", async function () {

  let Tweedentities;
  let store;

  const apps = {
    twitter: [1, true],
    reddit: [2, false],
    facebook: [3, true]
  }

  let owner, manager, manager2, user, user2, user3
  let addr0 = '0x0000000000000000000000000000000000000000'

  let twitter = utils.stringToBytes32('twitter')
  let reddit = utils.stringToBytes32('reddit')
  let instagram = utils.stringToBytes32('instagram')

  let tid = 223344
  let rid = 'a8sh3e'

  let timestamp;
  let chainId;

  before(async function () {
    const signers = await ethers.getSigners()
    owner = signers[0];
    manager = signers[1];
    manager2 = signers[2];
    user = signers[3];
    user2 = signers[4];
    user3 = signers[5];
    // await initNetworkAndDeploy()
    // chainId = await store.getChainId()
  })

  async function initNetworkAndDeploy() {
    Tweedentities = await ethers.getContractFactory("Tweedentities");
    store = await Tweedentities.deploy(manager.address, 0);
    await store.deployed();
  }

  async function getTimestamp() {
    return (await ethers.provider.getBlock()).timestamp
  }

  //

  describe('#constructor', async function () {

    beforeEach(async function () {
      await initNetworkAndDeploy();
    });

    it("should verify that twitter and reddit are set up", async function () {
      assert.equal((await store.apps(1)), twitter)
      assert.equal((await store.apps(2)), reddit)
      assert.equal((await store.apps(3)), instagram)
      assert.equal((await store.lastAppId()).toNumber(), 3)
    });

  })


  describe('#setNickname', async function () {

    const sullof = utils.stringToBytes32('sullof')
    const follus = utils.stringToBytes32('follus')

    beforeEach(async function () {
      await initNetworkAndDeploy();
    });

    it("should throw if nicknames are not active", async function () {

      await store.connect(manager).setAddressAndIdByAppId(0, user.address, 0)

      await assertThrowsMessage(
          store.connect(user).setNickname(sullof),
          'Nicknames not active')
    });

    it("should activate nicknames and set one", async function () {

      await store.connect(manager).setAddressAndIdByAppId(0, user.address, 0)
      await store.connect(manager).setAddressAndIdByAppId(0, user2.address, 0)

      await store.activateNicknames()

      await expect(store.connect(user).setNickname(sullof))
          .to.emit(store, 'NicknameSet')
          .withArgs(1, sullof);

      let nickname = utils.stringToBytes32('jow汉字ص')

      await expect(store.connect(user2).setNickname(nickname))
          .to.emit(store, 'NicknameSet')
          .withArgs(2, nickname);

    });


    it("should throw if trying to change the nickname", async function () {

      await store.connect(manager).setAddressAndIdByAppId(0, user.address, 0)

      await store.activateNicknames()

      await store.connect(user).setNickname(sullof)

      await assertThrowsMessage(
          store.connect(user).setNickname(follus),
          'Nicknames are immutable')
    });

    it("should throw if account not found", async function () {

      await store.activateNicknames()

      await assertThrowsMessage(
          store.connect(user).setNickname(follus),
          'Account not found')
    });

    it("should throw if nickname taken", async function () {

      await store.connect(manager).setAddressAndIdByAppId(0, user.address, 0)
      await store.connect(manager).setAddressAndIdByAppId(0, user2.address, 0)

      await store.activateNicknames()

      await store.connect(user).setNickname(sullof)

      await assertThrowsMessage(
          store.connect(user2).setNickname(sullof),
          'Nickname taken')
    });

  })


  describe('#setExtras', async function () {

    const key = utils.stringToBytes32('fullname')
    const value = utils.stringToBytes('Francesco Sullo')
    const value2 = utils.stringToBytes('Francesco D. Sullo')

    const key3 = utils.stringToBytes32('picture')
    const value3 = utils.stringToBytes('ipfs://askjsakdasdsahdkashdaskdjas')

    beforeEach(async function () {
      await initNetworkAndDeploy();
    });

    it("should throw if extras key not active", async function () {

      await store.connect(manager).setAddressAndIdByAppId(0, user.address, 0)

      await assertThrowsMessage(
          store.connect(user).setExtras(key, value),
          'Key not supported')
    });

    it('should activate extras key "fullname" and set one', async function () {

      await store.connect(manager).setAddressAndIdByAppId(0, user.address, 0)

      await store.activateKey(key)

      await expect(store.connect(user).setExtras(key, value))
          .to.emit(store, 'DataChanged')
          .withArgs(1, key, value);
    });

    it('should allow to change the extras', async function () {

      await store.connect(manager).setAddressAndIdByAppId(0, user.address, 0)

      await store.activateKey(key)
      await store.connect(user).setExtras(key, value)

      await expect(store.connect(user).setExtras(key, value2))
          .to.emit(store, 'DataChanged')
          .withArgs(1, key, value2);
    });

    it("should throw if account not found", async function () {

      await store.activateKey(key)

      await assertThrowsMessage(
          store.connect(user).setExtras(key, value),
          'Account not found')
    });

  })


  describe('#setAddressAndIdByAppId', async function () {

    beforeEach(async function () {
      await initNetworkAndDeploy();
    });

    it("should set an identity", async function () {
      await expect(store.connect(manager).setAddressAndIdByAppId(1, user.address, tid))
          .to.emit(store, 'IdentitySet')
          .withArgs(1, tid, user.address);
    });

    it("should set an identity", async function () {
      await expect(store.connect(manager).setAddressAndIdByAppId(0, user.address, 0))
          .to.emit(store, 'IdentitySet')
          .withArgs(0, 1, user.address);
    });


    it("should throw if you try to set again an identity for an address that owns an identity", async function () {
      await store.connect(manager).setAddressAndIdByAppId(1, user.address, tid)

      await assertThrowsMessage(
          store.connect(manager).setAddressAndIdByAppId(1, user.address, 3454),
          'Existing identity found for _appId/_address')

    });

    it("should throw if you try to set again an existing identity", async function () {
      await store.connect(manager).setAddressAndIdByAppId(1, user.address, tid)

      await assertThrowsMessage(
          store.connect(manager).setAddressAndIdByAppId(1, user2.address, tid),
          'Existing identity found for _appId/_id')


    });

    it("should throw if you try to set an identity for an unsupported app", async function () {
      await store.connect(manager).setAddressAndIdByAppId(1, user.address, tid)


      await assertThrowsMessage(
          store.connect(manager).setAddressAndIdByAppId(4, user.address, tid),
          'Unsupported app')

    });

    it("should throw if you try to set an identity for address 0", async function () {
      await store.connect(manager).setAddressAndIdByAppId(1, user.address, tid)


      await assertThrowsMessage(
          store.connect(manager).setAddressAndIdByAppId(1, addr0, 23432),
          '_address cannot be 0x0')

    });

    it("should throw if you try to set an identity with the wrong manager", async function () {
      await store.connect(manager).setAddressAndIdByAppId(1, user.address, tid)


      await assertThrowsMessage(
          store.connect(manager2).setAddressAndIdByAppId(1, addr0, 23432),
          'Not authorized')
    })

  })


  describe('#updateAddressByAppId', async function () {

    beforeEach(async function () {
      await initNetworkAndDeploy();
    });

    it("should update an identity", async function () {
      await store.connect(manager).setAddressAndIdByAppId(1, user.address, tid)
      await expect(store.connect(manager).updateAddressByAppId(1, user.address, user2.address))
          .to.emit(store, 'IdentityUpdated')
          .withArgs(1, tid, user2.address);

      await store.connect(manager).setAddressAndIdByAppId(0, user.address, 0)
      await expect(store.connect(manager).updateAddressByAppId(0, user.address, user2.address))
          .to.emit(store, 'IdentityUpdated')
          .withArgs(0, 1, user2.address);

    });


    it("should throw if you try to update an identity with no change", async function () {
      await store.connect(manager).setAddressAndIdByAppId(1, user.address, tid)

      await assertThrowsMessage(
          store.connect(manager).updateAddressByAppId(1, user.address, user.address),
          'No change required')

    });

    it("should throw if you try to update a not-existing identity", async function () {
      await store.connect(manager).setAddressAndIdByAppId(1, user.address, tid)

      await assertThrowsMessage(
          store.connect(manager).updateAddressByAppId(1, user2.address, user3.address),
          'No identity found for _appId/_oldAddress')

    });

    it("should throw if you try to update an identity with an used wallet", async function () {
      await store.connect(manager).setAddressAndIdByAppId(1, user.address, tid)
      await store.connect(manager).setAddressAndIdByAppId(1, user3.address, 3432)

      await assertThrowsMessage(
          store.connect(manager).updateAddressByAppId(1, user3.address, user.address),
          "Existing identity found for _appId/_newAddress")

    });

    it("should throw if you try to update an identity with a 0 address", async function () {
      await store.connect(manager).setAddressAndIdByAppId(1, user.address, tid)

      await assertThrowsMessage(
          store.connect(manager).updateAddressByAppId(1, user.address, addr0),
          '_newAddress cannot be 0x0')
    })

  })


  describe('#profile and getters', async function () {

    let numericRid = utils.fromAlphanumericStringToIntegerString(rid)

    beforeEach(async function () {
      await initNetworkAndDeploy();
    });

    it("should get an address profile", async function () {
      await store.connect(manager).setAddressAndIdByAppId(1, user.address, tid)
      await store.connect(manager).setAddressAndIdByAppId(2, user.address, numericRid)

      let profile = await store.profile(user.address)
      assert.equal(profile[0].toNumber(), tid)
      assert.equal(profile[1].toNumber(), numericRid)

      profile = await store.profile(user2.address)
      assert.equal(profile[0].toNumber(), 0)
      assert.equal(profile[1].toNumber(), 0)

    })

    it("should get the id for address", async function () {
      await store.connect(manager).setAddressAndIdByAppId(1, user.address, tid)

      let id = await store.idByAddress(1, user.address)
      assert.equal(id, tid)

      id = await store.idByAddress(1, user2.address)
      assert.equal(id, 0)

    })

    it("should get the address by id", async function () {
      await store.connect(manager).setAddressAndIdByAppId(1, user.address, tid)

      let address = await store.addressById(1, tid)
      assert.equal(address, user.address)

      address = await store.addressById(1, 22222)
      assert.equal(address, addr0)

    })


  })

});

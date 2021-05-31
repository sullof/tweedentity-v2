const {expect, assert} = require("chai");
const {assertThrowsMessage} = require('../src/helpers')

describe("Signable", async function () {

  let Signable
  let signable

  let addr0 = '0x0000000000000000000000000000000000000000'
  let owner, oracle1, oracle2, oracle3

  before(async function () {
    const signers = await ethers.getSigners()
    owner = signers[0];
    oracle1 = signers[1];
    oracle2 = signers[2];
    oracle3 = signers[3];
  })

  async function initNetworkAndDeploy() {
    Signable = await ethers.getContractFactory("Signable");
    signable = await Signable.deploy(oracle1.address);
    await signable.deployed();
  }

  describe('#constructor', async function () {

    beforeEach(async function () {
      await initNetworkAndDeploy();
    });

    it("should verify that the oracle is set", async function () {
      assert.isTrue(await signable.oracles(oracle1.address))
    });

  })

  describe('#addOracle', async function () {

    beforeEach(async function () {
      await initNetworkAndDeploy();
    });

    it("should add an oracle", async function () {
      await expect(signable.addOracle(oracle2.address))
          .to.emit(signable, 'OracleAdded')
          .withArgs(oracle2.address);
      assert.isTrue(await signable.oracles(oracle1.address))
    });

    it('should throw if not called by owner', async function () {

      await assertThrowsMessage(
          signable.connect(oracle1).addOracle(oracle3.address),
          'caller is not the owner')
    })

    it('should throw if address(0)', async function () {

      await assertThrowsMessage(
          signable.addOracle(addr0),
          'Oracle can not be 0x0')
    })

    it('should throw if oracle already set', async function () {

      await assertThrowsMessage(
          signable.addOracle(oracle1.address),
          'Oracle already set')
    })

  })

  describe('#removeOracle', async function () {

    beforeEach(async function () {
      await initNetworkAndDeploy();
    });

    it("should add an oracle", async function () {
      await signable.addOracle(oracle2.address)
      await expect(signable.removeOracle(oracle1.address))
          .to.emit(signable, 'OracleRemoved')
          .withArgs(oracle1.address);
      assert.isTrue(await signable.oracles(oracle2.address))
      assert.isFalse(await signable.oracles(oracle1.address))
    });

    it('should throw if not called by owner', async function () {

      await assertThrowsMessage(
          signable.connect(oracle1).removeOracle(oracle1.address),
          'caller is not the owner')
    })

    it('should throw if oracle does not exist', async function () {

      await assertThrowsMessage(
          signable.removeOracle(oracle2.address),
          'Oracle not found')
    })

  })

  describe('#updateOracle', async function () {

    beforeEach(async function () {
      await initNetworkAndDeploy();
    });

    it("should add an oracle", async function () {
      await expect(signable.updateOracle(oracle1.address, oracle2.address))
          .to.emit(signable, 'OracleUpdated')
          .withArgs(oracle1.address, oracle2.address);
      assert.isTrue(await signable.oracles(oracle2.address))
      assert.isFalse(await signable.oracles(oracle1.address))
    });

    it('should throw if not called by owner', async function () {

      await assertThrowsMessage(
          signable.connect(oracle1).updateOracle(oracle1.address, oracle2.address),
          'caller is not the owner')
    })

    it('should throw if new oracle is 0x0', async function () {

      await assertThrowsMessage(
          signable.updateOracle(oracle1.address, addr0),
          'New oracle can not be 0x0')
    })

    it('should throw if new oracle is equalt to old oracle', async function () {

      await assertThrowsMessage(
          signable.updateOracle(oracle1.address, oracle1.address),
          'No changes')
    })

    it('should throw if updating a not existing oracle', async function () {

      await assertThrowsMessage(
          signable.updateOracle(oracle2.address, oracle3.address),
          'Oracle not found')
    })

    it('should throw if updating an oracle with another existing oracle', async function () {
      await signable.addOracle(oracle2.address)
      await assertThrowsMessage(
          signable.updateOracle(oracle1.address, oracle2.address),
          'New oracle already set')
    })

  })

});

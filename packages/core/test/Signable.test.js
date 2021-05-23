const {expect, assert} = require("chai");
const {assertThrowsMessage} = require('../src/helpers')

describe("Signable", async function () {

  let Signable
  let signable

  let owner, oracle

  before(async function () {
    const signers = await ethers.getSigners()
    owner = signers[0];
    oracle = signers[1];
  })

  async function initNetworkAndDeploy() {
    Signable = await ethers.getContractFactory("Signable");
    signable = await Signable.deploy(oracle.address);
    await signable.deployed();
  }

  describe('#constructor', async function () {

    beforeEach(async function () {
      await initNetworkAndDeploy();
    });

    it("should verify that the oracle is set", async function () {
      assert.equal(await signable.oracle(), oracle.address)
    });

  })

  describe('#updateOracle', async function () {

    beforeEach(async function () {
      await initNetworkAndDeploy();
    });

    it("should update the oracle", async function () {
      await expect(signable.updateOracle(oracle.address))
          .to.emit(signable, 'OracleUpdated')
          .withArgs(oracle.address);
      assert.equal(await signable.oracle(), oracle.address)
    });

    it('should throw if not called by owner', async function () {

      await assertThrowsMessage(
          signable.connect(oracle).updateOracle(oracle.address),
          'caller is not the owner')
    })

  })

});

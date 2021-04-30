const {expect, assert} = require("chai");
const {assertThrowsMessage} = require('../src/helpers')
const {utils} = require('../src')

describe.skip("Tmp", async function () {

  let Tmp;
  let tmp;

  let owner, manager, user
  let addr0 = '0x0000000000000000000000000000000000000000'

  let tweedentityApp = ethers.utils.formatBytes32String('tweedentity')
  let twitter = ethers.utils.formatBytes32String('twitter')
  let reddit = ethers.utils.formatBytes32String('reddit')

  let timestamp;
  let chainId;

  before(async function () {
    const signers = await ethers.getSigners()
    owner = signers[0];
    manager = signers[1];
    user = signers[2]
  })

  async function initNetworkAndDeploy() {
    Tmp = await ethers.getContractFactory("Tmp");
    tmp = await Tmp.deploy();
    await tmp.deployed();
  }


  describe('#testing gas consumption', async function () {

    beforeEach(async function () {
      await initNetworkAndDeploy();
    });

    it("should verify", async function () {
      await tmp.setFirst()
    });

    it("should verify", async function () {
      await tmp.setSecond()
    });

  })

});

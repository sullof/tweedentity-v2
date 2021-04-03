const { expect, assert } = require("chai");

describe("TweedentityV2", function() {

  let TweedentityV2;
  let reputationToken;

  beforeEach(async function () {
    TweedentityV2 = await ethers.getContractFactory("TweedentityV2");
    reputationToken = await TweedentityV2.deploy();
    await reputationToken.deployed();
  });

  it("should return the reputationToken name and symbol", async function() {
    expect(await reputationToken.name()).to.equal("Reput");
  });

});

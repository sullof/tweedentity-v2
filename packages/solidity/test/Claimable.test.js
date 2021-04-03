const { expect, assert } = require("chai");

describe("Claimable", function() {

  let Claimable;
  let claimable;

  beforeEach(async function () {
    Claimable = await ethers.getContractFactory("Claimable");
    claimable = await Claimable.deploy();
    await claimable.deployed();
  });

  // it("should return the reputationToken name and symbol", async function() {
  //
  // });

});

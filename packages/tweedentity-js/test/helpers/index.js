const utils = require('../../src/utils')

module.exports = {

  async deployAll(ethers, oracle) {

    let addr0 = '0x0000000000000000000000000000000000000000'

    let Tweedentities = await ethers.getContractFactory("Tweedentities");
    let tweedentities = await Tweedentities.deploy(addr0, 0);
    await tweedentities.deployed();

    let Claimer = await ethers.getContractFactory("TweedentityClaimer");
    let claimer = await Claimer.deploy(addr0, tweedentities.address);
    await claimer.deployed()

    let IdentityManager = await ethers.getContractFactory("IdentityManager");
    let TweedentityManager = await IdentityManager.deploy(oracle.address, tweedentities.address, claimer.address);
    await TweedentityManager.deployed();

    const MANAGER_ROLE = await tweedentities.MANAGER_ROLE()
    await tweedentities.grantRole(MANAGER_ROLE, TweedentityManager.address)
    await tweedentities.grantRole(MANAGER_ROLE, claimer.address)
    await claimer.grantRole(MANAGER_ROLE, TweedentityManager.address)

    let names = [
      'Tweedentities',
      'IdentityManager',
      'TweedentityClaimer'
    ]
    let bytes32Names = names.map(e => utils.stringToBytes32(e))

    let addresses = [
      tweedentities.address,
      TweedentityManager.address,
      claimer.address
    ]

    let TweedentityRegistry = await ethers.getContractFactory("TweedentityRegistry");
    let tweedentityRegistry = await TweedentityRegistry.deploy(
        bytes32Names,
        addresses
    );
    await tweedentityRegistry.deployed();

    return {
      tweedentities,
      claimer,
      TweedentityManager,
      tweedentityRegistry
    }

  }

}

const utils = require('../../src/utils')

module.exports = {

  async deployAll(ethers, oracle) {

    let addr0 = '0x0000000000000000000000000000000000000000'

    let Tweedentities = await ethers.getContractFactory("Tweedentities");
    let tweedentities = await Tweedentities.deploy(addr0, 0);
    await tweedentities.deployed();

    let Claimer = await ethers.getContractFactory("IdentityClaimer");
    let claimer = await Claimer.deploy(addr0, tweedentities.address);
    await claimer.deployed();
    await tweedentities.addManager(claimer.address)

    let IdentityManager = await ethers.getContractFactory("IdentityManager");
    let identityManager = await IdentityManager.deploy(oracle.address, tweedentities.address, claimer.address);
    await identityManager.deployed();
    await tweedentities.addManager(identityManager.address);
    await claimer.addManager(identityManager.address);

    let names = [
      'Tweedentities',
      'IdentityManager',
      'IdentityClaimer'
    ]
    let bytes32Names = names.map(e => utils.stringToBytes32(e))

    let addresses = [
      tweedentities.address,
      identityManager.address,
      claimer.address
    ]

    let ZeroXNilRegistry = await ethers.getContractFactory("ZeroXNilRegistry");
    let zeroXNilRegistry = await ZeroXNilRegistry.deploy(
        bytes32Names,
        addresses
    );
    await zeroXNilRegistry.deployed();

    return {
      tweedentities,
      claimer,
      identityManager,
      zeroXNilRegistry
    }

  }

}

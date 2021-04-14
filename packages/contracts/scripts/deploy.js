// We require the Hardhat Runtime Environment explicitly here. This is optional
// but useful for running the script in a standalone fashion through `node <script>`.
//
// When running the script with `hardhat run <script>` you'll find the Hardhat
// Runtime Environment's members available in the global scope.
const hre = require("hardhat");
const args = require('../arguments')

const {chains, utils} = require('../src')

async function deploy(ethers) {

  const [
    oracle,
    donee,
    uri
  ] = args;

  if (!chains[process.env.DEPLOY_NETWORK]) {
    throw new Error('Unsupported chain')
  }

  const addr0 = '0x0000000000000000000000000000000000000000'

  // store
  const TweedentityStore = await ethers.getContractFactory("TweedentityStore");
  const tweedentityStore = await TweedentityStore.deploy(
      addr0
  );
  await tweedentityStore.deployed();

  // claimer
  const IdentityClaimer = await ethers.getContractFactory("IdentityClaimer");
  const claimer = await IdentityClaimer.deploy(
      addr0,
      tweedentityStore.address
  );
  await claimer.deployed();
  await tweedentityStore.addManager(claimer.address)

  // identity manager
  const IdentityManager = await ethers.getContractFactory("IdentityManager");
  const identityManager = await IdentityManager.deploy(
      oracle,
      tweedentityStore.address,
      claimer.address
  );
  await identityManager.deployed();
  await tweedentityStore.addManager(identityManager.address);
  await claimer.addManager(identityManager.address);

  // token
  const TweedentityToken = await ethers.getContractFactory("TweedentityToken");
  const tweedentityToken = await TweedentityToken.deploy(
      oracle,
      donee,
      uri,
      chains[process.env.DEPLOY_NETWORK],
      tweedentityStore.address
  );
  await tweedentityToken.deployed();

  const Tweedentity = await ethers.getContractFactory("TweedentityFactory");
  const tweedentity = await Tweedentity.deploy(
      tweedentityStore.address,
      claimer.address,
      identityManager.address,
      tweedentityToken.address
  );
  await tweedentity.deployed();

  return {
    TweedentityStore: tweedentityStore.address,
    IdentityClaimer: claimer.address,
    IndentityManager: identityManager.address,
    TweedentityToken: tweedentityToken.address,
    Tweedentity: tweedentity.address
  }

}

async function main() {
  // Hardhat always runs the compile task when running scripts with its command
  // line interface.
  //
  // If this script is run directly using `node` you may want to call compile
  // manually to make sure everything is compiled
  // await hre.run('compile');

  const [deployer] = await ethers.getSigners();

  console.log(
      "Deploying contracts with the account:",
      deployer.address
  );

  console.log("Account balance:", (await deployer.getBalance()).toString());

  const res = await deploy(hre.ethers)

  for (let k in res) {
    console.log(`$k} deployed to: ${res[k]}`);
  }

}

// We recommend this pattern to be able to use async/await everywhere
// and properly handle errors.
main()
    .then(() => process.exit(0))
    .catch(error => {
      console.error(error);
      process.exit(1);
    });


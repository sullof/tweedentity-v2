// We require the Hardhat Runtime Environment explicitly here. This is optional
// but useful for running the script in a standalone fashion through `node <script>`.
//
// When running the script with `hardhat run <script>` you'll find the Hardhat
// Runtime Environment's members available in the global scope.
const hre = require("hardhat");
const args = require('../arguments')

const {chains} = require('@tweedentity/commons')

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

  const [
    _oracle,
    _donee,
    _uri,
    _maxMintingEvents,
    _maxNumberOfApps
  ] = args;

  if (!chains[process.env.DEPLOY_NETWORK]) {
    throw new Error('Unsupported chain')
  }

  // We get the contract to deploy
  const Tweedentity = await hre.ethers.getContractFactory("Tweedentity");
  const tweedentity = await Tweedentity.deploy(
      _oracle,
      _donee,
      _uri,
      _maxMintingEvents,
      _maxNumberOfApps,
      chains[process.env.DEPLOY_NETWORK]
  );

  await tweedentity.deployed();

  console.log("Tweedentity deployed to:", tweedentity.address);
}

// We recommend this pattern to be able to use async/await everywhere
// and properly handle errors.
main()
    .then(() => process.exit(0))
    .catch(error => {
      console.error(error);
      process.exit(1);
    });


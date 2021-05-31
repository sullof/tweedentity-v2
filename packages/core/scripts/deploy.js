// We require the Hardhat Runtime Environment explicitly here. This is optional
// but useful for running the script in a standalone fashion through `node <script>`.
//
// When running the script with `hardhat run <script>` you'll find the Hardhat
// Runtime Environment's members available in the global scope.
const hre = require("hardhat");
const args = require('../arguments')
const fs = require('fs-extra')
const path = require('path')

const {chains, utils} = require('../src')
const {getSignature} = require('../src/helpers')

async function deploy(ethers) {

  const devMode = process.env.DEPLOY_NETWORK === 'localhost'

  const currentChain = chains[process.env.DEPLOY_NETWORK]

  if (!currentChain) {
    throw new Error('Unsupported chain')
  }

  let [
    oracle,
    donee,
    uri
  ] = args;

  const addr0 = '0x0000000000000000000000000000000000000000'

  if (devMode) {
    oracle = '0x70997970c51812dc3a010c7d01b50e0d17dc79c8'
  }

  // store
  const Tweedentities = await ethers.getContractFactory("Tweedentities");
  const tweedentities = await Tweedentities.deploy(
      currentChain[1]
  );
  await tweedentities.deployed();

  // claimer
  const TweedentityClaimer = await ethers.getContractFactory("TweedentityClaimer");
  const claimer = await TweedentityClaimer.deploy(
      tweedentities.address
  );
  await claimer.deployed();

  // identity manager
  const IdentityManager = await ethers.getContractFactory("IdentityManager");
  const TweedentityManager = await IdentityManager.deploy(
      oracle,
      tweedentities.address,
      claimer.address
  );
  await TweedentityManager.deployed();

  const MANAGER_ROLE = await tweedentities.MANAGER_ROLE()
  await tweedentities.grantRole(MANAGER_ROLE, TweedentityManager.address)
  await tweedentities.grantRole(MANAGER_ROLE, claimer.address)
  await claimer.grantRole(MANAGER_ROLE, TweedentityManager.address)

  if (devMode) {
    const timestamp = (await ethers.provider.getBlock()).timestamp - 1
    const tid = 5876772
    const bob = (await ethers.getSigners())[3]
    const signature = await getSignature(ethers, TweedentityManager, bob.address, 1, tid, timestamp)
    await TweedentityManager.connect(bob).setIdentity(1, tid, timestamp, signature)
  }

  let names = [
    'Tweedentities',
    'IdentityManager',
    'TweedentityClaimer'
  ]
  let bytes32Names = names.map(e => ethers.utils.formatBytes32String(e))

  let addresses = [
    tweedentities.address,
    TweedentityManager.address,
    claimer.address
  ]

  const Registry = await ethers.getContractFactory("TweedentityRegistry");
  const registry = await Registry.deploy(
      bytes32Names,
      addresses
  );
  await registry.deployed();

  let res = {
    TweedentityRegistry: registry.address
  }

  const deployedJson = require('../config/deployed.json')
  let currentJson = deployedJson.TweedentityRegistry[currentChain[0]]
  deployedJson.TweedentityRegistry[currentChain[0]] = {
    address: registry.address,
    when: (new Date).toISOString()
  }
  if (currentJson) {
    let old = {}
    old[currentChain[0]] = currentJson
    deployedJson.TweedentityRegistry.previousVersions.push(old)
  }

  fs.writeFileSync(path.resolve(__dirname, '../config/deployed.json'), JSON.stringify(deployedJson, null, 2))

  return res

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

  console.log(JSON.stringify(res, null, 2));

}

// We recommend this pattern to be able to use async/await everywhere
// and properly handle errors.
main()
    .then(() => process.exit(0))
    .catch(error => {
      console.error(error);
      process.exit(1);
    });


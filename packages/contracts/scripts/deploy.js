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
      addr0,
      currentChain[1]
  );
  await tweedentities.deployed();

  // claimer
  const IdentityClaimer = await ethers.getContractFactory("IdentityClaimer");
  const claimer = await IdentityClaimer.deploy(
      addr0,
      tweedentities.address
  );
  await claimer.deployed();
  await tweedentities.addManager(claimer.address)

  // identity manager
  const IdentityManager = await ethers.getContractFactory("IdentityManager");
  const identityManager = await IdentityManager.deploy(
      oracle,
      tweedentities.address,
      claimer.address
  );
  await identityManager.deployed();
  await tweedentities.addManager(identityManager.address);
  await claimer.addManager(identityManager.address);

  if (devMode) {
    const timestamp = (await ethers.provider.getBlock()).timestamp - 1
    const tid = 5876772
    const bob = (await ethers.getSigners())[3]
    const signature = await getSignature(ethers, identityManager, bob.address, 1, tid, timestamp)
    await identityManager.connect(bob).setIdentity(1, tid, timestamp, signature)
  }

  let names = [
    'Tweedentities',
    'IdentityManager',
    'IdentityClaimer'
  ]
  let bytes32Names = names.map(e => ethers.utils.formatBytes32String(e))

  let addresses = [
    tweedentities.address,
    identityManager.address,
    claimer.address
  ]

  const Registry = await ethers.getContractFactory("ZeroXNilRegistry");
  const registry = await Registry.deploy(
      bytes32Names,
      addresses
  );
  await registry.deployed();

  //

  // token
  const Twiptos = await ethers.getContractFactory("Twiptos");
  const twiptos = await Twiptos.deploy(
      oracle,
      donee,
      uri,
      tweedentities.address
  );
  await twiptos.deployed();

  registry.setData(ethers.utils.formatBytes32String('Twiptos'), twiptos.address)

  let res = {
    // Tweedentities: tweedentities.address,
    // IdentityClaimer: claimer.address,
    // IndentityManager: identityManager.address,
    // Twiptos: twiptos.address,
    ZeroXNilRegistry: registry.address
  }

  const deployedJson = require('../config/deployed.json')
  let currentJson = deployedJson.ZeroXNilRegistry[currentChain[0]]
  deployedJson.ZeroXNilRegistry[currentChain[0]] = {
    address: registry.address,
    when: (new Date).toISOString()
  }
  if (currentJson) {
    let old = {}
    old[currentChain[0]] = currentJson
    deployedJson.ZeroXNilRegistry.previousVersions.push(old)
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


const {expect, assert} = require("chai");
const {calcMaxSupply, signUsingWeb3} = require('./helpers/utils')

describe("TweedentityV2", async function () {



  let TweedentityV2;
  let tweedentity;

  const twitterId = 637842903701;

  beforeEach(async function () {
    const [owner, oracle, org, user, donee1, donee2] = await ethers.getSigners();

    TweedentityV2 = await ethers.getContractFactory("TweedentityV2");
    tweedentity = await TweedentityV2.deploy(
        oracle.address,
        org.address,
        "https://store.tweedentity.com/metadata/{id}.json",
        1000
    );
    await tweedentity.deployed();
  });

  it("should set up an identity", async function () {
    const [owner, oracle, org, user, donee1, donee2] = await ethers.getSigners();
    const abiEncoded = ethers.utils.defaultAbiCoder.encode(['address', 'uint256'], [user.address, twitterId])
    const hash = ethers.utils.keccak256(abiEncoded);

    // console.log(await oracle.signMessage(ethers.utils.solidityKeccak256(['address', 'uint256'], [user.address, twitterId])))

    const hexPrivateKey = "0x59c6995e998f97a5a0044966f0945389dc9e86dae88c7a8412f4603b6b78690d";
    const signingKey = new ethers.utils.SigningKey(hexPrivateKey);
    const psignature = signingKey.signDigest(hash);


    const signature = ethers.utils.joinSignature(psignature);
    await expect(tweedentity.connect(user).setIdentity(twitterId, signature))
        .to.emit(tweedentity, 'IdentitySet')
        .withArgs(user.address, twitterId);
  });

  // it("should mint personal tokens for a twitter account", async function () {
  //   const [owner, org, user, donee1, donee2] = await ethers.getSigners();
  //   await expect(tweedentity.connect(user).setClaim(proofId))
  //       .to.emit(tweedentity, 'ClaimSet')
  //       .withArgs(1, user.address, proofId);
  //   await expect(tweedentity.connect(oracle).approveClaim(1, twitterId, maxSupply))
  //       .to.emit(tweedentity, 'ClaimApproved')
  //       .withArgs(1, user.address, twitterId);
  //   const result = await expect(tweedentity.connect(user).mintIdentityToken(twitterId, maxSupply, 0))
  //       .to.emit(tweedentity, 'TransferSingle')
  //       // .withArgs(user.address, 0, user.address, twitterId, maxSupply);
  //   //
  //   expect(await tweedentity.balanceOf(user.address, twitterId))
  //       .to.equal(maxSupply - fee);
  //   expect(await tweedentity.balanceOf(org.address, twitterId))
  //       .to.equal(fee);
  //
  // });


});

const {expect, assert} = require("chai");
const {assertThrowsMessage} = require('./helpers')
const {utils} = require('@tweedentity/commons')

describe("Tweedentity", async function () {

  let Tweedentity;
  let tweedentity;

  const apps = {
    twitter: [1, true],
    reddit: [2, false],
    facebook: [3, true]
  }

  let owner, oracle, org, bob, alice, mark, joe, bill, wikileaks, assange
  let signature
  let tid = '273645362718263746'
  let addr0 = '0x0000000000000000000000000000000000000000'

  const rid = 'fxP8r3'
  let timestamp;
  let chainId;

  before(async function () {
    const signers = await ethers.getSigners()
    owner = signers[0];
    oracle = signers[1];
    org = signers[2];
    bob = signers[3];
    alice = signers[4];
    wikileaks = signers[5];
    assange = signers[6];
    mark = signers[7];
    joe = signers[8];
    bill = signers[9];
    await initNetworkAndDeploy()
    chainId = await tweedentity.getChainId()
  })

  function getSignature(address, appId, id, timestamp) {
    return utils.ECDSASign(ethers, '0x59c6995e998f97a5a0044966f0945389dc9e86dae88c7a8412f4603b6b78690d', ['uint256', 'address', 'uint256', 'uint256', 'uint256'], [chainId, address, appId, id, timestamp])
  }

  function getSignatures(address, appId, ids, timestamp) {
    return utils.ECDSASign(ethers, '0x59c6995e998f97a5a0044966f0945389dc9e86dae88c7a8412f4603b6b78690d', ['uint256', 'address', 'uint256', 'uint256[]', 'uint256'], [chainId, address, appId, ids, timestamp])
  }

  async function initNetworkAndDeploy() {
    Tweedentity = await ethers.getContractFactory("Tweedentity");
    tweedentity = await Tweedentity.deploy(
        oracle.address,
        org.address,
        "https://store.tweedentity.com/metadata/{id}.json",
        99 // hardhat progressiveChainId
    );
    await tweedentity.deployed();
  }

  async function getTimestamp() {
    return (await ethers.provider.getBlock()).timestamp
  }

  describe('#addApp', async function () {

    beforeEach(async function () {
      await initNetworkAndDeploy();
    });


    it("should add an app", async function () {
      const appNickname = ethers.utils.formatBytes32String('facebook')
      await expect(tweedentity.addApp(appNickname, true))
          .to.emit(tweedentity, 'AppAdded')
          .withArgs(3, appNickname);
    });

    it('should throw adding another app with a string as nickname', async function () {
      const appNickname = ethers.utils.formatBytes32String('linkedin')
      try {
        await tweedentity.addApp('linkedin', true)
        assert.isTrue(false)
      } catch (e) {
        assert.isTrue(e.message.indexOf('invalid arrayify value') > -1)
      }
    })

  })

  describe('#updateOracle', async function () {

    beforeEach(async function () {
      await initNetworkAndDeploy();
    });

    it("should update the oracle", async function () {
      await tweedentity.updateOracle(org.address)
      assert.equal(await tweedentity.oracle(), org.address)
    });

    it('should throw if not called by owner', async function () {

      await assertThrowsMessage(
          tweedentity.connect(oracle).updateOracle(org.address),
          'Ownable: caller is not the owner')
    })

  })

  describe('#setIdentity', async function () {

    beforeEach(async function () {
      await initNetworkAndDeploy();
    });

    it("should set up a twitter identity", async function () {

      timestamp = await getTimestamp()
      tid = 637800044
      signature = getSignature(bob.address, 1, tid, timestamp)
      await expect(tweedentity.connect(bob).setIdentity(1, tid, timestamp, signature))
          .to.emit(tweedentity, 'IdentitySet')
          .withArgs(1, tid, bob.address);
    });

    it("should set up a reddit identity", async function () {

      let numericRid = utils.fromAlphanumericStringToIntegerString(rid)
      timestamp = await getTimestamp()

      signature = getSignature(bob.address, 2, numericRid, timestamp)
      await expect(tweedentity.connect(bob).setIdentity(2, numericRid, timestamp, signature))
          .to.emit(tweedentity, 'IdentitySet')
          .withArgs(2, numericRid, bob.address);
    });

    it('should throw if app not supported', async function () {

      tid = 54433433
      timestamp = await getTimestamp()
      signature = getSignature(bob.address, 6, tid, timestamp)

      await assertThrowsMessage(
          tweedentity.connect(bob).setIdentity(6, tid, timestamp, signature),
          'Unsupported app')
    })

    it('should throw if already set', async function () {

      tid = '342343543456545676'
      timestamp = await getTimestamp()
      signature = getSignature(bob.address, 1, tid, timestamp)

      await tweedentity.connect(bob).setIdentity(1, tid, timestamp, signature)

      await assertThrowsMessage(
          tweedentity.connect(bob).setIdentity(1, tid, timestamp, signature),
          'Existing identity found for _appId/_address')

      timestamp = await getTimestamp()
      signature = getSignature(bob.address, 1, 87676, timestamp)

      await assertThrowsMessage(
          tweedentity.connect(bob).setIdentity(1, 87676, timestamp, signature),
          'Existing identity found for _appId/_address')

      timestamp = await getTimestamp()
      signature = getSignature(alice.address, 1, tid, timestamp)

      await assertThrowsMessage(
          tweedentity.connect(alice).setIdentity(1, tid, timestamp, signature),
          'Existing identity found for _appId/_id')
    })

    it('should throw if the signature is expired', async function () {

      timestamp = (await getTimestamp() - 100)
      signature = getSignature(alice.address, 1, tid, timestamp)

      await tweedentity.updateTimestampValidFor(5);

      await assertThrowsMessage(
          tweedentity.connect(alice).setIdentity(1, tid, timestamp, signature),
          'Signature expired')
    })

  })

  describe('#updateIdentity', async function () {

    beforeEach(async function () {
      await initNetworkAndDeploy();    });

    it("should update an identity", async function () {

      tid = 98786376453

      timestamp = await getTimestamp()
      signature = getSignature(bob.address, 1, tid, timestamp)

      await tweedentity.connect(bob).setIdentity(1, tid, timestamp, signature)

      await expect(tweedentity.connect(bob).updateIdentity(1, alice.address))
          .to.emit(tweedentity, 'IdentityUpdated')
          .withArgs(1, tid, alice.address);
    });

    it('should throw if not already set', async function () {

      await assertThrowsMessage(
          tweedentity.connect(mark).updateIdentity(1, joe.address),
          'No identity found for _appId/_oldAddress')
    })

    it('should throw if trying to update with an address that already owns an id', async function () {

      timestamp = await getTimestamp()

      signature = getSignature(bob.address, 1, tid, timestamp)
      await tweedentity.connect(bob).setIdentity(1, tid, timestamp, signature)

      timestamp = await getTimestamp()

      signature = getSignature(alice.address, 1, 123, timestamp)
      await tweedentity.connect(alice).setIdentity(1, 123, timestamp, signature)

      await assertThrowsMessage(
          tweedentity.connect(bob).updateIdentity(1, alice.address),
          'Existing identity found for _appId/_newAddress')
    })

  })

  describe('#claimIdentity', async function () {

    beforeEach(async function () {
      await initNetworkAndDeploy();
      await tweedentity.deployed();
    });

    tid = '203434323454345676'

    it("should claim an identity", async function () {

      timestamp = await getTimestamp()
      signature = getSignature(bob.address, 1, tid, timestamp)

      await tweedentity.connect(bob).setIdentity(1, tid, timestamp, signature)

      timestamp = await getTimestamp()
      signature = getSignature(alice.address, 1, tid, timestamp)

      await expect(tweedentity.connect(alice).claimIdentity(1, tid, timestamp, signature))
          .to.emit(tweedentity, 'ClaimStarted')
          .withArgs(1, tid, alice.address);
    });

    it('should throw if identity does not exist', async function () {

      timestamp = await getTimestamp()
      signature = getSignature(alice.address, 1, tid, timestamp)

      await assertThrowsMessage(
          tweedentity.connect(alice).claimIdentity(1, tid, timestamp, signature),
          'Claimed identity not found')
    })


    it('should throw if claimer already has an identity', async function () {

      timestamp = await getTimestamp()
      signature = getSignature(bob.address, 1, tid, timestamp)

      await tweedentity.connect(bob).setIdentity(1, tid, timestamp, signature)

      let tid2 = '83746453635262'

      timestamp = await getTimestamp()
      signature = getSignature(alice.address, 1, tid2, timestamp)

      await tweedentity.connect(alice).setIdentity(1, tid2, timestamp, signature)

      timestamp = await getTimestamp()
      signature = getSignature(alice.address, 1, tid, timestamp)

      await assertThrowsMessage(
          tweedentity.connect(alice).claimIdentity(1, tid, timestamp, signature),
          'Claimer owns some identity')
    })

    it('should throw if joe claims an identity already claimed by alice', async function () {

      timestamp = await getTimestamp()
      signature = getSignature(bob.address, 1, tid, timestamp)

      await tweedentity.connect(bob).setIdentity(1, tid, timestamp, signature)

      timestamp = await getTimestamp()
      signature = getSignature(alice.address, 1, tid, timestamp)

      await tweedentity.connect(alice).claimIdentity(1, tid, timestamp, signature)

      timestamp = await getTimestamp()
      signature = getSignature(joe.address, 1, tid, timestamp)

      await assertThrowsMessage(
          tweedentity.connect(joe).claimIdentity(1, tid, timestamp, signature),
          'Active claim found for identity')
    })

    it("should cancel a claim", async function () {

      timestamp = await getTimestamp()
      signature = getSignature(bob.address, 1, tid, timestamp)

      await tweedentity.connect(bob).setIdentity(1, tid, timestamp, signature)

      timestamp = await getTimestamp()
      signature = getSignature(alice.address, 1, tid, timestamp)

      await tweedentity.connect(alice).claimIdentity(1, tid, timestamp, signature)

      await expect(tweedentity.connect(alice).cancelActiveClaim(1, tid))
          .to.emit(tweedentity, 'ClaimCanceled')
          .withArgs(1, tid, alice.address);
    });

    it("should claim an identity and try to get it too early", async function () {

      timestamp = await getTimestamp()
      signature = getSignature(bob.address, 1, tid, timestamp)

      await tweedentity.connect(bob).setIdentity(1, tid, timestamp, signature)

      timestamp = await getTimestamp()
      signature = getSignature(joe.address, 1, tid, timestamp)

      await tweedentity.connect(joe).claimIdentity(1, tid, timestamp, signature)

      await assertThrowsMessage(
          tweedentity.connect(joe).updateClaimedIdentity(1, tid, timestamp, signature),
          'Probation time not passed yet')

    });

    it("should claim an identity and try to get it too late", async function () {

      timestamp = await getTimestamp()
      signature = getSignature(bob.address, 1, tid, timestamp)

      await tweedentity.connect(bob).setIdentity(1, tid, timestamp, signature)

      timestamp = await getTimestamp()
      signature = getSignature(joe.address, 1, tid, timestamp)

      await tweedentity.connect(joe).claimIdentity(1, tid, timestamp, signature)

      await tweedentity.updateProbationTimes(2, 1)
      await utils.sleep(5000)

      await assertThrowsMessage(
          tweedentity.connect(joe).updateClaimedIdentity(1, tid, timestamp, signature),
          'Claim is expired')

    });


    it("should claim an identity and get it", async function () {

      timestamp = await getTimestamp()
      signature = getSignature(bob.address, 1, tid, timestamp)
      await tweedentity.connect(bob).setIdentity(1, tid, timestamp, signature)

      timestamp = await getTimestamp()
      signature = getSignature(joe.address, 1, tid, timestamp)

      await tweedentity.connect(joe).claimIdentity(1, tid, timestamp, signature)

      await tweedentity.updateProbationTimes(2, 10)
      await utils.sleep(5000)

      timestamp = await getTimestamp()
      signature = getSignature(joe.address, 1, tid, timestamp)

      await expect(tweedentity.connect(joe).updateClaimedIdentity(1, tid, timestamp, signature))
          .to.emit(tweedentity, 'IdentityUpdated')
          .withArgs(1, tid, joe.address);

    });

  })

  describe('#mintToken', async function () {

    beforeEach(async function () {
      await initNetworkAndDeploy();
    });

    it("should mint a personal tokens without donations", async function () {

      timestamp = await getTimestamp()
      signature = getSignature(bob.address, 1, tid, timestamp)

      await tweedentity.connect(bob).setIdentity(1, tid, timestamp, signature)

      let tokenId = await tweedentity.nextTokenId(1, tid)
      timestamp = await getTimestamp()
      signature = getSignature(bob.address, 1, tokenId, timestamp)

      await expect(tweedentity.connect(bob).mintToken(1, tokenId, 100, [], [], timestamp, signature))
          .to.emit(tweedentity, 'TransferSingle')
          .withArgs(bob.address, addr0, bob.address, tokenId, 100);

    });

    it("should mint a personal tokens with a donation to the org", async function () {

      timestamp = await getTimestamp()
      signature = getSignature(bob.address, 1, tid, timestamp)

      await tweedentity.connect(bob).setIdentity(1, tid, timestamp, signature)

      let tokenId = await tweedentity.nextTokenId(1, tid)
      timestamp = await getTimestamp()
      signature = getSignature(bob.address, 1, tokenId, timestamp)

      await expect(tweedentity.connect(bob).mintToken(1, tokenId, 100, [3], [addr0], timestamp, signature))
          .to.emit(tweedentity, 'TransferSingle')
          .withArgs(bob.address, addr0, bob.address, tokenId, 100)
          .to.emit(tweedentity, 'TransferSingle')
          .withArgs(bob.address, bob.address, org.address, tokenId, 3);

    });

    it("should mint a personal tokens with multiple donations", async function () {

      timestamp = await getTimestamp()
      signature = getSignature(bob.address, 1, tid, timestamp)

      await tweedentity.connect(bob).setIdentity(1, tid, timestamp, signature)

      let tokenId = await tweedentity.nextTokenId(1, tid)
      timestamp = await getTimestamp()
      signature = getSignature(bob.address, 1, tokenId, timestamp)

      await expect(tweedentity.connect(bob).mintToken(1, tokenId, 100, [5, 4, 4], [wikileaks.address, assange.address, addr0], timestamp, signature))
          .to.emit(tweedentity, 'TransferSingle')
          .withArgs(bob.address, addr0, bob.address, tokenId, 100)
          .to.emit(tweedentity, 'TransferSingle')
          .withArgs(bob.address, bob.address, wikileaks.address, tokenId, 5)
          .to.emit(tweedentity, 'TransferSingle')
          .withArgs(bob.address, bob.address, assange.address, tokenId, 4)
          .to.emit(tweedentity, 'TransferSingle')
          .withArgs(bob.address, bob.address, org.address, tokenId, 4);

    });

    it("should mint a personal tokens with other donations", async function () {

      timestamp = await getTimestamp()
      signature = getSignature(bob.address, 1, tid, timestamp)

      await tweedentity.connect(bob).setIdentity(1, tid, timestamp, signature)

      let tokenId = await tweedentity.nextTokenId(1, tid)
      timestamp = await getTimestamp()
      signature = getSignature(bob.address, 1, tokenId, timestamp)

      await expect(tweedentity.connect(bob).mintToken(1, tokenId, 100, [4, 3], [wikileaks.address, assange.address], timestamp, signature))
          .to.emit(tweedentity, 'TransferSingle')
          .withArgs(bob.address, addr0, bob.address, tokenId, 100)
          .to.emit(tweedentity, 'TransferSingle')
          .withArgs(bob.address, bob.address, wikileaks.address, tokenId, 4)
          .to.emit(tweedentity, 'TransferSingle')
          .withArgs(bob.address, bob.address, assange.address, tokenId, 3);

    });

  })


  describe('#mintBatchToken', async function () {

    beforeEach(async function () {
      await initNetworkAndDeploy();
    });

    it("should mint three personal tokens without donations", async function () {

      timestamp = await getTimestamp()
      signature = getSignature(bob.address, 1, tid, timestamp)

      await tweedentity.connect(bob).setIdentity(1, tid, timestamp, signature)

      let tokenId = await tweedentity.nextTokenId(1, tid)
      let tokenIds = [
        tokenId,
        tokenId.add(1),
        tokenId.add(2)
      ]
      timestamp = await getTimestamp()
      signature = getSignatures(bob.address, 1, tokenIds, timestamp)
      let supplies = [100, 50, 30]
      let donations = [0, 0, 0]
      let donees = []
      let temp = [0, 0, 0]

      await expect(tweedentity.connect(bob).mintBatchToken(
          1,
          tokenIds,
          supplies,
          donations,
          donees,
          temp,
          timestamp,
          signature
      ))
          .to.emit(tweedentity, 'TransferBatch')
          .withArgs(bob.address, addr0, bob.address, tokenIds, supplies);

    });

    it("should mint three personal tokens with donations to three orgs", async function () {

      timestamp = await getTimestamp()
      signature = getSignature(bob.address, 1, tid, timestamp)

      await tweedentity.connect(bob).setIdentity(1, tid, timestamp, signature)

      let tokenId = await tweedentity.nextTokenId(1, tid)
      let tokenIds = [
        tokenId,
        tokenId.add(1),
        tokenId.add(2)
      ]
      timestamp = await getTimestamp()
      signature = getSignatures(bob.address, 1, tokenIds, timestamp)
      let supplies = [5, 50, 500]
      let donations = [1, 5, 13]
      let donees = [
        wikileaks.address,
        assange.address,
        org.address
      ]
      let temp = [0, 0, 0]

      await expect(tweedentity.connect(bob).mintBatchToken(
          1,
          tokenIds,
          supplies,
          donations,
          donees,
          temp,
          timestamp,
          signature
      ))
          .to.emit(tweedentity, 'TransferBatch')
          .withArgs(bob.address, addr0, bob.address, tokenIds, supplies)
          .to.emit(tweedentity, 'TransferBatch')
          .withArgs(bob.address, bob.address, wikileaks.address, tokenIds, [1, 2, 5])
          .to.emit(tweedentity, 'TransferBatch')
          .withArgs(bob.address, bob.address, assange.address, tokenIds, [0, 2, 4])
          .to.emit(tweedentity, 'TransferBatch')
          .withArgs(bob.address, bob.address, org.address, tokenIds, [0, 1, 4])

    });

  })

});

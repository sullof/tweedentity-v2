const ethers = require('ethers')

const utils = {

  alphanumericAlphabet: 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789_-',

  fromAlphanumericStringToIntegerString(str = '') {
    let result = ''
    for (let i = 0; i < str.length; i++) {
      let pos = this.alphanumericAlphabet.indexOf(str[i])
      if (pos === -1) {
        throw new Error('Unsupported char found')
      }
      if (pos < 10) {
        pos = `0${pos}`
      }
      result += pos
    }
    return result.replace(/^0/, '')
  },

  fromIntegerStringToAlphanumericString(str = '') {
    let result = ''
    if (str.length % 2) {
      str = '0' + str
    }
    if (/[^0-9]+/.test(str)) {
      throw new Error('Unsupported digit found')
    }
    for (let i = 0; i < str.length; i += 2) {
      let j = parseInt(str.substring(i, i + 2))
      result += this.alphanumericAlphabet.charAt(j)
    }
    return result
  },

  ECDSASign(ethers, hexPrivateKey, types, values) {
    const abiEncoded = ethers.utils.defaultAbiCoder.encode(types, values)
    const hash = ethers.utils.keccak256(abiEncoded);
    const signingKey = new ethers.utils.SigningKey(hexPrivateKey);
    const signedDigest = signingKey.signDigest(hash);
    return ethers.utils.joinSignature(signedDigest);
  },

  integerStringToBytes32(ethers, integerStr) {
    let hexstr = ethers.BigNumber.from(integerStr).toHexString()
    if (hexstr.length > 66) {
      throw new Error('Number too big')
    } else if (hexstr.length < 66) {
      hexstr = hexstr.substring(2)
      hexstr = '0x' + '0'.repeat(64 - hexstr.length) + hexstr
    }
    return hexstr
  },

  async sleep(millis) {
    return new Promise(resolve => setTimeout(resolve, millis))
  },

  bytes32Names: {
    token: '0x746f6b656e000000000000000000000000000000000000000000000000000000',
    store: '0x73746f7265000000000000000000000000000000000000000000000000000000',
    manager: '0x6d616e6167657200000000000000000000000000000000000000000000000000',
    claimer: '0x636c61696d657200000000000000000000000000000000000000000000000000'
  }

}

module.exports = utils



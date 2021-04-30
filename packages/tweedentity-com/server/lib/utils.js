const sigUtil = require('eth-sig-util')

module.exports = {

  sleep: async millis => {
    return new Promise(resolve => setTimeout(resolve, millis))
  },

  signIn(wallet, token, signature) {

    if (!wallet || !token || !signature) {
      return Promise.resolve({
        success: false,
        error: 'Wrong parameters'
      })
    }
    const recovered = sigUtil.recoverTypedSignature({
      data: [
        {
          type: 'string',
          name: 'tweedentity',
          value: `AuthToken: ${token}`
        }
      ],
      sig: signature
    })
    if (sigUtil.normalize(recovered) === sigUtil.normalize(wallet)) {
      const authToken = Math.random().toString(36).replace(/[^a-z]+/g, '').substr(0, 12)
      return Promise.resolve({
        success: true,
        authToken
      })
    } else {
      return Promise.resolve({
        success: false,
        error: 'Wrong signature'
      })
    }
  }

}

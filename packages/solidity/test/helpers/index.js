const {assert} = require("chai");

module.exports = {

  calcMaxSupply(n) {
    n = Math.floor(Math.pow(Math.log(n > 2 ? n : 2), Math.log(Math.log(n))))
    return n > 10000 ? 10000 : n > 10 ? n : 10
  },

  async assertThrowsMessage(promise, message, showError) {
    try {
      await promise
      assert.isTrue(false)
      console.error('This did not throw: ', message)
    } catch (e) {
      if (showError) {
        console.error('Expected: ', message)
        console.error(e.message)
      }
      assert.isTrue(e.message.indexOf(message) > -1)
    }
  }
}

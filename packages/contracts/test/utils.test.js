const chai = require('chai')
const assert = chai.assert
const {utils} = require('../src')

describe('#utils', function () {


  describe('fromAlphanumericStringToIntegerString', async function () {

    it('should convert a string id to a numeric id', async function () {
      assert.equal(utils.fromAlphanumericStringToIntegerString('a8y-3i_'), '26605063553462')
    })

    it('should throw if the string has out of range chars', function () {
      try {
        utils.fromAlphanumericStringToIntegerString('ax2B2_&')
        assert.isFalse(true)
      } catch (e) {
        assert.equal(e.message, 'Unsupported char found')
      }
    })

   })
  describe('fromIntegerStringToAlphanumericString', async function () {

    it('should convert a string id to a numeric id', async function () {
      let int = utils.fromAlphanumericStringToIntegerString('a8y-3i_')
      assert.equal(utils.fromIntegerStringToAlphanumericString(int), 'a8y-3i_')
    })

    it('should throw if the string has unsupported chars', function () {
      try {
        utils.fromIntegerStringToAlphanumericString('182737t63')
        assert.isFalse(true)
      } catch (e) {
        assert.equal(e.message, 'Unsupported digit found')
      }
    })

  })

})

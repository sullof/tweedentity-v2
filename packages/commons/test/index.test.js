const chai = require('chai')
const assert = chai.assert
const {utils} = require('../src')

describe('#utils', function () {


  describe('fromAlphanumericStringToBitIntegerString', async function () {

    it('should convert a string id to a numeric id', async function () {
      assert.equal(utils.fromAlphanumericStringToBitIntegerString('ax2B2'), '2649540154')
    })

    it('should throw if the string has unsupported chars', function () {
      try {
        utils.fromAlphanumericStringToBitIntegerString('ax2B2&')
        assert.isFalse(true)
      } catch (e) {
        assert.equal(e.message, 'Unsupported char found')
      }
    })

   })



})

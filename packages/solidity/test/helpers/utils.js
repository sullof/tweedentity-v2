
module.exports = {

  async sleep(millis) {
    return new Promise(resolve => setTimeout(resolve, millis))
  },

  calcMaxSupply(n) {
    n = Math.floor(Math.pow(Math.log(n > 2 ? n : 2), Math.log(Math.log(n))))
    return n > 10000 ? 10000 : n > 10 ? n : 10
  }
}

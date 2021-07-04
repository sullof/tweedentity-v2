const request = require('superagent')
const cheerio = require('cheerio')
const sigUtil = require('eth-sig-util')

class Reddit extends require('.') {

  async getDataById(webApp, nameId) {
    if (webApp === 'twitter') {
      return this.getDataByTwitterUserId(nameId)
    } else if (webApp === 'reddit') {
      return this.getDataByRedditUsername(nameId)
    } else {
      throw(new Error('App not supported'))
    }
  }

  async getDataByTwitterUserId(userId) {

    try {
      const user = await this.twitterClient.get(`users/${userId}?user.fields=name,profile_image_url`, {})

      const userData = {
        userId,
        name: user.data.name,
        username: user.data.username,
        avatar: user.data.profile_image_url
      }

      return userData

    } catch(e) {
      throw(new Error('Not found'))
    }
  }

  async getIdByUsername(username) {
    let userData = {}
    return request
        .get(`https://www.reddit.com/user/${username}/about.json`)
        .set('User-Agent', 'Mozilla/5.0 (Macintosh; Intel Mac OS X 11_2_1) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/88.0.4324.182 Safari/537.36')
        .set('Accept', 'application/json')
        .then(res => {
          let data = res.body && res.body.data || {}
          if (data.name) {
            const name = data.name.toLowerCase()
            if (name === username.toLowerCase()) { p
              userData = {
                userId: data.id,
                username: data.name,
                avatar: data.icon_img.replace(/&amp;/g, '&')
              }
              return Promise.resolve()
            } else {
              throw(new Error('Not found'))
            }
          } else {
            throw(new Error('Not found'))
          }
        })
        .then(() => {
          return request
              .get(`https://www.reddit.com/user/${username}`)
              .then(redditor => {
                if (redditor.text) {
                  const $ = cheerio.load(redditor.text)
                  userData.name = $('h4').text()
                }
                return Promise.resolve(userData)
              })
        })
        .catch(err => {
          if (userData.userId) {
            return Promise.resolve(userData)
          } else {
            return Promise.resolve({
              error: 'Not found'
            })
          }
        })
  }

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


module.exports = new Reddit

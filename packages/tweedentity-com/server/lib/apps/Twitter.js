const TwitterV2 = require('twitter-v2')

class Twitter extends require('.') {

  constructor() {
    super()
    const params = {
      consumer_key: process.env.TWITTER_CONSUMER_KEY,
      consumer_secret: process.env.TWITTER_CONSUMER_SECRET,
      access_token_key: process.env.TWITTER_ACCESS_TOKEN_KEY,
      access_token_secret: process.env.TWITTER_ACCESS_TOKEN_SECRET
    }
    this.client = new TwitterV2(params)
  }

  async getDataById(id) {
    try {
      const user = await this.client.get(`users/${id}?user.fields=name,profile_image_url`, {})

      const userData = {
        id,
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
    try {
      const user = await this.client.get(`users/by/username/${username}`, {})
      return user.data.id
    } catch(e) {
      throw(new Error('Not found'))
    }
  }

}


module.exports = new Twitter

const config = {
  apps: {
    tweedentity: {
      id: 0
    },
    twitter: {
      id: 1,
      decoration: '@',
      post: post => `https://twitter.com/intent/tweet?text=${escape(post)}&source=webclient`,
      account: 'tweedentity',
      profile: username => `https://twitter.com/${username}`
    },
    reddit: {
      id: 2,
      decoration: 'u/',
      post: () => `https://redd.it/8u3ywj`,
      account: 'tweedentity',
      profile: username => `https://www.reddit.com/user/${username}`

    },
    instagram: {
      id: 3,
      decoration: '@',
      account: 'tweedentity',
      profile: username => `https://instagram.com/${username}`
    }
  }
}

module.exports = {
  config,
  ABIs: require('./ABIs.json'),
  deployed: require('./deployed.json'),
  chains: require('./chains')
}

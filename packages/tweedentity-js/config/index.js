const config = {
  apps: {
    tweedentity: {
      id: 0,
      active: true
    },
    twitter: {
      id: 1,
      decoration: '@',
      post: post => `https://twitter.com/intent/tweet?text=${escape(post)}&source=webclient`,
      account: 'tweedentity',
      profile: username => `https://twitter.com/${username}`,
      active: true
    },
    reddit: {
      id: 2,
      decoration: 'u/',
      post: () => `https://redd.it/8u3ywj`,
      account: 'tweedentity',
      profile: username => `https://www.reddit.com/user/${username}`,
      active: true

    },
    instagram: {
      id: 3,
      decoration: '@',
      account: 'tweedentity',
      profile: username => `https://instagram.com/${username}`
    }
  },
  ABIs: require('./ABIs.json'),
  deployed: require('./deployed.json'),
  chains: require('./chains')
}

module.exports = config

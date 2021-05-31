let isDev
if (typeof window !== 'undefined') {
  isDev = /localhost/.test(window.location.host)
} else if (typeof process !== undefined && process.env) {
  isDev = process.env.NODE_ENV === 'development'
}

module.exports = {
  isDev,
  registry: {
    address: {
      // ropsten: "0xf7BD7B1A06EBC32012A6A8B5fF1572fB821A043F",
      // main: "0xa22c435c3e7c29298bf743f842e56d16511d7bc8",
      1337: isDev ? "0xD49a0e9A4CD5979aE36840f542D2d7f02C4817Be" : undefined
    }
  },
  supportedId: {
    1337: 'localhost'
  },
  forPost: {
    twitter: (post) => `https://twitter.com/intent/tweet?text=${escape(post)}&source=webclient`,
    reddit: () => `https://redd.it/8u3ywj`
  },
  appId: {
    twitter: 1,
    // reddit: 2,
    instagram: 3
  },
  appNickname: {
    1: 'twitter',
    // 2: 'reddit',
    3: 'instagram'
  },
  profileOnApp: {
    twitter: username => `https://twitter.com/${username}`,
    reddit: username => `https://www.reddit.com/user/${username}`,
    instagram: username => `https://instagram.com/${username}`
  }
}

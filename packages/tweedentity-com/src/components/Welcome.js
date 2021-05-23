// eslint-disable-next-line node/no-missing-require
const {Redirect} = require('react-router-dom')

const LoadingApp = require('./LoadingApp')
const Account = require('./Account')

// eslint-disable-next-line node/no-missing-require
const {Container, Row, Col} = require('react-bootstrap')
const Base = require('./Base')

class Welcome extends Base {
  constructor(props) {
    super(props)

    this.bindMany([
      'expandWallet'
    ])

    this.state = {
      expandWallet: false
    }
  }

  async componentDidMount() {
    await this.getStats(true)
  }


  expandWallet() {
    this.setState({
      expandWallet: !this.state.expandWallet
    })
  }

  render() {

    // const as = this.appState()
    // const wallet = as.wallet

    const state = this.db.data[this.wallet]

    let walletAlreadyUsed = false

    if (true
      // state
    ) {

      let twitterUserId
      let twitter = {}
      try {
        twitterUserId = state.twitter.userId
        twitter = state.twitter
        if (twitterUserId) {
          walletAlreadyUsed = true
        }
      } catch (e) {
      }

      let redditUserId
      let reddit = {}
      try {
        redditUserId = state.reddit.userId
        reddit = state.reddit
        if (redditUserId) {
          walletAlreadyUsed = true
        }
      } catch (e) {
      }

      return (
        <Container style={{marginTop: 32}}>
          <Row>
            <Col md={12}>
              <h4 style={{
                textAlign: 'center',
                marginBottom: 48,
                whiteSpace: 'nowrap',
                overflow: 'hidden',
                textOverflow: 'ellipsis'
              }}>
                {
                  twitterUserId || redditUserId
                    ? 'Welcome back ' : 'Welcome '
                } {
                this.state.expandWallet
                  ? <span>{this.Store.wallet} <i onClick={this.expandWallet}
                                         className="command fa fa-minus-circle" style={{cursor: 'pointer'}}/>
                  </span>

                  : <span>{this.shortWallet()} <i onClick={this.expandWallet}
                                                         className="command fa fa-plus-circle" style={{cursor: 'pointer'}}/>
                  </span>
              }</h4>
              {
                this.Store.ready === 0
                  ? <p className="centered" style={{
                    paddingBottom: 16,
                    marginTop: -30
                  }}>
                    <span className="danger"><i className="fas fa-exclamation-circle"/>Tweedentity is under maintainance and right now it is not possible to set or update a tweedentity.</span>
                  </p>
                  : null
              }
            </Col>
          </Row>
          <Row>
            <Col md={4}>
              <Account
                api={this.props.api}
                icon="twitter"
                webApp="twitter"
                data={twitter}
                active={true}
                getStats={() => {
                  // this.setGlobalState({
                  //   appNickname: 'twitter'
                  // })
                  this.getStats('twitter', walletAlreadyUsed)
                }}
              />
            </Col>
            <Col md={4}>
              <Account
                api={this.props.api}
                icon="reddit"
                webApp="reddit"
                data={reddit}
                active={true}
                // getStats={() => {
                  // this.setGlobalState({
                  //   appNickname: 'reddit'
                  // })
                  // this.getStats(as, walletAlreadyUsed)
                // }}
              />
            </Col>
            <Col md={4}>
              <Account
                api={this.props.api}
                icon="instagram"
                webApp="instagram"
                active={false}
              />
            </Col>
          </Row>
          <Row><Col>&nbsp;</Col></Row>
          <Row>

            <Col md={4}>
              <Account
                api={this.props.api}
                icon="github"
                webApp="github"
                active={false}
              />
            </Col>
          </Row>
        </Container>
      )

    }

    return <LoadingApp
      className="Lato"
      api={this.props.api}
      message="Loading the data from the blockchain..."
    />

  }
}

module.exports = Welcome

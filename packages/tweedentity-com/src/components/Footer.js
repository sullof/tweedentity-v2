// eslint-disable-next-line node/no-missing-require
const {Container, Row, Col} = require('react-bootstrap')
const Base = require('./Base')

class Footer extends Base {

  constructor(props) {
    super(props)

  }

  render() {

    return (
        <Container className="footer footerContainer">
          <Row>
            <Col md={12}>
              <div className="centered level0">
                <span className="roboto300">
                Tweedentity is part of the <a href="https://0xnil.com" target="_blank" rel="noreferrer">0xNIL</a> project.</span>
              </div>
            </Col>
          </Row>
          <Row>
            <Col md={12}>
              <div className="centered level1">
                {
                  // this.appState().www ? null :
                    <span>
                    <span className="item" onClick={()=>{
                      this.historyPush('terms')
                      window.scroll(0,0)
                    }}>
                      <i className="fab fa-dot-circle-o"></i> <span className="roboto300">Terms of use and Privacy</span>
                </span>
                      {/*<span className="item" onClick={()=>{*/}
                      {/*this.setGlobalState({}, {*/}
                      {/*show: true,*/}
                      {/*modalTitle: 'Whoops',*/}
                      {/*modalBody: 'This link will be activated soon.'*/}
                      {/*})*/}
                      {/*}}>*/}
                      {/*<i className="fab fa-user-secret"></i> Privacy*/}
                      {/*</span>*/}
                      <a className="item">|</a>
                  </span>
                }

                <a className="item" target="_blank" href="https://medium.com/0xnil/search?q=tweedentity" rel="noreferrer">
                  <i className="fab fa-medium"></i> <span className="roboto300">Blog</span>
                </a>
                <a className="item" target="_blank" href="https://twitter.com/tweedentity" rel="noreferrer">
                  <i className="fab fa-twitter"></i> <span className="roboto300">Twitter</span>
                </a>
                <a className="item" target="_blank" href="https://github.com/tweedentity" rel="noreferrer">
                  <i className="fab fa-github"></i> <span className="roboto300">Github</span>
                </a>
                <a className="item" href="mailto:info@tweedentity.com">
                  <i className="fab fa-envelope"></i> <span className="roboto300">Email</span>
                </a>
              </div>
            </Col>
          </Row>
          <Row>
            <Col md={12}>
              <div className="centered level2">
                {/*(c) 2018, Francesco Sullo &lt;francesco@sullo.co&gt;*/}
              </div>
            </Col>
          </Row>
        </Container>
    )
  }
}

module.exports = Footer

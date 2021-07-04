const Base = require('./Base')

// eslint-disable-next-line node/no-missing-require
const {Container, Row, Col} = require('react-bootstrap')


class LoadingApp extends Base {

  render() {

    return (
      <Container>
        <Row>
          <Col md={12}>
            <p className="centered" style={{paddingTop: 160}}><img src="/images/spinner.svg"/></p>
            <p className="centered" style={{paddingBottom: 160}}>{this.props.message}</p>
          </Col>
        </Row>
      </Container>
    )

  }
}

module.exports =  LoadingApp

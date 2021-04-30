const Base = require('./Base')

// eslint-disable-next-line node/no-missing-require
const {Container, Row, Col, Form, Button} = require('react-bootstrap')


class Terms extends Base {

  constructor(props) {
    super(props)

    this.bindMany([
      'handleTerms'
    ])

    setTimeout(() => {
      window.scroll(0, 0)
    }, 100)
  }

  handleTerms(e) {

    this.db.put('profile', {
      termsAccepted: e.target.checked
    })
  }


  render() {

    const termsAccepted = this.db.data.profile && this.db.data.profile.termsAccepted

    return <Container style={{marginTop: 32}}>

      <Row>
        <Col md={12}>
          <h3>SIMPLE TERMS OF USE AND PRIVACY</h3>
          <p>Version 2 — Revised: April 18, 2021</p>
        </Col>
      </Row>

      <Row><Col><div className="thinline"><div></div></div></Col></Row>

      <Row>
        <Col md={12}>


          <h4 className="centered">INTRODUCTION</h4>
          <p>

            A <i>tweedentity</i> is a public association in the Blockchain, between
            an
            Ethereum Wallet (a “Wallet”) and a user-id of a publicly-accessible account on a social network (a
            “UserID”).</p>
          <p>

            Tweedentity.com (the &quot;DApp&quot;) is a decentralized app, which acts as a pure interface to allow
            anyone who
            owns a Wallet and a publicly-accessible account on a social network to set a <i>tweedentity</i>. In order
            to do so,
            the DApp offers an interface to prepare the data and, when the data are ready, to control their integrity
            and
            execute specific methods of a set of smart contracts on the Blockchain to save the <i>tweedentity</i>. Those
            smart
            contracts are accessible by any other tool which aims to offer the same service to wallet’s owners.
          </p>
          <p></p>
        </Col>
      </Row>

      <Row><Col><div className="thinline"><div></div></div></Col></Row>

      <Row>
        <Col md={12}>
          <h4 className="centered">In order to use app.tweedentity.com you must know and agree with the following points:</h4>
          <p>&nbsp;</p>

          <h5>PRIVACY</h5>
          <p>
            Since the Blockchain is public, any data saved in the Blockchain is public, and will be public forever.
            This means that any <i>tweedentity</i> is public. After that a <i>tweedentity</i> has been set, changing it
            does not
            remove the historical data that can be anyway recovered from the past blocks.
            In other words, privacy does not exist in a public blockchain.</p>
          <p>Only who has a clear understanding of the public nature of
            the Blockchain and of a <i>tweedentity</i>, and agrees to set a public <i>tweedentity</i> on the public
            Blockchain can use
            the DApp. Anyone else must not use the DApp.
          </p>
          <p>In the blockchain, the data are public and only the Wallet&apos;s owners can set/update
            their <i>tweedentities</i>.
            They can use the DApp or any other compatible tool in order to do so.</p>
          <h5>DATA</h5>
          <p>The tweedentities are saved in the Blockchain, which means that they are stored and maintained by the blockchain itself. This also means that the Wallet’s owner can directly access the smart contracts and use any
            compatible tool to set/unset its <i>tweedentity</i> (for example, on Ethereum, the section <i>Write Contract</i>, in the
            Etherscan page of to the contract).
          </p>
          <h5>COSTS</h5>
          <p>
            Setting a <i>tweedentity</i>, despite if the user uses DApp or any other compatible interface, has a cost.
            This
            cost depends on the price of the gas requested by miners to handle the transactions. Since the gas price
            fluctuates heavily on an hourly basis, the price to set a <i>tweedentity</i> can vary from a few cents of
            a dollar
            to hundreds of dollars, depending on the specific blockchain. It is the sole responsibility of the Wallet&apos;s owner to decide the best
            moment
            to
            set up a <i>tweedentity</i>, depending on their willingness of spending money. In any case, the DApp does not
            receive
            any money. Its sole role is to prepare the transactions which must be signed and sent to the blockchain by the user, via their wallet (for example, Metamask).
          </p>
          <h5>NETWORKS</h5>
          <p>
            The DApp works on a few Ethereum-compatible networks, and, for test purposes,
            on relative testnets. In
            order
            to use the DApp, you must own a Wallet and use a compatible browser with a compatible wallet app. We suggest
            Metamask.
          </p>
          <h5>LIABILITY</h5>
          <p>
            The Blockchain is not under the control of the DApp. The DApp cannot be considered liable for anything
            would happen in the Blockchain, nor if someone uses the <i>tweedentity</i> for identity theft and/or any
            other
            illegal activities.
            You agree that the DApp is a pure tool and setting/unsetting a <i>tweedentity</i>,
            and/or whatever happens to a <i>tweedentity</i>,
            and/or however a <i>tweedentity</i> is used in the future, is under your own
            responsibility. If you
            disagree, you MUST not use the DApp.
          </p>
          <h5>UPGRADABILITY</h5>
          <p>
            This Terms can be improved and changed at any moment. Accepting them, you accept also all the future
            versions of the Terms.
          </p>
        </Col>
      </Row>

      <Row><Col><div className="thinline"><div></div></div></Col></Row>


      <Row>
        <Col md={12}>

          <Form.Group controlId="formBasicCheckbox">
            <Form.Check
              checked={termsAccepted}
              onChange={this.handleTerms}
              type="checkbox"
              label="I have read the terms of use and the privacy policy above and I agree on everything" />
          </Form.Group>

          {/*<Checkbox inline*/}
          {/*          checked={termsAccepted}*/}
          {/*          onChange={this.handleTerms}*/}
          {/*>I have read the terms of use and the privacy policy above and I agree on everything.</Checkbox>*/}
          <p style={{paddingTop: 12}}>
            <Button
              variant="primary"
              onClick={() => {
                window.history.back()
              }}
            >Go back</Button>
          </p>
        </Col>
      </Row>
    </Container>
  }
}

module.exports = Terms

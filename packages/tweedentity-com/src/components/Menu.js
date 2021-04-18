const React = require('react')
const {Link} = require('react-router-dom')
const {Navbar, NavDropdown, Button} = require('react-bootstrap')

const Base = require('./Base')

module.exports = class Menu extends Base {

  constructor(props) {
    super(props)

    this.state = {
      count: 0,
      expanded: false
    }

    this.bindMany([
      'updateState',
      'toggleAdminMode',
      'makeNotVisible',
      'expandAddress'
    ])
  }

  updateState() {
    this.setState({
      count: this.state.count + 1
    })
  }

  isMe(me) {
    if (!window.location.pathname && me === '/') {
      return 'selected'
    }
    if (window.location.pathname === me) {
      return 'selected'
    }
    return ''
  }

  toggleAdminMode() {
    this.store({
      isAdminMode: !(this.Store.isAdminMode || false)
    })
  }

  makeNotVisible() {
    this.store({
      menuVisibility: false
    })
  }

  expandAddress() {
    this.setState({
      expanded: !this.state.expanded
    })
  }


  render() {

    let connectedTo =
      <span style={{color: '#ff2050', fontWeight: 300}}>
        Connected to an unsupported network <i style={{marginLeft: 5}} className="command fas fa-question-circle"/>
    </span>

    const Store = this.Store

    let {connectedNetwork, signedInAddress} = Store

    // console.log

    let address = null
    let shortAddress

    if (connectedNetwork) {

      connectedTo =
        <span><i className="fa fa-plug" style={{color: '#40cc90', marginRight: 10}}></i> Connected to {connectedNetwork}</span>

      if (signedInAddress) {
        let fullAddress = signedInAddress
        shortAddress = fullAddress.substring(0, 8)
        if (this.state.expanded) {
          address = <span>{signedInAddress} <i onClick={this.expandAddress} className="command fa fa-minus-circle"
          /></span>
        } else {
          address = <span>{shortAddress}
            <i style={{marginLeft: 5}} onClick={this.expandAddress}
               className="command fa fa-plus-circle"
            /></span>
        }
      }
    } else {
      connectedTo = <Button onClick={this.props.connect} variant="dark">Connect your wallet</Button>
    }


    // if (this.Store.
    // <span><i class="fa fa-plug" style="color: rgb(136, 255, 102);"></i> You are connected to the Ropsten Testnet</span>

    let linkToHome = `${location.protocol}//${location.host.replace(/^(d|)app\./,'')}`


    return <Navbar fixed="top" bg="light" expand="lg">
      <Navbar.Brand href={linkToHome}><img src="/images/tweedentity-w-ico.png" style={{marginLeft: 12}}/></Navbar.Brand>
      <Navbar.Toggle aria-controls="basic-navbar-nav"/>
      {
        Store.signedInAddress
          ? <Navbar.Collapse id="responsive-navbar-nav">
            <Link to="/items">See all the tokens</Link>
            <Link to="/claim">Claim a token</Link>
            <Link to="/mint">Mint a claimed token</Link>
          </Navbar.Collapse>
          :
          <Navbar.Collapse id="responsive-navbar-nav">
            <Navbar.Text>See all the tokens</Navbar.Text>
            <Navbar.Text>Claim a token</Navbar.Text>
            <Navbar.Text>Mint a claimed token</Navbar.Text>
          </Navbar.Collapse>
      }
      <Navbar.Collapse className="justify-content-end">
        <Navbar.Text>
          {connectedTo}
        </Navbar.Text>
        {
          connectedNetwork ?
            <NavDropdown title={<i className="fas fa-user-astronaut" style={{marginRight: 10}}></i>}
                         id="responsive-navbar-nav">
              <NavDropdown.Item href="/disconnect">Disconnect</NavDropdown.Item>
              <NavDropdown.Item href="/change">Change wallet</NavDropdown.Item>
            </NavDropdown>
            : null
        }
        <Navbar.Text>
          {address}
        </Navbar.Text>
      </Navbar.Collapse>
    </Navbar>
  }
}

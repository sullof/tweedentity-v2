
// eslint-disable-next-line no-undef
const {Link} = ReactRouterDOM

// eslint-disable-next-line no-undef
const {Navbar, Nav, NavDropdown} = ReactBootstrap

import Base from './Base'

export default class Menu extends Base {

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

    let address = null
    let shortAddress
    if (this.Store.signedInAddress) {
      let fullAddress = this.Store.signedInAddress
      shortAddress = fullAddress.substring(0, 8)
      if (this.state.expanded) {
        address = <span>{this.Store.signedInAddress} <i onClick={this.expandAddress}
                                                        className="command fa fa-minus-circle"
        /></span>
      } else {
        address = <span>{shortAddress}
        <i style={{marginLeft: 5}} onClick={this.expandAddress}
                                          className="command fa fa-plus-circle"
        /></span>
      }
    }

    let connectedTo = <span style={{color: '#ff2050'}}>{
      this.Store.signedInAddress
        ? 'Connected to an unsupported network'
        : 'Not connected'
    }
      <i style={{marginLeft: 5}} className="command fas fa-question-circle"></i>
    </span>
    let {connectedNetwork} = this.Store

    if (connectedNetwork) {
      connectedTo =
        <span><i className="fa fa-plug" style={{color: '#40cc90', marginRight: 10}}></i> Connected to {connectedNetwork}</span>
    } else {
      // connectedTo = '
    }


    // if (this.Store.
    // <span><i class="fa fa-plug" style="color: rgb(136, 255, 102);"></i> You are connected to the Ropsten Testnet</span>

    return <Navbar fixed="top" bg="light" expand="lg">
      <Navbar.Brand href="/"><img src="/images/tweedentity-w-ico.png" style={{ marginLeft: 12}} /></Navbar.Brand>
      <Navbar.Toggle aria-controls="basic-navbar-nav"/>
      {
        this.Store.signedInAddress
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
        <NavDropdown title={<i className="fas fa-user-astronaut" style={{marginRight: 10}}></i>} id="responsive-navbar-nav">
          <NavDropdown.Item href="/disconnect">Disconnect</NavDropdown.Item>
          <NavDropdown.Item href="/change">Change wallet</NavDropdown.Item>
          {/*<NavDropdown.Item href="#action/3.3">Something</NavDropdown.Item>*/}
          {/*<NavDropdown.Divider />*/}
          {/*<NavDropdown.Item href="#action/3.4">Separated link</NavDropdown.Item>*/}
        </NavDropdown>
        <Navbar.Text>
          {address}
        </Navbar.Text>
      </Navbar.Collapse>
    </Navbar>
  }
}

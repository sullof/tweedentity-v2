// eslint-disable-next-line node/no-missing-require
const React = require('react')
// eslint-disable-next-line node/no-missing-require
const {BrowserRouter, Route} = require('react-router-dom')
// eslint-disable-next-line node/no-missing-require
const {Modal, Button} = require('react-bootstrap')

const chains = require('../../config/chains')
// const detectEthereumProvider = require('@metamask/detect-provider')

// eslint-disable-next-line node/no-missing-require
const ethers = require('ethers')

// const { Web3ReactProvider } = require('@web3-react/core')

// const useWeb3Modal = require('../utils/useWeb3Modal')

const {Contract} = require('@ethersproject/contracts')
// const WalletConnectProvider = require('@walletconnect/web3-provider')

const Db = require('../utils/Db')
const config = require('../../config')
const Footer = require('./Footer')
const Terms = require('./Terms')

const ls = require('local-storage')

const Common = require('./Common')
const Menu = require('./Menu')
const Home = require('./Home')
const Welcome = require('./Welcome')
const GetUsername = require('./GetUsername')
const Info = require('./Info')

module.exports = class App extends Common {

  constructor(props) {
    super(props)

    this.db = new Db(data => {
      this.setState({
        data
      })
    })

    this.state = {
      Store: {
        content: {},
        editing: {},
        temp: {},
        menuVisibility: false,
        config,
        loading: false,
        ready: false
      }
    }

    this.bindMany([
      'handleClose',
      'handleShow',
      'setStore',
      'getContracts',
      'connect',
      'showModal',
      'callMethod',
      'setWallet',
      'api'
    ])
  }

  handleClose() {
    this.setState({show: false})
  }

  handleShow() {
    this.setState({show: true})
  }

  async componentDidMount() {
    if (/^app\./.test(location.host)) {
      await this.connect(true)
    }
  }

  async setWallet() {
    try {
      const provider = new ethers.providers.Web3Provider(window.ethereum)
      const signer = provider.getSigner()
      const chainId = (await provider.getNetwork()).chainId
      const wallet = await signer.getAddress()
      const contracts = await this.getContracts(chainId, provider)
      this.setStore({
        provider,
        signer,
        wallet,
        chainId,
        connectedNetwork: this.getNetwork(chainId),
        contracts
      })
    } catch(e) {
      window.location.reload()
    }
  }

  async connect(dontShowError) {

    if (typeof window.ethereum !== 'undefined') {

      if (await window.ethereum.request({method: 'eth_requestAccounts'})) {

        window.ethereum.on('accountsChanged', () => this.setWallet())
        window.ethereum.on('chainChanged', () => window.location.reload())
        window.ethereum.on('disconnect', () => window.location.reload())

        this.setWallet()
      }

    } else {

      if (!dontShowError) {
        this.showModal(
          'No wallet extention found',
          'Please, activate your wallet and reload the page',
          'Ok'
        )
      }
    }

  }

  getNetwork(chainId) {
    let network
    if (chainId) {
      for (let net in chains) {
        if (chains[net][0] === chainId) {
          network = net
          break
        }
      }
    }
    return network
  }

  showModal(modalTitle, modalBody, modalClose, secondButton, modalAction) {
    this.setStore({
      modalTitle,
      modalBody,
      modalClose,
      secondButton,
      modalAction,
      showModal: true
    })
  }

  async getContracts(chainId, web3Provider) {
    let contracts = {}
    let networkNotSupported = false
    let connectedNetwork = null

    if (config.address[chainId]) {
      const TweedentityRegistry = new Contract(config.address[chainId], config.abi.TweedentityRegistry, web3Provider)
      contracts.TweedentityRegistry = TweedentityRegistry
      const names = [
        'Tweedentities',
        'IdentityManager',
        'TweedentityClaimer',
        'Twiptos'
      ]
      const bytes32Names = names.map(e => ethers.utils.formatBytes32String(e))

      for (let i=0;i< names.length;i++) {
        contracts[names[i]] = await TweedentityRegistry.registry(bytes32Names[i])
      }
      connectedNetwork = config.supportedId[chainId]
    } else {
      networkNotSupported = true
    }
    this.setStore({
      contracts,
      connectedNetwork,
      networkNotSupported
    })
  }

  setStore(newProps, localStorage) {
    let store = this.state.Store
    for (let i in newProps) {
      if (newProps[i] === null) {
        if (localStorage) {
          ls.remove(i)
        }
        delete store[i]
      } else {
        if (localStorage) {
          ls(i, newProps[i])
        }
        store[i] = newProps[i]
      }
    }
    this.setState({
      Store: store
    })
  }

  callMethod(method, args) {
    if ([
      'setDb',
    ].indexOf(method) !== -1) {
      this[method](args || {})
    } else {
      console.error(`Method ${method} not allowed.`)
    }
  }

  api() {
    return {
      callMethod: this.callMethod,
      db: this.db,
      Store: this.state.Store,
      setStore: this.setStore,
      contracts: this.contracts,
      connect: this.connect
    }
  }

  render() {

    const isApp = /app\./.test(location.host)

    const api = this.api

    const Store = this.state.Store

    const home = () => {
      return (
        <Home
          api={api}
        />
      )
    }

    const welcome = () => {
      return (
        <Welcome
          api={api}
        />
      )
    }

    const getUsername = () => {
      return (
        <GetUsername
          api={api}
        />
      )
    }

    const terms = () => {
      return (
        <Terms
          api={api}
        />
      )
    }

    const info = () => {
      return (
        <Info
          api={api}
        />
      )
    }

    return <BrowserRouter>
      {
        isApp
          ? <Menu
            api={api}
          />
          : null

      }

      <main>
        {/*<Link to="/"><img src="/images/BrokenJazz-logo-small.png" className="imageLogo"/></Link>*/}
        {
          isApp
          ? <Route exact path="/" component={welcome}/>
          : <Route exact path="/" component={home}/>
        }
        <Route exact path="/terms" component={terms}/>
        <Route exact path="/get-username" component={getUsername}/>
        <Route exact path="/info" component={info}/>
      </main>
      <Footer
        api={api}
      />
      <Modal
        show={Store.showModal}
        onHide={() => {
          this.setStore({showModal: false})
        }}
        backdrop={Store.backdrop || 'static'}
        keyboard={!Store.modalNoKeyboard}
      >
        <Modal.Header closeButton>
          <Modal.Title>{Store.modalTitle}</Modal.Title>
        </Modal.Header>
        <Modal.Body>{Store.modalBody}</Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={() => {
            this.setStore({showModal: false})
          }}>
            {Store.modalClose || 'Close'}
          </Button>
          {
            this.state.secondButton
              ? <Button onClick={() => {
                Store.modalAction()
                this.setStore({showModal: false})
              }} variant="primary">{Store.secondButton}</Button>
              : null
          }
        </Modal.Footer>
      </Modal>

    </BrowserRouter>
  }
}

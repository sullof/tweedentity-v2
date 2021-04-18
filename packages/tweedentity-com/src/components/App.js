const React = require('react')
const {BrowserRouter, Route} = require('react-router-dom')
const {Modal, Button} = require('react-bootstrap')

const detectEthereumProvider = require('@metamask/detect-provider')

const chains = require('../../config/chains')

const ethers = require('ethers')

// const { Web3ReactProvider } = require('@web3-react/core')

// const useWeb3Modal = require('../utils/useWeb3Modal')

const {Contract} = require('@ethersproject/contracts')
// const WalletConnectProvider = require('@walletconnect/web3-provider')


const config = require('../config')
const Footer = require('./Footer')

const ls = require('local-storage')

const Common = require('./Common')
const Menu = require('./Menu')
const Home = require('./Home')
const Info = require('./Info')

module.exports = class App extends Common {

  constructor(props) {
    super(props)

    this.state = {
      Store: {
        content: {},
        editing: {},
        temp: {},
        menuVisibility: false,
        config
      }
    }

    this.bindMany([
      'handleClose',
      'handleShow',
      'setStore',
      'getContract',
      'connect',
      'showModal',
      'watchAccounts0'
    ])
  }

  handleClose() {
    this.setState({show: false})
  }

  handleShow() {
    this.setState({show: true})
  }

  async componentDidMount() {
    // await this.connect()
  }

  async watchAccounts0() {
    try {
      const provider = new ethers.providers.Web3Provider(window.ethereum)
      const chainId = (await provider.getNetwork()).chainId
      if (chainId !== this.state.Store.chainId) {
        window.location.reload()
      }
      setTimeout(await this.watchAccounts0, 1000)
    } catch(e) {
    }
  }

  async connect() {

    const provider = await detectEthereumProvider()
    if (provider) {

      const provider = new ethers.providers.Web3Provider(window.ethereum)
      const signer = provider.getSigner()
      const chainId = (await provider.getNetwork()).chainId
      const signedInAddress = await signer.getAddress()

      provider.on('accountsChanged', accounts => {
        this.setStore({
          accounts
        })
      })

      provider.on('chainChanged', chainId => {
        console.info('ChainId changed', chainId)
        chainId = parseInt(chainId)
        this.setStore({
          chainId,
          connectedNetwork: this.getNetwork(chainId)
        })
        // this.getContract(config, chainId, this.state.Store.web3Provider)
      })

      provider.on('connect', info => {
        this.setStore({
          chainId: parseInt(info.chainId)
        })
      })

      provider.on('disconnect', error => {
        this.setStore({
          disconnectError: {
            code: error.code,
            message: error.message
          }
        })
      })

      this.setStore({
        provider,
        signer,
        signedInAddress,
        chainId,
        connectedNetwork: this.getNetwork(chainId)
      })

      this.watchAccounts0()
    } else {

      // console.info(e)

      this.setStore({
        modalTitle: 'No wallet extention found',
        modalBody: 'Please, activate your wallet and reload the page',
        showModal: true
      })
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

  showModal(modalTitle, modalBody) {
    this.setStore({
      modalTitle,
      modalBody,
      showModal: true
    })
  }

  getContract(config, chainId, web3Provider) {
    let contract
    let networkNotSupported = false
    let connectedNetwork = null

    if (config.address[chainId]) {
      contract = new Contract(config.address[chainId], config.abi, web3Provider)
      connectedNetwork = config.supportedId[chainId]
    } else {
      networkNotSupported = true
    }
    this.setStore({
      contract,
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

  render() {

    const Store = this.state.Store


    const home = () => {
      return (
        <Home
          Store={Store}
          setStore={this.setStore}
        />
      )
    }

    // const signout = () => {
    //   return (
    //     <Signout
    //       Store={Store}
    //       setStore={this.setStore}
    //     />
    //   )
    // }

    const info = () => {
      return (
        <Info
          Store={Store}
          setStore={this.setStore}
        />
      )
    }

    return <BrowserRouter>
      {
        /app\./.test(location.host)
          ? <Menu
            Store={Store}
            setStore={this.setStore}
            connect={this.connect}
          />
          : null

      }

      <main>
        {/*<Link to="/"><img src="/images/BrokenJazz-logo-small.png" className="imageLogo"/></Link>*/}
        <Route exact path="/" component={home}/>
        {/*<Route exact path="/signout" component={signout}/>*/}
        <Route exact path="/info" component={info}/>
      </main>
      <Footer
        Store={Store}
        setStore={this.setStore}
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

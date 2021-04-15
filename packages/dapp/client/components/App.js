// eslint-disable-next-line no-undef
const {BrowserRouter, Route, Link} = ReactRouterDOM

// eslint-disable-next-line no-undef
const {Modal, Button} = ReactBootstrap

import {Web3Provider} from '@ethersproject/providers'
import Web3Modal from 'web3modal'

import {Contract} from '@ethersproject/contracts'

import config from '../config'
import Footer from "./Footer"

import ls from 'local-storage'

import Common from './Common'
import Menu from './Menu'
import Home from './Home'
import Info from './Info'

export default class App extends Common {

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
      'getContract'
    ])
  }

  handleClose() {
    this.setState({show: false})
  }

  handleShow() {
    this.setState({show: true})
  }

  async componentDidMount() {

    const web3Modal = new Web3Modal({
      cacheProvider: true,
      providerOptions: {}
    })

    const provider = await web3Modal.connect()

    provider.on('accountsChanged', accounts => {
      this.setStore({
        accounts
      })
    })

    provider.on('chainChanged', chainId => {

      chainId = parseInt(chainId)
      this.setStore({
        chainId
      })
      this.getContract(config, chainId, this.state.Store.web3Provider)

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

    const web3Provider = new Web3Provider(provider)
    const signedInAddress = provider.selectedAddress
    const chainId = parseInt(web3Provider.provider.chainId)

    this.getContract(config, chainId, web3Provider)
    this.setStore({
      provider,
      web3Provider,
      signedInAddress,
      chainId
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
      <Menu
        Store={Store}
        setStore={this.setStore}
      />
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
      {Store.showModal
        ? <Modal.Dialog>
          <Modal.Header>
            <Modal.Title>{Store.modalTitle}</Modal.Title>
          </Modal.Header>

          <Modal.Body>{Store.modalBody}</Modal.Body>

          <Modal.Footer>
            <Button onClick={() => {
              this.setStore({showModal: false})
            }}>{Store.modalClose || 'Close'}</Button>
            {
              this.state.secondButton
                ? <Button onClick={() => {
                  Store.modalAction()
                  this.setStore({showModal: false})
                }} bsStyle="primary">{Store.secondButton}</Button>
                : null
            }
          </Modal.Footer>
        </Modal.Dialog>
        : null}
    </BrowserRouter>
  }
}

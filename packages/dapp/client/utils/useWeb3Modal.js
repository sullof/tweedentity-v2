import { Web3Provider } from '@ethersproject/providers'
import Web3Modal from 'web3modal'

async function useWeb3Modal() {

  const web3Modal = new Web3Modal({
    cacheProvider: true,
    providerOptions: {
    }
  })

  // Open wallet selection modal.
  // const loadWeb3Modal = useCallback(async () => {
    const newProvider = await web3Modal.connect()
    const web3Provider = new Web3Provider(newProvider)
    const signedInAddress = newProvider.selectedAddress

  return {
    newProvider,
    web3Provider,
    signedInAddress
  }
}

export default useWeb3Modal

import Web3 from 'web3';

let web3;

if (typeof window != 'undefined' &&
      typeof window.web3 != 'undefined') {
  // We are in the browser and metamask is running
  window.web3.currentProvider.enable();
  web3 = new Web3(window.web3.currentProvider);
} else {
  // We are on the server or the user is not running metamask
  const provider = new Web3.providers.HttpProvider(
    'https://rinkeby.infura.io/v3/24e2a07c42634e8eae948fd829309c37'
  );
  web3 = new Web3(provider);
}

export default web3;
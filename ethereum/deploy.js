const HDWalletProvider = require('truffle-hdwallet-provider');
const Web3 = require('web3');
const compiledFactory = require('./build/CardSeriesFactory');

const provider = new HDWalletProvider(
  'water face anxiety depend hold impose beyond super wash borrow topple clump',
  'https://rinkeby.infura.io/v3/24e2a07c42634e8eae948fd829309c37'
);

const web3 = new Web3(provider);

const deploy = async() => {
  const accounts = await web3.eth.getAccounts();

  console.log('Attempting to deploy from account', accounts[0]);

  const result = await  new web3.eth.Contract(
    JSON.parse(compiledFactory.interface)
  )
    .deploy({ data: '0x' + compiledFactory.bytecode })
    .send({ from: accounts[0] });

  console.log('Contract deployed to', result.options.address);
};

deploy();
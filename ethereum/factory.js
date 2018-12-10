import web3 from './web3';
import CardSeriesFactory from './build/CardSeriesFactory';

const instance = new web3.eth.Contract(
  JSON.parse(CardSeriesFactory.interface),
  '0x9CF0dCf4397F3B16938ACEE141c484001b7e937b'
);

export default instance;
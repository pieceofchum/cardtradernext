import web3 from './web3';
import CardSeriesFactory from './build/CardSeriesFactory';

const instance = new web3.eth.Contract(
  JSON.parse(CardSeriesFactory.interface),
  '0x599b011b96F2B5E73F24B01F8662e0A958a16b2f'
);

export default instance;
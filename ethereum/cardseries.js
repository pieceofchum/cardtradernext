import web3 from './web3';
import CardSeries from './build/CardSeries.json';

export default (address) => {
  return new web3.eth.Contract(
    JSON.parse(CardSeries.interface),
    address
  );
};
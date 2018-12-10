import React, {Component} from 'react';
import { Loader } from 'semantic-ui-react';
import Layout from '../components/Layout'
import { Link } from '../routes';

// Component that renders the
// homepage for the Card Trader Dashboard
class HomePageIndex extends Component {
  state = {
    loading: false
  };

  constructor(props) {
    super(props);
    this.startLoader = this.startLoader.bind(this);
  }

  startLoader() {
    this.setState({ loading: true });
  }

  render() {
    return (
      <Layout menuAction={this.startLoader} page={"/"}>
        <div>
          <h1>Card Trader Dashboard&nbsp;&nbsp;
            <Loader size='mini' inline
                    active={this.state.loading}/>
          </h1>
          <h4>
            <p>
              The Card Trader applications supports both card creators and card traders.
              Card Trader allows card creators to create new Card Series contracts.
              Card Series contracts are containers that is used to contain cards that are
              in some way related from the creator’s perspective
              e.g. “Marvel Villain Trading Cards for 2018”.
              Once a Card Series contract is created the manager of the Card Series can
              add new cards to the contract. This does require that the cards are associated
              with their owners when added. Card Series creators can create many Card Series
              contracts and they can manage each of them and can see the trading requests that
              are being created for each of the series they own.
            </p>
            <p>
              Card Trader also supports card owners. Card owners can view all the Card Series
              they own cards for, they can drill into each of the Card Series to view they
              cards they own and make a Trade Request. All Trade Request must be for Trading
              Cards within the same Card Series and cross series trades are not supported.
              A Trader Request is made up of the owner (requestor) that wants to trade their card
              and the card they want to trade chosen from a list of cards they don’t already own.
              Once a Trader Request is made the owner of the card that requestor wants to trade for
              is found within the card series contract and added as the requestee to the Trade Request.
              The requestee can then Approve the trade or Decline the trade. If the requestee approves
              the trade, then the card ownership is swapped, and the trade is completed. If they decline
              than the trade is declined, and the cards are not swapped between owners. Once a Trade Request
              is either approved or declined it is completed and cannot be used further.
            </p>
          </h4>
          <p/>
          <h3>The Card Trader Menu</h3>
          <h4>
            <p>
              <img src={'/static/CardTraderMenu.png'}/>
            </p>
            <p>
              CardTrader: returns users to this home page
            </p>
            <p>
              Manage Card Series: used to create cards series, add cards, and monitor trade requests for each
              series
            </p>
            <p>
              Card App: used to view the card series for which you own trading cards, and allows you to make
              trader requests so that you can get all the trades you want
            </p>
          </h4>
        </div>
      </Layout>
    )
  }
}

export default HomePageIndex;
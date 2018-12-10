import React, {Component} from 'react';
import { Card, Container, Loader, Message} from 'semantic-ui-react';
import factory from '../../../ethereum/factory';
import web3 from '../../../ethereum/web3';
import Layout from '../../../components/Layout'
import {Link, Router} from '../../../routes';
import CardSeries from "../../../ethereum/cardseries";

// Component that lists all the Card Series
// Contracts for which the current wallet
// account owns Trading Cards
class MyCardSeriesIndex extends Component {
  state = {
    mySeries: [],
    mySeriesCount: 0,
    account: 0,
    loading: false,
    errorMessage: '',
    isSet: false
  };

  constructor(props) {
    super(props);
    this.startLoader = this.startLoader.bind(this);
  }

  startLoader() {
    this.setState( { loading: true} );
  }

  // Retrieve all the Card Series Contracts
  // for which the current account owns cards
  // from the contract and stored on the blockchain
  async loadData() {
    this.setState({ loading: true, errorMessage: '' });

    try {
      const cardSeriesAddresses = await factory.methods.getDeployedCardSeries().call();
      const accounts = await web3.eth.getAccounts();
      const account = accounts[0];

      var mySeries = new Map();

      for (var i = 0; i < cardSeriesAddresses.length; i++) {
        let cardSeries = CardSeries(cardSeriesAddresses[i]);
        let cards = await cardSeries.methods.getCardsByOwner(account).call();
        const summary = await cardSeries.methods.getSummary().call();

        let cardSeriesSummary = {
          seriesID: summary[0],
          seriesName: summary[1],
          seriesDescription: summary[2],
          numCards: summary[3],
          numTraderRequests: summary[4],
          manager: summary[5],
          cards: cards
        };

        if (cards.length > 0) {
          mySeries.set(cardSeriesSummary, cardSeriesAddresses[i]);
        }
      }

      if (mySeries.size > 0) {
        this.setState({
          mySeries: mySeries,
          mySeriesCount: cardSeriesAddresses.length,
          account: account, isSet: true
        });
      }

      this.setState({isSet: true});
      console.log(this.state.mySeriesCount);
    }catch(err) {
      this.setState({ errorMessage: err.message });
    } finally {
      this.setState({ loading: false });
    }
  }

  componentDidMount(){
    this.loadData();
  }

  onSeriesDetails = (event, address) => {
    event.preventDefault();
    this.setState({ loading: true });
    Router.pushRoute(`/trader/${address}`);
  }

  renderCardSeries() {
    var items = [];
    this.state.mySeries.forEach((address, value) => {
      items.push({
        header: (
            <Container>
              <div>
                <h4>{value.seriesName}</h4>
              </div>
              <div>
                <h4>{value.seriesDescription}</h4>
              </div>
            </Container>
        ),
        description: (
            <a href="#" onClick={(e) => this.onSeriesDetails(e, address)}>
              View Card Series
            </a>
        ),
        meta: "The number of cards you own in this series is " + value.cards.length,
        fluid: true
      });
    });

    return <Card.Group items={items}/>;
  }

  render() {
    const { mySeries , account} = this.state;

    return (
      <Layout menuAction={this.startLoader} page={"/trader"}>
        <div>
          <h3>My Card Series - {account == 0 ? 'Please make sure to login to your MetaMask plug-in':account}&nbsp;&nbsp;
            <Loader size='mini' inline
                    active={this.state.loading}/>
          </h3>
          {
            this.state.mySeriesCount > 0 ?
            this.renderCardSeries():
            this.state.isSet ? "No cards owned by you were found in any series.":
              "Loading data please wait"
          }
        </div>
        {
          !!this.state.errorMessage ?
            <Message error
                     header="Error"
                     content={this.state.errorMessage}/>
            :''
        }
      </Layout>
    )
  }
}

export default MyCardSeriesIndex;
import React, { Component } from 'react';
import web3 from '../../../ethereum/web3';
import { Button, Card, Loader } from 'semantic-ui-react';
import { Link } from '../../../routes';
import Layout from '../../../components/Layout';
import CardSeries from '../../../ethereum/cardseries';

// Component that displays all the
// Trading Cards the current wallet
// account owns along with a button
// at the bottom of each card to allow
// the owner to trade the card for
// another one within the same
// Card Series Contract
class CardTraderHome extends Component {
  state = {
    cards: {
      cardCount: 0,
      cardIDs: []
    },
    account: 0,
    loading: false,
    loadingBack: false,
    loadingTradeRequest: false
  };

  constructor(props) {
    super(props);
    this.startLoader = this.startLoader.bind(this);
  }

  startLoader() {
    this.setState( { loading: true} );
  }

  static async getInitialProps(props){
    const { address } = props.query;
    return { address };
  }

  // Retrieve all the cards owned
  // by the current account from the
  // selected Card Series Contract
  async loadData() {
    this.setState({ errorMessage: '' });

    try {
      const { address } = this.props;
      const accounts = await web3.eth.getAccounts();
      const account = accounts[0];
      const cardSeries = CardSeries(address);
      const cardIDs = await cardSeries.methods.getCardsByOwner(account).call();
      const cardCount = cardIDs.length;

      const cards = {
        cardCount: cardCount,
        cardIDs: cardIDs
      }

      this.setState( {cards: cards, account: account });
    } catch(err) {
      this.setState( {errorMessage: err.message} );
    }
  }

  componentDidMount(){
    this.loadData();
  }

  onBackClick = () => {
    this.setState({ loadingBack: true })
  };

  onViewClick = ()=>{
    this.setState({ loadingTradeRequest: true })
  };

  renderCards() {
    if (this.state.cards.cardCount > 0) {
      const items = this.state.cards.cardIDs.map(id => {
        return {
          image: '/static/' + id + '.jpg',
          header: 'Card ID: ' + id,
          extra: (
            <Link route={`/traderequest/${this.props.address}/${id}`}>
              <a>
                <Button
                  floated="right"
                  content="Trade"
                  icon="add circle"
                  onClick={this.startLoader}
                  primary/>
              </a>
            </Link>
          ),
          fluid: true
        }
      });

      return (
        <Card.Group itemsPerRow={3} items={items}/>
      );
    }
  }

  render() {
    return (
      <Layout menuAction={this.startLoader}>
        <h3>Cards {this.state.account === 0 ? '...Loading Data' : 'for ' + this.state.account}&nbsp;&nbsp;
          <Loader size='mini' inline
                  active={this.state.loading}/>
        </h3>
        <Link route={`/trader`}>
          <a><Button primary
                     loading={this.state.loadingBack}
                     onClick={this.onBackClick}>Back</Button></a>
        </Link>
        <Link route={`/traderequest/${this.props.address}`}>
          <a>
            <Button
            floated="right"
            content="View Trade Requests"
            icon="add circle"
            onClick={this.onViewClick}
            loading={this.state.loadingTradeRequest}
            primary/>
          </a>
        </Link>
        {this.renderCards()}
      </Layout>
    )
  }
}

export default CardTraderHome;
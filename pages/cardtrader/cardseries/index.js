import React, {Component} from 'react';
import { Card, Button, Container, Loader, Message } from 'semantic-ui-react';
import factory from '../../../ethereum/factory';
import Layout from '../../../components/Layout'
import { Link, Router } from '../../../routes';
import CardSeries from "../../../ethereum/cardseries";

// Component that lists all the card series
// that are maintained by the Card Series
// Factory contract
class CardSeriesIndex extends Component {
  state = {
    allCardSeries: [],
    cardSeriesCount: 0,
    loading: false,
    loadingCreateSeries: false,
    isSet: false,
    errorMessage: ''
  };

  constructor(props) {
    super(props);
    this.startLoader = this.startLoader.bind(this);
  }

  startLoader() {
    this.setState( { loading: true} );
  }

  // Load all the cards series contained in
  // the Card Series Factory contract
  async loadData() {
    this.setState({ loading: true, errorMessage: '' });

    try {
      const cardSeriesAddresses = await factory.methods.getDeployedCardSeries().call();
      var allCardSeries = new Map();

      for (var i = 0; i < cardSeriesAddresses.length; i++) {
        let cardSeries = CardSeries(cardSeriesAddresses[i]);
        const summary = await cardSeries.methods.getSummary().call();

        let cardSeriesSummary = {
          seriesID: summary[0],
          seriesName: summary[1],
          seriesDescription: summary[2],
          numCards: summary[3],
          numTraderRequests: summary[4],
          manager: summary[5],
          address: cardSeriesAddresses[i]
        };

        allCardSeries.set(cardSeriesSummary, cardSeriesAddresses[i]);
      }

      this.setState({
        allCardSeries: allCardSeries,
        cardSeriesCount: cardSeriesAddresses.length,
        isSet: true
      })
    }catch(err) {
      this.setState({ errorMessage: err.message });
    } finally {
      this.setState({ loading: false });
    }
  }

  componentDidMount(){
    this.loadData();
  }

  onViewDetails = (event, address) => {
    event.preventDefault();
    this.setState({ loading: true });
    Router.pushRoute(`/cardseries/${address}`);
  }

  renderCardSeries() {
    var items = [];
    this.state.allCardSeries.forEach((address, value) => {
      items.push({
        header: (
          <Container>
            <div>
              <h4>{address}</h4>
            </div>
            <div>
              <h4>{value.seriesName}</h4>
            </div>
            <div>
              <h4>{value.seriesDescription}</h4>
            </div>
          </Container>
        ),
        description: (
          <a href="#" onClick={(e) => this.onViewDetails(e,address)}>
            View Card Series
          </a>
        ),
        fluid: true
      })
    });

    return <Card.Group items={items}/>;
  }

  render() {
    return (
      <Layout menuAction={this.startLoader} page={"/cardseries"}>
        <div>
          <h3>Manage Card Series
            {
              this.state.isSet ?
                this.state.cardSeriesCount > 0 ? ''
                  : " No Card Series Found"
                : "...Loading data please wait"
            } &nbsp;&nbsp;
            <Loader size='mini' inline
                    active={this.state.loading}/>
          </h3>
          <Link route="/cardseries/new">
            <a>
              <Button
                floated="right"
                content="Create Card Series"
                icon="add circle"
                onClick={event => this.setState({loadingCreateSeries: true})}
                loading={this.state.loadingCreateSeries}
                primary/>
            </a>
          </Link>
          {
            this.state.cardSeriesCount > 0 ?
            this.renderCardSeries(): ''
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

export default CardSeriesIndex;
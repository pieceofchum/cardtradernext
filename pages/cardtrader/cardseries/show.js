import React, { Component } from 'react';
import { Card, Grid, Button, Message, Loader } from 'semantic-ui-react';
import Layout from '../../../components/Layout';
import CardSeries from '../../../ethereum/cardseries';
import { Link } from '../../../routes'

// Component that shows the details
// for a particular Card Series
class CardSeriesShow extends Component {
  state = {
    seriesID: 0,
    seriesName: '',
    seriesDescription: '',
    numCards: 0,
    numTraderRequests: 0,
    manager: '',
    loading: false,
    loadingCards: false,
    loadingRequests: false,
    loadingBack: false,
    errorMessage: ''
  };

  constructor(props) {
    super(props);
    this.startLoader = this.startLoader.bind(this);
  }

  startLoader() {
    this.setState( { loading: true} );
  }

  // Retrieve a summery of the state
  // for a particular Card Series from
  // the Card Series Contract
  static async getInitialProps(props) {
    const { address } = props.query;
    return { address };
  }

  async loadData() {
    try {
      const cardseries = CardSeries(this.props.address);
      const summary = await cardseries.methods.getSummary().call();

      this.setState({ seriesID: summary[0], seriesName: summary[1],
                      seriesDescription: summary[2], numCards: summary[3],
                      numTraderRequests: summary[4], manager: summary[5]});
    }catch(err) {
      this.setState({ errorMessage: err.message });
    } finally {
      this.setState({ loadingCards: false,
                      loadingRequests: false });
    }
  }

  componentDidMount(){
    this.loadData();
  }

  onRequestsClick = () => {
    this.setState({ loadingRequests: true })
  };

  onCardsClick = () => {
    this.setState({ loadingCards: true })
  };

  onBackClick = () => {
    this.setState({ loadingBack: true })
  };

  renderCards() {
    const {
      seriesID,
      seriesName,
      seriesDescription,
      numCards,
      numTraderRequests,
      manager
    } = this.state;

    const items = [
      {
        header: seriesName,
        meta: 'Name of the Trading Card Series',
        description: 'The name of the Trading Card Series contained in the contract',
        style: { overflowWrap: 'break-word' }
      },
      {
        header: seriesDescription,
        meta: 'Description of the Trading Card Series',
        description: 'A description of the Trading Card Series',
        style: { overflowWrap: 'break-word' }
      },
      {
        header: numCards,
        meta: 'Number of Cards In Series',
        description: 'The number of unique Trading Cards contained in the contract',
        style: { overflowWrap: 'break-word' }
      },
      {
        header: numTraderRequests,
        meta: 'Number of Trading Requests',
        description: 'Number of Trading Requests contained in the contract',
        style: { overflowWrap: 'break-word' }
      },
      {
        header: manager,
        meta: 'Manager of Trading Card Series',
        description: 'The manager of the contract that can create new cards',
        style: { overflowWrap: 'break-word' }
      }
    ];

    return <Card.Group items={items} itemsPerRow={3}/>;
  }

  render() {
    return (
      <Layout menuAction={this.startLoader}>
        <h3>Card Series Details&nbsp;&nbsp;
          <Loader size='mini' inline
                  active={this.state.loading}/>
        </h3>
        <Link route={'/cardseries'}>
          <a><Button primary
                     loading={this.state.loadingBack}
                     onClick={this.onBackClick}>Back</Button></a>
        </Link>
        {
          !!this.state.errorMessage ?
            <Message error
                     header="Error"
                     content={this.state.errorMessage}/>
            :''
        }
        <Grid width={10} padded>
          <Grid.Row>
            <Grid.Column>
              {this.state.seriesID > 0 ? this.renderCards(): <label>Loading data</label>}
            </Grid.Column>
          </Grid.Row>
          <Grid.Row>
            <Grid.Column width={3}>
              <Link route={`/cardseries/traderequests/${this.props.address}`}>
                <a>
                  <Button primary
                          loading={this.state.loadingRequests}
                          onClick={this.onRequestsClick}>View Trade Requests</Button>
                </a>
              </Link>
            </Grid.Column>
            <Grid.Column width={3}>
              <Link route={`/cardseries/cards/${this.props.address}`}>
                <a>
                  <Button primary
                            loading={this.state.loadingCards}
                            onClick={this.onCardsClick}>View Cards</Button>
                </a>
              </Link>
            </Grid.Column>
          </Grid.Row>
        </Grid>
      </Layout>
    );
  }
}

export default CardSeriesShow;
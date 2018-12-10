import React, { Component } from 'react';
import web3 from '../../../../ethereum/web3';
import { Button, Card, Grid, Image, Form, Message, Loader } from 'semantic-ui-react';
import { Link, Router } from '../../../../routes';
import Layout from '../../../../components/Layout';
import CardSeries from '../../../../ethereum/cardseries';
import { Carousel } from 'react-responsive-carousel';

// Component for creating a new
// Trade Request. A user will have
// already chosen a Trading Card they
// wish to trade from the Cards screen
// and clicked the Trade button for that
// card to get to this screen, a user
// will be able to choose a Trading Card
// that they don't already own to trade for.
// All cards must be from the same Card
// Series contract and users cannot trade
// cards across contracts.
class TradeRequest extends Component {
  state = {
    selCard: 0,
    cardCount: 0,
    cardChoices: [],
    account: 0,
    loading: false,
    loadingBack: false,
    loadingCreateTrade: false,
    errorMessage: ''
  };

  constructor(props) {
    super(props);
    this.startLoader = this.startLoader.bind(this);
  }

  startLoader() {
    this.setState( { loading: true} );
  }

  static async getInitialProps(props) {
    const { address, cardid } = props.query;
    return { address, myCardID: cardid };
  }

  // Retrieve all the cards that are owned by the
  // current wallet account and the all the cards
  // stored in the contract and then a list of
  // cards to trade for is derived from the two
  // lists
  async loadData() {
    this.setState({ errorMessage: '' });

    try {
      const accounts = await web3.eth.getAccounts();
      const account = accounts[0];
      const cardSeries = CardSeries(this.props.address);
      const myCardIDs = await cardSeries.methods.getCardsByOwner(account).call();
      const cardCount = myCardIDs.length;
      const allCards = await cardSeries.methods.getAllCards().call();
      const cardChoices  = allCards.filter( ( card ) => !myCardIDs.includes( card ) );

      this.setState( { cardCount: cardCount, cardChoices: cardChoices, account: account } );
    } catch(err) {
      this.setState({errorMessage: err.message});
    }
  }

  componentDidMount(){
    this.loadData();
  }

  onBackClick = () => {
    this.setState({ loadingBack: true })
  };

  onSubmit = async (event) => {
    event.preventDefault();

    this.setState({ loadingCreateTrade: true, errorMessage: '' });

    try {
      const selCardID = this.state.cardChoices[this.state.selCard];
      const myCardID = this.props.myCardID;
      const accounts = await web3.eth.getAccounts();
      const cardSeries = CardSeries(this.props.address);

      await cardSeries.methods
        .createTradeRequest(myCardID, selCardID)
        .send({
         from: accounts[0]
       });

      Router.pushRoute(`/traderequest/${this.props.address}`);
    }catch(err) {
      this.setState({ errorMessage: err.message });
    } finally {
      this.setState({ loadingCreateTrade: false });
    }
  };

  renderCard(cardID) {
    return (
      <Card>
        <Image src={'/static/' + cardID + '.jpg'}/>
        <Card.Content>
          <Card.Description>This is the card your trading</Card.Description>
        </Card.Content>
      </Card>
    );
  }

  renderCarousel() {
    if (this.state.cardCount > 0) {
      return (
        <Carousel showArrows={true} showIndicators={false} showThumbs={false}
                  onChange={event => this.setState({ selCard: event })}
                  selectedItem={ this.state.selCard }>
          {
            this.state.cardChoices.map((cardID, index) => {
              return (
                <div key={cardID}>
                  <img src={'/static/' + cardID + '.jpg'}/>
                </div>
              )}
            )
          }
        </Carousel>
      );
    }
  }

  renderCards() {
    return (
      <Grid>
        <Grid.Row>
          <Grid.Column width={6}>
            {this.renderCard(this.props.myCardID)}
          </Grid.Column>
          <Grid.Column width={6}>
            <Card>
              {this.renderCarousel()}
              <Card.Content>
                <Card.Description>This is the card your trading for</Card.Description>
              </Card.Content>
            </Card>
          </Grid.Column>
        </Grid.Row>
      </Grid>
    )
  }

  render() {
    return (
      <Layout menuAction={this.startLoader}>
        <h3>Select Card to Trade For&nbsp;&nbsp;
          <Loader size='mini' inline
                  active={this.state.loading}/></h3>
        <p>
          <Link route={`/trader/${this.props.address}`}>
            <a><Button primary
                       loading={this.state.loadingBack}
                       onClick={this.onBackClick}>Back</Button></a>
          </Link>
        </p>
        <Form onSubmit={ this.onSubmit } error={!!this.state.errorMessage}>
          { this.renderCards() }
          <Message error header="Error" content={this.state.errorMessage}/>
          <Button primary loading={this.state.loadingCreateTrade}>Create Trade Request</Button>
        </Form>
      </Layout>
    );
  }
}

export default TradeRequest;
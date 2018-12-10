import React, { Component } from 'react';
import { Button, Table, Message, Loader } from 'semantic-ui-react';
import { Link } from '../../../routes';
import Layout from '../../../components/Layout';
import CardSeries from '../../../ethereum/cardseries';
import CardRow from '../../../components/CardRow';

// Component that lists all the trading cards
// stored in a Card Series Contract and
// displays them in a list, also allows
// Card Series Manager to add new Trading Cards
class CardIndex extends Component {
  state = {
    cardCount: 0,
    cardIDs: [],
    cardOwners: [],
    loadingMenu: false,
    loadingBack: false,
    loadingAddCard: false,
    errorMessage: ''
  };

  constructor(props) {
    super(props);
    this.startLoader = this.startLoader.bind(this);
  }

  startLoader() {
    this.setState( { loadingMenu: true} );
  }

  static async getInitialProps(props) {
    const { address } = props.query;
    return { address };
  }

  // Retrieve a list of trading cards and
  // card owners from the Card Series Contract
  async loadData() {
    this.setState({errorMessage: ''});

    try {
      const { address } = this.props;
      const cardSeries = CardSeries(address);

      const cardIDs = await cardSeries.methods.getAllCards().call();
      const cardCount = cardIDs.length;

      const cardOwners = await Promise.all(
        Array(parseInt(cardCount)).fill().map((element, index) => {
          return cardSeries.methods.getCardOwnerByCardID(cardIDs[index]).call();
        })
      );

      this.setState({cardCount: cardCount, cardIDs: cardIDs, cardOwners: cardOwners});
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

  renderRows() {
    if (this.state.cardCount > 0) {
      return this.state.cardIDs.map((cardID, index) => {
        return <CardRow
          key={index}
          id={index}
          cardID={cardID}
          cardOwner={this.state.cardOwners[index]}
          address={this.props.address}
        />
      });
    }
  }

  render() {
    const { Header, Row, HeaderCell, Body } = Table;

    return (
      <Layout menuAction={this.startLoader}>
        <h3>Cards&nbsp;&nbsp;
          <Loader size='mini' inline
                  active={this.state.loadingMenu}/>
        </h3>
        <Link route={`/cardseries/${this.props.address}`}>
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
        <Table>
          <Header>
            <Row>
              <HeaderCell>Card ID</HeaderCell>
              <HeaderCell>Owner</HeaderCell>
            </Row>
          </Header>
          <Body>
          {this.renderRows()}
          </Body>
        </Table>
        <Link route={`/cardseries/${this.props.address}/new`}>
          <a>
            <Button
              floated="right"
              content="Add Card"
              onClick={event => this.setState({loadingAddCard: true})}
              loading={this.state.loadingAddCard}
              icon="add circle"
              primary/>
          </a>
        </Link>
        <div>Found {this.state.cardCount} cards.</div>
      </Layout>
    );
  }
}

export default CardIndex;
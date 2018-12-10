import React, { Component } from 'react';
import { Form, Button, Input, Message, Loader } from 'semantic-ui-react';
import Layout from '../../../components/Layout';
import CardSeries from '../../../ethereum/cardseries';
import web3 from '../../../ethereum/web3';
import { Link, Router } from '../../../routes';

// Component to add trading cards to
// a Card Series maintained by the
// Card Series Factory
class CardNew extends Component {
  state = {
    cardID: '',
    owner: '',
    errorMessage: '',
    loading: false
  };

  constructor(props) {
    super(props);
    this.startLoader = this.startLoader.bind(this);
  }

  startLoader() {
    this.setState( { loading: true} );
  }

  static async getInitialProps(props) {
    const { address } = props.query;
    return { address };
  }

  // Collect data on the web form and
  // attempt to add the data to create
  // a new card for a specific Card Series
  // Contract, when complete the new card
  // will be added to the blockchain and
  // the end user will be routed back to
  // the card list for the card series
  onSubmit = async (event) => {
    event.preventDefault();

    this.setState({ loading: true, errorMessage: '' });

    try {
      const accounts = await web3.eth.getAccounts();
      const cardSeries = CardSeries(this.props.address);

      const manager = await cardSeries.methods.manager().call();

      console.log('Manager is ' + manager);
      console.log('Account is ' + accounts[0]);

      if (manager != accounts[0])
      {
        throw new Error('You cannot add cards because you are not the manager of the series');
      }

      if (!Number.isInteger(Number(this.state.cardID)))
      {
        throw new Error('Card ID must be a number between 1 and 6');
      }

      const cardID = Number(this.state.cardID);
      if ((cardID < 1) || (cardID > 6))
      {
        throw new Error('Card ID must be a number between 1 and 6');
      }

      await cardSeries.methods
        .addCard(this.state.cardID, this.state.owner)
        .send({
          from: accounts[0]
        });

      Router.pushRoute(`/cardseries/cards/${this.props.address}`);
    }catch(err) {
      this.setState({ errorMessage: err.message });
    } finally {
      this.setState({ loading: false });
    }
  };

  render() {
    return(
      <Layout menuAction={this.startLoader}>
        <h3>Add a Card&nbsp;&nbsp;
          <Loader size='mini' inline
                  active={this.state.loading}/>
        </h3>
        <Form onSubmit={this.onSubmit} error={!!this.state.errorMessage}>
          <Form.Field>
            <label>Card ID - for this POC please enter an integer between 1 and 6</label>
            <Input
              value={this.state.cardID}
              onChange={event => this.setState({cardID: event.target.value})}
            />
          </Form.Field>
          <Form.Field>
            <label>Owner Address</label>
            <Input
              value={this.state.owner}
              onChange={event => this.setState({owner: event.target.value})}
            />
          </Form.Field>
          <Message error header="Error" content={this.state.errorMessage}/>
          <Button loading={this.state.loading} primary>Create</Button>
        </Form>
      </Layout>
    );
  }
}

export default CardNew;
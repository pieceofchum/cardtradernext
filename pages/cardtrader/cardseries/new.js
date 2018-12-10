import React, { Component } from 'react';
import { Form, Button, Input, Message, Loader } from 'semantic-ui-react';
import Layout from '../../../components/Layout';
import factory from '../../../ethereum/factory';
import web3 from '../../../ethereum/web3';
import { Link, Router } from '../../../routes';

// Component to create a new Card Series Contract.
// Card Series Contracts store trading cards, and
// allow owners to trade their cards by creating
// a trade request
class CardSeriesNew extends Component {
  state = {
    seriesID: '',
    seriesName: '',
    seriesDescription:'',
    errorMessage: '',
    loading: false,
    loadingMenu: false
  };

  constructor(props) {
    super(props);
    this.startLoader = this.startLoader.bind(this);
  }

  startLoader() {
    this.setState( { loadingMenu: true} );
  }

  // Submit new Card Series to the contract
  // when complete the new Card Series will
  // be added to the blockchain and the user will
  // be routed back to the main card series index
  onSubmit = async (event) => {
    event.preventDefault();

    this.setState({ loading: true, errorMessage: '' });

    try {
      // Get the provider accounts
      const accounts = await web3.eth.getAccounts();

      // Use the currently selected MetaMask Wallet Account
      // and attempt to create the Card Series to contract
      // which will then be stored on the blockchain
      await factory.methods
        .createCardSeries(this.state.seriesID, this.state.seriesName, this.state.seriesDescription)
        .send({
          from: accounts[0]
        });

      // When complete route back to the Card Series Index
      Router.pushRoute('/cardseries');
    }catch(err) {
      this.setState({ errorMessage: err.message });
    } finally {
      this.setState({ loading: false });
    }
  };

  render() {
    return(
      <Layout menuAction={this.startLoader}>
        <h3>Create a Card Series&nbsp;&nbsp;
          <Loader size='mini' inline
                  active={this.state.loadingMenu}/>
        </h3>
        <Form onSubmit={this.onSubmit} error={!!this.state.errorMessage}>
          <Form.Field>
            <label>Series ID</label>
            <Input
              value={this.state.seriesID}
              onChange={event => this.setState({seriesID: event.target.value})}
            />
          </Form.Field>
          <Form.Field>
            <label>Series Name</label>
            <Input
              value={this.state.seriesName}
              onChange={event => this.setState({seriesName: event.target.value})}
            />
          </Form.Field>
          <Form.Field>
            <label>Series Description</label>
            <Input
              value={this.state.seriesDescription}
              onChange={event => this.setState({seriesDescription: event.target.value})}
            />
          </Form.Field>
          <Message error header="Error" content={this.state.errorMessage}/>
          <Button loading={this.state.loading} primary>Create</Button>
        </Form>
      </Layout>
    );
  }
}

export default CardSeriesNew;
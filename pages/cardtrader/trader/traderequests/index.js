import React, { Component } from 'react';
import { Button, Table, Segment, Message, Loader } from 'semantic-ui-react';
import {Link, Router} from '../../../../routes';
import web3 from '../../../../ethereum/web3';
import Layout from '../../../../components/Layout';
import CardSeries from '../../../../ethereum/cardseries';

// Component that displays all the
// Trade Requests for the current
// wallet account and for the selected
// Card Series Contract, if the user is
// a Requestee they will also be able to
// approve or decline the request
class MyTradeRequests extends Component {
  state = {
    tradeCount: 0,
    tradeRequests: [],
    tradeRequestIDs: [],
    account: 0,
    errorMessage: '',
    loading: false,
    loadingBack: false,
    loadingApprove: false,
    loadingDecline: false
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

  // Load all the Trade Requests for
  // the current provider wallet account
  // and for the selected Card Series Contract
  async loadData() {
    this.setState({ errorMessage: '' });

    try {
      const {address} = this.props;
      const cardSeries = CardSeries(address);
      const accounts = await web3.eth.getAccounts();
      const account = accounts[0];
      const tradeRequestIDs = await cardSeries.methods.getTradeRequestsByOwner(account).call();
      const tradeCount = tradeRequestIDs.length;

      const tradeRequests = await Promise.all(
        Array(parseInt(tradeCount)).fill().map((element, index) => {
          return cardSeries.methods.tradeRequestsByKey(tradeRequestIDs[index]).call();
        })
      );

      this.setState({
        tradeCount: tradeCount, tradeRequests: tradeRequests.reverse(),
        tradeRequestIDs: tradeRequestIDs.reverse(), account: account
      });
    }catch(err) {
      this.setState({ errorMessage: err.message });
    }
  }

  onBackClick = () => {
    this.setState({ loadingBack: true })
  };

  componentDidMount(){
    this.loadData();
  }

  // Function that allows the user to
  // approve a Trade Request where
  // they own the Trading Card that
  // another user wants to trade for
  approve = async (event) => {
    event.preventDefault();

    this.setState({ loadingApprove: true, errorMessage: '' });
    var tradeKey = new String(event.target.value);

    try {
      const accounts = await web3.eth.getAccounts();
      const cardSeries = CardSeries(this.props.address);

      await cardSeries.methods
        .approveTradeRequest(tradeKey.valueOf())
        .send({
          from: accounts[0]
        });
    }catch(err) {
      this.setState({ errorMessage: err.message });
    } finally {
      this.setState({ loadingApprove: false });
      window.location.reload();
    }
  };

  // Function that allows the user to
  // decline a Trade Request where
  // they own the Trading Card that
  // another user wants to trade for
  decline = async (event) => {
    event.preventDefault();

    this.setState({ loadingDecline: true, errorMessage: '' });
    var tradeKey = new String(event.target.value);

    try {
      const accounts = await web3.eth.getAccounts();
      const cardSeries = CardSeries(this.props.address);

      await cardSeries.methods
        .declineTradeRequest(tradeKey.valueOf())
        .send({
          from: accounts[0]
        });
    }catch(err) {
      this.setState({ errorMessage: err.message });
    } finally {
      this.setState({loadingDecline: false});
      window.location.reload();
    }
  };

  // Render the Trade Request list and
  // for each request where the current
  // account is the requestee show both
  // the Approve and Decline buttons
  renderRowDetail (tradeRequest, tradeRequestID) {
    const { Row, Cell } = Table;
    const { account } = this.state;

    return (
      <Row key={tradeRequestID}>
        <Cell>{tradeRequest.owner1}</Cell>
        <Cell>{tradeRequest.owner2}</Cell>
        <Cell>{tradeRequest.cardID1}</Cell>
        <Cell>{tradeRequest.cardID2}</Cell>
        <Cell>
          {tradeRequest.owner2 == account ?
            tradeRequest.status == 1 ? 'Approved'
              : tradeRequest.status == 2 ? 'Declined'
              : tradeRequest.status == 3 ? 'Completed'
                :
                (
                  <div>
                    <Button basic
                            color='green'
                            loading={this.state.loadingApprove}
                            onClick={this.approve}
                            value={tradeRequestID}>
                      Approve
                    </Button>
                    <Button basic
                            color='red'
                            loading={this.state.loadingDecline}
                            onClick={this.decline}
                            value={tradeRequestID}>
                      Decline
                    </Button>
                  </div>
                )
            : tradeRequest.status == 0 ? 'Awaiting Approval'
              : tradeRequest.status == 1 ? 'Approved'
                : tradeRequest.status == 2 ? 'Declined'
                  : 'Completed'
          }
        </Cell>
      </Row>
    );
  }

  renderRows() {
    if (this.state.tradeCount > 0) {
      return this.state.tradeRequests.map((tradeRequest, index) => {
        return this.renderRowDetail(tradeRequest, this.state.tradeRequestIDs[index]);
      });
    }
  }

  render() {
    const { Header, Row, HeaderCell, Body } = Table;
    const { tradeCount } = this.state;

    return (
      <Layout menuAction={this.startLoader}>
        <h3>
          Trade Requests {this.state.account === 0 ? '....Loading Data' : 'for ' + this.state.account}&nbsp;&nbsp;
          <Loader size='mini' inline
                  active={this.state.loading}/>
        </h3>
        <Link route={`/trader/${this.props.address}`}>
          <a><Button primary
                     loading={this.state.loadingBack}
                     onClick={this.onBackClick}>Back</Button></a>
        </Link>
        {!!this.state.errorMessage ? <Message error header="Error" content={this.state.errorMessage}/> : ''}
        <Table>
          <Header>
            <Row key={1}>
              <HeaderCell>Owner 1</HeaderCell>
              <HeaderCell>Owner 2</HeaderCell>
              <HeaderCell>CardID 1</HeaderCell>
              <HeaderCell>CardID 2</HeaderCell>
              <HeaderCell>Status</HeaderCell>
            </Row>
          </Header>
          <Body>
          {this.renderRows()}
          </Body>
        </Table>
        <div>Found { tradeCount } trade requests.</div>
      </Layout>
    );
  }
}

export default MyTradeRequests;
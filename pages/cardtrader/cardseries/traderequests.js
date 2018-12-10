import React, { Component } from 'react';
import { Button, Table, Message, Loader } from 'semantic-ui-react';
import { Link } from '../../../routes';
import Layout from '../../../components/Layout';
import CardSeries from '../../../ethereum/cardseries';
import TradeRequestRow from '../../../components/TradeRequestRow';

// Component that displays all the
// Trade Requests that have been
// submitted within the current
// Card Series Contract, this is
// a read-only view and managers c
// cannot edit/approve/decline a
// Trade Request
class TradeRequestIndex extends Component {
  state = {
    tradeCount: 0,
    tradeRequests: [],
    loading: false,
    errorMessage: ''
  };

  constructor(props) {
    super(props);
    this.startLoader = this.startLoader.bind(this);
  }

  startLoader() {
    this.setState( { loading: true} );
  }

  // Retrieve the Trade Requests that
  // are stored in the selected
  // Card Series Contract
  static async getInitialProps(props) {
    const { address } = props.query;
    return { address };
  }

  async loadData() {
    this.setState({ errorMessage: '', loading: true});

    try {
      const cardSeries = CardSeries(this.props.address);
      const tradeRequestIDs = await cardSeries.methods.getAllTradeRequests().call();
      const tradeCount = tradeRequestIDs.length;

      const tradeRequests = await Promise.all(
        Array(parseInt(tradeCount)).fill().map((element, index) => {
          return cardSeries.methods.tradeRequestsByKey(tradeRequestIDs[index]).call();
        })
      );

      this.setState({ tradeCount, tradeRequests });
    }catch(err) {
      this.setState({ errorMessage: err.message });
    } finally {
      this.setState({ loading: false });
    }
  }

  componentDidMount(){
    this.loadData();
  }

  renderRows() {
    return this.state.tradeRequests.map((tradeRequest, index) => {
      return <TradeRequestRow
        key={index}
        id={index}
        tradeRequest={tradeRequest}
        address={this.props.address}
      />
    });
  }

  render() {
    const { Header, Row, HeaderCell, Body } = Table;

    return (
      <Layout menuAction={this.startLoader} >
        <h3>Trade Requests {this.props.account === 0 ? '....Loading Data' : 'for ' + this.props.account}&nbsp;&nbsp;
          <Loader size='mini' inline
                  active={this.state.loading}/>
        </h3>
        <Link route={`/cardseries/${this.props.address}`}>
          <a><Button primary>Back</Button></a>
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
              <HeaderCell>Owner 1</HeaderCell>
              <HeaderCell>Owner 2</HeaderCell>
              <HeaderCell>CardID 1</HeaderCell>
              <HeaderCell>CardID 2</HeaderCell>
              <HeaderCell>Status</HeaderCell>
            </Row>
          </Header>
          <Body>
          {this.state.tradeCount > 0 ? this.renderRows(): ''}
          </Body>
        </Table>
        <div>Found {this.props.tradeCount} trade requests.</div>
      </Layout>
    );
  }
}

export default TradeRequestIndex;
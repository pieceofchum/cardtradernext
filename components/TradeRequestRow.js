import React, { Component } from 'react';
import { Table, Button } from 'semantic-ui-react';

class TradeRequestRow extends Component {
  render () {
    const { Row, Cell} = Table;
    const { id, tradeRequest } = this.props;

    return (
      <Row>
        <Cell>{tradeRequest.owner1}</Cell>
        <Cell>{tradeRequest.owner2}</Cell>
        <Cell>{tradeRequest.cardID1}</Cell>
        <Cell>{tradeRequest.cardID2}</Cell>
        <Cell>
          {
            tradeRequest.status == 0 ?
              'Awaiting Approved' : tradeRequest.status == 1 ?
              'Approved' : tradeRequest.status == 2 ?
                'Declined' : 'Completed'
          }
        </Cell>
      </Row>
    );
  }
}

export default TradeRequestRow;
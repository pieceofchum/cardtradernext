import React, { Component } from 'react';
import { Table, Button } from 'semantic-ui-react';

class CardRow extends Component {
  render () {
    const { Row, Cell} = Table;
    const { id, cardID, cardOwner } = this.props;

    return (
      <Row>
        <Cell>{cardID}</Cell>
        <Cell>{cardOwner}</Cell>
      </Row>
    );
  }
}

export default CardRow;
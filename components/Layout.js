import React, {Component} from 'react';
import { Container } from 'semantic-ui-react';
import Head from 'next/head';
import Header from './Header';

class Layout extends Component {
  render() {
    const { menuAction, page } = this.props;

    return (
      <Container width={10}>
        <Head>
          <link rel="stylesheet" href="//cdn.jsdelivr.net/npm/semantic-ui@2.4.0/dist/semantic.min.css"></link>
          <link rel="stylesheet" href="/static/carousel.css"/>
        </Head>
        <div>
          <Header menuAction={this.props.menuAction} page={this.props.page}/>
          {this.props.children}
        </div>
      </Container>
    );
  }
}

export default Layout;
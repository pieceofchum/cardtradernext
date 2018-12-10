import React, {Component} from 'react';
import { Menu, Loader } from 'semantic-ui-react';
import { Link, Router } from '../routes';

class Header extends Component {
  state = {
    loading: false
  };

  onMenuSelect = (event, route) => {
    event.preventDefault();
    const runAction = route != this.props.page;

    if (this.props.menuAction && runAction) {
      this.props.menuAction();
    }

    Router.pushRoute(route);
  };

  render() {
    return(
      <Menu style={{ marginTop: '10px' }}>
        <a className="item" href="#" onClick={(e) => this.onMenuSelect(e, '/')}>
          CardTrader&nbsp;
          <Loader size='mini' inline
                  active={this.state.loading}/>
        </a>
        <Menu.Menu loading position="right">
          <a className="item" href="#" onClick={(e) => this.onMenuSelect(e, '/cardseries')}>
            Manage Card Series
          </a>
          <a className="item" href="#" onClick={(e) => this.onMenuSelect(e, '/trader')}>
            Card App
          </a>
        </Menu.Menu>
      </Menu>
    );
  }
}

export default Header;

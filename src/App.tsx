/* tslint:disable */

import * as React from 'react';
import './App.css';

import Web3 = require('web3');

const web3js = new Web3(Web3.givenProvider);

interface AppState {
  accounts: string[],
}

class App extends React.Component<{}, AppState> {
  public state: AppState = {
    accounts: [],
  };

  public componentDidMount() {
    if (typeof web3 === 'undefined') {
      alert('No Mist/MetaMask installed');
      return;
    }
    this.refreshAccounts();    
  }

  public async refreshAccounts() {
    const accounts = await web3js.eth.getAccounts();
    console.info(accounts);
    this.setState({ accounts });
  }

  public render() {
    console.info(this.state);
    return (
      <div className="App">
        <h1>Accounts</h1>
        {this.state.accounts.length === 0 && 'No Ethereum accounts found.'}
        <ul>
          {this.state.accounts.map(address => <li>{address}</li>)}
        </ul>
      </div>
    );
  }
}

export default App;

/* tslint:disable */

import * as React from 'react';
import './App.css';

import Web3 = require('web3');

const web3js = new Web3(Web3.givenProvider);

interface AppState {
  accounts: string[],
  account: string,
  balance: number,
}

class App extends React.Component<{}, AppState> {
  public state: AppState = {
    accounts: [],
    account: '',
    balance: 0,
  };

  public componentDidMount() {
    if (typeof web3 === 'undefined') {
      alert('No Mist/MetaMask installed');
      return;
    }
    this.refreshAccounts();    
    this.refreshAccount();
  }

  public async refreshAccounts() {
    const accounts = await web3js.eth.getAccounts();
    this.setState({ accounts });
  }

  public async refreshAccount() {
    const accounts = await web3js.eth.getAccounts();
    if (accounts.length === 0) {
      return;
    }
    const wei = await web3js.eth.getBalance(accounts[0]);
    this.setState({
      account: accounts[0],
      balance: Number(web3js.utils.fromWei(wei, 'ether')),
    })
  }

  public render() {
    return (
      <div className="App">
        <h1>Accounts</h1>
        {this.state.accounts.length === 0 && 'No Ethereum accounts found.'}
        <ul>
          {this.state.accounts.map((address, i) => <li key={i}>{address}</li>)}
        </ul>
        <h1>{this.state.account}</h1>
        Balance: {this.state.balance}
      </div>
    );
  }
}

export default App;

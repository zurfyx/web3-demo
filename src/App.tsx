/* tslint:disable */

import * as React from 'react';
import './App.css';

import Web3 = require('web3');

const CONTRACT_ABI = require('./abi.json');
const CONTRACT_ADDRESS = '0x30fad401201e2ddfaea333fd9459d1dcc49ba8fd';

const web3js = new Web3(Web3.givenProvider || new Web3.providers.HttpProvider('https://ropsten.infura.io:443'));
const contract = new web3js.eth.Contract(CONTRACT_ABI, CONTRACT_ADDRESS);

interface AppState {
  accounts: string[],
  account: string,
  balance: number,
  newMessageValue: string,
  messages: {
    created: string
    message: string,
    owner: string,
  }[],
}

class App extends React.Component<{}, AppState> {
  public state: AppState = {
    accounts: [],
    account: '',
    balance: 0,
    newMessageValue: '',
    messages: [],
  };

  public componentDidMount() {
    this.refreshMessages();

    if (typeof web3 !== 'undefined') {
      this.refreshAccounts();    
      this.refreshAccount();
    }
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

  public async refreshMessages() {
    // We don't have messages length in our contract. We forgot!
    // #TODO fix later
    const messages = [
      await contract.methods.messages(0).call(),
      await contract.methods.messages(1).call(),
    ];
    this.setState({ messages });
  }

  postMessage = async (e: any) => {
    e.preventDefault();
    if (typeof web3 === 'undefined') {
      alert('No Mist/MetaMask installed');
      return;
    }

    contract.methods.postMessage(this.state.newMessageValue).send({
      from: this.state.account,
    });
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
        <h1>Post message</h1>
        <form onSubmit={this.postMessage}>
          <textarea onChange={e => this.setState({ newMessageValue: e.target.value })}></textarea>
          <button type="submit" disabled={this.state.newMessageValue === ''}>Post</button>
        </form>
        <h1>Messages</h1>
        {this.state.messages.map((message, i) => (
          <div key={i}>
            <div>Owner: {message.owner}</div>
            <div>Created: {new Date(Number(message.created) * 1000).toString()}</div>
            <div>Message: {message.message}</div>
            <hr/>
          </div>
        ))}
      </div>
    );
  }
}

export default App;

/* tslint:disable */

import * as React from 'react';
import './App.css';

import Web3 = require('web3');

const CONTRACT_ABI = require('./abi.json');
const CONTRACT_ADDRESS = '0x2dcb029a9428f8fc8db369e09056a119f1bc1213';

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
  nextMessageIndex: number,
}

class App extends React.Component<{}, AppState> {
  public state: AppState = {
    accounts: [],
    account: '',
    balance: 0,
    newMessageValue: '',
    messages: [],
    nextMessageIndex: -1, // Next message to retrieve (we start from biggest).
  };

  public componentDidMount() {
    this.fetchMoreMessages();

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

  fetchMoreMessages = async () => {
    let startIndex = this.state.nextMessageIndex;
    if (startIndex === -1) {
      startIndex = await contract.methods.messagesCount().call();
    }

    for (let i = startIndex - 1; i >= Math.max(startIndex - 10, 0); i -= 1) {
      const message = await contract.methods.messages(i).call();
      this.setState({ messages: this.state.messages.concat(message) });
    }
  }

  postMessage = async (e: any) => {
    e.preventDefault();
    if (typeof web3 === 'undefined') {
      alert('No Mist/MetaMask installed');
      return;
    }

    contract.methods.postMessage(this.state.newMessageValue).send({
      from: this.state.account,
    }).on('transactionHash', (hash) => {
        console.info(`Transaction hash: ${hash}`);
    }).on('receipt', function(receipt){
        console.info('Receipt:');
        console.info(receipt);
    }).on('confirmation', function(confirmationNumber, receipt){
        console.info(`Confirmation ${confirmationNumber}`);
    }).on('error', console.error);
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
        <i>Messages take an avg. of 15 seconds to be stored on the blockchain. This page will update automatically.</i>
        <hr/>
        {this.state.messages.map((message, i) => (
          <div key={i}>
            <div>Owner: {message.owner}</div>
            <div>Created: {new Date(Number(message.created) * 1000).toString()}</div>
            <div>Message: {message.message}</div>
            <hr/>
          </div>
        ))}
        <div><button onClick={this.fetchMoreMessages}>Fetch more</button></div>
      </div>
    );
  }
}

export default App;

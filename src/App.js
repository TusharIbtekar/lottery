import web3 from './web3'
import lottery from './lottery';
import { useEffect, useState } from 'react';

function App() {
  const [manager, setManager] = useState('');
  const [balance, setBalance] = useState('');
  const [paidBalance, setPaidBalance] = useState();
  const [players, setPlayers] = useState([]);
  const [message, setMessage] = useState();
  const [currentAccount, setCurrentAccount] = useState();
 
  useEffect(() => {
    ( async () => {
      const currentManager = await lottery.methods.manager().call();
      const currentPlayers = await lottery.methods.getPlayers().call();
      setManager(currentManager);
      setPlayers(currentPlayers);
    } )();
  }, []);

  useEffect(() => {
    ( async () => {
      const currentBalance = await web3.eth.getBalance(lottery.options.address);
      setBalance(currentBalance);
    } )();
  }, [players]);

  ( async () => {
    const accounts = await window.ethereum.request({ method: 'eth_requestAccounts' });
    setCurrentAccount(accounts[0]);
    window.ethereum.on('accountsChanged', function (accounts) {
      setCurrentAccount(accounts[0]);
    })
  } )();

  const onSubmit = async (event) => { 
    event.preventDefault();

    setMessage('Waiting on transaction success..');
    
    await lottery.methods.enter().send({
      from: currentAccount,
      value: web3.utils.toWei(paidBalance, 'ether')
    });
    
    setMessage('You have been entered!')

  }

  const getWinner = async () => {
    setMessage('Waiting on transaction success..');

    await lottery.methods.pickWinner().send({
      from: manager
    });

    const winner = await lottery.methods.winner().call();

    setMessage(winner+' is the Winner!');
  }
  
  // web3.eth.getAccounts().then(console.log)
  return (
    <div>
      <h2>Lottery Contract</h2>
      <p>
        This contract is managed by { manager } <br/>
        There are currently { players.length } people entered,
        competing to win { web3.utils.fromWei(balance, 'ether') } ether!
        You must enter with minimum 0.00001 ether.
      </p>

      <hr/>

      <form onSubmit={onSubmit}>
        <h4>Want to try your luck?</h4>
        <div>
          <label>Amount of ether to enter</label>
          <input
            value={paidBalance}
            onChange={(event) => setPaidBalance(event.target.value)}
          />
          <button>Enter</button>
        </div>
      </form>

      <hr/>

      { currentAccount === manager.toLowerCase() ? (
        <>
          <h4>Ready to pick a winner?</h4>
          <button onClick={getWinner}>Pick a Winner!</button>
    
          <hr/>
        </>
      ): null
      }

      <h1>{ message }</h1>
    </div>
  );
}

export default App;

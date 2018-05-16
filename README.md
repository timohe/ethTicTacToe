# ethTicTacToe
Simple TicTacToe game with betting on the Ethereum Blockchain

## Get environment ready
We are using the geth client and both websocket and rpc to be able to use remix and receive events.
1. open geth        
`$ geth --datadir ~/privateEthTestnet --fast --wsapi eth,web3,personal,net,miner,admin --ws --wsaddr "localhost" --wsport "8546" --wsorigins "*" --rpc --rpccorsdomain="*" --rpcapi eth,web3,personal,net,miner,admin`

2. attach new instance (new terminal, use 8546 not 8545!):    
`$ geth attach ws://localhost:8546`

3. set account that will receive ether    
`> miner.setEtherbase(eth.accounts[0])`

4. start mining    
`> miner.start(2)`

5. unlock your account:    
`> personal.unlockAccount(eth.accounts[0], "123456", 999999);`

6. Open index.html and you're good to go!    

## Deploy the contract
1. do 1.-5. from above    

2. go to https://remix.ethereum.org/ and chose web3 provider    

3. after connection click create

4. contract should appear in your geth console

## Connect Remix with local folder
1. install remixd     
`$ npm install -g remixd`   
`$ e.g. remixd -s ~/Documents/gitkrakenRepo/ethTicTacToe and click the link button in remix.`   

2. click on the connect button in remix 

## Things that could be improved in future   
+ use save math to increase security    
+ Make it possible that one address can host multiple games    
+ Variable pot amount 
+ bet on games from others   

## Useful commands
`web3.fromWei(eth.getBalance(eth.accounts[1]), "ether")`
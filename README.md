# ethTicTacToe
Simple TicTacToe game with betting on the Ethereum Blockchain

## Get environment ready
1. open geth        
`$ geth --datadir ~/privateEthTestnet --networkid 3107 --fast --rpc --rpccorsdomain="*" --rpcapi eth,web3,personal,net,miner,admin`

2. attach new instance (new terminal):    
`$ geth attach http://127.0.0.1:8545`

3. set account that will receive ether    
`> miner.setEtherbase(eth.accounts[0])`

4. start mining    
`> miner.start(2)`

5. unlock your account:    
`> personal.unlockAccount(eth.accounts[0], "123456", 999999);`

6. Open index.html and you're good to go!    

## Deploy the contract
1. do 1.-4. from above    

2. go to https://remix.ethereum.org/ and chose web3 provider    

3. after connection click create

4. contract should appear in your geth console

## Connect Remix with local folder
1. install remixd     
`$ npm install -g remixd`   
`$ remixd -s ~/Documents/gitkrakenRepo/ethTicTacToe and click the link button in remix.`   
click on the connect button with remix 

## To do
+ Say who is the winner in the text above the board
+ Balance in separate window and gets refreshed
+ Tictactoe as square

Done:   
-Contract owner can get money left in the contract
-Game over so you cant continue playing

## Things that could be improved
+ Once you hosted, you cannot get your money back. (this is the business model).    
+ use save math to increase security    
+ Make it possible that one address can host multiple games    
+ Variable pot amount    

## Important commands
`web3.fromWei(eth.getBalance(eth.accounts[1]), "ether")`
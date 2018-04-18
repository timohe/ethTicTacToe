# ethTicTacToe
Simple TicTacToe game with betting on the Ethereum Blockchain

# How to deploy contract
1. open geth    
$ geth --datadir ~/privateEthTestnet --networkid 3107 --fast --rpc --rpcapi eth,web3,personal,net,miner,admin

2. attach new instance (new terminal):
$ geth attach http://127.0.0.1:8545

3. set account that will receive ether
> miner.setEtherbase(eth.accounts[0])

4.  compile script to local folder test.js with provided deploy script
$ ./deploy.sh tictactoe.sol


5. deploy to BC
> loadScript("/tmp/test.js")

6. test if deploy worked
start miner and >test

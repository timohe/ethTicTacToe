# ethTicTacToe
Simple TicTacToe game with betting on the Ethereum Blockchain

# Get environment ready
1. open geth    
`$ geth --datadir ~/privateEthTestnet --networkid 3107 --fast --rpc --rpccorsdomain="*" --rpcapi eth,web3,personal,net,miner,admin`

2. attach new instance (new terminal):
`$ geth attach http://127.0.0.1:8545`

3. set account that will receive ether
> miner.setEtherbase(eth.accounts[0])

4. start mining
> miner.start(2)

5. unlock your account:
> personal.unlockAccount(eth.accounts[0], 123456, 999999);

You're good to go!

# Deploy the contract
1. do 1.-4. from above

2. go to https://remix.ethereum.org/ and chose web3 provider

5. deploy to BC
> loadScript("/tmp/test.js")

6. test if deploy worked
start miner and >test

# Connect Remix with local
1. install remixd 
$ npm install -g remixd
$ remixd -s ~/Documents/gitkrakenRepo/ethTicTacToe and click the link button in remix.
$ click on the connect button with remix 
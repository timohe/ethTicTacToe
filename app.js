//geth --datadir ~/privateEthTestnet --networkid 3107 --fast --rpc --rpccorsdomain="*" --rpcapi eth,web3,personal,net,miner,admin
//personal.unlockAccount(eth.accounts[0], "123456", 999999)
/*
A simple script that defines an address, gets the balance of it and then converts it to Ether before showing the result in the console.
For an explanation of this code, navigate to the wiki https://github.com/ThatOtherZach/Web3-by-Example/wiki/Get-Balance
*/

// Require the web3 node module.
var Web3 = require('web3');

// Show Web3 where it needs to look for a connection to Ethereum.
web3 = new Web3(new Web3.providers.HttpProvider('http://localhost:8545'));

//hardcode this part
var contractAddr = "0xa6affDE044fD25eAd5AaB3E192C88D2131D53901"; // Contract Address, can be hardcoded later
var contractAbi = [
	
		{
			"anonymous": false,
			"inputs": [
				{
					"indexed": false,
					"name": "error",
					"type": "string"
				}
			],
			"name": "Error",
			"type": "event"
		},
		{
			"constant": false,
			"inputs": [],
			"name": "hostNewGame",
			"outputs": [
				{
					"name": "message",
					"type": "string"
				}
			],
			"payable": true,
			"stateMutability": "payable",
			"type": "function"
		},
		{
			"constant": false,
			"inputs": [
				{
					"name": "host",
					"type": "address"
				}
			],
			"name": "joinExistingGame",
			"outputs": [
				{
					"name": "message",
					"type": "string"
				}
			],
			"payable": true,
			"stateMutability": "payable",
			"type": "function"
		},
		{
			"constant": false,
			"inputs": [
				{
					"name": "host",
					"type": "address"
				},
				{
					"name": "row",
					"type": "uint256"
				},
				{
					"name": "column",
					"type": "uint256"
				}
			],
			"name": "play",
			"outputs": [
				{
					"name": "message",
					"type": "string"
				}
			],
			"payable": false,
			"stateMutability": "nonpayable",
			"type": "function"
		},
		{
			"constant": true,
			"inputs": [],
			"name": "sayHello",
			"outputs": [
				{
					"name": "message",
					"type": "string"
				}
			],
			"payable": false,
			"stateMutability": "pure",
			"type": "function"
		}
		
]
var contract = new web3.eth.Contract(contractAbi, contractAddr);

//Defined by user
var hostAdr = "0x99704a2eb200abcc81b44e685f113bb83eaec43a";
var opponentAdr = "0x605bb25b9c17dd080ea20a0ab58ad8bf33805fce";




host();

// function test() // test with say hello
// {
// 	var getData = contract.sayHello.getData();
// 	web3.eth.call({
// 		to: contractAddr, // contract address
// 		data: getData
// 	})
// 	.then(console.log);
// };

function host() // make play
{
	console.log("Hosting new game...");	
	contract.methods.hostNewGame().send({from: "0xc8d52f9dc4ab7fb8920abe7144fec8215fccfe61", value: 5000000})
		.on('receipt', function(receipt){console.log(receipt)})
		.on('error', console.error);

};

// function host() // make play
// {
// 	console.log("Hosting new game...");	
// 	transactionObject = {from: "0x99704a2eb200abcc81b44e685f113bb83eaec43a", value: 5000000};
// 	web3.eth.sendTransaction(transactionObject).hostNewGame
// 		.then(function(receipt){console.log("This is the receipt" + receipt)});
// };



// function play(addressHost, row, col) // make play
// {
// 	contract.transact({from: hostAdr}).play(hostAdr, row, col);
// }




// // Write to the console the script will run shortly.
// console.log('Getting Ethereum address info.....');

// // Define the address to search witin.
// var addr = ('0xc8d52f9dc4ab7fb8920abe7144fec8215fccfe61');
// // Show the address in the console.
// console.log('Address:', addr);

// // Use Wb3 to get the balance of the address, convert it and then show it in the console.
// function getBalance(addr){
// 	web3.eth.getBalance(addr, function (error, result) {
// 		if (!error)
// 			console.log('Ether:', web3.utils.fromWei(result,'ether')); // Show the ether balance after converting it from Wei
// 		else
// 			console.log('Huston we have a problem: ', error); // Should dump errors here
// 	});
// }
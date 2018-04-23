web3 = new Web3(new Web3.providers.HttpProvider("http://localhost:8545"));

var contractAddr; //TODO: hardcode this address for presentation
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
		"outputs": [],
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
		"constant": false,
		"inputs": [
			{
				"name": "host",
				"type": "address"
			}
		],
		"name": "printBoard",
		"outputs": [
			{
				"name": "isHostsTurn",
				"type": "bool"
			},
			{
				"name": "board1",
				"type": "uint256"
			},
			{
				"name": "board2",
				"type": "uint256"
			},
			{
				"name": "board3",
				"type": "uint256"
			}
		],
		"payable": false,
		"stateMutability": "nonpayable",
		"type": "function"
	}
]
var contract;
var userAddressesArray;
var userAddress;
var hostAddress;
var boardArray = [];
setAddressArrayAndInit();


function setAddressArrayAndInit() {
	web3.eth.getAccounts().then(function (result) {
		userAddressesArray = result;
		populateAddressDropdown();
		userAddress = userAddressesArray[0]
	});
}
function populateAddressDropdown() {
	var addressItems = document.getElementById("addressDropdown");
	itemArray = userAddressesArray
	for (var i = 0; i < itemArray.length; i++) {
		var opt = itemArray[i];
		var el = document.createElement("option");
		el.textContent = opt;
		el.value = opt;
		addressItems.appendChild(el);
	}
}
function changeUserAddress() {
	userAddress = document.getElementById("addressDropdown").value;
	console.log("User address changed to: " + userAddress);
}
window.onload = function () {
	var elem = document.getElementById("contractAddress");
	elem.addEventListener("blur", function (event) {
		contractAddr = document.getElementById("contractAddress").value;
		console.log("Address set as: " + contractAddr);
		contract = new web3.eth.Contract(contractAbi, contractAddr);
	}, true);
}





function setContractAddress() {

	contractAddr = document.getElementById("contractAddress").value;
	console.log("Address set as: " + contractAddr);
	contract = new web3.eth.Contract(contractAbi, contractAddr);
}

function host() {
	console.log("Hosting new game using address: " + userAddress + " ...");
	valueToTransact = web3.utils.toWei('5', 'ether');
	contract.methods.hostNewGame().send({ from: userAddress, value: valueToTransact })
		.on('receipt', function (receipt) {
			console.log(receipt);
			refreshBoard();
		})
		.on('error', function (error) {
			var savedError = error;
			console.log("This is the error: " + JSON.stringify(savedError));
		})
	hostAddress = userAddress;
	return;
};

function joinExistingGame() {
	console.log("Joining existing game...");
	valueToTransact = web3.utils.toWei('5', 'ether');
	contract.methods.joinExistingGame(hostAdr).send({ from: web3.eth.accounts[0], value: valueToTransact })
		.on('receipt', function (receipt) {
			console.log(receipt);
			refreshBoard();
		})
		.on('error', function (error) {
			var savedError = error;
			console.log("This is the error: " + JSON.stringify(savedError));
		})
};

function makeMove() {
	var _row = document.getElementById("moveRow").value;
	var _col = document.getElementById("moveColumn").value;
	play(hostAddress, _row, _col);
}

function play(hostAdr, row, col) {
	console.log("Making move...");
	contract.methods.play(hostAddress, row, col).send({ from: userAddress })
		.on('receipt', function (receipt) {
			console.log(receipt);
			refreshBoard();
		})
		.on('error', function (error) {
			var savedError = error;
			console.log("This is the error: " + JSON.stringify(savedError));
		})
};

function refreshBoard() {
	console.log("Getting state...");
	contract.methods.printBoard(hostAddress).call()
		.then(function (result) {
			boardArray[0] = parseInt(result.board1.substring(3, 4));
			boardArray[1] = parseInt(result.board1.substring(4, 5));
			boardArray[2] = parseInt(result.board1.substring(5, 6));
			boardArray[3] = parseInt(result.board2.substring(3, 4));
			boardArray[4] = parseInt(result.board2.substring(4, 5));
			boardArray[5] = parseInt(result.board2.substring(5, 6));
			boardArray[6] = parseInt(result.board3.substring(3, 4));
			boardArray[7] = parseInt(result.board3.substring(4, 5));
			boardArray[8] = parseInt(result.board3.substring(5, 6));
			document.querySelector('.field1').innerHTML = boardArray[0];
			document.querySelector('.field2').innerHTML = boardArray[1];
			document.querySelector('.field3').innerHTML = boardArray[2];
			document.querySelector('.field4').innerHTML = boardArray[3];
			document.querySelector('.field5').innerHTML = boardArray[4];
			document.querySelector('.field6').innerHTML = boardArray[5];
			document.querySelector('.field7').innerHTML = boardArray[6];
			document.querySelector('.field8').innerHTML = boardArray[7];
			document.querySelector('.field9').innerHTML = boardArray[8];
			document.querySelector('.isHostsTurn').innerHTML = result.isHostsTurn;
			console.log(JSON.stringify(result));
		});
};

web3 = new Web3(new Web3.providers.HttpProvider("http://localhost:8545"));

var contractAddr; //TODO: hardcode this address for presentation
var contractAbi = [
	{
		"constant": false,
		"inputs": [
			{
				"name": "host",
				"type": "address"
			}
		],
		"name": "clearBoard",
		"outputs": [],
		"payable": false,
		"stateMutability": "nonpayable",
		"type": "function"
	},
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
		"anonymous": false,
		"inputs": [
			{
				"indexed": false,
				"name": "whoWon",
				"type": "string"
			}
		],
		"name": "GameOver",
		"type": "event"
	},
	{
		"constant": false,
		"inputs": [],
		"name": "hostNewGame",
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
		"outputs": [],
		"payable": false,
		"stateMutability": "nonpayable",
		"type": "function"
	},
	{
		"constant": false,
		"inputs": [],
		"name": "triggerEvent",
		"outputs": [],
		"payable": false,
		"stateMutability": "nonpayable",
		"type": "function"
	},
	{
		"constant": true,
		"inputs": [
			{
				"name": "host",
				"type": "address"
			}
		],
		"name": "printBoard",
		"outputs": [
			{
				"name": "_isHostsTurn",
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
		"stateMutability": "view",
		"type": "function"
	}
]
var contract;
var userAddressesArray;
var userAddress;
var hostAddress;
var boardArray = [];
setAddressArrayAndInit();

window.onload = function () {
	//listen for changes in contract field
	var elem = document.getElementById("contractAddress");
	elem.addEventListener("blur", function (event) {
		contractAddr = document.getElementById("contractAddress").value;
		console.log("Address set as: " + contractAddr);
		contract = new web3.eth.Contract(contractAbi, contractAddr);
	}, true);
}

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



function host() {
	console.log("Hosting new game...");
	valueToTransact = web3.utils.toWei('5', 'ether');
	contract.methods.hostNewGame().send({ from: userAddress, value: valueToTransact })
		.on('receipt', function (receipt) {
			console.log("Transaction successfull, receipt:")
			console.log(receipt);
			refreshBoard();
		})
		.on('error', function (error) {
			var savedError = error;
			console.log("This is the error: " + JSON.stringify(savedError));
		})
	hostAddress = userAddress;
};

function joinExistingGame() {
	hostAddress = document.getElementById("hostAddress").value;
	console.log("This is the host address to join: " + JSON.stringify(hostAddress));

	console.log("Joining existing game...");
	valueToTransact = web3.utils.toWei('5', 'ether');
	contract.methods.joinExistingGame(hostAddress).send({ from: userAddress, value: valueToTransact })
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
	play(_row, _col);
}

function play(row, col) {
	console.log("Making move...from address" + userAddress);
	contract.methods.play(hostAddress, row, col).send({ from: userAddress })
		.on('receipt', function (receipt) {
			console.log(receipt);
			if (receipt.events && receipt.events.GameOver && receipt.events.GameOver.returnValues) {
				if (receipt.events.GameOver.returnValues[0] === "host") {
					alert("Game is over. The host won the game! He got the pot money");
				}
				if (receipt.events.GameOver.returnValues[0] === "opponent") {
					alert("Game is over. The opponent won the game! He got the pot money");
				}
				if (receipt.events.GameOver.returnValues[0] === "tie") {
					alert("Game is over. Nobody won so you both got your money back");
				}
				alert("The game is over! The winner is:" + receipt.events.GameOver.returnValues[0] + "The pot was sent to the winner");
			}
			refreshBoard();
		})
		.on('error', function (error) {
			var savedError = error;
			console.log("This is the error: " + JSON.stringify(savedError));
		})
};

function clearBoard() {
	console.log("Clearing board...from address"+hostAddress);
	contract.methods.clearBoard(hostAddress).send({ from: userAddress })
		.on('receipt', function (receipt) {
			console.log(receipt);
		})
		.on('error', function (error) {
			var savedError = error;
			console.log("This is the error when clearing the board: " + JSON.stringify(savedError));
		})
};

function refreshBoard() {
	console.log("Refreshing board...");
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
			document.querySelector('.isHostsTurn').innerHTML = result._isHostsTurn;
			console.log(JSON.stringify(result));
		});
};

// function startLoggingEvents() {
// 	console.log("started event logging...");
// 	contract.events.Error({}, function(error, event){ console.log(event); })
// }

// function testEvent() {
// 	console.log("Testing event...");
// 	contract.methods.triggerEvent().send({ from: "0xc8d52f9dc4ab7fb8920abe7144fec8215fccfe61"})
// 		.on('receipt', function (receipt) {
// 			console.log(receipt);
// 			if(receipt.events && receipt.events.Error && receipt.events.Error.returnValues){
// 				console.log("Message should be here:"+receipt.events.Error.returnValues[0]);
// 			}

// 		})
// 		.on('error', function (error) {
// 			var savedError = error;
// 			console.log("This is the error: " + JSON.stringify(savedError));
// 		})

// }

// function watchForGameOverEvents() {
// 	console.log("started watching for GameOverEvents...");
// 	var event = contract.GameOver();
// 	// http://solidity.readthedocs.io/en/latest/contracts.html#events
// 	event.watch(function (error, result) {
// 		if (!error)
// 			console.log(result);
// 	})
// };
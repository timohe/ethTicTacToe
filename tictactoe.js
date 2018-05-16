const web3 = new Web3(new Web3.providers.WebsocketProvider('ws://localhost:8546'));

var contractAddr; //can be hardcoded after deploy
var contractAbi = [
	{
		"constant": true,
		"inputs": [],
		"name": "getBalance",
		"outputs": [
			{
				"name": "bal",
				"type": "uint256"
			}
		],
		"payable": false,
		"stateMutability": "view",
		"type": "function"
	},
	{
		"constant": false,
		"inputs": [],
		"name": "withdraw",
		"outputs": [],
		"payable": false,
		"stateMutability": "nonpayable",
		"type": "function"
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
		"constant": true,
		"inputs": [],
		"name": "owner",
		"outputs": [
			{
				"name": "",
				"type": "address"
			}
		],
		"payable": false,
		"stateMutability": "view",
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
			},
			{
				"name": "_opponent",
				"type": "address"
			}
		],
		"payable": false,
		"stateMutability": "view",
		"type": "function"
	},
	{
		"inputs": [],
		"payable": false,
		"stateMutability": "nonpayable",
		"type": "constructor"
	},
	{
		"anonymous": false,
		"inputs": [
			{
				"indexed": false,
				"name": "sender",
				"type": "address"
			},
			{
				"indexed": false,
				"name": "log",
				"type": "string"
			}
		],
		"name": "HostedGame",
		"type": "event"
	},
	{
		"anonymous": false,
		"inputs": [
			{
				"indexed": false,
				"name": "sender",
				"type": "address"
			},
			{
				"indexed": false,
				"name": "log",
				"type": "string"
			}
		],
		"name": "JoinedGame",
		"type": "event"
	},
	{
		"anonymous": false,
		"inputs": [
			{
				"indexed": false,
				"name": "sender",
				"type": "address"
			},
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
				"name": "host",
				"type": "address"
			},
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
		"anonymous": false,
		"inputs": [
			{
				"indexed": false,
				"name": "host",
				"type": "address"
			}
		],
		"name": "TriggerBoardRefresh",
		"type": "event"
	}
];

var contract;
var userAddressesArray;
var playerOnTurn;
var userAddress;
var hostAddress;
var accountBalance;
var boardArray = [];
var boolArray = [];
var gameOver = false;
var gasToSend = 1000000;

//initialize addresses which are available to user
function setAddressArrayAndInit() {
	web3.eth.getAccounts().then(function (result) {
		userAddressesArray = result;
		populateAddressDropdown();
		userAddress = userAddressesArray[0];
		userAddress = userAddress.toLowerCase();
	}).catch(function (error) {
		console.log(error);
	});
};
setAddressArrayAndInit();

//define the contract and start listening to different incoming events
window.onload = function () {
	var elem = document.getElementById("contractAddress");
	elem.addEventListener("blur", function () {
		contractAddr = document.getElementById("contractAddress").value;
		contract = new web3.eth.Contract(contractAbi, contractAddr);
		listentoEvents();
	}, true);
	hideBoard();
	updateBalance();
};

function updateBalance() {
    setInterval(function(){ updateAccountBalance(); }, 3000);
}

function listentoEvents() {
	console.log("listening to events...");
	contract.events.HostedGame({
		fromBlock: 'latest',
		filter: { sender: userAddress }
	}, function (error, event) {
		console.log("HostedGame event received!");
		console.log("This is the received log-event: " + JSON.stringify(event));
		document.querySelector('.playerOnTurn').innerHTML = "Successfully hosted! Please wait for an opponent to join and make a move!";
		gameOver = false;
	});

	contract.events.JoinedGame({
		fromBlock: 'latest',
		filter: { sender: userAddress }
	}, function (error, event) {
		// console.log("This is the received log-event: " + JSON.stringify(event.returnValues[1]));
		console.log("JoinedGame event received!");
		document.querySelector('.playerOnTurn').innerHTML = "Successfully joined! Make your first move!";
		gameOver = false;
	});

	contract.events.TriggerBoardRefresh({
		fromBlock: 'latest',
		filter: { host: hostAddress }
	}, function (error, event) {
		console.log("TriggerBoardRefresh event received!");
		refreshBoard();
	});

	contract.events.GameOver({
		fromBlock: 'latest',
		filter: { sender: hostAddress }
	}, function (error, event) {
		console.log("This is the received log-event: " + JSON.stringify(event.returnValues[1]));
		gameOver = true;
		if (event.returnValues[1] === "opponent") {
			if (userAddress === hostAddress) {
				document.querySelector('.playerOnTurn').innerHTML = "You lost the game and 5 ether :(.";
			} else {
				document.querySelector('.playerOnTurn').innerHTML = "You won the game. The money was sent to your address!"
			}
		}
		if (event.returnValues[1] === "host") {
			if (userAddress === hostAddress) {
				document.querySelector('.playerOnTurn').innerHTML = "You won the game. The money was sent to your address!"
			} else {
				document.querySelector('.playerOnTurn').innerHTML = "You lost the game and 5 ether :(.";
			}
		}
		if (event.returnValues[1] === "tie") {
			document.querySelector('.playerOnTurn').innerHTML = "Game is over. Nobody won so you both got your money back";
		}
	});
}

function populateAddressDropdown() {
	itemArray = userAddressesArray;
	for (var i = 0; i < itemArray.length; i++) {
		var address = itemArray[i];
		web3.eth.getBalance(address).then(getAddressItemsSetter(address));
	}
	userAddress = itemArray[0];
	updateAccountBalance();
}

function getAddressItemsSetter(address) {
	return function (balance) {
		var addressItems = document.getElementById("addressDropdown");
		var el = document.createElement("option");
		var opt = address;
		el.textContent = opt;
		el.value = address;
		addressItems.appendChild(el);
	}
}

function updateAccountBalance() {
	web3.eth.getBalance(userAddress).then(setCurrentUserBalance(userAddress));
}

function setCurrentUserBalance(userAddress) {
	return function (balance) {
		accountBalance = web3.utils.fromWei(balance);
		document.getElementById('accountBalance').innerHTML = accountBalance;
	}
}

function changeUserAddress() {
	userAddress = document.getElementById("addressDropdown").value;
	userAddress = userAddress.toLowerCase();
	console.log("User address changed to: " + userAddress);
	updateAccountBalance();
	refreshBoard();
}

function host() {
	document.querySelector('.playerOnTurn').innerHTML = "Hosting new game...";
	console.log("Hosting new game...");
	valueToTransact = web3.utils.toWei('5', 'ether');
	contract.methods.hostNewGame().send({ from: userAddress, value: valueToTransact, gas: gasToSend })
		.on('receipt', function (receipt) {
			console.log(receipt);
			displayBoard();
			refreshBoard();
		})
		.on('error', function (error) {
			console.log(error)
			refreshBoard();
		});
	hostAddress = userAddress;
};

function joinExistingGame() {
	hostAddress = document.getElementById("hostAddress").value;
	document.querySelector('.playerOnTurn').innerHTML = "Joining existing game...";
	console.log("Joining existing game...");
	valueToTransact = web3.utils.toWei('5', 'ether');
	contract.methods.joinExistingGame(hostAddress).send({ from: userAddress, value: valueToTransact, gas: gasToSend })
		.on('receipt', function (receipt) {
			console.log(receipt);
			displayBoard();
		})
		.on('error', function (error) {
			console.log(error);
		})
};

function play(row, col) {
	if(!gameOver){
		document.querySelector('.playerOnTurn').innerHTML = "Making move..";
		contract.methods.play(hostAddress, row, col).send({ from: userAddress, gas: gasToSend })
			.on('receipt', function (receipt) {
				console.log(receipt);
			})
			.on('error', function (error) {
				console.log(error);
			})
	}else{
		alert("The game is over! Host or join a new game please!");
	}
	
}

function displayBoard() {
	document.getElementById("gameBoard").style.display = "block";
}
function hideBoard() {
	document.getElementById("gameBoard").style.display = "none";
}

function refreshBoard() {
	//dont refresh if the contract is not yet defined
	if(!contract){return;};
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
			for (i = 0; i < boardArray.length; i++) {
				if (boardArray[i] === 0) {
					boolArray[i] = '';
				}
				else if (boardArray[i] === 1) {
					boolArray[i] = 'X';
				}
				else {
					boolArray[i] = 'O';
				}
			}
			document.querySelector('.field1').innerHTML = boolArray[0];
			document.querySelector('.field2').innerHTML = boolArray[1];
			document.querySelector('.field3').innerHTML = boolArray[2];
			document.querySelector('.field4').innerHTML = boolArray[3];
			document.querySelector('.field5').innerHTML = boolArray[4];
			document.querySelector('.field6').innerHTML = boolArray[5];
			document.querySelector('.field7').innerHTML = boolArray[6];
			document.querySelector('.field8').innerHTML = boolArray[7];
			document.querySelector('.field9').innerHTML = boolArray[8];
			if(gameOver){
				return;
			}
			lowerCaseOpponent = result._opponent.toLowerCase();
			// you are the host
			if(userAddress == hostAddress){
				if (result._isHostsTurn == true) {
					document.querySelector('.playerOnTurn').innerHTML = "Make a move!";
					return
				}else{
					document.querySelector('.playerOnTurn').innerHTML = "Wait for your opponents move!";
					return;
				}
			}
			// you are the opponent
			else if(userAddress == lowerCaseOpponent){
				if (result._isHostsTurn == false) {
					document.querySelector('.playerOnTurn').innerHTML = "Make a move!";
					return
				}else{
					document.querySelector('.playerOnTurn').innerHTML = "Wait for your opponents move!";
					return;
				}
			}
			else{
				console.log("you are not part of the game because the user address is "+userAddress+"but the opponent in the game is: "+result._opponent+" and the host is "+ hostAddress)
				console.log("and isHoststurn is : "+result._isHostsTurn);
				document.querySelector('.playerOnTurn').innerHTML = "You are not part of the game!!!";
				return;
			}
		});
}

function cellClick(cell) {
	if (cell.id == "0-0") {
		play(0, 0);
	} else if (cell.id == "0-1") {
		play(0, 1);
	} else if (cell.id == "0-2") {
		play(0, 2);
	} else if (cell.id == "1-0") {
		play(1, 0);
	} else if (cell.id == "1-1") {
		play(1, 1);
	} else if (cell.id == "1-2") {
		play(1, 2);
	} else if (cell.id == "2-0") {
		play(2, 0);
	} else if (cell.id == "2-1") {
		play(2, 1);
	} else if (cell.id == "2-2") {
		play(2, 2);

	}
}

// function clearBoard() {
// 	contract.methods.clearBoard(hostAddress).send({ from: userAddress, gas: gasToSend})
// 		.on('receipt', function (receipt) {
// 			console.log(receipt);
// 			refreshBoard();
// 		})
// 		.on('error', function (error) {
// 			console.log(error);
// 		})
// }
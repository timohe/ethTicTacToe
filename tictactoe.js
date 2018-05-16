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
				"name": "log",
				"type": "string"
			}
		],
		"name": "Log",
		"type": "event"
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
setAddressArrayAndInit();
var gasToSend = 1000000;
var opp_has_joined = false;
var game_hosted = false;
var isRefreshPaused = true;
var gameOver = false;

var answer = setInterval(function () {
	if (!isRefreshPaused) {
		if (game_hosted && opp_has_joined)
			refreshBoard();
		updateAccountBalance();
	}
}, 1000);

window.onload = function () {
	var elem = document.getElementById("contractAddress");
	elem.addEventListener("blur", getContractAddressSetter(), true);
	getContractAddressSetter()();
	hideBoard();
};

function listenEvents(){	
	contract.events.Log({ fromBlock: 'latest' }, function(error, event){ console.log("This is the received event: "+JSON.stringify(event)); })
	
}

function getContractAddressSetter() {
	return function () {
		contractAddr = document.getElementById("contractAddress").value;
		contract = new web3.eth.Contract(contractAbi, contractAddr);
	}
}

function setAddressArrayAndInit() {
	web3.eth.getAccounts().then(function (result) {
		userAddressesArray = result;
		populateAddressDropdown();
		userAddress = userAddressesArray[0];
		userAddress = userAddress.toLowerCase();
	}).catch(function (error) {
		console.log(error);
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
}

function host() {
	isRefreshPaused = true;
	gameOver = false;
	console.log("Hosting new game...");
	valueToTransact = web3.utils.toWei('5', 'ether');
	contract.methods.hostNewGame().send({ from: userAddress, value: valueToTransact, gas: gasToSend })
		.on('receipt', function (receipt) {
			console.log("Transaction successfull, receipt:");
			console.log(receipt);
			game_hosted = true;
			document.querySelector('.playerOnTurn').innerHTML = "Please wait for an opponent to join and make a move!";
			displayBoard();
		})
		.on('error', function (error) {
			console.log(error)
		});
	hostAddress = userAddress;
	isRefreshPaused = false;
};

function joinExistingGame() {
	isRefreshPaused = true;
	hostAddress = document.getElementById("hostAddress").value;
	console.log("Joining existing game...");
	valueToTransact = web3.utils.toWei('5', 'ether');
	contract.methods.joinExistingGame(hostAddress).send({ from: userAddress, value: valueToTransact, gas: gasToSend })
		.on('receipt', function (receipt) {
			console.log(receipt);
			opp_has_joined = true;
			refreshBoard();
			displayBoard();
		})
		.on('error', function (error) {
			console.log(error);
		})
	isRefreshPaused = false;
};

function play(row, col) {
	console.log("Making move...");
	isRefreshPaused = true;
	contract.methods.play(hostAddress, row, col).send({ from: userAddress, gas: gasToSend })
		.on('receipt', function (receipt) {
			console.log(receipt);
			if (receipt.events && receipt.events.GameOver && receipt.events.GameOver.returnValues) {
				if (receipt.events.GameOver.returnValues[0] === "host") {
					if (userAddress === hostAddress) {
						gameOver = true;
						alert("You won the game. The money was sent to your address!");

					} else {
						alert("You suck and lost the game :(. ");
						gameOver = true;
					}
				}
				if (receipt.events.GameOver.returnValues[0] === "opponent") {
					if (userAddress === hostAddress) {
						gameOver = true;
						alert("You lost the game and a 5 ether :(. ");

					} else {
						gameOver = true;
						alert("You won the game. The money was sent to your address!");
					}
				}
				if (receipt.events.GameOver.returnValues[0] === "tie") {
					document.querySelector('.playerOnTurn').innerHTML = "Game is over. It was a Tie!";
					alert("Game is over. Nobody won so you both got your money back");
				}
			}
			isRefreshPaused = false;
			refreshBoard();
		})
		.on('error', function (error) {
			console.log(error);
		})
}

function displayBoard() {
	document.getElementById("gameBoard").style.display = "block";
}

function hideBoard() {
	document.getElementById("gameBoard").style.display = "none";
}

function refreshBoard() {
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
			if (gameOver) {
				document.querySelector('.playerOnTurn').innerHTML = "The game is over!!";
				return
			}
			else if (result._isHostsTurn == true && (userAddress == hostAddress)) {
				document.querySelector('.playerOnTurn').innerHTML = "Make a move!";
				return
			}
			else if (result._isHostsTurn == true && (userAddress != hostAddress)) {
				document.querySelector('.playerOnTurn').innerHTML = "Wait for your opponents move!";
				return;
			}
			else if (result._isHostsTurn == false && (userAddress == hostAddress)) {
				document.querySelector('.playerOnTurn').innerHTML = "Wait for your opponents move!";
				return;
			}
			else if (result._isHostsTurn == false && (userAddress != hostAddress)) {
				document.querySelector('.playerOnTurn').innerHTML = "Make a move!";
				return;
			}

			else {
				document.querySelector('.playerOnTurn').innerHTML = "Noooooo clueeeeeeee!!!";
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

function clearBoard() {
	contract.methods.clearBoard(hostAddress).send({ from: userAddress, gas: gasToSend })
		.on('receipt', function (receipt) {
			console.log(receipt);
		})
		.on('error', function (error) {
			console.log(error);
		})
	opp_has_joined = false;

}
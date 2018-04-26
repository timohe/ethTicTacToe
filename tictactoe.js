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
		"constant": true,
		"inputs": [
			{
				"name": "host",
				"type": "address"
			}
		],
		"name": "getGameState",
		"outputs": [
            {   "name": "_opponent",
                "type": "address"
            },
			{
				"name": "_isHostsTurn",
				"type": "bool"
			},
            {
                "name": "_turnNr",
                "type": "uint256"
            },
			{
				"name": "_board1",
				"type": "uint256"
			},
			{
				"name": "_board2",
				"type": "uint256"
			},
			{
				"name": "_board3",
				"type": "uint256"
			}
		],
		"payable": false,
		"stateMutability": "view",
		"type": "function"
	}
];

var contract;
var userAddressesArray;
var playerOnTurn;
var userAddress;
var hostAddress;
var boardArray = [];
var boolArray = [];
setAddressArrayAndInit();
var isRefreshPaused = true;
var answer = setInterval(function() {
    if(!isRefreshPaused) {
        refreshBoard();
    }
    }, 10000);


window.onload = function () {
	//listen for changes in contract field
	var elem = document.getElementById("contractAddress");
	elem.addEventListener("blur", getContractAddressSetter(), true);
	getContractAddressSetter()();
};

function getContractAddressSetter() {
	return function () {
        contractAddr = document.getElementById("contractAddress").value;
        console.log("Address set as: " + contractAddr);
        contract = new web3.eth.Contract(contractAbi, contractAddr);
	}
}

function setAddressArrayAndInit() {
	web3.eth.getAccounts().then(function (result) {
		userAddressesArray = result;
		populateAddressDropdown();
		userAddress = userAddressesArray[0]
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
}

function getAddressItemsSetter(address) {
	return function (balance) {
        var addressItems = document.getElementById("addressDropdown");
        var el = document.createElement("option");
        var opt = address + ";  bal: " + web3.utils.fromWei(balance);
        el.textContent = opt;
        el.value = address;
        addressItems.appendChild(el);
    }
}

function changeUserAddress() {
	userAddress = document.getElementById("addressDropdown").value;
	console.log("User address changed to: " + userAddress);
}

function host() {
    isRefreshPaused=true;
	console.log("Hosting new game...");
	valueToTransact = web3.utils.toWei('5', 'ether');
	contract.methods.hostNewGame().send({ from: userAddress, value: valueToTransact })
		.on('receipt', function (receipt) {
			console.log("Transaction successfull, receipt:");
			console.log(receipt);
			refreshBoard();
		})
		.on('error', function (error) {
			console.log("This is the error: " + JSON.stringify(error));
		});
	hostAddress = userAddress;
	isRefreshPaused=false;
};

function joinExistingGame() {
    isRefreshPaused=true;
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
			console.log("This is the error: ");
			console.log(error);
		})
    isRefreshPaused=false;
};

function play(row, col) {
	console.log("Making move...from address" + userAddress);
	isRefreshPaused = true;
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
			isRefreshPaused=false;
			refreshBoard();
		})
		.on('error', function (error) {
			console.log("This is the error: ");
			console.log(error);
		})

}

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
            for (i = 0; i < boardArray.length; i++) {
                if (boardArray[i] === 0) {
                    boolArray[i] = '';
                }
                else if(boardArray[i] === 1){
                    boolArray[i] = 'X';
                }
                else{
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
			document.querySelector('.isHostsTurn').innerHTML = result._isHostsTurn;
			console.log(JSON.stringify(result));
			if(result._isHostsTurn == true && (userAddress==hostAddress)){
                document.querySelector('.playerOnTurn').innerHTML = "Its your turn!!!"
            }
            else if(result._isHostsTurn == true && (userAddress!=hostAddress)){
                document.querySelector('.playerOnTurn').innerHTML = "Its your opponents turn!!!"
            }
            else if(result._isHostsTurn == false && (userAddress==hostAddress)){
                document.querySelector('.playerOnTurn').innerHTML = "Its your opponents turn!!!"
            }
            else if(result._isHostsTurn == false && (userAddress!=hostAddress)){
                document.querySelector('.playerOnTurn').innerHTML = "Its your turn!!!"
            }
            else{
                document.querySelector('.playerOnTurn').innerHTML = "Noooooo clueeeeeeee!!!"

            }
		});
};

function cellClick(cell) {
    if (cell.id == "0-0") {
        play(0,0);
    } else if (cell.id == "0-1") {
        play(0,1);
    } else if (cell.id == "0-2") {
        play(0,2);
    } else if (cell.id == "1-0") {
        play(1,0);
    } else if (cell.id == "1-1") {
        play(1,1);
    } else if (cell.id == "1-2") {
        play(1,2);
    } else if (cell.id == "2-0") {
        play(2,0);
    } else if (cell.id == "2-1") {
        play(2,1);
    } else if (cell.id == "2-2") {
        play(2,2);

    }
}

function printGameState() {
    contract.methods.getGameState(hostAddress).call()
        .then(function (result) {
            console.log(result);
        })
}

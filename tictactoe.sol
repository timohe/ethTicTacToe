pragma solidity ^0.4.21;

contract TicTacToe
{
    event HostedGame(address sender ,string log);
    event JoinedGame(address sender ,string log);
    event Error(address sender ,string error);
    event GameOver(address host ,string whoWon);
    event TriggerBoardRefresh(address host);
    uint constant pot = 5 ether;
    address public owner;

    modifier rightAmountPaid {
        if(msg.value != pot){
            emit Error(msg.sender, "You need to make a transaction of 5 eth...");
        }else{
            _;
        }
    }

    modifier onlyOwner() {
        require (msg.sender == owner);
        _;
    }

    constructor () public {
        owner = msg.sender;
    }

    struct Game
    {
        address opponent;
        bool isHostsTurn;
        bool gameNotOver;
        uint turnNr;
        mapping(uint => mapping(uint => uint)) board;
    }

    mapping (address => Game) games;

    function getBalance() public view returns(uint bal) {
        bal = address(this).balance;
    }

    function hostNewGame() payable rightAmountPaid public {
        clearBoard(msg.sender);
        Game storage g = games[msg.sender];
        g.gameNotOver = true;
        emit HostedGame(msg.sender, "successfully hosted Game!");
    }

    function joinExistingGame(address host) payable rightAmountPaid public {
        Game storage g = games[host];
        if(g.opponent == 0 && msg.sender != host)
        {
            g.opponent = msg.sender;
        }
        emit JoinedGame(msg.sender, "successfully joined Game!");
    }

    function play(address host, uint row, uint column) public{
        Game storage g = games[host];
        if(!g.gameNotOver){
            emit Error(msg.sender, "The game is Over");
            return;
        }
        uint player;
        if(msg.sender == host){
            player = 1;
        }
        else if(msg.sender == g.opponent){
            player = 2;
        } else{
            emit Error(msg.sender, "You are not part of this game");
            return;
        }
        if((g.isHostsTurn && player != 1) || (!g.isHostsTurn && player == 1)){
            emit Error(msg.sender, "Its not your turn! Wait for your opponent to play");
            return;
        }else{
            if(row >= 0 && row < 3 && column >= 0 && column < 3 && g.board[row][column] == 0)
            {
                g.board[row][column] = player;
                g.turnNr ++;
                emit TriggerBoardRefresh(host);
                if(youWon(host)){
                    if(player == 1){
                        host.transfer(10 ether);
                        emit GameOver(host, "host");
                        g.gameNotOver = false;
                    }else{
                        g.opponent.transfer(10 ether);
                        emit GameOver(host, "opponent");
                        g.gameNotOver = false;
                    }
                    g.isHostsTurn = !g.isHostsTurn;
                    return;
                }

                if(isTie(host)){
                    host.transfer(5 ether);
                    g.opponent.transfer(5 ether);
                    g.isHostsTurn = !g.isHostsTurn;
                    emit GameOver(host, "tie");
                    g.gameNotOver = false;
                    return;
                }
                g.isHostsTurn = !g.isHostsTurn;
                return;

            } else {
                emit Error(msg.sender, "Your choice of field was not valid");
            }
        }
    }


    function youWon(address host) internal view returns (bool didYouWin){
    //check who won not needed because you can only win if its your turn.
        Game storage g = games[host];
        for (uint i; i < 3; i++){
            if(g.board[i][0] != 0 && g.board[i][0] == g.board[i][1] && g.board[i][1] == g.board[i][2] ){
                return true;
            }
            if(g.board[0][i] != 0 && g.board[0][i] == g.board[1][i] && g.board[1][i] == g.board[2][i]){
                return true;
            }
        }
        if(g.board[0][0] != 0 && g.board[0][0] == g.board[1][1] && g.board[1][1] == g.board[2][2]){
            return true;
        }
        if(g.board[2][0] != 0 && g.board[2][0] == g.board[1][1] && g.board[1][1] == g.board[0][2]){
            return true;
        }
        return false;
    }

    function isTie(address host) internal view returns (bool isItATie){
        Game storage g = games[host];
        if(g.turnNr > 8){
            return true;
        }
    }

    function clearBoard(address host) internal{
        Game storage g = games[host];
        delete g.board[0][0];
        delete g.board[0][1];
        delete g.board[0][2];
        delete g.board[1][0];
        delete g.board[1][1];
        delete g.board[1][2];
        delete g.board[2][0];
        delete g.board[2][1];
        delete g.board[2][2];
        delete g.opponent;
        delete g.isHostsTurn;
        delete g.turnNr;
        delete g.gameNotOver;
    }

    function printBoard(address host) public view returns (bool _isHostsTurn, uint board1, uint board2, uint board3, address _opponent){
        Game storage g = games[host];
        board1 = (999000 + 100 * (g.board[0][0])) + (10 * (g.board[0][1])) + (g.board[0][2]);
        board2 = (999000 + 100 * (g.board[1][0])) + (10 * (g.board[1][1])) + (g.board[1][2]);
        board3 = (999000 + 100 * (g.board[2][0])) + (10 * (g.board[2][1])) + (g.board[2][2]);
        _isHostsTurn = g.isHostsTurn;
        _opponent = g.opponent
        
    }

    function withdraw() public onlyOwner {
        require(address(this).balance > 0);
        owner.transfer(address(this).balance);
    }
}

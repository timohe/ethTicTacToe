pragma solidity ^0.4.21;

contract TicTacToe
{
    event Log(string log);
    event Error(string error);
    event GameOver(string whoWon);
    uint constant pot = 5 ether;

    modifier rightAmountPaid {
        if(msg.value != pot){
            emit Error("You need to make a transaction of 5 eth");
        }else{
            _;
        }
    }

    struct Game
    {
        address opponent;
        bool isHostsTurn;
        uint turnNr;
        mapping(uint => mapping(uint => uint)) board;
    }

    mapping (address => Game) games;

    function hostNewGame() payable rightAmountPaid public
    {
        Game storage g = games[msg.sender];
        g.isHostsTurn = true;
        g.turnNr = 0;
        g.opponent = 0;
        clearBoard(msg.sender);
        emit Log("successfully hosted Game!");
    }

    function joinExistingGame(address host) payable rightAmountPaid public
    {
        Game storage g = games[host];
        if(g.opponent == 0 && msg.sender != host)
        {
            g.opponent = msg.sender;
        }
        emit Log("successfully joined Game!");
    }

    function play(address host, uint row, uint column) public{
        Game storage g = games[host];
        uint player;
        if(msg.sender == host){
            emit Log("executing move for host");
            player = 1;
        }
        else if(msg.sender == g.opponent){
            emit Log("executing move for opponent");
            player = 2;
        } else{
            emit Error("You are not part of this game");
            return;
        }
        if((g.isHostsTurn && player != 1) || (!g.isHostsTurn && player == 1)){
            emit Error("Its not your turn! Wait for your opponent to play");
            return;
        }else{
            if(row >= 0 && row < 3 && column >= 0 && column < 3 && g.board[row][column] == 0)
            {
                g.board[row][column] = player;

                if(youWon(host))
                {
                    if(player == 1){
                        host.transfer(2*pot);
                        emit GameOver("host");
                    }else{
                        g.opponent.transfer(2*pot);
                        emit GameOver("opponent");
                    }
                    return;
                }

                if(isTie(host))
                {
                    host.transfer(pot/2);
                    g.opponent.transfer(pot/2);
                    emit GameOver("tie");
                    return;
                }

                emit Log("move successfully applied");
                g.isHostsTurn = !g.isHostsTurn;
                return;

                g.isHostsTurn = !g.isHostsTurn;
                g.turnNr ++;
            } else {
            emit Error("Your choice of field was not valid");
            }
        }
    }

    function youWon(address host) internal view returns (bool didYouWin)
    //do not have to check who won because you can only win if its your turn.
    {
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

    function isTie(address host) internal view returns (bool isItATie)
    {
        Game storage g = games[host];
        if(g.turnNr > 8){
            return true;
        }
    }

    function getGameState(address host) public view returns (address _opponent, bool _isHostsTurn, uint _turnNr, uint _board1, uint _board2, uint _board3) {
        Game storage g = games[host];
        _opponent = g.opponent;
        _isHostsTurn = g.isHostsTurn;
        _turnNr = g.turnNr;
        _board1 = (999000 + 100 * (g.board[0][0])) + (10 * (g.board[0][1])) + (g.board[0][2]);
        _board2 = (999000 + 100 * (g.board[1][0])) + (10 * (g.board[1][1])) + (g.board[1][2]);
        _board3 = (999000 + 100 * (g.board[2][0])) + (10 * (g.board[2][1])) + (g.board[2][2]);
    }

    function clearBoard(address host) internal
    {
        games[host].board[0][0] = 0;
        games[host].board[0][1] = 0;
        games[host].board[0][2] = 0;
        games[host].board[1][0] = 0;
        games[host].board[1][1] = 0;
        games[host].board[1][2] = 0;
        games[host].board[2][0] = 0;
        games[host].board[2][1] = 0;
        games[host].board[2][2] = 0;
        games[host].opponent = 0;
    }

    function printBoard(address host) public view returns (bool _isHostsTurn, uint board1, uint board2, uint board3)
    {
        Game storage g = games[host];
        board1 = (999000 + 100 * (g.board[0][0])) + (10 * (g.board[0][1])) + (g.board[0][2]);
        board2 = (999000 + 100 * (g.board[1][0])) + (10 * (g.board[1][1])) + (g.board[1][2]);
        board3 = (999000 + 100 * (g.board[2][0])) + (10 * (g.board[2][1])) + (g.board[2][2]);
        _isHostsTurn = g.isHostsTurn;
    }
}

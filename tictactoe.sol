pragma solidity ^0.4.21;

contract TicTacToe
{
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
    
    function triggerEvent() public
    {
        emit GameOver("This is an event");
    }
    
    
    function hostNewGame() payable rightAmountPaid public
    {

        Game storage g = games[msg.sender];
        clearBoard(msg.sender);
        g.isHostsTurn = true;
        emit Error("successfully hosted Game!");
    }
    
    function joinExistingGame(address host) payable rightAmountPaid public
    {
        Game storage g = games[host];
        if(g.opponent == 0 && msg.sender != host)
        {
            g.opponent = msg.sender;
        }
        emit Error("successfully joined Game!");
    }
    
    function play(address host, uint row, uint column) public{
        Game storage g = games[host];
        uint player;
        if(msg.sender == host){
            player = 1;
        }
        else if(msg.sender == g.opponent){
            player = 2;
        } else{
           emit Error("You are not part of this game"); 
        }
        if(g.isHostsTurn && player != 1 || !g.isHostsTurn && player == 1){
            emit Error("Its not your turn! Wait for your opponent to play");
            return;
        }else{
            if(row >= 0 && row < 3 && column >= 0 && column < 3 && g.board[row][column] == 0)
            {
                g.board[row][column] = player;
                
                if(isTie(host))
                {
                    host.transfer(pot/2);
                    g.opponent.transfer(pot/2);
                    emit GameOver("tie");
                    //clearBoard(host);
                    return;
                }
                
                if(youWon(host))
                {
                    if(player == 1){
                        host.transfer(2*pot);
                        emit GameOver("host");
                    }else{
                        g.opponent.transfer(2*pot); 
                        emit GameOver("opponent");
                    }
                    
                    //clearBoard(host);
                    return;
                }
                g.isHostsTurn = !g.isHostsTurn;
                g.turnNr ++;
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
            if(g.board[0][0] != 0 && g.board[0][0] == g.board[1][1] && g.board[1][1] == g.board[2][2]){
                return true;   
            }
            if(g.board[2][0] != 0 && g.board[2][0] == g.board[1][1] && g.board[1][1] == g.board[0][2]){
                return true;   
            }
            return false;
        } 
    }
    
    function isTie(address host) internal view returns (bool isItATie)
    {
        Game storage g = games[host];
        if(g.turnNr > 8){
            return true;
        }
    }
    
    function removeGame(address host) public returns (string message)
    {
        delete games[host];
        message = "game was deleted";
    }

    function clearBoard(address host) internal
    {
        Game storage g = games[host];
        g.opponent = 0;
           
        for(uint row; row < 3; row++){
            for(uint col; col < 3; col++){
                g.board[row][col] = 0;
            }
        }
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

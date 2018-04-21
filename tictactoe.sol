pragma solidity ^0.4.21;

contract TicTacToe
{
    event Error(string error);
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
    
    function hostNewGame() payable rightAmountPaid public returns (string message)
    {
        Game storage g = games[msg.sender];
        g.isHostsTurn = true;
        message = "successfully hosted Game!";
    }
    
    function joinExistingGame(address host) payable rightAmountPaid public returns (string message)
    {
        Game storage g = games[host];
        if(g.opponent == 0 && msg.sender != host)
        {
            g.opponent = msg.sender;
        }
        message = "successfully joined Game!";
    }
    
    function play(address host, uint row, uint column) public returns (string message){
        Game storage g = games[host];
        uint player;
        if(msg.sender == host){
            player = 1;
        }else{player = 2;}
        
        if(g.isHostsTurn && player != 1 || !g.isHostsTurn && player == 1){
            message = "Its not your turn! Wait until your opponent makes his or her turn";
            return;
        }else{
            if(row >= 0 && row < 3 && column >= 0 && column < 3 && g.board[row][column] == 0)
            {
                g.board[row][column] = player;
                
                if(isTie(host))
                {
                    host.transfer(pot/2);
                    g.opponent.transfer(pot/2);
                    clearBoard(host);
                    return;
                }
                
                if(youWon(host))
                {
                    if(player == 1){
                        host.transfer(pot);
                    }else{
                        g.opponent.transfer(pot);                        
                    }
                    message = "you won! the amount was paid to your address";
                    clearBoard(host);
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
    
    function removeGame(address host) internal
    {
        delete games[host];
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
    
    function printBoard(address host) public returns (bool isHostsTurn, uint board1, uint board2, uint board3)
    {
        Game storage g = games[host];
        isHostsTurn = isHostsTurn;
        board1 = (999000 + 100 * (g.board[0][0])) + (10 * (g.board[0][1])) + (g.board[0][2]);
        board2 = (999000 + 100 * (g.board[1][0])) + (10 * (g.board[1][1])) + (g.board[1][2]);
        board3 = (999000 + 100 * (g.board[2][0])) + (10 * (g.board[2][1])) + (g.board[2][2]);
    }
}

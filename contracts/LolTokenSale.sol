// SPDX-License-Identifier: MIT
pragma solidity >=0.5.0;
import "./LolToken.sol";

contract LolTokenSale{
    address admin;
    LolToken public tokenContract;
    uint public tokenPrice;
    uint public tokenSold;

    event Sell(address indexed _buyer,uint _numberOfTokens); //Sell event

    constructor(LolToken _tokenContract,uint _tokenPrice){  
        admin=msg.sender;
        //admin is the person who deployed this contract
        tokenContract=_tokenContract;
        //tokenContract is an instance of LolToken contract
        tokenPrice=_tokenPrice;
        tokenSold=0;
    }   
    function _multiply(uint x,uint y) pure internal returns(uint z){
        require(y == 0 || (z = x * y) / y == x); //safe multiply function
    }
    function buyTokens(uint _numberOfTokens) public payable{
        //require value is equal to tokens
        require(msg.value == _multiply(tokenPrice,_numberOfTokens));
        //require that the contract has enough tokens
        require(tokenContract.balanceOf(address(this))>=_numberOfTokens);
        //require that a transfer is successful
        require(tokenContract.transfer(msg.sender, _numberOfTokens));
        //keep track of tokens sold
        tokenSold+=_numberOfTokens;

        //trigger sell event
        emit Sell(msg.sender, _numberOfTokens);
    }
    function endSale() public{
        //require admin only access
        require(msg.sender==admin);
        //transfer remaing tokens back to admin
        require(tokenContract.transfer(admin, tokenContract.balanceOf(address(this))));
        //destroy this contract
        selfdestruct(payable(admin));
    }
}
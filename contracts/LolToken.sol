// SPDX-License-Identifier: MIT
pragma solidity >=0.4.2;

contract LolToken{
    string public name="LolToken";
    string public symbol="LOL";
    uint256 public totalSupply;
    //totalSupply is total supply of our token

    //Transfer event
    event Transfer(
        address indexed _from,
        address indexed _to,
        uint256 value
    );

    mapping(address=>uint256) public balanceOf;
    //balanceOf returns the balance associated with the given address
    constructor(uint256 _initialSupply){
        //sets the balance of admin account(deployer account) to _initialSupply
        balanceOf[msg.sender]=_initialSupply;
        //sets the totalSupply to _initialSupply
        totalSupply=_initialSupply;
    }

    function transfer(address _to,uint256 _value) public returns(bool success){
        //Checking for insufficient token funds
        require(balanceOf[msg.sender]>=_value,'Insufficient funds');
        //Transfer of tokens
        balanceOf[msg.sender]-=_value;
        balanceOf[_to]+=_value;
        //event is triggered everytime transaction takes place
        emit Transfer(msg.sender,_to, _value);
        //Returning true on successfull transaction
        return true;
    }
}
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
        uint256 _value
    );
    //Approval event
    event Approval(
        address indexed _owner,
        address indexed _spender,
        uint256 _value
    );
    mapping(address=>uint256) public balanceOf;
    //balanceOf returns the balance associated with the given address
    mapping(address=>mapping(address=>uint256)) public allowance;
    //allowance returns the allowance tokens associated with various accounts that has been approved by a certain account
    //let A has all the tokens and it wants to approve B and C some tokens to spend
    //allowance[A][B] returns the allowance tokens of B that A has approved and B can spend on behalf of A
    //allowance[A][C] returns the allowance tokens of C that A has approved and C can spend on behalf of A
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

    function approve(address _spender,uint256 _value) public returns(bool success){
        //add allowance tokens to the _spender account
        allowance[msg.sender][_spender]=_value;
        //fires the Approval event
        emit Approval(msg.sender,_spender,_value);
        return true;
    }

    function transferFrom(address _from,address _to,uint256 _value) public returns(bool success){
        //checks if the _from account has enough balance
        require(balanceOf[_from]>=_value);
        //checks if the allowance of spender(msg.sender) is greater than the _value
        require(allowance[_from][msg.sender]>=_value);
        //transfers the tokens
        balanceOf[_from]-=_value;
        balanceOf[_to]+=_value;
        //reduces the allowance of spender(msg.sender)
        allowance[_from][msg.sender]-=_value;
        //fires the Transfer event
        emit Transfer(_from, _to, _value);
        return true;
    }
}
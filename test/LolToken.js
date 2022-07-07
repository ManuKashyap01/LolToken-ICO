const LolToken=artifacts.require('LolToken')
//LolToken is the abstraction required to talk to the smart contract

// Before contract() function is run, our contracts are redeployed to the ethereum client(to run the test with clean contract state)
//contract() function provides a list of accounts made available by the ethereum client
contract('LolToken',function(accounts){
    //it() function provides the desciption of the test and the code to test our contract
    it('sets the totalSupply when deployed',function(){
        return LolToken.deployed().then(function(instance){
            tokenInstance=instance
            return tokenInstance.totalSupply()
        }).then(function(totalSupply){
            //assert checks the condition. If false, it will display the desired message 
            assert.equal(totalSupply.toNumber(),1000000,'Set the  totalSupply to 1,000,000')
        })
    })
})
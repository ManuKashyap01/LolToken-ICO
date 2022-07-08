const LolToken=artifacts.require('LolToken')
//LolToken is the abstraction required to talk to the smart contract

// Before contract() function is run, our contracts are redeployed to the ethereum client(to run the test with clean contract state)
//contract() function provides a list of accounts made available by the ethereum client
contract('LolToken',function(accounts){
    var tokenInstance;
    //it() function provides the desciption of the test and the code to test our contract
    
    //this test will check for the name and symbol of the token
    it('sets the inital values to the token',function(){
        return LolToken.deployed().then(function(instance){
            tokenInstance=instance
            return tokenInstance.name()
        }).then(function(tokenName){
            //this will check for the token name
            assert.equal(tokenName,"LolToken",'Set the correct token name')
            return tokenInstance.symbol()
        }).then(function(tokenSymbol){
            //this will check for the token symbol
            assert.equal(tokenSymbol,"LOL",'Set the correct token symbol')
        })
    })

    //this will check for the total supply and deployer balance
    it('allocates the initial Supply of token when deployed',function(){
        return LolToken.deployed().then(function(instance){
            tokenInstance=instance
            return tokenInstance.totalSupply()
        }).then(function(totalSupply){
            //assert checks the condition. If false, it will display the desired message 
            //this will check for the total supply==initial token supply
            assert.equal(totalSupply.toNumber(),1000000,'Set the  totalSupply to 1,000,000')
            return tokenInstance.balanceOf(accounts[0])
        }).then(function(adminBalance){
            //this will check for the balance of deployer==initial token supply
            assert.equal(adminBalance.toNumber(),1000000,'Set the balance amount of admin to 1,000,000')
        })
    })
    //this will check for sufficient funds, token transfer,
    it('transfers token ownership',function(){
        return LolToken.deployed().then(function(instance){
            tokenInstance=instance
            //this will try to transfer tokens greater than that the admin account have 
            //.call() does not initialize the transaction
            return tokenInstance.transfer.call(accounts[1],99999999999)
        }).then(assert.fail).catch(function(error){
            //this will catch the revert back error
            //assert will check if the error message has a 'revert' keyword present
            assert(error.message.indexOf('revert')>=0,'Transaction reverted due to insufficient funds')
            return tokenInstance.transfer.call(accounts[1],250000,{from:accounts[0]})
        }).then(function(success){
            //This will check for a successfull transaction
            assert.equal(success,true,'Calling a transaction is a success')

            //here transaction was initialized and returns a receipt
            return tokenInstance.transfer(accounts[1],250000,{from:accounts[0]})
        }).then(function(receipt){
            //Transaction receipt is where event information can be found
            //receipt.logs has all the event information
            
            //this checks the number of events fired
            assert.equal(receipt.logs.length,1,'Triggers 1 event')
            //this checks for the required event we are testing
            assert.equal(receipt.logs[0].event,'Transfer','event should be "transfer" event')
            // this will check for the arguments and their values
            assert.equal(receipt.logs[0].args._from,accounts[0],'Token transferred from accounts[0]')
            assert.equal(receipt.logs[0].args._to,accounts[1],'Token transferred to accounts[1]')
            assert.equal(receipt.logs[0].args.value.toNumber(),250000,'Token transfer value 250000')

            return tokenInstance.balanceOf(accounts[1])
        }).then(function(balance){
            //this will check if the given number of tokens was recieved
            assert.equal(balance.toNumber(),250000,'tokens was nor recieved')
            return tokenInstance.balanceOf(accounts[0])
        }).then(function(balance){
            //this will check if the given number of tokens was sent
            assert.equal(balance.toNumber(),750000,'tokens was not transferred')
        })
    })
})
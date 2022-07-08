const LolToken=artifacts.require('LolToken')
//LolToken is the abstraction required to talk to the smart contract

// Before contract() function is run, our contracts are redeployed to the ethereum client(to run the test with clean contract state)
//contract() function provides a list of accounts made available by the ethereum client
//Initializing for testing the contract...........accounts are provided by gnache for testing purposes
contract('LolToken',function(accounts){
    var tokenInstance;
    //it() function provides the desciption of the test and the code to test our contract
    
    //this test will check for the name and symbol of the token
    it('sets the inital values to the token',function(){
        return LolToken.deployed().then(function(instance){
            tokenInstance=instance
            // here tokenInstance is an instance of the contract abstraction used to call various functions available to the contract
            // console.log(tokenInstance)
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
    //this will check for sufficient funds, token transfer and event triggers
    it('transfers token ownership',function(){
        return LolToken.deployed().then(function(instance){
            tokenInstance=instance
            //it is checking for the require statement when the amount in user's account is less than required transfer amount
            //this will try to transfer tokens greater than that the admin account have 
            //.call() does not initialize the transaction
            return tokenInstance.transfer.call(accounts[1],99999999999)
        }).then(assert.fail).catch(function(error){
            //this will catch the revert back error
            //assert will check if the error message has a 'revert' keyword present
            assert(error.message.toString().indexOf('revert')>=0,'Transaction reverted due to insufficient funds')
            return tokenInstance.transfer.call(accounts[1],250000,{from:accounts[0]})
        }).then(function(success){
            //This will check for a successfull transaction
            assert.equal(success,true,'Calling transaction is a success')

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
            assert.equal(receipt.logs[0].args._value.toNumber(),250000,'Token transfer value 250000')

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
    //this will check the approve function and approval event for the delegated transfer
    it('It approves tokens for delegated transfer',function(){
        return LolToken.deployed().then(function(instance){
            tokenInstance=instance
            return tokenInstance.approve.call(accounts[1],200)
        }).then(function(success){
            assert.equal(success,true,"it is true")
            return tokenInstance.approve(accounts[1],200,{from:accounts[0]})
        }).then(function(receipt){
            assert.equal(receipt.logs.length,1,'Triggers 1 event')
            assert.equal(receipt.logs[0].event,'Approval','"Approval" event is triggered')
            assert.equal(receipt.logs[0].args._owner,accounts[0],'accounts[0] is owner')
            assert.equal(receipt.logs[0].args._spender,accounts[1],'accounts[1] is spender')
            assert.equal(receipt.logs[0].args._value.toNumber(),200,'spendable amount is 200')
            //returning the allowance tokens of accounts[1] that accounts[0] has approved
            return tokenInstance.allowance(accounts[0],accounts[1])
        }).then(function(allowance){
            assert.equal(allowance,200,'store the allowance for delegated transfer')
        })
    })
    //it checks the delegate transfer of tokens
    it('handles delegates transfers',function(){
        return LolToken.deployed().then(function(instance){
            tokenInstance=instance
            //creating new instance of accounts to work with
            fromAccount=accounts[2]
            toAccount=accounts[3]
            spendingAccount=accounts[4]
            //making the initial transfer from the admin account(accounts[0]) to fromAccount
            return tokenInstance.transfer(fromAccount,200,{from:accounts[0]})
        }).then(function(receipt){
            //approving tokens to spendingAccount;calling the function using fromAccount
            return tokenInstance.approve(spendingAccount,100,{from:fromAccount})
        }).then(function(receipt){
            //try to transfer more tokens than the fromAccount has
            return tokenInstance.transferFrom(fromAccount,toAccount,3350,{from:spendingAccount})
        }).then(assert.fail).catch(function(error){
            //checking for error
            assert(error.message.toString().indexOf('revert')>=0,'Transaction reverted due to insufficient funds')
            //try to transfer more tokens than the allowance tokens
            return tokenInstance.transferFrom(fromAccount,toAccount,150,{from:spendingAccount})
        }).then(assert.fail).catch(function(error){
            //checking for error
            assert(error.message.toString().indexOf('revert')>=0,'Trasaction reverted due to insufficient allowance')
            //using call to check the return statement
            return tokenInstance.transferFrom.call(fromAccount,toAccount,50,{from:spendingAccount})
        }).then(function(success){
            assert.equal(success,true,'it returns true')
            //actual transfer of allowance tokens from fromAccount to toAccount via spendingAccount
            return tokenInstance.transferFrom(fromAccount,toAccount,50,{from:spendingAccount})            
        }).then(function(receipt){
            //checking the event is properly fired
            assert.equal(receipt.logs.length,1,'Triggers 1 event')
            assert.equal(receipt.logs[0].event,'Transfer','"Transfer" event is triggered')
            assert.equal(receipt.logs[0].args._from,accounts[2],'accounts[2] is sender')
            assert.equal(receipt.logs[0].args._to,accounts[3],'accounts[3] is receiver')
            assert.equal(receipt.logs[0].args._value.toNumber(),50,'amount transferred is 50')
            //checking the balance of toAccount after the delegated transfer of tokens
            return tokenInstance.balanceOf(toAccount)
        }).then(function(balance){
            assert.equal(balance.toNumber(),50,'Token recieved through delegate transfer')
            //checking the allowance tokens left after the delegated transfer of tokens
            return tokenInstance.allowance(fromAccount,spendingAccount)
        }).then(function(balance){
            assert.equal(balance.toNumber(),50,'Token deducted from allowance')
        })
    })
})
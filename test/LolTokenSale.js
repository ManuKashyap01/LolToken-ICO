const LolToken=artifacts.require('LolToken')
const LolTokenSale=artifacts.require('LolTokenSale')
contract(LolTokenSale,function(accounts){
    let TokenSalecontractInstance //LolTokenSale
    let TokenContractInstance   //LolToken
    let tokenPrice=1000000000000000 //token price in wei
    let numTokens=1000 //tokens to be purchased by the buyer
    let tokensAvailable=750000 //tokens made available for sale (sent to LolTokenSale's contract address)
    let buyer=accounts[1]
    it('Checks the initial values of the contract',function(){
        return LolTokenSale.deployed().then(function(instance){
            TokenSalecontractInstance=instance
            // return TokenSalecontractInstance.admin\
            //admin is not tested as it will expose the address of the admin
        // }).then(function(address){
        //     console.log(address)
        //     assert.notEqual(address,0x0,'Admin address was not assigned')
            return TokenSalecontractInstance.tokenContract()
            //returns the address of  LolToken contract
        }).then(function(address){
            assert.notEqual(address,0x0,'LolToken contract address was not assigned')
            return TokenSalecontractInstance.tokenPrice()
        }).then(function(price){
            assert.equal(price.toNumber(),tokenPrice,'LolToken price value does not match')
        })
    })
    it('Checks the buying functionality of the contract',function(){
        return LolToken.deployed().then(function(instance){
            //LolToken was deployed before LolTokenSale
            TokenContractInstance=instance
            return LolTokenSale.deployed()
        }).then(function(instance){
            //LolTokenSale was deployed after LolToken
            TokenSalecontractInstance=instance
            return TokenContractInstance.transfer(TokenSalecontractInstance.address,tokensAvailable,{from:accounts[0]})
            //transferring tokens to the LolTokenSale contract for other people to buy
        }).then(function(receipt){
            return TokenSalecontractInstance.buyTokens(numTokens,{from:buyer,value:tokenPrice*numTokens})
            //tokens were being purchased by the buyer
        }).then(function(receipt){
            //Sell event testing
            assert.equal(receipt.logs.length,1,'Did not trigger any event')
            assert.equal(receipt.logs[0].event,'Sell','Sell event was not triggered')
            assert.equal(receipt.logs[0].args._buyer,buyer,'Buyer did not match')
            assert.equal(receipt.logs[0].args._numberOfTokens.toNumber(),numTokens,'Number of tokens did not match')
            return TokenSalecontractInstance.tokenSold()
            //keeping track of how much tokens are sold untill now
        }).then(function(sold){
            assert.equal(sold.toNumber(),numTokens,'Tokens sold did not increase')
            return TokenContractInstance.balanceOf(buyer)
            //checking the balance of buyer after the purchase of tokens
        }).then(function(balance){
            assert.equal(balance.toNumber(),numTokens,'Buyer did not get the desired amount of tokens')
            return TokenSalecontractInstance.buyTokens(numTokens,{from:buyer,value:10})
            //trying to make the purchase with less value
        }).then(assert.fail).catch(function(error){
            // console.log(error)
            assert(error.message.toString().indexOf('revert')>=0,'insufficient value to buy the funds')
            return TokenSalecontractInstance.buyTokens(99999999,{from:buyer,value:tokenPrice*numTokens})
            //trying to purchase more tokens than available
        }).then(assert.fail).catch(function(error){
            // console.log(error)
            assert(error.message.toString().indexOf('revert')>=0,'token limit exceeded')
        })
    })
    it('checks for the end of token sale',function(){
        return LolToken.deployed().then(function(instance){
            TokenContractInstance=instance
            return LolTokenSale.deployed()
        }).then(function(instance){
            TokenSalecontractInstance=instance
            return TokenSalecontractInstance.endSale.call({from:accounts[2]})
            //trying to end token sale other than admin
        }).then(assert.fail).catch(function(error){
            assert(error.message.toString().indexOf('revert'),'Should be called by admin only')
            return TokenSalecontractInstance.endSale({from:accounts[0]})
            //using admin to end the token sale
        }).then(function(receipt){
            //checking balance of LolTokenSale contract after the sale has ended
            return TokenContractInstance.balanceOf(TokenSalecontractInstance.address)
        }).then(function(balance){
            // console.log(balance.toNumber())
            assert.equal(balance.toNumber(),0,'Balance of contract did not decrease')
        //     return TokenSalecontractInstance.tokenPrice()
        // }).then(function(price){
            //it is not possible to check any function related to tokenSaleContractInstance(tokensale contract) after the selfdestruct function has been called
        //     assert.equal(price.toNumber(),0,'Contract was not destroyed')
        })
    })
})
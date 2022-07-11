const LolToken=artifacts.require('LolToken')
const LolTokenSale=artifacts.require('LolTokenSale')
contract(LolTokenSale,function(accounts){
    let TokenSalecontractInstance
    let TokenContractInstance
    let tokenPrice=1000000000000000
    let numTokens=1000
    let tokensAvailable=750000 //1000000
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
            TokenContractInstance=instance
            return LolTokenSale.deployed()
        }).then(function(instance){
            TokenSalecontractInstance=instance
            return TokenContractInstance.transfer(TokenSalecontractInstance.address,tokensAvailable,{from:accounts[0]})
        }).then(function(receipt){
            return TokenSalecontractInstance.buyTokens(numTokens,{from:buyer,value:tokenPrice*numTokens})
        }).then(function(receipt){
            assert.equal(receipt.logs.length,1,'Did not trigger any event')
            assert.equal(receipt.logs[0].event,'Sell','Sell event was not triggered')
            assert.equal(receipt.logs[0].args._buyer,buyer,'Buyer did not match')
            assert.equal(receipt.logs[0].args._numberOfTokens.toNumber(),numTokens,'Number of tokens did not match')
            return TokenSalecontractInstance.tokenSold()
        }).then(function(sold){
            assert.equal(sold.toNumber(),numTokens,'Tokens sold did not increase')
            return TokenContractInstance.balanceOf(buyer)
        }).then(function(balance){
            assert.equal(balance.toNumber(),numTokens,'Buyer did not get the desired amount of tokens')
            return TokenSalecontractInstance.buyTokens(numTokens,{from:buyer,value:10})
        }).then(assert.fail).catch(function(error){
            // console.log(error)
            assert(error.message.toString().indexOf('revert')>=0,'insufficient value to buy the funds')
            return TokenSalecontractInstance.buyTokens(99999999,{from:buyer,value:tokenPrice*numTokens})
        }).then(assert.fail).catch(function(error){
            // console.log(error)
            assert(error.message.toString().indexOf('revert')>=0,'token limit exceeded')
        })
    })
})
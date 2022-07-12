App={
    web3Provider:null,
    contracts:{},
    account:'0x0',
    loading:false,
    tokenPrice:1000000000000000,
    tokenSold:0,
    tokensAvailable:750000,
    init:function(){
        console.log('App is running!')
    },
    //Setting a provider for web3
    initWeb3:function(){
        if(typeof web3 !==undefined){
            //If web3 instance is already provided by metamask
            App.web3Provider=web3.currentProvider
            web3=new Web3(web3.currentProvider)
        }else{
            //specify default instance is no web3 instance provided
            App.web3Provider=new Web3.providers.HttpProvider('http://localhost:7545')
            web3=new Web3(App.web3Provider)
        }
        return App.initContracts()
    },
    //Initializing contracts to interact with our contracts
    initContracts:function(){
        //LolTokenSale.json is exposed in the root directory of our project with the help of browser-sync 
        $.getJSON('LolTokenSale.json',function(lolTokenSale){
            // console.log('inside init contracts')
            App.contracts.LolTokenSale=TruffleContract(lolTokenSale)
            App.contracts.LolTokenSale.setProvider(App.web3Provider)
            App.contracts.LolTokenSale.deployed().then(function(lolTokenSale){
                console.log("LolTokenSale contract address: ",lolTokenSale.address)
            })
        }).done(function(){
            $.getJSON('LolToken.json',function(lolToken){
                App.contracts.LolToken=TruffleContract(lolToken)
                App.contracts.LolToken.setProvider(App.web3Provider)
                App.contracts.LolToken.deployed().then(function(lolToken){
                    console.log("LolToken contract address: ",lolToken.address)
                })
    
                App.listenForEvents()

                return App.render()
            })
        })
    },
    listenForEvents:function(){
        App.contracts.LolTokenSale.deployed().then(function(instance){
            instance.Sell({},{
                formBlock:0,
                toBlock:'latest'
            }).watch(function(error,event){
                console.log('event triggered',event)
                App.render()
            })
        })
    },
    render:function(){
        if(App.loading){
            return;
        }
        App.loading=true;
        let loader=$('#loader')
        let content=$('#content')

        loader.show()
        content.hide()
        //metamask needs to be connected to current site to access accounts
        web3.eth.getAccounts(function(err,account){
            if(err===null){
                console.log(account)
                App.account=account
                $('#accountAddress').html("Your Account: "+account)
            }
        })
        //LolTokenSale contract is loaded
        App.contracts.LolTokenSale.deployed().then(function(instance){    
            lolTokenSaleInstance=instance
            return lolTokenSaleInstance.tokenPrice()
        }).then(function(price){
            App.tokenPrice=price
            $('.token-price').html(web3.fromWei(App.tokenPrice,'ether').toNumber())
            return lolTokenSaleInstance.tokenSold()
        }).then(function(tokenSold){
            App.tokenSold=tokenSold
            $('.tokens-sold').html(App.tokenSold.toNumber())
            $('.tokens-available').html(App.tokensAvailable)
            let progressPercent=(App.tokenSold.toNumber()/App.tokensAvailable)*100
            $('#progress').css('width',progressPercent+'%')
            return App.contracts.LolToken.deployed()
        }).then(function(instance){
            lolTokenInstance=instance
            return lolTokenInstance.balanceOf(App.account)
        }).then(function(balance){
            $('.lol-balance').html(balance.toNumber())
            
            App.loading=false
            loader.hide()
            content.show()
        })
    },
    buyTokens:function(){
        $('#content').hide()
        $('#loader').show()
        let numberOfTokens=$('#numberOfTokens').val()
        App.contracts.LolTokenSale.deployed().then(function(instance){
            lolTokenSaleInstance=instance
            console.log(App.account)
            return lolTokenSaleInstance.buyTokens(numberOfTokens,{
                from:App.account.toString(), //account must be of string type
                value:App.tokenPrice.toNumber()*numberOfTokens,
                gas:500000
            })
        }).then(function(receipt){
            console.log('Tokens purchasing')
            $('.form').trigger('reset')
            //wait for sell event
        })
    }
}
$(function(){
    $(window).load(function(){
        App.init()
        App.initWeb3()
    })
})

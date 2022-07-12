App={
    web3Provider:null,
    contracts:{},
    account:'0x0',
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
                return App.render()
            })
        })
    },
    render:function(){
        //metamask needs to be connected to current site to access accounts
        web3.eth.getAccounts(function(err,account){
            if(err===null){
                console.log(account)
                App.account=account
                $('#accountAddress').html("Your Account: "+account)
            }
        })
    }
}
$(function(){
    $(window).load(function(){
        App.init()
        App.initWeb3()
    })
})

// JQuery way of writing functions and properties
App={
    // keep track of the web3provider
    web3Provider:null,
    //keep track of our contracts
    contracts:{},
    //keep track of current account address
    account:'0x0',
    //keep track of loading state of our app
    loading:false,
    //keep track of token price
    tokenPrice:1000000000000000,
    tokenSold:0,
    tokensAvailable:750000,
    init:function(){
        console.log('App is running!')
        return App.initWeb3()
    },
    //Setting a provider for web3
    initWeb3:function(){
        $('#loader').hide()
        $('#content').hide()
        $('#buttonDisplay').show()
        const btn=document.getElementById('connectButton')
        let interval
        if (typeof window.ethereum !== 'undefined') {
            //If web3 instance is already provided by metamask
            if(interval!==undefined){
                clearInterval(interval)
            }
            console.log('metamask')
            //Click to connect to metamask
            btn.innerText='Connect to MetaMask!'
            const onClickConnect = async () => {
                console.log('button clicked')
            try {
                // Will open the MetaMask UI
                // You should disable this button while the request is pending!
                btn.disabled=true
                await ethereum.request({ method: 'eth_requestAccounts' });
            } catch (error) {
                console.error(error);
            }
            }
            btn.addEventListener('click',function(){
                onClickConnect().then(function(){
                    App.web3Provider=web3.currentProvider
                    web3=new Web3(web3.currentProvider)
                    return App.initContracts()
                })
            })
        }else{
            //specify default instance if no web3 instance provided
            //default instace of provider is that of Gnache
            // App.web3Provider=new Web3.providers.HttpProvider('http://localhost:7545')
            // web3=new Web3(App.web3Provider)
            btn.innerText='Click here to install MetaMask!'
            btn.onclick=function(){
                window.open('https://chrome.google.com/webstore/detail/metamask/nkbihfbeogaeaoehlefnkodbefgpgknn?hl=en')
            }
            console.log(interval)
            interval=setInterval(function(){
                window.location.reload()
            },5000)
        }
        
    },
    //Initializing contracts to interact with our contracts
    initContracts:function(){
        //LolTokenSale.json is exposed in the root directory of our project with the help of browser-sync 
        $.getJSON('LolTokenSale.json',function(lolTokenSale){
            // console.log('inside init contracts')
            //set LolTokenSale using truffle-contract
            App.contracts.LolTokenSale=TruffleContract(lolTokenSale)
            //Setting the web3provider for our LolTokenSale Contract
            App.contracts.LolTokenSale.setProvider(App.web3Provider)
            //It is similar to tests done using truffle
            App.contracts.LolTokenSale.deployed().then(function(lolTokenSale){
                console.log("LolTokenSale contract address: ",lolTokenSale.address)
            })
        }).done(function(){ //promise chain
            $.getJSON('LolToken.json',function(lolToken){
                // repeating the above steps for LolToken contract
                App.contracts.LolToken=TruffleContract(lolToken)
                App.contracts.LolToken.setProvider(App.web3Provider)
                App.contracts.LolToken.deployed().then(function(lolToken){
                    console.log("LolToken contract address: ",lolToken.address)
                })
                
                //listening for the Sell event 
                App.listenForEvents()
                window.ethereum.on('accountsChanged', function (accounts) {
                    App.account=accounts[0]
                    App.render()
                // Time to reload your interface with accounts[0]!
                })
                //rendering the changes to the client side
                return App.render()
            })
        })
    },
    listenForEvents:function(){
        App.contracts.LolTokenSale.deployed().then(function(instance){
            //watch for Sell event present in LolTokenSale contract
            //first argument object is to specify the filters for our event(if necessary)
            instance.Sell({},{
                // we are listening from the 0th block to the latest block
                fromBlock:0,
                toBlock:'latest'
            }).watch(function(error,event){ //watch this event
                console.log('event triggered',event)
                //rendering the page again to see the changes
                App.render()
            })
        })
    },
    render:function(){
        if(App.loading){
            //If the app is loading don't run the render function
            return;
        }
        App.loading=true; //Loading state equals true until all the promises 
        // from the contracts are resolved
        $('#buttonDisplay').hide()
        let loader=$('#loader')
        let content=$('#content')
        $('#numberOfTokens').val('1') //reset number of tokens in the form input

        //content is hidden when the promises are resolved
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
        //Done in same fashion as in truffle tests
        App.contracts.LolTokenSale.deployed().then(function(instance){    
            lolTokenSaleInstance=instance
            console.log(lolTokenSaleInstance)
            return lolTokenSaleInstance.tokenPrice()
        }).then(function(price){
            //Updating the token price that comes from LolTokenSale contract
            App.tokenPrice=price.toNumber()
            console.log(price.toNumber())
            //1.printing the token price in ether on the frontend using 
            //web3.fromWei()
            //2.we also need to convert tokenPrice to Number in order to display it 
            // on the client side
            $('.token-price').html(web3.fromWei(App.tokenPrice,'ether'))
            return lolTokenSaleInstance.tokenSold()
        }).then(function(tokenSold){
            //Updating tokenSold and tokensAvailable
            App.tokenSold=tokenSold
            $('.tokens-sold').html(App.tokenSold.toNumber())
            $('.tokens-available').html(App.tokensAvailable)
            //Adjusting the sold-progress bar with css width
            let progressPercent=(App.tokenSold.toNumber()/App.tokensAvailable)*100
            $('#progress').css('width',progressPercent+'%')
            //Loading LolToken contract
            return App.contracts.LolToken.deployed()
        }).then(function(instance){
            lolTokenInstance=instance
            return lolTokenInstance.balanceOf(App.account)
        }).then(function(balance){
            //Update the tokens that the current account holds
            $('.lol-balance').html(balance.toNumber())
            
            //Run these when all asynchronous functions are resolved
            App.loading=false
            loader.hide()
            content.show()
        })
    },
    buyTokens:function(){
        //hide or show the content
        $('#content').hide()
        $('#loader').show()
        //getting the number of tokens to buy form client side using form input
        let numberOfTokens=$('#numberOfTokens').val()
        App.contracts.LolTokenSale.deployed().then(function(instance){
            lolTokenSaleInstance=instance
            // console.log(App.account)
            return lolTokenSaleInstance.buyTokens(numberOfTokens,{
                //metadata for the buyTokens() function call
                from:App.account.toString(), //account must be of string type
                value:App.tokenPrice*numberOfTokens,
                gas:500000
            })
        }).then(function(receipt){
            console.log('Tokens bought!')
            //wait for sell event
            // $('#content').show()
            // $('#loader').hide()
        }).catch(function(err){
            console.log(err)
            if(err.code===4001){
                App.render()
            }
        })
    }
}
$(function(){
    //whenever the window loads call the functions present in the callback function
    $(window).load(function(){
        App.init()
    })
})

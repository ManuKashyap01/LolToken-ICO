const LolToken = artifacts.require("LolToken");
//artifacts create a contract abstraction that truffle can use to run in a javascript runtime environment
//It enables us to interact with our contract and for testing purposes
module.exports = function (deployer) {
  deployer.deploy(LolToken);
};
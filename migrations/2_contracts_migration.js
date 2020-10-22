const OracleClient = artifacts.require('OracleClient')
const NFTwe = artifacts.require('NFTwe')
const Tweether = artifacts.require('Tweether')

module.exports = async (deployer, network, [defaultAccount]) => {
    
    await deployer.deploy(NFTwe, {from: defaultAccount})
    const nftwe = await NFTwe.deployed()
    // This allows to test from the non-governance, 
    // you'll have to update it with the actual gov contract when you deploy the whole thing
    // like tweether.deployed.address or something
    await deployer.deploy(OracleClient, {from: defaultAccount})
    const oracleclient = await OracleClient.deployed()

    await deployer.deploy(
        Tweether,
        oracleclient.address,
        nftwe.address,
        "5000000000000000000",
        {from: defaultAccount}
    )
    const tweether = await Tweether.deployed()

    await oracleclient.setGovernance(tweether.address, {from: defaultAccount})
}

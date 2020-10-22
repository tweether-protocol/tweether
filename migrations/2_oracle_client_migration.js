const OracleClient = artifacts.require('OracleClient')

module.exports = async (deployer, network, [defaultAccount]) => {
    // This allows to test from the non-governance, you'll have to update it with the actual gov contract when you deploy the whole thing
    // like tweether.deployed.address or something
    await deployer.deploy(OracleClient)
    const oracleclient = await OracleClient.deployed()
    await oracleclient.setGovernance(defaultAccount)
}

const OracleClient = artifacts.require('OracleClient')

module.exports = async (deployer, network, [defaultAccount]) => {
    // This allows to test from non-governance
    await deployer.deploy(OracleClient, defaultAccount)
}

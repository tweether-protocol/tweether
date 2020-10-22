const OracleClient = artifacts.require('OracleClient')
const LinkTokenInterface = artifacts.require('LinkTokenInterface')

// 3 LINK
const payment = process.env.TRUFFLE_CL_BOX_PAYMENT || '3000000000000000000'

module.exports = async callback => {
    try {
        const oracleclient = await OracleClient.deployed()
        const tokenAddress = await oracleclient.paymentTokenAddress()
        const token = await LinkTokenInterface.at(tokenAddress)
        console.log('Funding contract:', oracleclient.address)
        const tx = await token.transfer(oracleclient.address, payment)
        callback(tx.tx)
    } catch (err) {
        callback(err)
    }
}

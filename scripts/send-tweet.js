const OracleClient = artifacts.require('OracleClient')

const STATUS = "Watch out for the GHOSTS! https://www.youtube.com/watch?v=awkUfIjl1R0&list=RD_CpWBXBAk1k&index=4"

module.exports = async callback => {
    try {
        const oracleclient = await OracleClient.deployed()
        console.log('Sending Tweet:', oracleclient.address)
        const response = await oracleclient.sendTweet(STATUS)

        callback(response.tx)
    } catch (err) {
        callback(err)
    }
}

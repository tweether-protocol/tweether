const OracleClient = artifacts.require('OracleClient')

const STATUS = "It's raining not so bad jams https://www.youtube.com/watch?v=fRl6fb4LBIg&list=RDBwBK2xkjaSU&index=8"

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

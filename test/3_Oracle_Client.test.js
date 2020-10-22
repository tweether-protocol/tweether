const Tweether = artifacts.require('Tweether')
const MockERC20 = artifacts.require('MockERC20')
const MockOracleClient = artifacts.require('MockOracleClient')
const web3 = require('web3')

require('chai').use(require('chai-as-promised')).should()

const EVM_ORACLE_REVERT = 'VM Exception while processing transaction: revert Source must be the oracle of the request'
const EVM_GOVERNANCE_REVERT = 'VM Exception while processing transaction: revert Source must be the governance contract'

contract('OracleClient', (accounts) => {
  const [deployer, mockTweetherGovernance, mocknftweaddress] = accounts
  let link, oracleclient

  beforeEach(async () => {
    link = await MockERC20.new({ from: deployer })
    oracleclient = await MockOracleClient.new(link.address, { from: deployer })
  })

  describe('tweet sending', async () => {
    it('should update the governance status', async () => {
      let startedGovernanceSetStatus = await oracleclient.governanceSet()
      startedGovernanceSetStatus.should.equal(false)
      await oracleclient.setGovernance(mockTweetherGovernance)
      let endedGovernanceSetStatus = await oracleclient.governanceSet()
      endedGovernanceSetStatus.should.equal(true)
    })
    it('should not be able to update twice', async () => {
      await oracleclient.setGovernance(mockTweetherGovernance)
      await oracleclient.setGovernance(mockTweetherGovernance).should.be.rejected
    })
    it('should not be able to send a tweet from non-governance contract', async () => {
      let status = "Let's try a status"
      const failureTweet = await oracleclient.sendTweet(status).should.be.rejectedWith(EVM_GOVERNANCE_REVERT)
      //let oracleclientLog = successfulTweet.logs[0]
    })
    it('should be able to send from tweet governance', async () => {
      let status = "Let's try another status"
      await oracleclient.setGovernance(mockTweetherGovernance)
      const successTweet = await oracleclient.sendTweet(status, { from: mockTweetherGovernance }).should.be.fulfilled
      // let oracleclientLog = successfulTweet.logs[0]
    })
    it("Reverts if the chainlink node isn't the one to respond", async () => {
      await oracleclient.returnTweetId(web3.utils.toHex('f'), 7).should.be.rejectedWith(EVM_ORACLE_REVERT)
    })
  })
})

const Tweether = artifacts.require('Tweether')
const MockERC20 = artifacts.require('MockERC20')
const MockOracle = artifacts.require('MockOracle')

require('chai').use(require('chai-as-promised')).should()

const EVM_REVERT = 'VM Exception while processing transaction: revert'

contract('Tweether', (accounts) => {
    const [deployer] = accounts

    WAD = 10**18

    let link, oracle, tweether
    const denominator = 5 * WAD

    beforeEach(async () => {
        link = await MockERC20.new({ from: deployer })
        oracle = await MockOracle.new(link.address, { from: deployer })
        tweether = await Tweether.new(oracle.address, denominator.toString(), { from: deployer })
    })

    describe('deployment', async () => {
        it('sets the correct state variables', async () => {
            let linkAddress = await tweether.link()
            linkAddress.should.equal(link.address)
            let oracleAddress = await tweether.oracle()
            oracleAddress.should.equal(oracle.address)
            let denom = await tweether.tweetherDenominator()
            denom.toString().should.equal(denominator.toString())
        })

        it('sets the correct oracle values', async () => {
            let oracleCostResult = await tweether.oracleCost()
            let {0: price, 1: decimals} = oracleCostResult

            let actualOracleCost = await oracle.price()
            let {0: expectedPrice, 1: expectedDecimals} = actualOracleCost

            price.toString().should.equal(expectedPrice.toString())
            decimals.toString().should.equal(expectedDecimals.toString())
        })

        it('sets the correct LINK balance at 0', async () => {
            let linkBalanceResult = await tweether.linkBalance()
            linkBalanceResult.toString().should.equal("0")
        })

        it('reverts TWE value calculation due to division by zero', async () => {
            let tweValueResult = await tweether.tweValueInLink()
                .should.be.rejectedWith(EVM_REVERT)
        })
    })
})
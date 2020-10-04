const Tweether = artifacts.require('Tweether')
const MockERC20 = artifacts.require('MockERC20')
const MockOracle = artifacts.require('MockOracle')

require('chai').use(require('chai-as-promised')).should()

const EVM_REVERT = 'VM Exception while processing transaction: revert'

contract('Tweether', (accounts) => {
  const [deployer] = accounts

  WAD = 10 ** 18

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
      let { 0: price, 1: decimals } = oracleCostResult

      let actualOracleCost = await oracle.price()
      let { 0: expectedPrice, 1: expectedDecimals } = actualOracleCost

      price.toString().should.equal(expectedPrice.toString())
      decimals.toString().should.equal(expectedDecimals.toString())
    })

    it('sets the correct LINK balance at 0', async () => {
      let linkBalanceResult = await tweether.linkBalance()
      linkBalanceResult.toString().should.equal('0')
    })

    it('reverts TWE value calculation due to division by zero', async () => {
      await tweether.tweValueInLink().should.be.rejectedWith(EVM_REVERT)
    })

    it('sends mock LINK to the deployer', async () => {
      let linkBalanceResult = await link.balanceOf(deployer)
      let expectedMintAmount = 100 * WAD
      linkBalanceResult.toString().should.equal(expectedMintAmount.toString())
    })
  })

  describe('minting and burning', async () => {
    it('mints TWE for LINK 1:1 before any proposals or tweets', async () => {
      let linkSuppliedAmount = 4 * WAD
      let deployerInitialLinkBalance = await link.balanceOf(deployer)
      let deployerInitialTweBalance = await tweether.balanceOf(deployer)
      let tweetherInitialTotalSupply = await tweether.totalSupply()
      let tweetherInitialLinkBalance = await tweether.linkBalance()

      //Cover the first ever mint
      await link.approve(tweether.address, linkSuppliedAmount.toString(), { from: deployer })
      await tweether.mint(linkSuppliedAmount.toString(), { from: deployer })

      let deployerFirstLinkBalance = await link.balanceOf(deployer)
      let deployerFirstTweBalance = await tweether.balanceOf(deployer)
      let tweetherFirstTotalSupply = await tweether.totalSupply()
      let tweetherFirstLinkBalance = await tweether.linkBalance()

      deployerFirstLinkBalance.toString().should.equal((deployerInitialLinkBalance - linkSuppliedAmount).toString())
      deployerFirstTweBalance
        .toString()
        .should.equal((linkSuppliedAmount + parseInt(deployerInitialTweBalance)).toString())
      tweetherFirstTotalSupply
        .toString()
        .should.equal((linkSuppliedAmount + parseInt(tweetherInitialTotalSupply)).toString())
      tweetherFirstLinkBalance
        .toString()
        .should.equal((linkSuppliedAmount + parseInt(tweetherInitialLinkBalance)).toString())

      // Cover mints after the first ever mint
      await link.approve(tweether.address, linkSuppliedAmount.toString(), { from: deployer })
      await tweether.mint(linkSuppliedAmount.toString(), { from: deployer })

      let deployerSecondLinkBalance = await link.balanceOf(deployer)
      let deployerSecondTweBalance = await tweether.balanceOf(deployer)
      let tweetherSecondTotalSupply = await tweether.totalSupply()
      let tweetherSecondLinkBalance = await tweether.linkBalance()

      deployerSecondLinkBalance.toString().should.equal((deployerFirstLinkBalance - linkSuppliedAmount).toString())
      deployerSecondTweBalance
        .toString()
        .should.equal((linkSuppliedAmount * 2 + parseInt(deployerInitialTweBalance)).toString())
      tweetherSecondTotalSupply
        .toString()
        .should.equal((linkSuppliedAmount * 2 + parseInt(tweetherInitialTotalSupply)).toString())
      tweetherSecondLinkBalance
        .toString()
        .should.equal((linkSuppliedAmount * 2 + parseInt(tweetherInitialLinkBalance)).toString())
    })

    it('burns TWE for LINK 1:1 before any proposals or tweets', async () => {
      let linkSuppliedAmount = 4 * WAD
      let burnAmount = linkSuppliedAmount / 2
      await link.approve(tweether.address, linkSuppliedAmount.toString(), { from: deployer })
      await tweether.mint(linkSuppliedAmount.toString(), { from: deployer })

      let deployerInitialLinkBalance = await link.balanceOf(deployer)
      let deployerInitialTweBalance = await tweether.balanceOf(deployer)
      let tweetherInitialTotalSupply = await tweether.totalSupply()
      let tweetherInitialLinkBalance = await tweether.linkBalance()

      await tweether.burn(burnAmount.toString(), { from: deployer })

      let deployerAfterLinkBalance = await link.balanceOf(deployer)
      let deployerAfterTweBalance = await tweether.balanceOf(deployer)
      let tweetherAfterTotalSupply = await tweether.totalSupply()
      let tweetherAfterLinkBalance = await tweether.linkBalance()

      deployerAfterLinkBalance
        .toString()
        .should.equal((parseInt(deployerInitialLinkBalance) + parseInt(burnAmount)).toString())
      deployerAfterTweBalance
        .toString()
        .should.equal((parseInt(deployerInitialTweBalance) - parseInt(burnAmount)).toString())
      tweetherAfterTotalSupply
        .toString()
        .should.equal((parseInt(tweetherInitialTotalSupply) - parseInt(burnAmount)).toString())
      tweetherAfterLinkBalance
        .toString()
        .should.equal((parseInt(tweetherInitialLinkBalance) - parseInt(burnAmount)).toString())
    })
  })
})

const Tweether = artifacts.require('Tweether');
const MockERC20 = artifacts.require('MockERC20');
const MockOracle = artifacts.require('MockOracle');

require('chai').use(require('chai-as-promised')).should()

contract('Tweether', (accounts) => {
    const [deployer] = accounts

    let link, oracle, tweether
    const denominator = 5;

    beforeEach(async () => {
        link = await MockERC20.new({ from: deployer });
        oracle = await MockOracle.new(link.address, { from: deployer });
        tweether = await Tweether.new(oracle.address, denominator, { from: deployer });
    })

    describe('deployment', async () => {
        it('sets the correct state variables', async () => {
            let linkAddress = await tweether.link();
            linkAddress.should.equal(link.address);
            let oracleAddress = await tweether.oracle();
            oracleAddress.should.equal(oracle.address);
            let denom = await tweether.tweetherDenominator();
            denom.toString().should.equal(denominator.toString());
        })
    })
})
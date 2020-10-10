const MockTweetContent = artifacts.require('MockTweetContent')

require('chai').use(require('chai-as-promised')).should()

contract('MockTweetContent', (accounts) => {
  const [deployer] = accounts

  let mock

  beforeEach(async () => {
    mock = await MockTweetContent.new({ from: deployer })
  })

  describe('tweet size', async () => {
    it('returns true for a tweet under 280 chars', async () => {
      let tweetContent = 'This is a small tweet'
      let response = await mock.checkLength(tweetContent)
      response.should.equal(true)
    })

    it('returns false for a tweet over 280 chars', async () => {
      // 281 chars
      let tweetContent =
        'trefdsgfdsg fldsg fdsvf dsf dsgf dg fdsvf dsgf dsv fdsgf dsg fd svf fdsgfdsgfd sgfdsgdfs dsg f dsgf dsg fd svf dsgf dsg fvds vf dg fdsvc xz fd b fgdsv fd sgf d vfds vf dsg fds gf dv fd sgf dsv fd gf dsg fds v xv s gfd svf dsg fd sg sgf dv fd gfrewqrewqrewqrewqrewqrewqrewqr sgf dsg'
      let response = await mock.checkLength(tweetContent)
      response.should.equal(false)
    })
  })
})

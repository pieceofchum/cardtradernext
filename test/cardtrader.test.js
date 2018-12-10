const assert = require('assert');
const ganache = require('ganache-cli');
const Web3 = require('web3');
const web3 = new Web3(ganache.provider());

const compiledFactory = require('../ethereum/build/CardSeriesFactory');
const compiledCardSeries = require('../ethereum/build/CardSeries');

let accounts;
let factory;
let cardSeriesAddress;
let cardSeries;

beforeEach(async () => {
  accounts = await web3.eth.getAccounts();

  factory = await new web3.eth.Contract(JSON.parse(compiledFactory.interface))
    .deploy({data: compiledFactory.bytecode})
    .send({from: accounts[0], gas: '4712388'});

  await factory.methods.createCardSeries(1, "Test Series Name", "Test Series Description").send({
    from: accounts[0],
    gas: '4712388'
  });

  [cardSeriesAddress] = await factory.methods.getDeployedCardSeries().call();

  cardSeries = await new web3.eth.Contract(
    JSON.parse(compiledCardSeries.interface),
    cardSeriesAddress
  );
});

describe('Card Series', () => {
  it('deploys a factory and a card series', () => {
    assert.ok(factory.options.address);
    assert.ok(cardSeries.options.address);
  });


  it('marks caller as the card series manager', async () => {
    const manager = await cardSeries.methods.manager().call();
    assert.equal(accounts[0], manager);
  });


  it('allows a manager to add cards to a card series', async () => {
    await cardSeries.methods.addCard(1, accounts[0]).send({
      from: accounts[0],
      gas: '1000000'
    });

    const cardID = await cardSeries.methods.getCardsByOwner(accounts[0]).call();
    assert.equal(1, cardID);
  });

  it("doesn't allow a card to be added by a non-manager", async () => {
    try {
      await cardSeries.methods.addCard(2, accounts[1]).send({
        from: accounts[1],
        gas: '1000000'
      });
      assert(false);
    }catch(err){
      assert(err);
    }
  });

  it("doesn't allow a duplicate card to be added", async () => {
    try {
      await cardSeries.methods.addCard(1, accounts[0]).send({
        from: accounts[0],
        gas: '1000000'
      })

      await cardSeries.methods.addCard(1, accounts[0]).send({
        from: accounts[0],
        gas: '1000000'
      });
      assert(false);
    }catch(err){
      assert(err);
    }
  });

  it('allows a second card to be added to new account', async () => {
    await cardSeries.methods.addCard(2, accounts[1]).send({
      from: accounts[0],
      gas: '1000000'
    });

    const cardID = await cardSeries.methods.getCardsByOwner(accounts[1]).call();
    assert.equal(2, cardID);
  });

  it('returns a list of cards', async () => {
    await cardSeries.methods.addCard(1, accounts[0]).send({
      from: accounts[0],
      gas: '1000000'
    })

    await cardSeries.methods.addCard(2, accounts[1]).send({
      from: accounts[0],
      gas: '1000000'
    });

    const cards = await cardSeries.methods.getAllCards().call();
    const cardCount = cards.length;
    assert.equal(2, cardCount);
  });

  it('allows a trade request to be made', async () => {
    await cardSeries.methods.addCard(1, accounts[0]).send({
      from: accounts[0],
      gas: '1000000'
    })

    await cardSeries.methods.addCard(2, accounts[1]).send({
      from: accounts[0],
      gas: '1000000'
    });

    await cardSeries.methods.createTradeRequest(1, 2).send({
      from: accounts[0],
      gas: '1000000'
    });

    const tradeRequests = cardSeries.methods.getAllTradeRequests().call();
    assert(tradeRequests);
  });
});


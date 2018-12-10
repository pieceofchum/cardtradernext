pragma solidity ^0.4.25;

// Card Series Factory is used by trading
// card manufacturers to create card series
// the stores a specific collection of trading
// cards. A manufacturer may create many different
// card series over time.
contract CardSeriesFactory {
    // variable to store a list of card series
    // contracts address created by this factory
    address[] private _deployedCardSeries;

    // variable to store a list of card series
    // contracts series id created by this factory
    mapping (uint => bool) private _deployedCardSeriesID;

    // Factory function to create card series contracts
    function createCardSeries(uint seriesID, string seriesName,
                string seriesDescription) public {
        require(!_deployedCardSeriesID[seriesID]);
        address newCardSeries = new CardSeries(seriesID, seriesName,
                                            seriesDescription, msg.sender);
        _deployedCardSeries.push(newCardSeries);
    }

    // Function to return a list of card series contract
    // addresses created and reference by this factory
    function getDeployedCardSeries() public view returns(address[]) {
        return _deployedCardSeries;
    }
}

// Card Series contracts are contracts that
// store cards and trade requests. A manager
// will add cards to a card series contract
// and associate an owner upon creation.
// Owners can create trade requests to
// trade any of their cards for another
// card.
contract CardSeries {
    // Trade Request have 4 possible status, if
    // the request is approved the status will
    // be Completed after the transaction
    enum TradeStatus { AwaitingApproval, Approved, Declined, Completed }

    // TradeRequest structure holds the state
    // to suppor the trade request workflow.
    // owner1 is the owner requesting the TradeRequest
    // owner2 is the owner of the card owner1 wants to trade for
    // cardID1 is the card id of owner1's card
    // cardID2 is the card id of owner2's card
    // status status/stage of the trade request
    struct TradeRequest{
        address owner1;
        address owner2;
        uint cardID1;
        uint cardID2;
        TradeStatus status;
    }

    // structure to Store all the trade request keys
    // to support retrieving keys for a given owner
    struct TradeRequestKeys{
        bytes32[] keys;
        uint keyCount;
    }

    //mapping of key to the trade request
    //this variable is public in order to
    //return a TradeRequest structure
    //which is not supported for functions
    mapping (bytes32 => TradeRequest) public tradeRequestsByKey;

    //mapping of key to the trade request
    mapping (address => TradeRequestKeys) private _tradeRequestsByOwner;

    // Array of al trade requests in this series
    bytes32[] private _tradeRequests;

    //array of unique card id's
    uint[] private _cards;

    //mapping of unique card id's
    mapping (uint => bool) private _cardsByCardID;

    //mapping of card id's to owner
    mapping (uint => address) private _ownedCardsByCardID;

    //mapping of owner to all cards owned by them
    mapping (address => uint[]) private _cardsOwnedByAddress;

    //address of the manager of the contract
    address public manager;

    //a series id that identifies the card
    //campaign which all cards in this contract
    //are part of and can be externally linked
    uint private _seriesID;

    //Series Name is a human readable and
    //meaningful name for this series
    string private _seriesName;

    //A description of the series
    string private _seriesDescription;

    //Modifier to restrict some functions to the manager
    modifier restricted() {
        require(msg.sender == manager);
        _;
    }

    // Constructor used to create a new card series
    constructor(uint seriesID, string seriesName,
                        string seriesDescription, address creator)  public {
        manager = creator;
        _seriesID = seriesID;
        _seriesName = seriesName;
        _seriesDescription = seriesDescription;
    }

    // Function to create a trade request given the cards
    // to be traded, the caller must be the owner of card 1
    function createTradeRequest(uint cardID1, uint cardID2)
            public returns (bytes32) {

        // check that the owner of the card is also the caller
        require(msg.sender == getCardOwnerByCardID(cardID1));

        address owner1 = msg.sender;
        address owner2 = getCardOwnerByCardID(cardID2);

        // check that the trade request is for a card
        // no already owner by the caller
        require(owner1 != owner2);

        uint keyCount = _tradeRequests.length;

        // create a unique trade request key
        bytes32 key = keccak256(abi.encodePacked(owner1, cardID1, owner2, cardID2, keyCount));

        // creae a new trade request and iniialize with validated values
        TradeRequest memory newTradeRequest = TradeRequest({
            owner1: owner1,
            owner2: owner2,
            cardID1: cardID1,
            cardID2: cardID2,
            status: TradeStatus.AwaitingApproval
        });

        // add trade request to all lists
        tradeRequestsByKey[key] = newTradeRequest;
        _tradeRequestsByOwner[owner1].keys.push(key);
        _tradeRequestsByOwner[owner1].keyCount++;
        _tradeRequestsByOwner[owner2].keys.push(key);
        _tradeRequestsByOwner[owner2].keyCount++;
        _tradeRequests.push(key);

        return key;
    }

    // Function to approve a trade request given the
    // trader request key, the approver must be the
    // owner of card 2, this also completes the
    // trade by swapping the owners of the cards
    function approveTradeRequest(bytes32 key) public {
        TradeRequest storage tradeRequest = tradeRequestsByKey[key];
        address owner = msg.sender;

        // check that the owner of card 2 is the caller
        require(tradeRequest.owner2 == owner);

        tradeRequest.status = TradeStatus.Approved;
        completeTrade(tradeRequest);
    }

    // Function to decline a trade request given the
    // trade request key, the caller must be an owner
    // of one of the cards and status must not be
    // Completed to protect trade requests that have
    // already been complete from being marked declined
    function declineTradeRequest(bytes32 key) public {
        TradeRequest storage tradeRequest = tradeRequestsByKey[key];
        address owner = msg.sender;

        require(tradeRequest.status != TradeStatus.Completed);

        require((tradeRequest.owner2 == owner) ||
                (tradeRequest.owner1 == owner));

        tradeRequest.status = TradeStatus.Declined;
    }

    // Function that swaps the cards for an approved trade
    function completeTrade(TradeRequest storage tradeRequest) private returns (bool) {
          _ownedCardsByCardID[tradeRequest.cardID1] = tradeRequest.owner2;
          _ownedCardsByCardID[tradeRequest.cardID2] = tradeRequest.owner1;

          uint i = 0;

          uint[] storage owner1Cards = _cardsOwnedByAddress[tradeRequest.owner1];
          for(i = 0; i < owner1Cards.length; i++){
              if (owner1Cards[i] == tradeRequest.cardID1)
              {
                  owner1Cards[i] = tradeRequest.cardID2;
                  break;
              }
          }

        uint[] storage owner2Cards = _cardsOwnedByAddress[tradeRequest.owner2];
          for(i = 0; i < owner2Cards.length; i++){
              if (owner2Cards[i] == tradeRequest.cardID2)
              {
                  owner2Cards[i] = tradeRequest.cardID1;
                  break;
              }
          }

          tradeRequest.status = TradeStatus.Completed ;
    }

    // Function that is called by the manager of the card series
    // contract to add new cards to the contract and assign them
    // to owners of the cards, cannot add a card that has
    // already been added by card id
    function addCard(uint cardID, address owner) restricted public {

        // check that the manager is no adding a duplicate card
        require(!_cardsByCardID[cardID]);

        _ownedCardsByCardID[cardID] = owner;
        _cardsByCardID[cardID]=true;
        _cardsOwnedByAddress[owner].push(cardID);
        _cards.push(cardID);
    }

    // Function to return the trader request associated with an owner
    function getTradeRequestsByOwner(address ownerID) public view returns (bytes32[]) {
        return _tradeRequestsByOwner[ownerID].keys;
    }

    // Function to return all trade request keys associated with this card series contract
    function getAllTradeRequests() public view returns (bytes32[]) {
        return _tradeRequests;
    }

    // Function to return all cards id's associated with this card series contract
    function getAllCards() public view returns (uint[]) {
        return _cards;
    }

    // Function to return all cards ids associated a specific owner
    function getCardsByOwner(address ownerID) public view returns (uint[]) {
        return _cardsOwnedByAddress[ownerID];
    }

    // Function to return the owner of a card given a specific card id
    function getCardOwnerByCardID(uint cardID) public view returns (address) {
        return _ownedCardsByCardID[cardID];
    }

    // Function to return the series name
    function getSeriesName() public view returns (string) {
        return _seriesName;
    }

    // Function to return a summary of the card series contract
    function getSummary() public view returns (uint, string, string, uint, uint, address) {
         return(
          _seriesID,
          _seriesName,
          _seriesDescription,
          _cards.length,
          _tradeRequests.length,
          manager
        );
    }
}

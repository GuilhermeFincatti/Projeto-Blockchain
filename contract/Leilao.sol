// SPDX-License-Identifier: MIT
pragma solidity ^0.8.17;

// Importando proteções da OpenZeppelin
import "@openzeppelin/contracts/security/ReentrancyGuard.sol";
import "@openzeppelin/contracts/access/Ownable.sol";

contract Auction is ReentrancyGuard, Ownable {
    constructor() Ownable(msg.sender) {}

    // Estrutura do leilão
    struct AuctionItem {
        address seller;       // dono do item
        string description;   // descrição do item
        uint256 startTime;    // início do leilão
        uint256 endTime;      // fim do leilão
        uint256 highestBid;   // maior lance atual
        address highestBidder;// quem fez o maior lance
        bool ended;           // se o leilão terminou
    }

    // Lista de leilões
    mapping(uint256 => AuctionItem) public auctions;

    // Armazenando valores que devem ser reembolsados
    mapping(uint256 => mapping(address => uint256)) public pendingReturns;

    uint256 public nextAuctionId; // contador de IDs de leilões

    // Eventos
    event AuctionCreated(uint256 indexed auctionId, address indexed seller, uint256 startTime, uint256 endTime);
    event BidPlaced(uint256 indexed auctionId, address indexed bidder, uint256 amount);
    event AuctionEnded(uint256 indexed auctionId, address winner, uint256 amount);
    event Withdrawn(uint256 indexed auctionId, address indexed bidder, uint256 amount);

    // Criando um novo leilão
    function createAuction(
        string memory _description,
        uint256 _startTime,
        uint256 _endTime,
        uint256 _minBid
    ) external returns (uint256) {
        require(_endTime > _startTime, "Tempo invalido");
        require(_minBid > 0, "Lance minimo deve ser > 0");

        auctions[nextAuctionId] = AuctionItem({
            seller: msg.sender,
            description: _description,
            startTime: _startTime,
            endTime: _endTime,
            highestBid: _minBid,
            highestBidder: address(0),
            ended: false
        });

        emit AuctionCreated(nextAuctionId, msg.sender, _startTime, _endTime);
        nextAuctionId++;
        return nextAuctionId - 1;
    }

    // Fazendo um lance
    function bid(uint256 _auctionId) external payable nonReentrant {
        AuctionItem storage a = auctions[_auctionId];
        require(block.timestamp >= a.startTime, "Leilao nao comecou");
        require(block.timestamp <= a.endTime, "Leilao encerrado");
        require(msg.value > a.highestBid, "Lance muito baixo");

        if (a.highestBidder != address(0)) {
            // devolve o valor do lance anterior
            pendingReturns[_auctionId][a.highestBidder] += a.highestBid;
        }

        a.highestBid = msg.value;
        a.highestBidder = msg.sender;

        emit BidPlaced(_auctionId, msg.sender, msg.value);
    }

    // Permite que o usuário retire valores de lances superados
    function withdraw(uint256 _auctionId) external nonReentrant {
        uint256 amount = pendingReturns[_auctionId][msg.sender];
        require(amount > 0, "Nada a sacar");
        pendingReturns[_auctionId][msg.sender] = 0;
        payable(msg.sender).transfer(amount);
        emit Withdrawn(_auctionId, msg.sender, amount);
    }

    // Encerrando o leilão
    function endAuction(uint256 _auctionId) external nonReentrant {
        AuctionItem storage a = auctions[_auctionId];
        require(block.timestamp > a.endTime, "Ainda nao acabou");
        require(!a.ended, "Ja encerrado");
        a.ended = true;

        if (a.highestBidder != address(0)) {
            payable(a.seller).transfer(a.highestBid);
        }

        emit AuctionEnded(_auctionId, a.highestBidder, a.highestBid);
    }

    // Visualizando o estado de um leilão
    function getAuction(uint256 _auctionId)
        external
        view
        returns (
            address seller,
            string memory description,
            uint256 startTime,
            uint256 endTime,
            uint256 highestBid,
            address highestBidder,
            bool ended
        )
    {
        AuctionItem memory a = auctions[_auctionId];
        return (a.seller, a.description, a.startTime, a.endTime, a.highestBid, a.highestBidder, a.ended);
    }
}
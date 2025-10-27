import { useState } from "react";
import { getContract } from "./web3config";
import CreateAuctionForm from "./createAuctionForm";
import AuctionList from "./AuctionList";
import "./App.css";

function App() {
  const [searchTerm, setSearchTerm] = useState("");
  const [connected, setConnected] = useState(false);
  const [auctions, setAuctions] = useState([]);

  const filteredAuctions = auctions.filter(a =>
    a.description.toLowerCase().includes(searchTerm.toLowerCase())
  );

  async function connectWallet() {
    await window.ethereum.request({ method: "eth_requestAccounts" });
    setConnected(true);
  }

  async function loadAuctions() {
    const contract = await getContract();
    const count = Number(await contract.nextAuctionId());
    const items = [];
    for (let i = 0; i < count; i++) {
      const auction = await contract.getAuction(i);
      const formatted = {
        id: i,
        seller: auction[0],
        description: auction[1],
        startTime: Number(auction[2]),
        endTime: Number(auction[3]),
        highestBid: BigInt(auction[4]),
        highestBidder: auction[5],
        ended: auction[6],
      };
      
      items.push(formatted);
    }
    setAuctions(items);
  }
  

  return (
    <div className="app-container">
      <h1>Leilão Blockchain</h1>
    
      {!connected ? (
        <button onClick={connectWallet}>Conectar Carteira</button>
      ) : (
        <>
          <CreateAuctionForm />
          <input
            className="search-input"
            type="text"
            placeholder="Buscar leilão por nome..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            style={{ padding: 8, width: "60%", marginBottom: 20 }}
          />

          <button onClick={loadAuctions}>Carregar Leilões</button>

          <div className="auctions-container">
            <AuctionList auctions={filteredAuctions} />
          </div>
        </>
      )}
    </div>
  );
}

export default App;

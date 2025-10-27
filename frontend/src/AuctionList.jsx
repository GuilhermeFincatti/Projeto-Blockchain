import { ethers } from "ethers";
import { getContract } from "./web3config";
import { useState } from "react";
import "./App.css"

export default function AuctionList({ auctions }) {
  const [bidValue, setBidValue] = useState({});
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 5;

  const indexOfLast = currentPage * itemsPerPage;
  const indexOfFirst = indexOfLast - itemsPerPage;
  const currentAuctions = auctions.slice(indexOfFirst, indexOfLast);

  async function handleBid(id) {
    const valueEth = bidValue[id];
    if (!valueEth || valueEth <= 0) {
      alert("Insira um valor de lance válido em ETH");
      return;
    }

    try {
      const contract = await getContract();
      const tx = await contract.bid(id, {
        value: ethers.parseEther(valueEth.toString()), // converte ETH → wei
      });
      await tx.wait();
      alert("Lance enviado com sucesso!");
      window.location.reload();
    } catch (err) {
      console.error(err);
      alert("Erro ao enviar lance. Verifique o console.");
    }
  }

  async function handleEnd(id) {
    const contract = await getContract();
    const tx = await contract.endAuction(id);
    await tx.wait();
    alert("Leilão encerrado!");
  }

  async function handleWithdraw(id) {
    const contract = await getContract();
    const tx = await contract.withdraw(id);
    await tx.wait();
    alert("Saque realizado!");
  }

  return (
    <div>
      <h2>Leilões</h2>
      {currentAuctions.length === 0 && <p>Nenhum leilão encontrado.</p>}

      {currentAuctions.map((a) => (
        <div
          key={a.id}
          className="auction-card"
        >
          <h3>{a.description}</h3>
          <p><strong>Maior lance:</strong> {ethers.formatEther(a.highestBid.toString())} ETH</p>
          <p><strong>Vendedor:</strong> {a.seller.slice(0, 6)}...{a.seller.slice(-4)}</p>
          <p><b>Status:</b> {a.ended ? "Encerrado" : "Ativo"}</p>

          {!a.ended && (
            <>
              <input
                  type="number"
                  step="0.0001"
                  placeholder="Valor do lance (ETH)"
                  value={bidValue[a.id] || ""}
                  onChange={(e) =>
                    setBidValue({ ...bidValue, [a.id]: e.target.value })
                  }
                  style={{ marginRight: 10, padding: 5 }}
                />
              <button onClick={() => handleBid(a.id)}>Dar Lance</button>
              <button onClick={() => handleEnd(a.id)}>Encerrar</button>
            </>
          )}

          {a.ended && (
            <button onClick={() => handleWithdraw(a.id)}>Sacar</button>
          )}
        </div>
      ))}

      {/* Controles de paginação */}
      {auctions.length > itemsPerPage && (
        <div style={{ marginTop: 20 }}>
          <button
            onClick={() => setCurrentPage((p) => Math.max(p - 1, 1))}
            disabled={currentPage === 1}
          >
            Anterior
          </button>
          <span style={{ margin: "0 10px" }}>
            Página {currentPage} de {Math.ceil(auctions.length / itemsPerPage)}
          </span>
          <button
            onClick={() =>
              setCurrentPage((p) =>
                p < Math.ceil(auctions.length / itemsPerPage) ? p + 1 : p
              )
            }
            disabled={currentPage >= Math.ceil(auctions.length / itemsPerPage)}
          >
            Próxima
          </button>
        </div>
      )}
    </div>
  );
}

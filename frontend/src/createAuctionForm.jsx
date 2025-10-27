import { useState } from "react";
import { getContract } from "./web3config";
import { ethers } from "ethers";

export default function CreateAuctionForm() {
  const [desc, setDesc] = useState("");
  const [minBid, setMinBid] = useState(""); // em ETH agora
  const [duration, setDuration] = useState("");

  async function handleCreate() {
    if (!desc || !minBid || !duration) {
      alert("Preencha todos os campos!");
      return;
    }

    const contract = await getContract();
    const start = Math.floor(Date.now() / 1000); // agora
    const end = start + Number(duration) * 60;   // duração em minutos

    // Converte o valor digitado (em ETH) para wei
    const minBidWei = ethers.parseEther(minBid);

    const tx = await contract.createAuction(desc, start, end, minBidWei);
    await tx.wait();

    alert("Leilão criado com sucesso!");
    window.location.reload();
  }

  return (
    <div style={{ marginTop: 20, border: "1px solid gray", padding: 10, marginBottom: 20 }}>
      <h2>Criar Novo Leilão</h2>

      <input
        style={{ margin: 10 }}
        type="text"
        placeholder="Descrição do item"
        value={desc}
        onChange={(e) => setDesc(e.target.value)}
      />

      <input
        style={{ margin: 10 }}
        type="number"
        step="0.0001"
        placeholder="Lance mínimo (ETH)"
        value={minBid}
        onChange={(e) => setMinBid(e.target.value)}
      />

      <input
        style={{ margin: 10 }}
        type="number"
        placeholder="Duração (minutos)"
        value={duration}
        onChange={(e) => setDuration(e.target.value)}
      />

      <button onClick={handleCreate}>Criar</button>
    </div>
  );
}

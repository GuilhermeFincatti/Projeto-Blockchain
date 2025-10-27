import { ethers } from "ethers";
import abi from "./abi/Auction.json"; 

const CONTRACT_ADDRESS = "0xA11D00004396B2d055302E79721E5Ccd140B98Cc";

export async function getContract() {
  if (!window.ethereum) throw new Error("Metamask não detectado");

  // Solicita conexão com a carteira
  await window.ethereum.request({ method: "eth_requestAccounts" });

  // Cria o provider e o signer (usuário conectado)
  const provider = new ethers.BrowserProvider(window.ethereum);
  const signer = await provider.getSigner();

  // Cria a instância do contrato
  const contract = new ethers.Contract(CONTRACT_ADDRESS, abi, signer);

  return contract;
}

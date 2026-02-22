"use client";

import { useEffect } from "react";
import { useWriteContract, useWaitForTransactionReceipt } from "wagmi";
import { parseEther } from "viem";
import { useState } from "react";
import { ConnectButton } from "@rainbow-me/rainbowkit";
import { useAccount, useReadContract } from "wagmi";
import { useChainId } from "wagmi";  //temp
import { bankAbi } from "./constants/bankAbi";
import { BANK_CONTRACT_ADDRESS } from "./constants/contract";
import { formatEther } from "viem";
import type { Address } from "viem";


export default function Home() {
  const [txType, setTxType] = useState<"deposit" | "withdraw" | null>(null);
  const [amount, setAmount] = useState("");
  const contractExplorerUrl =
  "https://sepolia.etherscan.io/address/0x38a4B1E4ffFD8Cb2a2815e9A388CCCBd136813E7";
const {
  writeContract,
  data: hash,
  isPending,
  error,
} = useWriteContract();

const { isLoading: isConfirming, isSuccess } =
  useWaitForTransactionReceipt({
    hash,
  });

function handleDeposit() {
  if (!amount || Number(amount) <= 0) {
    alert("Please enter a valid ETH amount greater than 0");
    return;
  }

  setTxType("deposit");

  writeContract({
    address: BANK_CONTRACT_ADDRESS,
    abi: bankAbi,
    functionName: "deposit",
    value: parseEther(amount),
  });
}

const [withdrawAmount, setWithdrawAmount] = useState("");

function handleWithdraw() {
  if (!withdrawAmount || Number(withdrawAmount) <= 0) {
    alert("Enter a valid ETH amount");
    return;
  }

  if (
    bankBalance &&
    parseEther(withdrawAmount) > (bankBalance as bigint)
  ) {
    alert("Withdraw amount exceeds bank balance");
    return;
  }

  setTxType("withdraw");

  writeContract({
    address: BANK_CONTRACT_ADDRESS,
    abi: bankAbi,
    functionName: "withDraw",
    args: [parseEther(withdrawAmount)],
  });
}




  const chainId = useChainId();
  const { address, isConnected } = useAccount(); //temp

 const { data: bankBalance, refetch } = useReadContract({
  address: BANK_CONTRACT_ADDRESS,
  abi: bankAbi,
  functionName: "getBalance",
  args: [address as `0x${string}`],
  query: {
    enabled: !!address,
  },
});


useEffect(() => {
  if (isSuccess) {
    refetch();
    setAmount("");
    setWithdrawAmount("");
  }
}, [isSuccess, refetch]);

useEffect(() => {
  if (isSuccess) {
    const timer = setTimeout(() => {
      setTxType(null);
    }, 5000);

    return () => clearTimeout(timer);
  }
}, [isSuccess]);




const explorerTxUrl = hash
  ? `https://sepolia.etherscan.io/tx/${hash}`
  : null;


  return (
    <main className="flex min-h-screen flex-col items-center justify-center gap-6">
      <h1 className="text-3xl font-bold">ETH Bank dApp</h1>

      <ConnectButton />

                <a
        href={contractExplorerUrl}
        target="_blank"
        rel="noopener noreferrer"
        className="text-blue-500 underline text-sm"
      >
        View Bank Contract on Etherscan ↗
      </a>

      {isConnected && (
        <>
          <p className="text-sm text-gray-600">
            Connected as: {address}
          </p>

          <p className="text-lg font-semibold">
            Bank Balance:{" "}
            {bankBalance
              ? formatEther(bankBalance as bigint)
              : "0"}{" "}
            ETH
          </p>

          <div className="flex flex-col gap-3 w-64">
  <input
    type="number"
    placeholder="Amount in ETH"
    value={amount}
    onChange={(e) => setAmount(e.target.value)}
    className="border rounded px-3 py-2 text-white"
  />

  <button
    onClick={handleDeposit}
    disabled={isPending || isConfirming}
    className="bg-green-600 text-white rounded px-4 py-2 disabled:opacity-50"
  >
    {isPending
      ? "Confirm in wallet..."
      : isConfirming
      ? "Depositing..."
      : "Deposit ETH"}
  </button>

  {isSuccess && txType === "deposit" && explorerTxUrl && (
  <>
    <p className="text-green-600 text-sm">
      Deposit successful ✅
    </p>

    <a
      href={explorerTxUrl}
      target="_blank"
      rel="noopener noreferrer"
      className="text-blue-500 underline text-sm"
    >
      View transaction on Etherscan ↗
    </a>
  </>
)}




  {error && (
    <p className="text-red-600 text-sm">
      {error.message}
    </p>
  )}
</div>

<div className="flex flex-col gap-3 w-64 mt-6">
  <input
    type="number"
    placeholder="Withdraw ETH"
    value={withdrawAmount}
    onChange={(e) => setWithdrawAmount(e.target.value)}
    className="border rounded px-3 py-2 text-white"
  />

  <button
    onClick={handleWithdraw}
    disabled={isPending || isConfirming}
    className="bg-red-600 text-white rounded px-4 py-2 disabled:opacity-50"
  >
    {isPending
      ? "Confirm in wallet..."
      : isConfirming
      ? "Withdrawing..."
      : "Withdraw ETH"}
  </button>
  {isSuccess && txType === "withdraw" && explorerTxUrl && (
  <>
    <p className="text-green-600 text-sm">
      Withdraw successful ✅
    </p>

    <a
      href={explorerTxUrl}
      target="_blank"
      rel="noopener noreferrer"
      className="text-blue-500 underline text-sm"
    >
      View transaction on Etherscan ↗
    </a>
  </>
)}
    

</div>



          <p>Chain ID: {chainId}</p>  


        </>
      )}
    </main>
  );
}

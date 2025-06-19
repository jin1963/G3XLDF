
let web3;
let contract;
let userAccount;
const contractAddress = "0x27d82cc200033d8ecf6b5558ebe60ca212338a4f";

window.addEventListener("load", async () => {
  if (window.ethereum) {
    web3 = new Web3(window.ethereum);
    try {
      await ethereum.request({ method: "eth_requestAccounts" });
      const accounts = await web3.eth.getAccounts();
      userAccount = accounts[0];
      contract = new web3.eth.Contract(contractABI, contractAddress);
      document.getElementById("walletInfo").innerText = "✅ Connected: " + userAccount;
    } catch (err) {
      console.error("Wallet connect error", err);
    }
  } else {
    alert("Please install MetaMask.");
  }
});

document.getElementById("stakeBtn").addEventListener("click", async () => {
  const amount = document.getElementById("stakeAmount").value;
  const tier = document.getElementById("tierSelect").value;
  if (!amount || isNaN(amount) || amount <= 0) {
    alert("Enter valid G3X amount.");
    return;
  }
  try {
    const stakeAmount = web3.utils.toWei(amount, "ether");
    const tokenAddress = await contract.methods.token().call();
    const tokenContract = new web3.eth.Contract([{
      "constant": false, "inputs": [
        {"name":"_spender","type":"address"},
        {"name":"_value","type":"uint256"}],
      "name":"approve","outputs":[{"name":"","type":"bool"}],
      "type":"function"}], tokenAddress);
    await tokenContract.methods.approve(contractAddress, stakeAmount).send({ from: userAccount });
    await contract.methods.stake(stakeAmount, tier).send({ from: userAccount });
    alert("✅ Staked " + amount + " G3X for " + tier + " days.");
  } catch (err) {
    console.error("Stake failed:", err);
    alert("❌ Stake failed. See console for details.");
  }
});

document.getElementById("claimBtn").addEventListener("click", async () => {
  try {
    const stakeCount = await contract.methods.getStakeCount(userAccount).call();
    for (let i = 0; i < stakeCount; i++) {
      await contract.methods.claimRewards(i).send({ from: userAccount });
    }
    alert("🎉 Rewards claimed!");
  } catch (err) {
    console.error("Claim error:", err);
    alert("❌ Claim failed.");
  }
});

document.getElementById("unstakeBtn").addEventListener("click", async () => {
  try {
    const stakeCount = await contract.methods.getStakeCount(userAccount).call();
    for (let i = 0; i < stakeCount; i++) {
      await contract.methods.unstake(i).send({ from: userAccount });
    }
    alert("✅ Unstake completed!");
  } catch (err) {
    console.error("Unstake error:", err);
    alert("❌ Unstake failed.");
  }
});

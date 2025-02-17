const getAllPositionsByIdsABI = "function getAllPositionsByIds(address vaultAddress, uint256[] positionIds) view returns (tuple(address worker, uint256 positionId, uint256 positionDebtAmount, uint256 positionHealth, uint256[] positionIngredients, uint16 positionKillFactorBps)[] positionInfos)"
module.exports = {
  timetravel: false,
  era: {
    async tvl(_, _1, _2, { api }) {
      const data = {
        vaults: [
          {
            symbol: "ibETH",
            decimals: 18,
            baseTokenAddress: "0x5aea5775959fbc2557cc8789bc1bf90a239d9a91",
            address: "0x23FDd6487a17abB8360E8Da8b1B370C94ee94Cc2"
          },
          {
            symbol: "ibUSDC",
            decimals: 6,
            baseTokenAddress: "0x3355df6D4c9C3035724Fd0e3914dE96A5a83aaf4",
            address: "0x0755DA5D9e9A722A9e5cc4bb83742387ae2990a5"
          }
        ],
        syncSwapWorkers: [
          {
            name: "BUSD-ETH SyncSwap Farm",
            address: "0x8468AB9e88550f725439A7f128E2E31a5E6b753f",
            farmingTokenAddress: "0x2039bb4116B4EFc145Ec4f0e2eA75012D6C0f181",
            baseTokenAddress: "0x5AEa5775959fBC2557Cc8789bC1bf90A239D9a91",
            lpTokenAddress: "0xaD86486f1d225D624443e5DF4B2301d03bBe70f6"
          },
          {
            name: "USDC-ETH SyncSwap Farm",
            address: "0x3A613EFAe4a6A6447A9D784E398730811a57af6e",
            farmingTokenAddress: "0x3355df6D4c9C3035724Fd0e3914dE96A5a83aaf4",
            baseTokenAddress: "0x5AEa5775959fBC2557Cc8789bC1bf90A239D9a91",
            lpTokenAddress: "0x80115c708E12eDd42E504c1cD52Aea96C547c05c"
          },
          {
            name: "USDT-ETH SyncSwap Farm",
            address: "0x95C78e21Beb54314fe5A4571E7361f6c6A144B2f",
            farmingTokenAddress: "0x493257fD37EDB34451f62EDf8D2a0C418852bA4C",
            baseTokenAddress: "0x5AEa5775959fBC2557Cc8789bC1bf90A239D9a91",
            lpTokenAddress: "0xd3D91634Cf4C04aD1B76cE2c06F7385A897F54D3"
          },
          {
            name: "ETH-USDC SyncSwap Farm",
            address: "0x39356ed5dC2F7Ea897296e07E97b59Af9C8153Ec",
            farmingTokenAddress: "0x5AEa5775959fBC2557Cc8789bC1bf90A239D9a91",
            baseTokenAddress: "0x3355df6D4c9C3035724Fd0e3914dE96A5a83aaf4",
            lpTokenAddress: "0x80115c708E12eDd42E504c1cD52Aea96C547c05c"
          },
          {
            name: "USDT-USDC SyncSwap Farm",
            address: "0xfbF4BcD3266Af20B72dc484F6D7Dc13855885ba0",
            farmingTokenAddress: "0x493257fD37EDB34451f62EDf8D2a0C418852bA4C",
            baseTokenAddress: "0x3355df6D4c9C3035724Fd0e3914dE96A5a83aaf4",
            lpTokenAddress: "0x0E595bfcAfb552F83E25d24e8a383F88c1Ab48A4"
          }
        ],
        pancakeSwapV3Worker: [
          {
            name: "USDC-WETH PancakeSwapV3 Farm Worker",
            address: "0x9ac1CD6f35934bAeD9986711b9D983260C8F38C4",
            lpTokenAddress: "0x291d9F9764c72C9BA6fF47b451a9f7885Ebf9977",
            farmingTokenAddress: "0x3355df6D4c9C3035724Fd0e3914dE96A5a83aaf4",
            baseTokenAddress: "0x5aea5775959fbc2557cc8789bc1bf90a239d9a91",
          },
          {
            name: "ETH-USDC PancakeswapV3 Farm",
            address: "0x9ca8aD7290079BF5dbE42CCB917474379Aa167e5",
            farmingTokenAddress: "0x5aea5775959fbc2557cc8789bc1bf90a239d9a91",
            baseTokenAddress: "0x3355df6D4c9C3035724Fd0e3914dE96A5a83aaf4",
            lpToken: "0x291d9F9764c72C9BA6fF47b451a9f7885Ebf9977",
          },
          {
            name: "USDT-USDC PancakeswapV3 Farm",
            address: "0xDa3518E5F2972e0Edc1401336b94E257c58eeb18",
            farmingTokenAddress: "0x493257fd37edb34451f62edf8d2a0c418852ba4c",
            baseTokenAddress: "0x3355df6D4c9C3035724Fd0e3914dE96A5a83aaf4",
            lpToken: "0x3832fB996C49792e71018f948f5bDdd987778424",
          }
        ],
        commonCalculator: "0x4Ca7a070b0e62F71C46AB8B2fB4bd21e5B2B9Ac6",
      }
      const vaults = data.vaults;
      const syncswapWorkers = data.syncSwapWorkers;
      const vaultBalances = await api.multiCall({ abi: "uint256:vaultBalance", calls: vaults.map((v) => v.address), });
      const positionLengths = await api.multiCall({ abi: "uint256:positionsLength", calls: vaults.map((v) => v.address), });
      vaults.forEach((v, i) => {
        api.add(v.baseTokenAddress, vaultBalances[i]);
      });

      // from pancakeSwapV3Worker
      const pancakeSwapV3Workers = data.pancakeSwapV3Worker;
      const commonCalculator = data.commonCalculator;
      for (const [i, v] of vaults.entries()) {
        const positionLength = positionLengths[i];
        const positions = Array.from(Array(Number(positionLength)).keys());
        const positionIngredients = await api.call({ abi: getAllPositionsByIdsABI, params: [v.address, positions], target: commonCalculator });
        // => using multiCall
        for (const cur of positionIngredients) {
          const poolAddress = cur.worker.toLowerCase();
          const baseAmount = cur.positionIngredients[0];
          const farmAmount = cur.positionIngredients[1];
          const pancakeSwapV3Worker = pancakeSwapV3Workers.find((v) => v.address.toLowerCase() === poolAddress);
          if (!pancakeSwapV3Worker) {
            continue;
          }
          api.add(pancakeSwapV3Worker.baseTokenAddress, baseAmount);
          api.add(pancakeSwapV3Worker.farmingTokenAddress, farmAmount);
        }
      }

      const [
        syncswapWorkerBalances,
        syncswapReserves,
        syncswapLpTotalSupplies,
        token0s,
        token1s,
      ] = await Promise.all([
        api.multiCall({ abi: "uint256:totalStakedLpBalance", calls: syncswapWorkers.map((v) => v.address), }),
        api.multiCall({ abi: "function getReserves() view returns (uint256, uint256)", calls: syncswapWorkers.map((v) => v.lpTokenAddress), }),
        api.multiCall({ abi: "uint256:totalSupply", calls: syncswapWorkers.map((v) => v.lpTokenAddress), }),
        api.multiCall({ abi: "address:token0", calls: syncswapWorkers.map((v) => v.lpTokenAddress), }),
        api.multiCall({ abi: "address:token1", calls: syncswapWorkers.map((v) => v.lpTokenAddress), }),
      ]);

      syncswapWorkers.forEach((w, i) => {
        const token0 = token0s[i]
        const token1 = token1s[i]
        const lpBalance = BigInt(syncswapWorkerBalances[i])
        const totalSupply = BigInt(syncswapLpTotalSupplies[i])
        const [r0, r1] = syncswapReserves[i].map(BigInt);
        const underlying0 = String(lpBalance * r0 / totalSupply);
        const underlying1 = String(lpBalance * r1 / totalSupply);
        api.add(token0, underlying0);
        api.add(token1, underlying1);
      });
    },
  },
};

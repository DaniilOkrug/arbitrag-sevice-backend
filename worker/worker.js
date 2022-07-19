const { parentPort } = require("worker_threads");
const axios = require("axios");
const Binance = require("node-binance-api");
const { assets, payTypes } = require("./constants");

const binance = new Binance().options({
  APIKEY: "<key>",
  APISECRET: "<secret>",
});

let isChecking = false;

(async () => {
  try {
    const advertisements = await getAdvertisersWithProfit();
    console.log(advertisements);
    parentPort.postMessage(JSON.stringify(advertisements));
  } catch (error) {
    console.log(error);
  }

  setInterval(async () => {
    try {
      console.log("Start");
      isChecking = true;
      const advertisements = await getAdvertisersWithProfit();
      parentPort.postMessage(JSON.stringify(advertisements));
      isChecking = false;
      console.log("Finish");
    } catch (error) {
      console.log(error);
    }
  }, 120000);
})();

function getAdvertisersWithProfit() {
  return new Promise(async (resolve, reject) => {
    const result = [];

    const buyAdvertisers = await getAdvertisers("BUY");
    console.log(buyAdvertisers);
    if (!buyAdvertisers) return resolve;

    const prices = await binance.prices();

    for (const asset of assets) {
      for (const buyPayType of payTypes) {
        const buyCases = buyAdvertisers[asset][buyPayType];

        if (!Array.isArray(buyCases.advs)) continue;

        for (let i = 0; i < buyCases.advs.length; i++) {
          const buyPrice = +buyCases.advs[i].adv.price;

          for (const sellPayType of payTypes) {
            if (buyPayType === sellPayType) continue;

            const sellCases = buyAdvertisers[asset][sellPayType];

            if (!Array.isArray(sellCases.advs)) continue;
            if (sellCases.advs.length === 0) continue;

            sellCases.advs.sort((a, b) => {
              return a.adv.price - b.adv.price;
            });

            const sellPrice = +sellCases.advs[0].adv.price;

            const profitPercent = ((sellPrice - buyPrice) / buyPrice) * 100;

            if (profitPercent > 1) {
              result.push({
                buy: {
                  asset: asset,
                  price: buyPrice,
                  payType: buyPayType,
                },
                sell: {
                  asset: asset,
                  price: sellPrice,
                  payType: sellPayType,
                },
                profit: profitPercent.toFixed(2),
              });
            }
          }

          //on market
          for (const marketBuyAsset of assets) {
            if (asset === marketBuyAsset) continue;

            for (const sellPayType of payTypes) {
              const sellCases = buyAdvertisers[marketBuyAsset][sellPayType];
              if (!Array.isArray(sellCases.advs)) continue;
              if (sellCases.advs.length === 0) continue;

              sellCases.advs.sort((a, b) => {
                return a.adv.price - b.adv.price;
              });

              const sellPrice = +sellCases.advs[0].adv.price;

              let marketPrice = prices[asset + marketBuyAsset];

              let profitPercent = 0;
              if (!marketPrice) {
                marketPrice = prices[marketBuyAsset + asset];
                if (!marketPrice) continue;

                profitPercent =
                  ((sellPrice - buyPrice * marketPrice) /
                    (buyPrice * marketPrice)) *
                  100;
              } else {
                profitPercent =
                  ((marketPrice * sellPrice - buyPrice) / buyPrice) * 100;
              }

              console.log(profitPercent);

              if (profitPercent >= 1) {
                result.push({
                  buy: {
                    asset: asset,
                    price: buyPrice,
                    payType: buyPayType,
                  },
                  sell: {
                    asset: marketBuyAsset,
                    price: sellPrice,
                    payType: sellPayType,
                  },
                  profit: profitPercent.toFixed(2),
                });
              }

              console.log(`On market ${asset + marketBuyAsset} - checked`);
            }
          }
        }
      }
    }

    resolve(result);
  });
}

function getAdvertisers(tradeType) {
  return new Promise(async (resolve, reject) => {
    try {
      const advertisers = {};

      for (const asset of assets) {
        advertisers[asset] = {};

        for (const payType of payTypes) {
          try {
            const response = await axios.post(
              "https://p2p.binance.com/bapi/c2c/v2/friendly/c2c/adv/search",
              {
                asset,
                tradeType,
                page: 1,
                rows: 10,
                payTypes: [payType],
                publisherType: null,
                fiat: "RUB",
              }
            );

            advertisers[asset][payType] = {
              advs: response.data.data,
            };
          } catch (error) {
            console.log(error);
          }
        }
      }

      resolve(advertisers);
    } catch (error) {
      console.log(error);
      resolve;
    }
  });
}

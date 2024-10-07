import axios from 'axios';

async function fetchCryptoData(cryptoId: any) {
  let response = null;
  const apiKey = process.env.COIN_MARKETCAP_API_KEY || "";

  try {
    response = await axios.get('https://pro-api.coinmarketcap.com/v2/cryptocurrency/info', {
      headers: {
        'Accepts': 'application/json',
        'X-CMC_PRO_API_KEY': apiKey,
      },
      params: {
        'id': cryptoId,
        'aux': 'num_market_pairs,cmc_rank,date_added,max_supply,circulating_supply,total_supply,is_active,is_fiat'
    }
    });
    return response
  } catch (ex) {
    response = null;
    console.log(ex);
    throw ex;
  }

}

export { fetchCryptoData };
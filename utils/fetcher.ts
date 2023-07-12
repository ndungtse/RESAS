import { Prefecture, ApiResponse } from './types';

export const fetchData = async (pref1: Prefecture, pref2: Prefecture, apiKey?: string) => {
  const res = await fetch(
    `https://opendata.resas-portal.go.jp/api/v1/population/composition/perYear?cityCode=-&prefCode=${pref1.prefCode}`,
    {
      headers: {
        'X-API-KEY': apiKey ?? process.env.NUXT_RESAS_API_KEY!,
      },
    },
  ).then(res => res.json());
  const res1 = await fetch(
    `https://opendata.resas-portal.go.jp/api/v1/population/composition/perYear?cityCode=-&prefCode=${pref2.prefCode}`,
    {
      headers: {
        'X-API-KEY': apiKey ?? process.env.NUXT_RESAS_API_KEY!,
      },
    },
  ).then(res => res.json());

  return await Promise.all([res, res1]);
};

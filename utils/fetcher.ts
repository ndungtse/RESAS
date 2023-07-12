import { Prefecture, ApiResponse } from './types';

export const fetchData = async (pref1: Prefecture, pref2: Prefecture) => {
  const res = await fetch(
    `https://opendata.resas-portal.go.jp/api/v1/population/composition/perYear?cityCode=-&prefCode=${pref1.prefCode}`,
    {
      headers: {
        'X-API-KEY': process.env.NUXT_RESAS_API_KEY!,
      },
    },
  ).then(res => res.json());
  const res1 = await fetch(
    `https://opendata.resas-portal.go.jp/api/v1/population/composition/perYear?cityCode=-&prefCode=${pref2.prefCode}`,
    {
      headers: {
        'X-API-KEY': process.env.NUXT_RESAS_API_KEY!,
      },
    },
  ).then(res => res.json());

  const [data, data1]: [ApiResponse, ApiResponse] = await Promise.all([res, res1]);

  const populationData = data.result.data[0].data;
  const populationData1 = data1.result.data[0].data;
  const populationData2 = populationData.map((data, index) => {
    return {
      year: data.year,
      value: data.value - populationData1[index].value,
    };
  });
  return populationData2;
};

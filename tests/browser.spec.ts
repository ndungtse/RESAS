import { SpyInstance, Vitest, afterEach, beforeEach, describe, expect, test, vi } from 'vitest';
import { setup, $fetch } from '@nuxt/test-utils';
import { fetchData } from 'utils/fetcher';

describe('My test', async () => {
  await setup({
    // browser: true,
    testDir: __dirname,
  });
  let fetchSpy: SpyInstance;
  beforeEach(() => {
    fetchSpy = vi.spyOn(global, 'fetch');
    fetchSpy.mockResolvedValue({
      json: () =>
        Promise.resolve({
          result: {
            data: [
              {
                data: [
                  { year: 2020, value: 100 },
                  { year: 2021, value: 200 },
                ],
              },
            ],
          },
        }),
    });
  });

  afterEach(() => {
    fetchSpy.mockRestore();
  });

  test('test functions', () => {
    expect($fetch).toBeDefined();
    expect(fetchData).toBeDefined();
  });
  test('fetches and returns population data', async () => {
    console.log('apiKey', process.env.NUXT_RESAS_API_KEY);

    const pref1 = { prefCode: 1, prefName: 'pref1' };
    const pref2 = { prefCode: 2, prefName: 'pref2' };

    const populationData = await fetchData(pref1, pref2);

    expect(populationData).toBeDefined(); // has data
    expect(populationData).toHaveLength(2); // 2 datas form 2 prefectures data are returned

    expect(fetchSpy).toHaveBeenCalledTimes(2);
    expect(fetchSpy).toHaveBeenCalledWith(
      'https://opendata.resas-portal.go.jp/api/v1/population/composition/perYear?cityCode=-&prefCode=1',
      expect.any(Object),
    );
    expect(fetchSpy).toHaveBeenCalledWith(
      'https://opendata.resas-portal.go.jp/api/v1/population/composition/perYear?cityCode=-&prefCode=2',
      expect.any(Object),
    );
  });
});

<template>
  <div class="flex w-full flex-col">
    <div class="flex gap-3 items-center justify-center">
      <h1 class="font-semibold">Prefecture</h1>
      <div class="flex items-center gap-x-2">
        <input type="checkbox" name="" id="" />
        <span>Tokyo</span>
      </div>
      <div class="flex items-center gap-x-2">
        <input type="checkbox" name="" id="" />
        <span>Kanagawa</span>
      </div>
    </div>
    <div class="flex w-full mx-auto max-w-[800px] justify-center items-center flex-col">
      <Line v-if="!loading" :data="chartData" :options="chartOptions" />
      <div v-else class="text-center">loading data...</div>
    </div>
  </div>
</template>

<script setup lang="ts">
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
} from 'chart.js';
import { ApiResponse } from 'utils/types';
import { Line } from 'vue-chartjs';

const runtimeConfig = useRuntimeConfig();

ChartJS.register(CategoryScale, LinearScale, PointElement, LineElement, Title, Tooltip, Legend);

const chartData: any = useState('chartData', () => ({}));
const loading: any = useState('loading', () => true);

const chartOptions: any = {
  responsive: true,
  plugins: {
    legend: {
      position: 'top',
      labels: {
        useBorderRadius: true,
        borderRadius: 2,
        boxWidth: 5,
        boxHeight: 5,
      },
    },
    title: {
      display: true,
      text: 'Population Chart of Prefectures',
    },
  },
  // increase area of chart and
  scales: {
    y: {
      beginAtZero: true,
      ticks: {
        callback: function (value: any) {
          return value / 1000000 + 'M';
        },
        // stepSize: 500000,
      },
    },
  },
};

// fetch data from API RESAS and set to chartData

const fetchData = async () => {
  loading.value = true;
  const res = await fetch(
    'https://opendata.resas-portal.go.jp/api/v1/population/composition/perYear?cityCode=-&prefCode=1',
    {
      headers: {
        'X-API-KEY': runtimeConfig.public.API_KEY,
      },
    },
  ).then(res => res.json());
  const res1 = await fetch(
    'https://opendata.resas-portal.go.jp/api/v1/population/composition/perYear?cityCode=-&prefCode=2',
    {
      headers: {
        'X-API-KEY': runtimeConfig.public.API_KEY,
      },
    },
  ).then(res => res.json());

  const [data, data1]: [ApiResponse, ApiResponse] = await Promise.all([res, res1]);
  console.log('res', data);
  console.log('res1', data1);

  const fetchedData = {
    labels: data.result.data[0].data.map(d => d.year),
    datasets: [
      {
        label: data.result.data[0].label,
        data: data.result.data[0].data.map(d => d.value),
        borderColor: '#00fc00',
        fill: false,
        tension: 0.5,
        pointRadius: 1,
      },
      {
        label: data1.result.data[0].label,
        data: data1.result.data[0].data.map(d => d.value),
        borderColor: '#00f',
        fill: false,
        tension: 0.5,
        pointRadius: 1,
      },
    ],
  };
  console.log('fetchedData', fetchedData);
  chartData.value = fetchedData;
  loading.value = false;
};

onMounted(() => {
  fetchData();
});
</script>

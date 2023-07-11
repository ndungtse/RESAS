<template>
  <div class="container">
    <div class="header">
      <div class="headerDiv">
        <h5 class="heading">Prefecture:</h5>
        <div v-for="pref in ['Hokkaido', 'Aomori']" :key="pref" class="checkbox-wrapper">
          <input type="checkbox" name="" id="" :value="pref" @click="addOrRemovePrefecture"
            :checked="prefectures.includes(pref)" />
          <span>{{ pref }}</span>
        </div>

      </div>
      <div class="headerDiv">
        <h5 class="heading">Age Group:</h5>
        <div v-for="lette in ['A', 'B', 'C', 'D']" :key="lette" class="checkbox-wrapper">
          <input type="checkbox" name="" id="" :value="lette" @click="changeChartData" :checked="agelabel === lette" />
          <span>{{ lette }}</span>
        </div>
      </div>
    </div>
    <div class="chart-container">
      <div class="chart-wrapper">
        <Line v-if="!loading" :data="chartData" :options="chartOptions" />
        <div v-else class="loading-text">loading data...</div>
      </div>
    </div>
    <!-- chat age group keys -->
    <div class="age-group-cont">
      <span class="key-text">Age Group Keys:</span>
      <div class="age-group-keys">
        <div class="age-group-text">A: Total Population</div>
        <div class="age-group-text">B: Young Population</div>
        <div class="age-group-text">C: Working Population</div>
        <div class="age-group-text">D: Elderly Population</div>
      </div>
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
// agelabels A:総人口 B:年少人口 C:生産年齢人口 D:老年人口
const agelabel = useState('agelabel', () => 'A');
const prefectures = useState('prefecture', () => ['Hokkaido', 'Aomori']);
const borderColor = useState('borderColor', () => ['#00fc00', '#00f']);
const allData: globalThis.Ref<[ApiResponse, ApiResponse] | null> = useState('allData', () => (null));

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
  allData.value = [data, data1];
  const fetchedData = {
    labels: data.result.data[0].data.map(d => d.year),
    datasets: [
      {
        label: 'Hokkaido',
        data: data.result.data[0].data.map(d => d.value),
        borderColor: '#00fc00',
        fill: false,
        tension: 0.5,
        pointRadius: 1,
      },
      {
        label: 'Aomori',
        data: data1.result.data[0].data.map(d => d.value),
        borderColor: '#00f',
        fill: false,
        tension: 0.5,
        pointRadius: 1,
      },
    ],
  };
  chartData.value = fetchedData;
  loading.value = false;
};

onMounted(() => {
  fetchData();
});
// change chart data when checkbox is clicked for age label from allData if it is not empty
const changeChartData = (e: any) => {
  console.log('e', e.target.value);
  agelabel.value = e.target.value;
  const labelIndex = () => {
    switch (e.target.value) {
      case 'A':
        return 0;
      case 'B':
        return 1;
      case 'C':
        return 2;
      case 'D':
        return 3;
      default:
        return 0;
    }
  };
  if (!allData.value) return
  if (prefectures.value.length === 0) return
  console.log('prefectures', prefectures.value);

  let datasets: any = [];
  for (let i = 0; i < prefectures.value.length; i++) {
    datasets.push({
      label: prefectures.value[i],
      data: allData.value[i].result.data[labelIndex()].data.map(d => d.value),
      borderColor: borderColor.value[i],
      fill: false,
      tension: 0.5,
      pointRadius: 1,
    });
  }
  const fetchedData = {
    labels: allData.value[0].result.data[labelIndex()].data.map(d => d.year),
    datasets: datasets,
  };
  chartData.value = fetchedData;
};

// // log chartData when it is changed
// watch(chartData, () => {
//   console.log('new chartData', chartData.value);
// });
// change chart data when select is changed for prefectures from allData if it is not empty, show 2 prefectures  or 1 prefecture
watch(prefectures, () => {
  if (!allData.value) return
  const labelIndex = () => {
    switch (agelabel.value) {
      case 'A':
        return 0;
      case 'B':
        return 1;
      case 'C':
        return 2;
      default:
        return 0;
    }
  };
  if (prefectures.value.length === 0) return
  if (prefectures.value.length === 1) {
    const fetchedData = {
      labels: allData.value[0].result.data[labelIndex()].data.map(d => d.year),
      datasets: [
        {
          label: prefectures.value[0],
          data: allData.value[0].result.data[labelIndex()].data.map(d => d.value),
          borderColor: borderColor.value[0],
          fill: false,
          tension: 0.5,
          pointRadius: 1,
        },
      ],
    };
    chartData.value = fetchedData;
  } else if (prefectures.value.length === 2) {
    let datasets: any = [];
    for (let i = 0; i < prefectures.value.length; i++) {
      datasets.push({
        label: prefectures.value[i],
        data: allData.value[i].result.data[labelIndex()].data.map(d => d.value),
        borderColor: borderColor.value[i],
        fill: false,
        tension: 0.5,
        pointRadius: 1,
      });
    }
    const fetchedData = {
      labels: allData.value[0].result.data[labelIndex()].data.map(d => d.year),
      datasets: datasets,
    };
    chartData.value = fetchedData;
  }
});

const addOrRemovePrefecture = (e: any) => {
  if (prefectures.value.includes(e.target.value)) {
    prefectures.value = prefectures.value.filter(pref => pref !== e.target.value);
  } else {
    prefectures.value = [...prefectures.value, e.target.value];
  }
};
</script>

<style scoped>
.container {
  display: flex;
  flex-direction: column;
  padding-top: 18px;
}

.header {
  display: flex;
  gap: 0.75rem;
  align-items: center;
  justify-content: center;
  font-weight: 600;
}

.header>div {
  display: flex;
  gap: 0.5rem;
  align-items: center;
}

.heading {
  font-size: 1.2rem;
  font-weight: 600;
  text-align: center;
}

.checkbox-wrapper {
  display: flex;
  align-items: center;
  gap: 0.5rem;
}

.chart-container {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 1rem;
  overflow-x: auto;
  width: 100%;
}

.chart-wrapper {
  display: flex;
  width: 100%;
  max-width: 800px;
  margin: 0 auto;
  justify-content: center;
  align-items: center;
  flex-direction: column;
}

.loading-text {
  text-align: center;
}

.age-group-cont {
  max-width: 800px;
  margin: 0 auto;
}

.age-group-keys {
  display: flex;
  gap: 0.5rem;
  align-items: center;
  padding: 1em;
  flex-wrap: wrap;
}

.age-group-keys>div {
  display: flex;
  gap: 0.5rem;
  white-space: nowrap;
  align-items: center;
}

.age-group-text::first-letter {
  color: #00f;
}

.key-text {
  font-size: 0.8rem;
  margin: 0.5em 1rem;
}

@media (max-width: 768px) {
  .header {
    flex-wrap: wrap;
  }

  .chart-wrapper {
    min-width: 500px;
  }

}
</style>

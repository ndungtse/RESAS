<template>
  <div class="container">
    <div class="header">
      <div class="headerDiv">
        <h5 class="heading">Prefecture:</h5>
        <div v-for="pref in availablePrefs.slice(0, 2)" :key="pref.prefCode" class="checkbox-wrapper">
          <input type="checkbox" name="" id="" :value="pref.prefName" @click="addOrRemovePrefecture"
            :checked="prefectures.includes(pref.prefName)" />
          <span>{{ pref.prefName }}</span>
        </div>

      </div>
      <div class="headerDiv">
        <h5 class="heading">Age Group:</h5>
        <div v-for="lette in ['A', 'B', 'C', 'D']" :key="lette" class="checkbox-wrapper">
          <input type="radio" class="checkbox" name="ageGroup" id="" :value="lette" @click="changeChartData"
            :checked="agelabel === lette" />
          <span>{{ lette }}</span>
        </div>
      </div>
    </div>
    <div class="chart-container">
      <div class="chart-wrapper">
        <Line v-if="!loading && showGraph" :data="chartData" :options="chartOptions" />
        <div v-if="loading" class="loading-text">loading data...</div>
        <div v-if="!showGraph && !loading" class="loading-text">Select at least 1 Prefecture</div>
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
import { fetchData } from '@/utils/fetcher';
import { ApiResponse, Prefecture } from '@/utils/types';
import { Line } from 'vue-chartjs';

const runtimeConfig = useRuntimeConfig();

ChartJS.register(CategoryScale, LinearScale, PointElement, LineElement, Title, Tooltip, Legend);

const chartData: any = useState('chartData', () => ({}));
const loading: any = useState('loading', () => true);
const showGraph: any = useState('showGraph', () => true);
const agelabel = useState('agelabel', () => 'A');
const prefectures: globalThis.Ref<Prefecture['prefName'][]> = useState('prefecture', () => []);
const borderColor = useState('borderColor', () => ['#00fc00', '#00f']);
const availablePrefs: globalThis.Ref<Prefecture[]> = useState('availablePrefs', () => []);
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
      onClick: (e: any) => {
        // console.log('e', e);
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
const getData = async (pref1: Prefecture, pref2: Prefecture) => {
  const [data, data1]: [ApiResponse, ApiResponse] = await fetchData(pref1, pref2, runtimeConfig.public.API_KEY);
  allData.value = [data, data1];
  const fetchedData = {
    labels: data.result.data[0].data.map(d => d.year),
    datasets: [
      {
        label: availablePrefs.value[0].prefName,
        data: data.result.data[0].data.map(d => d.value),
        borderColor: '#00fc00',
        fill: false,
        tension: 0.5,
        pointRadius: 1,
      },
    ],
  };
  chartData.value = fetchedData;
  loading.value = false;
};
const fetchPrefectures = async () => {
  const res = await fetch('https://opendata.resas-portal.go.jp/api/v1/prefectures', {
    headers: {
      'X-API-KEY': runtimeConfig.public.API_KEY,
    },
  }).then(res => res.json());
  availablePrefs.value = res.result.map((pref: any) => pref);
};
// fetch prefectures data from API RESAS and set to availablePrefs
onMounted(() => {
  fetchPrefectures();
});

// watch availablePrefectures 
watch(availablePrefs, () => {
  if (availablePrefs.value.length > 0) {
    getData(availablePrefs.value[0], availablePrefs.value[1]);
    prefectures.value = [availablePrefs.value[0].prefName];
  }
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

const getPrefIndex = (pref: string) => {
  return availablePrefs.value.findIndex(p => p.prefName === pref);
};

// change chart data when select is changed for prefectures from allData if it is not empty, show 2 prefectures  or 1 prefecture
watch(prefectures, () => {
  console.log('prefectures', prefectures.value);

  if (!allData.value) return
  const labelIndex = () => {
    switch (agelabel.value) {
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
  if (prefectures.value.length === 0) {
    showGraph.value = false;
    chartData.value = null;
    return
  }
  if (prefectures.value.length === 1) {
    const index = getPrefIndex(prefectures.value[0]);
    const fetchedData = {
      labels: allData.value[index].result.data[labelIndex()].data.map(d => d.year),
      datasets: [
        {
          label: prefectures.value[0],
          data: allData.value[index].result.data[labelIndex()].data.map(d => d.value),
          borderColor: borderColor.value[index],
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
      const index = getPrefIndex(prefectures.value[i]);
      // console.log('index', index, 'i', i);
      datasets.push({
        label: prefectures.value[i],
        data: allData.value[index].result.data[labelIndex()].data.map(d => d.value),
        borderColor: borderColor.value[index],
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
  showGraph.value = true;
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

import { mount } from '@vue/test-utils';
import PopulationChart from '@/components/PopulationChart.vue';

describe('PopulationChart', () => {
  it('renders checkboxes for prefectures', () => {
    const wrapper = mount(PopulationChart);

    // Check if checkboxes for Tokyo and Kanagawa are rendered
    expect(wrapper.findAll('input[type="checkbox"]')).toHaveLength(2);
    expect(wrapper.find('input[type="checkbox"]').attributes('id')).toBe('');
    expect(wrapper.find('input[type="checkbox"]').attributes('name')).toBe('');
    expect(wrapper.find('input[type="checkbox"]').element.checked).toBe(false);
    expect(wrapper.find('input[type="checkbox"]').nextElementSibling.textContent).toBe('Tokyo');
    expect(
      wrapper.find('input[type="checkbox"]').nextElementSibling.nextElementSibling.textContent,
    ).toBe('Kanagawa');

    // Check if checkboxes for letters A, B, C are rendered
    expect(wrapper.findAll('input[type="checkbox"]')).toHaveLength(5); // Including Tokyo and Kanagawa checkboxes
    expect(wrapper.findAll('input[type="checkbox"] + span').map(el => el.textContent)).toEqual([
      'Tokyo',
      'Kanagawa',
      'A',
      'B',
      'C',
    ]);
  });

  it('renders chart or loading text based on loading state', () => {
    const wrapper = mount(PopulationChart);

    // Check if chart is rendered when loading is false
    wrapper.setData({ loading: false });
    expect(wrapper.find('canvas')).toBeTruthy();
    expect(wrapper.find('.loading-text').exists()).toBe(false);

    // Check if loading text is rendered when loading is true
    wrapper.setData({ loading: true });
    expect(wrapper.find('canvas').exists()).toBe(false);
    expect(wrapper.find('.loading-text')).toBeTruthy();
    expect(wrapper.find('.loading-text').text()).toBe('loading data...');
  });
});

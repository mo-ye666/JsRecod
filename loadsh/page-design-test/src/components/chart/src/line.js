import { BaseChart } from './pie'

class Line extends BaseChart {
  getOption() {
    const { series, title } = this.config;
    let mockData = [{
      xName:'Mon',
      yValue:820
    },{
      xName:'Tue',
      yValue:932
    },{
      xName:'Wed',
      yValue:901
    },{
      xName:'Thu',
      yValue:934
    },{
      xName:'Fri',
      yValue:1290
    },{
      xName:'Sat',
      yValue:1330
    },{
      xName:'Sun',
      yValue:1320
    }]
    let xAxisData = []
    let seriesData = mockData.map(item => {
      xAxisData.push(item.xName)
      return item['yValue']
    })
    
    return {
      color: ['#0189FD', '#0CB69C', '#FFA301', '#AEFF01', '#01D5FF', '#ca8622', '#bda29a', '#6e7074', '#546570', '#c4ccd3'],
      tooltip: {
        trigger: 'axis',
        axisPointer: {
          type: 'shadow'
        }
      },
      grid: {},
      title: title,
      xAxis: [{
        type: 'category',
        data: xAxisData,
        axisLine: {
          lineStyle: {
            color: '#bbb'
          }
        },
        axisLabel: {
          color: '#666'
        },
        axisTick: {
          lineStyle: {
            color: '#999'
          }
        }
      }],
      yAxis: [{
        axisLine: {
          show: false
        },
        axisTick: {
          lineStyle: {
            color: '#999'
          }
        },
        type: 'value',
        splitLine: {
          interval: '200',
          lineStyle: {
            // 使用深浅的间隔色
            color: ['#ddd'],
            width: 1,
            type: 'dashed'
          }
        }
      }],
      series: [
        Object.assign({
          data: seriesData,
          type: 'line'
        }, series)
      ]
    }
  }

  getValue() {
    const conf = this.config
    const values = []
    conf.data && conf.data.forEach(item => {
      values.push({ value: item[conf.valueKey || 'value'], name: item[conf.labelKey || 'label'] })
    })
    return values
  }
}
export default Line

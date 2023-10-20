import { BaseChart } from './pie'

class Bar extends BaseChart {
  getOption() {
    const config = this.config
    return {
      color: ['#0189FD', '#0CB69C', '#FFA301', '#AEFF01', '#01D5FF', '#ca8622', '#bda29a', '#6e7074', '#546570', '#c4ccd3'],
      tooltip: {
        trigger: 'axis',
        axisPointer: {
          type: 'shadow'
        }
      },
      grid: {
        left: '5%',
        right: '5%',
        bottom: '5%',
        containLabel: true
      },
      xAxis: [{
        type: 'category',
        data: ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'],
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
      series: [ {
        name: '直接访问',
        type: 'bar',
        barWidth: config.barWidth || 30,
        data: [10, 52, 200, 334, 390, 330, 220],
        itemStyle: {
          normal: {
            barBorderRadius: config.radius ? [config.barWidth, config.barWidth, 0, 0] : null
          }
        }
      }]
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

  getXAxisData() {
    const conf = this.config
    const xAxisTypeMap = {}
    const xAxisTypeValues = []
    const seriesTypeMap = {}
    if (conf.data && conf.xAxisTypeKey) {
      conf.data.forEach(item => {
        if (!xAxisTypeMap[item[conf.xAxisTypeKey]]) {
          xAxisTypeValues.push(item[conf.xAxisTypeKey])
          xAxisTypeMap[conf.xAxisTypeKey] = true
        }
        if (conf.seriesTypeKey) {
          if (!seriesTypeMap[item[conf.seriesTypeKey]]) {
            seriesTypeMap[item[conf.seriesTypeKey]] = [item]
          } else {
            seriesTypeMap[item[conf.seriesTypeKey]].push(item)
          }
        }
      })
    }
  }

  getSeries(seriesTypeMap, config) {
    Object.keys(seriesTypeMap).map(key => {
      return {
        name: key,
        type: 'bar',
        barWidth: config.barWidth || 30
      }
    })
  }
}
export default Bar

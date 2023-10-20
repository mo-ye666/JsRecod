class BaseChart {
    config = {}

    constructor(config) {
      this.config = config
    }

    getColors() {
      return ['#0189FD', '#0CB69C', '#FFA301', '#AEFF01', '#01D5FF', '#ca8622', '#bda29a', '#6e7074', '#546570', '#c4ccd3']
    }

    getValue() {
      const conf = this.config
      const values = []
      conf.data && conf.data.forEach(item => {
        values.push({ value: item[conf.valueKey || 'value'], name: item[conf.labelKey || 'label'] })
      })
      return values
    }

    getLegends() {
      const conf = this.config
      const legends = []
      conf.data && conf.data.forEach(item => {
        legends.push(item[conf.labelField || 'label'])
      })
      return legends
    }
}

class Pie extends BaseChart {
  getOption() {
    const config = this.config
    const values = this.getValue(config)
    const { title, legend } = config
    let legendObj = {...legend};
    legendObj.top = legendObj.top ? legendObj.top + '%' : 'auto'
    legendObj.left = legendObj.left ? legendObj.left + '%' : 'auto'
    return {
      color: this.getColors(),
      tooltip: {
        trigger: 'item',
        formatter: '{c} ({d}%)'
      },
      title: title,
      legend: legendObj,

      series: [
        {
          name: '',
          type: 'pie',
          radius: config.radius ? [config.radius[0] + '%', config.radius[1] + '%'] : ['50%', '70%'],
          center: config.center ? [config.center[0] + '%', config.center[1] + '%'] : ['50%', '50%'],
          avoidLabelOverlap: true,
          label: {
            show: false,
            position: config.showCenterLabel ? 'center' : ''
          },
          labelLine: {
            show: false
          },
          itemStyle: {
            normal: {
              borderWidth: values.length > 1 ? config.split / 2 : 0,
              borderColor: '#fff',
              borderRadius: 0
            }
          },
          roseType: config.roseType ? 'area' : '',
          emphasis: {
            label: {
              show: true,
              fontSize: config.fontSize || '20',
              fontWeight: 'bold'
            }
          },
          data: values
        }
      ]
    }
  }
}
export { BaseChart }
export default Pie

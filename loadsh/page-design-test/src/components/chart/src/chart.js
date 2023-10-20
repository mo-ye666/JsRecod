
import echarts from 'echarts'
import Pie from './pie'
import Bar from './bar'
import Line from './line'

export default {
  render(type, config, dom) {
    const chart = echarts.init(dom)
    let chartIns
    if (type === 'pie') {
      chartIns = new Pie(config)
    } else if (type === 'bar') {
      chartIns = new Bar(config)
    } else if (type === 'line') {
      chartIns = new Line(config)
    }
    if (config.custom && config.getOption) {
      chart.setOption(config.getOption(config.data))
    } else {
      chart.setOption(chartIns.getOption())
    }

    return chart
  }

}

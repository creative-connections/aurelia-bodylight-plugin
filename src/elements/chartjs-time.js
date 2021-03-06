import {bindable} from 'aurelia-templating';
import {Chartjs} from './chartjs';
import {useView} from 'aurelia-templating';
//import {PLATFORM} from 'aurelia-pal';
//@customElement
//@useView(PLATFORM.moduleName('./bdl-chartjs.html'))
@useView('./chartjs.html')
export class ChartjsTime extends Chartjs {
  @bindable fromid;
  @bindable labels;
  @bindable refindex;
  @bindable refvalues;
  @bindable type;
  @bindable min;
  @bindable max;

  constructor() {
    super();
    //this.type = 'line';
    this.handleValueChange = e => {
      //e.detail do not reallocate - using same buffer, thus slicing to append to data array
      //let datapoints =e.detail.data.slice(this.refindex, this.refendindex);
      let j = 0;
      for (let i = this.refindex; i < this.refindex + this.refvalues; i++) {
        //adds data to datasets

        //if convert operation is defined as array then convert
        if (this.operation && this.operation[j]) this.chart.data.datasets[j].data.push(this.operation[j](e.detail.data[i]));
        //else push data directly
        else this.chart.data.datasets[j].data.push(e.detail.data[i]);
        if (this.chart.data.datasets[j].data.length > this.maxdata) {
          //console.log('shifting dataset chartjs-time', this.chart.data.datasets[j].data);
          this.chart.data.datasets[j].data.shift();
        }
        j++;
      }
      this.chart.data.labels.push(e.detail.time);
      if (this.chart.data.labels.length > this.maxdata) {
        this.chart.data.labels.shift();
        if (this.sectionid) {
          //shift sections
          if (this.chart.config.options.section[0].index === 0) this.chart.config.options.section.shift();
          //decrement all indices in sections
          for (let i = 0; i < this.chart.config.options.section.length; i++) this.chart.config.options.section[i].index -= 1;
        }
      }
      //shift - remove first element if data is too big
      //console.log('chartjs handlevaluechange() chart.data.datasets[0].data', this.chart.data.datasets[0].data);
      this.chart.update();
    };
  }

  /**
   * sets all tim-series specific options for chartjs
   */
  bind() {
    super.bind();
    //done in super
    //this.chlabels = this.labels.split(','); //labels for each dataset
    //this.colors = [];
    let datasets = [];
    let mydata1 = this.initialdata.split(';');
    for (let i = 0; i < (this.refvalues + 1); i++) { //mydata[0] == timelabels in x axis, mydata[1..n] ar in y axis
      let mydata2 = (mydata1[i]) ? mydata1[i].split(',') : [];
      this.mydata[i] = mydata2.map(x => {return parseFloat(x);});
      //console.log('chartjstime mydata i',this.mydata[i]);
    }

    //initialize colors for each dataset
    for (let i = 0; i < this.refvalues; i++) {
      //this.colors.push(this.selectColor(i));
      datasets.push({
        data: this.mydata[i + 1],
        label: this.chlabels[i],
        backgroundColor: this.selectColor(i),
        borderColor: this.selectColor(i),
        borderWidth: 1,
        pointRadius: 1,
        fill: false
      });
      //timelabels.push(i);
    }

    this.data = {
      labels: this.mydata[0],
      datasets: datasets
    };
    if (this.verticalline) this.type = 'LineWithLine';
    else this.type = 'line';
    if (this.min) {
      //sets yscale min
      if (!this.options) this.options = {};
      if (!this.options.scales) this.options.scales = {};
      if (!this.options.scales.yAxes) this.options.scales.yAxes = [{}]; //chartjs 2.9.4
      if (!this.options.scales.yAxes[0].ticks) this.options.scales.yAxes[0].ticks = {}; //chartjs 2.9.4
      this.options.scales.yAxes[0].ticks.min = parseFloat(this.min);
    }
    if (this.max) {
      //sets yscale max
      if (!this.options) this.options = {};
      if (!this.options.scales) this.options.scales = {};
      if (!this.options.scales.yAxes) this.options.scales.yAxes = [{}]; //chartjs 2.9.4
      if (!this.options.scales.yAxes[0].ticks) this.options.scales.yAxes[0].ticks = {}; //chartjs 2.9.4
      this.options.scales.yAxes[0].ticks.max = parseFloat(this.max);
      //if (this.min) this.options.scales.yAxes[0].ticks.stepSize = (this.options.scales.yAxes[0].ticks.max - this.options.scales.yAxes[0].ticks.min) / 10;
    }
  }

  resetdata() {
    //super.resetdata();
    for (let j = 0; j < this.refvalues; j++) this.chart.data.datasets[j].data = [];
    this.chart.data.labels = [];
    this.chart.update();
  }
}

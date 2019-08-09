import { Component, OnInit, ViewChild } from '@angular/core';
import { DataService } from '../data.service';
import { IDoughnutColors, IDoughnutDataRecord } from '../models/doughnut-charts';
import { IRangeData } from '../models/range';
import { IgxDoughnutChartComponent} from 'igniteui-angular-charts/ES5/igx-doughnut-chart-component';
import { IgxRingSeriesComponent} from 'igniteui-angular-charts/ES5/igx-ring-series-component';
import { LabelsPosition } from 'igniteui-angular-charts/ES5/LabelsPosition';

@Component({
  selector: 'app-campaign-health',
  templateUrl: './campaign-health.component.html',
  styleUrls: ['./campaign-health.component.scss']
})
export class CampaignHealthComponent implements OnInit {

  public doughnutChartColors: IDoughnutColors;
  public doughnutData: IDoughnutDataRecord[];
  private formatter;

  @ViewChild(IgxDoughnutChartComponent, {static: true})
  chart: IgxDoughnutChartComponent;

  constructor(private service: DataService) {

    this.doughnutChartColors = {
      ppc: {
        end: { value: '#ffbf00', bkg: '#5c432b', label: '#222' },
        start: { value: '#826100', bkg: '#402d32', label: '#ccc' }
      },
      email: {
        end: { value: '#ff6600', bkg: '#5c2c2b', label: '#ccc' },
        start: { value: '#732e00', bkg: '#402232', label: '#ccc' }
      },
      banners: {
        end: { value: '#4ba4aa', bkg: '#2f3c55', label: '#ccc' },
        start: { value: '#2d6165', bkg: '#2a2a47', label: '#ccc' }
      },
      thirdParty: {
        end: { value: '#f0f0f0', bkg: '#584f67', label: '#222' },
        start: { value: '#7f7f7f', bkg: '#3e334f', label: '#ccc' }
      }
    };
    this.formatter = (context) => {
      if (!context.item.showLabel) { return ''; }
      return Math.round(context.percentValue) + '%';
    };
  }

  ngOnInit() {
    this.chart.sliceClick.subscribe( event => {
      event.args.i.dataContext.showLabel = event.args.i.slice.isSelected;
      this.chart.series.toArray().forEach(s => {
        s.formatLabel = this.formatter;
      });
    });

    this.service.onDataFetch.subscribe((data: IRangeData) => {
      this.chart.series.clear();
      this.doughnutData = [
        { label: 'PPC', value: data.end.ppc , prev: data.start.ppc},
        { label: 'Banners', value: data.end.banners, prev: data.start.banners },
        { label: 'Email', value: data.end.email, prev: data.start.email },
        { label: '3rd Party', value: data.end.thirdParty, prev: data.start.thirdParty }
      ];

      this.renderDoughnutChart(this.chart, this.doughnutChartColors);
    });
  }

  public renderDoughnutChart(chart: IgxDoughnutChartComponent, doughnutColors: IDoughnutColors) {
      chart.width = '120%';
      chart.height = '500px';
      chart.innerExtent = 20;
      chart.allowSliceSelection = true;
      chart.selectedSliceStrokeThickness = 7;

      const colors = [];
      const fadedColors = [];

      Object.keys(doughnutColors).forEach(key => {
        colors.push(doughnutColors[key].end.value);
        fadedColors.push(doughnutColors[key].end.value);
      });

      this.generateSeries('End', this.doughnutData, colors, fadedColors).forEach(s => {
        chart.series.add(s);
      });
  }

  public generateSeries(name: string, data: IDoughnutDataRecord[], colors: string[], fadedColors: string[]) {
    const series = [];

    for (let index = 0; index < 2; index++) {
      const ringSeries = new IgxRingSeriesComponent();
      if (index === 0 ) {
        ringSeries.i.name = `${name}2`;
        ringSeries.brushes = fadedColors;
        ringSeries.outlines = fadedColors;
        ringSeries.valueMemberPath = 'prev';
        ringSeries.radiusFactor = 0.8;

      } else {
        ringSeries.i.name = name;
        ringSeries.brushes = colors;
        ringSeries.outlines = colors;
        ringSeries.valueMemberPath = 'value';
      }

      ringSeries.labelsPosition = LabelsPosition.Center;
      ringSeries.dataSource = data;
      ringSeries.startAngle = -90;
      ringSeries.labelMemberPath = 'label';
      ringSeries.formatLabel = this.formatter;

      series.push(ringSeries);
    }

    return series;
  }
}

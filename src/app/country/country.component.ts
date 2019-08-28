import { Component, OnInit,AfterViewInit, ViewChild, ElementRef, Input,SimpleChanges } from '@angular/core';
import * as am4maps from '@amcharts/amcharts4/maps';
import * as am4core from '@amcharts/amcharts4/core';
import useGeodata from '@amcharts/amcharts4-geodata/mexicoHigh';
import usaAlbersLow from '@amcharts/amcharts4-geodata/usaAlbersLow';
import continentsRussiaEuropeLow from '@amcharts/amcharts4-geodata/continentsRussiaEuropeLow';
import am4themes_animated from '@amcharts/amcharts4/themes/animated';
import am4geodata_worldLow from "@amcharts/amcharts4-geodata/worldLow";

@Component({
  selector: 'app-country',
  templateUrl: './country.component.html',
  styleUrls: ['./country.component.scss']
})
export class CountryComponent implements AfterViewInit {

  @ViewChild('chartElement', { static: true }) chartElement: ElementRef<any>;
  @Input() country: string;

  state: any = {};

  constructor() {}

  ngOnChanges(changes: SimpleChanges): void {
    this.ngAfterViewInit();
  }
  getCountry(state) {
    const select = {
      'MX': useGeodata,
      'US': usaAlbersLow,
      'UE': am4geodata_worldLow,
      'LA': am4geodata_worldLow,
    };
    return select[state];
  }

  getState(data) {
    this.state = data;
  }

  ngAfterViewInit() {
    am4core.useTheme(am4themes_animated);

    const chart = am4core.create(this.chartElement.nativeElement, am4maps.MapChart);
    // Set map definition
    chart.geodata =  this.getCountry(this.country);

    // Set projection
    if(this.country === 'LA' || 'UE') {
      console.log('entra');
      chart.projection = new am4maps.projections.Miller();
    } else {
      chart.projection = new am4maps.projections.Albers();
    }

    // Create map polygon series
    const polygonSeries = chart.series.push(new am4maps.MapPolygonSeries());

    // Set min/max fill color for each area

    polygonSeries.heatRules.push({
      property: 'fill',
      target: polygonSeries.mapPolygons.template,
      min: chart.colors.getIndex(1).brighten(1),
      max: chart.colors.getIndex(1).brighten(-0.3)
    });

    polygonSeries.useGeodata = true;
    // Configure series tooltip
    const polygonTemplate = polygonSeries.mapPolygons.template;
    polygonTemplate.nonScalingStroke = true;
    polygonTemplate.strokeWidth = 0.5;
    polygonTemplate.tooltipText = '{name}';
    polygonTemplate.fill = chart.colors.getIndex(0);

    // Create hover state and set alternative fill color
    const hs = polygonTemplate.states.create('hover');
    hs.properties.fill = am4core.color('#8AC8D6');

    if (this.country === 'LA') {
      polygonSeries.include = ['MX', 'GT', 'SV', 'HN', 'NI', 'CR', 'PA', 'CO',
        'VE', 'EC', 'PE', 'BR', 'BO', 'AR', 'PY', 'CL', 'UY', 'GY'
      ];
    } else if (this.country === 'UE') {
      polygonSeries.include = [ 'DE', 'AT', 'BE', 'GB', 'CY', 'HR', 'DK', 'SK',
        'SI', 'ES', 'EE', 'FI', 'FR', 'LV', 'LU', 'GR', 'HU', 'IE', 'IT', 'LT',
        'MT', 'NL', 'PL', 'PT', 'CZ', 'RO', 'SE'
      ];
    }


    // Create is active

    const activeState = polygonTemplate.states.create('active');
    activeState.properties.fill = chart.colors.getIndex(4);

    let lastSelected;
    polygonTemplate.events.on('hit', (ev) => {

      if (lastSelected) {
        lastSelected.isActive = false;
      }
      if (lastSelected !== ev.target) {
        ev.target.isActive = !ev.target.isActive;
        lastSelected = ev.target;
      }
      this.getState(ev.target.dataItem.dataContext);
    });



  }
}

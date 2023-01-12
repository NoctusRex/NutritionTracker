import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { BaseComponent } from 'src/app/core/components/base-component/base.component';
import { Location } from '@angular/common';
import { map, Observable } from 'rxjs';
import { ItemPosition } from 'src/app/core/models/item-position.model';
import { ItemPositionService } from 'src/app/core/services/item-position.serivce';
import { first, get, last, map as _map, orderBy } from 'lodash';
import { Layout } from 'plotly.js';
import { Config, PlotData } from 'plotly.js-dist-min';
import moment from 'moment';
import { TranslationService } from 'src/app/core/services/translation.service';

@Component({
  selector: 'app-history',
  templateUrl: 'history.page.html',
})
export class HistoryPage extends BaseComponent implements OnInit {
  selection: 'filter' | 'all' | 'month' | 'week' = 'all';
  currentGraphInformation: string = 'calories';
  graphInformation: Array<string> = [
    'calories',
    'totalFat',
    'saturatedFat',
    'totalCarbohydrate',
    'sugar',
    'protein',
    'sodium',
    'fiber',
  ];

  groups!: Array<{ date: string; positions: Array<ItemPosition> }>;

  graph = {
    data: [
      {
        type: 'bar',
      } as PlotData,
    ],
    layout: {
      margin: { b: 50, l: 10, t: 10, r: 10 },
      yaxis: { visible: false },
    } as Partial<Layout>,
    config: {
      displayModeBar: false,
      displaylogo: false,
      editable: false,
      responsive: true,
      staticPlot: true,
    } as Config,
  };

  constructor(
    router: Router,
    location: Location,
    private itemPositionService: ItemPositionService,
    private translationService: TranslationService
  ) {
    super(router, location);
  }

  ngOnInit(): void {
    this.setGroups();
  }

  private setGroups(): void {
    this.itemPositionService.values$
      .pipe(
        map((positions) => {
          const groups: Array<{
            date: string;
            positions: Array<ItemPosition>;
          }> = [];

          positions
            .filter((position) => {
              switch (this.selection) {
                case 'month':
                  return moment(position.timeStampAdded).isAfter(
                    moment().add(-30, 'days')
                  );
                case 'week':
                  return moment(position.timeStampAdded).isAfter(
                    moment().add(-7, 'days')
                  );
                case 'filter':
                default:
                  return true;
              }
            })
            .forEach((position) => {
              let group = groups.find(
                (x) => x.date === position.timeStampAdded
              );

              if (!group) {
                group = { date: position.timeStampAdded, positions: [] };
                groups.push(group);
              }

              group.positions.push(position);
            });

          return groups;
        })
      )
      .subscribe((groups) => {
        this.groups = orderBy(groups, ['date'], ['desc']);

        this.setGraphData();
      });
  }

  private setGraphData(): void {
    this.graph.data[0].x = [];
    this.graph.data[0].y = [];
    this.graph.data[0].text = [];
    this.graph.layout.width = this.getWidth();
    this.graph.layout.height = this.getHeigth();

    const maxDate = new Date(first(this.groups)?.date!);
    const minDate = new Date(last(this.groups)?.date!);

    const filledGroups: Array<{
      date: string;
      positions: Array<ItemPosition>;
    }> = [];
    let currentDate = new Date(minDate);

    while (currentDate <= maxDate) {
      const currentDateString = currentDate.toISOString().split('T')[0];
      const existing = this.groups.find((x) => x.date === currentDateString);

      if (!existing) {
        filledGroups.push({ date: currentDateString, positions: [] });
      } else {
        filledGroups.push(existing);
      }

      currentDate.setDate(currentDate.getDate() + 1);
    }

    filledGroups.forEach((group) => {
      const total = this.itemPositionService.getTotal(group.positions);
      const value: number = get(total, this.currentGraphInformation);

      (this.graph.data[0].x as any).push(moment(group.date).format('DD.MMㅤ')); // the "ㅤ" is important!
      (this.graph.data[0].y as any).push(value!);
      (this.graph.data[0] as any).text.push(value!.toString());
    });
  }

  changeSelection(filter: 'filter' | 'all' | 'month' | 'week'): void {
    this.selection = filter;

    this.setGroups();
  }

  changeGraphSelection(): void {
    let nextIndex =
      this.graphInformation.indexOf(this.currentGraphInformation) + 1;
    if (nextIndex >= this.graphInformation.length) nextIndex = 0;

    this.currentGraphInformation = this.graphInformation[nextIndex];

    this.setGraphData();
  }

  getWidth(): number {
    return window.innerWidth;
  }

  getHeigth(): number {
    return window.innerHeight * 0.2;
  }

  getSelectionText$(): Observable<string> {
    switch (this.selection) {
      case 'month':
        return this.translationService.translate$(
          'pages.tabs.history.content.SELECTION_TEXT_MONTH'
        );
      case 'week':
        return this.translationService.translate$(
          'pages.tabs.history.content.SELECTION_TEXT_WEEK'
        );
      case 'filter':
        return this.translationService.translate$(
          'pages.tabs.history.content.SELECTION_TEXT_FILTER',
          { min: 'x-x-x', max: 'x-x-x' }
        );
      default:
        return this.translationService.translate$(
          'pages.tabs.history.content.SELECTION_TEXT_ALL'
        );
    }
  }

  getGraphInformationText(): string {
    return `pages.tabs.history.content.GRAPH_INFORMATION_${this.currentGraphInformation.toUpperCase()}`;
  }

  removePosition(position: ItemPosition): void {
    this.itemPositionService.remove$(position).subscribe();
  }
}

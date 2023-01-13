import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { BaseComponent } from 'src/app/core/components/base-component/base.component';
import { Location } from '@angular/common';
import { map, Observable, of } from 'rxjs';
import { ItemPosition } from 'src/app/core/models/item-position.model';
import { ItemPositionService } from 'src/app/core/services/item-position.serivce';
import {
  cloneDeep,
  fill,
  first,
  get,
  last,
  map as _map,
  orderBy,
  take,
} from 'lodash';
import { Layout } from 'plotly.js';
import { Config, PlotData } from 'plotly.js-dist-min';
import moment from 'moment';
import { TranslationService } from 'src/app/core/services/translation.service';
import { ModalService } from 'src/app/core/services/modal.service';
import { HistoryFilterModalPageComponent } from 'src/app/pages/modals/history-filter/history-filter-modal.page';

@Component({
  selector: 'app-history',
  templateUrl: 'history.page.html',
})
export class HistoryPage extends BaseComponent implements OnInit {
  selection: 'filter' | 'all' | 'month' | 'week' = 'month';
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
  showMissingDays = false;
  groups!: Array<{ date: string; positions: Array<ItemPosition> }>;
  min: string = '';
  max: string = '';

  graph = {
    data: [
      {
        type: 'bar',
      } as PlotData,
    ],
    layout: {
      margin: { b: 65, l: 10, t: 10, r: 10 },
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
    private translationService: TranslationService,
    private modalSerivce: ModalService
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
                  return (
                    moment(position.timeStampAdded).isAfter(
                      moment(this.min).add(-1, 'days')
                    ) &&
                    moment(position.timeStampAdded).isBefore(
                      moment(this.max).add(1, 'days')
                    )
                  );

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
    this.graph.layout.annotations = [];

    const maxDate = new Date(first(this.groups)?.date!);
    const minDate = new Date(last(this.groups)?.date!);

    let filledGroups: Array<{
      date: string;
      positions: Array<ItemPosition>;
    }> = [];
    if (this.showMissingDays) {
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
    } else {
      filledGroups = cloneDeep(this.groups).reverse();
    }
    // can not display > 30 elements in a fancy way
    if (filledGroups.length > 30) {
      this.translationService
        .translate$('pages.tabs.history.content.GRAPH_TO_MANY_ELEMENTS')
        .subscribe((text) => {
          this.graph.layout.annotations = [
            { showarrow: false, text, align: 'center' },
          ];
        });
      return;
    }

    // can not display > 30 elements in a fancy way
    if (filledGroups.length <= 0) {
      this.translationService
        .translate$('pages.tabs.history.content.GRAPH_NO_ELEMENTS')
        .subscribe((text) => {
          this.graph.layout.annotations = [
            { showarrow: false, text, align: 'center' },
          ];
        });
      return;
    }

    filledGroups.forEach((group) => {
      const total = this.itemPositionService.getTotal(group.positions);
      const value: number = get(total, this.currentGraphInformation);

      (this.graph.data[0].x as any).push(moment(group.date).format('DD.MM.YY')); // the "ㅤ" is important!
      (this.graph.data[0].y as any).push(value!);
      (this.graph.data[0] as any).text.push(value!.toString());
    });
  }

  changeSelection(selection: 'filter' | 'all' | 'month' | 'week'): void {
    (selection === 'filter'
      ? this.modalSerivce
          .show$<{ min: string; max: string }>({
            component: HistoryFilterModalPageComponent,
            componentProps: { min: this.min, max: this.max },
          })
          .pipe(
            map((result) => {
              this.min = result.data.min;
              this.max = result.data.max;

              return null;
            })
          )
      : of(null)
    ).subscribe(() => {
      this.selection = selection;

      this.setGroups();
    });
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

  toggleShowMissingDays(): void {
    this.showMissingDays = !this.showMissingDays;
    this.setGraphData();
  }
}

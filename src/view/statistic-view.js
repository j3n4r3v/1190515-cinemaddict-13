import AbstractSmartView from "./abstract-smart-view";
import {getUserRank} from "../utils/user-rank-utils";

import Chart from "chart.js";
import ChartDataLabels from "chartjs-plugin-datalabels";

import {MINUTES_IN_HOUR} from "../const";
import dayjs from "dayjs";

const BAR_HEIGHT = 50;

const TimePeriod = {
  ALL_TIME: `all-time`,
  TODAY: `today`,
  PERONEPERIOD: 1,
  WEEK: `week`,
  PERWEEK: 7,
  MONTH: `month`,
  YEAR: `year`,
};

const renderChart = (statisticCtx, stats) => {
  return new Chart(statisticCtx, {
    plugins: [ChartDataLabels],
    type: `horizontalBar`,
    data: {
      labels: stats.map((stat) => stat.genre),
      datasets: [{
        data: stats.map((stat) => stat.count),
        backgroundColor: `#ffe800`,
        hoverBackgroundColor: `#ffe800`,
        anchor: `start`,
        barThickness: 24
      }]
    },
    options: {
      plugins: {
        datalabels: {
          font: {
            size: 20
          },
          color: `#ffffff`,
          anchor: `start`,
          align: `start`,
          offset: 40,
        }
      },
      scales: {
        yAxes: [{
          ticks: {
            fontColor: `#ffffff`,
            padding: 100,
            fontSize: 20
          },
          gridLines: {
            display: false,
            drawBorder: false
          },
        }],
        xAxes: [{
          ticks: {
            display: false,
            beginAtZero: true
          },
          gridLines: {
            display: false,
            drawBorder: false
          },
        }],
      },
      legend: {
        display: false
      },
      tooltips: {
        enabled: false
      }
    }
  });
};

const getTimeRange = (filter) => {
  const dateTo = dayjs().toDate();
  let dateFrom = dayjs().toDate();

  switch (filter) {

    case TimePeriod.ALL_TIME:
      dateFrom = null;
      break;
    case TimePeriod.TODAY:
      dateFrom.setDate(dateTo.getDate() - TimePeriod.PERONEPERIOD);
      break;
    case TimePeriod.WEEK:
      dateFrom.setDate(dateTo.getDate() - TimePeriod.PERWEEK);
      break;
    case TimePeriod.MONTH:
      dateFrom.setMonth(dateTo.getMonth() - TimePeriod.PERONEPERIOD);
      break;
    case TimePeriod.YEAR:
      dateFrom.setFullYear(dateTo.getFullYear() - TimePeriod.PERONEPERIOD);
      break;
  }

  return [dateFrom, dateTo];
};

const sortByGenre = (films) => {
  const uniqueGenres = [];
  const genresOfEveryFilm = films.map((film) => film.genres);

  genresOfEveryFilm.forEach((genres) => {
    genres.forEach((genre) => {
      if (!uniqueGenres.some((uniqueGenre) => uniqueGenre === genre)) {
        uniqueGenres.push(genre);
      }
    });
  });

  const genresStat = [];

  uniqueGenres.forEach((uniqueGenre) => {
    const uniqueGenreCount = genresOfEveryFilm.reduce((acc, genres) => {
      const isThere = genres.some((genre) => genre === uniqueGenre);

      if (isThere) {
        return acc + 1;
      }

      return acc;
    }, 0);

    genresStat.push({
      genre: uniqueGenre,
      count: uniqueGenreCount,
    });
  });

  return genresStat.sort((a, b) => b.count - a.count);
};

const getFilmsByTimeRange = (films, filter) => {
  const [dateFrom, dateTo] = getTimeRange(filter);

  if (!(dateFrom instanceof Date)) {
    return films;
  }

  return films.filter((film) => {
    return film.watchingDate <= dateFrom && film.watchingDate <= dateTo;
  });
};

const createTotalDurationMarkup = (films) => {
  const totalDuration = films.reduce((sum, film) => {
    return sum + film.duration;
  }, 0);

  const hours = `${Math.trunc(totalDuration / MINUTES_IN_HOUR)} <span class="statistic__item-description">h</span>`;

  const minutes = `${totalDuration % MINUTES_IN_HOUR} <span class="statistic__item-description">m</span>`;

  return `${hours} ${minutes}`;
};

const createStatisticsTemplate = (films, activeFilter) => {
  const userRank = getUserRank(films.length);

  const filteredFilms = getFilmsByTimeRange(films, activeFilter);

  const filteredFilmsCount = filteredFilms.length;

  const sortedByGenre = sortByGenre(filteredFilms);

  const topGenre = filteredFilmsCount ? sortedByGenre[0].genre : null;

  const totalDurationMarkup = createTotalDurationMarkup(filteredFilms);

  return `<section class="statistic">${userRank ?
    `<p class="statistic__rank">Your rank
        <img class="statistic__img" src="images/bitmap@2x.png" alt="Avatar" width="35" height="35">
        <span class="statistic__rank-label">${userRank}</span>
      </p>` : ``}
      <form action="https://echo.htmlacademy.ru/" method="get" class="statistic__filters">
        <p class="statistic__filters-description">Show stats:</p>
        <input type="radio" class="statistic__filters-input visually-hidden" name="statistic-filter" id="statistic-all-time" value="all-time" ${activeFilter === `all-time` ? `checked` : ``}>
        <label for="statistic-all-time" class="statistic__filters-label">All time</label>
        <input type="radio" class="statistic__filters-input visually-hidden" name="statistic-filter" id="statistic-today" value="today" ${activeFilter === `today` ? `checked` : ``}>
        <label for="statistic-today" class="statistic__filters-label">Today</label>
        <input type="radio" class="statistic__filters-input visually-hidden" name="statistic-filter" id="statistic-week" value="week" ${activeFilter === `week` ? `checked` : ``}>
        <label for="statistic-week" class="statistic__filters-label">Week</label>
        <input type="radio" class="statistic__filters-input visually-hidden" name="statistic-filter" id="statistic-month" value="month" ${activeFilter === `month` ? `checked` : ``}>
        <label for="statistic-month" class="statistic__filters-label">Month</label>
        <input type="radio" class="statistic__filters-input visually-hidden" name="statistic-filter" id="statistic-year" value="year" ${activeFilter === `year` ? `checked` : ``}>
        <label for="statistic-year" class="statistic__filters-label">Year</label>
      </form>
      <ul class="statistic__text-list">
        <li class="statistic__text-item">
          <h4 class="statistic__item-title">You watched</h4>
          <p class="statistic__item-text">${filteredFilmsCount} <span class="statistic__item-description">movies</span></p>
        </li>
      ${filteredFilmsCount ?
    ` <li class="statistic__text-item">
        <h4 class="statistic__item-title">Total duration</h4>
        <p class="statistic__item-text">${totalDurationMarkup}</p>
      </li>
      <li class="statistic__text-item">
        <h4 class="statistic__item-title">Top genre</h4>
        <p class="statistic__item-text">${topGenre}</p>
      </li>
      ` : ``}
      </ul>
      <div class="statistic__chart-wrap">
        <canvas class="statistic__chart" width="1000" height="${BAR_HEIGHT * sortedByGenre.length}"></canvas>
      </div>
    </section>`;
};

export default class StatisticsView extends AbstractSmartView {
  constructor(filmsModel) {
    super();

    this._filmsModel = filmsModel;

    this._activeFilter = TimePeriod.ALL_TIME;

    this._filmsChart = null;
    this._statisticCtx = null;

    this._setFilterClickHandler();
    this._renderChart();
  }

  getTemplate() {
    return createStatisticsTemplate(this._filmsModel.getWatchedFilms(), this._activeFilter);
  }

  show() {
    super.show();

    this._activeFilter = TimePeriod.ALL_TIME;

    this.updateElement();
  }

  restoreHandlers() {
    this._setFilterClickHandler();
  }

  updateElement() {
    super.updateElement();

    this._renderChart();
  }

  _setFilterClickHandler() {
    this.getElement().querySelector(`.statistic__filters`).addEventListener(`change`, (evt) => {
      this._activeFilter = evt.target.value;

      this.updateElement();
    });
  }

  _renderChart() {
    const statisticCtx = this.getElement().querySelector(`.statistic__chart`);

    this._resetCharts();

    const filteredFilms = getFilmsByTimeRange(this._filmsModel.getWatchedFilms(), this._activeFilter);

    const genresStats = sortByGenre(filteredFilms);

    this._statisticCtx = renderChart(statisticCtx, genresStats);
  }

  _resetCharts() {
    if (this._filmsChart) {
      this._filmsChart.destroy();
      this._filmsChart = null;
    }
  }
}


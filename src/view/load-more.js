import AbstractComponent from "./abstract-component";

export const createLoadMoreTemplate = () => {
  return `<button class="films-list__show-more">Show more</button>`;
};

export default class LoadMoreButtonView extends AbstractComponent {
  // constructor() {
  //   super();
  //   this._clickHandler = this._clickHandler.bind(this);
  // }
  getTemplate() {
    return createLoadMoreTemplate();
  }
  _clickHandler(evt) {
    evt.preventDefault();
    this._callback.click();
  }
  setClickHandler(callback) {
    this._callback.click = callback;
    this.getElement().addEventListener(`click`, this._clickHandler);
  }
}

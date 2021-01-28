import AbstractSmartComponent from "./abstract-smart-component";
import {SHAKE_ANIMATION_TIMEOUT} from "../const.js";
import dayjs from "dayjs";
import he from "he";

const createCommentsTemplate = (allComments) => {
  return allComments.map(({emotion, comment, date, author, id}) => {
    const setDateView = (commentDate) => new Date().setMonth(new Date().getMonth() - 1) > commentDate ? dayjs(commentDate).format(`DD MM YYYY`) : dayjs(commentDate).toDate();
    return (
      `<li class="film-details__comment">
        <span class="film-details__comment-emoji">
          <img src="./images/emoji/${emotion}.png" width="55" height="55" alt="emoji-${emotion}">
        </span>
        <div>
          <p class="film-details__comment-text">${he.encode(comment)}</p>
          <p class="film-details__comment-info">
            <span class="film-details__comment-author">${author}</span>
            <span class="film-details__comment-day">${setDateView(date)}</span>
            <button data-id="${id}" class="film-details__comment-delete">Delete</button>
          </p>
        </div>
      </li>`
    );
  }).join(`\n`);
};

const createFilmDetailsCommentsTemplate = (comments) => {
  const commentsTemplate = createCommentsTemplate(comments);

  return (
    `<section class="film-details__comments-wrap">
        <h3 class="film-details__comments-title">Comments <span class="film-details__comments-count">${comments ? comments.length : `0`} </span></h3>
        <ul class="film-details__comments-list">
          ${commentsTemplate}
        </ul>
      </section>`
  );
};

export default class FilmDetailsCommentsView extends AbstractSmartComponent {
  constructor(comments) {
    super();

    this._comments = comments;
  }

  getTemplate() {
    return createFilmDetailsCommentsTemplate(this._comments);
  }

  setDeleteButtonHandler(callback) {
    this.getElement().addEventListener(`click`, (evt) => {
      if (evt.target.tagName !== `BUTTON`) {
        return;
      }
      evt.preventDefault();
      evt.target.disabled = true;
      evt.target.textContent = `Deleting...`;
      callback(evt.target.dataset.id);
    });
  }

  shakeComment(commentId) {
    const index = this._comments.findIndex((comment) => comment.id === commentId);
    const comment = this.getElement().querySelectorAll(`.film-details__comment`)[index];
    comment.disabled = false;
    comment.style.animation = `shake ${SHAKE_ANIMATION_TIMEOUT / 1000}s`;

    setTimeout(() => {
      comment.style.animation = ``;

    }, SHAKE_ANIMATION_TIMEOUT);
  }
}

import GAMEINFO, { ColorD2X } from "../game_dataset.js";

export default class FitGame {
    constructor(query) {
        this.currentstage = 1;
        GAMEINFO.initCurrentGame("fit", this.currentstage);

        this.$container = $(query);
        this.$answerRow = $(query).children("#answer");
        this.$optionRow = $(query).children("#option");

        this.initGame();

        this.clickedQuery;
        this.perfectScore = 0;
        this.fitGameScore = 0;
    }
    initGame() {
        this.$answerRow.append(`<div class="col p-3"><div class="color" style="background-color: ${GAMEINFO.givenArr[0]};"></div></div>`);
        GAMEINFO.optionArr.forEach((el, i) => {
            this.$optionRow.append(`<div class="col p-2 h-25 column-${i%2} mx-auto my-auto">
            <div class="color" style="background-color: ${el};"></div>
            </div>`);
            this.$optionRow.find("div.color").off().on({
                "pointerdown": this.onDown,
                "pointerenter": this.onEnter,
                "pointerleave": this.onLeave,
                "pointerup": this.onUp
            }, null, {
                app: this,
                animate: (col) => {
                    col.toggleClass("h-25 h-50 col col-7");
                    const divClassColIndex = col.attr("class").indexOf("column-") + 7;
                    if (col.attr("class").slice(divClassColIndex, divClassColIndex + 1) == '0') col.next().toggleClass("h-25 h-50 col col-5");
                    else col.prev().toggleClass("h-25 h-50 col col-5");
                }
            })
        });
    }

    /* event handler jQuery code */
    onDown(e) {
        e.data.clickedQuery = e.target;
        if (e.pointerType == "mouse") { // pc: click the color
            e.data.app.clickedQuery = e.target;
            e.data.app.scoreNnextGame();
        }
    }
    onEnter(e) {
        const enteredCol = $(e.target).parent()
        e.data.enteredCol = enteredCol;
        e.data.animate(enteredCol);
    }
    onLeave(e) {
        const enteredCol = e.data.enteredCol;
        e.data.animate(enteredCol);
        e.data.clickedQuery = undefined;
    }
    onUp(e) {
        if (e.data.clickedQuery == e.target) { // mobile: ondown n onup in the same color
            e.data.app.clickedQuery = e.target;
            e.data.app.scoreNnextGame();
        }
    }

    /* event handler jQuery code ends */

    scoreNnextGame() {
        this.$optionRow.find("div.color").off();
        this.perfectScore += GAMEINFO.optionArr.length / 2;
        const colorStyleIndex = $(this.clickedQuery).attr("style").indexOf("background-color:") + 18;
        console.log($(this.clickedQuery).attr("style").slice(colorStyleIndex, colorStyleIndex + 7));
        if ($(this.clickedQuery).attr("style").slice(colorStyleIndex, colorStyleIndex + 7) == GAMEINFO.givenArr[0]) {
            this.fitGameScore += GAMEINFO.optionArr.length / 2;
        }
        this.currentstage += 1;
        try {
            GAMEINFO.initCurrentGame("fit", this.currentstage);
        } catch (err) {
            if (err == "End Of Stage") {
                this.$currentClickEvent.off("click");
                this.$contextRow.children().fadeOut(300);
                this.gradeFitGame();
                return;
            }
        }
        this.$answerRow.children().remove();
        this.$optionRow.children().remove();

        this.initGame();
    }
    gradeFitGame() {

    }
}
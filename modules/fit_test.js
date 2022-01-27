import GAMEINFO, { ColorD2X } from "../game_dataset.js";
import { submit, remainTime } from "../main.js";

export default class FitGame {
    constructor(query) {
        this.currentstage = 1;
        GAMEINFO.initCurrentGame("fit", this.currentstage);

        this.$container = $(query);
        this.$answerRow = $(query).children("#answer");

        this.initGame();

        this.clickedQuery;
        this.perfectScore = 0;
        this.fitGameScore = 0;
    }
    initGame() {
        this.$answerRow.append(`<div class="col p-3">
        <div class="color mx-auto my-auto" style="background-color: ${GAMEINFO.givenArr[0]}; display:none;"></div>
        </div>`);
        const NumOfRow = parseInt(GAMEINFO.optionArr.length / 2);
        for (let i = 0; i < NumOfRow; i++) {
            this.$container.append(`<div id="option-row-${i}" class="row row-cols-2" style="height: ${NumOfRow==1?"20%":"15%"};"></div>`);
        }
        GAMEINFO.optionArr.forEach((el, i) => {
            $(`#option-row-${parseInt(i/2)}`).append(`<div class="column-${i%2} col p-2">
            <div class="color mx-auto my-auto" style="background-color: ${el};  display:none;"></div>
            </div>`);
            $(`#option-row-${parseInt(i/2)} > .column-${i%2} > .color`).off().on({
                "pointerdown": this.onDown,
                "pointerenter": this.onEnter,
                "pointerleave": this.onLeave,
                "pointerup": this.onUp
            }, null, {
                app: this,
                animateIn: (col) => {
                    col.parent().attr("style", `height: ${NumOfRow==1?"23%":"17%"};`);
                    col.parent().siblings("#option-row-0,#option-row-1,#option-row-2,#option-row-3").attr("style", "height: 11.5%;");
                    const findClassOfCol = col.attr("class").indexOf("column-") + 7;
                    const columnIndex = col.attr("class").slice(findClassOfCol, findClassOfCol + 1);
                    if (columnIndex == '0') {
                        $(".column-0").toggleClass("col col-7");
                        $(".column-1").toggleClass("col col-5");
                    } else {
                        $(".column-1").toggleClass("col col-7");
                        $(".column-0").toggleClass("col col-5");
                    }
                },
                animateOut: (col) => {
                    col.parent().attr("style", `height: ${NumOfRow==1?"20%":"15%"};`);
                    col.parent().siblings("#option-row-0,#option-row-1,#option-row-2,#option-row-3").attr("style", `height: ${NumOfRow==1?"20%":"15%"};`);
                    const findClassOfCol = col.attr("class").indexOf("column-") + 7;
                    const columnIndex = col.attr("class").slice(findClassOfCol, findClassOfCol + 1);
                    if (columnIndex == '0') {
                        $(".column-0").toggleClass("col col-7");
                        $(".column-1").toggleClass("col col-5");
                    } else {
                        $(".column-1").toggleClass("col col-7");
                        $(".column-0").toggleClass("col col-5");
                    }
                },
            })
        });
        $(".color").fadeIn(300);

        this.fitRemainTime = GAMEINFO.timeLimit;
        this.timer = setInterval(() => {
            if (this.fitRemainTime < 0.01) {
                this.scoreNnextGame();
            }
            this.fitRemainTime -= 0.01;
        }, 10);
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
        e.data.animateIn(enteredCol);
    }
    onLeave(e) {
        const enteredCol = e.data.enteredCol;
        e.data.animateOut(enteredCol);
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
        clearInterval(this.timer);
        $(".color").off();
        this.perfectScore += GAMEINFO.optionArr.length / 2;
        if (this.clickedQuery != undefined) {
            const colorStyleIndex = $(this.clickedQuery).attr("style").indexOf("background-color:") + 18;
            const colorStyleEnd = $(this.clickedQuery).attr("style").indexOf(");") + 1;
            let clickedColor = 0;
            let index = 0;
            $(this.clickedQuery)
                .attr("style")
                .slice(colorStyleIndex, colorStyleEnd)
                .split(/\D/)
                .forEach((RGBs, _i) => {
                    if (RGBs) {
                        clickedColor += RGBs * Math.pow(256, 2 - index);
                        index += 1;
                    }
                })
            if (clickedColor == GAMEINFO.givenArr[0]) {
                this.fitGameScore += GAMEINFO.optionArr.length / 2;
                GAMEINFO.TOTAL_SCORE += GAMEINFO.optionArr.length / 2 * GAMEINFO.fit.SCORE_RATE_FOR_EACH_FIT_PROB;
            }
        }
        this.currentstage += 1;
        try {
            GAMEINFO.initCurrentGame("fit", this.currentstage);
            this.$answerRow.children().fadeOut(this.clickedQuery != undefined ? 250 : 600);
            this.$container.children("#option-row-0,#option-row-1,#option-row-2,#option-row-3").fadeOut(250);
            this.$answerRow.children().remove();
            this.$container.children("#option-row-0,#option-row-1,#option-row-2,#option-row-3").remove();
            this.initGame();
        } catch (err) {
            if (err == "End Of Stage") {
                console.log("End Of Stage");
                GAMEINFO.TOTAL_SCORE += this.fitGameScore;
                if (this.perfectScore == this.fitGameScore) {
                    GAMEINFO.TOTAL_SCORE += remainTime * GAMEINFO.undertimeScore;
                }
                this.$answerRow.children().fadeOut(250);
                this.$container.children("#option-row-0,#option-row-1,#option-row-2,#option-row-3").fadeOut(250);
                submit(remainTime);
            }
        }
    }
}
import GAMEINFO, { ColorD2X } from "../game_dataset.js";
import { submit, remainTime } from "../main.js";

/** 보기의 색상이 #개일때 : #개의 행 */
const NUM_OF_ROW = { 2: 1, 3: 1, 4: 2, 6: 2, 8: 2, 9: 3 };

/** 보기의 색상이 #개일때 : #개의 열 */
const NUM_OF_COL = { 2: 2, 3: 3, 4: 2, 6: 3, 8: 4, 9: 3 };

export default class FitGame {
    constructor(query) {
        this.canvas = query;

        this.currentstage = 1;
        GAMEINFO.initCurrentGame("fit", this.currentstage);
        this.laststage = Object.keys(GAMEINFO.fit).filter(key => key.search(/\d/) != -1).length;

        this.$answerRow = $(query).children("#answer");

        this.initGame();

        this.timer;
        this.clickedQuery = undefined;
        this.perfectScore = 0;
        this.fitGameScore = 0;

        this.animateRQ = window.requestAnimationFrame(this.animate.bind(this));
    }
    initGame() {
        this.clickedQuery = undefined;
        $(".bar").fadeIn(300, "swing");
        this.$answerRow.append(`<div class="col p-3">
        <div class="color answer mx-auto my-auto" style="background-color: ${GAMEINFO.givenArr[0]}; display:none;"></div>
        </div>`);
        const boxwidth = window.innerWidth <= 410 ? window.innerWidth : 410;
        const NumOfRow = NUM_OF_ROW[GAMEINFO.optionArr.length];
        const NumOfCol = NUM_OF_COL[GAMEINFO.optionArr.length];
        $("#colorbox").css("height", `${30 + 10*NumOfRow}%`);
        document.documentElement.style.setProperty("--fit-color-width", `${boxwidth / NumOfCol * 0.7}px`);
        GAMEINFO.optionArr.forEach((el) => {
            $("#colorbox").append(`
            <div class="color option m-1" style="
            background-color: ${el}; 
            display:none;
            box-shadow: 5px 5px 16px 3px ${el}55;
            "></div>`);
            $(`.color.option`).off().on({
                "pointerdown": this.onDown,
                "pointerenter": this.onEnter,
                "pointerleave": this.onLeave,
                "pointerup": this.onUp
            }, null, {
                app: this,
            })
        });
        $(".color").fadeIn(300);

        this.fitRemainTime = GAMEINFO.timeLimit;
        this.isTimerOn = true;
        this.timer = setInterval(function(app) {
            app.fitRemainTime -= 0.01;
            if (app.fitRemainTime < 0.01) {
                app.scoreNnextGame(app.timer);
            }
        }, 10, this);
    }

    /* event handler jQuery code */
    onDown(e) {
        e.data.clickedQuery = e.target;
        if (e.pointerType == "mouse") { // pc: click the color
            e.data.app.clickedQuery = e.target;
            e.data.app.scoreNnextGame(e.data.app.timer);
        }
    }
    onEnter(e) {}
    onLeave(e) {
        e.data.clickedQuery = undefined;
    }
    onUp(e) {
        if (e.data.clickedQuery == e.target) { // mobile: ondown n onup in the same color
            e.data.app.clickedQuery = e.target;
            e.data.app.scoreNnextGame(e.data.app.timer);
        }
    }

    /* event handler jQuery code ends */

    animate() {
        this.animateRQ = window.requestAnimationFrame(this.animate.bind(this));
        const timeRate = (this.fitRemainTime / GAMEINFO.timeLimit * 95) <= 95 ? (this.fitRemainTime / GAMEINFO.timeLimit * 95) : 95;
        $(".downcount-bar > .bar").attr("style", `
        width : ${timeRate}%;
        background-color : hsl(${this.fitRemainTime / GAMEINFO.timeLimit * 46},87%,66%);
        `);
    }

    scoreNnextGame(timer) {
        clearInterval(timer);
        timer = null;
        $(".color.option").off();
        $(".bar").fadeOut(this.clickedQuery != undefined ? 250 : 800, "swing");
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
            if (ColorD2X(clickedColor) == GAMEINFO.givenArr[0].toLowerCase()) {
                this.fitGameScore += GAMEINFO.optionArr.length / 2;
                GAMEINFO.TOTAL_SCORE += GAMEINFO.optionArr.length / 2 * GAMEINFO.fit.SCORE_RATE_FOR_EACH_FIT_PROB;
            }
        }
        if (this.currentstage < this.laststage) {
            this.currentstage += 1;
            GAMEINFO.initCurrentGame("fit", this.currentstage);
            this.$answerRow.children().fadeOut(250);
            $("#colorbox").children().fadeOut(this.clickedQuery != undefined ? 250 : 800, "swing");
            $("#colorbox").children().promise().done(() => {
                this.$answerRow.children().remove();
                $("#colorbox").children().remove();
                this.initGame();
            });
        } else {
            GAMEINFO.TOTAL_SCORE += this.fitGameScore;
            if (this.perfectScore == this.fitGameScore) {
                GAMEINFO.TOTAL_SCORE += remainTime * GAMEINFO.SCORE_RATE_FOR_UNDERTIME;
            }
            $("#test-fit-1").children().fadeOut(250);
            submit();
        }
    }

    delAllReq() {
        this.animateRQ = window.cancelAnimationFrame(this.animateRQ);
    }
}
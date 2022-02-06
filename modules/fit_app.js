import GAMEINFO, { ColorD2X } from "../game_dataset.js";
import { submit, remainTime } from "../main.js";

export default class FitGame {
    constructor(query) {
        this.canvas = query;

        this.currentstage = 1;
        GAMEINFO.initCurrentGame("fit", this.currentstage);
        this.laststage = Object.keys(GAMEINFO.fit).filter(key => key.search(/\d/) != -1).length;

        this.$container = $(query);
        this.$answerRow = $(query).children("#answer");

        this.initGame();

        this.timer;
        this.clickedQuery = undefined;
        this.perfectScore = 0;
        this.fitGameScore = 0;

        window.requestAnimationFrame(this.animate.bind(this));
    }
    initGame() {
        this.clickedQuery = undefined;
        $(".bar").fadeIn(300, "swing");
        this.$answerRow.append(`<div class="col p-3">
        <div class="color answer mx-auto my-auto" style="background-color: ${GAMEINFO.givenArr[0]}; display:none;"></div>
        </div>`);
        const NumOfRow = parseInt(GAMEINFO.optionArr.length / 2);
        const NumOfCol = NumOfRow <= 2 ? 2 : 3;
        $("#colorbox").css("height", `${20*NumOfRow}%`);
        document.documentElement.style.setProperty("--fit-color-width", `${window.innerWidth / 3}px`);
        GAMEINFO.optionArr.forEach((el, i) => {
            $("#colorbox").append(`<div class="col-${parseInt(12/NumOfCol - 1)} g-0" style="height : ${100/NumOfRow}%;">
            <div class="color option mx-auto" style="
            background-color: ${el}; 
            display:none;
            box-shadow: 5px 5px 16px 3px ${el}55;
            "></div>
            </div>`);
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
        window.requestAnimationFrame(this.animate.bind(this));
        $(".downcount-bar > .bar").attr("style", `
        width : ${this.fitRemainTime / GAMEINFO.timeLimit * 92}%;
        background-color : hsl(${this.fitRemainTime / GAMEINFO.timeLimit * 46},87%,66%);
        `)
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
                GAMEINFO.TOTAL_SCORE += remainTime * GAMEINFO.undertimeScore;
            }
            $("#test-fit-1").children().fadeOut(250);
            submit();
        }
    }
}
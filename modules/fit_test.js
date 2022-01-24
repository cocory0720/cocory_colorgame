import GAMEINFO, { ColorD2X } from "../game_dataset.js";

export default class FitGame {
    constructor(query) {
        this.currentstage = 1;
        GAMEINFO.initCurrentGame("fit", this.currentstage);

        this.$contextRow = $(query).children("div#fitgame-colors");
        this.initGame();

        this.$currentClickEvent;
        this.perfectScore = 0;
        this.fitGameScore = 0;
    }
    initGame() {
        this.$contextRow.prepend(`<div class="col-12 mb-5">
        <div class="color" style="background-color: ${GAMEINFO.givenArr[0]};"></div>
        </div>`);
        GAMEINFO.optionArr.forEach(el => {
            this.$contextRow.append(`<div class="col-6">
            <div class="color" style="background-color: ${el};"></div>
            </div>`);
        });
        const $colors = this.$contextRow.find("div.col-6 > div.color");
        this.$currentClickEvent = $colors;
        $colors.click((e) => {
            this.perfectScore += $colors.length / 2;
            if ($(e.target).attr("style").slice(18, 25) == GAMEINFO.givenArr[0]) {
                this.fitGameScore += $colors.length / 2;
                console.log(this.fitGameScore);
            };
            this.nextGame();
        });
    }
    nextGame() {
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
        this.$contextRow.children().remove("div");
        this.initGame();
    }
    gradeFitGame() {

    }
}
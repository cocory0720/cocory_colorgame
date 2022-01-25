import GAMEINFO, { ColorD2X } from "../game_dataset.js";

export default class FitGame {
    constructor(query) {
        this.currentstage = 1;
        GAMEINFO.initCurrentGame("fit", this.currentstage);

        this.$contextRow = $(query).children("div#fitgame-colors");
        this.initGame();

        this.clickedQuery;
        this.$enteredDiv;
        this.$enteredCol;

        this.perfectScore = 0;
        this.fitGameScore = 0;
    }
    initGame() {
        this.$contextRow.prepend(`<div class="col-12 answer h-25 mb-3">
        <div class="color-answer" style="background-color: ${GAMEINFO.givenArr[0]};"></div>
        </div>`);
        GAMEINFO.optionArr.forEach((el, i) => {
            this.$contextRow.append(`<div class="col option h-25">
            <div class="color element-${i}" style="background-color: ${el};"></div>
            </div>`);
            this.$contextRow.find("div.color").off()
                .on("pointerdown pointerenter pointerleave pointerup",
                    null, { _this: this },
                    function(e) {
                        switch (e.type) {
                            case "pointerdown":
                                e.data._this.onDown(e);
                                break;
                            case "pointerenter":
                                e.data._this.onEnter(e);
                                break;
                            case "pointerleave":
                                e.data._this.onLeave(e);
                                break;
                            case "pointerup":
                                e.data._this.onUp(e);
                                break;
                            default:
                                break;
                        }
                    })
        });
    }
    onDown(e) {
        //console.log("onClick", e.target);
        e.data._this.clickedQuery = e.target;
        if (e.pointerType == "mouse") { // pc: click the color
            e.data._this.scoreNnextGame();
        }
    }
    onEnter(e) {
        e.data._this.$enteredDiv = $(e.target).closest("div.option");
        e.data._this.$enteredCol = (parseInt($(e.target).attr("class").slice(-1)) % 2) ?
            e.data._this.$contextRow.children("div.color:even") :
            e.data._this.$contextRow.children("div.color:odd");
        console.log((parseInt($(e.target).attr("class").slice(-1)) % 2) ?
            e.data._this.$contextRow.children("div.option:even") :
            e.data._this.$contextRow.children("div.option:odd"));
        e.data._this.$enteredDiv.toggleClass("h-50");
        e.data._this.$enteredDiv.siblings("div.option").toggleClass("col-5");
        e.data._this.$enteredCol.each((_i, el) => el.toggleClass("col-7"));

    }
    onLeave(e) {
        e.data._this.$enteredCol.toggleClass("col-7");
        e.data._this.$enteredDiv.toggleClass("h-50");
        e.data._this.$enteredDiv.siblings("div.option").toggleClass("col-5");
        e.data._this.clickedQuery = undefined;
    }
    onUp(e) {
        //console.log("onUp");
        if (e.data._this.clickedQuery == e.target) { // mobile: ondown n onup in the same color
            e.data._this.scoreNnextGame();
        }
    }
    scoreNnextGame() {
        this.$contextRow.find("div.color").off();
        this.perfectScore += GAMEINFO.optionArr.length / 2;
        if ($(this.clickedQuery).attr("style").slice(18, 25) == GAMEINFO.givenArr[0]) {
            this.fitGameScore += GAMEINFO.optionArr.length / 2;
            console.log(this.fitGameScore);
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
        this.$contextRow.children().remove("div");
        this.initGame();
    }
    gradeFitGame() {

    }
}
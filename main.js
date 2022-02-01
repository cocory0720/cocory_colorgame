import GAMEINFO from "./game_dataset.js";
import HueGame from "./modules/hue_test.js";
import ValueGame from "./modules/value_test.js";
import FitGame from "./modules/fit_test.js";

let currentContext;
const FADE_OUT_TIME = 700;
const DELAY_FOR_SUBMITTING = 600;
const FADE_IN_TIME = 600;

// class = "next-button"
$('.action-next').off("click").click((e) => showNextArticle(e.target));

function showNextArticle(node) {
    const clickedArticle = $(node).closest("article");
    const delayForSubmit = clickedArticle.attr("id").slice(0, 4) == "test" ? DELAY_FOR_SUBMITTING : 0;
    setTimeout(() => {
        clickedArticle.fadeOut(FADE_OUT_TIME, function() {
            switch (clickedArticle.next().attr("id")) {
                case "test-hue-1":
                    currentContext = new HueGame(document.querySelector("#wheel-10"), 10);
                    startGame();
                    break;
                case "test-hue-2":
                    currentContext = new HueGame(document.querySelector("#wheel-20"), 20);
                    startGame();
                    break;
                case "test-hue-3":
                    currentContext = new HueGame(document.querySelector("#wheel-40"), 40);
                    startGame();
                    break;
                case "test-value-1":
                    changeBGColor();
                    currentContext = new ValueGame(document.querySelector("#canvasValue1"), 10);
                    startGame();
                    break;
                case "test-value-2":
                    changeBGColor();
                    currentContext = new ValueGame(document.querySelector("#canvasValue2"), 20);
                    startGame();
                    break;
                case "test-fit-1":
                    currentContext = new FitGame(document.querySelector("#fit-app"));
                default:
                    break;
            }
            clickedArticle.next().fadeIn(FADE_IN_TIME);
            document.documentElement.style.setProperty("--vh", `${window.innerHeight}px`);
        });
    }, delayForSubmit);
};

// class = "timer" : Show remaining time
// class = "action-submit" : Score current result
let remainTime = 0; /****** 남은 시간 ******/
function startGame() {
    showRemainTime();
    remainTime = 0;
    remainTime += GAMEINFO.timeLimit + FADE_IN_TIME / 1000;
    let timer = setInterval(function() {
        if (remainTime < 0.01) {
            submit(0);
            clearInterval(timer);
        };
        remainTime -= 0.01;
    }, 10);
    $(document).off("click").on("click", ".action-submit", function() {
        submit(remainTime);
        clearInterval(timer);
    });
}

function showRemainTime() {
    setInterval(() => {
        $(`#test-${GAMEINFO.currentGame}-${GAMEINFO.currentStage} .timer`).text(`${remainTime.toFixed(2)}초`);
    }, 10);
}

function submit(time) {
    switch (GAMEINFO.currentGame) {
        case "hue":
            if (currentContext.gradeHueGame()) {
                GAMEINFO.TOTAL_SCORE += time * GAMEINFO.undertimeScore;
            }
            break;
        case "value":
            if (currentContext.gradeValueGame()) { //만점자일 경우
                GAMEINFO.TOTAL_SCORE += time * GAMEINFO.undertimeScore;
                GAMEINFO.TOTAL_SCORE = GAMEINFO.TOTAL_SCORE.toFixed(2);
            }
            break;
        case "chroma":
            break;
        case "fit":
            break;
        default:
            alert("error from the submit function");
            break;
    }
    time = 0;
    showNextArticle(currentContext.canvas);
    console.log(GAMEINFO.TOTAL_SCORE);
}

function changeBGColor() {
    const htmlTag = document.querySelector('html');
    const bodyTag = document.querySelector('body');

    htmlTag.style.backgroundColor = "transparent";
    bodyTag.style.backgroundColor = "transparent";
}

$('.action-reset').off("click").click((e) => currentContext.reset(e.target));

$('.action-view').off("click").click((e) => currentContext.viewAll(e.target));

export { submit, remainTime, FADE_OUT_TIME, DELAY_FOR_SUBMITTING };
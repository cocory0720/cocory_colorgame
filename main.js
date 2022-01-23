import GAMEINFO from "./game_dataset.js";
import HueGame from "./modules/hue_test.js";

let currentCanvasContext;
const FADE_OUT_TIME = 700;
const FADE_IN_TIME = 600;

// class = "next-button"
$('.action-next').off("click").click((e) => showNextArticle(e.target));

function showNextArticle(node) {
    const clickedArticle = $(node).closest("article");
    const isTestNow = clickedArticle.attr("id").slice(0, 4) == "test" ? 600 : 0;
    setTimeout(() => {
        clickedArticle.fadeOut(FADE_OUT_TIME, function() {
            switch (clickedArticle.next().attr("id")) {
                case "test-hue-1":
                    currentCanvasContext = new HueGame(document.querySelector("#wheel-10"), 10);
                    startGame();
                    break;
                case "test-hue-2":
                    currentCanvasContext = new HueGame(document.querySelector("#wheel-20"), 20);
                    startGame();
                    break;
                case "test-hue-3":
                    currentCanvasContext = new HueGame(document.querySelector("#wheel-40"), 40);
                    startGame();
                    break;
                default:
                    break;
            }
            clickedArticle.next().fadeIn(FADE_IN_TIME);
        });
    }, isTestNow);
};

// class = "timer" : Show remaining time
// class = "action-submit" : Score current result
let remainTime = 0; /****** 남은 시간 ******/
function startGame() {
    showRemainTime();
    remainTime = 0;
    remainTime += GAMEINFO.timeLimit + FADE_IN_TIME / 1000;
    let timer = setInterval(function() {
        remainTime -= 0.01;
        if (remainTime <= 0) {
            submit(0);
            clearInterval(timer);
        };
    }, 10);
    $(document).off("click").on("click", ".action-submit", function() {
        submit(remainTime);
        clearInterval(timer);
    });
}

function showRemainTime() {
    setInterval(() => {
        $(`#test-${GAMEINFO.currentGame}-${GAMEINFO.currentStage} .timer`).text(`${remainTime}초`.slice(0, 5));
    }, 10);
}

function submit(time) {
    switch (GAMEINFO.currentGame) {
        case "hue":
            if (currentCanvasContext.gradeHueGame()) {
                GAMEINFO.TOTAL_SCORE += time * GAMEINFO.undertimeScore;
            }
            console.log(GAMEINFO.TOTAL_SCORE);
            break;
        case "value":
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
    showNextArticle(currentCanvasContext.canvas);
}

$('.action-reset').off("click").click((e) => currentCanvasContext.reset(e.target));

$('.action-view').off("click").click((e) => currentCanvasContext.viewAll(e.target));

export { FADE_OUT_TIME };
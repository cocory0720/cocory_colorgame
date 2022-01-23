import GAMEINFO from "./game_dataset.js";
import HueGame from "./modules/hue_test.js";

let currentCanvasContext;
const FADE_OUT_TIME = 700;
const FADE_IN_TIME = 800;

// class = "next-button"
$('.action-next').off("click").click((e) => showNextArticle(e.target));

function showNextArticle(node) {
    const clickedArticle = $(node).closest("article");
    clickedArticle.fadeOut(FADE_OUT_TIME, function() {
        clickedArticle.next().fadeIn(FADE_IN_TIME);
    });
    setTimeout(() => {
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
    }, FADE_OUT_TIME);
};

// class = "timer" : Show remaining time
// class = "action-submit" : Score current result
function startGame() {
    let downTime;
    downTime = GAMEINFO.timeLimit + 1;
    document.querySelector(".timer").textContent = downTime + "초";
    let timer = setInterval(function() {
        downTime--;
        document.querySelector(".timer").textContent = downTime + "초";
        if (downTime <= 0) {
            submit(timer, 0);
        };
    }, 1000);
}
$(document).on("click", "button.action-submit", function() {
    submit(timer, downTime);
});

function submit(timer, time) {
    clearInterval(timer);
    switch (GAMEINFO.currentGame) {
        case "hue":
            if (currentCanvasContext.gradeHueGame()) {
                console.log("perfect");
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

$('.action-reset').click((e) => currentCanvasContext.reset(e.target));

$('.action-view').click((e) => currentCanvasContext.viewAll(e.target));
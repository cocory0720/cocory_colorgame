import GAMEINFO from "./game_dataset.js";
import HueGame from "./modules/hue_test.js";

/****************************game action buttons****************************/

// class = "next-button"
$('.action-next').click(function() {
    clicked_article = $(this).closest("article");
    clicked_article.fadeOut(500);
    clicked_article.next().fadeIn(700);
});

// class = "timer" : showing how long has been taken
// class = "test-begin" : button to start down-count time
let downTime;
//let upTime;
let timer;
$('.action-begin').click(function() {
    downTime = GAMEINFO.timeLimit + 1;
    //upTime = 0;
    document.querySelector(".timer").innerHTML = downTime + "초";
    timer = setInterval(function() {
        downTime--;
        //upTime++;
        document.querySelector(".timer").innerHTML = downTime + "초";
        if (downTime <= 0) {
            clearInterval(timer);
            submit();
        };
    }, 1000);
});

// submit
$(document).on("click", "button.action-submit", function() {
    submit();
});

function submit() {
    clearInterval(timer);
    switch (GAMEINFO.currentGame) {
        case "hue":
            if (hue.submitHueGame()) GAMEINFO.TOTAL_SCORE += downTime * GAMEINFO.undertimeScore;
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
    downTime = 0;
}

/********************************************************/

let hue
window.onload = () => {
    hue = new HueGame(document.querySelector("#wheel-20"), 10);
}
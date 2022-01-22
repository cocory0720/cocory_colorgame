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
$('.action-begin').click(function() {
    let downTime = GAMEINFO.timeLimit + 1;
    document.querySelector(".timer").textContent = downTime + "초";
    let timer = setInterval(function() {
        downTime--;
        document.querySelector(".timer").textContent = downTime + "초";
        if (downTime <= 0) {
            clearInterval(timer);
            submit(timer, 0);
        };
    }, 1000);
    $(document).on("click", "button.action-submit", function() {
        submit(timer, downTime);
    });
});

function submit(timer, time) {
    clearInterval(timer);
    switch (GAMEINFO.currentGame) {
        case "hue":
            if (hue.gradeHueGame()) {
                console.log("perfect");
                GAMEINFO.TOTAL_SCORE += time * GAMEINFO.undertimeScore;
            }
            console.log(time, GAMEINFO.undertimeScore);
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
}

$('.action-reset').click(function() {
    hue = new HueGame(document.querySelector("#wheel-20"), 40);
});


$('.action-view').off("click").on('click', function(e) {
    hue.viewAll();
});

/********************************************************/

let hue
window.onload = () => {
    hue = new HueGame(document.querySelector("#wheel-20"), 40);
}
import GAMEINFO from "./game_dataset.js";
import HueGame from "./modules/hue_app.js";
import ValueGame from "./modules/value_app.js";
import FitGame from "./modules/fit_app.js";
import ChromaGame from "./modules/chroma_app.js";



/* 테스트 순서 */
const SERIES = ["main", "value", "hue", "fit", "value", "chroma", "hue", "end"];



/* article 페이드 인/아웃 지속시간 */
const FADE_OUT_TIME = 300; // 페이드 아웃
const DELAY_FOR_SUBMITTING = 500; // 테스트 종료시 딜레이
const FADE_IN_TIME = 600; // 페이드 인



/** 각 모듈에 선언된 클래스를 담을 변수
 *  main.js 에서 호출하는 각 클래스의 메소드는 다음과 같음
 *  1. currentContext.canvas : 테스트를 구현할 HTML객체를 담은 [변수 (HTML쿼리)]
 *  2. currentContext.grade???Game : 각 테스트 제출 후 시간에 따른 점수 부여를 위한 [함수], submit()에서 사용 
 *  3. currentContext.delAllReq : 테스트 종료 후, 모듈에서 등록한 이벤트리스너와 Animation Requestes를 제거
 */
let currentContext;



/** class = "action-next" 의 동작을 위한 함수.
 * 매개변수가 가리키는 HTML 객체의 자식 중 .action-next 클래스를 사용하는 객체에 클릭 이벤트리스너를 등록함.
 * 다음 article로 전환시키는 showNextArticle 함수에서 사용됨.
 * @param {string} id 이벤트리스너를 등록할 객체를 자식으로 두는 article 의 id 값
 */
function initBtns(id) {
    $(document).one("click", `#${id} .action-next`, showNextArticle);
}
initBtns("main-page"); // 첫 페이지를 위함



/** 다음 article로 넘어가기 위한 함수.
 * 다음 article이 현재 HTML파일 내에 존재하지 않을 경우, 다음 게임에 해당하는 HTML/CSS 파일을 읽어옴.
 * @param {object} e 다음 페이지로 넘어가기 위해 발생한 이벤트, 혹은 그것의 타겟
 */
function showNextArticle(e) {

    // 이벤트가 발생한 현재 article태그 객체
    const $clickedArticle = $(e.target != undefined ? e.target : e).closest("article");

    // 현재 article의 id가 "test"로 시작할 경우 DELAY_FOR_SUBMITTING 만큼의 딜레이를 부여함
    const delayForSubmit = $clickedArticle.attr("id").slice(0, 4) == "test" ? DELAY_FOR_SUBMITTING : 0;
    setTimeout(() => {
        // 딜레이가 부여된 이후

        $clickedArticle.fadeOut(FADE_OUT_TIME, function() {

            // 모듈에서 등록한 이벤트리스너와 Animation Requestes들을 제거
            if (currentContext != undefined) {
                if (currentContext.delAllReq != undefined) {
                    currentContext.delAllReq();
                }
            }

            if ($clickedArticle.next().length == 0) {
                /** 해당 HTML 파일에 다음 <article>이 없을 경우 
                 * HTML / CSS 코드 및 연동 바꾸기
                 * 첫 article 표시
                 */


                $(document).off("click"); // document내 이벤트리스너 청소


                if (GAMEINFO.currentGame == undefined) {
                    // 현재 첫 테스트를 시작하지 않았을 경우, 첫 번째 테스트 진입

                    $("link[href = 'style.css']").remove(); // 현재 CSS링크를 지우고

                    // 첫번째 테스트에 해당하는 파일의 CSS 링크
                    $("head").append(
                        $(`<link rel="stylesheet" href="./${SERIES[1]}/${SERIES[1]}_style.css">`)
                    );

                    // 첫번째 테스트에 해당하는 파일의 HTML의 article 태그들 파싱
                    $("main").load(
                        `./${SERIES[1]}/${SERIES[1]}_index.html #test-app article`,
                        function(_resp, status, xhr) {
                            if (status == "error") window.alert(xhr.status + " " + xhr.statusText);
                            $("article:first").fadeIn(FADE_IN_TIME);
                            initBtns($("article:first").attr("id"));
                        }
                    );


                } else {
                    // 테스트를 시작한 경우, 그 다음 테스트 진입

                    const currentSeriesIndex = SERIES.indexOf(GAMEINFO.currentGame); // 현재 테스트 파일명과 인덱스

                    // 현재 CSS링크를 지우고
                    $(`link[href = "./${SERIES[currentSeriesIndex]}/${SERIES[currentSeriesIndex]}_style.css"]`).remove();

                    $("head").append( // 첫번째 테스트에 해당하는 파일의 CSS 링크
                        $(`<link rel="stylesheet" href="./${SERIES[currentSeriesIndex + 1]}/${SERIES[currentSeriesIndex + 1]}_style.css">`)
                    );

                    // 첫번째 테스트에 해당하는 파일의 HTML의 article 태그들 파싱
                    $("main").load(
                        `./${SERIES[currentSeriesIndex + 1]}/${SERIES[currentSeriesIndex + 1]}_index.html #test-app article`,
                        function(_resp, status, xhr) {
                            if (status == "error") window.alert(xhr.status + " " + xhr.statusText);
                            $("article:first").fadeIn(FADE_IN_TIME);
                            initBtns($("article:first").attr("id"));
                        }
                    );
                }


            } else {
                /** 다음 article이 존재할 경우
                 *  또한 그 article이 테스트를 구현하는 경우, 
                 */

                switch ($clickedArticle.next().attr("id")) {
                    /** 다음 article의 id값에 따라
                     *  1. 각 모듈에서 구현된 테스트를 불러오기
                     *  2. 테스트 시작하기
                     *  3. 배경 변경하기 등
                     */

                    case "test-hue-1":
                        currentContext = new HueGame(
                            document.querySelector("#wheel-10"),
                            10
                        );
                        startGame();
                        break;

                    case "test-hue-2":
                        currentContext = new HueGame(
                            document.querySelector("#wheel-20"),
                            20
                        );
                        startGame();
                        break;

                    case "test-hue-3":
                        currentContext = new HueGame(
                            document.querySelector("#wheel-40"),
                            40
                        );
                        startGame();
                        break;

                    case "test-value-1":
                        changeBGColor();
                        currentContext = new ValueGame(
                            document.querySelector("#canvasValue1"),
                            10
                        );
                        startGame();
                        break;

                    case "test-value-2":
                        changeBGColor();
                        currentContext = new ValueGame(
                            document.querySelector("#canvasValue2"),
                            20
                        );
                        startGame();
                        break;

                    case "test-fit-1":
                        currentContext = new FitGame(document.querySelector("#fit-app"));
                        break;

                    case "test-chroma-1":
                        changeBGColor();
                        currentContext = new ChromaGame(
                            document.querySelector("#canvasChroma1"),
                            10
                        );
                        startGame();
                        break;

                    case "test-chroma-2":
                        // changeBGColor();
                        currentContext = new ChromaGame(
                            document.querySelector("#canvasChroma2"),
                            10
                        );
                        startGame();
                        break;

                    case "test-chroma-3":
                        // changeBGColor();
                        currentContext = new ChromaGame(
                            document.querySelector("#canvasChroma3"),
                            12
                        );
                        startGame();
                        break;

                    case "test-chroma-4":
                        // changeBGColor();
                        currentContext = new ChromaGame(
                            document.querySelector("#canvasChroma4"),
                            12
                        );
                        startGame();
                        break;

                    default:
                        break;
                }

                initBtns($clickedArticle.next().attr("id")); // 해당 article 내 버튼 활성화

                $clickedArticle.next().fadeIn(FADE_IN_TIME); // 페이드 인
            }

            /**
             * 모바일 브라우저의 상단바에 의해, 페이지하단이 벗어나고 스크롤이 활성화되는 문제를 해결하기 위한 코드.
             * 페이지의 높이를 다시 설정함.
             */
            document.documentElement.style.setProperty(
                "--page-viewport-height",
                `${window.innerHeight}px`
            );

        });

    }, delayForSubmit);

    if (delayForSubmit != 0) {
        showCurrntStage();
    }
}

// class = "timer" : Show remaining time
// class = "action-submit" : Score current result
let remainTime = 0; /****** 남은 시간 ******/
function startGame() {
    $(document).one("click", ".action-submit", function() {
        submit(remainTime);
        clearInterval(timer);
    });
    showRemainTime();
    remainTime = 0;
    remainTime += GAMEINFO.timeLimit + FADE_IN_TIME / 1000;
    let timer = setInterval(function() {
        if (remainTime < 0.01) {
            $(document).off("click", ".action-submit");
            submit(0);
            clearInterval(timer);
        }
        remainTime -= 0.01;
    }, 10);

}

function showRemainTime() {
    setInterval(() => {
        $(`#test-${GAMEINFO.currentGame}-${GAMEINFO.currentStage} .timer`).text(
            `${remainTime.toFixed(2)}초`
        );
    }, 10);
}

function submit(time) {
    switch (GAMEINFO.currentGame) {
        case "hue":
            if (currentContext.gradeHueGame()) {
                GAMEINFO.TOTAL_SCORE += time * GAMEINFO.SCORE_RATE_FOR_UNDERTIME;
            }
            break;
        case "value":
            if (currentContext.gradeValueGame()) {
                GAMEINFO.TOTAL_SCORE += time * GAMEINFO.SCORE_RATE_FOR_UNDERTIME;
            }
            break;
        case "chroma":
            if (currentContext.gradeChromaGame()) {
                GAMEINFO.TOTAL_SCORE += time * GAMEINFO.SCORE_RATE_FOR_UNDERTIME;
            }
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
    const htmlTag = document.querySelector("html");
    const bodyTag = document.querySelector("body");

    htmlTag.style.backgroundColor = "transparent";
    bodyTag.style.backgroundColor = "transparent";
}

const totalNumberOfStage =
    Object.keys(GAMEINFO.hue).filter(key => key.search(/\d/) != -1).length +
    Object.keys(GAMEINFO.value).filter(key => key.search(/\d/) != -1).length +
    Object.keys(GAMEINFO.chroma).filter(key => key.search(/\d/) != -1).length +
    Object.keys(GAMEINFO.fit).filter(key => key.search(/\d/) != -1).length;

let currentProgress = -1;

function showCurrntStage() {
    currentProgress++;
    $("#navbar").attr("style", `--navbar-width : ${currentProgress/totalNumberOfStage * 100}`);
}
showCurrntStage();


export { submit, remainTime, FADE_OUT_TIME, DELAY_FOR_SUBMITTING };
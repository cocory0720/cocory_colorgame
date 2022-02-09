const PI2 = Math.PI * 2;

/* export for Value Game */

/** color를 drop하는 공간이 맞는지 확인하는 함수(1)
 *  - 사용자가 채워넣는 공간
 * @param {number} x0 시작 x좌표
 * @param {number} y0 시작 y좌표
 * @param {number} width 한 칸의 너비
 * @param {number} height 한 칸의 높이
 * @param {number} posX 포인터 x좌표
 * @param {number} posY 포인터 y좌표
 * @returns {boolean}
 */
function distSpace(x0, y0, width, height, posX, posY) {
    let check = false;
    posX > x0 && posX < x0 + width && posY > y0 && posY < y0 + height ?
        (check = true) :
        (check = false);
    return check;
}

/** color를 drop하는 공간이 맞는지 확인하는 함수(2)
 *  - color 버튼들이 모여있는 공간으로
 *    컬러를 선택했다가 다시 돌려놓을 수 있음
 * @param {number} x0 시작 x좌표
 * @param {number} y1 시작 y좌표
 * @param {number} y2 끝 y좌표
 * @param {number} width 공간 전체 너비
 * @param {number} posX 포인터 x좌표
 * @param {number} posY 포인터 y좌표
 * @returns {boolean}
 */
function distBtn(x0, y1, y2, width, posX, posY) {
    let check = false;
    posX > x0 && posX < x0 + width && posY > y1 && posY < y2 ?
        (check = true) :
        (check = false);
    return check;
}
/** color를 drop할 수 없는 공간인지 확인하는 함수 in ValueGame
 *  - white와 기준색인 경우 color drop 불가
 *  - white는 고정 / 기준색은 랜덤 지정
 * @param {number} x0 시작 x좌표
 * @param {number} y0 시작 y좌표
 * @param {number} width 한 칸의 너비
 * @param {number} height 한 칸의 높이
 * @param {number} posX 포인터 x좌표
 * @param {number} posY 포인터 y좌표
 * @param {number} idx 기준색의 위치 인덱스
 * @returns {boolean}
 */
function isNoDropArea(x0, y0, width, height, posX, posY, idx) {
    let check = false;
    //white의 경우 + 기준색의 경우
    (posX > x0 && posX < x0 + width && posY > y0 && posY < y0 + height) ||
    (posX > x0 &&
        posX < x0 + width &&
        posY > y0 + idx * height &&
        posY < y0 + (idx + 1) * height) ?
    (check = true) :
    (check = false);
    return check;
}

/* Value Game Ends */

/* export for Chroma Game */

/** color를 drop할 수 없는 공간인지 확인하는 함수 in ChromaGame
 *  - 제시색과 제시색-회색의 경우 color drop 불가
 *  - 제시색과 제시색-회색 고정
 * @param {number} x0 시작 x좌표
 * @param {number} y0 시작 y좌표
 * @param {number} width 한 칸의 너비
 * @param {number} height 한 칸의 높이
 * @param {number} posX 포인터 x좌표
 * @param {number} posY 포인터 y좌표
 * @param {number} N 총 색상 개수
 * @returns {boolean}
 */
function isNoDropArea_Chroma(x0, y0, width, height, posX, posY, N) {
    let check = false;
    //제시색의 경우 + 제시색-회색의 경우
    (posX > x0 && posX < x0 + width && posY > y0 && posY < y0 + height) ||
    (posX > x0 &&
        posX < x0 + width &&
        posY > y0 + (N - 1) * height &&
        posY < y0 + N * height) ?
    (check = true) :
    (check = false);
    return check;
}
/* Chroma Game Ends */

/**
 * color Decimal code 2 "#Hex" code
 * @param {number} dec R * 256^2 + G * 256 + B (Decimal)
 * @returns {string} "#rrggbb" (Hexadecimal) : 소문자임에 유의
 */
function ColorD2X(dec) {
    if (dec != 0) return "#" + ("00" + dec.toString(16)).slice(-6);
    return "#000000";
}

/** 두 점 사이의 거리
 * @param {number} x0 시작점의 x좌표
 * @param {number} y0 시작점의 y좌표
 * @param {number} x1 끝점의 x좌표
 * @param {number} y1 끝점의 y좌표
 * @returns 두 점 사이의 거리
 */
function dist(x0, y0, x1, y1) {
    return Math.sqrt(
        Math.abs((x0 - x1) * (x0 - x1)) + Math.abs((y0 - y1) * (y0 - y1))
    );
}

function ColorX2RGBA(hex) {
    const x = parseInt(hex.slice(-6), 16);
    const b = x % 256;
    const g = parseInt(x / 256) % 256;
    const r = parseInt(x / 256 / 256);
    return `rgba(${r},${g}, ${b},`;
}

/** GAMEINFO : 게임 전체 데이터.
 *  1. TOTAL_SCORE : 총 테스트 점수. (getter, setter 지정됨)
 *  2. SCORE_RATE_FOR_... : 각 테스트의 점수 배점. (UNDERTIME : (만점자에게만 부여됨) 남은시간 점수)
 *  3. answerArr : 각 테스트의 정답 배열. (csv파일에서 파싱)
 *  4. givenArr : 각 테스트에서 주어질 색상의 배열. (csv파일에서 파싱)
 *  5. 제한시간. (csv파일에서 파싱)
 * 
 *  6. selectedArr : 각 테스트에서 사용자가 선택한 색상의 배열. (getter, setter 지정됨)
 *  7. optionArr : 각 테스트에서 사용자가 선택할 색상의 배열. (getter, setter 지정됨)
 *  6~7 : csv에서 파싱한 answerArr와 givenArr데이터를 GAMEINFO.initCurrentGame()함수를 통해 채워넣음.
 */
const GAMEINFO = {

    _TOTAL_SCORE: 0.0, // TOTAL SCORE FOR ENTIRE GAME

    SCORE_RATE_FOR_UNDERTIME: 0.7,

    hue: {
        SCORE_RATE_FOR_EACH_HUE_PROB: 1,
        // 아래와 같이 csv를 파싱한 내용이 추가됨.
        /* <아래>
        1: {
            answerArr: [...],
            givenArr: [...],
            timeLimit: 30,
        },
        2: {
            answerArr: [...],
            givenArr: [...],
            timeLimit: 60,
        },
        3: {
            answerArr: [],
            givenArr: [],
            timeLimit: 90,
        },
        */
    },

    value: {
        SCORE_RATE_FOR_EACH_VALUE_PROB: 0.5,
    },

    chroma: {
        SCORE_RATE_FOR_EACH_CHROMA_PROB: 0.6,
    },

    fit: {
        SCORE_RATE_FOR_EACH_FIT_PROB: 0.5,
    },


    // TOTAL_SCORE : 총 테스트 점수.
    get TOTAL_SCORE() {
        return this._TOTAL_SCORE;
    },
    /**
     * @param {number} score float형식의 점수. 소수점 3째자리까지 반올림됨.
     */
    set TOTAL_SCORE(score) {
        if (typeof score != "number") {
            throw "invalid valuetype for setting TOTAL_SCORE";
        }
        this._TOTAL_SCORE = parseFloat(score.toFixed(3));
    },

    // 현재 테스트의 이름. initCurrentGame을 호출하여 설정할 수 있음.
    get currentGame() {
        return this._curruntGame;
    },
    /**
     * @param {string} game "hue", "value", "chroma", "fit" 중 하나이어야 함. 현재 보여지는 게임을 구현하기 위한 각종 데이터를 지정하는데에 사용됨.
     */
    set currentGame(game) {
        const gameList = ["hue", "value", "chroma", "fit"];
        if (gameList.indexOf(game) == -1) {
            throw "bad request in setting currunt game";
        }
        this._curruntGame = game;
    },

    // 현재 스테이지 번호. initCurrentGame을 호출하여 설정할 수 있음.
    get currentStage() {
        return this._curruntStage;
    },
    /**
     * @param {number} stage 현재 스테이지 번호, csv에서 파싱한 스테이지. 현재 보여지는 게임을 구현하기 위한 각종 데이터를 지정하는데에 사용됨.
     */
    set currentStage(stage) {
        if (this.currentGame !== undefined) {
            if (this[this.currentGame][stage] === undefined) {
                throw "End Of Stage";
            }
        }
        this._curruntStage = stage;
    },

    // 현재 테스트-스테이지의 정답. initCurrentGame을 먼저 호출해야 함.
    get answerArr() {
        if (this.currentGame === undefined || this.currentStage === undefined) {
            console.log("initialize currunt game n stage first");
            return;
        }
        return this[this.currentGame][this.currentStage].answerArr;
    },

    // 현재 테스트-스테이지에서 주어질 색상과 배치. initCurrentGame을 먼저 호출해야 함.
    get givenArr() {
        if (this.currentGame === undefined || this.currentStage === undefined) {
            console.log("initialize currunt game n stage first");
            return;
        }
        return this[this.currentGame][this.currentStage].givenArr;
    },

    // 현재 테스트-스테이지에서의 시간제한. initCurrentGame을 먼저 호출해야 함.
    get timeLimit() {
        if (this.currentGame === undefined || this.currentStage === undefined) {
            console.log("initialize currunt game n stage first");
            return;
        }
        return this[this.currentGame][this.currentStage].timeLimit;
    },

    // 현재 테스트-스테이지에서 사용자가 배치한 색상과 위치. initCurrentGame을 먼저 호출해야 함.
    get selectedArr() {
        return this._selectedArr;
    },
    /**
     * @param {*} arr 현재 테스트-스테이지에서 사용자가 배치한 색상과 위치. 컬러코드 "#??????" 형식의 문자열 혹은 배열 
     */
    set selectedArr(arr) {
        this._selectedArr = arr;
    },

    // 현재 테스트-스테이지에서 사용자가 선택할 수 있는 색상. initCurrentGame을 먼저 호출하여 색상을 섞어야 함.
    get optionArr() {
        return this._optionArr;
    },
    /**
     * @param {*} arr 현재 테스트-스테이지에서 사용자가 선택할 수 있는 색상. 컬러코드 "#??????" 형식의 문자열
     */
    set optionArr(arr) {
        this._optionArr = arr;
    },

    /** 현재의 게임을 특정하여 csv에서 파싱한 데이터 중 필요한 데이터를 지정하거나 생성함.
     * 게임에 필요한 데이터를 사용하기 전에, 반드시 이 함수를 호출하여 현재 사용자가 플레이중인 게임의 데이터를 지정할 것.
     * 호출 후, GAMEINFO.[currentGame, currentStage, selectedArr, optionArr]가 설정된다.
     * @param {string} game "hue", "value", "chroma", "fit" 중 하나이어야 함.
     * @param {number} stage 현재 스테이지 번호. csv에서 파싱한 스테이지.
     */
    initCurrentGame(game, stage) {

        this.currentGame = game;
        this.currentStage = stage;

        // 테스트에서 주어지는 색상은 사용자가 선택한 것으로 간주함.
        this.selectedArr = [...this.givenArr];

        this.optionArr = []; // 사용자가 선택할 수 있는 색상을 담을 배열

        this.answerArr.forEach((color, i) => {
            // 각 정답배열의 요소에 대하여

            if (this.givenArr[i] == false) {
                // 해당 요소가 이미 주어진 상태가 아니라면

                this.optionArr.push(color); // 사용자가 선택할 수 있다.
            }
        });

        for (let i = this.optionArr.length - 1; i > 0; i--) {
            // 사용자가 선택할 수 있는 색상들에 대하여

            // 배열을 무작위로 섞는다.
            const randomPosition = Math.floor(Math.random() * (i + 1));
            const temp = this.optionArr[i];
            this.optionArr[i] = this.optionArr[randomPosition];
            this.optionArr[randomPosition] = temp;
        }
    },

    /*** only for the hue test ***/

    /** 색상 휠 각 원형자리를 배치하기위한 각도 계산
     * 및 해당 각도에 대한 배열 생성.
     * 인접한 두 자리에 색상이 주어질 경우 에러가 발생할 것으로 예상됨.
     * @param {number} n 색상 휠의 원형자리의 갯수
     */
    initColorWheelAngles(n) {

        const givens = this.givenArr; // 주어진 색상의 배열

        const numOfGiven = givens.filter((color) => color).length; // 주어진 색상의 갯수

        /** 
         * 주어진 색상의 원형자리의 크기는 다른 자리보다 약간 크다. 
         * 그 정도를 담은 상수 (1.xx), 1 으로 설정할 시 모두 같은 원이 된다.
         * 이 기능때문에 아래의 복잡한 코드가 필요함.
         */
        const howBigisGiven = 1 + n / 150;

        /** 색상 휠에서 각 원형자리의 반지름이 차지하는 각도
         *  주어진 색상의 원형자리 : 2 * largeAngle
         *  주어지지 않은 색상의 원형자리 : 2 * commonAngle
         * 이때, 색상이 인접한 자리에 연달아 주어지지 않는다고 가정한다.
         */
        const commonAngle = PI2 / ((numOfGiven * (howBigisGiven - 1) + n) * 2);
        const largeAngle = commonAngle * howBigisGiven;

        this._angles = [0]; // 각 원형자리 위치의 각도를 담는 배열. 첫 자리는 0도부터 시작함.
        let deltaAngle = 0; // 각 원형자리 위치의 각도를 누적하기 위한 변수

        for (let i = 0; i < n - 1; i++) {
            // 주어진 배열의 각 요소에 대하여,

            const isGivenHere = givens[i] ? 1 : 0; // 현재 요소는 색상이 주어졌는가?
            const isGivenNext = givens[i + 1] ? 1 : 0; // 그 다음 요소는 색상이 주어졌는가?

            if (isGivenHere ^ isGivenNext) {
                // 현재 요소와 그 다음 요소 중 한 요소만 색상이 주어진 상태라면,
                deltaAngle += largeAngle + commonAngle;

            } else {
                // 그 외의 경우는 가정에 의해 주어지지 않은 색상의 원형자리가 인접한 각도이다.
                deltaAngle += commonAngle + commonAngle;
            }

            this._angles.push(deltaAngle);
        }

        // 원형자리의 반지름을 나타내기 위한 각도
        this._commonCircle = PI2 / (10 + (n * 3) / 4 + (howBigisGiven - 1) * numOfGiven);
        this._largeCircle = this._commonCircle * howBigisGiven;
    },

    /**
     * 각 원형자리 위치의 각도를 담은 배열을 가져옴.
     */
    get getColorWheelAngles() {
        return this._angles;
    },
    /**
     * 주어진 색상의 원형자리의 지름에 해당하는 각도를 가져옴.
     */
    get getLargeCircle() {
        return this._largeCircle;
    },
    /**
     * 주어지지 않은 원형자리의 지름에 해당하는 각도를 가져옴.
     */
    get getCommonCircle() {
        return this._commonCircle;
    },
};


/**************************** color_data.csv 를 읽음 ****************************/
$.ajax({
    url: "color_data.csv",
    dataType: "text",
    async: false,
}).done(
    /**
     * @param {*} data 읽어온 데이터의 전문을 담은 문자열
     */
    function(data) {

        // 줄바꿈을 기준으로 배열로 분리함
        let allRows = data.split(/\r?\n|\t/);


        for (let row = 0; row < allRows.length; row++) {
            // 각 줄에 대하여

            if (allRows[row].slice(0, 2) != "//" && allRows[row] ? 1 : 0) {
                // '//'가 포함된 줄과 비어있는 줄은 읽지 않음
                // Don't read the row containing '//' or the empty row

                allRows[row] = allRows[row].replace(/(\s*)/g, ""); // 띄워쓰기 지움

                const currentRow = allRows[row].split(","); // 콤마(',')를 기준으로 배열로 분리함

                if (GAMEINFO[currentRow[0]] === undefined) {
                    /**
                     * 첫번째 요소는 게임의 이름을 뜻함 : "hue", "value", "chroma", "fit"
                     * 선언되어있지 않다면, 선언하고 빈 객체를 만듦.
                     */

                    GAMEINFO[currentRow[0]] = {}; // the initial element is the key of test
                }

                if (GAMEINFO[currentRow[0]][currentRow[1]] === undefined) {
                    /**
                     * 두번째 요소는 스테이지의 이름을 뜻함 : "1", "2", "3", "4", ...
                     * 스테이지 이름은 연속된 숫자로 정할 것을 원칙으로 함.
                     * 선언되어있지 않다면, 선언하고 빈 객체를 만듦.
                     */

                    GAMEINFO[currentRow[0]][currentRow[1]] = {}; // the second element is the key of stage
                }

                if (GAMEINFO[currentRow[0]][currentRow[1]][currentRow[2]] === undefined) {
                    /**
                     * 세번째 요소는 현재 게임-스테이지의 정보를 담음.
                     * 게임의 제한시간을 읽고, : "___sec"
                     * 정답의 색상과 주어진 색상(answerArr, givenArr)의 배열을 담기위한 배열을 선언하고 데이터를 담음.
                     */

                    if (currentRow[2] == "timeLimit")
                        GAMEINFO[currentRow[0]][currentRow[1]][currentRow[2]] = parseInt(currentRow[2].slice(0, -3));
                    else {
                        GAMEINFO[currentRow[0]][currentRow[1]][currentRow[2]] = []; // the third element is the key of array

                        /**
                         * 세번째요소가 "answerArr" 또는 "givenArr" 인 경우,
                         * 그 다음부터 오는 요소들은 해당하는 answerArr 또는 givenArr 의 데이터임.
                         * 각 색상코드에 '#'를 붙이며(없을 경우),
                         * 해당 코드가 "xxxxxx" 또는 "#xxxxxx" 인 경우, 빈 요소(false)로 간주한다.
                         */
                        for (let i = 3; i < currentRow.length; i++) {
                            const element = (currentRow[i].slice(0, 1) == '#') ?
                                currentRow[i] :
                                '#' + currentRow[i]; // if the element doesn't starts with "#", add it.
                            if (element == "#xxxxxx")
                                GAMEINFO[currentRow[0]][currentRow[1]][currentRow[2]].push(false);
                            else
                                GAMEINFO[currentRow[0]][currentRow[1]][currentRow[2]].push(element);
                        }
                    }
                }
            }
        }
    });

console.log(GAMEINFO);

export default GAMEINFO;
export {
    PI2,
    ColorD2X,
    ColorX2RGBA,
    dist,
    distSpace,
    distBtn,
    isNoDropArea,
    isNoDropArea_Chroma,
};
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
 * @returns 
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
 * @returns 
 */
function distBtn(x0, y1, y2, width, posX, posY) {
    let check = false;
    posX > x0 && posX < x0 + width && posY > y1 && posY < y2 ?
        (check = true) :
        (check = false);
    return check;
}

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

// color Decimal code 2 "#Hex" code
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

const GAMEINFO = {
    _TOTAL_SCORE: 0.0, // TOTAL SCORE FOR ENTIRE GAME
    SCORE_RATE_FOR_UNDERTIME: 0.7,
    hue: {
        SCORE_RATE_FOR_EACH_HUE_PROB: 1,
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

    get TOTAL_SCORE() {
        return this._TOTAL_SCORE;
    },
    set TOTAL_SCORE(score) {
        if (typeof score != "number") {
            throw "invalid valuetype for setting TOTAL_SCORE";
        }
        this._TOTAL_SCORE = parseFloat(score.toFixed(3));
    },
    get currentGame() {
        return this._curruntGame;
    },
    set currentGame(game) {
        const gameList = ["hue", "value", "chroma", "fit"];
        if (gameList.indexOf(game) == -1) {
            throw "bad request in setting currunt game";
        }
        this._curruntGame = game;
    },
    get currentStage() {
        return this._curruntStage;
    },
    set currentStage(stage) {
        if (this.currentGame !== undefined) {
            if (this[this.currentGame][stage] === undefined) {
                throw "End Of Stage";
            }
        }
        this._curruntStage = stage;
    },
    get answerArr() {
        if (this.currentGame === undefined || this.currentStage === undefined) {
            console.log("initialize currunt game n stage first");
            return;
        }
        return this[this.currentGame][this.currentStage].answerArr;
    },
    get givenArr() {
        if (this.currentGame === undefined || this.currentStage === undefined) {
            console.log("initialize currunt game n stage first");
            return;
        }
        return this[this.currentGame][this.currentStage].givenArr;
    },
    get timeLimit() {
        if (this.currentGame === undefined || this.currentStage === undefined) {
            console.log("initialize currunt game n stage first");
            return;
        }
        return this[this.currentGame][this.currentStage].timeLimit;
    },

    // (for every single stage) generate "this._selectedArr" n "this._optionArr"
    get selectedArr() {
        return this._selectedArr;
    },
    set selectedArr(arr) {
        this._selectedArr = arr;
    },
    get optionArr() {
        return this._optionArr;
    },
    set optionArr(arr) {
        this._optionArr = arr;
    },
    initCurrentGame(game, stage) {
        this.currentGame = game;
        this.currentStage = stage;
        this.selectedArr = [...this.givenArr];
        this.optionArr = [];
        this.answerArr.forEach((color, i) => {
            if (this.givenArr[i] == false) {
                this.optionArr.push(color);
            }
        });
        for (let i = this.optionArr.length - 1; i > 0; i--) {
            const randomPosition = Math.floor(Math.random() * (i + 1));
            const temp = this.optionArr[i];
            this.optionArr[i] = this.optionArr[randomPosition];
            this.optionArr[randomPosition] = temp;
        }
    },
    get undertimeScore() {
        return this.SCORE_RATE_FOR_UNDERTIME;
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

        const howBigisGiven = 1 + n / 150; // 주어진 색상의 원형자리의 크기는 다른 자리보다 약간 큼. 그 정도를 담은 상수 (1.xx)

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
    get getColorWheelAngles() {
        return this._angles;
    },
    get getLargeCircle() {
        return this._largeCircle;
    },
    get getCommonCircle() {
        return this._commonCircle;
    },
};

$.ajax({
    url: "color_data.csv",
    dataType: "text",
    async: false,
}).done((data) => {
    let allRows = data.split(/\r?\n|\t/);
    for (let row = 0; row < allRows.length; row++) {
        if (allRows[row].slice(0, 2) != "//" && allRows[row] ? 1 : 0) {
            // don't read the row contains '//' or empty
            allRows[row] = allRows[row].replace(/(\s*)/g, "");
            const currentRow = allRows[row].split(",");
            if (GAMEINFO[currentRow[0]] === undefined)
                GAMEINFO[currentRow[0]] = {}; // the initial element is the key of test
            if (GAMEINFO[currentRow[0]][currentRow[1]] === undefined)
                GAMEINFO[currentRow[0]][currentRow[1]] = {}; // the second element is the key of stage
            if (GAMEINFO[currentRow[0]][currentRow[1]][currentRow[2]] === undefined) {
                if (currentRow[2].slice(-3) == "sec")
                    GAMEINFO[currentRow[0]][currentRow[1]].timeLimit = parseInt(currentRow[2].slice(0, -3));
                else
                    GAMEINFO[currentRow[0]][currentRow[1]][currentRow[2]] = []; // the third element is the key of array
            }
            for (let i = 3; i < currentRow.length; i++) {
                const element =
                    currentRow[i].slice(0, 1) == "#" ?
                    currentRow[i].slice(1) :
                    currentRow[i]; //if the element starts with '#', remove it
                if (element == "xxxxxx")
                    GAMEINFO[currentRow[0]][currentRow[1]][currentRow[2]].push(false);
                else
                    GAMEINFO[currentRow[0]][currentRow[1]][currentRow[2]].push("#" + element);
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
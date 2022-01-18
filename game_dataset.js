const PI2 = Math.PI * 2;

// color Decimal code 2 "#Hex" code
function ColorD2X(dec) {
    return '#' + ("00" + dec.toString(16)).slice(-6);
};

// compute distance
function dist(x0, y0, x1, y1) {
    return Math.sqrt(Math.abs((x0 - x1) * (x0 - x1)) + Math.abs((y0 - y1) * (y0 - y1)));
}

const GAMEINFO = {
    TOTAL_SCORE: 0.00, // TOTAL SCORE FOR ENTIRE GAME
    SCORE_RATE_FOR_UNDERTIME: 0.7,
    hue: {
        SCORE_RATE_FOR_EACH_HUE_PROB: 1,
        1: {
            answerArr: [],
            givenArr: [],
            timeLimit: 30,
        },
        2: {
            answerArr: [],
            givenArr: [],
            timeLimit: 60,
        },
        3: {
            answerArr: [],
            givenArr: [],
            timeLimit: 90,
        },
    },
    value: {},
    chroma: {},
    fit: {},

    get currentGame() {
        return this._curruntGame;
    },
    set currentGame(game) {
        const gameList = ["hue", "value", "chroma", "fit"];
        if (gameList.indexOf(game) == -1) {
            alert("bad request in setting currunt game");
            return;
        }
        this._curruntGame = game;
    },
    get currentStage() {
        return this._curruntStage;
    },
    set currentStage(stage) {
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
    get eachHueScore() {
        return this.hue.SCORE_RATE_FOR_EACH_HUE_PROB;
    },

    //*** only for the hue test ***/ 
    initColorWheelAngles(n) { // n colors wheel
        const howBigisGiven = 1 + n / 150;
        this._angles = [0];
        const givens = this.givenArr;
        const num = givens.filter((color) => color).length;
        const commonAngle = PI2 / (n + (howBigisGiven - 1) * num);
        const largeAngle = commonAngle * howBigisGiven;
        const midiumAngle = commonAngle * (1 + howBigisGiven) / 2
        for (let i = 0; i < n - 1; i++) {
            if ((givens[i] ? 1 : 0) ^ (givens[i + 1] ? 1 : 0)) {
                this._angles.push(midiumAngle);
            } else if ((givens[i] ? 1 : 0) && (givens[i + 1] ? 1 : 0)) {
                this._angles.push(this._largeAngle);
            } else {
                this._angles.push(commonAngle);
            }
        }
        for (let i = this._angles.length; i > 0; i--) {
            for (let j = i - 1; j > 0; j--) {
                this._angles[i - 1] += this._angles[j - 1];
            }
        }
        // console.log(this._angles);
        this._commonCircle = PI2 / (10 + n * 3 / 4 + (howBigisGiven - 1) * num);
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
        if ((allRows[row].slice(0, 2) != "//") && (allRows[row]) ? 1 : 0) { // don't read the row contains '//' or empty
            allRows[row] = allRows[row].replace(/(\s*)/g, "");
            const currentRow = allRows[row].split(',');
            if (GAMEINFO[currentRow[0]] === undefined) GAMEINFO[currentRow[0]] = {}; // the initial element is the key of test
            if (GAMEINFO[currentRow[0]][currentRow[1]] === undefined) GAMEINFO[currentRow[0]][currentRow[1]] = {}; // the initial element is the key of difficulty
            if (GAMEINFO[currentRow[0]][currentRow[1]][currentRow[2]] === undefined) GAMEINFO[currentRow[0]][currentRow[1]][currentRow[2]] = []; // the initial element is the key of data
            for (let i = 3; i < currentRow.length; i++) {
                const element = currentRow[i];
                if (element == "ffffff") GAMEINFO[currentRow[0]][currentRow[1]][currentRow[2]].push(false);
                // else if (element.slice(-3) == "sec") GAMEINFO[currentRow[0]][currentRow[1]][currentRow[2]] = parseInt(element.slice(0, -3));
                else GAMEINFO[currentRow[0]][currentRow[1]][currentRow[2]].push('#' + element);
            }
        }
    }
});

export default GAMEINFO;
export { PI2, ColorD2X, dist };
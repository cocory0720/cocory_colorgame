const GAMEINFO = {
    // hue: {
    //     1: {
    //         answerArr: [],
    //         givenArr: [],
    //         timeLimit: 30,
    //     },
    //     2: {
    //         answerArr: [],
    //         givenArr: [],
    //         timeLimit: 60,
    //     },
    //     3: {
    //         answerArr: [],
    //         givenArr: [],
    //         timeLimit: 90,
    //     },
    // },
    // value: {},
    // chroma: {},
    // fit: {},

    get curruntGame() {
        return this._curruntGame;
    },
    set curruntGame(game) {
        const gameList = ["hue", "value", "chroma", "fit"];
        if (gameList.indexOf(game) == -1) {
            alert("bad request in setting currunt game");
            return;
        }
        this._curruntGame = game;
    },
    get curruntStage() {
        return this._curruntStage;
    },
    set curruntStage(stage) {
        this._curruntStage = stage;
    },
    get answerArr() {
        if (this.curruntGame === undefined || this.curruntStage === undefined) {
            console.log("initialize currunt game n stage first");
            return;
        }
        return this[this.curruntGame][this.curruntStage].answerArr;
    },
    get givenArr() {
        if (this.curruntGame === undefined || this.curruntStage === undefined) {
            console.log("initialize currunt game n stage first");
            return;
        }
        return this[this.curruntGame][this.curruntStage].givenArr;
    },
    get timeLimit() {
        if (this.curruntGame === undefined || this.curruntStage === undefined) {
            console.log("initialize currunt game n stage first");
            return;
        }
        return this[this.curruntGame][this.curruntStage].timeLimit;
    },


    // (for every single stage) this._selectedArr, this._optionArr
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
        this.curruntGame = game;
        this.curruntStage = stage;
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

    //*** only for the hue test ***/ 
    initColorWheelAngles(n) { // n colors wheel
        const HOW_BIG_IS_GIVEN = 1.25;
        this._angles = [0];
        const givens = this.givenArr;
        const num = givens.filter((color) => color).length;
        const commonAngle = PI2 / (n + (HOW_BIG_IS_GIVEN - 1) * num);
        const largeAngle = commonAngle * HOW_BIG_IS_GIVEN;
        const midiumAngle = commonAngle * (1 + HOW_BIG_IS_GIVEN) / 2
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
        this._commonCircle = PI2 / (10 + n * 3 / 4 + (HOW_BIG_IS_GIVEN - 1) * num);
        this._largeCircle = this._commonCircle * HOW_BIG_IS_GIVEN;
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
                else if (element.slice(-3) == "sec") GAMEINFO[currentRow[0]][currentRow[1]][currentRow[2]] = parseInt(element.slice(0, -3));
                else GAMEINFO[currentRow[0]][currentRow[1]][currentRow[2]].push('#' + element);
            }
        }
    }
});
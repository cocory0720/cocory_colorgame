import GAMEINFO, {
    ColorD2X,
    distSpace,
    distBtn,
    isNoDropArea,
} from "../game_dataset.js";

let isWide;

/** 기준색 랜덤 설정 및 optionArr 초기화 함수
 *
 * @param {array} givenArr  초기에 주어지는 배열
 * @param {array} optionArr value 버튼 배열
 * @param {array} answerArr 정답 배열
 * @returns {number} 랜덤으로 설정된 기준색의 위치 인덱스
 */
function setSelected_OptionArr(givenArr, optionArr, answerArr) {
    let rannum = Math.floor(Math.random() * 9) + 1; //1~9 사이의 랜덤값으로 기준색의 위치 인덱스가 결정됨
    givenArr.splice(rannum, 1, answerArr[rannum]); //givenArr에서 rannum 위치값을 기준색으로 수정

    const idx = optionArr.indexOf(answerArr[rannum]); //optionArr에서의 기준색의 위치 인덱스
    optionArr.splice(idx, 1); //optionArr에서 기준색이 된 명도 삭제

    return rannum; //기준색의 위치 인덱스 반환
}

class Spaces {
    constructor(ax, spacex, y1, y2, N) {
        this.ax = ax;
        this.x = spacex;
        this.y1 = y1;
        this.y2 = y2;
        this.N = N;
        this.currentStage = N <= 10 ? 1 : 2;
    }

    genSpaces(ctx) {
        ctx.save();
        ctx.translate(0, 0);
        for (let i = 0; i < this.N; i++) {
            const x = this.x;
            const y = this.y1 + i * ((this.y2 - this.y1) / this.N);
            const w = this.ax;
            const h = (this.y2 - this.y1) / this.N

            ctx.save();
            ctx.beginPath();

            ctx.arc(x + h / 2, y + h / 2, h / 2, Math.PI * 0.5, Math.PI * 1.5, false);
            ctx.arc(x + w - h / 2, y + h / 2, h / 2, Math.PI * 1.5, Math.PI * 0.5, false);
            ctx.lineTo(x + h / 2, y + h);


            if (GAMEINFO.selectedArr[i]) {
                /**
                 * 끌어다 놓아진 색상은 그 자리를 그 색상을 채움.
                 */

                ctx.fillStyle = GAMEINFO.selectedArr[i];
                ctx.fill();

            } else {
                /**
                 * 빈자리는 연회색, 약 60% 투명도의 색상으로 채움.
                 * 투명도를 설정하는 것이 중요함. (색상오염방지)
                 */

                ctx.fillStyle = "#eeeeee9a"
                ctx.fill();
                ctx.stroke();

            }
            ctx.closePath();
            ctx.restore();
        }
        ctx.restore();
    }


    /**사용자가 선택한 명도를 해당 공간에 채워주는 함수
     *
     * @param {number} posX 포인터 x좌표
     * @param {number} posY 포인터 y좌표
     * @param {number} selectedColor 사용자가 선택한 명도
     * @param {number} basisLoc 기준색 위치 인덱스
     */
    dropSelectedColor(posX, posY, selectedColor, basisLoc) {
        const selectedColorCode = ColorD2X(selectedColor);
        let checkSpace = false; //명도
        let loc = 0;

        //case 1. space에 넣은 경우 - 한 번이라도 true가 반환되면 break
        for (let i = 0; i < this.N; i++) {
            //각 space 내에서 확인
            if (!distSpace(
                    this.x,
                    this.y1 + i * ((this.y2 - this.y1) / this.N),
                    this.ax,
                    (this.y2 - this.y1) / this.N,
                    posX,
                    posY
                )) {
                //x0, y0, width, height)
                continue;
            } else {
                checkSpace = true;
                loc = i;
                break;
            }
        }

        let isNoDropAreaCheck = isNoDropArea(
            this.x,
            this.y1,
            this.ax,
            (this.y2 - this.y1) / this.N,
            posX,
            posY,
            basisLoc
        );

        if (!isNoDropAreaCheck && checkSpace) {
            if (!GAMEINFO.selectedArr.includes(selectedColorCode)) {
                //1) btns에서 가져와 넣는 경우
                let remove = GAMEINFO.optionArr.indexOf(selectedColorCode);
                if (!GAMEINFO.selectedArr[loc]) {
                    //1-1) drop할 위치가 빈 경우
                    GAMEINFO.selectedArr[loc] = selectedColorCode; //loc는 drop할 위치
                    GAMEINFO.optionArr.splice(remove, 1);
                } else {
                    //1-2) drop할 위치에 이미 명도가 채워져 있는 경우
                    let temp = GAMEINFO.selectedArr[loc];
                    GAMEINFO.selectedArr[loc] = selectedColorCode;
                    GAMEINFO.optionArr.push(temp);
                    GAMEINFO.optionArr.splice(remove, 1);
                }
            } else {
                //2) space 내에서
                let remove = GAMEINFO.selectedArr.indexOf(selectedColorCode);
                GAMEINFO.selectedArr.splice(remove, 1, false);
                if (!GAMEINFO.selectedArr[loc]) {
                    //2-1) drop할 위치가 빈 경우
                    GAMEINFO.selectedArr[loc] = selectedColorCode;
                } else {
                    //2-2) drop할 위치에 이미 명도가 채워져 있는 경우
                    let temp = GAMEINFO.selectedArr[loc];
                    GAMEINFO.selectedArr[loc] = selectedColorCode;
                    GAMEINFO.selectedArr[remove] = temp;
                }
            }
        }
    }
}

class ClrBtns {
    constructor(bx, btnx, y1, y2, N) {
        this.bx = bx;
        this.x = btnx + bx * 0.1;
        this.y1 = y1;
        this.y2 = y2;
        this.N = N;
        this.currentStage = N <= 10 ? 1 : 2;
    }
    genBtns(ctx) {
        ctx.save();
        ctx.translate(0, 0);
        const MRG_RATIO = 0.1;
        const row = this.N <= 10 ? 2 : 3;
        const col = 2 * row;
        const divider = row * 2.5; //divider
        const d = ((1 - MRG_RATIO) * (this.y2 - this.y1)) / divider;
        const mrg = ((this.y2 - this.y1) * MRG_RATIO) / (col - 1);
        let index = 0;
        for (let i = 0; i < row; i++) {
            for (let j = 0; j < col; j++) {
                if (index >= GAMEINFO.optionArr.length) break;
                let x = this.x + (d + mrg) * i;
                const y = this.y1 + (d + mrg) * j;
                ctx.save();
                ctx.fillStyle = GAMEINFO.optionArr[index];
                ctx.beginPath();
                ctx.fillRect(x, y, d, d);
                ctx.closePath();
                ctx.restore();
                index++;
            }
        }
        ctx.restore();
    }

    dropSelectedColor(posX, posY, selectedColor) {
        const selectedColorCode = ColorD2X(selectedColor);
        let checkBtns = false;

        //case 2. btns에 넣는 경우
        if (distBtn(this.x, this.y1, this.y2, this.bx, posX, posY)) {
            //x0, y1, y2, width
            checkBtns = true;
        }

        if (checkBtns && !GAMEINFO.optionArr.includes(selectedColorCode)) {
            let remove = GAMEINFO.selectedArr.indexOf(selectedColorCode);
            GAMEINFO.optionArr.push(selectedColorCode);
            GAMEINFO.selectedArr.splice(remove, 1, false);
        }
    }
}

class Picker {
    constructor(size) {
        this.h = size / 100; //ratio
    }
    genBubl(ctx, posX, posY, pickedColor) {
        if (pickedColor >= 0) {
            const currentColor = ColorD2X(pickedColor);
            const bdr_h = 15 * this.h;
            const bbl_h = 70 * this.h;
            ctx.save();
            ctx.transform(1, 0, 0, -1, posX, posY);
            ctx.beginPath();
            ctx.moveTo(0, 0);
            ctx.bezierCurveTo(bdr_h, bdr_h / 2, bdr_h, bdr_h, bdr_h, bdr_h);
            ctx.bezierCurveTo(0, bdr_h, 0, bdr_h * 2, 0, bdr_h * 2);
            ctx.lineTo(0, bdr_h * 2 + bbl_h);
            ctx.bezierCurveTo(
                0,
                bdr_h * 3 + bbl_h,
                bdr_h,
                bdr_h * 3 + bbl_h,
                bdr_h,
                bdr_h * 3 + bbl_h
            );
            ctx.lineTo(bdr_h + bbl_h, bdr_h * 3 + bbl_h);
            ctx.bezierCurveTo(
                bdr_h * 2 + bbl_h,
                bdr_h * 3 + bbl_h,
                bdr_h * 2 + bbl_h,
                bdr_h * 2 + bbl_h,
                bdr_h * 2 + bbl_h,
                bdr_h * 2 + bbl_h
            );
            ctx.lineTo(bdr_h * 2 + bbl_h, bdr_h * 2);
            ctx.bezierCurveTo(
                bdr_h * 2 + bbl_h,
                bdr_h,
                bdr_h + bbl_h,
                bdr_h,
                bdr_h + bbl_h,
                bdr_h
            );
            ctx.lineTo(bdr_h * 2, bdr_h);
            ctx.bezierCurveTo((bdr_h * 3) / 2, 0, 0, 0, 0, 0);
            ctx.stroke();
            ctx.closePath();

            ctx.fillStyle = currentColor;
            ctx.beginPath();
            ctx.arc(
                bdr_h + bbl_h / 2,
                bdr_h * 2 + bbl_h / 2,
                bdr_h / 2 + bbl_h / 2,
                0,
                Math.PI * 2,
                false
            );
            ctx.closePath();
            ctx.fill();
            ctx.restore();
        }
    }
}

export default class ValueGame {
    constructor(query, N) {
            this.currentStage = N <= 10 ? 1 : 2;
            GAMEINFO.initCurrentGame("value", this.currentStage); //게임 자체 데이터 가져오기
            this.basisLoc = setSelected_OptionArr(
                GAMEINFO.givenArr,
                GAMEINFO.optionArr,
                GAMEINFO.answerArr
            ); //기준값 정한 후 재설정
            GAMEINFO.selectedArr = [...GAMEINFO.givenArr]; //초기 selectedArr(사용자가 선택한 명도 배열)는
            //givenArr(주어지는 명도 배열)와 동일
            this.n = N; //명도 개수

            //canvas
            this.canvas = query;
            this.ctx = this.canvas.getContext("2d");

            window.addEventListener("resize", this.resize.bind(this), false);
            this.resize();

            this.pointerX = 0;
            this.pointerY = 0;
            this.isDown = false;

            this.canvas.addEventListener("pointerdown", this.onDown.bind(this), false);
            this.canvas.addEventListener("pointermove", this.onMove.bind(this), false);
            this.canvas.addEventListener("pointerup", this.onUp.bind(this), false);

            this.animateRQ = window.requestAnimationFrame(this.animate.bind(this));
        }
        // get clickedColor() {
        //     return this._clickedColor; // colorcode in Decimal
        // }
        // set clickedColor(color) { // color corruption hazard control
        //     if ((color == 0) || (GAMEINFO.getAnswerArr.indexOf(ColorD2X(color)) != -1)) {
        //         this._clickedColor = color;
        //     } else {
        //         console.log("detected color curruption");
        //         return;
        //     }
        // }
    resize() {
        this.stageWidth = 2 * (window.innerWidth < 1600 ? window.innerWidth : 1600);
        this.stageHeight =
            2 * (window.innerHeight < 900 ? window.innerHeight : 900);
        this.canvas.width = this.stageWidth;
        this.canvas.height = this.stageHeight;

        isWide = this.stageWidth / 750 > this.stageHeight / 900 ? 1 : 0;

        this.ax = isWide === 1 ? this.stageHeight / 5 : this.stageWidth * 0.35;
        this.bx = (this.ax * 3) / 2;
        this.spacex =
            isWide === 1 ? this.stageWidth / 2 - this.ax : this.stageWidth / 16;
        this.btnx =
            isWide === 1 ? this.stageWidth / 2 : this.ax + this.stageWidth / 16;

        this.Spaces = new Spaces(
            this.ax,
            this.spacex, //x
            this.stageHeight * 0.1, //y1
            this.stageHeight * 0.9, //y2
            this.n
        );

        this.ClrBtns = new ClrBtns(
            this.bx,
            this.btnx,
            this.stageHeight * 0.2,
            this.stageHeight * 0.8,
            this.n
        );
        this.Picker = new Picker(100);
    }
    animate() {
        this.animateRQ = window.requestAnimationFrame(this.animate.bind(this));
        this.ctx.clearRect(0, 0, this.stageWidth, this.stageHeight);
        this.ctx.fillStyle = "#00000000";
        this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);
        this.Spaces.genSpaces(this.ctx);
        this.ClrBtns.genBtns(this.ctx);
        this.Picker.genBubl(
            this.ctx,
            this.pointerX,
            this.pointerY,
            this.clickedColor
        );
    }

    onDown(e) {
        this.pointerX = 2 * e.offsetX;
        this.pointerY = 2 * e.offsetY;
        this.isDown = true;

        if (this.isDown) {

            // 클릭한 위치의 R, G, B, A 의 배열
            const pickColorInfo = this.ctx.getImageData(this.pointerX, this.pointerY, 1, 1).data

            if (pickColorInfo[3] != 255) {
                this.clickedColor = -1;
                return;
            }

            const pickColor = pickColorInfo[0] * 256 * 256 +
                pickColorInfo[1] * 256 +
                pickColorInfo[2];

            if (!GAMEINFO.answerArr.includes(ColorD2X(pickColor)) ||
                GAMEINFO.givenArr.includes(ColorD2X(pickColor))
            ) {
                this.clickedColor = -1;
                return;
            }
            this.clickedColor = pickColor;
        }
    }


    onMove(e) {
        if (this.isDown && this.clickedColor >= 0) {
            this.pointerX = 2 * e.offsetX;
            this.pointerY = 2 * e.offsetY;
        }
    }

    onUp(e) {
        this.pointerX = 2 * e.offsetX;
        this.pointerY = 2 * e.offsetY;
        if (this.clickedColor >= 0) {
            this.Spaces.dropSelectedColor(
                this.pointerX,
                this.pointerY,
                this.clickedColor,
                this.basisLoc
            );
            this.ClrBtns.dropSelectedColor(
                this.pointerX,
                this.pointerY,
                this.clickedColor
            );
        }
        this.isDown = false;
        this.clickedColor = -1;
    }

    gradeValueGame() {
        let corrAns = 0;
        GAMEINFO.selectedArr.forEach((ele, idx) => {
            if (ele !== GAMEINFO.givenArr[idx]) {
                if (ele === GAMEINFO.answerArr[idx]) {
                    GAMEINFO.TOTAL_SCORE += GAMEINFO.value.SCORE_RATE_FOR_EACH_VALUE_PROB;
                    corrAns++;
                }
            }
        });
        if (
            corrAns ===
            GAMEINFO.answerArr.length -
            GAMEINFO.givenArr.filter((el) => el != false).length
        ) {
            return true;
        } else {
            return false;
        }
    }

    delAllReq() {
        window.removeEventListener("resize", this.resize.bind(this), false);
        this.canvas.removeEventListener(
            "pointerdown",
            this.onDown.bind(this),
            false
        );
        this.canvas.removeEventListener(
            "pointermove",
            this.onMove.bind(this),
            false
        );
        this.canvas.removeEventListener("pointerup", this.onUp.bind(this), false);
        window.cancelAnimationFrame(this.animateRQ);
    }
}
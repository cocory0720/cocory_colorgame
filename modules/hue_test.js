import GAMEINFO, { PI2, ColorD2X, dist } from "../game_dataset.js";

class Wheel {
    constructor(x, y, rad, N) {
        this.x = x;
        this.y = y;
        this.rad = rad;
        this.N = N;
        this.rotate = 0;
    }

    genWhl(ctx, rotate) {
        ctx.save();
        ctx.strokeStyle = "#888";

        ctx.translate(this.x, this.y);
        this.rotate += rotate;
        ctx.rotate(this.rotate);
        ctx.beginPath();
        ctx.arc(0, 0, this.rad, 0, PI2, false);
        ctx.stroke();
        ctx.closePath();
        for (let i = 0; i < this.N; i++) {
            const x = this.rad * Math.cos(GAMEINFO.getColorWheelAngles[i]);
            const y = this.rad * Math.sin(GAMEINFO.getColorWheelAngles[i]);
            this.r = this.rad * Math.sin(GAMEINFO.givenArr[i] ? GAMEINFO.getLargeCircle / 2 : GAMEINFO.getCommonCircle / 2);
            ctx.beginPath();
            ctx.moveTo(0, 0);
            ctx.lineTo(x * (1 - this.r / this.rad), y * (1 - this.r / this.rad));
            ctx.stroke();
            ctx.beginPath();
            ctx.moveTo(x + this.r, y);
            ctx.arc(x, y, this.r, 0, PI2, false);
            if (GAMEINFO.selectedArr[i]) {
                ctx.save();
                ctx.fillStyle = GAMEINFO.selectedArr[i];
                ctx.fill();
                ctx.restore();
            } else {
                ctx.save();
                ctx.fillStyle = "#eee";
                ctx.fill();
                ctx.stroke();
                ctx.restore();
                ctx.stroke();
            }
            ctx.closePath();
        }
        ctx.restore();
    }

    dropSelectedColor(posX, posY, selectedColor) {
        const selectedColorCode = ColorD2X(selectedColor);
        for (let i = 0; i < this.N; i++) {
            const targetAngle = this.rotate + GAMEINFO.getColorWheelAngles[i];
            const x = this.rad * Math.cos(targetAngle);
            const y = this.rad * Math.sin(targetAngle);
            const relativeX = posX - this.x;
            const relativeY = posY - this.y;
            if (dist(x, y, relativeX, relativeY) < this.r) { //this area has index of i
                const onBtnArr = GAMEINFO.optionArr;
                const onWheelArr = GAMEINFO.selectedArr;
                const colorFromBtn = onBtnArr.indexOf(selectedColorCode);
                const colorFromWheel = onWheelArr.indexOf(selectedColorCode);
                if (onWheelArr[i] == false) { // if the area not already filled
                    if (colorFromBtn != -1) { // if the color is from the button
                        onBtnArr.splice(colorFromBtn, 1);
                    } else { // if the color is from the other area of the wheel
                        delete onWheelArr[colorFromWheel];
                        onWheelArr[colorFromWheel] = false;
                    }
                } else { // if the area already filled
                    if (GAMEINFO.givenArr.indexOf(onWheelArr[i]) != -1) return;
                    if (colorFromBtn != -1) {
                        onBtnArr.splice(colorFromBtn, 1);
                        onBtnArr.push(onWheelArr[i]);
                        onWheelArr[i] = selectedColorCode;
                    } else { // if the color is from the other area of the wheel
                        const temp = onWheelArr[i];
                        delete onWheelArr[colorFromWheel];
                        onWheelArr[colorFromWheel] = temp;
                    }
                }
                onWheelArr[i] = selectedColorCode;
                return;
            }
        }
        // if the color droped out of wheel
        const colorFromWheel = GAMEINFO.selectedArr.indexOf(selectedColorCode);
        if (colorFromWheel != -1) {
            delete GAMEINFO.selectedArr[colorFromWheel];
            GAMEINFO.selectedArr[colorFromWheel] = false;
            GAMEINFO.optionArr.push(selectedColorCode);
        }
    }

    showWhatWasWrong() {
        console.log("showWhatWasWrong");
    }
}
// color buttons
class ClrBtns {
    constructor(x, y1, y2, N) {
        this.x = x;
        this.y1 = y1;
        this.y2 = y2;
        this.N = N;
        this.currentStage = N <= 10 ? 1 : N <= 20 ? 2 : 3;
    }
    genBtns(ctx) {
        ctx.save();
        ctx.translate(0, 0);
        const MRG_RATIO = 0.2;
        const row = (this.N <= 10) ? 2 : (this.N <= 20) ? 3 : 4;
        const col = 2 * row;
        const d = (1 - MRG_RATIO) * (this.y2 - this.y1) / col;
        const mrg = (this.y2 - this.y1) * MRG_RATIO / (col - 1);
        let index = 0;
        for (let i = 0; i < row; i++) {
            for (let j = 0; j < col; j++) {
                if (index >= GAMEINFO.optionArr.length) break;
                const x = this.x + (d + mrg) * i;
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

    // submitBtnFunc() {
    //     let submitBtn = document.querySelector(`button.submit-hue-${this.currentStage}`);

    // }
}

// picked color window with speech bubble
class Picker {
    constructor(size) {
        this.h = size / 100; //ratio
    }
    genBubl(ctx, posX, posY, pickedColor) {
        if (pickedColor) {
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
            ctx.bezierCurveTo(0, bdr_h * 3 + bbl_h, bdr_h, bdr_h * 3 + bbl_h, bdr_h, bdr_h * 3 + bbl_h);
            ctx.lineTo(bdr_h + bbl_h, bdr_h * 3 + bbl_h);
            ctx.bezierCurveTo(bdr_h * 2 + bbl_h, bdr_h * 3 + bbl_h, bdr_h * 2 + bbl_h, bdr_h * 2 + bbl_h, bdr_h * 2 + bbl_h, bdr_h * 2 + bbl_h);
            ctx.lineTo(bdr_h * 2 + bbl_h, bdr_h * 2);
            ctx.bezierCurveTo(bdr_h * 2 + bbl_h, bdr_h, bdr_h + bbl_h, bdr_h, bdr_h + bbl_h, bdr_h);
            ctx.lineTo(bdr_h * 2, bdr_h);
            ctx.bezierCurveTo(bdr_h * 3 / 2, 0, 0, 0, 0, 0);
            ctx.stroke();
            ctx.closePath();

            ctx.fillStyle = currentColor;
            ctx.beginPath();
            ctx.arc(bdr_h + bbl_h / 2, bdr_h * 2 + bbl_h / 2, bdr_h / 2 + bbl_h / 2, 0, PI2, false);
            ctx.closePath();
            ctx.fill();
            ctx.restore();
        }
    }
}

// Hue game canvas main script
export default class HueGame {
    constructor(query, N) {
        this.currentStage = N <= 10 ? 1 : N <= 20 ? 2 : 3;
        GAMEINFO.initCurrentGame("hue", this.currentStage);
        GAMEINFO.initColorWheelAngles(N);

        this.canvas = query;
        this.ctx = this.canvas.getContext("2d");

        // window.addEventListener("resize", this.resize.bind(this)(N), false);
        window.onresize = () => {
            this.resize.bind(this)(N)
        };
        this.resize(N);

        this.pointerX = 0;
        this.pointerY = 0;
        this.isDownOnWheel = false;
        this.rotate = 0;

        this.canvas.addEventListener("pointerdown", this.onDown.bind(this), false);
        this.canvas.addEventListener("pointermove", this.onMove.bind(this), false);
        this.canvas.addEventListener("pointerup", this.onUp.bind(this), false);

        window.requestAnimationFrame(this.animate.bind(this));
        this.isBtnEmpty = false;
    }
    get clickedColor() {
        return this._clickedColor; // colorcode in Decimal
    }
    set clickedColor(color) { // color corruption hazard control
        if ((color == 0) || (GAMEINFO.answerArr.indexOf(ColorD2X(color)) != -1)) {
            this._clickedColor = color;
        } else {
            console.log("detected color curruption");
            return;
        }
    }
    resize(N) {
        this.stageWidth = 2 * (window.innerWidth < 1600 ? window.innerWidth : 1600);
        this.stageHeight = 2 * (window.innerHeight < 900 ? window.innerHeight : 900);
        this.canvas.width = this.stageWidth;
        this.canvas.height = this.stageHeight;

        const isWide = this.stageWidth / 750 > this.stageHeight / 900 ? 1 : 0;
        let center = [this.stageWidth / 2, this.stageHeight / 2];
        this.radiusOfWheel = this.stageHeight / (6 - this.currentStage / 2);
        this.centerOfWheelY = center[1];
        if (isWide) {
            this.widthOfBtns = this.radiusOfWheel * (1.3 - this.currentStage * 0.12);
            center[0] -= 80;
            this.centerOfWheelX = center[0] - this.stageWidth / 12;
            this.btnOffsetX = center[0] + this.radiusOfWheel / 2 + this.stageWidth / 12;
        } else {
            this.widthOfBtns = this.radiusOfWheel * (1.2 - this.currentStage * 0.12);
            this.btnOffsetX = center[0] + this.stageWidth / 2 - this.widthOfBtns;
            this.centerOfWheelX = this.btnOffsetX - this.radiusOfWheel - 60;
        }

        this.Wheel = new Wheel( //(x, y, rad, N)
            this.centerOfWheelX,
            this.centerOfWheelY,
            this.radiusOfWheel,
            N
        )
        this.ClrBtns = new ClrBtns( //(x, y1=center - w, y2 = center + w, N)
            this.btnOffsetX,
            this.stageHeight / 2 - this.widthOfBtns,
            this.stageHeight / 2 + this.widthOfBtns,
            N
        )
        this.Picker = new Picker(this.widthOfBtns / 3);
    }
    animate() {
        window.requestAnimationFrame(this.animate.bind(this));

        this.ctx.clearRect(0, 0, this.stageWidth, this.stageHeight);
        this.rotate *= 0.82;
        this.Wheel.genWhl(this.ctx, this.rotate);
        this.ClrBtns.genBtns(this.ctx);
        this.Picker.genBubl(this.ctx, this.pointerX, this.pointerY, this.clickedColor);
    }

    onDown(e) {
        this.pointerX = 2 * e.offsetX;
        this.pointerY = 2 * e.offsetY;
        if (dist(this.pointerX, this.pointerY, this.centerOfWheelX, this.centerOfWheelY) < this.radiusOfWheel * 0.93) {
            this.isDownOnWheel = true;
            this.rotate = 0;
        } else {
            let pickColor = 0;
            this.ctx.getImageData(this.pointerX, this.pointerY, 1, 1).data.slice(0, 3).forEach((RGBs, i) => {
                pickColor += RGBs * Math.pow(256, 2 - i);
            });
            // refuse to select fixed color
            if (GAMEINFO.givenArr.indexOf(ColorD2X(pickColor)) != -1) {
                pickColor = 0;
            }
            this.clickedColor = pickColor;
        }
    }

    onMove(e) {
        if (this.isDownOnWheel) {
            this.rotate = Math.atan2(2 * e.offsetY - this.centerOfWheelY, 2 * e.offsetX - this.centerOfWheelX) -
                Math.atan2(this.pointerY - this.centerOfWheelY, this.pointerX - this.centerOfWheelX);
        }
        this.pointerX = 2 * e.offsetX;
        this.pointerY = 2 * e.offsetY;
    }

    onUp(e) {
        this.pointerX = 2 * e.offsetX;
        this.pointerY = 2 * e.offsetY;
        if (this.clickedColor) {
            this.Wheel.dropSelectedColor(
                this.pointerX,
                this.pointerY,
                this.clickedColor
            )
        }
        this.isDownOnWheel = false;
        this.clickedColor = 0;
    }

    // 색상 휠 전체보기 기능

    submitHueGame() {
        let corrAns = 0;
        GAMEINFO.selectedArr.forEach((el, i) => {
            if (el != GAMEINFO.givenArr[i]) {
                if (el == GAMEINFO.answerArr[i]) {
                    GAMEINFO.TOTAL_SCORE += GAMEINFO.eachHueScore;
                    console.log(GAMEINFO.TOTAL_SCORE);
                    corrAns += 1;
                } else {
                    this.Wheel.showWhatWasWrong(i);
                }
            }
        });
        if (corrAns == (GAMEINFO.answerArr.length - GAMEINFO.givenArr.filter(el => el != false).length)) return true;
        else return false;
    }
}
import GAMEINFO, { PI2, ColorD2X, ColorX2RGBA, dist } from "../game_dataset.js";
import { FADE_OUT_TIME, DELAY_FOR_SUBMITTING } from "../main.js";

class Wheel {
    constructor(x, y, rad, N) {
        this.x = x;
        this.y = y;
        this.rad = rad;
        this.N = N;
        this.rotate = 0;
        this.fadeAnimation = { delay: 0 };
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
            const r = this.rad * Math.sin(GAMEINFO.givenArr[i] ? GAMEINFO.getLargeCircle / 2 : GAMEINFO.getCommonCircle / 2);
            ctx.beginPath();
            ctx.moveTo(0, 0);
            ctx.lineTo(x * (1 - r / this.rad), y * (1 - r / this.rad));
            ctx.stroke();
            ctx.beginPath();
            ctx.arc(x, y, r, 0, PI2, false);
            if (GAMEINFO.selectedArr[i]) {
                ctx.save();
                ctx.fillStyle = GAMEINFO.selectedArr[i];
                ctx.fill();
                ctx.restore();
            } else {
                ctx.save();
                ctx.fillStyle = "#eee";
                ctx.fill();
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
            const r = this.rad * Math.sin(GAMEINFO.givenArr[i] ? GAMEINFO.getLargeCircle / 2 : GAMEINFO.getCommonCircle / 2);
            const relativeX = posX - this.x;
            const relativeY = posY - this.y;
            if (dist(x, y, relativeX, relativeY) < r) { //this area has index of i
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

    showWhatWasWrong(ctx, indexes) {
        const req = window.requestAnimationFrame(this.showWhatWasWrong.bind(this, ctx, indexes));
        const FADE_VALOCITY = 8;
        this.fadeAnimation["delay"] += 8;
        indexes.forEach(index => {
            if (this.fadeAnimation[index] == undefined) this.fadeAnimation[index] = 1;
            const targetAngle = this.rotate + GAMEINFO.getColorWheelAngles[index];
            const x = this.rad * Math.cos(targetAngle);
            const y = this.rad * Math.sin(targetAngle);
            const r = this.rad * Math.sin(GAMEINFO.givenArr[index] ? GAMEINFO.getLargeCircle / 2 : GAMEINFO.getCommonCircle / 2);
            ctx.save();
            ctx.translate(this.x, this.y);
            ctx.shadowColor = "rgba(0,0,0,0.6)";
            ctx.shadowBlur = 7;
            ctx.strokeStyle = ColorX2RGBA(GAMEINFO.answerArr[index]) + `${this.fadeAnimation[index]/255}`;
            ctx.lineWidth = 8;
            ctx.beginPath();
            ctx.moveTo(0, 0);
            ctx.lineTo(x * (1 - r / this.rad), y * (1 - r / this.rad));
            ctx.stroke();
            ctx.beginPath();
            ctx.arc(x, y, r, 0, PI2, false);
            ctx.stroke();
            ctx.closePath();
            ctx.restore();
            if (this.fadeAnimation[index] < 255) this.fadeAnimation[index] += FADE_VALOCITY;
        });
        if (this.fadeAnimation["delay"] >= FADE_OUT_TIME) window.cancelAnimationFrame(req);
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
        this.n = N;

        this.canvas = query;
        this.ctx = this.canvas.getContext("2d");

        window.addEventListener("resize", this.resize.bind(this), false);
        this.resize();

        this.pointerX = 0;
        this.pointerY = 0;
        this.isDownOnWheel = false;
        this.rotate = 0;

        this.canvas.addEventListener("pointerdown", this.onDown.bind(this), false);
        this.canvas.addEventListener("pointermove", this.onMove.bind(this), false);
        this.canvas.addEventListener("pointerup", this.onUp.bind(this), false);

        this.animateRQ = window.requestAnimationFrame(this.animate.bind(this));

        $('.action-reset').off("click").click((e) => this.reset(e.target));
        $('.action-view').off("click").click((e) => this.viewAll(e.target));
        this.isViewAll = 0;
        this.t_veiwAll = 0;
        this.sure4Reset = 0;
    }
    get clickedColor() {
        return this._clickedColor; // colorcode in Decimal
    }
    set clickedColor(color) { // color corruption hazard control
        if ((color == 0) || (GAMEINFO.answerArr.indexOf(ColorD2X(color)) != -1)) {
            this._clickedColor = color;
        } else {
            return;
        }
    }
    resize() {
        this.stageWidth = 2 * (window.innerWidth < 1600 ? window.innerWidth : 1600);
        this.stageHeight = 2 * (window.innerHeight < 900 ? window.innerHeight : 900);
        this.canvas.width = this.stageWidth;
        this.canvas.height = this.stageHeight;

        this.isWide = this.stageWidth / 750 > this.stageHeight / 900 ? 1 : 0;
        let center = [this.stageWidth / 2, this.stageHeight / 2];
        this.centerOfWheelY = center[1];
        if (this.isWide) { // PC
            this.radiusOfWheel = this.stageHeight / (5 - this.currentStage / 2);
            this.widthOfBtns = this.radiusOfWheel * (1.3 - this.currentStage * 0.12);
            center[0] -= 80;
            this.centerOfWheelX = center[0] - this.stageWidth / 12 - 40;
            this.btnOffsetX = center[0] + this.radiusOfWheel / 2 + this.stageWidth / 12;

            const viewBtn = $(`#test-${GAMEINFO.currentGame}-${GAMEINFO.currentStage} .action-view`);
            viewBtn.css("display", "none");
            viewBtn.prev().toggleClass("col-5");
            viewBtn.prev().toggleClass("col-7");
        } else { // Mobile
            this.radiusOfWheel = this.stageWidth / (2.84 - this.currentStage / 2);
            this.widthOfBtns = this.radiusOfWheel * (1.1 - this.currentStage * 0.12);
            this.btnOffsetX = center[0] + this.stageWidth / 2 - this.widthOfBtns;
            this.centerOfWheelX = this.btnOffsetX - this.radiusOfWheel - 60;
        }
        this.Wheel = new Wheel( //(x, y, rad, N)
            this.centerOfWheelX,
            this.centerOfWheelY,
            this.radiusOfWheel,
            this.n,
        )
        this.ClrBtns = new ClrBtns( //(x, y1=center - w, y2 = center + w, N)
            this.btnOffsetX,
            this.stageHeight / 2 - this.widthOfBtns,
            this.stageHeight / 2 + this.widthOfBtns,
            this.n
        )
        this.Picker = new Picker(this.widthOfBtns / 3);


    }
    animate() {
        this.animateRQ = window.requestAnimationFrame(this.animate.bind(this));
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

    viewAll(btn) {
        this.isViewAll += 1;
        window.requestAnimationFrame(this.viewAllAnimate.bind(this));
        switch (this.isViewAll % 2) {
            case 1:
                window.removeEventListener("resize", this.resize.bind(this), false);
                this.canvas.removeEventListener("pointerdown", this.onDown.bind(this), false);
                $(btn).text("돌아오기");
                break;
            case 0:
                window.addEventListener("resize", this.resize.bind(this), false);
                this.canvas.addEventListener("pointerdown", this.onDown.bind(this), false);
                $(btn).text("전체보기");
                break;
            default:
                break;
        }
    }

    viewAllAnimate() {
        const req = window.requestAnimationFrame(this.viewAllAnimate.bind(this));
        const VALOCITY = 1;
        const curve = 1 + (this.t_veiwAll - 30) * (this.t_veiwAll - 30) * (this.t_veiwAll - 30) / 27000; // 0~1
        const curveInverse = this.t_veiwAll * this.t_veiwAll * this.t_veiwAll / 27000;
        if (this.isViewAll % 2 == 1) {
            this.t_veiwAll += VALOCITY;
            this.Wheel.x = this.centerOfWheelX * (1 - curve) + this.stageWidth / 2 * curve;
            this.Wheel.rad = this.radiusOfWheel * (1 - curve) + (this.stageWidth / 2 - 100) * curve;
            this.ClrBtns.x = this.btnOffsetX * (1 - curve) + this.stageWidth * curve;
        } else {
            this.t_veiwAll -= VALOCITY;
            this.Wheel.x = this.centerOfWheelX * (1 - curveInverse) + this.stageWidth / 2 * curveInverse;
            this.Wheel.rad = this.radiusOfWheel * (1 - curveInverse) + (this.stageWidth / 2 - 100) * curveInverse;
            this.ClrBtns.x = this.btnOffsetX * (1 - curveInverse) + this.stageWidth * curveInverse;
        }
        this.t_veiwAll = (this.t_veiwAll >= 30) ? 30 :
            (this.t_veiwAll >= 0) ? this.t_veiwAll : 0;
        if (this.t_veiwAll == 0 || this.t_veiwAll == 30) window.cancelAnimationFrame(req);
    }

    reset(btn) {
        this.sure4Reset += 1;
        switch (this.sure4Reset % 2) {
            case 1:
                $(btn).text("정말 리셋할까요?");
                break;
            case 0:
                GAMEINFO.initCurrentGame("hue", this.currentStage);
                $(btn).text("리셋");
                break;
            default:
                break;
        }
    }

    gradeHueGame() {
        if (!this.isWide && !(this.isViewAll % 2)) {
            $(`#test-${GAMEINFO.currentGame}-${GAMEINFO.currentStage} .menu`)
                .fadeOut(120);
            this.viewAll();
            setTimeout(() => {
                this.viewAll();
            }, FADE_OUT_TIME + DELAY_FOR_SUBMITTING);
        }
        this.wrongIndex = [];
        let corrAns = 0;
        GAMEINFO.selectedArr.forEach((el, i) => {
            if (el != GAMEINFO.givenArr[i]) {
                if (el == GAMEINFO.answerArr[i]) {
                    GAMEINFO.TOTAL_SCORE += GAMEINFO.hue.SCORE_RATE_FOR_EACH_HUE_PROB;
                    corrAns += 1;
                } else if (el != false) {
                    this.wrongIndex.push(i);
                }
            }
        });
        // this.Wheel.showWhatWasWrong(this.ctx, this.wrongIndex); //오답을 알려주지 않는 방향으로 게임 설계
        if (corrAns == (GAMEINFO.answerArr.length - GAMEINFO.givenArr.filter(el => el != false).length)) return true;
        else return false;
    }

    delAllReq() {
        window.removeEventListener("resize", this.resize.bind(this), false);
        this.canvas.removeEventListener("pointerdown", this.onDown.bind(this), false);
        this.canvas.removeEventListener("pointermove", this.onMove.bind(this), false);
        this.canvas.removeEventListener("pointerup", this.onUp.bind(this), false);
        window.cancelAnimationFrame(this.animateRQ);
    }
}
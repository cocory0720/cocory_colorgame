/********************** LICENSE TO CODE **********************
 * MIT License
 * Copyright (c) 2022 이재석 건국대학교 전기전자공학부
 *
 * Caution : The contents of. Check LICENSE or README.
 */

import GAMEINFO, { PI2, ColorD2X, ColorX2RGBA, dist } from "../game_dataset.js";
import { FADE_OUT_TIME, DELAY_FOR_SUBMITTING } from "../main.js";

/**
 * 둥근 정사각형 그리기
 * @param {*} ctx context
 * @param {*} x (둥글지 않은 사각형 기준) 왼쪽 위 끝 모서리의 x좌표
 * @param {*} y (둥글지 않은 사각형 기준) 왼쪽 위 끝 모서리의 y좌표
 * @param {*} d (둥글지 않은 사각형 기준) 각 변의 길이
 */
function radicalRect(ctx, x, y, d) {
    /** 버튼 모서리 둥글기 (버튼 폭에 대한 비율) */
    const BDR_RADIUS_RATIO = 0.1;

    ctx.beginPath();
    ctx.arc(
        x + BDR_RADIUS_RATIO * d,
        y + BDR_RADIUS_RATIO * d,
        BDR_RADIUS_RATIO * d,
        Math.PI,
        Math.PI * 1.5,
        false
    );
    ctx.arc(
        x + (1 - BDR_RADIUS_RATIO) * d,
        y + BDR_RADIUS_RATIO * d,
        BDR_RADIUS_RATIO * d,
        Math.PI * 1.5,
        PI2,
        false
    );
    ctx.arc(
        x + (1 - BDR_RADIUS_RATIO) * d,
        y + (1 - BDR_RADIUS_RATIO) * d,
        BDR_RADIUS_RATIO * d,
        0,
        Math.PI * 0.5,
        false
    );
    ctx.arc(
        x + BDR_RADIUS_RATIO * d,
        y + (1 - BDR_RADIUS_RATIO) * d,
        BDR_RADIUS_RATIO * d,
        Math.PI * 0.5,
        Math.PI,
        false
    );
    ctx.lineTo(x, y + BDR_RADIUS_RATIO * d);
    ctx.fill();
    ctx.closePath();
}

/** 색상 휠 구현. GAMEINFO.selectedArr 배열의 내용을 표시함. */
class Wheel {
    /**
     * @param {*} x 색상 휠의 중심의 x좌표
     * @param {*} y 색상 휠의 중심의 y좌표
     * @param {*} rad 색상 휠의 반지름
     * @param {*} N 색상 개수
     */
    constructor(x, y, rad, N) {
        this.x = x;
        this.y = y;
        this.rad = rad;
        this.N = N;
        this.rotate = 0;
        /** (사용되지 않음) 애니메이션을 위한 시간 파라미터를 담은 배열 */
        this.fadeAnimation = { delay: 0 };
    }

    /** 색상 휠 그리기 */
    genWhl(ctx, rotate) {
        ctx.save();
        ctx.translate(this.x, this.y);
        this.rotate += rotate;
        ctx.rotate(this.rotate);

        // 큰 배경 원
        ctx.strokeStyle = "#888";
        ctx.beginPath();
        ctx.arc(0, 0, this.rad, 0, PI2, false);
        ctx.stroke();
        ctx.closePath();

        // 작은 원형자리
        for (let i = 0; i < this.N; i++) {
            /** 현재 자리의 중심의 x좌표 */
            const x = this.rad * Math.cos(GAMEINFO.getColorWheelAngles[i]);
            /** 현재 자리의 중심의 y좌표 */
            const y = this.rad * Math.sin(GAMEINFO.getColorWheelAngles[i]);
            /** 현재 자리의 반지름 */
            const r = this.rad * Math.sin(GAMEINFO.givenArr[i] ? GAMEINFO.getLargeCircle / 2 : GAMEINFO.getCommonCircle / 2);

            // 막대사탕모양 그리기
            ctx.beginPath();
            ctx.moveTo(0, 0);
            ctx.lineTo(x * (1 - r / this.rad), y * (1 - r / this.rad));
            ctx.stroke();
            ctx.beginPath();
            ctx.arc(x, y, r, 0, PI2, false);

            // 원형 자리 채우기
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


    /**
     * 선택된 색상을 배치함.
     * @param {*} posX 포인터 onUp된 x좌표
     * @param {*} posY 포인터 onUp된 y좌표
     * @param {*} selectedColor 선택된 색상의 컬러코드 (10진수)
     * @returns 
     */
    dropSelectedColor(posX, posY, selectedColor) {
        /** 선택된 색상의 컬러코드 (16진수) */
        const selectedColorCode = ColorD2X(selectedColor);

        for (let i = 0; i < this.N; i++) {
            /** 각 원형자리에 대하여 onUp이벤트가 발생한 위치와의 거리를 측정함 */

            /** 현재 원형자리의 각도(회전값이 포함됨) */
            const targetAngle = this.rotate + GAMEINFO.getColorWheelAngles[i];
            /** 현재 원형자리의 중심의 x좌표 */
            const x = this.rad * Math.cos(targetAngle);
            /** 현재 원형자리의 중심의 y좌표 */
            const y = this.rad * Math.sin(targetAngle);
            /** 현재 원형자리의 반지름 */
            const r = this.rad * Math.sin(GAMEINFO.givenArr[i] ? GAMEINFO.getLargeCircle / 2 : GAMEINFO.getCommonCircle / 2);
            /** 색상 휠의 중심에 대하여, 발생한 포인터이벤트의 상대위치의 x좌표*/
            const relativeX = posX - this.x;
            /** 색상 휠의 중심에 대하여, 발생한 포인터이벤트의 상대위치의 y좌표*/
            const relativeY = posY - this.y;

            if (dist(x, y, relativeX, relativeY) < r) { //this area has index of i
                /** 현재 원형자리의 중심과 이벤트 발생 위치의 거리가 반지름보다 작은 경우 */

                /** 현재 색상 버튼에 있는 색상들의 배열 */
                const onBtnArr = GAMEINFO.optionArr;
                /** 현재 색상 휠에 있는 색상들의 배열 */
                const onWheelArr = GAMEINFO.selectedArr;
                /** 현재 선택된 색상이 색상 버튼에서 온 색상인가? -1 : 그 자리의 index. */
                const colorFromBtn = onBtnArr.indexOf(selectedColorCode);
                /** 현재 선택된 색상이 색상 휠에서 온 색상인가? -1 : 그 자리의 index. */
                const colorFromWheel = onWheelArr.indexOf(selectedColorCode);

                if (onWheelArr[i] == false) {
                    // 이벤트가 발생한 원형자리가 비어있을 경우
                    if (colorFromBtn != -1) { // if the color is from the button
                        // 현재 선택된 색상이 색상 버튼에서 온 색상인 경우

                        // 버튼에서 그 색상을 제거
                        onBtnArr.splice(colorFromBtn, 1);

                        // 선택된 자리를 선택한 색상으로 채움(덮어씀)
                        onWheelArr[i] = selectedColorCode;
                    } else {
                        // 현재 선택된 색상이 색상 휠의 다른 자리에서 온 색상인 경우

                        // 휠에서 그 색상을 제거
                        delete onWheelArr[colorFromWheel];
                        onWheelArr[colorFromWheel] = false;

                        // 선택된 자리를 선택한 색상으로 채움(덮어씀)
                        onWheelArr[i] = selectedColorCode;
                    }
                } else {
                    // 이벤트가 발생한 원형자리가 채워져있을 경우

                    // 일단, 채워져있는 그 색상이 테스트에서 주어진 색상인 경우 아무 동작도 하지 않음
                    if (GAMEINFO.givenArr.indexOf(onWheelArr[i]) != -1) return;

                    if (colorFromBtn != -1) {
                        // 현재 선택된 색상이 색상 버튼에서 온 색상인 경우

                        /**
                         * 버튼에서 선택된 색상을 제거하고,
                         * 그 자리에 채워져있던 색상을 버튼에 추가함.
                         */
                        onBtnArr.splice(colorFromBtn, 1);
                        onBtnArr.push(onWheelArr[i]);

                        // 선택된 자리를 선택한 색상으로 채움(덮어씀)
                        onWheelArr[i] = selectedColorCode;
                    } else {
                        // 현재 선택된 색상이 색상 휠의 다른 자리에서 온 색상인 경우

                        // 서로 위치를 바꿈
                        const temp = onWheelArr[i];
                        delete onWheelArr[colorFromWheel];
                        onWheelArr[colorFromWheel] = temp;
                        // 선택된 자리를 선택한 색상으로 채움(덮어씀)
                        onWheelArr[i] = selectedColorCode;
                    }
                }

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
        onWheelArr[i] = selectedColorCode;
        return;
    }



    /** (사용되지 않음) 틀린 색상을 표시함 */
    showWhatWasWrong(ctx, indexes) {
        const req = window.requestAnimationFrame(
            this.showWhatWasWrong.bind(this, ctx, indexes)
        );
        const FADE_VALOCITY = 8;
        this.fadeAnimation["delay"] += 8;
        indexes.forEach((index) => {
            if (this.fadeAnimation[index] == undefined) this.fadeAnimation[index] = 1;
            const targetAngle = this.rotate + GAMEINFO.getColorWheelAngles[index];
            const x = this.rad * Math.cos(targetAngle);
            const y = this.rad * Math.sin(targetAngle);
            const r =
                this.rad *
                Math.sin(
                    GAMEINFO.givenArr[index] ?
                    GAMEINFO.getLargeCircle / 2 :
                    GAMEINFO.getCommonCircle / 2
                );
            ctx.save();
            ctx.translate(this.x, this.y);
            ctx.shadowColor = "rgba(0,0,0,0.6)";
            ctx.shadowBlur = 7;
            ctx.strokeStyle =
                ColorX2RGBA(GAMEINFO.answerArr[index]) +
                `${this.fadeAnimation[index] / 255}`;
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
            if (this.fadeAnimation[index] < 255)
                this.fadeAnimation[index] += FADE_VALOCITY;
        });
        if (this.fadeAnimation["delay"] >= FADE_OUT_TIME)
            window.cancelAnimationFrame(req);
    }
}

/** 색상 버튼 구현. GAMEINFO.optionArr 내용을 구현함. */
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
        /** 버튼간 간격 (전체 높이에 대한 비율) */
        const MRG_RATIO = 0.2;
        const row = this.N <= 10 ? 2 : this.N <= 20 ? 3 : 4;
        const col = 2 * row;
        const d = ((1 - MRG_RATIO) * (this.y2 - this.y1)) / col;
        const mrg = ((this.y2 - this.y1) * MRG_RATIO) / (col - 1);
        let index = 0;
        for (let i = 0; i < row; i++) {
            for (let j = 0; j < col; j++) {
                if (index >= GAMEINFO.optionArr.length) break;
                const x = this.x + (d + mrg) * i;
                const y = this.y1 + (d + mrg) * j;
                ctx.save();
                ctx.fillStyle = GAMEINFO.optionArr[index];
                radicalRect(ctx, x, y, d);
                ctx.restore();
                index++;
            }
        }
        ctx.restore();
    }
}

/** 색상 말풍선 구현. 현재 선택되어있는 색상을 표시함 */
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
            radicalRect(ctx, bdr_h, bdr_h * 2, bbl_h);
            ctx.closePath();
            ctx.fill();
            ctx.restore();
        }
    }
}

/** 색상 테스트 모듈 */
export default class HueGame {
    /**
     * @param {*} query 색상 테스트를 구현할 canvas 객체의 HTML 쿼리
     * @param {*} N 테스트에서 사용되는 색상 수
     */
    constructor(query, N) {
        /** 현재 스테이지 */
        this.currentStage = N <= 10 ? 1 : N <= 20 ? 2 : 3;

        // 현재 테스트-스테이지에 대한 정보를 가져옴
        GAMEINFO.initCurrentGame("hue", this.currentStage);

        // 색상휠을 구현할 각도 배열을 가져움
        GAMEINFO.initColorWheelAngles(N);

        /** 현재 스테이지 색상 수 */
        this.n = N;

        /** 현재 페이지 캔버스HTML객체 */
        this.canvas = query;
        /** 현재 캔버스 객체의 context */
        this.ctx = this.canvas.getContext("2d");

        // 페이지 리사이즈시 캔버스를 다시 그림
        window.addEventListener("resize", this.resize.bind(this), false);

        /** 캔버스에 그려지는 요소들을 배치함 */
        this.resize();

        /** 포인터 이벤트가 발생한 x좌표. 캔버스의 크기가 두배임에 유의. */
        this.pointerX = 0;
        /** 포인터 이벤트가 발생한 y좌표. 캔버스의 크기가 두배임에 유의. */
        this.pointerY = 0;

        /** 포인터 이벤트가 색상 휠 안쪽부분에서 발생 할 경우,
         * 색상 배치와 휠 회전을 구현하기 위함 */
        this.isDownOnWheel = false;

        /** 색상 휠이 회전한 정도 */
        this.rotate = 0;

        // 포인터 이벤트 등록
        this.canvas.addEventListener("pointerdown", this.onDown.bind(this), false);
        this.canvas.addEventListener("pointermove", this.onMove.bind(this), false);
        this.canvas.addEventListener("pointerup", this.onUp.bind(this), false);

        /** 애니메이션 등록. 등록된 ID값. 애니메이션 취소를 위함. */
        this.animateRQ = window.requestAnimationFrame(this.animate.bind(this));

        // 전체보기와 리셋 버튼
        $(".action-reset")
            .off("click")
            .click(() => this.reset());
        $(".action-view")
            .off("click")
            .click(() => this.viewAll());

        /** 전체보기 상태인 경우에 홀수, 토글 구현을 위해 (값 % 2)를 이용 */
        this.isViewAll = 0;
        /** 애니메이션 구현을 위한 시간 파라미터 */
        this.t_veiwAll = 0;
        /** 리셋을 누른 경우 홀수, 토글 구현을 위해 (값 % 2)를 이용. 정말 리셋할지를 묻기위함. */
        this.sure4Reset = 0;
    }
    get clickedColor() {
            return this._clickedColor; // colorcode in Decimal
        }
        /**
         * 선택된 색상의 컬러코드(10진수). 변형된 색상인지 확인함.
         * @param {number} color R *256^2 + G *256 + B 로 이루어진 10진수 코드
         */
    set clickedColor(color) {
        // color corruption hazard control
        if (color == 0 || GAMEINFO.answerArr.indexOf(ColorD2X(color)) != -1) {
            this._clickedColor = color;
        } else {
            return;
        }
    }

    /**
     * 캔버스의 크기를 정하고, 그 안에 그려지는 요소들을 배치함.
     */
    resize() {
        /** 캔버스의 크기는 css로 정한 크기의 2배임. */
        this.stageWidth = 2 * (window.innerWidth < 1600 ? window.innerWidth : 1600);
        /** 캔버스의 크기는 css로 정한 크기의 2배임. */
        this.stageHeight =
            2 * (window.innerHeight < 900 ? window.innerHeight : 900);
        this.canvas.width = this.stageWidth;
        this.canvas.height = this.stageHeight;

        /** 화면 비율이 w : h = 7.5 : 9 보다 넓을 경우 true*/
        this.isWide = this.stageWidth / 750 > this.stageHeight / 900 ? 1 : 0;

        let center = [this.stageWidth / 2, this.stageHeight / 2];

        /** 색상 휠의 중심의 세로위치 (= 화면 중앙) */
        this.centerOfWheelY = center[1];

        if (this.isWide) {
            // PC

            /** 색상 휠의 반지름 */
            this.radiusOfWheel = this.stageHeight / (5 - this.currentStage / 2);

            /** 색상 버튼들의 너비 */
            this.widthOfBtns = this.radiusOfWheel * (1.3 - this.currentStage * 0.12);

            // 색상 휠의 중심을 약간 왼쪽 바깥으로 이동
            center[0] -= 80;

            /** 색상 휠의 중심의 가로위치 */
            this.centerOfWheelX = center[0] - this.stageWidth / 12 - 40;

            /** 색상 버튼의 왼쪽 상단 모서리의 가로위치 */
            this.btnOffsetX =
                center[0] + this.radiusOfWheel / 2 + this.stageWidth / 12;

            // PC화면 크기에서는 전체보기 기능 불필요
            const viewBtn = $(
                `#test-${GAMEINFO.currentGame}-${GAMEINFO.currentStage} .action-view`
            );
            viewBtn.css("display", "none");
        } else {
            // Mobile

            this.radiusOfWheel = this.stageWidth / (2.84 - this.currentStage / 2);

            this.widthOfBtns = this.radiusOfWheel * (1.1 - this.currentStage * 0.12);

            this.btnOffsetX = center[0] + this.stageWidth / 2 - this.widthOfBtns;

            this.centerOfWheelX = this.btnOffsetX - this.radiusOfWheel - 60;
        }

        /** 현재 캔버스의 색상 휠을 그리는 객체 */
        this.Wheel = new Wheel( // (x, y, rad, N)
            this.centerOfWheelX,
            this.centerOfWheelY,
            this.radiusOfWheel,
            this.n
        );

        /** 현재 캔버스의 색상 버튼들을 그리는 객체 */
        this.ClrBtns = new ClrBtns( // (x, y1 = center - w, y2 = center + w, N)
            this.btnOffsetX,
            this.stageHeight / 2 - this.widthOfBtns,
            this.stageHeight / 2 + this.widthOfBtns,
            this.n
        );

        /** 현재 캔버스에서 선택한 색상을 보여주는 말풍선을 그리는 객체 */
        this.Picker = new Picker(this.widthOfBtns / 3);
    }

    animate() {
        this.animateRQ = window.requestAnimationFrame(this.animate.bind(this));
        this.ctx.clearRect(0, 0, this.stageWidth, this.stageHeight);
        this.rotate *= 0.82;

        this.Wheel.genWhl(this.ctx, this.rotate);
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
        if (
            dist(
                this.pointerX,
                this.pointerY,
                this.centerOfWheelX,
                this.centerOfWheelY
            ) <
            this.radiusOfWheel * 0.93
        ) {
            this.isDownOnWheel = true;
            this.rotate = 0;
        } else {
            let pickColor = 0;
            this.ctx
                .getImageData(this.pointerX, this.pointerY, 1, 1)
                .data.slice(0, 3)
                .forEach((RGBs, i) => {
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
            this.rotate =
                Math.atan2(
                    2 * e.offsetY - this.centerOfWheelY,
                    2 * e.offsetX - this.centerOfWheelX
                ) -
                Math.atan2(
                    this.pointerY - this.centerOfWheelY,
                    this.pointerX - this.centerOfWheelX
                );
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
            );
        }
        this.isDownOnWheel = false;
        this.clickedColor = 0;
    }

    viewAll() {
        this.isViewAll += 1;
        window.requestAnimationFrame(this.viewAllAnimate.bind(this));
        switch (this.isViewAll % 2) {
            case 1:
                window.removeEventListener("resize", this.resize.bind(this), false);
                this.canvas.removeEventListener(
                    "pointerdown",
                    this.onDown.bind(this),
                    false
                );
                break;
            case 0:
                window.addEventListener("resize", this.resize.bind(this), false);
                this.canvas.addEventListener(
                    "pointerdown",
                    this.onDown.bind(this),
                    false
                );
                break;
            default:
                break;
        }
    }

    viewAllAnimate() {
        const req = window.requestAnimationFrame(this.viewAllAnimate.bind(this));
        const VALOCITY = 1;
        const curve =
            1 +
            ((this.t_veiwAll - 30) * (this.t_veiwAll - 30) * (this.t_veiwAll - 30)) /
            27000; // 0~1
        const curveInverse =
            (this.t_veiwAll * this.t_veiwAll * this.t_veiwAll) / 27000;
        if (this.isViewAll % 2 == 1) {
            this.t_veiwAll += VALOCITY;
            this.Wheel.x =
                this.centerOfWheelX * (1 - curve) + (this.stageWidth / 2) * curve;
            this.Wheel.rad =
                this.radiusOfWheel * (1 - curve) + (this.stageWidth / 2 - 100) * curve;
            this.ClrBtns.x = this.btnOffsetX * (1 - curve) + this.stageWidth * curve;
        } else {
            this.t_veiwAll -= VALOCITY;
            this.Wheel.x =
                this.centerOfWheelX * (1 - curveInverse) +
                (this.stageWidth / 2) * curveInverse;
            this.Wheel.rad =
                this.radiusOfWheel * (1 - curveInverse) +
                (this.stageWidth / 2 - 100) * curveInverse;
            this.ClrBtns.x =
                this.btnOffsetX * (1 - curveInverse) + this.stageWidth * curveInverse;
        }
        this.t_veiwAll =
            this.t_veiwAll >= 30 ? 30 : this.t_veiwAll >= 0 ? this.t_veiwAll : 0;
        if (this.t_veiwAll == 0 || this.t_veiwAll == 30)
            window.cancelAnimationFrame(req);
    }

    reset() {
        GAMEINFO.initCurrentGame("hue", this.currentStage);
    }

    gradeHueGame() {
        if (!this.isWide && !(this.isViewAll % 2)) {
            $(`#test-${GAMEINFO.currentGame}-${GAMEINFO.currentStage} .menu`).fadeOut(
                120
            );
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
        // this.Wheel.showWhatWasWrong(this.ctx, this.wrongIndex);
        // 함수를 사용하지 않음 : 오답을 알려주지 않는 방향으로 게임 설계.
        if (
            corrAns ==
            GAMEINFO.answerArr.length -
            GAMEINFO.givenArr.filter((el) => el != false).length
        )
            return true;
        else return false;
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
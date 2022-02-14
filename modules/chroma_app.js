import GAMEINFO, {
  ColorD2X,
  distSpace,
  distBtn,
  isNoDropArea_Chroma,
} from "../game_dataset.js";
let isWide;

/** 채도를 채워넣는 공간 클래스
 *  - 해당 공간은 채도 테스트를 기준으로 왼쪽에 위치
 */
class Spaces {
  /**
   *
   * @param {number} ax               한 칸의 너비
   * @param {number} spacex           시작 x좌표
   * @param {number} y1               시작 y좌표
   * @param {number} y2               끝 y좌표
   * @param {number} N                칸 수 - 채도 수와 동일
   */
  constructor(ax, spacex, y1, y2, N) {
    this.ax = ax;
    this.x = spacex;
    this.y1 = y1;
    this.y2 = y2;
    this.N = N;
  }

  /** 채도를 채워넣는 공간을 생성하는 함수
   *
   * @param {*} ctx canvas 내 context
   */
  genSpaces(ctx) {
    ctx.save();
    ctx.translate(0, 0);
    for (let i = 0; i < this.N; i++) {
      const x = this.x; //한 칸의 시작 x좌표 - 모든 칸 동일
      const y = this.y1 + i * ((this.y2 - this.y1) / this.N); //한 칸의 시작 y좌표 - 해당 칸을 생성할 때마다 새로 지정
      const w = this.ax; //한 칸의 폭
      const h = (this.y2 - this.y1) / this.N; //한 칸의 높이

      ctx.save();
      ctx.beginPath();

      ctx.arc(x + h / 2, y + h / 2, h / 2, Math.PI * 0.5, Math.PI * 1.5, false);
      ctx.arc(
        x + w - h / 2,
        y + h / 2,
        h / 2,
        Math.PI * 1.5,
        Math.PI * 0.5,
        false
      );
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

        ctx.fillStyle = "#eeeeee9a";
        ctx.fill();
        ctx.stroke();
      }
      ctx.closePath();
      ctx.restore();
    }
    ctx.restore();
  }

  /**사용자가 선택한 채도(이하 user-chroma)를 해당 공간에 채워주는 함수(1) - space에 떨어뜨린 경우
   *
   * @param {number} posX             포인터 x좌표
   * @param {number} posY             포인터 y좌표
   * @param {number} selectedColor    user-chroma
   */
  dropSelectedColor(posX, posY, selectedColor) {
    const selectedColorCode = ColorD2X(selectedColor); //user-chroma - 컬러 코드로 변환
    let checkSpace = false; //user-chroma를 채워넣을 곳이 space가 맞는지 확인하는 변수
    let loc = 0; //user-chroma를 떨어뜨린 칸의 위치 인덱스를 담는 변수

    //case 1. space에 넣은 경우 - 한 번이라도 true가 반환되면 break
    for (let i = 0; i < this.N; i++) {
      //모든 칸 확인
      if (
        !distSpace(
          this.x,
          this.y1 + i * ((this.y2 - this.y1) / this.N),
          this.ax,
          (this.y2 - this.y1) / this.N,
          posX,
          posY
        )
      ) {
        continue;
      } else {
        checkSpace = true; //채도를 채워넣는 공간이라면 true
        loc = i; //사용자가 선택한 칸의 위치
        break;
      }
    }

    /** 채도 drop 불가 공간인지 확인하는 변수
     *  - 채도 drop 불가 공간인 경우, true
     *  - 채도 drop 불가 공간이 아닌 경우, false
     */
    let isNoDropAreaCheck = isNoDropArea_Chroma(
      this.x,
      this.y1,
      this.ax,
      (this.y2 - this.y1) / this.N,
      posX,
      posY,
      this.N
    );

    /** 채도 drop 불가 공간이 아닌 경우
     *  그리고 채도를 채워넣는 공간인 경우
     *  - 사용자가 선택한 채도(이하 user-chroma)가 drop하지 말아야 할 공간에 채워져서는 안 되며
     *  - user-chroma가 올바른 공간에 채워져야 함
     */
    if (!isNoDropAreaCheck && checkSpace) {
      //user-chroma가 이미 채워진 채도가 아닌 경우
      if (!GAMEINFO.selectedArr.includes(selectedColorCode)) {
        //1) 채도 btn에서 채도를 가져와 space에 넣는 경우
        let remove = GAMEINFO.optionArr.indexOf(selectedColorCode); //optionArr에서 제거되는 채도의 위치 인덱스
        if (!GAMEINFO.selectedArr[loc]) {
          //1-1) drop할 칸이 빈 경우 - space에 user-chroma 채워넣기
          GAMEINFO.selectedArr[loc] = selectedColorCode; //user-chroma를 selectedArr에 채워넣음
          GAMEINFO.optionArr.splice(remove, 1); //optionArr에서 user-chroma 제거
        } else {
          //1-2) drop할 칸에 이미 채도가 채워져 있는 경우 - 서로 바꾸기(switch)
          let temp = GAMEINFO.selectedArr[loc]; //drop할 칸에 채워진 채도를 임시 변수에 담음
          GAMEINFO.selectedArr[loc] = selectedColorCode; //drop할 칸을 user-chroma로 채워넣음
          GAMEINFO.optionArr.push(temp); //채도 btn에 임시 변수에 담긴 채도 넣음
          GAMEINFO.optionArr.splice(remove, 1); //optionArr에서 user-chroma 제거
        }
      } else {
        //2) space 내에서 user-chroma가 선택된 경우
        let remove = GAMEINFO.selectedArr.indexOf(selectedColorCode); //selectedArr에서 제거되는 채도의 위치 인덱스
        GAMEINFO.selectedArr.splice(remove, 1, false); //selectedArr에서 user-chroma를 제거하면서 false로 교체
        if (!GAMEINFO.selectedArr[loc]) {
          //2-1) drop할 위치가 빈 경우
          GAMEINFO.selectedArr[loc] = selectedColorCode;
        } else {
          //2-2) drop할 위치에 이미 채도가 채워져 있는 경우 - 서로 바꾸기(switch)
          let temp = GAMEINFO.selectedArr[loc]; //drop할 칸에 채워져 있는 채도를 임시 변수에 담음
          GAMEINFO.selectedArr[loc] = selectedColorCode; //drop할 칸을 user-chroma로 채워넣음
          GAMEINFO.selectedArr[remove] = temp; //selectedArr에 임시 변수에 담긴 채도 넣음
        }
      }
    }
  }
}

/** 채도 btn이 모여있는 클래스
 *  - 해당 공간은 채도 테스트를 기준으로 오른쪽에 위치
 */
class ClrBtns {
  /**
   *
   * @param {number} bx       한 칸의 너비
   * @param {number} btnx     시작 x좌표
   * @param {number} y1       시작 y좌표
   * @param {number} y2       끝 y좌표
   * @param {number} N        칸 수 - 채도 수와 동일
   */
  constructor(bx, btnx, y1, y2, N) {
    this.bx = bx;
    this.x = btnx + bx * 0.1;
    this.y1 = y1;
    this.y2 = y2;
    this.N = N;
  }
  genBtns(ctx) {
    ctx.save();
    ctx.translate(0, 0);
    const MRG_RATIO = 0.1;
    const row = 2;
    const col = this.N === 10 ? row * 2 : row * 2.5;
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

  /** 사용자가 선택한 채도(이하 user-chroma)를 해당 공간에 채워주는 함수(2) - 채도 btn에 떨어뜨린 경우
   *  - 사용자가 user-chroma를 채도 btn에 다시 돌려 놓고 싶은 경우에 해당
   * @param {number} posX           포인터 x좌표
   * @param {number} posY           포인터 y좌표
   * @param {number} selectedColor  user-chroma
   */
  dropSelectedColor(posX, posY, selectedColor) {
    const selectedColorCode = ColorD2X(selectedColor); //user-chroma - 컬러 코드로 변환
    let checkBtns = false; //user-chroma를 채워넣을 채도 btn이 맞는지 확인하는 변수

    //case 2. 채도 btn에 넣는 경우
    if (distBtn(this.x, this.y1, this.y2, this.bx, posX, posY)) {
      checkBtns = true; //채도 btn 공간인 경우, true
    }

    /** user-chroma를 떨어뜨리는 공간이 채도 btn인 경우
     *  그리고 user-chroma가 optionArr에 포함되어 있지 않은 경우
     *  - user-chroma는 사용자가 optionArr에서 선택한 채도이므로 해당 시점의 optionArr에는 user-chroma가 있어서는 안 됨
     *  - user-chroma를 떨어뜨리는 곳이 채도 btn 내부이기만 하면 됨
     */
    if (checkBtns && !GAMEINFO.optionArr.includes(selectedColorCode)) {
      let remove = GAMEINFO.selectedArr.indexOf(selectedColorCode); //selectedArr에 놓았던 user-chroma의 위치 인덱스
      GAMEINFO.optionArr.push(selectedColorCode); //user-chroma를 optionArr에 추가
      GAMEINFO.selectedArr.splice(remove, 1, false); //selectedArr에서 user-chroma 제거
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

/* 채도 테스트 모듈 */
export default class ChromaGame {
  /**
   *
   * @param {*} query     채도 테스트를 구현할 canvas 객체의 HTML 쿼리
   * @param {number} N    테스트에서 사용되는 채도 수
   */
  constructor(query, N) {
    switch (
      query.id //canvas 객체의 HTML 쿼리 내 id 값을 기준으로 현재 스테이지 결정
    ) {
      case "canvasChroma1":
        this.currentStage = 1;
        break;
      case "canvasChroma2":
        this.currentStage = 2;
        break;
      case "canvasChroma3":
        this.currentStage = 3;
        break;
      case "canvasChroma4":
        this.currentStage = 4;
        break;
    }
    GAMEINFO.initCurrentGame("chroma", this.currentStage); //채도 테스트에서 사옹할 자체 데이터 가져오기
    this.n = N; //채도 수

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
      this.spacex,
      this.stageHeight * 0.1,
      this.stageHeight * 0.9,
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
    this.Spaces.genSpaces(this.ctx);
    this.ClrBtns.genBtns(this.ctx);
    this.Picker.genBubl(
      this.ctx,
      this.pointerX,
      this.pointerY,
      this.clickedColor
    );
  }

  /**
   *
   * @param {*} e   pointerdown 이벤트 - 포인터가 클릭상태인 이벤트
   */
  onDown(e) {
    let pickColor = 0;
    this.pointerX = 2 * e.offsetX;
    this.pointerY = 2 * e.offsetY;
    /**
     * 사용자의 클릭 상태를 저장하는 변수
     * - onDown의 경우, 포인터가 클릭상태이므로 true
     */
    this.isDown = true;

    //사용자가 클릭한 경우
    if (this.isDown) {
      this.ctx
        .getImageData(this.pointerX, this.pointerY, 1, 1)
        .data.slice(0, 3)
        .forEach((RGBs, i) => {
          pickColor += RGBs * Math.pow(256, 2 - i);
        });
      if (
        !GAMEINFO.answerArr.includes(ColorD2X(pickColor)) ||
        GAMEINFO.givenArr.includes(ColorD2X(pickColor))
      ) {
        pickColor = -1; //사용자가 선택한 채도의 값을 -1로 변환
      }
      this.clickedColor = pickColor;
    }
  }

  /**
   *
   * @param {*} e   pointermove 이벤트 - 포인터가 움직이는 이벤트
   */
  onMove(e) {
    //사용자가 클릭한 경우
    //그리고 사용자가 제대로 된 색채를 선택한 경우
    if (this.isDown && this.clickedColor >= 0) {
      this.pointerX = 2 * e.offsetX;
      this.pointerY = 2 * e.offsetY;
    }
  }

  /**
   *
   * @param {*} e   pointerup 이벤트 - 포인터가 클릭상태에서 떼진 이벤트
   */
  onUp(e) {
    this.pointerX = 2 * e.offsetX;
    this.pointerY = 2 * e.offsetY;
    if (this.clickedColor >= 0) {
      //사용자가 제대로 된 색채를 선택한 경우
      this.Spaces.dropSelectedColor(
        //사용자가 선택한 색채를 space 중 한 칸에 채워넣기
        this.pointerX,
        this.pointerY,
        this.clickedColor
      );
      this.ClrBtns.dropSelectedColor(
        //사용자가 선택한 색채를 색채 btn에 채워넣기
        this.pointerX,
        this.pointerY,
        this.clickedColor
      );
    }
    /**
     * - onUp의 경우, 포인터가 클릭상태가 아니므로 false
     */
    this.isDown = false;
    this.clickedColor = -1;
  }

  /**
   * 사용자가 주어진 모든 값을 맞혔는지에 대한 여부를 반환하는 함수
   * - selectedArr와 answerArr를 비교
   * - true인 경우, 색채테스트 점수 계산 시 만점자에 한해 남은 시간을 추가 점수로 부여하기 위함
   * @returns {boolean}
   */
  gradeChromaGame() {
    let corrAns = 0; //사용자가 맞은 개수를 담는 변수 - givenArr는 제외

    GAMEINFO.selectedArr.forEach((ele, idx) => {
      //selectedArr의 각 원소 및 인덱스를 거치면서
      if (ele !== GAMEINFO.givenArr[idx] && ele === GAMEINFO.answerArr[idx]) {
        //해당 원소가 givenArr에 포함되지 않은 경우
        //그리고 해당 원소가 answerArr와 일치한 경우
        GAMEINFO.TOTAL_SCORE += GAMEINFO.chroma.SCORE_RATE_FOR_EACH_CHROMA_PROB; //맞은 개수만큼 점수 부여
        corrAns++; //맞은 개수 1 증가
      }
    });
    if (
      corrAns ===
      GAMEINFO.answerArr.length -
        GAMEINFO.givenArr.filter((el) => el != false).length
    ) {
      //다 맞은 경우
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

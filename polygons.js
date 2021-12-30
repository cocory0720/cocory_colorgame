const PI2 = Math.PI * 2;

export class Polygon {
    constructor(x, y, rac, sides) {
        this.x = x;
        this.y = y;
        this.rad = rad;
        this.sides = sides;
        this.rotate = 0;
    }

    animate(ctx, moveX) {
        ctx.save();
        ctx.fillStyle = "#ccc";
        //ctx.beginPath();

        const angle = PI2 / this.sides;

        ctx.translate(this.x, this.y);

        this.rotate -= moveX * 0.008;
        ctx.rotate(this.rotate);

        for (let i = 0; i < this.sides; i++) {
            const x = this.rad * Math.cos(angle * i);
            const y = this.rad * Math.sin(angle * i);

            //(i == 0) ? ctx.moveTo(x, y): ctx.lineTo(x, y);

            ctx.beginPath();
            ctx.arc(x, y, 30, 0, PI2, false);
            ctx.fill();
        }
        //ctx.fill();
        //ctx.closePath();
        ctx.restore();
    }
}
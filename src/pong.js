class PongBall {
    constructor(x, y, dx, dy, accel) {
        this.x = x
        this.y = y
        this.dx = dx
        this.dy = dy
        this.accel = accel
        this.maxY = null
        this.minY = null
    }

    setPos(x, y) {
        this.x = x,
        this.y = y
    }

    setDir(x, y) {
        this.dx = dx,
        this.dy = dy
    }

    /**
     * Calculates new position and speed of ball
     * @param x: ball x position
     * @param y: ball y position
     * @param dx: x speed
     * @param dy: y speed 
     * @param accel: accleration
     * @param dt: time interval
     * @returns 
     */
    accelerate(x, y, dx, dy, accel, dt) {
        var x2 = x + (dt * dx) + (accel * dt * dt * 0.5);
        var y2 = y + (dt * dy) + (accel * dt * dt * 0.5);
        var dx2 = dx + (accel * dt) * (dx > 0 ? 1 : -1);
        var dy2 = dy + (accel * dt) * (dy > 0 ? 1 : -1);
        return { nx: (x2 - x), ny: (y2 - y), x: x2, y: y2, dx: dx2, dy: dy2 };
    }


    /**
     * 
     * @param dt 
     * @param leftPaddle 
     * @param rightPaddle 
     * @returns 
     */
    update(dt, leftPaddle, rightPaddle) {

        pos = Pong.Helper.accelerate(this.x, this.y, this.dx, this.dy, this.accel, dt);

        if ((pos.dy > 0) && (pos.y > this.maxY)) {
            pos.y = this.maxY;
            pos.dy = -pos.dy;
        }
        else if ((pos.dy < 0) && (pos.y < this.minY)) {
            pos.y = this.minY;
            pos.dy = -pos.dy;
        }

        var paddle = (pos.dx < 0) ? leftPaddle : rightPaddle;
        var pt = this.ballIntercept(this, paddle, pos.nx, pos.ny);

        if (pt) {
            switch (pt.d) {
                case 'left':
                case 'right':
                    pos.x = pt.x;
                    pos.dx = -pos.dx;
                    break;
                case 'top':
                case 'bottom':
                    pos.y = pt.y;
                    pos.dy = -pos.dy;
                    break;
            }

            // add/remove spin based on paddle direction
            if (paddle.up)
                pos.dy = pos.dy * (pos.dy < 0 ? 0.5 : 1.5);
            else if (paddle.down)
                pos.dy = pos.dy * (pos.dy > 0 ? 0.5 : 1.5);
        }

        this.setpos(pos.x, pos.y);
        this.setdir(pos.dx, pos.dy);
    }


    ballIntercept(ball, rect, nx, ny) {
        var pt;
        if (nx < 0) {
            pt = Pong.Helper.intercept(ball.x, ball.y, ball.x + nx, ball.y + ny,
                rect.right + ball.radius,
                rect.top - ball.radius,
                rect.right + ball.radius,
                rect.bottom + ball.radius,
                "right");
        }
        else if (nx > 0) {
            pt = Pong.Helper.intercept(ball.x, ball.y, ball.x + nx, ball.y + ny,
                rect.left - ball.radius,
                rect.top - ball.radius,
                rect.left - ball.radius,
                rect.bottom + ball.radius,
                "left");
        }
        if (!pt) {
            if (ny < 0) {
                pt = Pong.Helper.intercept(ball.x, ball.y, ball.x + nx, ball.y + ny,
                    rect.left - ball.radius,
                    rect.bottom + ball.radius,
                    rect.right + ball.radius,
                    rect.bottom + ball.radius,
                    "bottom");
            }
            else if (ny > 0) {
                pt = Pong.Helper.intercept(ball.x, ball.y, ball.x + nx, ball.y + ny,
                    rect.left - ball.radius,
                    rect.top - ball.radius,
                    rect.right + ball.radius,
                    rect.top - ball.radius,
                    "top");
            }
        }
        return pt;
    }

    intercept(x1, y1, x2, y2, x3, y3, x4, y4, d) {
        var denom = ((y4 - y3) * (x2 - x1)) - ((x4 - x3) * (y2 - y1));
        if (denom != 0) {
            var ua = (((x4 - x3) * (y1 - y3)) - ((y4 - y3) * (x1 - x3))) / denom;
            if ((ua >= 0) && (ua <= 1)) {
                var ub = (((x2 - x1) * (y1 - y3)) - ((y2 - y1) * (x1 - x3))) / denom;
                if ((ub >= 0) && (ub <= 1)) {
                    var x = x1 + (ua * (x2 - x1));
                    var y = y1 + (ua * (y2 - y1));
                    return { x: x, y: y, d: d };
                }
            }
        }
        return null;
    }

}

// /**
// * Returns new object that contains new ball state {x, y, angle}
// * 
// * @param {*} ball {x: 100, y: 100, angle: }
// * @param {*} paddles [{left: {x: 110, y: 130}, right: {x: 150, y: 170}}, 
// *                     {left: {x: 210, y: 230}, right: {x: 250, y: 270}}, ...]
// * @param {*} walls [{left: {x: 100, y: 100}, right: {x: 200, y: 100}}, 
// *                   {left: {x: 200, y: 200}, right: {x: 300, y: 200}}, ...]
// */
// function getNewBallState(ball, paddles, walls) {
//     // Determine if ball collides with paddles


//     // Determine if ball collides with walls

// }
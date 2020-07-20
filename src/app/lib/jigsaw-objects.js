/**
* Copyright (c) 2012 Jhonatan Salguero (www.novatoz.com)
*/
;(function() {
"use strict";
var ctx = Util.getContext(document.createElement("canvas")),
    testCtx = ctx,
    abs = Math.abs;
var DEGREE = Math.PI / 180;

var ctxFix = Util.getContext(document.createElement("canvas"));

function getPixelRatio() { return window.devicePixelRatio || 1 }

var ua = navigator.userAgent,
    isAndroid = ua.match(/android/i),
    isIOS = ua.match(/iphone|ipad|ipod/i),
    isWindowMobile = ua.match(/Windows Phone/i) || ua.match(/iemobile/i),
    isDesktop = !isAndroid && !isIOS && !isWindowMobile;

var SNAP_DST = 20;
/* check if a piece is in the right place */
function check_position(f1, f2) {
    // test rapido
    if (f1.rotation%360 || f2.rotation%360 || f2.hide || f1.hide || 
        (f1.row != f2.row && f1.col != f2.col)) { return; }

    var diff_x = f1.tx - f2.tx,
        diff_y = f1.ty - f2.ty,
        diff_col = f1.col - f2.col,
        diff_row = f1.row - f2.row,
        w = f1.width,
        h = f1.height,
        s = f1.size;

    if (((diff_col == -1 && diff_x < 0 && abs(diff_x+w) < SNAP_DST) || 
        (diff_col == 1 && diff_x >= 0 && abs(diff_x-w) < SNAP_DST))
        && (diff_y <= SNAP_DST && diff_y >= -SNAP_DST)) {
        return [f1.col > f2.col ? -abs(diff_x)+w : abs(diff_x)-w, f2.ty-f1.ty];

    } else if (((diff_row == -1 && diff_y < 0 && abs(diff_y+h) < SNAP_DST) ||
                (diff_row == 1 && diff_y >= 0 && abs(diff_y-h) < SNAP_DST))
                 && (diff_x <= SNAP_DST && diff_x >= -SNAP_DST)) {
        return [f2.tx-f1.tx, f1.row > f2.row ? -abs(diff_y)+h : abs(diff_y)-h];
    }
}

var Piece = Cevent.Shape.extend({
    type: "piece",

    /* edges is an array like ["inside", "outside", null, "inside"]*/
    init: function(x, y, img, width, height, edges, flat) {
        this.flat = flat;
        this._super(x, y);
        this.img = img;
        this.originalImg = img;
        this.size = Math.max(width, height);
        this.width = width;
        this.height = height;
        this.diagonal = ~~Math.sqrt(width*width+height*height);
        this.edges = edges;
        this.lastRotation = 0;
        
        var half_s = this.size / 2;
        
        // Change origin to center
        this.tx = this.x + this.width/2;
        this.ty = this.y + this.height/2;
        this.x = -this.width/2;
        this.y = -this.height/2;
    },
    
    /* draw piece path */
    draw_path: function(ctx) {
        var s = this.size, fn, i = 0;
        
        ctx.beginPath();
        ctx.moveTo(this.x, this.y);

        for ( ; i < 4; i++) {
            fn = this.edges[i];
            s = i%2 ? this.height : this.width;
            var w = i%2 ? this.height : this.width;
               var h = i%2 ? this.width : this.height;
               var x = i%2 ? this.y : this.x;
               var y = i%2 ? this.x : this.y;

            /* shaped side */
            if (fn) {
               // ctx.lineTo(this.x+.4*s, this.y);
                var cx = this[fn](ctx, w, h, x, y);
                //ctx.lineTo(cx+.4*s, this.y);
            
            /* flat side */
            } else {
                ctx.lineTo(x+s, y);
            }
            ctx.rotate(Math.PI / 2);
        }
        ctx.closePath();
    },
    
    /* pre draw piece */
    render: function(ox, oy) {
        ox = ox || this.ox||0;
        oy = oy || this.oy|| 0;

        this.originalTX = this.originalTX || this.tx;
        this.originalTY = this.originalTY || this.ty;
        var ctx = this.ctx || Util.getContext(document.createElement("canvas")),
            s = this.size + .5;

        ctxFix.canvas.width = ctx.canvas.width = s * 2;
        ctxFix.canvas.height = ctx.canvas.height = s * 2;

        ctxFix.save();
        ctx.save();

        this.applyStyle(ctx);
        ctxFix.lineWidth = .5;
        ctx.lineWidth = .5;

        ctx.translate(this.width, this.height);
        ctx.rotate(this.rotation*DEGREE);

        ctxFix.translate(this.width, this.height);
        ctxFix.rotate(this.rotation*DEGREE);

        this.draw_path(ctx);
        this.draw_path(ctxFix);
        ctx.fill();

        ctxFix.drawImage(this.originalImg, -this.originalTX-ox, -this.originalTY-oy);
        if (this.stroke) {
            ctxFix.globalCompositeOperation = "lighter";
            ctxFix.shadowOffsetY = 1.5;
            ctxFix.shadowOffsetX = 1.5;
            ctxFix.shadowBlur = 0
            ctxFix.shadowColor = "rgba(255, 255, 255, .4)";
            
            ctxFix.lineWidth = 1.5;
            ctxFix.strokeStyle="rgba(0, 0, 0, .4)";
            ctxFix.stroke();
            
            ctxFix.globalCompositeOperation = "darken";
            ctxFix.shadowBlur = 1
            ctxFix.shadowOffsetY = -1;
            ctxFix.shadowOffsetX = -1;
            ctxFix.shadowBlur = 2;
            ctxFix.shadowColor = "rgba(0, 0, 0, .2)";
            
            ctxFix.lineWidth = 2;
            ctxFix.strokeStyle="rgba(0, 0, 0, .4)";
            ctxFix.stroke();
            ctxFix.clip();
        }
        
        ctxFix.restore();
        ctx.restore();

        ctx.globalCompositeOperation = 'source-in';

        if (ctx.globalCompositeOperation !== 'source-in') {
            ctx.globalCompositeOperation = 'source-atop';
        }

        ctx.drawImage(ctxFix.canvas, 0, 0);
        
        if (! this.ctx)
            this.tx += this.offset;
        this.img = ctx.canvas;
        this.ctx = ctx;
        this.ox = ox;
        this.oy = oy;
    },
    
    outside: function(ctx, w, h, cx, cy) {
        if (this.flat)
            return ctx.lineTo(cx+w, cy);

        ctx.lineTo(cx+w*.34, cy);
        
        ctx.bezierCurveTo(cx+w*.5, cy, cx+w*.4, cy+h*-0.15, cx+w*.4, cy+h*-0.15);
        
        ctx.bezierCurveTo(cx+w*.3, cy+h*-0.3, cx+w*.5, cy+h*-0.3, cx+w*.5, cy+h*-0.3);
        
        ctx.bezierCurveTo(cx+w*.7, cy+h*-0.3, cx+w*.6, cy+h*-0.15, cx+w*.6, cy+h*-0.15);
        
        ctx.bezierCurveTo(cx+w*.5, cy, cx+w*.65, cy, cx+w*.65, cy);
        
        ctx.lineTo(cx+w, cy);
    },
    
    
    inside: function(ctx, w, h, cx, cy){
        if (this.flat)
            return ctx.lineTo(cx+w, cy);
        ctx.lineTo(cx+w*.35, cy);

        ctx.bezierCurveTo(cx+w*.505, cy+.05, cx+w*.405, cy+h*.155, cx+w*.405, cy+h*.1505);
        
        
        ctx.bezierCurveTo(cx+w*.3,  cy+h*.3, cx+w*.5,  cy+h*.3, cx+w*.5,  cy+h*.3);
        
        
        ctx.bezierCurveTo(cx+w*.7, cy+h*.29, cx+w*.6, cy+h*.15, cx+w*.6, cy+h*.15);
        
        ctx.bezierCurveTo(cx+w*.5, cy, cx+w*.65, cy, cx+w*.65, cy);
        
        ctx.lineTo(cx+w, cy);
    },

    /**/
    draw: function(ctx) {
        if (this.hide) { return; }
        var x = this.x - this.width/2-.5;
        var y = this.y - this.height/2-.5;

        if (isDesktop) {
            this.setTransform(ctx);
            ctx.drawImage(this.img, x, y);
            return;
        }

        if (this.rotation !== this.lastRotation) {
            this.render();
            this.lastRotation = this.rotation;
        }
        
        ctx.drawImage(this.img, x+this.tx, y+this.ty);
    },

    /* check position */
    check: function(other) {
        var r;
        if (other.type == "piece") {
            r = check_position(this, other);
        } else {
            var i, l = other.pieces.length;
            for (i = 0; i < l; i++) {
                if (r = check_position(this, other.pieces[i])) { break; };
            }
        }
        if (r) { this.rmove(r[0], r[1]); }
        return r;
    },
    
    /* is mouse over this piece? */
    hitTest: function(point) {
        if (this.hide) { return; }
        
        this.setTransform(ctx);
        
        this.draw_path(ctx);
        
        return ctx.isPointInPath(point.x*getPixelRatio(), point.y*getPixelRatio());
    }
}),

Group = Cevent.Shape.extend({
    type: "group",
    
    init: function() {
        this.pieces = [];
        this._super(0, 0);
    },
    
    draw: function(ctx) {
        if (this.hide) { return; }

        var i, l = this.pieces.length;
        for (i = 0; i < l; i++) {
            this.pieces[i].draw(ctx);
        }
    },
    
    /* check every piece in this group */
    hitTest: function(point) {
        var i, l = this.pieces.length;
        for (i = 0; i < l; i++) {
            if (this.pieces[i].hitTest(point)){
                return true;
            }
        }
    },
    
    check: function(other) {
        var i, l = this.pieces.length, r;
        if (other.type == "piece") {
            for (i = 0; i < l; i++) {
                if (r = check_position(this.pieces[i], other)) { 
                    this.rmove(r[0], r[1]);
                    return true;
                }
            }
        } else {
            var j, l2 = other.pieces.length;
            for (i = 0; i < l; i++) {
                for (j = 0; j < l2; j++) {
                    if (r = check_position(this.pieces[i], other.pieces[j])) {
                        this.rmove(r[0], r[1]);
                        return true;
                    }
                } 
            }
        }

    },
    
    /* move each piece */
    rmove: function(x, y) {
        var i, l = this.pieces.length;
        for (i = 0; i < l; i++) { this.pieces[i].rmove(x, y); }
        this.tx = this.minPieceX.tx;
        this.ty = this.minPieceY.ty;
    },
    
    /* add new piece or merge with another group */
    add: function() {
        this.pieces = this.pieces.concat.apply(this.pieces, arguments);
        this.minPieceX = min(this.pieces, 'tx');
        this.minPieceY = min(this.pieces, 'ty');

        this.width = max(this.pieces, 'tx').tx - this.minPieceX.tx;
        this.height = max(this.pieces, 'ty').ty - this.minPieceY.ty;

        this.width += this.pieces[0].width;
        this.height += this.pieces[0].height;
        this.x = this.pieces[0].x;
        this.y = this.pieces[0].y;
        this.tx = this.minPieceX.tx;
        this.ty = this.minPieceY.ty;
    }
});

function max(array, attr) {
    var max = array[0][attr];
    var index = 0;

    for (var  i = 1; i < array.length; i++) {
        if (array[i][attr] > max) {
            max = array[i][attr];
            index = i;
        }
    }

    return array[index];
}

function min(array, attr) {
    var min = array[0][attr];
    var index = 0;

    for (var  i = 1; i < array.length; i++) {
        if (array[i][attr] < min) {
            min = array[i][attr];
            index = i;
        }
    }

    return array[index];
}
/* Register objects in canvas-event framework */
Cevent.register("group", Group);
Cevent.register("piece", Piece);
}())

/**
 * Created by 2NSoft on 24.07.15.
 */

var colorPicker = (function (){
    var colorPicker = {};

    function roundRect(ctx, x, y, width, height, radius, fill, stroke) {
        if (typeof stroke === "undefined" ) {
            stroke = 'black';
        }
        if (typeof radius === "undefined") {
            radius = 5;
        }

        ctx.beginPath();

        ctx.strokeStyle = stroke;
        ctx.fillStyle = fill;
        ctx.lineWidth = 2;

        ctx.moveTo( x + radius, y );
        ctx.lineTo( x + width - radius, y );
        ctx.quadraticCurveTo( x + width, y, x + width, y + radius );
        ctx.lineTo( x + width, y + height - radius );
        ctx.quadraticCurveTo( x + width, y + height, x + width - radius, y + height );
        ctx.lineTo( x + radius, y + height );
        ctx.quadraticCurveTo( x, y + height, x, y + height - radius );
        ctx.lineTo( x, y + radius );
        ctx.quadraticCurveTo( x, y, x + radius, y );
        ctx.closePath();

        if ( stroke ) {
            ctx.stroke();
        }
        if ( fill ) {
            ctx.fill();
        }
    }

    function rgbToHex(r, g, b) {
        return "#" + ((1 << 24) + (r << 16) + (g << 8) + b).toString(16).slice(1);
    }

    function hexToRgb(hex) {
        var result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
        return result ? {
            r: parseInt(result[1], 16),
            g: parseInt(result[2], 16),
            b: parseInt(result[3], 16)
        } : null;
    }

    Object.defineProperty( colorPicker, 'init', {
        value: function (container) {
            this._center = { x: 104, y: 104 };
            this._width = 20;
            this._radius = 80;
            this._selectorAngle = 0;
            this._ringSelectorEnabled = false;
            this._color = '#FF00FF';
            this._baseColor = '#FF00FF';

            this._stage = new Kinetic.Stage({
                container: container,
                width: ( this._center.x + 1 ) * 2,
                height: ( this._center.y + 1 ) * 2 + (this._center.y - this._radius) * 2
            });

            // color ring init
            this._ringLayer = new Kinetic.Layer({background:'transparent'});
            this._ring = new Kinetic.Ring( {
                x: this._center.x,
                y: this._center.y,
                innerRadius: this._radius - this._width,
                outerRadius: this._radius,
                stroke: 'white',
                fill: 'white',
                strokeWidth: 1
            } );
            this._ringLayer.add(this._ring);

            //ring selector init
            this._ringSelector = new Kinetic.Rect( {
                x: this._center.x,
                y: this._center.y - 1,
                width: this._width,
                height: 3,
                stroke: 'black',
                strokeWidth: 1,
                offset: {x: -this._radius + this._width, y: 1 }
            });
            this._ringSelectorLayer = new Kinetic.Layer({background:'transparent'});
            this._ringSelectorLayer.add(this._ringSelector);

            this._triangleLayer = new Kinetic.Layer({background:'transparent'});
            var side = Math.pow( 2 * (this._radius - this._width) * (this._radius - this._width) - 2 * Math.cos( 120 * Math.PI / 180 ) * (this._radius - this._width) * (this._radius - this._width), 0.5 ) - 1;
            this._colorSelectorTriangle = new Kinetic.Line( {
                points : [ - Math.pow( side * side * 3 / 4, 0.5) / 3   , -side/2,
                           2 * Math.pow( side * side * 3 / 4, 0.5) / 3 , 0,
                           - Math.pow( side * side * 3 / 4, 0.5) / 3   , side/2 ],
                closed: 'true',
                stroke: 'white',
                strokeWidth: '0',
                fill: 'white'
            });
            this._triangleLayer.add( this._colorSelectorTriangle );
            this._triangleLayer.move( {x: this._center.x, y: this._center.y} );

            this._selectorLayer = new Kinetic.Layer( {background:'transparent'})
            this._colorSelector = new Kinetic.Group( {
                x: 0,
                y: 0,
                offset: {x: -this._colorSelectorTriangle.getAttr('points')[ 2 ] + 1, y: 0 }
            });
            this._colorSelector.add( new Kinetic.Circle( {
                x: 0,
                y: 0,
                radius: 4,
                stroke: 'black'
            }))
            this._colorSelector.add( new Kinetic.Circle( {
                x: 0,
                y: 0,
                radius: 5,
                stroke: 'white'
            }))
            this._selectorLayer.add( this._colorSelector );
            this._selectorLayer.move( {x: this._center.x, y: this._center.y} );

            this._stage.add(this._ringLayer);

            this._container = document.querySelector( '#' + container );
            this._ctx = this._container.querySelector('canvas').getContext('2d');

            this._drawCircle();
            this._stage.add( this._ringSelectorLayer );
            this._stage.add( this._triangleLayer );
            this._ctxTr = this._container.querySelector('.kineticjs-content').lastElementChild.getContext('2d');
            this._stage.add( this._selectorLayer );

            this.selectorAngle = 0;

            this._ringSelectorDrag = false;
            this._colorSelectorDrag = false;

            this._ring.addEventListener( 'mousedown', function (ev) {
                if ( !colorPicker._colorSelectorDrag ) {
                    colorPicker._ringSelectorDrag = true;
                }
            }, false );
            this._ring.addEventListener( 'mousemove', function (ev) {
                if ( ( ev.buttons === 1 ) && ( !colorPicker._colorSelectorDrag ) ) {
                    colorPicker._ringSelectorDrag = true;
                } else {
                    colorPicker._ringSelectorDrag = false;
                }
            }, false );

            this._ringSelector.addEventListener( 'mousedown', function (ev) {
                if ( !colorPicker._colorSelectorDrag ) {
                    colorPicker._ringSelectorDrag = true;
                }
            }, false );
            this._ringSelector.addEventListener( 'mousemove', function (ev) {
                if ( ( ev.buttons === 1 ) && ( !colorPicker._colorSelectorDrag ) ) {
                    colorPicker._ringSelectorDrag = true;
                } else {
                    colorPicker._ringSelectorDrag = false;
                }
            }, false );

            this._colorSelectorTriangle.addEventListener( 'mousedown', function (ev) {
                if ( !colorPicker._ringSelectorDrag ) {
                    colorPicker._colorSelectorDrag = true;
                }
            }, false );
            this._colorSelectorTriangle.addEventListener( 'mousemove', function (ev) {
                if ( ( ev.buttons === 1 ) && ( !colorPicker._ringSelectorDrag ) ) {
                    colorPicker._colorSelectorDrag = true;
                } else {
                    colorPicker._colorSelectorDrag = false;
                }
            }, false );

            this._colorSelector.addEventListener( 'mousedown', function (ev) {
                if ( !colorPicker._ringSelectorDrag ) {
                    colorPicker._colorSelectorDrag = true;
                }
            }, false );
            this._colorSelector.addEventListener( 'mousemove', function (ev) {
                if ( ( ev.buttons === 1 ) && ( !colorPicker._ringSelectorDrag ) ) {
                    colorPicker._colorSelectorDrag = true;
                } else {
                    colorPicker._colorSelectorDrag = false;
                }
            }, false );

            this._stage.addEventListener( 'mouseup', function (ev) {
                colorPicker._ringSelectorDrag = false;
                colorPicker._colorSelectorDrag = false;
            }, false );

            this._stage.addEventListener( 'mouseout', function (ev) {
                if ( ev.buttons && 1 === 0 ) {
                    colorPicker._ringSelectorDrag = false;
                    colorPicker._colorSelectorDrag = false;
                }
            }, false );

            this._stage.addEventListener( 'mousemove', function (ev) {
                if ( colorPicker._ringSelectorDrag ) {
                    colorPicker.selectorAngle = - Math.atan2( colorPicker._center.x - ev.clientX + colorPicker._container.offsetLeft, colorPicker._center.y - ev.clientY + colorPicker._container.offsetTop ) - Math.PI / 2;
                }
                if (colorPicker._colorSelectorDrag ) {
                    var
                        dx, dy, dist, angle;
                    dx = ev.clientX - colorPicker._container.offsetLeft - colorPicker._center.x;
                    dy = ev.clientY - colorPicker._container.offsetTop - colorPicker._center.y;
                    dist = Math.pow(dx * dx + dy * dy, 0.5);
                    angle = Math.atan2(dx, dy) - Math.PI / 2;

                    dx = Math.round(Math.cos(angle + colorPicker.selectorAngle) * dist);
                    dy = Math.round(Math.sin(angle + colorPicker.selectorAngle) * dist);
                    colorPicker._colorSelector.setAttr('offset', {x: -dx, y: dy});
                    colorPicker._selectorLayer.draw();
                    colorPicker.selectorAngle = colorPicker.selectorAngle;
                }
            }, false );


/*            this._ring.addEventListener( 'mousemove', function (ev) {
                if (ev.buttons===1) {
                    colorPicker.selectorAngle = - Math.atan2( colorPicker._center.x - ev.clientX + colorPicker._container.offsetLeft, colorPicker._center.y - ev.clientY + colorPicker._container.offsetTop ) - Math.PI / 2;
                }
            }, false );

            this._ring.addEventListener( 'click', function (ev) {
                 colorPicker.selectorAngle = - Math.atan2( colorPicker._center.x - ev.clientX + colorPicker._container.offsetLeft, colorPicker._center.y - ev.clientY + colorPicker._container.offsetTop ) - Math.PI / 2;
            }, false );

            this._colorSelectorTriangle.addEventListener( 'mousemove', function (ev) {
                var
                    dx, dy, dist, angle;
                if (ev.buttons===1) {
                    dx = ev.clientX - colorPicker._container.offsetLeft - colorPicker._center.x;
                    dy = ev.clientY - colorPicker._container.offsetTop - colorPicker._center.y;
                    dist = Math.pow(dx * dx + dy * dy, 0.5);
                    angle = Math.atan2(dx, dy) - Math.PI / 2;

                    dx = Math.round(Math.cos(angle + colorPicker.selectorAngle) * dist);
                    dy = Math.round(Math.sin(angle + colorPicker.selectorAngle) * dist);
                    colorPicker._colorSelector.setAttr('offset', {x: -dx, y: dy});
                    colorPicker._selectorLayer.draw();
                    colorPicker.selectorAngle = colorPicker.selectorAngle;
                 //   colorPicker._drawTriangle();
                }
            }, false );  */
            return this;
        }
    });

    Object.defineProperty( colorPicker, 'selectorAngle', {
        get : function () {
            return this._selectorAngle;
        },
        set: function( value ) {
            var
                x, y, dist, angle,
                r, g, b,
                delta = value - this.selectorAngle;
            this._selectorAngle = value;

            this._ringSelector.rotate( delta * 180 / Math.PI );
            this._ringSelectorLayer.draw();

            this._colorSelectorTriangle.rotate( delta * 180 / Math.PI );
            this._colorSelector.rotate( delta * 180 / Math.PI );
            this._triangleLayer.draw();
            this._selectorLayer.draw();

            x = Math.round(this._radius + Math.cos(this.selectorAngle) * (this._radius - this._width / 2 ));
            y = Math.round(this._radius + Math.sin(this.selectorAngle) * (this._radius - this._width / 2 )) - 1;
            r = this._imagedata.data[( ( y * this._radius * 2) + x ) * 4];
            g = this._imagedata.data[( ( y * this._radius * 2) + x ) * 4 + 1];
            b = this._imagedata.data[( ( y * this._radius * 2) + x ) * 4 + 2];
            this._baseColor = rgbToHex( r, g, b );

            this._drawTriangle();

            x = -this._colorSelector.getAttr('offset').x;
            y = this._colorSelector.getAttr('offset').y;
            dist = Math.pow( x * x + y * y, 0.5 );
            angle = Math.atan2( x, y ) - Math.PI / 2;
            x = Math.cos( this._selectorAngle + angle ) * dist;
            y = Math.sin( this._selectorAngle + angle ) * dist;
            x = Math.round( this._radius - 1 + x );
            y = Math.round( this._radius - 1 + y );
            r = this._trData.data[( ( y * this._radius * 2) + x ) * 4];
            g = this._trData.data[( ( y * this._radius * 2) + x ) * 4 + 1];
            b = this._trData.data[( ( y * this._radius * 2) + x ) * 4 + 2];
            this._color = rgbToHex( r, g, b );

            roundRect( this._ctx, this._center.x - this._radius, this._center.y + this._center.x, this._radius * 2, this._center.x - this._radius, 6, this._color, 'black' );
        }
    } );

    Object.defineProperty( colorPicker, 'color', {
        enumerable: true,
        get : function () {
            return this._color;
        }
    })

    Object.defineProperty( colorPicker, '_drawCircle', {
        value: function() {

            this._imagedata = this._ctx.getImageData( this._center.x - this._radius, this._center.y - this._radius, this._radius * 2, this._radius * 2);

            var
                i, angle, w,
                x, y,
                r, g, b;

            for (i=0; i < 256 * 6; i += 1) {
                angle = i * 2 * Math.PI / 1536;
                if (i < 256) {
                    r = 255;
                    g = 0;
                    b = 255 - i;
                } else if (i < 256 * 2 ) {
                    r = 255;
                    g = i - 255;
                    b = 0;
                } else if ( i < 256 * 3 ) {
                    r = 255 - ( i - 256 * 2 );
                    g = 255;
                    b = 0;
                } else if ( i < 256 * 4 ) {
                    r = 0;
                    g = 255;
                    b = i - 256 * 3;
                } else if ( i < 256 * 5 ) {
                    r = 0;
                    g = 255 - ( i - 256 * 4 );
                    b = 255;
                } else if ( i < 256 * 6 ) {
                    r = i - 256 * 5;
                    g = 0;
                    b = 255;
                }

                for ( w=-1; w < this._width + 2; w +=1 ) {
                    x = Math.round(this._radius - 1 + Math.cos(angle) * (this._radius - this._width + w ));
                    if (x < 0) {
                        x = 0
                    };
                    if (x > this._radius * 2 - 1) {
                        x = this._radius * 2 - 1
                    };
                    y = Math.round(this._radius - 1 + Math.sin(angle) * (this._radius - this._width + w ));
                    if (y < 0) {
                        y = 0
                    };
                    if (y > this._radius * 2 - 1) {
                        y = this._radius * 2 - 1
                    };
                    this._imagedata.data[( ( y * this._radius * 2) + x ) * 4] = r;
                    this._imagedata.data[( ( y * this._radius * 2) + x ) * 4 + 1] = g;
                    this._imagedata.data[( ( y * this._radius * 2) + x ) * 4 + 2] = b;
                }
            }
            this._ctx.putImageData( this._imagedata, this._center.x - this._radius, this._center.y - this._radius  );
        }

    });

    Object.defineProperty( colorPicker, '_drawTriangle', {
        value: function() {
            var
                x, y, cLength,
                rx, ry, cx, cy, dist, angle,
                fColor = {}, lColor = {}, delta = {},
                r, g, b,
                points = this._colorSelectorTriangle.getAttr( 'points'),
                height = points[2] - points[0],
                sideLength = (points[5] - points[1]),
                color = hexToRgb( this._baseColor );

            this._trData = this._ctxTr.getImageData( this._center.x - this._radius, this._center.y - this._radius, this._radius * 2, this._radius * 2);

            cx = this._radius - 1;
            cy = cx;

            for (x = 0; x < height; x += .5 ) {

                fColor.r = 255 - Math.round(( 255 - color.r ) / ( height ) * ( height - x ));
                fColor.g = 255 - Math.round(( 255 - color.g ) / ( height ) * ( height - x ));
                fColor.b = 255 - Math.round(( 255 - color.b ) / ( height ) * ( height - x ));
                lColor.r = Math.round(( color.r ) / ( height ) * ( height - x ));
                lColor.g = Math.round(( color.g ) / ( height ) * ( height - x ));
                lColor.b = Math.round(( color.b ) / ( height ) * ( height - x ));

                cLength = sideLength * x / height;
                delta.r = ( fColor.r - lColor.r ) / cLength;
                delta.g = ( fColor.g - lColor.g ) / cLength;
                delta.b = ( fColor.b - lColor.b ) / cLength;

                for ( y = - cLength / 2 - 2; y < 0; y += 1 ) {

                    rx = this._radius - 1 + points[ 0 ] + height - x;
                    ry = this._radius - 1 + points[ 3 ] + y;

                    r = Math.round(fColor.r - delta.r * ( y + cLength / 2 ) );
                    g = Math.round(fColor.g - delta.g * ( y + cLength / 2 ) );
                    b = Math.round(fColor.b - delta.b * ( y + cLength / 2 ) );
                    if ( r > 255 ) { r = 255 };
                    if ( g > 255 ) { g = 255 };
                    if ( b > 255 ) { b = 255 };
                    dist = Math.pow( ( rx - cx ) * ( rx - cx ) + ( ry - cy ) * ( ry - cy ), 0.5 );
                    angle = Math.atan2( rx - cx, ry - cy ) - Math.PI / 2;
                    rx = cx + Math.cos( angle + this.selectorAngle ) * dist;
                    ry = cy + Math.sin( angle + this.selectorAngle ) * dist;


                    rx = Math.round( rx );
                    ry = Math.round( ry );

                    this._trData.data[( ( ry * this._radius * 2) + rx ) * 4] = r;
                    this._trData.data[( ( ry * this._radius * 2) + rx ) * 4 + 1] = g;
                    this._trData.data[( ( ry * this._radius * 2) + rx ) * 4 + 2] = b;
                }

                rx = this._radius - 1 + points[ 0 ] + height - x;
                ry = this._radius - 1 + points[ 3 ];

                r = Math.round(fColor.r - delta.r * ( cLength / 2 ) );
                g = Math.round(fColor.g - delta.g * ( cLength / 2 ) );
                b = Math.round(fColor.b - delta.b * ( cLength / 2 ) );

                dist = Math.pow( ( rx - cx ) * ( rx - cx ) + ( ry - cy ) * ( ry - cy ), 0.5 );
                angle = Math.atan2( rx - cx, ry - cy ) - Math.PI / 2;
                rx = cx + Math.cos( angle + this.selectorAngle ) * dist;
                ry = cy + Math.sin( angle + this.selectorAngle ) * dist;

                rx = Math.round( rx );
                ry = Math.round( ry );

                this._trData.data[( ( ry * this._radius * 2) + rx ) * 4] = r;
                this._trData.data[( ( ry * this._radius * 2) + rx ) * 4 + 1] = g;
                this._trData.data[( ( ry * this._radius * 2) + rx ) * 4 + 2] = b;

                for ( y = 1-y; y < cLength / 2 + 2; y += 1 ) {

                    rx = this._radius - 1 + points[ 0 ] + height - x;
                    ry = this._radius - 1 + points[ 3 ] + y;

                    r = Math.round(fColor.r - delta.r * ( y + cLength / 2 ) );
                    g = Math.round(fColor.g - delta.g * ( y + cLength / 2 ) );
                    b = Math.round(fColor.b - delta.b * ( y + cLength / 2 ) );
                    if ( r < 0 ) { r = 0 };
                    if ( g < 0 ) { g = 0 };
                    if ( b < 0 ) { b = 0 };

                    dist = Math.pow( ( rx - cx ) * ( rx - cx ) + ( ry - cy ) * ( ry - cy ), 0.5 );
                    angle = Math.atan2( rx - cx, ry - cy ) - Math.PI / 2;
                    rx = cx + Math.cos( angle + this.selectorAngle ) * dist;
                    ry = cy + Math.sin( angle + this.selectorAngle ) * dist;

                    rx = Math.round( rx );
                    ry = Math.round( ry );

                    this._trData.data[( ( ry * this._radius * 2) + rx ) * 4] = r;
                    this._trData.data[( ( ry * this._radius * 2) + rx ) * 4 + 1] = g;
                    this._trData.data[( ( ry * this._radius * 2) + rx ) * 4 + 2] = b;
                }

            }
            this._ctxTr.putImageData( this._trData, this._center.x - this._radius, this._center.y - this._radius  );
        }
    })

    return colorPicker;
}());




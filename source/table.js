/**
 * Created by 2NSoft on 29.07.15.
 */
var
    myTable = (function () {

        var
            tableID = 0,
            table = {};

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

        function numberCellCheck() {
            var
                $cell = $(this),
                val = parseFloat( $cell.val() );

            if ($cell.hasClass('numberCell')) {
                if ( ( val != $cell.val() ) && ( $cell.val() !== '' ) ) {
                    alert( $cell.val () + ' is not a number!' );
                }
            }
        };

        function colorBtnClick () {
            var
                $btn = $(this),
                color = table._colorPicker.color,
                reverse = rgbToHex( 255 - hexToRgb(color).r, 255 - hexToRgb(color).g, 255 - hexToRgb(color).b );

            console.log(table._colorPicker.color)
            $btn.parent().prev().html( color ).attr( 'style', 'background-color: ' + color + '; color: ' + reverse + ';' );

        };

        function newNumberCell( col, row ) {
            return $('<td/>').append( $('<input id="' + table.id + '?' + 'col=' + col + '&row=' + row + ' type="text" />').addClass('numberCell') );
        };

        function newRow( rowNumber ) {
            var
                i,
                result = $('<tr id="series' + rowNumber + '" />');
            result.append( $('<td/>').append( $('<input id="' + table.id + '?' + 'col=name' + '&row=' + rowNumber + ' type="text" placeholder="Series name" />').removeClass('numberCell').addClass('textCell') ) );
            for (i=0; i< table._colCount; i += 1) {
                result.append( newNumberCell( i, rowNumber ));
            }
            result.append( $('<td/>').addClass('colorCell').html( '#FFFFFF' ) );
            result.append( $('<td/>').append( $('<button id="series"' + table.id + 'ColorBtn">Set color</button>').addClass('colorBtn') ))
            return result;
        };

        Object.defineProperty( table, 'init', {
            value: function (containerID, chartTitle) {
                tableID += 1;
                this._id = 'Table' + tableID;

                this._table = $('<table id="' + this.id + '"/>');
                this._table.appendTo($('#' + containerID));

                this._head = $('<thead/>');
                this._table.append( this._head );
                this._head.append( $('<td/>').append( $('<span/>').addClass('titleSpan').html('Title') ) );
                this._head.append( $('<td/>').append( newNumberCell( 'tile', 'head').find('.numberCell').removeClass('numberCell').addClass('titleCell').attr( 'placeholder', chartTitle) ) );
                this._head.append( $('<td/>' ) );
                this._head.append( $('<td/>').append( $('<button class="addRowBtn">Add row</button>').on('click', function () { table.addRow() } ) ) );

                this._body = $('<tbody/>');
                this._foot = $('<tfoot/>');
                this._table.append( this._body );
                this._table.append( this._foot );

                this._colCount = 1;

                this._foot.append( $('<td/>').append( $('<span>').addClass('footerSpan').html('Axis values') ) );
                this._foot.append( newNumberCell( 0, 'axis' ) );
                this._foot.append( $('<td/>' ) );
                this._foot.append( $('<td/>').append( $('<button class="addColBtn">Add column</button>').on('click', function () { table.addCol() } ) ) );

                this._body.append( newRow( 1 ) );
                this._rowCount = 1;

                this._table.on( 'focusout', 'input', numberCellCheck );
                this._table.on( 'click', '.colorBtn', colorBtnClick );

                $('#' + containerID).append( $('<div id="colorPickerContainer"></div>' ) );

                this._colorPicker = colorPicker.init( 'colorPickerContainer');

                return this;
            }
        });

        Object.defineProperty( table, 'addCol', {
            value: function() {
                var
                    i;
                this._colCount += 1;

                for (i=1; i <= this.rowCount; i += 1) {
                    newNumberCell( this.colCount, i ).insertAfter( this._table.children().find('#series' + i).children().find('.numberCell').last().parent() );
                }
                newNumberCell( this.colCount, 'axis' ).insertAfter( this._foot.children().find('.numberCell').last().parent() );
                this._head.children().find('.titleCell').parent().attr( 'colspan', this.colCount );
            }
        });

        Object.defineProperty( table, 'addRow', {
            value: function () {
                this._rowCount += 1;
                this._body.append(newRow(this.rowCount));
                return this;
            }
        });

        Object.defineProperty( table, 'rowCount', {
            get: function () {
                return this._rowCount }
        });

        Object.defineProperty( table, 'colCount', {
            get: function () {
                return this._colCount }
        });

        Object.defineProperty( table, 'id', {
            get: function() {
                return this._id;
            }
        });


        return table;

    }());

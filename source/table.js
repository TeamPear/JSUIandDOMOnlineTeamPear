/**
 * Created by 2NSoft on 29.07.15.
 */
var
    myTable = (function () {

        var
            tableID = 0,
            table = {};

        function numberCellCheck ( event ) {
            var
                el = $(this),
                val = parseFloat( el.val() );

            if (el.hasClass('numberCell')) {
                if ( ( val != el.val() ) && ( el.val() !== '' ) ) {
                    alert( el.val () + ' is not a number!' );
                }
            }
        }
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
                this._head.append( $('<span/>').addClass('titleSpan').html('Title: ' + chartTitle) );
                this._head.append( $('<button class="addRowBtn">Add row</button>').on('click', function () { table.addRow() } ));

                this._body = $('<tbody/>');
                this._foot = $('<tfoot/>');
                this._table.append( this._body );
                this._table.append( this._foot );

                this._colCount = 1;

                this._foot.append( $('<span>').addClass('footerSpan').html('Axis values') );
                this._foot.append( newNumberCell( 0, 'axis' ) );
                this._head.append( $('<button class="addCowBtn">Add cow</button>').on('click', function () { table.addCow() } ));

                this._body.append( newRow( 1 ) );
                this._rowCount = 1;

                this._table.on( 'focusout', 'input', numberCellCheck );

                return this;
            }
        });

        Object.defineProperty( table, 'addCow', {
            value: function() {
                var
                    i;
                this._colCount += 1;

                for (i=1; i <= this.rowCount; i += 1) {
                    newNumberCell( this.colCount, i ).insertAfter( this._table.children().find('#series' + i).children().find('.numberCell').last().parent() );
                }
                newNumberCell( this.colCount, 'axis' ).insertAfter( this._foot.children().find('.numberCell').last().parent() );
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

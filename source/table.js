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

            $btn.parent().prev().children().first().attr( 'style', 'background-color: ' + color + '; color: ' + reverse + ';' );
            $btn.parent().prev().children().first().val( color );

        };

        function createChart() {
            var
                i, chart,
                options = {};

            options.width = table._table.parent().width();
            options.height = 400;
            options.series = [];

            for (i = 1; i<= table.rowCount; i += 1 ) {
                options.series.push( table.series(i) );
            }

            options.categories = table.axisValues();
            options.format = '%';
            options.labelPadding = 10;
            options.fontSize = 10;
            options.fontColor ='black';
            options.guidesColor = '#ccc';
            options.title = table.title;

            if (!chart) {
                table._table.parent().parent().append($('<div id="' + table.id + '_chartContainer">/').addClass('chartContainer'));
            }

            switch (table._selector.val()) {
                case 'bar':
                    chart = Chart.bar.init(table.id + '_chartContainer', options);
                    break;
                case 'column':
                    chart = Chart.column.init(table.id + '_chartContainer', options);
                    break;
                case 'line':
                    chart = Chart.line.init(table.id + '_chartContainer', options);
                    break;
                case 'pie':
                    chart = Chart.pie.init(table.id + '_chartContainer', options);
                    break;
            }
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
                result.append( newNumberCell( i + 1, rowNumber ));
            }
            result.append( $('<td/>').append( $('<input id="' + table.id + '?' + 'col=color' + '&row=' + rowNumber + ' type="text" readonly="readonly"/>').removeClass('numberCell').addClass('colorCell').val( '#FFFFFF') ) );
            result.append( $('<td/>').append( $('<button id="' + table.id + '_series' + rowNumber + '_ColorBtn">Set color</button>').addClass('colorBtn') ))
            return result;
        };

        Object.defineProperty( table, 'init', {
            value: function (containerID, chartTitle, loadInitial) {
                tableID += 1;
                this._id = 'Table' + tableID;

                this._table = $('<table id="' + this.id + '"/>');
                this._table.appendTo($('#' + containerID));

                this._head = $('<thead/>');
                this._table.append( this._head );
                this._head.append( $('<td/>').append( $('<span/>').addClass('titleSpan').html('Title') ) );
                this._head.append( $('<td/>').append( newNumberCell( 'title', 'head').find('.numberCell').removeClass('numberCell').addClass('titleCell').attr( 'placeholder', chartTitle) ) );
                this._head.append( $('<td/>') );
                this._head.append( $('<td/>').append( $('<button class="labelBtn" disabled="disabled">Row</button>') ) );
                this._head.children().last().append( $('<button class="addRowBtn">Add</button>').on('click', function () { table.addRow() } ) );
                this._head.children().last().append( $('<button class="removeRowBtn">Del</button>').on('click', function () { table.removeRow() } ) );

                this._body = $('<tbody/>');
                this._foot = $('<tfoot/>');
                this._table.append( this._body );
                this._table.append( this._foot );

                this._colCount = 1;

                this._foot.append( $('<td/>').append( $('<span>').addClass('footerSpan').html('Axis values') ) );
                this._foot.append( newNumberCell( 1, 'axis' ) );
                this._foot.append( $('<td/>' ) );
                this._foot.append( $('<td/>').append( $('<button class="labelBtn" disabled="disabled">Column</button>') ) );
                this._foot.children().last().append( $('<button class="addColBtn">Add</button>').on('click', function () { table.addCol() } ) );
                this._foot.children().last().append( $('<button class="removeColBtn">Del</button>').on('click', function () { table.removeCol() } ) );

                this._body.append( newRow( 1 ) );
                this._rowCount = 1;

                this._table.on( 'focusout', 'input', numberCellCheck );
                this._table.on( 'click', '.colorBtn', colorBtnClick );

                $('#' + containerID).append( $('<div id="' + this.id + '_ColorPicker"></div>').addClass( 'colorPickerContainer').addClass( 'clearfix' ) );
                this._colorPicker = colorPicker.init( this.id + '_ColorPicker');

                this._selector = $('<select id="' + this.id + '"_Selector"></select>').addClass( 'chartTypeSelector' );
                this._selector.append( $('<option value="bar">Bar</option>') );
                this._selector.append( $('<option value="column">Column</option>') );
                this._selector.append( $('<option value="line">Line</option>') );
                this._selector.append( $('<option value="pie">Pie</option>') );
                this._instrumentBar = $('<div id="' + this.id + '_InstrumentBar>"</div>').addClass( 'instrumentBar');
                this._instrumentBar.append( this._selector );
                this._instrumentBar.append( $('<button class="chartBtn">Create Chart</button>').on('click', createChart ) );

                $('#' + containerID).append( this._instrumentBar  );

                if (loadInitial) {
                    $.getJSON('./data/initial.json', function (data) {
                        var
                            i, len;
                        for (i=1; i<data.categories.length; i += 1 ) {
                            table.addCol();
                        }
                        table.axisValues( data.categories );
                        table.series(1, data.series[0]);
                        for (i=2, len = data.series.length; i < len; i += 1) {
                            table.addRow();
                            table.series( i, data.series[i-1] );
                        }
                        table.title = data.title;
                    });
                }
                return this;
            }
        });

        Object.defineProperty( table, 'title', {
            get: function () {
                return this._head.children().find('.titleCell').val();
            },
            set: function (newTitle) {
                this._head.children().find('.titleCell').val(newTitle);
            }
        } );

        Object.defineProperty( table, 'cell', {
            value: function ( col, row, value ) {
                var
                    addr = 'col=' + col + '&row=' + row;
                if (typeof value === 'undefined') {
                    return this._table.children().find('input[id*="' + addr + '"]').val();
                } else {
                    this._table.children().find('input[id*="' + addr + '"]').val(value);
                }

            }
        });

        Object.defineProperty( table, 'series', {
            value: function (row, values) {
                var
                    i,
                    result = {};

                if (typeof values === 'undefined') {
                    result.title = this.cell('name', row);
                    result.values = [];
                    for (i = 1; i <= this.colCount; i += 1) {
                        result.values.push(+this.cell(i, row));
                    }

                    result.color = this.cell('color', row);

                    return result;
                } else {
                    this.cell('name', row, values.title);

                    for (i = 1; i <= this.colCount; i += 1) {
                        this.cell( i, row, values.values[i-1] );
                    }

                    this.cell('color', row, values.color.toUpperCase());

                    var
                        $btn = $('#' + table.id + '_series' + row + '_ColorBtn'),
                        color = values.color,
                        reverse = rgbToHex( 255 - hexToRgb(color).r, 255 - hexToRgb(color).g, 255 - hexToRgb(color).b );

                   $btn.parent().prev().children().first().attr( 'style', 'background-color: ' + color + '; color: ' + reverse + ';' );
                }
            }
        });

        Object.defineProperty( table, 'axisValues', {
            value: function ( values ) {
                var
                    i,
                    result = [];

                if (typeof values === 'undefined') {
                    for (i = 1; i <= this.colCount; i += 1) {
                        result.push(+this.cell(i, 'axis'));
                    }

                    return result;
                } else {
                    for (i = 1; i <= this.colCount; i += 1) {
                        this.cell(i, 'axis', values[i-1]);
                    }
                }
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

        Object.defineProperty( table, 'removeCol', {
            value: function () {

                $( 'input[id*="col=' + this.colCount + '"]').parent().remove();

                this._colCount -= 1;
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

        Object.defineProperty( table, 'removeRow', {
            value: function () {
                if (this.rowCount > 1 ) {
                    $('#series' + this.rowCount).remove();
                    this._rowCount -= 1;
                    return this;
                }
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

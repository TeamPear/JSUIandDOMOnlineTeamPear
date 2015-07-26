window.Chart = (function(){
	var chart,
		barChart,
		columnChart,
		lineChart,
		scale,
		verticalScale,
		horizontalScale;
	
	chart = (function(){
		var chart = {},
			TITLE_HEIGHT = 30,
			TITLE_SIZE_RATIO = 1.5;


		Object.defineProperties(chart, {
			init: {
				value: function(elementId, options){
					var element = document.getElementById(elementId);
					this.outerWidth = options.width;
					this.outerHeight = options.height;
					this.options = options;
					this.series = options.series;
					this.categories = options.categories;
					this.labelPadding = options.labelPadding;
					this.fontSize = options.fontSize;
					this.fontColor = options.fontColor;
					this.guidesColor = options.guidesColor;
					this.title = options.title;
					this.topChartPadding = 30;


					if(element.childNodes.length > 0){
						element.innerHTML = '';
					}

					this.axisLayer = new Kinetic.Layer();
					this.stage = new Kinetic.Stage({
						container: elementId,
						width: options.width,
						height: options.height
					});

					if(this.title != null && this.title.length > 0){
						this.drawTitle();

					}
				}
			},
			findGreatestAbsoluteValueIn: {
				value: function(series){
					var maxAbsoluteValue = Number.MIN_VALUE;

					for(var i = 0, len = series.length; i < len; i++){
						for(var j = 0; j < series[i].values.length; j++){
							if(Math.abs(series[i].values[j]) > maxAbsoluteValue){
								maxAbsoluteValue = Math.abs(series[i].values[j]);
							}
						}
					}

					return maxAbsoluteValue;
				}
			},
			drawTitle: {
				value:function(){
					var titleWidth,
						title = new Kinetic.Text({
							x: 0,
							y: 0,
							text: this.title,
							fontSize:this.fontSize * TITLE_SIZE_RATIO,
							fill: this.fontColor
						});

					titleWidth = title.getWidth();
					title.setX((this.outerWidth - titleWidth) / 2);
					this.axisLayer.add(title);
					this.stage.add(this.axisLayer);
				}
			},
		});
		return chart;
	}());

	barChart = (function(parent){
		var barChart = Object.create(parent);

		Object.defineProperties(barChart, {
			init: {
				value: function(elementId, options){
					parent.init.call(this, elementId, options);

					this.scale = Object.create(horizontalScale).init(this);
					this.drawShapes();
					return this;
				}
			},
			drawShapes: {
				value: function(){
					var maxValue =  this.findGreatestAbsoluteValueIn(this.series),
						ratioToChartScale = maxValue / this.scale.valuesRange.absDifference,
						maxValueBarSize = ratioToChartScale * this.scale.innerWidth ,
						barMargin = (this.scale.categoryWidth * 0.3) / (this.series.length + 1),
						barWidth = (0.5 * this.scale.categoryWidth) / this.series.length;
						
						//draw bars
						for(var i = 0; i < this.series.length; i++){
							//For each serie adds  to the first bar position top margin and the size of the previous bars
							var barY = this.scale.topLeftY + i * barWidth + (i + 1) * barMargin ,
								color = this.series[i].color,
								layer = new Kinetic.Layer();
								
							for(var j = 0; j < this.series[i].values.length; j++){

								//The size of the current bar is it's ratio to to greatest value;
								//transformed into pixels by multiplying to the chart inner width 
								var ratioToMaxValue = this.series[i].values[j] / maxValue,
									currentBarSize =  ratioToMaxValue * maxValueBarSize;
									var bar = new Kinetic.Rect({
										x: this.scale.zeroValuePoint,
										y: barY,
										width: currentBarSize,
										height: barWidth,
										fill: color
									});

								barY += this.scale.categoryWidth;
								layer.add(bar);
							}
							this.stage.add(layer);
						}
					}
				}
		});
		return barChart;
	}(chart));

	columnChart = (function(parent){
		var columnChart = Object.create(parent);

		Object.defineProperties(columnChart, {
			init: {
				value: function(elementId, options){
					parent.init.call(this, elementId, options);

					this.scale = Object.create(verticalScale).init(this);
					this.drawShapes()
					return this;
				}
			},
			drawShapes: {
				value: function(){
					var maxValue =  this.findGreatestAbsoluteValueIn(this.series),
						ratioToChartScale = maxValue / this.scale.valuesRange.absDifference,
						maxValueBarSize = ratioToChartScale * this.scale.innerHeight ,
						barMargin = (this.scale.categoryWidth * 0.3) / (this.series.length + 1),
						barWidth = (0.5 * this.scale.categoryWidth) / this.series.length;
						
						//draw bars
						for(var i = 0; i < this.series.length; i++){

							//For each serie adds  to the first bar margin to the left and the size of the previous bars
							var barX = this.scale.maxYLabelWidth + (i * barWidth + (i + 1) * barMargin),
								color = this.series[i].color,
								layer = new Kinetic.Layer();
								
							for(var j = 0; j < this.series[i].values.length; j++){

								//The size of the current bar is it's ratio to to greatest value;
								//transformed into pixels by multiplying to the chart inner width
								var ratioToMaxValue = this.series[i].values[j] / maxValue,
									currentBarSize = -1 * ratioToMaxValue * maxValueBarSize;
									var bar = new Kinetic.Rect({
										x: barX,
										y: this.scale.zeroValuePoint,
										width: barWidth,
										height: currentBarSize,
										fill: color
									});

								barX += this.scale.categoryWidth;
								layer.add(bar);
							}
							this.stage.add(layer);
						}
					}
				}
		});
		return columnChart;
	}(chart));

	lineChart = (function(parent){
		var lineChart = Object.create(parent);

		Object.defineProperties(lineChart, {
			init: {
				value: function(elementId, options){
					parent.init.call(this, elementId, options);

					this.scale = Object.create(verticalScale).init(this);
					this.drawShapes()
					return this;
				}
			},
			drawShapes: {
				value: function(){
					var barMargin = (this.scale.categoryWidth * 0.5);
						
						//draw lines
						for(var i = 0; i < this.series.length; i++){
							var lineStartingX = barMargin,
								color = this.series[i].color,
								currentSeriePoints = [],
								layer = new Kinetic.Layer(),
								line;

							for(var j = 0; j < this.series[i].values.length; j++){
								var ratioToChartScale = Math.abs(this.scale.valuesRange.max - this.series[i].values[j]) / this.scale.valuesRange.absDifference,
									lineStartingY = this.scale.topLeftY + (ratioToChartScale * this.scale.innerHeight),
									circle;

								currentSeriePoints.push(lineStartingX);
								currentSeriePoints.push(lineStartingY);
								circle = new Kinetic.Circle({
									x: lineStartingX,
									y: lineStartingY,
									radius: 4,
									fill: this.series[i].color
								});
								layer.add(circle);
								lineStartingX += this.scale.categoryWidth;
							}

							line = new Kinetic.Line({
								points: currentSeriePoints,
								stroke: this.series[i].color,
								strokeWidth: 2,
								lineJoin: 'round'
							});
							layer.add(line);
							this.stage.add(layer);
						}
					}
				}
		});
		return lineChart;
	}(chart));

scale = (function(){
	var scale = {},
		NUMBER_OF_VALUES = 10,
		TITLE_HEIGHT = 30;

	function _findValuesRange(series){
		var values = [],
			step,
			maxValue = Number.MIN_VALUE,
			minValue = Number.MAX_VALUE;

		for(var i = 0; i < series.length; i++){
			var maxInCurrentSeries = Math.max.apply(null, series[i].values),
				minInCurrentSeries = Math.min.apply(null, series[i].values);
			
			if(maxInCurrentSeries > maxValue){
				maxValue = maxInCurrentSeries;
			}

			if(minInCurrentSeries < minValue){
				minValue = minInCurrentSeries;
			}
		}
		
		maxValue = Math.max(maxValue,0);
		minValue = Math.min(0, minValue);
		var absDifference = Math.abs(maxValue - minValue);
		step = Math.round(absDifference / NUMBER_OF_VALUES);

		//Recalculate range values rounding to the nearest values exceeding the data values
		minValue = Math.floor(minValue / step) * step;
		maxValue = Math.ceil(maxValue / step) * step;
		absDifference = Math.abs(maxValue - minValue);
		return {min: minValue, max: maxValue, step: step, absDifference: absDifference}
	}

	Object.defineProperties(scale, {
		init: {
			value: function(chart){
				this.outerWidth = chart.outerWidth;
				this.outerHeight = chart.outerHeight;
				this.valuesRange = _findValuesRange(chart.series);
				this.categories = chart.categories;
				this.axisLayer = chart.axisLayer;
				this.stage = chart.stage;
				this.fontSize = chart.fontSize;
				this.fontColor = chart.fontColor;
				this.labelPadding = chart.labelPadding;
				this.guidesColor = chart.guidesColor;
				this.topChartPadding = chart.topChartPadding;
				this.zeroValuePoint = 0;
				this.maxYLabelWidth = 0;
				this.maxXLabelHeight = 30;

				return this;
			}
		},		
		innerWidth:{
			get: function(){
				return this.outerWidth - this.maxYLabelWidth;
			}
		},
		innerHeight:{
			get: function(){
				return this.outerHeight - this.maxXLabelHeight - this.topChartPadding;
			}
		},
		bottomLeftY: {
			get: function(){
				return this.topChartPadding + this.innerHeight;
			}
		},
		topLeftY: {
			get: function(){
				return this.topChartPadding;
			}
		}
	});

	return scale;
}());

horizontalScale = (function(parent){
	var horizontalScale = Object.create(parent);

	Object.defineProperties(horizontalScale, {
		init: {
			value: function(scaleOptions){
				parent.init.call(this, scaleOptions);
				this.categoryWidth = this.innerHeight / this.categories.length;

				this.drawCategories();
				this.drawValues();
				this.drawAxis();
				return this;
			}
		},
		drawCategories: {
			value:function(){
				var categoryLabel,
					labelY = this.topLeftY + this.categoryWidth * 0.35,
					currentLabelWidth,
					categoryLabelText;

				for(var i = 0; i < this.categories.length; i++){
					categoryLabelText = this.categories[i];
					categoryLabel = new Kinetic.Text({
						x: 0,
						y: labelY,
						text: categoryLabelText,
						fontSize:this.fontSize,
						fill: this.fontColor
					});

					//Set Maximum Label Width; used the calculate the starting point of the shapes
					currentLabelWidth = categoryLabel.getWidth()
					if(currentLabelWidth + this.labelPadding > this.maxYLabelWidth){
						this.maxYLabelWidth = currentLabelWidth + this.labelPadding;
					}
					labelY += this.categoryWidth;
					this.axisLayer.add(categoryLabel);
					this.stage.add(this.axisLayer);
				}

				if(this.zeroValuePoint == 0){
					this.zeroValuePoint = this.maxYLabelWidth;
				}
			}
		},
		drawValues: {
			value: function(){
				var labelX = this.maxYLabelWidth,
					valueGuideLine;

				for(var value = this.valuesRange.min, i = 0; value <= this.valuesRange.max; value += this.valuesRange.step, i++){
					horizontalLabelText = value;
					horizontalLabel = new Kinetic.Text({
						x: labelX,
						y: this.topLeftY  + this.innerHeight + this.labelPadding ,
						text: value ,
						fontSize: this.fontSize,
						fill: this.fontColor
					});

					valueGuideLine = new Kinetic.Line({
						points: [labelX, this.topLeftY, labelX, this.bottomLeftY],
						stroke: this.guidesColor,
						strokeWidth: 1,
						dash: [1, 3]
					});

					if(value == 0){
						this.zeroValuePoint = labelX;
					}

					this.axisLayer.add(valueGuideLine);
					this.axisLayer.add(horizontalLabel);
					labelX += this.innerWidth / ((this.valuesRange.max - this.valuesRange.min) / this.valuesRange.step);

				}
				this.stage.add(this.axisLayer);
			}
		},
		drawAxis: {
			value: function(){
				var yAxis = new Kinetic.Line({
					points: [this.zeroValuePoint, this.topLeftY, this.zeroValuePoint,this.bottomLeftY],
					stroke: this.fontColor,
					strokeWidth: 1
				});
					
				var xAxis = new Kinetic.Line({
					points: [this.maxYLabelWidth, this.bottomLeftY, this.outerWidth, this.bottomLeftY],
					stroke: this.fontColor,
					strokeWidth: 1
				});
				
				this.axisLayer.add(yAxis);
				this.axisLayer.add(xAxis);
				this.stage.add(this.axisLayer);
				return this;
			}
		}
	});

	return horizontalScale;
}(scale));

verticalScale = (function(parent){
	var verticalScale = Object.create(parent);

	Object.defineProperties(verticalScale, {
		init: {
			value: function(scaleOptions){
				parent.init.call(this, scaleOptions);
				this.categoryWidth = this.innerWidth / this.categories.length;

				this.drawValues();
				this.drawCategories();
				this.drawAxis();
				return this;
			}
		},
		drawCategories: {
			value:function(yCoordinate){
				var categoryLabel,
					labelX = this.categoryWidth * 0.35,
					currentLabelWidth,
					categoryLabelText;

				for(var i = 0; i < this.categories.length; i++){
					categoryLabelText = this.categories[i];
					categoryLabel = new Kinetic.Text({
						x: labelX,
						y: this.bottomLeftY + this.labelPadding ,
						text: categoryLabelText,
						fontSize:this.fontSize,
						fill: this.fontColor
					});

					labelX += this.categoryWidth;
					this.axisLayer.add(categoryLabel);
					this.stage.add(this.axisLayer);
				}

				if(this.zeroValuePoint == 0){
					this.zeroValuePoint = this.maxYLabelWidth;
				}
			}
		},
		drawValues: {
			value: function(){
				var labelY = this.topLeftY,
					valueGuideLine;

				for(var value = this.valuesRange.max; value >= this.valuesRange.min; value -= this.valuesRange.step){
					horizontalLabelText = value;
					horizontalLabel = new Kinetic.Text({
						x: 0,
						y: labelY,
						text: value,
						fontSize:this.fontSize,
						fill: this.fontColor
					});

					valueGuideLine = new Kinetic.Line({
						points: [0, labelY, this.outerWidth, labelY],
						stroke: this.guidesColor,
						strokeWidth: 1,
						dash: [1, 3]
					});

					if(value == 0){
						this.zeroValuePoint = labelY;
					}

					//Set Maximum Label Width; used the calculate the starting point of the shapes
					currentLabelWidth = horizontalLabel.getWidth()
					if(currentLabelWidth + this.labelPadding > this.maxYLabelWidth){
						this.maxYLabelWidth = currentLabelWidth + this.labelPadding;
					}

					this.axisLayer.add(valueGuideLine);
					this.axisLayer.add(horizontalLabel);
					labelY += this.innerHeight / (this.valuesRange.absDifference / this.valuesRange.step);

				}
				this.stage.add(this.axisLayer);
			}
		},
		drawAxis: {
			value: function(){
				var xAxis = new Kinetic.Line({
					points: [this.maxYLabelWidth, this.zeroValuePoint, this.outerWidth, this.zeroValuePoint],
					stroke: this.fontColor,
					strokeWidth: 1
				});
					
				var yAxis = new Kinetic.Line({
					points: [this.maxYLabelWidth, this.topLeftY, this.maxYLabelWidth, this.bottomLeftY],
					stroke: this.fontColor,
					strokeWidth: 1
				});
				
				this.axisLayer.add(yAxis);
				this.axisLayer.add(xAxis);
				this.stage.add(this.axisLayer);
				return this;
			}
		}
	});

	return verticalScale;
}(scale));
	


return {
	bar: Object.create(barChart),
	column: Object.create(columnChart),
	line: Object.create(lineChart),
}
}());

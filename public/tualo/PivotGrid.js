Ext.define('Ext.tualo.PivotGrid', {
	extend: 'Ext.panel.Panel',
	layout: 'border',
	
	fieldText: 'Fields',
	columnsText: 'Columns',
	rowsText: 'Rows',
	valuesText: 'Values',
	waitText: 'Please wait ...',
	
	showAxisConfiguration: true,
	
	requires: [
		'Ext.grid.Panel',
		'Ext.tualo.PivotGridAxis'
	],
	getStore: function(){
		return this._store;
	},
	constructor: function(config) {
		this._store = config.store; // for storing the original data, from the default grid configuration
		this._columns = config.columns; // all columns, from the default grid configuration
		
		this.availableData = [];
		this.leftAxisData = [];
		this.topAxisData = [];
		this.valuesData = [];
		
		
		// at the first all columns are available
		for(var i in config.columns){
			this.availableData.push(config.columns[i]);
		}
		// if the leftAxis are predefined
		if (typeof config.leftAxis!=='undefined'){
		
			for(var j in config.leftAxis){
				
				var item  = config.leftAxis[j];
				
				// removing the column from the available
				for(var i in this.availableData){
					if (this.availableData[i].dataIndex===config.leftAxis[j].dataIndex){
						item.text = this.availableData[i].text; // get the text from the column definition
						this.availableData.splice( i, 1 );
						break;
					}
				}
				this.leftAxisData.push(item);
			}
			delete config.leftAxis;
		}
		// if the topAxis are predefined
		if (typeof config.topAxis!=='undefined'){
		
			for(var j in config.topAxis){
				
				var item  = config.topAxis[j];
				
				// removing the column from the available
				for(var i in this.availableData){
					if (this.availableData[i].dataIndex===item.dataIndex){
						item.text = this.availableData[i].text; // get the text from the column definition
						this.availableData.splice( i, 1 );
						this.topAxisData.push(item);
						break;
					}
				}
			}
			delete config.topAxis;
		}
		
		// if the values are predefined
		if (typeof config.values!=='undefined'){
		
			for(var j in config.values){
				
				var item  = config.values[j];
				
				// removing the column from the available
				for(var i in this.availableData){
					if (this.availableData[i].dataIndex===config.values[j].dataIndex){
						item.text = this.availableData[i].text; // get the text from the column definition
						this.availableData.splice( i, 1 );
						break;
					}
				}
				this.valuesData.push(item);
			}
			delete config.values;
		}
		
		this.callParent([config]);
	},
	initComponent: function(){
		
		this.xid = Ext.id();
		this.fields = Ext.define(this.xid+'-Fields', {
			extend: 'Ext.data.Model',
			fields: []
		});
		
		this.store = Ext.create('Ext.data.Store',{
			model: this.xid+'-Fields',
			data: []
		});
		
		// create the grid with an dummy Store
		this.grid = Ext.create('Ext.grid.Panel',{
			region: 'center',
			store: this.store,
			columns: []
		});
		
		
		
		
		Ext.define(this.xid+'-Columns', {
			extend: 'Ext.data.Model',
			fields: [
				{name: 'text', type: 'string'},
				{name: 'dataIndex', type: 'string'}
			 ]
		});
		
		this.available = Ext.create('Ext.data.Store',{
			model: this.xid+'-Columns',
			data: this.availableData
		});
		
		this.topAxis = Ext.create('Ext.data.Store',{
			model: this.xid+'-Columns',
			data: this.topAxisData
		});
		
		this.leftAxis = Ext.create('Ext.data.Store',{
			model: this.xid+'-Columns',
			data: this.leftAxisData
		});
		
		this.values = Ext.create('Ext.data.Store',{
			model: this.xid+'-Columns',
			data: this.valuesData
		});
		
		
		
		this.config = Ext.create('Ext.panel.Panel',{
			region: (typeof this.axisConfigPosition==='undefined')?'east':this.axisConfigPosition,
			layout: {
				type: 'vbox',
				align: 'stretch'
			},
			border: false,
			hidden: !this.showAxisConfiguration,
			width: (typeof this.axisConfigSize==='undefined')?400:this.axisConfigSize,
			split: true,
			items: [
				Ext.create('Ext.panel.Panel',{
					flex: 1,
					border: false,
					layout:{
						type: 'hbox',
						align: 'stretch'
					},
					items:[
						this.availableGrid = Ext.create('Ext.tualo.PivotGridAxis',{ 
							xid: this.xid,
							store: this.available,
							text: this.fieldText,
							listeners: {
								scope: this,
								changed: this.onAxisChanged
							}
						}),
						this.topAxisGrid = Ext.create('Ext.tualo.PivotGridAxis',{ 
							xid: this.xid,
							store: this.topAxis,
							text: this.columnsText,
							listeners: {
								scope: this,
								changed: this.onAxisChanged
							}
						})
					]
				}),
				
				Ext.create('Ext.panel.Panel',{
					flex: 1,
					border: false,
					layout:{
						type: 'hbox',
						align: 'stretch'
					},
					items:[
						
						this.leftAxisGrid = Ext.create('Ext.tualo.PivotGridAxis',{ 
							xid: this.xid,
							store: this.leftAxis,
							text: this.rowsText,
							listeners: {
								scope: this,
								changed: this.onAxisChanged
							}
						}),
						this.valuesGrid = Ext.create('Ext.tualo.PivotGridAxis',{ 
							xid: this.xid,
							store: this.values,
							text: this.valuesText,
							listeners: {
								scope: this,
								changed: this.onAxisChanged
							}
						})
					]
				})
			]
		});
		
		
		this.items = [
			this.grid,
			this.config
		];
		
		this._store.on('load',this.onStoreLoad,this);
		this.callParent(arguments);
		
	},
	onStoreLoad: function(){
		this.onAxisChanged();
	},
	
	
	onAxisChanged: function(force,myMask){
		this.configureColumns();
		this.configureRows();
	},
	
	configureColumns: function(force,myMask){
		if ((typeof force!=='undefined')&&(force===true)){
			var columns =  Ext.JSON.decode(Ext.JSON.encode(this.getColumns()).replace(/"dataIndex"/g,'"_dataIndex"').replace(/"value"/g,'"dataIndex"')) ;
			
			this.reconfigureColumns(columns);
			if (typeof myMask!=='undefined'){myMask.hide();}
		}else{
			myMask = new Ext.LoadMask(this.grid, {msg: this.waitText});
			myMask.show();
			Ext.defer(this.configureColumns,10,this,[true,myMask]); // force Loading, delayed (the UI does not hang)
		}
	},
	
	configureRows: function(force,myMask){
		if ((typeof force!=='undefined')&&(force===true)){
			var rows = this.getRows();// Ext.JSON.decode(Ext.JSON.encode().replace(/"dataIndex"/g,'"_dataIndex"').replace(/"value"/g,'"dataIndex"')) ;
			
			var cnf = this._baseFields; // tricky from getColumns
			var fields = [];
			
			var leftAxisRange = (this.leftAxis.getRange());
			for (var lIndex in leftAxisRange){
				var val = leftAxisRange[lIndex].get('text');
				var dIndex = leftAxisRange[lIndex].get('dataIndex');
				fields.push({
					name: dIndex,
					type: 'string'
				});
			}
			
			for(var i=0;i<cnf.length;i++){
				if (typeof cnf[i].fromLeftAxis==='undefined'){
					fields.push({
						name: cnf[i].text,
						type: 'number' // must be the type or the Value-Field!
					});
				}
			}
			
			var model = Ext.id();
			Ext.define(model, {
				extend: 'Ext.data.Model',
				fields: fields
			});
			
			var storeData=this.getRowList(rows);
			var store = Ext.create('Ext.data.Store',{
				model: model,
				data: storeData
			});
			this.reconfigureStore(store);
			if (typeof myMask!=='undefined'){myMask.hide();}
			
			this.getMatrixIndex(storeData);
			
		}else{
			myMask = new Ext.LoadMask(this.grid, {msg: this.waitText});
			myMask.show();
			Ext.defer(this.configureRows,10,this,[true,myMask]); // force Loading, delayed (the UI does not hang)
		}
	},
	// create the index, by left and top axis
	getMatrixIndex: function(rows){
		if (typeof rows==='undefined') {rows = this.getRowList(this.getRows(0,[]));}
		var fields={};
		var columns = this.getColumnList(this.getColumns(0,[],false));
		for(var rowIndex in rows){
			var item = rows[rowIndex];
			for(var colIndex in columns){
				var filterObj = Ext.Object.merge(item,columns[colIndex]);
				var id = Ext.JSON.encode(filterObj);
				fields[id]={
					col: colIndex,
					row: rowIndex
				};
			}
		} 
		return fields;
	},
	getRowList: function(rows){
		var elements = [];
		for(var i in rows){
			var row = rows[i];
			if (row.rows){
				var subrows = this.getRowList(row.rows);
				for(var s in subrows){
					var subrow = subrows[s];
					var element = {};
					element[row.dataIndex]=row.text;
					elements.push(Ext.Object.merge(element,subrow));
				}
			}else{
				var element = {};
				element[row.dataIndex]=row.text;
				elements.push(element);
			}
		}
		return elements;
	},
	getColumnList: function(columns){
		var elements = [];
		for(var i in columns){
			var col = columns[i];
			if (col.columns){
				var subrows = this.getColumnList(col.columns);
				for(var s in subrows){
					var subrow = subrows[s];
					var element = {};
					element[col.dataIndex]=col.text;
					elements.push(Ext.Object.merge(element,subrow));
				}
			}else{
				var element = {};
				element[col.dataIndex]=col.text;
				elements.push(element);
			}
		}
		return elements;
	},
	getRows: function(index,filter){
		if (typeof index==='undefined') {index=0;}
		if (typeof filter==='undefined') {filter=[];}
		var rows = [];
		var axisRange = (this.leftAxis.getRange());
		if (axisRange.length>index){
			rows = rows.concat(this.getDistinct(axisRange[index].get('dataIndex'),filter));
			for(var i in rows){
				var subRows = this.getRows(index+1,filter.concat(rows[i]));
				if (subRows.length>0){
					rows[i].rows = subRows;
				}else{
					
				}
			}
		}
		return rows;
	},
	getColumns: function(index,filter,leftaxis){
		if (typeof leftaxis==='undefined') {leftaxis=true;}
		if (typeof index==='undefined') {index=0;}
		if (typeof filter==='undefined') {filter=[];}
		
		var columns = [];
		if (index==0){
			if (leftaxis===true){
				// adding left Axis first
				var leftAxisRange = (this.leftAxis.getRange());
				for (var lIndex in leftAxisRange){
					var val = leftAxisRange[lIndex].get('text');
					var dIndex = leftAxisRange[lIndex].get('dataIndex');
					columns.push({
						text: val,
						value: val,
						dataIndex: dIndex,
						fromLeftAxis: true // helper for calculations
					})
				}
			}
		}
		var axisRange = (this.topAxis.getRange());
		if (axisRange.length>index){
			columns = columns.concat(this.getDistinct(axisRange[index].get('dataIndex'),filter));
			for(var i in columns){
				var subColumns = this.getColumns(index+1,filter.concat(columns[i]),leftaxis);
				if (subColumns.length>0){
					columns[i].columns = subColumns;
				}else{
					
				}
			}
		}
		if (axisRange.length==index+1){
			this._baseFields = columns; // little helper, thats the field config
		}
		return columns;
	},
	// return an array of distinct values , that matches the filters
	getDistinct: function(dataIndex,filter){
		var range = this._store.getRange();
		if (typeof filter==='undefined') {filter=[];}
		var distinct = {};
		for(var i =0; i<range.length;i++){
			var add=true;
			for(var h in filter){
				if (range[i].get(filter[h].dataIndex)!==filter[h].value){
					add=false;
				}
			}
			if (add){
				distinct[range[i].get(dataIndex)]=true;
			}
		}
		var result = [];
		for(var i in distinct){
			var p = {
				text: i,
				dataIndex: dataIndex, // store the orig.
				value: i // helper for the filter
			}
			result.push(p);
		}
		return result.sort(function(a,b){return (a.text<b.text)?-1:((a.text==b.text)?0:1)});
	},
	
	reconfigureColumns: function (columns) {
		var me = this.grid;
		if (columns) {
			me.headerCt.removeAll();
			me.headerCt.add(columns);
		}
		me.getView().refresh();
	},
	reconfigureStore: function (store) {
		var me = this.grid;
		if (store) {
			store = Ext.StoreManager.lookup(store);
         me.bindStore(store);
		}
		me.getView().refresh();
	}
});
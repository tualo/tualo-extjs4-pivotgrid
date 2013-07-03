/*
Copyright (c) 2013 tualo solutions GmbH

Contact:  http://www.tualo.de/

GNU General Public License Usage
This file may be used under the terms of the GNU General Public License version 3.0 as
published by the Free Software Foundation and appearing in the file LICENSE included in the
packaging of this file.

Please review the following information to ensure the GNU General Public License version 3.0
requirements will be met: http://www.gnu.org/copyleft/gpl.html.

If you are unsure which license is appropriate for your use, please contact the sales department
at http://www.tualo.de/.

Build date: 2013-06-05
*/
/**
 * @class Ext.tualo.PivotGrid
 * @extends Ext.Panel
 * <p>This class represents represent data in a tabular format of rows and columns. The data can be grouped in columns and rows.
 * The PivotGrid is composed of the following:</p>
 * <div class="mdetail-params"><ul>
 * <li><b>{@link Ext.data.Store Store}</b> : The Model holding the data records (rows)
 * <div class="sub-desc"></div></li>
 * <li><b>{@link Ext.grid.ColumnModel Column model}</b> : Column makeup
 * <div class="sub-desc"></div></li>
 * <li><b>{@link Ext.grid.Panel Grid}</b> : Encapsulates the user interface
 * <div class="sub-desc"></div></li>
 * <li><b>{@link Ext.tualo.PivotGridAxis Axis}</b> : Axis grids
 * <div class="sub-desc"></div></li>
 * </ul></div>
 * <p>Example usage:</p>
 * <pre><code>
var grid = new Ext.tualo.PivotGrid({
		{@link #store}: new {@link Ext.data.Store}({
			{@link Ext.data.Store#autoDestroy autoDestroy}: true,
			{@link Ext.data.Store#reader reader}: reader,
			{@link Ext.data.Store#data data}: []
		}),
		{@link #columns}: [
			{header: 'company', width: 200, sortable: true, dataIndex: 'company'},
			{header: 'bookingdate', renderer: Ext.util.Format.date('Y-m'), dataIndex: 'bookingdate'},
			{header: 'category', dataIndex: 'category'},
			{header: 'city', dataIndex: 'city'},
			{header: 'amount', dataIndex: 'amount'}
		],
		topAxis: [
			{dataIndex: 'bookingdate'},
			{dataIndex: 'category'}
		],
		leftAxis: [
			{dataIndex: 'city'}
		],
		values: [
			{dataIndex: 'amount'}
		],
		width: 600,
		height: 300,
		frame: true,
		title: 'Pivot Grid',
		iconCls: 'icon-grid'
});
 * </code></pre>
 * @constructor
 * @param {Object} config The config object
 * @xtype pivotgrid
 */
Ext.define('Ext.tualo.PivotGrid', {
	extend: 'Ext.panel.Panel',
	/**
	* @cfg {String} fieldText Title for the field configuration-gird.
	*/
	fieldText: 'Fields',
	/**
	* @cfg {String} columnsText Title for the column configuration-gird.
	*/
	columnsText: 'Columns',
	/**
	* @cfg {String} rowsText Title for the row configuration-gird.
	*/
	rowsText: 'Rows',
	/**
	* @cfg {String} valuesText Title for the values configuration-gird.
	*/
	valuesText: 'Values',
	/**
	* @cfg {String} waitText The text show in the loading mask.
	*/
	waitText: 'Please wait ...',
	/**
	* @cfg {Number} sequencePageSize The chunk size for calculating sequencly the pivot data.
	*/
	sequencePageSize: 1000,
	/**
	* @cfg {Boolean} showAxisConfiguration True if the axis configuration should be shown.
	*/
	showAxisConfiguration: true,
	/**
	* @cfg {String} axisConfigPosition show the axis configuration on the left 'west' or right 'east' (default) side.
	*/
	
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
		config.layout = 'border';
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
				{name: 'dataIndex', type: 'string'},
				{name: 'pivotFunction', type: 'string'}
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
								beforedrop: function(node){
									var r = this.values.getRange();
									if (r.length>0){
										return false; // cancle if ther are more than one aggregation columns
									}
									return true;
								},
								changed: function(){
									this.onAxisChanged();
								}
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
		// to do load more pages if more data are available
		this.onAxisChanged();
	},
	
	
	onAxisChanged: function(force,myMask){
		// called if columns were dropped on the axis grids
		var t = this.topAxis.getRange();
		var l = this.leftAxis.getRange();
		var v = this.values.getRange();
		if (t.length>0){
			if (l.length>0){
				if (v.length>0){
					this.configureColumns();
					this.configureRows();
				}else{
					if (typeof myMask!=='undefined'){try{myMask.hide();}catch(e){}}
				}
			}else{
				if (typeof myMask!=='undefined'){try{myMask.hide();}catch(e){}}
			}
		}else{
			if (typeof myMask!=='undefined'){try{myMask.hide();}catch(e){}}
		}
	},
	
	prepareColumnConfiguration: function(columns,valuesList){
		if (typeof valuesList==='undefined'){valuesList=this.values.getRange();}

		for(var i in columns){
			if (typeof columns[i].columns==='undefined'){
				for(var v in valuesList){
					if (typeof columns[i].fromLeftAxis==='undefined'){
						var columnDefinition = this.getColumnDefinition(valuesList[v].get('dataIndex'));
						if (typeof columnDefinition.renderer!=='undefined'){ columns[i].renderer=columnDefinition.renderer;}
						if (typeof columnDefinition.align!=='undefined'){ columns[i].align=columnDefinition.align;}
					}
				}
			}else{
				delete columns[i].dataIndex; // older than ExtJS 4.2 don't allow the dataIndex in the header group
				columns[i].columns = this.prepareColumnConfiguration(columns[i].columns,valuesList);
			}
		}
		return columns
	},
	
	configureColumns: function(force,myMask){
		if ((typeof force!=='undefined')&&(force===true)){
			this._baseFields=[];
			this.initDataIndexHash();
			var columns =  Ext.JSON.decode(Ext.JSON.encode(this.getColumns()).replace(/"dataIndex"/g,'"_dataIndex"').replace(/"value"/g,'"dataIndex"')) ;
			columns = this.prepareColumnConfiguration(columns);
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
			
			
			
			var storeData=this.getRowList(rows);
			this.getMatrixIndex(storeData);
			storeData = this.populate(storeData,myMask,0);

			
			
			
		}else{
			myMask = new Ext.LoadMask(this.grid, {msg: this.waitText});
			myMask.show();
			Ext.defer(this.configureRows,10,this,[true,myMask]); // force Loading, delayed (the UI does not hang)
		}
	},
	onPopulate: function(data,myMask){
		
		var cnf = this._baseFields; // tricky from getColumns
		var fields = [];
		
		var leftAxisRange = (this.leftAxis.getRange());
		for (var lIndex in leftAxisRange){
			var val = leftAxisRange[lIndex].get('text');
			var dIndex = leftAxisRange[lIndex].get('dataIndex');
			
			fields.push({
				name: this.getDataIndex(dIndex),
				type: 'string'
			});
		}
		
		for(var i=0;i<cnf.length;i++){
			if (typeof cnf[i].fromLeftAxis==='undefined'){
				fields.push({
					name: cnf[i].value,
					type: 'number' // must be the type or the Value-Field!
				});
			}
		}
		
		
		var model = Ext.id();
		/*
			console.log("Fields");
			console.log(fields);
			*/
		Ext.define(model, {
			extend: 'Ext.data.Model',
			fields: fields
		});
		
		this._data = data;
		var store = Ext.create('Ext.data.Store',{
			model: model,
			data: data
		});
		this.reconfigureStore(store);
		
		if (typeof myMask!=='undefined'){myMask.hide();}
			
	},
	populate: function(data,myMask,rangeIndex){
		var store = this._store;
		var range = store.getRange();
		var left = this.leftAxis.getRange();
		var top = this.topAxis.getRange();
		var values = this.values.getRange();
		
		var columns = this.getColumnList(this.getColumns(0,[],false));
		var rows = this.getRowList(this.getRows(0,[]));
		var columnsHelper = [];
		if (columns.length==0){ this.onPopulate([],myMask);} // there is nothing to do
		//console.log(columns);
		/*
		console.log("Columns");
		console.log(columns);
		console.log("CHash");
		console.log(this.colHash);
		console.log("CMap");
		console.log(this.valueColumnMap);
		*/
		if (values.length>0){
			var valueIndex = values[0].get('dataIndex');
			var valueFunction = values[0].get('pivotFunction');
			if (typeof valueFunction==='undefined'){
				valueFunction='sum';
			}
			if (rangeIndex<range.length){
				var sequenceCounter = 0;
				for(var r=rangeIndex,m = range.length;(r<m)&&(sequenceCounter<this.sequencePageSize);r++){
					sequenceCounter++;
					var record = range[r];
					var ids = [];
					for(var i in columns[0]){
						ids.push(record.get(i));
					}
					var columnID = Ext.JSON.encode(ids);
					var columnDataIndex =  this.valueColumnMap[this.colHash[columnID]];//this._baseFields[columnID].value;
					
					var rowIds = [];
					for(var i in left){
						rowIds.push(record.get(left[i].get('dataIndex')));
					}
					var rowID = Ext.JSON.encode(rowIds);
					var rowNumber = this.rowHash[rowID];
					/*
					console.log(
						[
							record.get('Town'),
							record.get('Articlegroup'),
							record.get('Amount'),
							"RowNr.: "+rowNumber,
							"ColID: "+columnDataIndex
						].join("\t")
					);
					*/
					if (typeof data[rowNumber][columnDataIndex]==='undefined'){data[rowNumber][columnDataIndex]=0;}
					
					//console.log(valueFunction);
					switch(valueFunction){
						case 'sum':
							data[rowNumber][columnDataIndex]+=record.get(valueIndex)*1;
							break;
						case 'count':
							//console.log('count');
							data[rowNumber][columnDataIndex]+=1;
							break;
					}
					
					
					rangeIndex++;
				}
				
				Ext.defer(this.populate,10,this,[data,myMask,rangeIndex]); // force Loading, delayed (the UI does not hang)
			}else{
				this.onPopulate(data,myMask);
			}
		}
		
	},
	initDataIndexHash: function(){
		this.dataIndexHash = {};
		this.dataIndex = 0;
	},
	getDataIndex: function(name){
		//if (typeof prefix==='undefined'){prefix='';}
		if (name.substring(0,2)==='_C'){
			return name;
		}
		if (typeof this.dataIndexHash[name] !== 'undefined') {
			return this.dataIndexHash[name];
		}
		this.dataIndex++;
		this.dataIndexHash[name] = '_C'+this.dataIndex;
		return this.dataIndexHash[name];
	},
	// create the index, by left and top axis
	getMatrixIndex: function(rows){
		//console.log(this.dataIndexHash);
		this.rowHash = {};
		this.colHash = {};
		var result={};
		
		if (typeof rows==='undefined') {rows = this.getRowList(this.getRows(0,[]));}
		for(var rowIndex in rows){
			var item = rows[rowIndex];
			var ids = [];
			for(var i in item){
				ids.push(item[i]); // use value as identifier
			}
			this.rowHash[Ext.JSON.encode(ids)]=rowIndex;
		}
		
		var columns = this.getColumnList(this.getColumns(0,[],false));
		for(var colIndex in columns){
			var item = columns[colIndex];
			var ids = [];
			for(var i in item){
				ids.push(item[i]); // use value as identifier
			}
			this.colHash[Ext.JSON.encode(ids)]=colIndex;
			
		}
		result.rowHash = this.rowHash;
		result.colHash = this.colHash;
		return result;
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
					element[this.getDataIndex(row.dataIndex)]=row.text;
					elements.push(Ext.Object.merge(element,subrow));
				}
			}else{
				var element = {};
				element[this.getDataIndex(row.dataIndex)]=row.text;
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
				//for(var v in valuesList){
					var element = {};
					element[col.dataIndex]=col.text ;
					elements.push(element);
				//}
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
	getColumnDefinition: function(dataIndex){
		for(var i in this._columns){
			if (this._columns[i].dataIndex == dataIndex){
				return this._columns[i];
			}
		}
		return {};
	},
	getColumns: function(index,filter,leftaxis,prefix){
		if (typeof leftaxis==='undefined') {leftaxis=true;}
		if (typeof index==='undefined') {index=0;}
		if (typeof filter==='undefined') {filter=[];}
		if (typeof prefix==='undefined') {prefix='';}
		var columns = [];
		if (index==0){
			this.valueColumnMap=[];
			if (leftaxis===true){
				// adding left Axis first
				var leftAxisRange = (this.leftAxis.getRange());
				for (var lIndex in leftAxisRange){
					var val = leftAxisRange[lIndex].get('text');
					var dIndex = leftAxisRange[lIndex].get('dataIndex');
					columns.push({
						text: val,
						value: this.getDataIndex(dIndex),
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
				
				var subColumns = this.getColumns(index+1,filter.concat(columns[i]),leftaxis,columns[i].value);
				if (subColumns.length>0){
					columns[i].columns = subColumns;
				}else{
					
				}
				if (prefix!=''){prefix+='-';}
				var cn = this.getDataIndex(prefix+columns[i].value);
				columns[i].value=cn;
				if (axisRange.length==index+1){
					this.valueColumnMap.push(
						cn
					);
				}
			}
			
		}
		if (axisRange.length==index+1){
			this._baseFields = this._baseFields.concat(columns); // little helper, thats the field config
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
	},
	
	getData: function(){
	
		return this._data
	}
});
Ext.define('Ext.tualo.PivotGrid', {
	extend: 'Ext.panel.Panel',
	layout: 'border',
	requires: [
		'Ext.grid.Panel'
	],
	getStore: function(){
		return this._store;
	},
	constructor: function(config) {
		this._store = config.store; 
		this._columns = config.columns;
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
		
		this.availableColumnsStore = Ext.create('Ext.data.Store',{
			model: this.xid+'-Columns',
			data: this._columns
		});
		
		this.headerColumnsStore = Ext.create('Ext.data.Store',{
			model: this.xid+'-Columns',
			data: []
		});
		
		this.rowColumnsStore = Ext.create('Ext.data.Store',{
			model: this.xid+'-Columns',
			data: []
		});
		
		this.valueColumnsStore = Ext.create('Ext.data.Store',{
			model: this.xid+'-Columns',
			data: []
		});
		
		
		this.config = Ext.create('Ext.panel.Panel',{
			region: 'east',
			layout: {
				type: 'vbox',
				align: 'stretch'
			},
			border: false,
			width: 400,
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
						this.allColumns = Ext.create('Ext.grid.Panel',{ 
							store: this.availableColumnsStore,
							flex: 1,
							columns: [
								{ text: 'Felder', dataIndex: 'text', flex: 1 }
							],
							viewConfig: {
								plugins: {
									ptype: 'gridviewdragdrop',
									dragGroup: this.xid+'-Columns',
									dropGroup: this.xid+'-Columns'
								}, 
								listeners: {
									scope: this,
									drop: function(node, data, dropRec, dropPosition) {
										var dropOn = dropRec ? ' ' + dropPosition + ' ' + dropRec.get('name') : ' on empty view';
										this.recalc();
										//Ext.example.msg('Drag from right to left', 'Dropped ' + data.records[0].get('name') + dropOn);
									}
								}
							}
						}),
						this.headerColumns = Ext.create('Ext.grid.Panel',{ 
							store: this.headerColumnsStore,
							flex: 1,
							columns: [
								{ text: 'Spalten', dataIndex: 'text', flex: 1 }
							],
							viewConfig: {
								plugins: {
									ptype: 'gridviewdragdrop',
									dragGroup: this.xid+'-Columns',
									dropGroup: this.xid+'-Columns'
								},
								listeners: {
									scope: this,
									drop: function(node, data, dropRec, dropPosition) {
										var dropOn = dropRec ? ' ' + dropPosition + ' ' + dropRec.get('name') : ' on empty view';
										this.recalc();
										//Ext.example.msg('Drag from right to left', 'Dropped ' + data.records[0].get('name') + dropOn);
									}
								}
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
						this.rowColumns = Ext.create('Ext.grid.Panel',{ 
							store: this.rowColumnsStore,
							flex: 1,
							columns: [
								{ text: 'Zeilen', dataIndex: 'text', flex: 1 }
							],
							viewConfig: {
								plugins: {
									ptype: 'gridviewdragdrop',
									dragGroup: this.xid+'-Columns',
									dropGroup: this.xid+'-Columns'
								},
								listeners: {
									scope: this,
									drop: function(node, data, dropRec, dropPosition) {
										var dropOn = dropRec ? ' ' + dropPosition + ' ' + dropRec.get('name') : ' on empty view';
										this.recalc();
										//Ext.example.msg('Drag from right to left', 'Dropped ' + data.records[0].get('name') + dropOn);
									}
								}
							}
						}),
						this.valueColumns = Ext.create('Ext.grid.Panel',{ 
							store: this.valueColumnsStore,
							flex: 1,
							columns: [
								{ text: 'Werte', dataIndex: 'text', flex: 1 }
							],
							viewConfig: {
								plugins: {
									ptype: 'gridviewdragdrop',
									dragGroup: this.xid+'-Columns',
									dropGroup: this.xid+'-Columns'
								},
								listeners: {
									scope: this,
									drop: function(node, data, dropRec, dropPosition) {
										var dropOn = dropRec ? ' ' + dropPosition + ' ' + dropRec.get('name') : ' on empty view';
										this.recalc();
										//Ext.example.msg('Drag from right to left', 'Dropped ' + data.records[0].get('name') + dropOn);
									}
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
		this.callParent(arguments);
	},
	recalc: function(){
		var rows = this.rowColumns.getStore().getRange();
		var cols = this.headerColumns.getStore().getRange();
		var vals = this.valueColumns.getStore().getRange();
		
		var range = this._store.getRange();
		if ((cols.length>0)){
			var columns = this._getColumns(range,cols,[],0);
			var base = [];
			if ((rows.length>0)){
				base.push({
					text: rows[0].get('text'),
					dataIndex: '_ZB'
				});
			};
			console.log(columns);
			this.reconfigureColumns(base.concat(columns));
			
			if (
				(rows.length>0) &&
				(cols.length>0) &&
				(vals.length>0)
			){
				var mainCols = this._getDistinct(range,cols[cols.length-1].get('dataIndex'),[]);
				var mainRows = this._getDistinct(range,rows[rows.length-1].get('dataIndex'),[]);
				
				
				console.log(mainRows);
				var _data = [];
				for(var r in mainRows){
					var rV = mainRows[r].text;
					var rI = mainRows[r]._dataIndex;
					var o = {};
					o['_ZB']=(typeof rV!=='undefined')?rV:'SUM';
					
					for(var c in mainCols){
						var cV = mainCols[c].text;
						var cI = mainCols[c]._dataIndex;
						var filter = [];
						filter.push({
							dataIndex: cI,
							value: cV
						});
						if (typeof rV!=='undefined'){
							filter.push({
								dataIndex: rI,
								value: rV
							});
						}
						var s = 0;//this._getSum(range,vals[0].get('dataIndex'),filter);
						o[cV]=s;
					}
					_data.push(o);
				}
				console.log(_data);
				
				var model = Ext.id();
				var flds = [];
				flds.push({name:'_ZB',type:'string'});
				for(var c in mainCols){
					flds.push({name:mainCols[c].text,type:'number'});
				}
				Ext.define(model, {
					extend: 'Ext.data.Model',
					fields: flds
				});
				var store = Ext.create('Ext.data.Store',{
					model: model,
					data: _data
				});
				console.log(flds);
				
				this.reconfigureStore(store);
			}
		}
	},
	_getColumns: function(range,cols,filter,index){
		var res = [];
		var fld = cols[index].get('dataIndex');
		res = this._getDistinct(range,fld,filter);
		if (cols.length>(index+1)){
			for(var i in res){
				res[i].columns=this._getColumns(range,cols,filter.concat({
					dataIndex: fld,
					value:	res[i].text
				}),index+1);
				if (res[i].columns.length>0){
					delete res[i].dataIndex;
				}else{
					delete res[i].columns;
				}
			}
		}
		return res;
	},
	_getSum: function(range,dataIndex,having){
		var result = 0;
		for(var i =0; i<range.length;i++){
			var add=true;
			for(var h in having){
				if (range[i].get(having[h].dataIndex)!==having[h].value){
					add=false;
				}
			}
			if (add){
				result += range[i].get(dataIndex);
			}
		}
		return result;
	},
	_getDistinct: function(range,dataIndex,having){
		var distinct = {};
		
		for(var i =0; i<range.length;i++){
			var add=true;
			for(var h in having){
				if (range[i].get(having[h].dataIndex)!==having[h].value){
					add=false;
				}
			}
			if (add){
				distinct[range[i].get(dataIndex)]=true;
			}
		}
		var result = [];
		var vals = this.valueColumns.getStore().getRange();
		
		for(var i in distinct){
			var p = {
				text: i,
				dataIndex: i,
				_dataIndex: dataIndex
			};
			if (vals.length>0){
				var bc = this._getFromBaseColumns(vals[0].get('dataIndex'));
				if (typeof bc.renderer!=='undefined'){p.renderer=bc.renderer;}
				if (typeof bc.align!=='undefined'){p.align=bc.align;}
			}
			result.push(p);
			
		}
		return result.sort(); // return sorted values
	},
	
	_getFromBaseColumns: function(dataIndex){
		for(var i in this._columns){
			if (this._columns[i].dataIndex==dataIndex){
				return this._columns[i];
			}
		}
		return;
	},
	
	reconfigureColumns: function (columns) {
		//  debugger;
		var me = this.grid;
		if (columns) {
			me.headerCt.removeAll();
			me.headerCt.add(columns);
		}
		me.getView().refresh();
	},
	reconfigureStore: function (store) {
		//  debugger;
		var me = this.grid;
		if (store) {
			store = Ext.StoreManager.lookup(store);
         me.bindStore(store);
		}
		me.getView().refresh();
	}
});
Ext.define('Ext.tualo.PivotGrid', {
	extend: 'Ext.panel.Panel',
	layout: 'border',
	
	fieldText: 'Fields',
	columnsText: 'Columns',
	rowsText: 'Rows',
	valuesText: 'Values',
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
		console.log(this.availableData);
		
		
		
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
		this.callParent(arguments);
	},
	onAxisChanged: function(){
		console.log('onAxisChanged');
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
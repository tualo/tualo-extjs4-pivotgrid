// Sample Text
Ext.define('Ext.testing.components.Main', {
	extend: 'Ext.container.Viewport',
	requires: [
		'Ext.panel.Panel',
		'Ext.tualo.PivotGrid',
		'Ext.data.Store'
	],
	layout: 'fit',
	constructor: function (config) {
		this.callParent([ config ]);
	},
	initComponent: function () {
		var scope =this;
		
		var store = Ext.create('Ext.data.Store',{
			pageSize: 5000,
			proxy: {
				type: 'ajax',
				timeout: 600000,
				url: '/sampledata',
				reader: {
					type: 'json',
					root: 'data',
					totalProperty: 'total'
				}
			},
			fields: [
				{name:'Town'},
				{name:'Articlegroup'},
				{name:'CustomerName'},
				{name:'CustomerNo'},
				{name:'Article'},
				{name:'Date',type:'date'},
				{name:'UnitPrice',type:'number'},
				{name:'Quantity',type:'number'},
				{name:'Amount',type:'Amount'}
			]
		});
		
		
		this.items = [
			
			this.grid = Ext.create('Ext.tualo.PivotGrid',{
				title: 'SampleGrid',
				store: store,
				columns: [
					{text:'Date',dataIndex:'Date',type:'date'},
					{text:'Town',dataIndex:'Town'},
					{text:'Articlegroup',dataIndex:'Articlegroup'},
					{text:'CustomerName',dataIndex:'CustomerName'},
					{text:'CustomerNo',dataIndex:'CustomerNo.'},
					{text:'Article',dataIndex:'Article'},
					
					{text:'UnitPrice',dataIndex:'Unit Price',type:'number',align:'right',renderer: Ext.util.Format.numberRenderer('0,000.00/i') },
					{text:'Quantity',dataIndex:'Quantity',type:'number',align:'right',renderer: Ext.util.Format.numberRenderer('0,000.00/i') },
					{text:'Amount',dataIndex:'Amount',type:'number',align:'right',renderer: Ext.util.Format.numberRenderer('0,000.00/i') }
					
				],
				topAxis: [
					{dataIndex: 'Articlegroup'},
					{dataIndex: 'Article'}
				],
				leftAxis: [
					{dataIndex: 'Town'}
				],
				values: [
					{dataIndex: 'Amount'}
				]
			})
		];
		store.load();
		
		scope.callParent(arguments);

	}
});
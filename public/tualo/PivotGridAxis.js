Ext.define('Ext.tualo.PivotGridAxis', {
	extend: 'Ext.grid.Panel',
	flex: 1,
	constructor: function(config) {
		config.columns = [
			{ text: config.text, dataIndex: 'text', flex: 1 }
		];
		
		this.callParent([config]);
	},
	initComponent: function(){
		this.viewConfig = {
			plugins: {
				ptype: 'gridviewdragdrop',
				dragGroup: this.xid+'-Columns',
				dropGroup: this.xid+'-Columns'
			}, 
			listeners: {
				scope: this,
				drop: this.onDropped
			}
		}
		this.callParent(arguments);
	},
	onDropped: function(node, data, dropRec, dropPosition) {
		//var dropOn = dropRec ? ' ' + dropPosition + ' ' + dropRec.get('name') : ' on empty view';
		this.fireEvent('changed',[this]);
	}
});
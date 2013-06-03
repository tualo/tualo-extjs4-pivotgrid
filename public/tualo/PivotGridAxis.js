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
				beforedrop: this.onBeforeDrop,
				drop: this.onDropped
			}
		}
		this.callParent(arguments);
	},
	onBeforeDrop: function(node, data, overModel, dropPosition, dropHandlers, eOpts){
		return this.fireEvent('beforedrop',[node, data, overModel, dropPosition, dropHandlers, eOpts]);
	},
	onDropped: function(node, data, dropRec, dropPosition) {
		//var dropOn = dropRec ? ' ' + dropPosition + ' ' + dropRec.get('name') : ' on empty view';
		if (this.fireEvent('drop',[node, data, dropRec, dropPosition])){
			return this.fireEvent('changed',[this]);
		}else{
			return false;
		}
	}
});
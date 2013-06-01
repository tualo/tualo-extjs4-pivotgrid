Ext.Loader.setConfig({enabled: true});
Ext.Loader.setPath('Ext.testing.components', '/sample/components');
Ext.Loader.setPath('Ext.tualo', '/tualo');


Ext.application({
	name: 'tualo testing',
	require: ['Ext.tualo.ide.components.Main'],
	launch: function() {
		Ext.tip.QuickTipManager.init();
		Ext.create('Ext.testing.components.Main', {});
	}
});
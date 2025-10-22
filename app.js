
Ext.onReady(function() {

    // =================================================================
    // FORMULARIO 1: TRABAJADORES (Completo)
    // =================================================================

    Ext.define('Trabajador', {
        extend: 'Ext.data.Model',
        fields: [
            { name: 'tra_ide', type: 'int' },
            { name: 'tra_cod', type: 'int' },
            { name: 'tra_nom', type: 'string' },
            { name: 'tra_pat', type: 'string' },
            { name: 'tra_mat', type: 'string' }
        ],
        idProperty: 'tra_ide'
    });

    var trabajadorStore = Ext.create('Ext.data.Store', {
        model: 'Trabajador',
        autoLoad: true,
        proxy: {
            type: 'ajax',
            api: {
                read: 'trabajador.php?accion=leer',
                create: 'trabajador.php?accion=crear',
                update: 'trabajador.php?accion=actualizar',
                destroy: 'trabajador.php?accion=eliminar'
            },
            reader: { type: 'json', root: 'data', successProperty: 'success', totalProperty: 'total' },
            writer: { type: 'json', writeAllFields: true }
        }
    });

    var trabajadorForm = Ext.create('Ext.form.Panel', {
        bodyPadding: 10,
        items: [
            { xtype: 'hiddenfield', name: 'tra_ide' },
            { xtype: 'numberfield', name: 'tra_cod', fieldLabel: 'Codigo', allowBlank: false },
            { xtype: 'textfield', name: 'tra_nom', fieldLabel: 'Nombre', allowBlank: false },
            { xtype: 'textfield', name: 'tra_pat', fieldLabel: 'A. Paterno', allowBlank: false },
            { xtype: 'textfield', name: 'tra_mat', fieldLabel: 'A. Materno', allowBlank: false }
        ]
    });

    var trabajadorWindow = Ext.create('Ext.window.Window', {
        title: 'Datos del Trabajador',
        layout: 'fit',
        modal: true,
        closable: true,
        closeAction: 'hide',
        items: [trabajadorForm],
        buttons: [
            {
                text: 'Guardar',
                handler: function() {
                    var form = trabajadorForm.getForm();
                    if (!form.isValid()) return;
                    var record = form.getRecord();
                    if (record) {
                        form.updateRecord(record);
                    } else {
                        record = Ext.create('Trabajador');
                        form.updateRecord(record);
                        trabajadorStore.add(record);
                    }
                    trabajadorStore.sync({
                        success: function() { trabajadorStore.load(); }
                    });
                    trabajadorWindow.hide();
                }
            },
            { text: 'Cancelar', handler: function() { trabajadorWindow.hide(); } }
        ]
    });

    var trabajadorGrid = Ext.create('Ext.grid.Panel', {
        title: 'Trabajadores',
        store: trabajadorStore,
        columns: [
            { text: 'ID', dataIndex: 'tra_ide', width: 50 },
            { text: 'Codigo', dataIndex: 'tra_cod', width: 80 },
            { text: 'Nombre', dataIndex: 'tra_nom', flex: 1 },
            { text: 'A. Paterno', dataIndex: 'tra_pat', flex: 1 },
            { text: 'A. Materno', dataIndex: 'tra_mat', flex: 1 }
        ],
        dockedItems: [{
            xtype: 'toolbar',
            items: [
                {
                    text: 'Nuevo',
                    handler: function() {
                        trabajadorForm.getForm().reset();
                        trabajadorWindow.setTitle('Nuevo Trabajador');
                        trabajadorWindow.show();
                    }
                },
                {
                    text: 'Modificar',
                    handler: function() {
                        var sel = trabajadorGrid.getSelectionModel().getSelection();
                        if (sel.length > 0) {
                            trabajadorForm.getForm().loadRecord(sel[0]);
                            trabajadorWindow.setTitle('Modificar Trabajador');
                            trabajadorWindow.show();
                        } else {
                            Ext.Msg.alert('Aviso', 'Debe seleccionar un trabajador.');
                        }
                    }
                },
                {
                    text: 'Eliminar',
                    handler: function() {
                        var sel = trabajadorGrid.getSelectionModel().getSelection();
                        if (sel.length > 0) {
                            Ext.Msg.confirm('Confirmar', 'Seguro que desea eliminar?', function(btn) {
                                if (btn === 'yes') {
                                    trabajadorStore.remove(sel[0]);
                                    trabajadorStore.sync();
                                }
                            });
                        } else {
                            Ext.Msg.alert('Aviso', 'Debe seleccionar un trabajador.');
                        }
                    }
                },
                {
                    text: 'Eliminar Todo',
                    iconCls: 'ext-icon-delete', 
                    handler: function() {
                        Ext.Msg.confirm('Confirmar', '¿Esta SEGURO de que desea eliminar TODOS los trabajadores?', function(btn) {
                            if (btn === 'yes') {
                                
                                Ext.Ajax.request({
                                    url: 'trabajador.php?accion=eliminar_todo',
                                    method: 'POST',
                                    success: function(response) {
                                        var res = Ext.decode(response.responseText);
                                        if (res.success) {
                                            Ext.Msg.alert('Exito', 'Todos los trabajadores han sido eliminados.');
                                            trabajadorStore.load(); 
                                        } else {
                                            Ext.Msg.alert('Error', res.message || 'No se pudo completar la operación.');
                                        }
                                    },
                                    failure: function() {
                                        Ext.Msg.alert('Error', 'Error de conexion.');
                                    }
                                });
                            }
                        });
                    }
                }
            ]
        }],
        bbar: Ext.create('Ext.PagingToolbar', {
            store: trabajadorStore,
            displayInfo: true,
            displayMsg: 'Mostrando {0} - {1} de {2}',
            emptyMsg: "No hay trabajadores"
        })
    });


    // =================================================================
    // FORMULARIO 2: VENTAS 
    // =================================================================

    // 2.1. Modelos de Venta
    Ext.define('Venta', {
        extend: 'Ext.data.Model',
        fields: [
            { name: 'ven_ide', type: 'int' },
            { name: 'ven_ser', type: 'string' },
            { name: 'ven_num', type: 'string' },
            { name: 'ven_cli', type: 'string' },
            { name: 'ven_mon', type: 'float' }
        ],
        idProperty: 'ven_ide'
    });

    Ext.define('VentaDetalle', {
        extend: 'Ext.data.Model',
        fields: [
            { name: 'v_d_ide', type: 'int' },
            { name: 'ven_ide', type: 'int' },
            { name: 'v_d_pro', type: 'string' },
            { name: 'v_d_uni', type: 'float' },
            { name: 'v_d_can', type: 'float' },
            { name: 'v_d_tot', type: 'float' }
        ],
        idProperty: 'v_d_ide'
    });

    // 2.2. Stores de Venta
    var ventaStore = Ext.create('Ext.data.Store', {
        model: 'Venta',
        autoLoad: true,
        proxy: {
            type: 'ajax',
            api: {
                read: 'venta.php?accion=leer',
                create: 'venta.php?accion=crear',
                update: 'venta.php?accion=actualizar',
                destroy: 'venta.php?accion=eliminar'
            },
            reader: { type: 'json', root: 'data', successProperty: 'success', totalProperty: 'total' },
            writer: { type: 'json', writeAllFields: true }
        }
    });

    var ventaDetalleStore = Ext.create('Ext.data.Store', {
        model: 'VentaDetalle',
        autoLoad: false, 
        proxy: {
            type: 'ajax',
            url: 'venta_detalle.php?accion=leer',
            reader: { type: 'json', root: 'data', successProperty: 'success', totalProperty: 'total' }
        }
    });
    
    // Store LOCAL grid de detalles de la NUEVA VENTA
    var nuevaVentaDetalleStore = Ext.create('Ext.data.Store', {
        model: 'VentaDetalle'
    });

   
    var cellEditingPlugin = Ext.create('Ext.grid.plugin.CellEditing', {
        clicksToEdit: 1
    });

    //  "Nueva Venta" / "Modificar Venta"
    var nuevaVentaWindow = Ext.create('Ext.window.Window', {
        title: 'Crear Nueva Venta (Panel 2)',
        width: 700,
        height: 500,
        layout: 'border',
        modal: true,
        closable: true,
        closeAction: 'hide',
        currentVentaId: null, 
        items: [
            {
                xtype: 'form',
                region: 'north',
                height: 120,
                bodyPadding: 10,
                itemId: 'formCabecera',
                items: [
                    { xtype: 'textfield', name: 'ven_ser', fieldLabel: 'Serie', allowBlank: false },
                    { xtype: 'textfield', name: 'ven_num', fieldLabel: 'Nuumero', allowBlank: false },
                    { xtype: 'textfield', name: 'ven_cli', fieldLabel: 'Cliente', allowBlank: false, anchor: '100%' },
                    { xtype: 'hiddenfield', name: 'ven_mon', value: 0 },
                    { xtype: 'hiddenfield', name: 'ven_ide' } 
                ]
            },
            {
                xtype: 'grid',
                region: 'center',
                title: 'Productos del Detalle',
                store: nuevaVentaDetalleStore,
                plugins: [cellEditingPlugin],
                columns: [
                    { 
                        text: 'Producto', 
                        dataIndex: 'v_d_pro', 
                        flex: 1,
                        editor: { xtype: 'textfield', allowBlank: false }
                    },
                    { 
                        text: 'Precio Uni.', 
                        dataIndex: 'v_d_uni',
                        xtype: 'numbercolumn', format: '0.00',
                        editor: { xtype: 'numberfield', allowBlank: false, minValue: 0 }
                    },
                    { 
                        text: 'Cantidad', 
                        dataIndex: 'v_d_can',
                        xtype: 'numbercolumn', format: '0.00',
                        editor: { xtype: 'numberfield', allowBlank: false, minValue: 1 }
                    },
                    {
                        xtype: 'actioncolumn',
                        width: 30,
                        items: [{
                            icon: 'extjs/resources/themes/images/default/grid/delete.gif',
                            tooltip: 'Eliminar producto',
                            handler: function(grid, rowIndex) {
                                nuevaVentaDetalleStore.removeAt(rowIndex);
                            }
                        }]
                    }
                ],
                dockedItems: [{
                    xtype: 'toolbar',
                    items: [{
                        text: 'Agregar Producto',
                        handler: function() {
                            var newRecord = Ext.create('VentaDetalle', {
                                v_d_pro: 'Nuevo Producto',
                                v_d_uni: 0,
                                v_d_can: 1
                            });
                            nuevaVentaDetalleStore.add(newRecord);
                            cellEditingPlugin.startEdit(newRecord, 0); 
                        }
                    }]
                }]
            }
        ],
        buttons: [
            {
                text: 'Guardar Venta Completa',
                handler: function() {
                    var form = nuevaVentaWindow.down('#formCabecera').getForm();
                    if (!form.isValid()) {
                        Ext.Msg.alert('Error', 'Complete los datos de la cabecera (Serie, Numero, Cliente).');
                        return;
                    }
                    if (nuevaVentaDetalleStore.getCount() === 0) {
                        Ext.Msg.alert('Error', 'Debe Agregar al menos un producto al detalle.');
                        return;
                    }

                   
                    var ven_ide = nuevaVentaWindow.currentVentaId;
                    var esCrear = !ven_ide; 
                    
                    
                    var cabeceraData = form.getValues();
                    var urlCabecera = esCrear ? 'venta.php?accion=crear' : 'venta.php?accion=actualizar';
                    
                    Ext.Ajax.request({
                        url: urlCabecera,
                        method: 'POST',
                        jsonData: cabeceraData,
                        success: function(response) {
                            var res = Ext.decode(response.responseText);
                            if (!res.success) {
                                Ext.Msg.alert('Error (Paso 1)', res.message || 'No se pudo guardar la cabecera.');
                                return;
                            }
                            
                           
                            var idVentaParaDetalle = esCrear ? res.data.ven_ide : ven_ide;

                            
                            var detallesData = [];
                            nuevaVentaDetalleStore.each(function(record) {
                                detallesData.push(record.data); 
                            });

                            Ext.Ajax.request({
                                url: 'venta_detalle.php?accion=guardar_lote&ven_ide=' + idVentaParaDetalle,
                                method: 'POST',
                                jsonData: { data: detallesData },
                                success: function(response_det) {
                                    var res_det = Ext.decode(response_det.responseText);
                                    if (!res_det.success) {
                                        Ext.Msg.alert('Error (Paso 2)', res_det.message || 'La cabecera se guard, pero fallaron los detalles.');
                                        return;
                                    }

                                    
                                    Ext.Msg.alert('Exito', 'Venta guardada correctamente.');
                                    nuevaVentaWindow.hide();
                                    nuevaVentaDetalleStore.removeAll(); 
                                    form.reset();
                                    ventaStore.load(); 
                                    nuevaVentaWindow.currentVentaId = null; 
                                },
                                failure: function() {
                                    Ext.Msg.alert('Error (Paso 2)', 'Error de conexion al guardar detalles.');
                                }
                            });
                        },
                        failure: function() {
                            Ext.Msg.alert('Error (Paso 1)', 'Error de conexion al guardar cabecera.');
                        }
                    });
                }
            },
            {
                text: 'Cancelar',
                handler: function() {
                    nuevaVentaWindow.hide();
                    nuevaVentaDetalleStore.removeAll();
                    nuevaVentaWindow.down('#formCabecera').getForm().reset();
                    nuevaVentaWindow.currentVentaId = null; 
                }
            }
        ]
    });


    // 2.3. Grids de Venta (Maestro y Detalle)
    var ventaGrid = Ext.create('Ext.grid.Panel', {
        region: 'center',
        title: 'Listado de Ventas (Maestro)',
        store: ventaStore,
        columns: [
            { text: 'ID', dataIndex: 'ven_ide', width: 50 },
            { text: 'Serie', dataIndex: 'ven_ser', width: 60 },
            { text: 'Numero', dataIndex: 'ven_num', width: 100 },
            { text: 'Cliente', dataIndex: 'ven_cli', flex: 1 },
            { text: 'Monto', dataIndex: 'ven_mon', xtype: 'numbercolumn', format: '0.00' }
        ],
        listeners: {
            selectionchange: function(grid, selected) {
                if (selected.length > 0) {
                    var ven_ide = selected[0].get('ven_ide');
                    ventaDetalleStore.load({
                        params: { 'ven_ide': ven_ide }
                    });
                } else {
                    ventaDetalleStore.removeAll();
                }
            }
        },
        bbar: Ext.create('Ext.PagingToolbar', {
            store: ventaStore, 
            displayInfo: true,
            displayMsg: 'Mostrando {0} - {1} de {2}',
            emptyMsg: "No hay ventas"
        })


    });

    var ventaDetalleGrid = Ext.create('Ext.grid.Panel', {
        region: 'south',
        title: 'Detalle de la Venta Seleccionada',
        store: ventaDetalleStore,
        height: 200,
        split: true,
        columns: [
            { text: 'Producto', dataIndex: 'v_d_pro', flex: 1 },
            { text: 'Precio Uni.', dataIndex: 'v_d_uni', xtype: 'numbercolumn', format: '0.00' },
            { text: 'Cantidad', dataIndex: 'v_d_can', xtype: 'numbercolumn', format: '0.00' },
            { text: 'Total', dataIndex: 'v_d_tot', xtype: 'numbercolumn', format: '0.00' }
        ]
    });

    // 2.4. Panel Principal de Ventas 
    var ventasPanel = Ext.create('Ext.panel.Panel', {
        title: 'Gestion de Ventas',
        layout: 'border',
        items: [
            ventaGrid,
            ventaDetalleGrid
        ],
        dockedItems: [{
            xtype: 'toolbar',
            items: [
                {
                    text: 'Nueva Venta',
                    handler: function() {
                        
                        nuevaVentaWindow.down('#formCabecera').getForm().reset();
                        nuevaVentaDetalleStore.removeAll();
                        nuevaVentaWindow.currentVentaId = null; 
                        nuevaVentaWindow.setTitle('Crear Nueva Venta (Panel 2)');
                        nuevaVentaWindow.show();
                    }
                },
                {
                    text: 'Modificar Venta',
                    handler: function() {
                        
                        var sel = ventaGrid.getSelectionModel().getSelection();
                        if (sel.length > 0) {
                            var record = sel[0];
                            var ven_ide = record.get('ven_ide');

                            
                            var form = nuevaVentaWindow.down('#formCabecera').getForm();
                            form.loadRecord(record);
                            
                            
                            ventaDetalleStore.load({
                                params: { 'ven_ide': ven_ide },
                                callback: function(records, operation, success) {
                                    if (success) {
                                        nuevaVentaDetalleStore.removeAll();
                                        nuevaVentaDetalleStore.add(records); // Copiamos los detalles al grid editable
                                    } else {
                                        Ext.Msg.alert('Error', 'No se pudieron cargar los detalles de la venta.');
                                    }
                                }
                            });

                            
                            nuevaVentaWindow.currentVentaId = ven_ide;
                            nuevaVentaWindow.setTitle('Modificar Venta (ID: ' + ven_ide + ')');
                            nuevaVentaWindow.show();
                        } else {
                            Ext.Msg.alert('Aviso', 'Debe seleccionar una venta.');
                        }
                    }
                },
                {
                    text: 'Eliminar Venta',
                    handler: function() {
                        var sel = ventaGrid.getSelectionModel().getSelection();
                        if (sel.length > 0) {
                            Ext.Msg.confirm('Confirmar', '¿Seguro que desea eliminar esta VENTA?', function(btn) {
                                if (btn === 'yes') {
                                    ventaStore.remove(sel[0]);
                                    ventaStore.sync();
                                    ventaDetalleStore.removeAll();
                                }
                            });
                        } else {
                            Ext.Msg.alert('Aviso', 'Debe seleccionar una venta.');
                        }
                    }
                },
                {
                    text: 'Eliminar Todo',
                    iconCls: 'ext-icon-delete', 
                    handler: function() {
                        Ext.Msg.confirm('Confirmar', '¿Esta SEGURO de que desea eliminar TODAS las ventas?', function(btn) {
                            if (btn === 'yes') {
                                
                                Ext.Ajax.request({
                                    url: 'venta.php?accion=eliminar_todo',
                                    method: 'POST',
                                    success: function(response) {
                                        var res = Ext.decode(response.responseText);
                                        if (res.success) {
                                            Ext.Msg.alert('Exito', 'Todas las ventas han sido eliminadas.');
                                            ventaStore.load(); 
                                            ventaDetalleStore.removeAll(); 
                                        } else {
                                            Ext.Msg.alert('Error', res.message || 'No se pudo completar la operación.');
                                        }
                                    },
                                    failure: function() {
                                        Ext.Msg.alert('Error', 'Error de conexion.');
                                    }
                                });
                            }
                        });
                    }
                }
            ]
        }]
    });


    // =================================================================
    // Unimos los dos formularios en Pestañas
    // =================================G================================
    
    Ext.create('Ext.tab.Panel', {
        renderTo: 'app-container',
        width: '100%',
        height: 600,
        items: [
            trabajadorGrid, // Pestaña 1
            ventasPanel     // Pestaña 2
        ]
    });

});
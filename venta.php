<?php

ini_set('display_errors', 0);

// 1. Configuración de Conexión
$conn_string = "host=localhost port=5432 dbname=postgres user=postgres password=3264"; // Tu contraseña
$dbconn = pg_connect($conn_string);

if (!$dbconn) {
    echo json_encode(['success' => false, 'message' => 'Error de conexión a la base de datos']);
    exit;
}

// 2.  JSON
header('Content-Type: application/json');

// 3. acción
$accion = trim($_REQUEST['accion'] ?? ''); 
$response = [];

// 4. CRUD 

if ($accion == 'leer') {
   
    $start = $_REQUEST['start'] ?? 0;
    $limit = $_REQUEST['limit'] ?? 25;
    
    $result = pg_query_params($dbconn, 
        'SELECT * FROM prueba.venta WHERE est_ado = 1 ORDER BY ven_ide DESC LIMIT $1 OFFSET $2', 
        array($limit, $start)
    );
    
    $ventas = pg_fetch_all($result);
    
    $total_result = pg_query($dbconn, 'SELECT COUNT(*) FROM prueba.venta WHERE est_ado = 1');
    $total = pg_fetch_result($total_result, 0, 0);

    $response = [
        'success' => true,
        'total'   => (int)$total,
        'data'    => $ventas ? $ventas : []
    ];

} else if ($accion == 'crear' || $accion == 'actualizar') {
   
    $data = json_decode(file_get_contents('php://input'), true);

    if ($accion == 'crear') {
        $sql = "INSERT INTO prueba.venta (ven_ser, ven_num, ven_cli, ven_mon, est_ado) 
                VALUES ($1, $2, $3, $4, 1) RETURNING ven_ide";
        $params = [$data['ven_ser'], $data['ven_num'], $data['ven_cli'], $data['ven_mon']];
    
    } else { 
        $sql = "UPDATE prueba.venta 
                SET ven_ser = $1, ven_num = $2, ven_cli = $3, ven_mon = $4 
                WHERE ven_ide = $5";
        $params = [$data['ven_ser'], $data['ven_num'], $data['ven_cli'], $data['ven_mon'], $data['ven_ide']];
    }
    
    $result = pg_query_params($dbconn, $sql, $params);
    
    if ($result) {
        $responseData = $data;
        if ($accion == 'crear') {
            $responseData['ven_ide'] = pg_fetch_result($result, 0, 0);
        }
        $response = ['success' => true, 'data' => $responseData];
    } else {
        $response = ['success' => false, 'message' => 'Error al guardar la venta'];
    }

} else if ($accion == 'eliminar') {
    
    $data = json_decode(file_get_contents('php://input'), true); 
    $sql = "UPDATE prueba.venta SET est_ado = 0 WHERE ven_ide = $1";
    $result = pg_query_params($dbconn, $sql, array($data['ven_ide'])); 
    
    if ($result) {
        $response = ['success' => true];
    } else {
        $response = ['success' => false, 'message' => 'Error al eliminar la venta'];
    }

} else if ($accion == 'eliminar_todo') {

    $sql = "UPDATE prueba.venta SET est_ado = 0 WHERE est_ado = 1";
    $result = pg_query($dbconn, $sql);
    
    if ($result) {
        $response = ['success' => true];
    } else {
        $response = ['success' => false, 'message' => 'Error al eliminar todas las ventas'];
    }
  

} else {
   
    $response = ['success' => false, 'message' => 'Acción no válida'];
}


echo json_encode($response);
pg_close($dbconn);
?>
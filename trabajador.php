<?php
ini_set('display_errors', 0);

$conn_string = "host=localhost port=5432 dbname=postgres user=postgres password=3264";
$dbconn = pg_connect($conn_string);

if (!$dbconn) {
    echo json_encode(['success' => false, 'message' => 'Error de conexión a la base de datos']);
    exit;
}

header('Content-Type: application/json');

$accion = trim($_REQUEST['accion'] ?? '');
$response = [];

if ($accion == 'leer') {
    $start = $_REQUEST['start'] ?? 0;
    $limit = $_REQUEST['limit'] ?? 25;
    
    $result = pg_query_params($dbconn, 
        'SELECT * FROM prueba.trabajador WHERE est_ado = 1 ORDER BY tra_ide DESC LIMIT $1 OFFSET $2', 
        array($limit, $start)
    );
    
    $trabajadores = pg_fetch_all($result);
    
    $total_result = pg_query($dbconn, 'SELECT COUNT(*) FROM prueba.trabajador WHERE est_ado = 1');
    $total = pg_fetch_result($total_result, 0, 0);

    $response = [
        'success' => true,
        'total'   => (int)$total,
        'data'    => $trabajadores ? $trabajadores : []
    ];

} else if ($accion == 'crear' || $accion == 'actualizar') {
    $data = json_decode(file_get_contents('php://input'), true);

    if ($accion == 'crear') {
        $sql = "INSERT INTO prueba.trabajador (tra_cod, tra_nom, tra_pat, tra_mat, est_ado) 
                VALUES ($1, $2, $3, $4, 1) RETURNING tra_ide";
        $params = [$data['tra_cod'], $data['tra_nom'], $data['tra_pat'], $data['tra_mat']];
    
    } else {
        $sql = "UPDATE prueba.trabajador 
                SET tra_cod = $1, tra_nom = $2, tra_pat = $3, tra_mat = $4 
                WHERE tra_ide = $5";
        $params = [$data['tra_cod'], $data['tra_nom'], $data['tra_pat'], $data['tra_mat'], $data['tra_ide']];
    }
    
    $result = pg_query_params($dbconn, $sql, $params);
    
    if ($result) {
        $responseData = $data;
        if ($accion == 'crear') {
            $responseData['tra_ide'] = pg_fetch_result($result, 0, 0);
        }
        $response = ['success' => true, 'data' => $responseData];
    } else {
        $response = ['success' => false, 'message' => 'Error al guardar los datos'];
    }

} else if ($accion == 'eliminar') {
    $data = json_decode(file_get_contents('php://input'), true); 
    $sql = "UPDATE prueba.trabajador SET est_ado = 0 WHERE tra_ide = $1";
    $result = pg_query_params($dbconn, $sql, array($data['tra_ide'])); 
    
    if ($result) {
        $response = ['success' => true];
    } else {
        $response = ['success' => false, 'message' => 'Error al eliminar'];
    }

} else if ($accion == 'eliminar_todo') {
    $sql = "UPDATE prueba.trabajador SET est_ado = 0 WHERE est_ado = 1";
    $result = pg_query($dbconn, $sql);
    
    if ($result) {
        $response = ['success' => true];
    } else {
        $response = ['success' => false, 'message' => 'Error al eliminar todos los trabajadores'];
    }

} else {
    $response = ['success' => false, 'message' => 'Acción no válida'];
}

echo json_encode($response);
pg_close($dbconn);
?>
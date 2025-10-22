<?php

ini_set('display_errors', 0);

$conn_string = "host=localhost port=5432 dbname=postgres user=postgres password=3264"; // Tu contraseña
$dbconn = pg_connect($conn_string);

if (!$dbconn) {
    echo json_encode(['success' => false, 'message' => 'Error de conexión a la base de datos']);
    exit;
}

header('Content-Type: application/json');

$accion = trim($_REQUEST['accion'] ?? '');
$response = [];

switch ($accion) {

   
    case 'leer':
        $ven_ide = $_REQUEST['ven_ide'] ?? 0;

        if ($ven_ide == 0) {
            $response = ['success' => true, 'total' => 0, 'data' => []];
        } else {
            $result = pg_query_params($dbconn, 
                'SELECT * FROM prueba.venta_detalle WHERE ven_ide = $1 AND est_ado = 1 ORDER BY v_d_ide', 
                array($ven_ide)
            );
            
            $detalles = pg_fetch_all($result);
            $total = pg_num_rows($result);

            $response = [
                'success' => true,
                'total'   => (int)$total,
                'data'    => $detalles ? $detalles : []
            ];
        }
        break;

  
    case 'guardar_lote':
        $input = json_decode(file_get_contents('php://input'), true);
        $ven_ide = $_REQUEST['ven_ide'] ?? 0; 
        
        if ($ven_ide == 0) {
            $response = ['success' => false, 'message' => 'No se especificó un ID de venta'];
            break;
        }


    
        $sql_delete_all = "UPDATE prueba.venta_detalle SET est_ado = 0 WHERE ven_ide = $1";
        pg_query_params($dbconn, $sql_delete_all, array($ven_ide));

        $productos = $input['data'] ?? [];
        $errores = [];

        
        foreach ($productos as $producto) {
            
            
            if (empty($producto['v_d_ide']) || $producto['v_d_ide'] < 0) { 
                $sql = "INSERT INTO prueba.venta_detalle (ven_ide, v_d_pro, v_d_uni, v_d_can, est_ado) 
                        VALUES ($1, $2, $3, $4, 1)"; 
                $params = [
                    $ven_ide,
                    $producto['v_d_pro'],
                    $producto['v_d_uni'],
                    $producto['v_d_can']
                ];
            } else {
                
                $sql = "UPDATE prueba.venta_detalle 
                        SET v_d_pro = $1, v_d_uni = $2, v_d_can = $3, est_ado = 1
                        WHERE v_d_ide = $4 AND ven_ide = $5";
                $params = [
                    $producto['v_d_pro'],
                    $producto['v_d_uni'],
                    $producto['v_d_can'],
                    $producto['v_d_ide'], 
                    $ven_ide             
                ];
            }
            
            $result = pg_query_params($dbconn, $sql, $params);
            if (!$result) {
                $errores[] = "Error al guardar producto: " . $producto['v_d_pro'];
            }
        }
        

        if (empty($errores)) {
            $sql_update_total = "UPDATE prueba.venta 
                                 SET ven_mon = (SELECT SUM(v_d_tot) 
                                                FROM prueba.venta_detalle 
                                                WHERE ven_ide = $1 AND est_ado = 1) 
                                 WHERE ven_ide = $1";
            
            pg_query_params($dbconn, $sql_update_total, array($ven_ide));
            
            $response = ['success' => true];
        } else {
            $response = ['success' => false, 'message' => implode(', ', $errores)];
        }
        break;

    default:
        $response = ['success' => false, 'message' => 'Acción no válida'];
        break;
}


echo json_encode($response);
pg_close($dbconn);
?>
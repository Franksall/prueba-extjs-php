-- 1. Crear el esquema
CREATE SCHEMA IF NOT EXISTS prueba;

-- 2. Tabla Trabajador
CREATE TABLE prueba.trabajador(
  tra_ide serial PRIMARY KEY,
  tra_cod integer DEFAULT 0,
  tra_nom varchar(200) DEFAULT '',
  tra_pat varchar(200) DEFAULT '',
  tra_mat varchar(200) DEFAULT '',
  est_ado integer DEFAULT 1 -- 1 = Activo, 0 = Eliminado
);

-- 3. Tabla Venta (Cabecera)
CREATE TABLE prueba.venta(
  ven_ide serial PRIMARY KEY,
  ven_ser varchar(5) DEFAULT '', 
  ven_num varchar(100) DEFAULT '',
  ven_cli text DEFAULT '',
  ven_mon numeric (14,2),
  est_ado integer DEFAULT 1 -- 1 = Activo, 0 = Eliminado
);

-- 4. Tabla Venta Detalle
CREATE TABLE prueba.venta_detalle(
  v_d_ide serial PRIMARY KEY,
  ven_ide integer REFERENCES prueba.venta(ven_ide), -- Llave foránea
  v_d_pro text DEFAULT '',
  v_d_uni numeric(14,2) DEFAULT 0.00,
  v_d_can numeric(14,2) DEFAULT 0.00,
  v_d_tot numeric(14,2) DEFAULT 0.00,
  est_ado integer DEFAULT 1
);

-- 5. Creación de la FUNCIÓN para el Trigger
CREATE OR REPLACE FUNCTION prueba.fn_calcular_total_detalle()
RETURNS TRIGGER AS $$
BEGIN
    NEW.v_d_tot := NEW.v_d_uni * NEW.v_d_can;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- 6. Creación del TRIGGER
CREATE TRIGGER tr_calcular_total_detalle
BEFORE INSERT OR UPDATE ON prueba.venta_detalle
FOR EACH ROW
EXECUTE FUNCTION prueba.fn_calcular_total_detalle();
-- Crear la tabla de paquetes
CREATE TABLE IF NOT EXISTS packages (
    id SERIAL PRIMARY KEY,
    apartment_number VARCHAR(50) NOT NULL,
    sender VARCHAR(100) NOT NULL,
    delivery_date TIMESTAMP NOT NULL,
    status VARCHAR(50) NOT NULL,
    qr_code VARCHAR(100) UNIQUE NOT NULL,
    pickup_date TIMESTAMP,
    notes TEXT,
    delivery_method VARCHAR(50),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Crear índices para mejorar el rendimiento
CREATE INDEX IF NOT EXISTS idx_packages_apartment ON packages(apartment_number);
CREATE INDEX IF NOT EXISTS idx_packages_status ON packages(status);
CREATE INDEX IF NOT EXISTS idx_packages_delivery_date ON packages(delivery_date);

-- Crear restricciones para el estado
ALTER TABLE packages
ADD CONSTRAINT check_status
CHECK (status IN ('pendiente', 'entregado', 'retirado'));

-- Comentarios de la tabla
COMMENT ON TABLE packages IS 'Tabla para almacenar información de paquetes';
COMMENT ON COLUMN packages.id IS 'Identificador único del paquete';
COMMENT ON COLUMN packages.apartment_number IS 'Número del departamento destinatario';
COMMENT ON COLUMN packages.sender IS 'Nombre del remitente del paquete';
COMMENT ON COLUMN packages.delivery_date IS 'Fecha y hora de entrega del paquete';
COMMENT ON COLUMN packages.status IS 'Estado del paquete: pendiente, entregado o retirado';
COMMENT ON COLUMN packages.qr_code IS 'Código QR único para identificar el paquete';
COMMENT ON COLUMN packages.pickup_date IS 'Fecha y hora de retiro del paquete';
COMMENT ON COLUMN packages.notes IS 'Notas adicionales sobre el paquete';
COMMENT ON COLUMN packages.delivery_method IS 'Método de entrega del paquete';
COMMENT ON COLUMN packages.created_at IS 'Fecha y hora de registro del paquete';
--tabla a

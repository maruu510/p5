import { EmailNotifier } from "./EmailNotifier.ts";


// Usuario de prueba
const testUser = {
  id: "1",
  email: "prueba@ejemplo.com",
  name: "Usuario de Prueba",
  username: "test_user",
  password: "test123",
  role: "resident"
};

async function testNotifications() {
  const emailNotifier = new EmailNotifier();

  console.log("Iniciando pruebas de notificaciones...");

  // Probar notificación de llegada de paquete
  await emailNotifier.notifyPackageArrival(testUser, "PKG-001");

  // Probar recordatorio de recogida
  await emailNotifier.notifyPickupReminder(testUser, "PKG-001");

  console.log("Pruebas completadas!");
}

// Ejecutar las pruebas
testNotifications();
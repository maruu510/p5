const bcrypt = require('bcryptjs');

bcrypt.hash('admin12345', 10, (err, hash) => {
  if (err) {
    console.error('❌ Error:', err);
    return;
  }
  console.log('✅ Hash generado:');
  console.log(hash);
});



import pool from "../database/connection"; // Cambiar esta línea

async function checkPlans() {
  try {
    const result = await pool.query("SELECT * FROM plans ORDER BY id");
    console.log("Plans in database:", result.rows);

    if (result.rows.length === 0) {
      console.log("No plans found. Running insert...");

      // Insertar planes si no existen
      await pool.query(`
        INSERT INTO plans (name, description, price, features, billing_period) 
        VALUES 
          ('Basic', 'Plan básico para comenzar', 9.99, '["1 proyecto", "Soporte básico", "1GB almacenamiento"]', 'monthly'),
          ('Pro', 'Plan profesional con más características', 19.99, '["5 proyectos", "Soporte prioritario", "10GB almacenamiento", "Analytics básicos"]', 'monthly'),
          ('Enterprise', 'Plan empresarial completo', 49.99, '["Proyectos ilimitados", "Soporte 24/7", "100GB almacenamiento", "Analytics avanzados", "API access"]', 'monthly')
        ON CONFLICT (name) DO NOTHING;
      `);

      console.log("Plans inserted successfully");
    }
  } catch (error) {
    console.error("Error checking plans:", error);
  } finally {
    await pool.end();
  }
}

checkPlans();

const initSqlJs = require('sql.js');
const fs = require('fs');
const path = require('path');
const bcrypt = require('bcryptjs');

const DB_PATH = process.env.VERCEL ? path.join('/tmp', 'patamatch.db') : path.join(__dirname, 'patamatch.db');

let db = null;

async function initDatabase() {
  const SQL = await initSqlJs();
  
  // Load existing DB or create new
  if (fs.existsSync(DB_PATH)) {
    const buffer = fs.readFileSync(DB_PATH);
    db = new SQL.Database(buffer);
    console.log('📂 Loaded existing database');
  } else {
    db = new SQL.Database();
    console.log('🆕 Created new database');
  }

  // Enable foreign keys
  db.run('PRAGMA foreign_keys = ON');

  // Create tables
  db.run(`
    CREATE TABLE IF NOT EXISTS users (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      name TEXT NOT NULL,
      email TEXT UNIQUE NOT NULL,
      password_hash TEXT NOT NULL,
      city TEXT DEFAULT '',
      avatar_url TEXT DEFAULT '',
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP
    )
  `);

  db.run(`
    CREATE TABLE IF NOT EXISTS pets (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      name TEXT NOT NULL,
      species TEXT NOT NULL DEFAULT '',
      breed TEXT DEFAULT '',
      age TEXT DEFAULT '',
      size TEXT DEFAULT '',
      location TEXT DEFAULT '',
      image_url TEXT DEFAULT '',
      badge TEXT DEFAULT NULL,
      badge_color TEXT DEFAULT NULL,
      description TEXT DEFAULT '',
      is_adopted INTEGER DEFAULT 0,
      adopted_quote TEXT DEFAULT '',
      user_id INTEGER,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (user_id) REFERENCES users(id)
    )
  `);

  db.run(`
    CREATE TABLE IF NOT EXISTS lost_pets (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      name TEXT NOT NULL,
      breed TEXT DEFAULT '',
      location TEXT DEFAULT '',
      last_seen TEXT DEFAULT '',
      description TEXT DEFAULT '',
      image_url TEXT DEFAULT '',
      badge TEXT DEFAULT NULL,
      marker_top TEXT DEFAULT '50%',
      marker_left TEXT DEFAULT '50%',
      marker_image TEXT DEFAULT '',
      is_found INTEGER DEFAULT 0,
      user_id INTEGER,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (user_id) REFERENCES users(id)
    )
  `);

  db.run(`
    CREATE TABLE IF NOT EXISTS posts (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      title TEXT NOT NULL,
      body TEXT DEFAULT '',
      category TEXT DEFAULT 'tips',
      tags TEXT DEFAULT '[]',
      user_id INTEGER NOT NULL,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (user_id) REFERENCES users(id)
    )
  `);

  db.run(`
    CREATE TABLE IF NOT EXISTS post_likes (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      post_id INTEGER NOT NULL,
      user_id INTEGER NOT NULL,
      UNIQUE(post_id, user_id),
      FOREIGN KEY (post_id) REFERENCES posts(id) ON DELETE CASCADE,
      FOREIGN KEY (user_id) REFERENCES users(id)
    )
  `);

  db.run(`
    CREATE TABLE IF NOT EXISTS post_comments (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      post_id INTEGER NOT NULL,
      user_id INTEGER NOT NULL,
      body TEXT NOT NULL,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (post_id) REFERENCES posts(id) ON DELETE CASCADE,
      FOREIGN KEY (user_id) REFERENCES users(id)
    )
  `);

  db.run(`
    CREATE TABLE IF NOT EXISTS stories (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      pet_name TEXT NOT NULL,
      author_name TEXT DEFAULT '',
      title TEXT NOT NULL,
      body TEXT DEFAULT '',
      image_url TEXT DEFAULT '',
      badge TEXT DEFAULT '',
      is_approved INTEGER DEFAULT 0,
      user_id INTEGER,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (user_id) REFERENCES users(id)
    )
  `);

  db.run(`
    CREATE TABLE IF NOT EXISTS favorites (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      user_id INTEGER NOT NULL,
      pet_id INTEGER NOT NULL,
      UNIQUE(user_id, pet_id),
      FOREIGN KEY (user_id) REFERENCES users(id),
      FOREIGN KEY (pet_id) REFERENCES pets(id) ON DELETE CASCADE
    )
  `);

  db.run(`
    CREATE TABLE IF NOT EXISTS carnets (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      pet_name TEXT NOT NULL,
      species TEXT DEFAULT '',
      breed TEXT DEFAULT '',
      gender TEXT DEFAULT '',
      color_markings TEXT DEFAULT '',
      microchip_id TEXT DEFAULT '',
      image_url TEXT DEFAULT '',
      qr_url TEXT DEFAULT '',
      birth_date TEXT DEFAULT '',
      vaccinations TEXT DEFAULT '[]',
      medical_history TEXT DEFAULT '[]',
      vet_name TEXT DEFAULT '',
      vet_clinic TEXT DEFAULT '',
      vet_phone TEXT DEFAULT '',
      vet_image TEXT DEFAULT '',
      owner_name TEXT DEFAULT '',
      owner_city TEXT DEFAULT '',
      user_id INTEGER,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (user_id) REFERENCES users(id)
    )
  `);

  // Seed if empty
  const res = db.exec('SELECT COUNT(*) as count FROM users');
  const count = res.length > 0 ? res[0].values[0][0] : 0;
  if (count === 0) {
    seedDatabase();
  }

  // Ensure every demo user has a carnet (works even if database already existed)
  try {
    const demoUsers = queryAll("SELECT id, name, email FROM users WHERE email IN ('demo@patamatch.com', 'david@patamatch.com', 'sarah@patamatch.com')");
    for (const u of demoUsers) {
      const existing = queryOne("SELECT COUNT(*) as count FROM carnets WHERE user_id = ?", [u.id]);
      if (existing && existing.count === 0) {
        console.log(`🌱 Creating fictitious carnet for ${u.email}...`);
        if (u.email === 'demo@patamatch.com') {
          const vacc = JSON.stringify([
            { name: 'Rabia 3 Años', last_dose: '10 May, 2023', next_dose: '10 May, 2026', status: 'updated' },
            { name: 'DHPP (Distémper)', last_dose: '12 Ene, 2024', next_dose: '12 Ene, 2025', status: 'updated' },
            { name: 'Parvovirus', last_dose: '15 Mar, 2024', next_dose: '15 Mar, 2025', status: 'updated' }
          ]);
          const hist = JSON.stringify([
            { date: '12 ENE, 2024', title: 'Consulta de Rutina', description: 'Excelente estado de salud general. Peso ideal de 28.5kg.' },
            { date: '20 NOV, 2023', title: 'Vacunación Anual', description: 'Aplicación de refuerzo óctuple sin reacciones adversas.' }
          ]);
          db.run('INSERT INTO carnets (pet_name,species,breed,gender,color_markings,microchip_id,image_url,qr_url,birth_date,vaccinations,medical_history,vet_name,vet_clinic,vet_phone,vet_image,owner_name,owner_city,user_id) VALUES (?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?)',
            ['Bella', 'Canino (Perro)', 'Golden Retriever', 'Hembra', 'Dorado Brillante', '9851 9876 5432 109',
            'https://images.unsplash.com/photo-1552053831-71594a27632d?auto=format&fit=crop&q=80&w=600',
            '', '2022-04-15', vacc, hist, 'Dr. Carlos Mendoza', 'Hospital Veterinario Pets Life', '(55) 5555-9876', '',
            u.name, 'CDMX', u.id]);
        } else if (u.email === 'david@patamatch.com') {
          const vacc = JSON.stringify([
            { name: 'Triple Felina', last_dose: '15 Feb, 2024', next_dose: '15 Feb, 2025', status: 'updated' },
            { name: 'Leucemia Felina', last_dose: '15 Feb, 2024', next_dose: '15 Feb, 2025', status: 'updated' }
          ]);
          const hist = JSON.stringify([
            { date: '15 FEB, 2024', title: 'Chequeo Preventivo', description: 'Revisión dental limpia, ojos brillantes y pelaje sedoso.' }
          ]);
          db.run('INSERT INTO carnets (pet_name,species,breed,gender,color_markings,microchip_id,image_url,qr_url,birth_date,vaccinations,medical_history,vet_name,vet_clinic,vet_phone,vet_image,owner_name,owner_city,user_id) VALUES (?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?)',
            ['Max', 'Felino (Gato)', 'Siamés', 'Macho', 'Gris y Crema', '9851 1122 3344 556',
            'https://images.unsplash.com/photo-1514888286974-6c03e2ca1dba?auto=format&fit=crop&q=80&w=600',
            '', '2023-01-20', vacc, hist, 'Dra. Ana Gómez', 'Clínica Felina Santa Lucía', '(55) 4433-2211', '',
            u.name, 'Austin, TX', u.id]);
        }
      }
    }
  } catch (err) {
    console.error('Error ensuring demo user carnets:', err);
  }

  // Ensure initial comments exist
  try {
    const existingComments = queryOne("SELECT COUNT(*) as count FROM post_comments");
    if (!existingComments || existingComments.count === 0) {
      console.log('🌱 Seeding initial comments...');
      db.run("INSERT INTO post_comments (post_id, user_id, body) VALUES (?, ?, ?)", [1, 2, '¡El parque de Lafayette Park es buenísimo! Tiene un área especial cerrada para razas pequeñas y el césped está siempre impecable.']);
      db.run("INSERT INTO post_comments (post_id, user_id, body) VALUES (?, ?, ?)", [1, 3, '¡Confirmo! Yo llevo a mi chihuahua ahí y le encanta. Además la vista es hermosa.']);
      db.run("INSERT INTO post_comments (post_id, user_id, body) VALUES (?, ?, ?)", [2, 1, 'A nosotros nos sirvió mucho dejarle una prenda de ropa usada con nuestro olor en su camita. ¡Se calma muchísimo!']);
      db.run("INSERT INTO post_comments (post_id, user_id, body) VALUES (?, ?, ?)", [2, 3, 'Intenta también los juguetes tipo Kong rellenos de crema de cacahuate congelada. Los mantiene ocupados por horas y asocian quedarse solos con algo positivo.']);
    }
  } catch (err) {
    console.error('Error seeding comments:', err);
  }

  saveDatabase();
  return db;
}

function saveDatabase() {
  if (!db) return;
  try {
    const data = db.export();
    const buffer = Buffer.from(data);
    fs.writeFileSync(DB_PATH, buffer);
  } catch (err) {
    console.warn('Could not save DB to disk:', err.message);
  }
}

// Helper: run a query and return results as array of objects
function queryAll(sql, params = []) {
  const stmt = db.prepare(sql);
  if (params.length) stmt.bind(params);
  const results = [];
  while (stmt.step()) {
    results.push(stmt.getAsObject());
  }
  stmt.free();
  return results;
}

// Helper: run a query and return first result as object
function queryOne(sql, params = []) {
  const results = queryAll(sql, params);
  return results.length > 0 ? results[0] : null;
}

// Helper: run insert/update/delete
function runQuery(sql, params = []) {
  db.run(sql, params);
  const lastId = db.exec('SELECT last_insert_rowid() as id');
  const changes = db.exec('SELECT changes() as changes');
  saveDatabase();
  return {
    lastInsertRowid: lastId[0]?.values[0]?.[0] || 0,
    changes: changes[0]?.values[0]?.[0] || 0
  };
}

function seedDatabase() {
  console.log('🌱 Seeding database...');

  const hash = bcrypt.hashSync('demo123', 10);

  // Users
  db.run('INSERT INTO users (name, email, password_hash, city, avatar_url) VALUES (?, ?, ?, ?, ?)', ['Sarah Miller', 'sarah@patamatch.com', hash, 'San Francisco, CA', 'https://lh3.googleusercontent.com/aida-public/AB6AXuB8Wm9pA1lUUib9HuVXuloRZ82CSu3bGco76b7dv6NYk3sqaAMrwG6_FKWvX7xDAeYrgyCdjGpDtY7gAjz8DBN1_PTvqTPL1brMiZEXpb0KIIO36B8Zx7i3ugxJdfZ2fck2t1Iirf0ItDcTFaFzoL5xhBZUDG5BPyl5QwNR0LOIGxJC0YHx2E4aBZG51vdPm-etERXmxttbGwr3LWT7kMq8QNrOczkkxAcaHcFmx-TkJ4HN7lS2zK28A1tvfWlT41ath_LrgFmBKEg-']);
  db.run('INSERT INTO users (name, email, password_hash, city, avatar_url) VALUES (?, ?, ?, ?, ?)', ['David Chen', 'david@patamatch.com', hash, 'Austin, TX', 'https://lh3.googleusercontent.com/aida-public/AB6AXuAeG2S1vbkvQlmYX2rRCv1Ojgwa3cbXajbOu3xGfM1rHX-vxBnx65qG2UUfvO6tMRvaVtHrnBsmLkUNoRyUae8qyqfDdr85YeiTCs3sw0RBZAZwIxsIo9znaK07ZJxZTaBLK4_aScTdgBvN1yrNGVGvg6JimgCFoxQeowqTh0kEGNbNdXnyu_B_jg1V2y97Acu8Rbe6mx-c_1o5iAtgI6mc-rK0LeIb_CWKhl8kxPghVlrUAplS2Hyb5cOhu9Vb46aakq1yXTsWfCSW']);
  db.run('INSERT INTO users (name, email, password_hash, city) VALUES (?, ?, ?, ?)', ['Demo User', 'demo@patamatch.com', hash, 'CDMX']);

  // Pets (available)
  const pets = [
    ['Cooper', 'Perro', 'Beagle', '1.5 Años', 'Mediano', 'Portland, OR', 'https://lh3.googleusercontent.com/aida-public/AB6AXuB_Urbt_th9z3ubslV9NUcaButvsJn3bjqulHDYDdhPaIrB6ttoasAYcOCkYNaAgRk_1uw_eCT0UBQ7VhEo6_6F5u4XDGtNvbRAYmoovCN44BxXBEGL0_mh7acSIapTtu49wqf97h-QueKTf050pgjbBk6cHSKZ-Pumc5q78UeJUBF0UCfexcs_BfPbPdvXR2J1tr_jMbLIwm7v27aGlwFdsZwGPgViwZMK2KO6i04PRqBJTWKjhOjdHb-E5rppiGfIQC81qpEOpr84', 'Urgente', 'primary', 'Beagle cariñoso, necesita hogar con jardín.', 0, ''],
    ['Luna', 'Gato', 'Siamés', '3 Años', 'Pequeño', 'Seattle, WA', 'https://lh3.googleusercontent.com/aida-public/AB6AXuBI-QvpmYEchC8otadqV01ZDAEzyhbBcdg6wltHQrUukknU_rmUxArM-wSTj7uiZM2iJ2_-Ipb1kQnDT6dy7ZCYPEaLi0MNznbu9HBkIAP99irRKQYng6rcXZ5RB5KUuLdhX99OLOIjRp7O1Z-3I6yvM4naSX7dcgiP13VLiN18J0qkOOChiCninV2DZdA-DCZaihsfjlNYlMEn-uBBcyc98YTCb3Z4AhjFgQaM4FqPQZllTxrQu_hlJ-4pSH_1taBDcNM1ktmBmyBt', null, null, 'Tranquila e independiente, perfecta para apartamentos.', 0, ''],
    ['Buddy', 'Perro', 'Golden Retriever', '4 Años', 'Grande', 'Austin, TX', 'https://lh3.googleusercontent.com/aida-public/AB6AXuAEx9z4sDgwlES6LhT2atZDYSpIdFU6jBHF8_JmDCJatBF8rO0sQQJLSDG8gZRmLBnISn4f2nR71iNTTZpV-N2qRjCcWF_tJtMh0IqkixPiL_BbAxqj5Y0AosAx6Ry8IxECZNlrLIO61hjIkq96CT2Iw0Oo5Ga1Qd-hWxEJAqvZZtG7u6dRx8sfKmCiag_gZLQD-TFjIQPDqw_1o-Y44gpi5GzvdgAFwmtboSZb7pNx9dFtTWkyg4pHTs8zJjforTlxWwgxyVct-rrG', null, null, 'Súper social, ama a los niños.', 0, ''],
    ['Milo', 'Perro', 'Corgi', '6 Meses', 'Pequeño', 'Denver, CO', 'https://lh3.googleusercontent.com/aida-public/AB6AXuCARRdvsssJGKMQol3bN9xYVJ2HpHbSU1zcdk7DsWgo47LijqEjFTuDnq6dvcSbCEByZYi_gIVZnufn33klKbGiw9wTUy9sQFZDh5M2ESkxc-bjXVyodZlhFY-YSbcxIFTzetEmfERILz1kWgb0sPz_Vc7MHyTH7Og_wYzRZF5uQKwtcngulZ-kvj2hSuqjX6Yyd4dZF_1oGcMri3kOLrXXXqdsTH6xFW6H5ud30WnxOo8y0-O7SjFIrU4Yq5VFBtnPu9AxE9NHxNg4', 'Recién Llegado', 'secondary', 'Cachorro corgi lleno de energía.', 0, ''],
    ['Ginger', 'Gato', 'Naranja Atigrado', '2 Años', 'Pequeño', 'Chicago, IL', 'https://lh3.googleusercontent.com/aida-public/AB6AXuDwEHn-QzyMG-HUZqxe4Jiv0FrIr34KTl77tKRptRbyplT94hZ2UwCmwd28a4xEicnL79kGq9anzDn59FOwSF-ObQht6EtYq0H6PXHLA-K4I0WzdI4Cahehq2hx3DSUSeNayFqnSWUFAN1QAdsFZJyru-7SvLh2aircH2eh8dYUPeeEmGtX4yELWy31XqOw4YLgicqZlckmh44vItZyKoHOPhQuwT2mFrCwmJ1cyV0EDdRulbwj2ie4LjPbybJfWXDvHIkLg2V86qY9', null, null, 'Juguetón, le encanta perseguir plumas.', 0, ''],
    ['Bella & Pip', 'Perro', 'Mestizo', '1 Año', 'Pequeño', 'Miami, FL', 'https://lh3.googleusercontent.com/aida-public/AB6AXuBSH1r1oviylrgXtWF2x6gPslfWokXRFJNgz6efCeu-DmOdYH48nTOvosnUOe1Ho000Tq0UwvqoMq_C9LZEko8bY6IIQYYwETtHC5pnXhCLA9T3AT-GXTfXqa3EFaOXM2Hp63BekxcC4O9czeX2qjwuKOAhK642Jv3-mYTaykQYB1Vrif4uFil9GCySvBxrFx8BhRTXEYKaGTLGazX4MpCBBvQU2YQ8vAAfM5-mJWFvMgI-ElcLMXa78fb4LydsP1nBU2yReCB9aON9', null, null, 'Inseparables, se adoptan juntos.', 0, ''],
    ['Hammy', 'Otro', 'Hámster Sirio', '4 Meses', 'Extra Pequeño', 'Phoenix, AZ', 'https://lh3.googleusercontent.com/aida-public/AB6AXuBYdWMdAyC2In0uKe9Rg67HvL8uzU-9Kdi_Jb8zCzQr30rikWMRcXZkQiAZAZdO3PaR-dFIJX1oc3yHoUsnJhqyUc-akMGJalHIYi8mOzw1ZZCIprxzQaSdtzcT0j9Y-57RwSH7JeYKmt249v9D0lTcLwACne_8f8c7eHu57QPZSxDmT2RfxNBEG_7zSWm1vR9DQt4cCh-WAJIdwYeZagrNxVlKfFuvyt-8kAfPw1FIBp14Z2J5ZxNq6vdozX4gJhTbdu6taEV6IqsB', null, null, 'Adorable y fácil de cuidar.', 0, ''],
    ['Snowy', 'Gato', 'Persa', '5 Años', 'Mediano', 'Los Angeles, CA', 'https://lh3.googleusercontent.com/aida-public/AB6AXuB6PjEe1o3OoBN-DaQ5kYDtHn5uEOg4q67Q7yixg-R7dKBPvm8pbQ7-PkTBfK5JytYumcUo3RZOWpcdsJTAM4SNTNEJgTACu6VN-9IwkKH_pRM0-vMPH3BTjz8UuonpaxfBuFxi4vLjjAokQxzpNWztPGhcPFu_juxqLo90c1qaxM0_393HY9dLarD6c5IpTBA0SNIZ9DpF78pjm-3Mgr1CGquDclkYJU35sy6pNSDOJHl8VzKk6Wiyrmt_3au_6sCg3w9XWTeWmhI0', null, null, 'Persa majestuoso, perfecto para hogar tranquilo.', 0, '']
  ];
  // Adopted pets
  const adopted = [
    ['Roco', 'Perro', 'Mestizo', '3 Años', 'Mediano', 'CDMX', 'https://lh3.googleusercontent.com/aida-public/AB6AXuAqRVeJibbG96lgappUgGzzKVBxaIZMuwQ7tR9vJcbOy1e_oVM4Iju4yyCRbmk-FIzuKF_2My7bndSa5sEMlJwx5fsFnn_vNjo6qYayqBuNrgyKpjkVyZ6nm3RFzCj6k_c2rt25_BW_fLSIwYWsO8ZDqJ-mCjLCGNiGzr-3CBpgIBy3vS787-JyJkGBJfy5sy-b3Zf8YPvP8vv_I_oE222fwubJMC25aC4T_ly6DOZlPfew2z-VKyDrZwoLI79oapCdmT8f6AvDaN4y', null, null, '', 1, '"Roco se convirtió en la alegría de nuestra casa..."'],
    ['Luna Adoptada', 'Gato', 'Atigrado', '2 Años', 'Pequeño', 'Guadalajara', 'https://lh3.googleusercontent.com/aida-public/AB6AXuAmRaJx4Ybem1ob0QYUE4Ey1Q8O78KjoL3MouQIeQzoDDi9GL3NLI0t22VhSFQYvzf8KuxRsy283FU-7Ae9owvMjLWgqKvRvrOYQghWm0RDTX6WVebR2_iKlit3UdL6vlLmepTQoYAoNvzlFEBg9mZp7V7yO-50ybm75O0rWAJbqrufS2qrROqzg5P2O30X3djQjSUN83mdwHP3XDd_dc9qfVOuBtnIz1K0Wf1DNaHomWNqsMbzYnBm9tLk0ZqzUMejlc2AJNQ2gTpJ', null, null, '', 1, '"La compañera perfecta para mis tardes de lectura."'],
    ['Bruno', 'Perro', 'Golden Retriever', '5 Años', 'Grande', 'Monterrey', 'https://lh3.googleusercontent.com/aida-public/AB6AXuBYa11je97rmo9k-S5EbarYu2DOMbA0c-NsoNGy_zroBCUw1F_ruJgrRtvWVttZLRAtBdZO0_oGkHGLuRkZYvIWwWgYSu7wwWHLGbbb0Ncm9PG6GfCcIP3hr_VPHsBC5FmzmtNhhxqr2Vwj3VXwWzDZ8EhvloVah9f7zxpyQaPThNCiSyfvoXgNvwjJNz6XERiMqqtIA_a-OdzXG50GTISsYNmxu8M_MCVWJ8199ZvYsZAxG4aY4w7bGQejjwD8yww81LLsKV_MC23g', null, null, '', 1, '"Bruno nos motiva a salir y disfrutar la naturaleza todos los días."'],
    ['Milo Adoptado', 'Perro', 'Dachshund', '1 Año', 'Pequeño', 'Puebla', 'https://lh3.googleusercontent.com/aida-public/AB6AXuCT5GFmyUXbCWqiZbaitvqPo4AlckOteXNk4e9LzaNwGKhy6Y7FrKaWciL_ip_uxgJCHeYuo5d8NjrHD2N0jCpBp6jFbbs_xQw7wyhf60DL8eRuA3kxJWuDckLcVoDEBBPHAd8P8ZaEtm2Hcg6nrqNQwl8YeFAIxE-rl_gSOAfCgtH5QJ9Bv42k92hLTp1kPM1lmyhthmafMIQesqFSSA8Usd0qrdWekFS0de-iAdgXTw6CC1GI1N0Q3Eore30VCNqnDzN2oco7t52l', null, null, '', 1, '"El pequeño gran jefe de la casa ahora tiene su cama real."']
  ];

  const allPets = [...pets, ...adopted];
  for (const p of allPets) {
    db.run('INSERT INTO pets (name,species,breed,age,size,location,image_url,badge,badge_color,description,is_adopted,adopted_quote) VALUES (?,?,?,?,?,?,?,?,?,?,?,?)', p);
  }

  // Lost pets
  const lostPets = [
    ['Max', 'Caniche', 'Condesa, CDMX', 'Hace 3 horas', 'Caniche marrón con collar azul.', 'https://lh3.googleusercontent.com/aida-public/AB6AXuC-k9w6B6Agvn_GokB1U2lWlx4lNH10Zvt2mxH8thMIsFAFxcgFi1NC8ysn-mSXcofvYGZz7CUpBN_xpa5X3ciWX2Tp7PRHdgbeUjukYoDx-W1VCIGwY34YNgi6bd6Pgq4zTHpcUoUoSN564PExxlwC0MF28KjySeK30uxy8SiY3qMBd0xDr8sKmm1qwNKuqcTAIkUUcd0eBa-djzsfO8rB3DW7Wc5F_R6298bCqmr9kowk61yQdXHyY8zuD_FIyvaTFfQ7kKxQzNQ6', 'Urgente', '19.412', '-99.172', ''],
    ['Baily', 'Golden Retriever', 'Sunset District, SF', 'Hace 2 horas', 'Golden Retriever macho.', 'https://lh3.googleusercontent.com/aida-public/AB6AXuABclrM0v1AEvpRpDqmx-u2ZPckcu9yR3yGeG1UFaNRbkq3DYo5x5e7y3HD-d6RWK3rK7d-VQvuVtieP_w4R7NShxtPCnTjeAd2mYuWL5RnT3baGp4qVA0SEgf9AmOmVen0hAoD_jdtNjSMfFzaVB4PTR79-weR2CzF_ClAV4PLh0RkbqZ3F2driQSpW4fllRQ5gm9FK03VESR9H9lyTjEo3f19rO5zaxA_BWI7zMM3nCB9J7QpNqM0sJtO5JEHP7lfR7hOmmV3gnzp', 'Urgente', '37.755', '-122.485', 'https://lh3.googleusercontent.com/aida-public/AB6AXuCVSBg-0VtLV-8_NqhcttgfYlMVlGLRDIvgGAOFQ0a5nUvg7FZyRL7rOxZBKVOV-2bWviVJGott1qxqPkRC_3IB6TQjqsquHNGuWjwzn4bp0YoRPA8_j191QNNHC4JQmcePxIfiXwRmoI97fFXAwvOMrFuZe4wFIOVpT3iu05JydVHLhm4uRi0xo5J_6qhU5nYPU5DIIG_obQxSUFrL8HU5uoqNiodOdH-RGifD0AJmlIZvOmgla5_CcOyfaEt7q3C_NFJXL-JzcZR1'],
    ['Mimi', 'Gato Tuxedo', 'Roma Norte, CDMX', 'Hace 5 horas', 'Gato blanco y negro.', 'https://lh3.googleusercontent.com/aida-public/AB6AXuC3Z5m13yXVd_P4vYD5HCw97JhKIEzNCVBO3vLyFLwL8ycsSMivv8Y8n_FD4wG2YlW9k6qVvGjGHft4EfmNTQYgZwi7L5BlkLhbDb1jqILj4x9IDaPSGr7s3-vMKAkP-hKS8grZOHuDWDSB37UH0sXObHDlnXW8yZMnyWq4E7wS2BLNdILDkFdRw_ErdJmKP9JSSYwvHaH5TvYGi_3mJeVXHEf70BwVQIyMTj1iCltDiQomVEi0_V4ZxVR5CAmGO2WCnqu-w9IiGDvn', null, '19.420', '-99.160', 'https://lh3.googleusercontent.com/aida-public/AB6AXuADQl-viIHOCIwZevFt3Vj3rIypfkBWjVLS530HSmfjJoLmPd4UGHM3WkwmUwXtkT-lUKEDXSjjfplwcLpjAbKpR1R4ZjB8eg5hKOVslp9EFV7LyjQhIjL3WukH0aCPNh0V0NiiRuW41yr3IpkJneo5kRRMLED3979JqcuI_92hrALU4mYYWknUnsxiFekxEFnS3vlVCTBBMmOoOYnPHd0q3V1ykRIlE84zqujccGUhImuMJB14blGQJoOK4-moZ3_2p1lvOTkb8t3s'],
    ['Toby', 'Beagle Cachorro', 'Polanco, CDMX', 'Hace 1 día', 'Cachorro beagle con microchip.', 'https://lh3.googleusercontent.com/aida-public/AB6AXuCasEOsRQxvZrY-Gkx88qU4EzuBdh-SXPSR57LZbkQMwV2hvTaHXkTqx7hTpsv3_U5cIkagNqrRiPHzzF83fKTKOPTv9dEHA477TnZd44vm5unFu-d2gEd4-pqTjnMQgWW8s9eLY-6lRmmYC3EqOpL6vLnuKZCPQlIQWXzqz6_BxTlRbH0mvXh0DNzCSkGGPkFmIYbNXVBDr-T7rjCyEndJcOaV97EM_I1LzG6M5bxbghRyXOAUj933TbkKtfPZLLHVlFbDNmZsewl0', null, '19.433', '-99.195', '']
  ];
  for (const lp of lostPets) {
    db.run('INSERT INTO lost_pets (name,breed,location,last_seen,description,image_url,badge,marker_top,marker_left,marker_image) VALUES (?,?,?,?,?,?,?,?,?,?)', lp);
  }

  // Posts
  db.run("INSERT INTO posts (title,body,category,tags,user_id) VALUES (?,?,?,?,?)", ['¿Mejores parques en SF con áreas exclusivas para perros pequeños?', '¡Acabo de mudarme a Nob Hill con mi Yorkie de 2kg! Busco sugerencias de parques donde las secciones para perros pequeños estén bien cuidadas y sean seguras.', 'events', '["#SanFrancisco","#PerrosPequeños","#ParquesCaninos"]', 1]);
  db.run("INSERT INTO posts (title,body,category,tags,user_id) VALUES (?,?,?,?,?)", ['Consejos para cachorros: Manejando la ansiedad por separación', 'Mi mezcla de Labrador de 10 semanas empieza a llorar en cuanto salgo de la habitación. ¿Alguna experiencia con jaulas de entrenamiento o juguetes relajantes?', 'health', '["#EntrenamientoCachorros","#NuevoDueño"]', 2]);
  // Likes
  db.run('INSERT INTO post_likes (post_id, user_id) VALUES (?, ?)', [1, 2]);
  db.run('INSERT INTO post_likes (post_id, user_id) VALUES (?, ?)', [2, 1]);

  // Stories
  db.run("INSERT INTO stories (pet_name,author_name,title,body,image_url,badge,is_approved,user_id) VALUES (?,?,?,?,?,?,?,?)", ['Luna', 'Familia Miller', 'El Nuevo Viaje de Luna', 'Después de 400 días en el refugio, Luna finalmente encontró a su familia ideal con los Miller. Su transformación de una perrita callejera tímida a una compañera juguetona es nada menos que milagrosa...', 'https://lh3.googleusercontent.com/aida-public/AB6AXuB1lCw2wazjNlSAJL5l3K6uRU29AGXF888tnzcPVuq10TwjHjS1OcsD-qDFdjISl4X68wHQKg58ei811udJmHcHHFTvo6oHLiizaWx2Bkosy7-WzmeejC9bOc84WCKw8aUmEyKxfiLJCUqahva0WR0Uz887zI5V4MC2hsO1wj26R1N4cv8VD70AsvBSMCBtUxKf66QM8FEzSKnDIFKRzRwu_a4s1XRG_llbCh_OeEt6fRYzX_CEDSrBRNMee8DzL1DdsnRN_CkJ83Ev', 'Final Feliz', 1, 1]);
  db.run("INSERT INTO stories (pet_name,author_name,title,body,image_url,badge,is_approved,user_id) VALUES (?,?,?,?,?,?,?,?)", ['Oliver', 'Sarah Johnson', 'El Rincón de Oliver', 'Oliver fue ignorado durante meses debido a su timidez. Hoy, es el rey de un apartamento tranquilo en la ciudad, brindando consuelo infinito a su nueva dueña, Sarah...', 'https://lh3.googleusercontent.com/aida-public/AB6AXuBNQPvCPBbGYZk7QrXgZBLj1-wU3Lo9L1dfnb21H8csR-ctU99OE5YlYTCinXut4g61S-PwgBdr0rwVbsMERpaHiJqs8bExSHi-EQQchE_TU0iXs8P7jBAjQtOEAz3dB0VsXDqJS-QSVu6Cfo1EXoDYCAvjRzIxbkdI5mRXNQTsAwrtT_VQXZr4fmrVtqs7cOXuf-YyNAPgl1ZnaZCuRoZwZhWS71HF0LeHHl0uqp6AUe0NZzdC7hweNDcHh88-KoI4INqnZW0itdoM', 'Hogar Encontrado', 1, 1]);
  db.run("INSERT INTO stories (pet_name,author_name,title,body,image_url,badge,is_approved,user_id) VALUES (?,?,?,?,?,?,?,?)", ['Rex', 'Jake Thompson', 'El Dúo Dinámico', 'Rex era un perro de mucha energía que necesitaba un compañero activo. Cuando conoció al corredor de maratones Jake, fue una combinación perfecta.', 'https://lh3.googleusercontent.com/aida-public/AB6AXuDuGoE-BWBzvE8QNBMuspMFgNDfIHKdoXr_BiRoXvwL_uAHfXKe4hfs91yecHIdFx8UcOGHtlTPgBGBxNDbnQqk8MVQM9tuND02Ur7FTwHQhxkZVEhBAC-nWd09zSYTSEVq6q1zhlPxM2jmKPKTy1dlzLuJqGVHTV56CcbngjORm8Mlh30ajPCSqgLkiuR_qBz8rDWKXauw61AfkWa0Ov_ZT7BmjTYZihcJSQCEgmyZfHBKuR6kFDNxMBKCvbqHKzZzuIN0XiMdQZYR', 'Mejores Amigos', 1, 2]);

  // Carnet
  const vacc = JSON.stringify([
    { name: 'Rabia 3 Años', last_dose: '15 Nov, 2022', next_dose: '15 Nov, 2025', status: 'updated' },
    { name: 'DHPP (Distémper)', last_dose: '10 Ene, 2024', next_dose: '10 Ene, 2025', status: 'updated' },
    { name: 'Bordetella', last_dose: '20 Jul, 2023', next_dose: '15 May, 2024', status: 'expiring' }
  ]);
  const hist = JSON.stringify([
    { date: '10 ENE, 2024', title: 'Chequeo Anual', description: 'Peso: 12.4kg. Ritmo cardíaco saludable.' },
    { date: '02 AGO, 2023', title: 'Limpieza Dental', description: 'Limpieza profesional bajo sedación.' }
  ]);
  db.run('INSERT INTO carnets (pet_name,species,breed,gender,color_markings,microchip_id,image_url,qr_url,birth_date,vaccinations,medical_history,vet_name,vet_clinic,vet_phone,vet_image,owner_name,owner_city,user_id) VALUES (?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?)',
    ['Oliver', 'Canino (Perro)', 'Beagle', 'Macho', 'Tricolor - Blanco, Marrón, Negro', '9851 1234 5678 901',
    'https://lh3.googleusercontent.com/aida-public/AB6AXuDmLmgAVgL3cm5dZ0_L2trVGkeijajasPVvrKZCNVZZ9j4G7yqQItG5hwAMfJ81z38MIJn6sIaG7l9vtUNmZtezPmOSgbmhfgJPWbuiMhlG5xA8dYno4ZJLYb4D7i4noHp06ZJz8Gcir0mfBjOqoknRJjIv90iffNuRaJrAYelAIxRahW1Z1Hug3MbZWhkHdNaSN2Q8FoIY3W5UyPnXelfg_LlPYZxW7MitHIgXhbwduaS_jZQcfQRLlSwz0lj4DEepOhRGsDeyGlXw',
    'https://lh3.googleusercontent.com/aida-public/AB6AXuCYvp75MUKmbe5cJeib-gnYMmhe4NsUqfI5OH1UOBlWYPG1so15L4BvuFFdO8ySX11yQ9e30SbJ-Nw1IPpPR-URFjv76SdAYCQfzqVnH1urmo_qK41PFthYWMDFJn4AgsT8KomTT6l8uAi7J8th7dzsEYMngZWEEf_tn-mzOKJNE_DGwHMm6_2t8bhbkd6tuTu7XPBf-Vj5TmQy7aQs7EXRDqf_PepdN5aWvrB2uHbvLxKo8ey0LbRMgrITdP77OJgIB7mmuCACsnI2',
    '2021-10-12', vacc, hist, 'Dra. Elena Rodriguez', 'Clínica Paws & Whiskers', '(555) 0123-4567',
    'https://lh3.googleusercontent.com/aida-public/AB6AXuD9-8yD0lXLJ4TShMMm1aGrJ6J56X0sIc5-Ey26UnvDv1KGZrR8wCjFhVdedaDppy8txK16_NHXkp2rbSgX0jUE9kZq0gjQBTMJmQRHE-ITE_N59V7kOzDoHbcTx21RRlWB45Oc8qDfV09Jz6cfm15r3bcjIWEQ5xvwYAsuvkMlJKtE5aeAq39egznGh0U5uwPi4ABajLIRLZp3KmyHI6Ktz9g2CqcQGmHJSf3tNDNoUAwWe3qYlmnM4eCwr6MbifWKd9xGIyP359sU',
    'Sarah Johnson', 'San Francisco, CA', 1]);

  console.log('✅ Database seeded!');
}

module.exports = { initDatabase, queryAll, queryOne, runQuery, saveDatabase };

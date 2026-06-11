require('dotenv').config();
const { Pool } = require('pg');
const bcrypt = require('bcryptjs');
// Removed dns override to prevent Vercel ENOTFOUND

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: {
    rejectUnauthorized: false
  },
  max: 5,
  idleTimeoutMillis: 30000,
  connectionTimeoutMillis: 5000
});

let dbInitialized = false;

async function initDatabase() {
  if (dbInitialized) return pool;

  console.log('📦 Connecting to PostgreSQL...');

  // Create tables
  await pool.query(`
    CREATE TABLE IF NOT EXISTS users (
      id SERIAL PRIMARY KEY,
      name TEXT NOT NULL,
      email TEXT UNIQUE NOT NULL,
      password_hash TEXT NOT NULL,
      city TEXT DEFAULT '',
      avatar_url TEXT DEFAULT '',
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    )
  `);

  await pool.query(`
    CREATE TABLE IF NOT EXISTS pets (
      id SERIAL PRIMARY KEY,
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
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (user_id) REFERENCES users(id)
    )
  `);

  await pool.query(`
    CREATE TABLE IF NOT EXISTS lost_pets (
      id SERIAL PRIMARY KEY,
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
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (user_id) REFERENCES users(id)
    )
  `);

  await pool.query(`
    CREATE TABLE IF NOT EXISTS posts (
      id SERIAL PRIMARY KEY,
      title TEXT NOT NULL,
      body TEXT DEFAULT '',
      category TEXT DEFAULT 'tips',
      tags TEXT DEFAULT '[]',
      user_id INTEGER NOT NULL,
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (user_id) REFERENCES users(id)
    )
  `);

  await pool.query(`
    CREATE TABLE IF NOT EXISTS post_likes (
      id SERIAL PRIMARY KEY,
      post_id INTEGER NOT NULL,
      user_id INTEGER NOT NULL,
      UNIQUE(post_id, user_id),
      FOREIGN KEY (post_id) REFERENCES posts(id) ON DELETE CASCADE,
      FOREIGN KEY (user_id) REFERENCES users(id)
    )
  `);

  await pool.query(`
    CREATE TABLE IF NOT EXISTS post_comments (
      id SERIAL PRIMARY KEY,
      post_id INTEGER NOT NULL,
      user_id INTEGER NOT NULL,
      body TEXT NOT NULL,
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (post_id) REFERENCES posts(id) ON DELETE CASCADE,
      FOREIGN KEY (user_id) REFERENCES users(id)
    )
  `);

  await pool.query(`
    CREATE TABLE IF NOT EXISTS stories (
      id SERIAL PRIMARY KEY,
      pet_name TEXT NOT NULL,
      author_name TEXT DEFAULT '',
      title TEXT NOT NULL,
      body TEXT DEFAULT '',
      image_url TEXT DEFAULT '',
      badge TEXT DEFAULT '',
      is_approved INTEGER DEFAULT 0,
      user_id INTEGER,
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (user_id) REFERENCES users(id)
    )
  `);

  await pool.query(`
    CREATE TABLE IF NOT EXISTS favorites (
      id SERIAL PRIMARY KEY,
      user_id INTEGER NOT NULL,
      pet_id INTEGER NOT NULL,
      UNIQUE(user_id, pet_id),
      FOREIGN KEY (user_id) REFERENCES users(id),
      FOREIGN KEY (pet_id) REFERENCES pets(id) ON DELETE CASCADE
    )
  `);

  await pool.query(`
    CREATE TABLE IF NOT EXISTS carnets (
      id SERIAL PRIMARY KEY,
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
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (user_id) REFERENCES users(id)
    )
  `);

  await pool.query(`
    CREATE TABLE IF NOT EXISTS chats (
      id SERIAL PRIMARY KEY,
      pet_id INTEGER NOT NULL,
      adopter_id INTEGER NOT NULL,
      owner_id INTEGER NOT NULL,
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (pet_id) REFERENCES pets(id) ON DELETE CASCADE,
      FOREIGN KEY (adopter_id) REFERENCES users(id),
      FOREIGN KEY (owner_id) REFERENCES users(id)
    )
  `);

  await pool.query(`
    CREATE TABLE IF NOT EXISTS messages (
      id SERIAL PRIMARY KEY,
      chat_id INTEGER NOT NULL,
      sender_id INTEGER NOT NULL,
      body TEXT NOT NULL,
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (chat_id) REFERENCES chats(id) ON DELETE CASCADE,
      FOREIGN KEY (sender_id) REFERENCES users(id)
    )
  `);

  await pool.query(`
    CREATE TABLE IF NOT EXISTS notifications (
      id SERIAL PRIMARY KEY,
      user_id INTEGER NOT NULL,
      type TEXT NOT NULL,
      related_id INTEGER,
      text TEXT NOT NULL,
      is_read INTEGER DEFAULT 0,
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (user_id) REFERENCES users(id)
    )
  `);

  // Seed if empty
  const res = await pool.query('SELECT COUNT(*) as count FROM users');
  const count = parseInt(res.rows[0].count, 10);
  if (count === 0) {
    await seedDatabase();
  }

  // Ensure every demo user has a carnet
  try {
    const demoUsers = await queryAll("SELECT id, name, email FROM users WHERE email IN ('demo@patamatch.com', 'david@patamatch.com', 'sarah@patamatch.com')");
    for (const u of demoUsers) {
      const existing = await queryOne("SELECT COUNT(*) as count FROM carnets WHERE user_id = $1", [u.id]);
      if (existing && parseInt(existing.count, 10) === 0) {
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
          await runQuery('INSERT INTO carnets (pet_name,species,breed,gender,color_markings,microchip_id,image_url,qr_url,birth_date,vaccinations,medical_history,vet_name,vet_clinic,vet_phone,vet_image,owner_name,owner_city,user_id) VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,$12,$13,$14,$15,$16,$17,$18)',
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
          await runQuery('INSERT INTO carnets (pet_name,species,breed,gender,color_markings,microchip_id,image_url,qr_url,birth_date,vaccinations,medical_history,vet_name,vet_clinic,vet_phone,vet_image,owner_name,owner_city,user_id) VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,$12,$13,$14,$15,$16,$17,$18)',
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
    const existingComments = await queryOne("SELECT COUNT(*) as count FROM post_comments");
    if (!existingComments || parseInt(existingComments.count, 10) === 0) {
      console.log('🌱 Seeding initial comments...');
      await runQuery("INSERT INTO post_comments (post_id, user_id, body) VALUES ($1, $2, $3)", [1, 2, '¡El parque de Lafayette Park es buenísimo! Tiene un área especial cerrada para razas pequeñas y el césped está siempre impecable.']);
      await runQuery("INSERT INTO post_comments (post_id, user_id, body) VALUES ($1, $2, $3)", [1, 3, '¡Confirmo! Yo llevo a mi chihuahua ahí y le encanta. Además la vista es hermosa.']);
      await runQuery("INSERT INTO post_comments (post_id, user_id, body) VALUES ($1, $2, $3)", [2, 1, 'A nosotros nos sirvió mucho dejarle una prenda de ropa usada con nuestro olor en su camita. ¡Se calma muchísimo!']);
      await runQuery("INSERT INTO post_comments (post_id, user_id, body) VALUES ($1, $2, $3)", [2, 3, 'Intenta también los juguetes tipo Kong rellenos de crema de cacahuate congelada. Los mantiene ocupados por horas y asocian quedarse solos con algo positivo.']);
    }
  } catch (err) {
    console.error('Error seeding comments:', err);
  }

  dbInitialized = true;
  return pool;
}

// Transform SQL from ? to $1, $2, etc.
function transformSql(sql) {
  let idx = 1;
  return sql.replace(/\?/g, () => `$${idx++}`);
}

async function queryAll(sql, params = []) {
  const transformedSql = transformSql(sql);
  const result = await pool.query(transformedSql, params);
  return result.rows;
}

async function queryOne(sql, params = []) {
  const transformedSql = transformSql(sql);
  const result = await pool.query(transformedSql, params);
  return result.rows[0] || null;
}

async function runQuery(sql, params = []) {
  let transformedSql = transformSql(sql);
  const isInsert = transformedSql.trim().toUpperCase().startsWith('INSERT');
  
  if (isInsert && !transformedSql.toUpperCase().includes('RETURNING ID')) {
    transformedSql += ' RETURNING id';
  }

  const result = await pool.query(transformedSql, params);
  return {
    lastInsertRowid: (isInsert && result.rows[0]) ? result.rows[0].id : 0,
    changes: result.rowCount || 0
  };
}

async function seedDatabase() {
  console.log('🌱 Seeding database...');

  const hash = bcrypt.hashSync('demo123', 10);

  // Users
  await runQuery('INSERT INTO users (name, email, password_hash, city, avatar_url) VALUES ($1, $2, $3, $4, $5)', ['Sarah Miller', 'sarah@patamatch.com', hash, 'San Francisco, CA', 'https://lh3.googleusercontent.com/aida-public/AB6AXuB8Wm9pA1lUUib9HuVXuloRZ82CSu3bGco76b7dv6NYk3sqaAMrwG6_FKWvX7xDAeYrgyCdjGpDtY7gAjz8DBN1_PTvqTPL1brMiZEXpb0KIIO36B8Zx7i3ugxJdfZ2fck2t1Iirf0ItDcTFaFzoL5xhBZUDG5BPyl5QwNR0LOIGxJC0YHx2E4aBZG51vdPm-etERXmxttbGwr3LWT7kMq8QNrOczkkxAcaHcFmx-TkJ4HN7lS2zK28A1tvfWlT41ath_LrgFmBKEg-']);
  await runQuery('INSERT INTO users (name, email, password_hash, city, avatar_url) VALUES ($1, $2, $3, $4, $5)', ['David Chen', 'david@patamatch.com', hash, 'Austin, TX', 'https://lh3.googleusercontent.com/aida-public/AB6AXuAeG2S1vbkvQlmYX2rRCv1Ojgwa3cbXajbOu3xGfM1rHX-vxBnx65qG2UUfvO6tMRvaVtHrnBsmLkUNoRyUae8qyqfDdr85YeiTCs3sw0RBZAZwIxsIo9znaK07ZJxZTaBLK4_aScTdgBvN1yrNGVGvg6JimgCFoxQeowqTh0kEGNbNdXnyu_B_jg1V2y97Acu8Rbe6mx-c_1o5iAtgI6mc-rK0LeIb_CWKhl8kxPghVlrUAplS2Hyb5cOhu9Vb46aakq1yXTsWfCSW']);
  await runQuery('INSERT INTO users (name, email, password_hash, city) VALUES ($1, $2, $3, $4)', ['Demo User', 'demo@patamatch.com', hash, 'CDMX']);

  // Pets
  const pets = [
    ['Cooper', 'Perro', 'Beagle', '1.5 Años', 'Mediano', 'Portland, OR', 'https://lh3.googleusercontent.com/aida-public/AB6AXuB_Urbt_th9z3ubslV9NUcaButvsJn3bjqulHDYDdhPaIrB6ttoasAYcOCkYNaAgRk_1uw_eCT0UBQ7VhEo6_6F5u4XDGtNvbRAYmoovCN44BxXBEGL0_mh7acSIapTtu49wqf97h-QueKTf050pgjbBk6cHSKZ-Pumc5q78UeJUBF0UCfexcs_BfPbPdvXR2J1tr_jMbLIwm7v27aGlwFdsZwGPgViwZMK2KO6i04PRqBJTWKjhOjdHb-E5rppiGfIQC81qpEOpr84', 'Urgente', 'primary', 'Beagle cariñoso, necesita hogar con jardín.', 0, ''],
    ['Luna', 'Gato', 'Siamés', '3 Años', 'Pequeño', 'Seattle, WA', 'https://lh3.googleusercontent.com/aida-public/AB6AXuBI-QvpmYEchC8otadqV01ZDAEzyhbBcdg6wltHQrUukknU_rmUxArM-wSTj7uiZM2iJ2_-Ipb1kQnDT6dy7ZCYPEaLi0MNznbu9HBkIAP99irRKQYng6rcXZ5RB5KUuLdhX99OLOIjRp7O1Z-3I6yvM4naSX7dcgiP13VLiN18J0qkOOChiCninV2DZdA-DCZaihsfjlNYlMEn-uBBcyc98YTCb3Z4AhjFgQaM4FqPQZllTxrQu_hlJ-4pSH_1taBDcNM1ktmBmyBt', null, null, 'Tranquila e independiente, perfecta para apartamentos.', 0, ''],
    ['Buddy', 'Perro', 'Golden Retriever', '4 Años', 'Grande', 'Austin, TX', 'https://lh3.googleusercontent.com/aida-public/AB6AXuAEx9z4sDgwlES6LhT2atZDYSpIdFU6jBHF8_JmDCJatBF8rO0sQQJLSDG8gZRmLBnISn4f2nR71iNTTZpV-N2qRjCcWF_tJtMh0IqkixPiL_BbAxqj5Y0AosAx6Ry8IxECZNlrLIO61hjIkq96CT2Iw0Oo5Ga1Qd-hWxEJAqvZZtG7u6dRx8sfKmCiag_gZLQD-TFjIQPDqw_1o-Y44gpi5GzvdgAFwmtboSZb7pNx9dFtTWkyg4pHTs8zJjforTlxWwgxyVct-rrG', null, null, 'Súper social, ama a los niños.', 0, ''],
    ['Milo', 'Perro', 'Corgi', '6 Meses', 'Pequeño', 'Denver, CO', 'https://lh3.googleusercontent.com/aida-public/AB6AXuCARRdvsssJGKMQol3bN9xYVJ2HpHbSU1zcdk7DsWgo47LijqEjFTuDnq6dvcSbCEByZYi_gIVZnufn33klKbGiw9wTUy9sQFZDh5M2ESkxc-bjXVyodZlhFY-YSbcxIFTzetEmfERILz1kWgb0sPz_Vc7MHyTH7Og_wYzRZF5uQKwtcngulZ-kvj2hSuqjX6Yyd4dZF_1oGcMri3kOLrXXXqdsTH6xFW6H5ud30WnxOo8y0-O7SjFIrU4Yq5VFBtnPu9AxE9NHxNg4', 'Recién Llegado', 'secondary', 'Cachorro corgi lleno de energía.', 0, '']
  ];
  const adopted = [
    ['Roco', 'Perro', 'Mestizo', '3 Años', 'Mediano', 'CDMX', 'https://lh3.googleusercontent.com/aida-public/AB6AXuAqRVeJibbG96lgappUgGzzKVBxaIZMuwQ7tR9vJcbOy1e_oVM4Iju4yyCRbmk-FIzuKF_2My7bndSa5sEMlJwx5fsFnn_vNjo6qYayqBuNrgyKpjkVyZ6nm3RFzCj6k_c2rt25_BW_fLSIwYWsO8ZDqJ-mCjLCGNiGzr-3CBpgIBy3vS787-JyJkGBJfy5sy-b3Zf8YPvP8vv_I_oE222fwubJMC25aC4T_ly6DOZlPfew2z-VKyDrZwoLI79oapCdmT8f6AvDaN4y', null, null, '', 1, '"Roco se convirtió en la alegría de nuestra casa..."'],
    ['Bruno', 'Perro', 'Golden Retriever', '5 Años', 'Grande', 'Monterrey', 'https://lh3.googleusercontent.com/aida-public/AB6AXuBYa11je97rmo9k-S5EbarYu2DOMbA0c-NsoNGy_zroBCUw1F_ruJgrRtvWVttZLRAtBdZO0_oGkHGLuRkZYvIWwWgYSu7wwWHLGbbb0Ncm9PG6GfCcIP3hr_VPHsBC5FmzmtNhhxqr2Vwj3VXwWzDZ8EhvloVah9f7zxpyQaPThNCiSyfvoXgNvwjJNz6XERiMqqtIA_a-OdzXG50GTISsYNmxu8M_MCVWJ8199ZvYsZAxG4aY4w7bGQejjwD8yww81LLsKV_MC23g', null, null, '', 1, '"Bruno nos motiva a salir y disfrutar la naturaleza todos los días."']
  ];

  const allPets = [...pets, ...adopted];
  for (const p of allPets) {
    p.push(1);
    await runQuery('INSERT INTO pets (name,species,breed,age,size,location,image_url,badge,badge_color,description,is_adopted,adopted_quote,user_id) VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,$12,$13)', p);
  }

  // Lost pets
  const lostPets = [
    ['Max', 'Caniche', 'Condesa, CDMX', 'Hace 3 horas', 'Caniche marrón con collar azul.', 'https://lh3.googleusercontent.com/aida-public/AB6AXuC-k9w6B6Agvn_GokB1U2lWlx4lNH10Zvt2mxH8thMIsFAFxcgFi1NC8ysn-mSXcofvYGZz7CUpBN_xpa5X3ciWX2Tp7PRHdgbeUjukYoDx-W1VCIGwY34YNgi6bd6Pgq4zTHpcUoUoSN564PExxlwC0MF28KjySeK30uxy8SiY3qMBd0xDr8sKmm1qwNKuqcTAIkUUcd0eBa-djzsfO8rB3DW7Wc5F_R6298bCqmr9kowk61yQdXHyY8zuD_FIyvaTFfQ7kKxQzNQ6', 'Urgente', '19.412', '-99.172', ''],
    ['Baily', 'Golden Retriever', 'Sunset District, SF', 'Hace 2 horas', 'Golden Retriever macho.', 'https://lh3.googleusercontent.com/aida-public/AB6AXuABclrM0v1AEvpRpDqmx-u2ZPckcu9yR3yGeG1UFaNRbkq3DYo5x5e7y3HD-d6RWK3rK7d-VQvuVtieP_w4R7NShxtPCnTjeAd2mYuWL5RnT3baGp4qVA0SEgf9AmOmVen0hAoD_jdtNjSMfFzaVB4PTR79-weR2CzF_ClAV4PLh0RkbqZ3F2driQSpW4fllRQ5gm9FK03VESR9H9lyTjEo3f19rO5zaxA_BWI7zMM3nCB9J7QpNqM0sJtO5JEHP7lfR7hOmmV3gnzp', 'Urgente', '37.755', '-122.485', 'https://lh3.googleusercontent.com/aida-public/AB6AXuCVSBg-0VtLV-8_NqhcttgfYlMVlGLRDIvgGAOFQ0a5nUvg7FZyRL7rOxZBKVOV-2bWviVJGott1qxqPkRC_3IB6TQjqsquHNGuWjwzn4bp0YoRPA8_j191QNNHC4JQmcePxIfiXwRmoI97fFXAwvOMrFuZe4wFIOVpT3iu05JydVHLhm4uRi0xo5J_6qhU5nYPU5DIIG_obQxSUFrL8HU5uoqNiodOdH-RGifD0AJmlIZvOmgla5_CcOyfaEt7q3C_NFJXL-JzcZR1']
  ];
  for (const lp of lostPets) {
    await runQuery('INSERT INTO lost_pets (name,breed,location,last_seen,description,image_url,badge,marker_top,marker_left,marker_image) VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10)', lp);
  }

  // Posts
  await runQuery("INSERT INTO posts (title,body,category,tags,user_id) VALUES ($1,$2,$3,$4,$5)", ['¿Mejores parques en SF con áreas exclusivas para perros pequeños?', '¡Acabo de mudarme a Nob Hill con mi Yorkie de 2kg! Busco sugerencias de parques donde las secciones para perros pequeños estén bien cuidadas y sean seguras.', 'events', '["#SanFrancisco","#PerrosPequeños","#ParquesCaninos"]', 1]);
  await runQuery("INSERT INTO posts (title,body,category,tags,user_id) VALUES ($1,$2,$3,$4,$5)", ['Consejos para cachorros: Manejando la ansiedad por separación', 'Mi mezcla de Labrador de 10 semanas empieza a llorar en cuanto salgo de la habitación.', 'health', '["#EntrenamientoCachorros","#NuevoDueño"]', 2]);
  
  // Likes
  await runQuery('INSERT INTO post_likes (post_id, user_id) VALUES ($1, $2)', [1, 2]);
  await runQuery('INSERT INTO post_likes (post_id, user_id) VALUES ($1, $2)', [2, 1]);

  // Stories
  await runQuery("INSERT INTO stories (pet_name,author_name,title,body,image_url,badge,is_approved,user_id) VALUES ($1,$2,$3,$4,$5,$6,$7,$8)", ['Luna', 'Familia Miller', 'El Nuevo Viaje de Luna', 'Después de 400 días en el refugio, Luna finalmente encontró a su familia ideal.', 'https://lh3.googleusercontent.com/aida-public/AB6AXuB1lCw2wazjNlSAJL5l3K6uRU29AGXF888tnzcPVuq10TwjHjS1OcsD-qDFdjISl4X68wHQKg58ei811udJmHcHHFTvo6oHLiizaWx2Bkosy7-WzmeejC9bOc84WCKw8aUmEyKxfiLJCUqahva0WR0Uz887zI5V4MC2hsO1wj26R1N4cv8VD70AsvBSMCBtUxKf66QM8FEzSKnDIFKRzRwu_a4s1XRG_llbCh_OeEt6fRYzX_CEDSrBRNMee8DzL1DdsnRN_CkJ83Ev', 'Final Feliz', 1, 1]);

  console.log('✅ Database seeded!');
}

function saveDatabase() {
  // Not needed for Postgres
}

module.exports = { initDatabase, queryAll, queryOne, runQuery, saveDatabase };

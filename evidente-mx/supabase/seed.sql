-- =============================================
-- EVIDENTE.MX - Datos de Prueba (Seed)
-- Artículos y Reels con contenido realista
-- =============================================

-- =============================================
-- ARTÍCULOS - CATEGORÍA: DESTACADAS
-- =============================================

INSERT INTO articles (title, slug, summary, content, image_url, category, is_published, published_at, views_count) VALUES

-- Destacada 1 - Principal
(
    'México firma histórico acuerdo comercial con la Unión Europea que impulsará exportaciones',
    'mexico-firma-historico-acuerdo-comercial-union-europea',
    'El tratado bilateral promete incrementar el intercambio comercial en un 40% durante los próximos cinco años, beneficiando principalmente al sector agrícola y automotriz.',
    '<p>En una ceremonia celebrada en Bruselas, representantes de México y la Unión Europea firmaron un acuerdo comercial que marca un hito en las relaciones económicas entre ambas regiones.</p>
    <p>El tratado, que entrará en vigor el próximo año, contempla la eliminación gradual de aranceles en más de 2,000 productos, con especial énfasis en el sector agrícola mexicano y la industria automotriz europea.</p>
    <h2>Beneficios para México</h2>
    <p>Según analistas económicos, este acuerdo posicionará a México como uno de los principales socios comerciales de Europa en América Latina, superando incluso a Brasil en ciertos sectores.</p>
    <p>El secretario de Economía destacó que "este acuerdo representa una oportunidad única para diversificar nuestras exportaciones y reducir la dependencia del mercado estadounidense".</p>
    <h2>Sectores beneficiados</h2>
    <ul>
    <li>Aguacate y berries mexicanos tendrán acceso preferencial</li>
    <li>Tequila y mezcal con denominación de origen protegida</li>
    <li>Autopartes con reducción arancelaria del 15%</li>
    </ul>',
    'https://images.unsplash.com/photo-1551836022-d5d88e9218df?w=1200&h=800&fit=crop',
    'Destacadas',
    true,
    NOW() - INTERVAL '2 hours',
    1542
),

-- Destacada 2
(
    'Científicos mexicanos desarrollan vacuna contra el dengue con 95% de efectividad',
    'cientificos-mexicanos-vacuna-dengue-95-efectividad',
    'El Instituto de Biotecnología de la UNAM logra un avance sin precedentes que podría salvar miles de vidas en regiones tropicales del país.',
    '<p>Un equipo de investigadores del Instituto de Biotecnología de la UNAM ha desarrollado una vacuna contra el dengue que muestra una efectividad del 95% en ensayos clínicos de fase 3.</p>
    <p>El descubrimiento, publicado en la revista Nature Medicine, representa un avance significativo en la lucha contra esta enfermedad que afecta a millones de personas en México cada año.</p>
    <h2>Detalles del estudio</h2>
    <p>Los ensayos clínicos se realizaron con más de 15,000 voluntarios en estados como Veracruz, Guerrero y Yucatán, donde el dengue es endémico.</p>
    <p>"Estamos ante un logro histórico para la ciencia mexicana", declaró la Dra. María González, líder del proyecto.</p>',
    'https://images.unsplash.com/photo-1584036561566-baf8f5f1b144?w=1200&h=800&fit=crop',
    'Destacadas',
    true,
    NOW() - INTERVAL '5 hours',
    2341
),

-- Destacada 3
(
    'Reforma educativa 2026: Así cambiará el sistema escolar en México',
    'reforma-educativa-2026-cambios-sistema-escolar-mexico',
    'El nuevo modelo educativo incluye programación desde primaria, educación financiera obligatoria y reducción de la carga de tareas en casa.',
    '<p>La Secretaría de Educación Pública presentó los lineamientos de la reforma educativa que transformará el sistema escolar mexicano a partir del ciclo 2026-2027.</p>
    <p>Entre los cambios más significativos se encuentra la inclusión de programación y pensamiento computacional como materia obligatoria desde tercer grado de primaria.</p>
    <h2>Principales cambios</h2>
    <ul>
    <li>Programación básica desde 3° de primaria</li>
    <li>Educación financiera en secundaria</li>
    <li>Reducción del 50% en tareas para casa</li>
    <li>Evaluación por proyectos en lugar de exámenes tradicionales</li>
    </ul>
    <p>La reforma ha generado opiniones divididas entre padres de familia y docentes.</p>',
    'https://images.unsplash.com/photo-1503676260728-1c00da094a0b?w=1200&h=800&fit=crop',
    'Destacadas',
    true,
    NOW() - INTERVAL '8 hours',
    1876
);

-- =============================================
-- ARTÍCULOS - CATEGORÍA: NOTICIAS
-- =============================================

INSERT INTO articles (title, slug, summary, content, image_url, category, is_published, published_at, views_count) VALUES

(
    'Metro CDMX estrena 20 trenes nuevos fabricados en México',
    'metro-cdmx-estrena-20-trenes-nuevos-fabricados-mexico',
    'Los nuevos vagones cuentan con aire acondicionado, WiFi gratuito y sistema de accesibilidad universal, mejorando la experiencia de 5 millones de usuarios diarios.',
    '<p>El Sistema de Transporte Colectivo Metro de la Ciudad de México presentó oficialmente los primeros 20 trenes de manufactura nacional que circularán por las líneas más saturadas.</p>
    <p>Los vagones, fabricados en Querétaro por la empresa CAF México, incorporan tecnología de punta que incluye aire acondicionado de alta eficiencia, conectividad WiFi y rampas automáticas para personas con discapacidad.</p>
    <h2>Inversión histórica</h2>
    <p>El proyecto representó una inversión de 8,500 millones de pesos y generó más de 2,000 empleos directos durante su fabricación.</p>',
    'https://images.unsplash.com/photo-1544620347-c4fd4a3d5957?w=1200&h=800&fit=crop',
    'Noticias',
    true,
    NOW() - INTERVAL '3 hours',
    923
),

(
    'Precio del aguacate alcanza mínimo histórico por sobreproducción',
    'precio-aguacate-minimo-historico-sobreproduccion',
    'Productores de Michoacán reportan pérdidas millonarias mientras consumidores celebran precios de hasta 15 pesos por kilo en mercados locales.',
    '<p>El precio del aguacate Hass ha caído a niveles no vistos desde 2018, alcanzando los 15 pesos por kilogramo en mercados de abasto, una reducción del 70% respecto al año anterior.</p>
    <p>La sobreproducción, combinada con restricciones de exportación a Estados Unidos, ha provocado un excedente que impacta directamente a los productores michoacanos.</p>
    <h2>Crisis en el campo</h2>
    <p>Agricultores de Uruapan y Tancítaro advierten que de continuar esta tendencia, muchos se verán obligados a abandonar el cultivo.</p>',
    'https://images.unsplash.com/photo-1523049673857-eb18f1d7b578?w=1200&h=800&fit=crop',
    'Noticias',
    true,
    NOW() - INTERVAL '6 hours',
    1245
),

(
    'Apagón masivo afecta a 3 millones de usuarios en el norte del país',
    'apagon-masivo-3-millones-usuarios-norte-mexico',
    'CFE trabaja para restablecer el servicio tras falla en línea de transmisión; se esperan cortes intermitentes durante las próximas 24 horas.',
    '<p>Un apagón masivo dejó sin electricidad a más de 3 millones de usuarios en los estados de Nuevo León, Coahuila y Tamaulipas durante la madrugada de hoy.</p>
    <p>La Comisión Federal de Electricidad informó que la falla se originó en una línea de transmisión de 400 kV que conecta con la red de Texas.</p>
    <h2>Afectaciones</h2>
    <p>Hospitales operaron con plantas de emergencia, mientras que el aeropuerto de Monterrey suspendió operaciones durante dos horas.</p>',
    'https://images.unsplash.com/photo-1473341304170-971dccb5ac1e?w=1200&h=800&fit=crop',
    'Noticias',
    true,
    NOW() - INTERVAL '10 hours',
    2156
),

(
    'Nuevo iPhone 18 llega a México con precio récord de 45 mil pesos',
    'nuevo-iphone-18-mexico-precio-record-45-mil',
    'Apple presenta su dispositivo más avanzado con inteligencia artificial integrada; preventa agotada en menos de una hora.',
    '<p>Apple lanzó oficialmente en México el iPhone 18 Pro Max, su smartphone más avanzado hasta la fecha, con un precio inicial de 44,999 pesos que lo convierte en el teléfono más caro vendido en el país.</p>
    <p>El dispositivo incorpora un chip neural de última generación que permite funciones de IA directamente en el dispositivo sin necesidad de conexión a internet.</p>',
    'https://images.unsplash.com/photo-1592750475338-74b7b21085ab?w=1200&h=800&fit=crop',
    'Noticias',
    true,
    NOW() - INTERVAL '12 hours',
    3421
),

(
    'Congreso aprueba ley que prohíbe plásticos de un solo uso en todo México',
    'congreso-aprueba-ley-prohibe-plasticos-un-solo-uso',
    'A partir de 2027, será ilegal la venta de popotes, cubiertos y contenedores de unicel; negocios tendrán 18 meses para adaptarse.',
    '<p>Con 387 votos a favor, la Cámara de Diputados aprobó la Ley General para la Reducción de Plásticos que prohíbe la fabricación, importación y comercialización de plásticos de un solo uso en territorio nacional.</p>
    <p>La medida, que entrará en vigor en enero de 2027, convierte a México en el país latinoamericano con la legislación ambiental más estricta en esta materia.</p>',
    'https://images.unsplash.com/photo-1605600659453-03d10258f11d?w=1200&h=800&fit=crop',
    'Noticias',
    true,
    NOW() - INTERVAL '15 hours',
    1678
);

-- =============================================
-- ARTÍCULOS - CATEGORÍA: DEPORTES
-- =============================================

INSERT INTO articles (title, slug, summary, content, image_url, category, is_published, published_at, views_count) VALUES

(
    'Selección Mexicana clasifica al Mundial 2026 como líder de CONCACAF',
    'seleccion-mexicana-clasifica-mundial-2026-lider-concacaf',
    'Con victoria 3-1 sobre Canadá, el Tri asegura su lugar en la Copa del Mundo que se celebrará en casa; Santi Giménez anota doblete histórico.',
    '<p>La Selección Mexicana de Fútbol certificó su clasificación al Mundial 2026 con una contundente victoria 3-1 sobre Canadá en el Estadio Azteca.</p>
    <p>Santiago Giménez, el goleador del Feyenoord, anotó dos tantos espectaculares que lo colocan como máximo anotador de las eliminatorias con 12 goles.</p>
    <h2>Fiesta mexicana</h2>
    <p>Más de 85,000 aficionados celebraron en el Coloso de Santa Úrsula lo que representa la decimoctava participación de México en una Copa del Mundo.</p>
    <p>"Este es solo el primer paso, queremos hacer historia en nuestra casa", declaró el técnico Jaime Lozano tras el partido.</p>',
    'https://images.unsplash.com/photo-1574629810360-7efbbe195018?w=1200&h=800&fit=crop',
    'Deportes',
    true,
    NOW() - INTERVAL '4 hours',
    4532
),

(
    'Canelo Álvarez anuncia pelea contra Bivol II para septiembre en Las Vegas',
    'canelo-alvarez-pelea-bivol-ii-septiembre-las-vegas',
    'El boxeador mexicano buscará la revancha contra el único peleador que lo ha vencido en la última década; bolsa garantizada de 100 millones de dólares.',
    '<p>Saúl "Canelo" Álvarez confirmó que enfrentará nuevamente a Dmitry Bivol el próximo 14 de septiembre en la T-Mobile Arena de Las Vegas, en lo que promete ser la pelea del año.</p>
    <p>El mexicano, quien perdió por decisión unánime en su primer enfrentamiento en 2022, ha modificado su preparación incorporando técnicas de boxeo ruso.</p>
    <h2>La revancha más esperada</h2>
    <p>"He trabajado cuatro años para este momento. Voy a demostrar que soy el mejor libra por libra del mundo", afirmó Canelo en conferencia de prensa.</p>',
    'https://images.unsplash.com/photo-1549719386-74dfcbf7dbed?w=1200&h=800&fit=crop',
    'Deportes',
    true,
    NOW() - INTERVAL '7 hours',
    3876
),

(
    'América se corona campeón del Clausura 2026 con gol de último minuto',
    'america-campeon-clausura-2026-gol-ultimo-minuto',
    'Las Águilas derrotan a Tigres en final épica; Henry Martín anota al 90+3 para darle el título 16 a los azulcremas.',
    '<p>El Club América conquistó su título número 16 de Liga MX al derrotar 2-1 a Tigres en una final dramática decidida en tiempo de compensación.</p>
    <p>Henry Martín, a sus 33 años, se convirtió en héroe al anotar de cabeza el gol del campeonato cuando el reloj marcaba el minuto 93.</p>
    <h2>Celebración histórica</h2>
    <p>Miles de aficionados azulcremas tomaron el Ángel de la Independencia para celebrar el título que coloca al América a solo dos campeonatos de igualar a Chivas como el más ganador.</p>',
    'https://images.unsplash.com/photo-1431324155629-1a6deb1dec8d?w=1200&h=800&fit=crop',
    'Deportes',
    true,
    NOW() - INTERVAL '1 day',
    5234
),

(
    'Tenista mexicano alcanza por primera vez el Top 10 mundial de la ATP',
    'tenista-mexicano-top-10-mundial-atp',
    'A sus 22 años, se convierte en el primer mexicano en la historia en alcanzar esta posición; celebra tras victoria en Masters de Miami.',
    '<p>En un logro sin precedentes para el tenis mexicano, el joven jugador de 22 años ascendió a la posición número 9 del ranking ATP tras conquistar el Masters 1000 de Miami.</p>
    <p>El sinaloense derrotó en la final al número 3 del mundo en sets corridos, confirmando su ascenso meteórico en el circuito profesional.</p>
    <h2>Orgullo nacional</h2>
    <p>"Dedico este triunfo a todos los niños mexicanos que sueñan con el tenis. Sí se puede", declaró entre lágrimas tras levantar el trofeo.</p>',
    'https://images.unsplash.com/photo-1554068865-24cecd4e34b8?w=1200&h=800&fit=crop',
    'Deportes',
    true,
    NOW() - INTERVAL '2 days',
    2987
),

(
    'F1 confirma Gran Premio de México hasta 2030 con nuevo circuito',
    'f1-gran-premio-mexico-2030-nuevo-circuito',
    'La Fórmula 1 extiende contrato y anuncia construcción de autódromo de última generación en Querétaro para 2029.',
    '<p>Liberty Media y el gobierno mexicano anunciaron la extensión del contrato del Gran Premio de México hasta 2030, además de revelar planes para un nuevo circuito en el estado de Querétaro.</p>
    <p>El Autódromo Hermanos Rodríguez continuará albergando la carrera hasta 2028, año en que se inaugurará el nuevo complejo con capacidad para 150,000 espectadores.</p>',
    'https://images.unsplash.com/photo-1504707748692-419802cf939d?w=1200&h=800&fit=crop',
    'Deportes',
    true,
    NOW() - INTERVAL '3 days',
    1543
);

-- =============================================
-- ARTÍCULOS - CATEGORÍA: TURISMO
-- =============================================

INSERT INTO articles (title, slug, summary, content, image_url, category, is_published, published_at, views_count) VALUES

(
    'Tulum inaugura el aeropuerto internacional más sustentable de América',
    'tulum-inaugura-aeropuerto-internacional-sustentable',
    'El nuevo Felipe Carrillo Puerto opera 100% con energía solar y recibe sus primeros vuelos internacionales desde Europa y Estados Unidos.',
    '<p>El Aeropuerto Internacional de Tulum "Felipe Carrillo Puerto" abrió oficialmente sus puertas, convirtiéndose en el primer aeropuerto de América Latina en operar completamente con energía renovable.</p>
    <p>La terminal, diseñada por arquitectos mexicanos, integra elementos de la cultura maya con tecnología de punta, incluyendo jardines verticales que purifican el aire y sistemas de captación de agua pluvial.</p>
    <h2>Conexiones internacionales</h2>
    <p>El aeropuerto ya cuenta con vuelos directos desde Madrid, París, Nueva York, Los Ángeles y Toronto, facilitando el acceso a la Riviera Maya.</p>',
    'https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=1200&h=800&fit=crop',
    'Turismo',
    true,
    NOW() - INTERVAL '5 hours',
    2134
),

(
    'Oaxaca es nombrada "Mejor Destino Cultural del Mundo" por Lonely Planet',
    'oaxaca-mejor-destino-cultural-mundo-lonely-planet',
    'La guía de viajes más influyente reconoce la riqueza gastronómica, artesanal y arqueológica del estado; se espera incremento del 40% en turismo.',
    '<p>La prestigiosa editorial de viajes Lonely Planet ha coronado a Oaxaca como el "Mejor Destino Cultural del Mundo 2026", destacando su extraordinaria gastronomía, tradiciones vivas y patrimonio arqueológico.</p>
    <p>El reconocimiento llega tras años de trabajo en preservación cultural y turismo sostenible que han convertido al estado en referente mundial.</p>
    <h2>Atractivos destacados</h2>
    <ul>
    <li>Monte Albán y Mitla como joyas arqueológicas</li>
    <li>Mezcal artesanal con denominación de origen</li>
    <li>Mercados tradicionales y cocina zapoteca</li>
    <li>Textiles y alebrijes reconocidos por UNESCO</li>
    </ul>',
    'https://images.unsplash.com/photo-1518105779142-d975f22f1b0a?w=1200&h=800&fit=crop',
    'Turismo',
    true,
    NOW() - INTERVAL '9 hours',
    1876
),

(
    'Tren Maya supera 10 millones de pasajeros en su primer año de operación',
    'tren-maya-10-millones-pasajeros-primer-ano',
    'El proyecto de infraestructura más ambicioso de México conecta ya 8 destinos turísticos y genera más de 50,000 empleos directos.',
    '<p>El Tren Maya celebra su primer aniversario de operaciones con cifras que superan todas las expectativas: más de 10 millones de pasajeros han viajado por sus 1,500 kilómetros de vías.</p>
    <p>La ruta más popular, Cancún-Tulum-Bacalar, transporta diariamente a más de 15,000 turistas nacionales e internacionales.</p>
    <h2>Impacto económico</h2>
    <p>Comunidades mayas reportan incrementos de hasta 300% en sus ingresos por turismo comunitario y venta de artesanías en las estaciones.</p>',
    'https://images.unsplash.com/photo-1544620347-c4fd4a3d5957?w=1200&h=800&fit=crop',
    'Turismo',
    true,
    NOW() - INTERVAL '1 day',
    3245
),

(
    'San Miguel de Allende celebra 10 años como "Mejor Ciudad del Mundo"',
    'san-miguel-allende-10-anos-mejor-ciudad-mundo',
    'La joya colonial de Guanajuato mantiene su corona y anuncia festival internacional de arte y cultura para conmemorar la década.',
    '<p>San Miguel de Allende cumple una década siendo reconocida como la "Mejor Ciudad del Mundo" por lectores de Travel + Leisure, un récord sin precedentes en la historia del turismo global.</p>
    <p>Para celebrar, el gobierno municipal ha organizado un festival de un mes que incluirá exposiciones de arte, conciertos y la mayor muestra de gastronomía guanajuatense.</p>
    <h2>Secreto de su éxito</h2>
    <p>"San Miguel ha sabido preservar su esencia colonial mientras se adapta a las necesidades del viajero moderno", explica el alcalde.</p>',
    'https://images.unsplash.com/photo-1585975754487-acc2dfa99476?w=1200&h=800&fit=crop',
    'Turismo',
    true,
    NOW() - INTERVAL '2 days',
    1654
),

(
    'Baja California Sur rompe récord de avistamiento de ballenas esta temporada',
    'baja-california-sur-record-avistamiento-ballenas',
    'Más de 3,000 ballenas grises han sido registradas en las lagunas de Guerrero Negro y San Ignacio; temporada extendida hasta abril.',
    '<p>La temporada de avistamiento de ballena gris en Baja California Sur está rompiendo todos los récords, con más de 3,000 ejemplares registrados en las lagunas costeras del Pacífico.</p>
    <p>Biólogos marinos atribuyen el incremento a los esfuerzos de conservación y a la prohibición de pesca en zonas de reproducción.</p>
    <h2>Experiencia única</h2>
    <p>Los tours de avistamiento permiten a los visitantes acercarse a metros de distancia de estos gigantes del mar, una experiencia que expertos califican como "única en el planeta".</p>',
    'https://images.unsplash.com/photo-1568430462989-44163eb1752f?w=1200&h=800&fit=crop',
    'Turismo',
    true,
    NOW() - INTERVAL '3 days',
    2341
);

-- =============================================
-- REELS - VIDEOS CORTOS
-- =============================================

INSERT INTO reels (video_url, thumbnail_url, caption, is_published, published_at, views_count, likes_count) VALUES

(
    'https://www.w3schools.com/html/mov_bbb.mp4',
    'https://images.unsplash.com/photo-1518105779142-d975f22f1b0a?w=400&h=700&fit=crop',
    '🌮 Así se prepara el taco al pastor perfecto en CDMX. ¿Ya lo probaste? #Gastronomía #México #TacoAlPastor',
    true,
    NOW() - INTERVAL '2 hours',
    15420,
    3241
),

(
    'https://www.w3schools.com/html/mov_bbb.mp4',
    'https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=400&h=700&fit=crop',
    '🏝️ Las playas más hermosas de México que DEBES visitar en 2026. #Turismo #PlayasMexicanas #Viajes',
    true,
    NOW() - INTERVAL '5 hours',
    23156,
    5678
),

(
    'https://www.w3schools.com/html/mov_bbb.mp4',
    'https://images.unsplash.com/photo-1574629810360-7efbbe195018?w=400&h=700&fit=crop',
    '⚽ Los mejores goles de la Selección Mexicana en las eliminatorias. ¡Vamos México! #Futbol #Tri #Mundial2026',
    true,
    NOW() - INTERVAL '8 hours',
    45230,
    12453
),

(
    'https://www.w3schools.com/html/mov_bbb.mp4',
    'https://images.unsplash.com/photo-1585975754487-acc2dfa99476?w=400&h=700&fit=crop',
    '🎨 El increíble arte de los alebrijes oaxaqueños. Cada pieza cuenta una historia. #Artesanías #Oaxaca #México',
    true,
    NOW() - INTERVAL '12 hours',
    18765,
    4532
),

(
    'https://www.w3schools.com/html/mov_bbb.mp4',
    'https://images.unsplash.com/photo-1568430462989-44163eb1752f?w=400&h=700&fit=crop',
    '🐋 Momento mágico: ballena gris saluda a turistas en Baja California. #Ballenas #Naturaleza #BCS',
    true,
    NOW() - INTERVAL '1 day',
    34521,
    8976
);

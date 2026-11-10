(function () {
  // Conteos reales relevados del archivo del blog original (cosasdeunperro.blogspot.com)
  var YEARS = [
    { y: 2008, n: 18 }, { y: 2009, n: 10 }, { y: 2010, n: 9 }, { y: 2011, n: 18 },
    { y: 2012, n: 2 }, { y: 2013, n: 11 }, { y: 2014, n: 26 }, { y: 2015, n: 9 },
    { y: 2016, n: 90 }, { y: 2017, n: 192 }, { y: 2018, n: 109 }, { y: 2019, n: 30 },
    { y: 2020, n: 27 }, { y: 2021, n: 11 }, { y: 2022, n: 7 }, { y: 2023, n: 7 },
    { y: 2024, n: 1 }, { y: 2025, n: 3 }, { y: 2026, n: 8 }
  ];

  var maxN = Math.max.apply(null, YEARS.map(function (d) { return d.n; }));
  var minSize = 1.05, maxSize = 2.6;

  var row = document.getElementById('yearsRow');
  var panel = document.getElementById('yearPanel');
  var panelYear = document.getElementById('panelYear');
  var panelMeta = document.getElementById('panelMeta');
  var panelList = document.getElementById('panelList');

  var buttons = {};

  YEARS.forEach(function (d) {
    var scale = minSize + (maxSize - minSize) * Math.sqrt(d.n / maxN);
    var btn = document.createElement('button');
    btn.className = 'year-btn';
    btn.type = 'button';
    btn.setAttribute('aria-expanded', 'false');
    btn.setAttribute('role', 'tab');
    btn.id = 'yearbtn-' + d.y;

    var num = document.createElement('span');
    num.className = 'num';
    num.style.fontSize = scale.toFixed(2) + 'rem';
    num.textContent = d.y;

    var count = document.createElement('span');
    count.className = 'count';
    count.textContent = d.n + (d.n === 1 ? ' poema' : ' poemas');

    btn.appendChild(num);
    btn.appendChild(count);
    btn.addEventListener('click', function () { openYear(d.y); });

    row.appendChild(btn);
    buttons[d.y] = btn;
  });

  // Poemas 2023-2026 copiados del blog original (cosasdeunperro.blogspot.com)
  var POEMS = [{"t": "Pequeños pecados", "d": "2026-10-09", "u": "https://cosasdeunperro.blogspot.com/2026/10/pequenos-pecados.html", "x": "Estoy pensando que fue lo que hice mal\nsolo eso.\nPorque,\nsi bien\nhice muchas cosas bien,\nal fin y al cabo,\na nadie le interesa...\nsino tus fracasos,\ncuanto dieron tus balances\ntambién a mi...\npues hoy\nme pesan,\nde tanto decir\n\"pésame Dios mío,\npor mi culpa, por mi culpa, por mi culpa\"\n\nEntonces,\nde los pequeños\nfracasos de los fracasos,\nlos errores,\naquellos eventos fallidos,\nesa cadena\nligada con pequeños eslabones,\nde problemas no resueltos,\nde mentiras\na espaldas de uno mismo\no de alguien mas,\nde palabras y actitudes\nmal dichas,\nmal hechas,\nde secretos bobos,\nde verdades serias,\nhasta de muertes...\n\nTropezamos...\n\nEsa cadena que arrastramos,\ncada vez mas larga,\nva ligada\ntambién al pasado\nde nuestros pasados,\ndel pasado\nque también nos pesa,\nerrores de mis padres,\nde mis abuelos,\nde los abuelos de mis abuelos,\nmis ancestros...\nhan socavado un precipicio\na nuestras espaldas,\ncarcome un borde,\ndesde el que vamos anclados,\ncon una cadena,\nque tira y tira hacia abajo...\n\nHe sacado\nmis desaciertos a relucir,\ny los he dejado\nexpuestos al viento de esta noche,\nya se han desenpolvado,\nsi es suficientemente fuerte\nse los llevará,\ncon sus lágrimas\ny su derrotero,\ncon su manojo de verdades, y sus puñaladas,\npara que\nnunca mas nadie,\nse quede con ese grillete,\nesa ancla."}, {"t": "Carmín", "d": "2026-08-23", "u": "https://cosasdeunperro.blogspot.com/2026/08/carmin.html", "x": "Nunca se lo dije... solo me grabe su canción de niña, el nombre de su calle, y el mapa del tesoro... en mis pupilas, y me lo lleve.Nunca lo supo, pero me robe su magia, su hechizo encantador, no me lo dio, no se lo pedí, se lo robé cual magia con miradas cotidianas, bebiendolo todo, sus pasos,  atento a cada momento, un descuido y me robe su mueca de niña, dos miradas impertinentes, sonrisas burlonas de recreo, carreritas en el patio del cole, pritty naranja limón y pomelo... y zas un descuido...De hecho, con el tiempo de testigo, encontré sus besos, sus ojos en los espejos, y su voz... el primer amor nunca se olvida de ningún modo, es como ese tatuaje de tinta y fuego, de los juegos... acaso hay algo mas real, algo más serio y verdadero que los juegos cuando uno es niño?\nY así caminando por la vida fui juntando los pedazos, ocres y rojos, armé con mi botín lo que recordaba de ella, lo único que no recuerdo es su alma, cómo era su alma? De que estaba hecha...\nAhora que la veo dormida a mi lado pude robarme eso..."}, {"t": "Huecos en la memoria...", "d": "2026-03-24", "u": "https://cosasdeunperro.blogspot.com/2026/03/huecos-en-la-memoria.html", "x": "En las paredes, en los coches,\nen los vidrios,\nen algún policía,\nen algún soldado,\nen algún vecino,\nen algún amigo de mis hermanos mas grandes,\nquizá porque era chico solo recuerdo estar en la oscuridad escuchando los tiros...\nlas sirenas...\nlas explosiones...\ncallado, asustado, con las persianas bajas las luces apagadas, encerrado en el dormitorio,\n\"no se vayan a asomar por la ventana... puede entrar una bala perdida\", decía mi vieja...\ndespués de los tiros, las sirenas de las ambulancias justo en lo peor de la siesta...\ndespués salíamos a ver, parece que Moreno era guerrillero, era el comentario, subversivo...\nMoreno, el hermano era suboficial del ejercito que ironía, hermano contra hermano.\nRecuerdo los agujeros en la pared de la almacén de Doña Grella, podían entrar todos mis dedos ahí... recuerdo la ambulancia de culata entrando a la cochera de la casa de un militar que daba a los fondos de la casa de Moreno, recuerdo que se llevaron a alguien con un hueco del tamaño de su abdomen hecho por una itaca, en mi asombro de niño se me grabaron todos los huecos de esa siesta, los tiros, el olor, el sonido de la incertidumbre, de no saber que pasaba el hablar bajito de los viejos de la cuadra, pero lo que mas recuerdo son los huecos en las paredes... con los chicos de la barra buscábamos donde había mas huecos, buscábamos por las paredes, los baldíos, los techos. Y hoy en día de vez en cuando... todavía encuentro huecos, en las charlas de mi familia de vez en cuando aparece un hueco, cuando nombran a algún amigo de la barrita desaparecido, cuando me junto con los muchachos a jugar al fútbol los veo, veo huecos por todos lados, cuando veo la clase política que tenemos, y los que quedaron veo muchos huecos...huecos entre nosotros..."}, {"t": "Crazy II", "d": "2026-02-26", "u": "https://cosasdeunperro.blogspot.com/2026/02/crazy-ii.html", "x": "Con un pié en el suelo y otro en el cielo,con la paz de la montaña y la ansiedad de recorrerla,\ncon el calor del sol o el frío cortante del viento,\ncon los pulmones inflados de tanto oxígeno,\nvoy quemando locura...\nclaro que hace falta locura para esto,\npero una locura estable,\nporque si en medio de la nada,\nde la noche,\nde la tormenta,\no ante el temblor de las piernas,\ndecidís que ya no estás loco,\nestarás perdido..."}, {"t": "En otra vida", "d": "2026-01-12", "u": "https://cosasdeunperro.blogspot.com/2026/01/en-otra-vida.html", "x": "Escudriñando las imágenes y las sensaciones aquellas que creía deseo\nencontró en un sensual cortejo\nlo que nunca imaginó real.\n\nCreyó que se trataba de un sueño\ndivagues adolescentes\nfantasias incoherentes\nsiempre en tiempo presente\nde lo que no fue ni será.\n\nTodas esas visiones\nque creía devenidas de un delirio\nparecían sacadas\nde una vieja historieta\npelícula de otra vida.\n\nNo fueron sueño o inventos\nni tampoco fantasía\nsi no recuerdos olvidados\nque venían aferrados\na su alma vieja desde mundos  ya lejanos."}, {"t": "El impostor", "d": "2026-01-12", "u": "https://cosasdeunperro.blogspot.com/2026/01/el-impostor.html", "x": "No me juzgues y no transaré contigoasí decía el primer acuerdo\ntrampa de la que jamás volví a salir...\nal final él se salió con la suya.\n\nA partir de ese momento la voz se hizo presente\ny fue dictándolo todo al oído\na veces íbamos por la calle discutiendo\nestableciendo pautas necesarias\npara poder convivir.\n\nLos límites y los bordes desaparecieron\ny el todovale se hizo moneda corriente\nera cuestión de ganar o ganar\nadueñarse de la verdad\ny tener la primera y última palabra.\n\nSe convirtió en el tirano que me metió en este laberinto\nllenó mi cabeza de ideas imposibles, de mandatos viejos,\ny mi corazón se volvió un ovillo de dudas."}, {"t": "Que digan", "d": "2026-01-12", "u": "https://cosasdeunperro.blogspot.com/2018/04/que-digan.html", "x": "Dirán que soy un romántico\n\npero yo no puse a la luna entre los árboles\n\nrecortando tu rostro con la luz que entra por la ventana\nsimplemente estaba hipnotizado.\n\nQue mi hambre es tan voraz\n\nporque decidí comerte en el desayuno,\n\npero,\n\nyo no escribí el menú esta mañana\n\nme diste a elegir, te, café, o un mate dulce... te elegí a vos.\n\nQue causé daño en tu maquillaje,\n\ntu rimel desteñido,\n\ntu rouge desparramado,\n\npero yo no elegí ser el artista que pinte tus sueños\n\nsolo quise estar en tus noches de amor.\n\nVan a decir que soy un loco arrebatado\n\nal sentarte en este viaje del lado del acompañante\n\nyo no elegí este destino nuestro,\n\nno hice esta ruta, ni la dirección en que va el camino,\n\nnos fuimos juntos."}, {"t": "Esperma y lágrimas", "d": "2026-01-12", "u": "https://cosasdeunperro.blogspot.com/2018/05/esperma-y-lagrimas_14.html", "x": "En contraste extremo me ilumina\n\nla luna...\nme hipnotiza\n\nni creciente ni menguate,\n\nllena.\n\nEn mi horizonte\n\nsobre las heridas y mi oscura piel\n\npinta una acuarela\n\nde esperma y lágrimas.\n\nNunca había besado a la luna,\n\nmucho menos con el alma,\n\nbajarla no fue fácil\n\nasí sea solo por una noche\n\npara este ritual de encuentro\n\npiedra contra piedra\n\nluz agua fuego\n\na corazón abierto.\n\nNo la habían besado...\n\nhasta esa blanca noche\n\nun beso en su frente,\n\nen su boca,\n\nen su pecho,\n\nacostumbrada a girar\n\nsin satélites a su alrededor\n\nrecibió todo el calor\n\nen un baño de luz solar\n\nNo había visto a la luna llorar,\n\npero ahora le hago el amor...\n\nsomos un terreno fértil\n\ndonde la luz\n\nlo ilumina todo\n\ntan tenue que brilla\n\ntan claro que acompaña\n\nun reencuentro."}, {"t": "Reflexión", "d": "2025-09-15", "u": "https://cosasdeunperro.blogspot.com/2025/09/reflexion.html", "x": "El espejo roto en mil pedazosnunca mas volvió a reflejar el todo\naquel que era\nluces y sombras\nahí quedaron\ndesparramadas por el suelo...\nasí el alma única\nmadre de todas las almas\nnunca será una\nhasta reunir todas sus partes."}, {"t": "Redención", "d": "2025-08-18", "u": "https://cosasdeunperro.blogspot.com/2025/08/redencion.html", "x": "Lo que tienes que comprender de la lluvia es que no es para ti ni para nadie\na veces ahoga y a veces salva."}, {"t": "Portales", "d": "2025-05-02", "u": "https://cosasdeunperro.blogspot.com/2025/05/portales.html", "x": "Los infinitos ojos de los animales los niños y los viejos el reflejo en el agua transparente y su orificio en las olas o cascadas\nLos árboles y sus cortezas huecas mientras más viejos mejor...\n\nLos túneles en la tierra o en la frondosa cara de los bosques\nel cielo cuando se convierte en piso de nubes y las nubes en tormenta\ny después de la tormenta en arcoiris, los arcoiris...\n\nLas noches cerradas oscuras como el fondo de un aljibe\nLos puentes viejos en el momento en que crujen\nLas sombras que proyecta la luz de la luna...\n\nLos bordes y las cornisas con caídas infinitas\ncomo cristales empañados que ciegan al que observa pero,\nsimplemente al pasar la mano se abren a la vista...\n\nTodos son portales..."}, {"t": "Totem", "d": "2024-07-19", "u": "https://cosasdeunperro.blogspot.com/2024/07/totem.html", "x": "Hay un lobo negro entre la vida que sucedey las cuatro paredes de donde habito\nvan conmigo donde sea\ny marcan el límite entre lo bueno y lo malo\nlo que traen los vientos\ny atajan todo como el trébol alto\ntambién de cuatro hojas.\n\nEllos no tienen tiempo ni lugar\nsolo están allí desde el principio\ny estarán hasta el final\nmostrándole sus dientes afilados a las alimañas de la desgracia\nsin dejar huellas ni rastros de las batallas que en esa oscuridad suceden.\n\nLos que van conmigo lo saben\nse huele se percibe en el aire\nel lugar en donde habito\nmi piel\nestos huesos pesados\nla piedra y la madera\ntoda esa amalgama que crece dentro\nsolo sabe a paz..."}, {"t": "Onírico", "d": "2023-08-12", "u": "https://cosasdeunperro.blogspot.com/2023/08/onirico.html", "x": "Seguramente la escena será roja o amarillala luz solar del ocaso me alumbrará desde un costado\ny mitad sol mitad sombra pintara mi rostro...\n\nEl lugar irreal el instante previo en el que apareciste en mi vida\ncuando aún éramos dos extraños\npero ya imaginábamos\nel sabor de nuestros labios.\n\nLo he visto en el cine... vi como Alfredo en Cinema Paraíso\nrevisa el carrusel de imágenes una por una\nhaciendo cruces o recortes.\n\nMarcaré mis sueños como la cinta de una películacuadro por cuadro\npara que cuando tú sueñes los veas y entres en ese momento en que yo aparezco."}, {"t": "Crazy", "d": "2023-07-04", "u": "https://cosasdeunperro.blogspot.com/2023/07/crazy.html", "x": "Claro que hace falta locura para estoPero una locura estable,\nporque si en medio de la nada,\nde la noche,\nde la tormenta,\no ante el temblor de las piernas\ndecidís que ya no estás loco,\nestarás perdido..."}, {"t": "Liquidado", "d": "2023-06-22", "u": "https://cosasdeunperro.blogspot.com/2023/06/liquidado.html", "x": "Fluir como el agua... Adaptarse al terreno y recorrerlo eternamente horadando la piedra\nno descansaré\nquiero ver como se pule el camino y crece la huella.\n\nHaré una senda de colores suaves desgaste del cuerpo y el alma\ny se irán degradando los tonos hacia la cima\ngolpe a golpe marcaré un nuevo horizonte...\n\n¿Qué viene después?\n¿Qué aparecerá tras la próxima cresta?\nSe hace un nudo rocoso en el infinito horizonte\ny se desata en una cortina líquida que me acompaña a partir de ahora."}, {"t": "Como el musguito en la piedra", "d": "2023-05-31", "u": "https://cosasdeunperro.blogspot.com/2023/05/como-el-musguito-en-la-piedra.html", "x": "Humeando el lomo va dejando una estela en la noche fría de Copinaemparda la dureza de las piedras el cuádricep derecho al borde de estallar\nmientras la suela cien por ciento caucho se aferra e invade todo como el musgo gris.\n\nLa polvorosa greda dibuja en el aire una marca que serpentea por un buen rato detrás mío\ncómo buscando un rumbo del que ni siquiera yo tengo certeza.\nPero ahí vamos.\n\nSeñora de las Nieves que estás en la roca\nsantificado sea tu nombre\ndejame llegar a la cima\nlíbrame de la piedra floja\ndel verdín traicionero\ny que el perro ladre y no muerda.\n\nSolo quiero eso... un camino sinuoso\nuna cuesta eterna una quebrada\nun horizonte imposible\nuna cascada esmeralda donde pueda ver mi reflejo\ny al llegar sentir que lo merezco."}, {"t": "Sentido", "d": "2023-05-04", "u": "https://cosasdeunperro.blogspot.com/2023/05/sentido.html", "x": "Y para qué... para que un día podamos deciryo fui sí, yo estuve\nlo creí y entonces pude\nese día el más frío del año\nesa noche en que me encontré\ntrepando aquella cumbre.\n\nO metido en alguna encrucijada\npor un camino viejo\nun sendero\nen tal río en esa nube\ny entre dientes mordiendo el polvo\nrepetir sí, de nuevo pude.\n\nY volver a los lugares ya borrosos\npor donde de niño anduve\nde la mano de los viejos\ncon los ojos más abiertos\nque hoy hacen que no dude\nreencontrando las certezas\nsentir con toda el alma...\n\ny decir yo fui sí, yo estuve."}, {"t": "La última carrera", "d": "2023-04-24", "u": "https://cosasdeunperro.blogspot.com/2023/04/la-ultima-carrera.html", "x": "¿Dónde enfriaremos los huesoscuando todo pase?\ndoblados como un ciprés en la intemperie,\nen la recta final,\nun cortejo solo sucederá entre dos líneas de árboles."}, {"t": "Narcoiris", "d": "2023-04-03", "u": "https://cosasdeunperro.blogspot.com/2023/04/narcoiris.html", "x": "Buscamos la olla del tesoroen los confines del arcoiris\no donde pega el primer rayo de sol al amanecer\no el último del ocaso.\n\nExtasiados y con la mirada perdida en el horizonte\nhipnotizados por viejos mandatos\ngiramos en un carrusel infinito y loco.\n\nVamos tras de un premio grande como una zanahoria\nque nos lleva colgados de las narices\ncreyendo que eso es la felicidad...\n\nA veces la ruleta de la vida\nacomoda la bolilla en tu número, solo por un minuto."}];
  var MESES = ['enero','febrero','marzo','abril','mayo','junio','julio','agosto','septiembre','octubre','noviembre','diciembre'];
  function fmtDate(d) { return MESES[Number(d.slice(5, 7)) - 1] + ' ' + d.slice(0, 4); }

  var cards = document.getElementById('cards');
  POEMS.forEach(function (p) {
    var art = document.createElement('article');
    art.className = 'poem-card';
    art.setAttribute('data-reveal', 'up');
    var d = document.createElement('p'); d.className = 'card-date'; d.textContent = fmtDate(p.d);
    var t = document.createElement('h3'); t.textContent = p.t.replace(/[ .]+$/, '');
    var x = document.createElement('div'); x.className = 'card-text'; x.textContent = p.x;
    var s = document.createElement('a'); s.className = 'card-src'; s.href = p.u; s.target = '_blank'; s.rel = 'noopener'; s.textContent = 'Ver en el blog original';
    art.appendChild(d); art.appendChild(t); art.appendChild(x); art.appendChild(s);
    cards.appendChild(art);
  });

  var reader = document.getElementById('reader');
  var lastFocus = null;
  function openPoem(title) {
    var p = POEMS.find(function (q) { return q.t === title; });
    if (!p) return;
    document.getElementById('readerDate').textContent = fmtDate(p.d);
    document.getElementById('readerTitle').textContent = p.t.replace(/[ .]+$/, '');
    document.getElementById('readerText').textContent = p.x;
    document.getElementById('readerSrc').href = p.u;
    lastFocus = document.activeElement;
    document.documentElement.style.overflow = 'hidden';
    reader.scrollTop = 0;
    if (typeof reader.showModal === 'function') reader.showModal(); else reader.setAttribute('open', '');
  }
  document.addEventListener('click', function (e) {
    var a = e.target.closest('[data-title]');
    if (!a) return;
    e.preventDefault();
    openPoem(a.getAttribute('data-title'));
  });
  document.getElementById('readerClose').addEventListener('click', function () { reader.close(); });
  reader.addEventListener('click', function (e) { if (e.target === reader) reader.close(); });
  // Al cerrar: se libera el scroll y el foco vuelve a la tarjeta que abrió el lector
  reader.addEventListener('close', function () {
    document.documentElement.style.overflow = '';
    if (lastFocus && document.contains(lastFocus)) lastFocus.focus();
  });

  function openYear(y) {
    var data = YEARS.find(function (d) { return d.y === y; });
    if (!data) return;

    Object.keys(buttons).forEach(function (key) {
      buttons[key].setAttribute('aria-expanded', String(Number(key) === y));
    });

    panelYear.textContent = y;
    panelMeta.textContent = data.n + (data.n === 1 ? ' poema publicado este año' : ' poemas publicados este año');
    panelList.innerHTML = '';

    if (data.n === 0) {
      var li = document.createElement('li');
      li.innerHTML = '<p class="empty-note" style="padding:13px 4px;">Ese año el perro no ladró. No hay poemas publicados.</p>';
      panelList.appendChild(li);
    } else {
      var real = POEMS.filter(function (p) { return p.d.slice(0, 4) === String(y); });
      real.forEach(function (p) {
        var li3 = document.createElement('li');
        var a3 = document.createElement('a');
        a3.href = '#';
        a3.setAttribute('data-title', p.t);
        a3.innerHTML = '<span class="ptitle"></span><span class="pdate">' + fmtDate(p.d) + '</span>';
        a3.firstChild.textContent = p.t.replace(/[ .]+$/, '');
        li3.appendChild(a3);
        panelList.appendChild(li3);
      });
      for (var i = real.length; i < data.n; i++) {
        var li2 = document.createElement('li');
        var a = document.createElement('a');
        a.href = '#';
        a.innerHTML = '<span class="ptitle">Poema sin título todavía</span><span class="pdate">' + y + '</span>';
        li2.appendChild(a);
        panelList.appendChild(li2);
      }
    }

    panel.hidden = false;
    panel.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
  }

  /* =====================================================================
     MÓDULOS DE INTERACCIÓN
     Patrón tomado de electrotest: un solo manejador de scroll, reveal con
     IntersectionObserver + salvaguarda, scrollspy, scroll suave con offset
     del header, barra de progreso y botón "volver arriba". Sin librerías.
     ===================================================================== */

  var reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  function headerOffset() {
    var nav = document.querySelector('[data-header]');
    return (nav ? nav.offsetHeight : 64) + 8;
  }

  // Header: pasa de translúcido a sólido al scrollear
  function initHeader() {
    var header = document.querySelector('[data-header]');
    if (!header) return function () {};
    return function (scroll) { header.dataset.scrolled = String(scroll > 40); };
  }

  // Enlaces internos con scroll suave y compensación del header fijo
  function initAnchorLinks() {
    document.querySelectorAll('a[href^="#"]').forEach(function (link) {
      var href = link.getAttribute('href');
      if (!href || href === '#') return;
      link.addEventListener('click', function (e) {
        var target = document.querySelector(href);
        if (!target) return;
        e.preventDefault();
        var top = target.getBoundingClientRect().top + window.scrollY - headerOffset() + 1;
        window.scrollTo({ top: Math.max(0, top), behavior: reduceMotion ? 'auto' : 'smooth' });
        history.pushState(null, '', href);
        // El foco acompaña al destino (teclado y lectores de pantalla)
        if (!target.hasAttribute('tabindex')) target.setAttribute('tabindex', '-1');
        target.focus({ preventScroll: true });
      });
    });
  }

  // Scrollspy: marca en el menú la sección que se está viendo
  function initScrollSpy() {
    var links = [].slice.call(document.querySelectorAll('[data-nav-link]'));
    var map = {};
    var sections = [];
    links.forEach(function (link) {
      var id = (link.getAttribute('href') || '').replace('#', '');
      var sec = id && document.getElementById(id);
      if (!sec) return;
      (map[id] = map[id] || []).push(link);
      if (sections.indexOf(sec) < 0) sections.push(sec);
    });
    if (!sections.length || !('IntersectionObserver' in window)) return;

    var visible = [];
    var io = new IntersectionObserver(function (entries) {
      entries.forEach(function (en) {
        var i = visible.indexOf(en.target);
        if (en.isIntersecting && i < 0) visible.push(en.target);
        if (!en.isIntersecting && i >= 0) visible.splice(i, 1);
      });
      var top = visible.slice().sort(function (a, b) {
        return a.getBoundingClientRect().top - b.getBoundingClientRect().top;
      })[0];
      Object.keys(map).forEach(function (id) {
        map[id].forEach(function (l) {
          if (top && top.id === id) l.setAttribute('aria-current', 'true');
          else l.removeAttribute('aria-current');
        });
      });
    }, { rootMargin: '-45% 0px -45% 0px', threshold: 0 });
    sections.forEach(function (s) { io.observe(s); });
  }

  // Barra de progreso de lectura
  function initScrollProgress() {
    var bar = document.querySelector('[data-scroll-progress]');
    if (!bar) return function () {};
    return function (scroll) {
      var max = document.documentElement.scrollHeight - window.innerHeight;
      bar.style.transform = 'scaleX(' + (max > 0 ? Math.min(scroll / max, 1) : 0) + ')';
    };
  }

  // Botón "volver arriba"
  function initScrollTop() {
    var btn = document.querySelector('[data-scroll-top]');
    if (!btn) return function () {};
    btn.addEventListener('click', function () {
      window.scrollTo({ top: 0, behavior: reduceMotion ? 'auto' : 'smooth' });
    });
    return function (scroll) { btn.dataset.visible = String(scroll > window.innerHeight * 0.75); };
  }

  // Revelado al entrar en pantalla. Si algo falla, un timeout fuerza la
  // visibilidad: preferimos perder una animación a perder contenido.
  function initReveal() {
    var items = [].slice.call(document.querySelectorAll('[data-reveal]'));
    if (!items.length) return;

    // Escalonado dentro de cada grupo
    document.querySelectorAll('[data-reveal-group]').forEach(function (g) {
      [].slice.call(g.querySelectorAll('[data-reveal]')).forEach(function (el, i) {
        el.style.setProperty('--reveal-delay', (i * 0.1) + 's');
      });
    });

    var show = function (el) { el.classList.add('is-visible'); };
    if (reduceMotion || !('IntersectionObserver' in window)) { items.forEach(show); return; }

    var io = new IntersectionObserver(function (entries, obs) {
      entries.forEach(function (en) {
        if (!en.isIntersecting) return;
        show(en.target);
        obs.unobserve(en.target);
      });
    }, { rootMargin: '0px 0px -10% 0px', threshold: 0.01 });
    items.forEach(function (el) { io.observe(el); });

    window.setTimeout(function () { items.forEach(show); }, 4000);
  }

  // Imágenes: fade-in al decodificar y fallback declarativo (data-fallback)
  function initImages() {
    document.querySelectorAll('img').forEach(function (img) {
      var done = function () { img.classList.add('is-loaded'); };
      img.addEventListener('error', function () {
        var fb = img.dataset.fallback;
        if (fb && img.getAttribute('src') !== fb) img.src = fb; else done();
      }, { once: true });
      if (img.complete) done(); else img.addEventListener('load', done, { once: true });
    });
    // Salvaguarda: nunca dejar una imagen invisible
    window.setTimeout(function () {
      document.querySelectorAll('img').forEach(function (i) { i.classList.add('is-loaded'); });
    }, 3000);
  }

  // Línea de tiempo: navegación con flechas, Inicio y Fin
  function initYearKeyboard() {
    row.addEventListener('keydown', function (e) {
      var btns = [].slice.call(row.querySelectorAll('.year-btn'));
      var i = btns.indexOf(document.activeElement);
      if (i < 0) return;
      var next = { ArrowRight: i + 1, ArrowLeft: i - 1, Home: 0, End: btns.length - 1 }[e.key];
      if (next === undefined) return;
      e.preventDefault();
      btns[Math.max(0, Math.min(btns.length - 1, next))].focus();
    });
  }

  // Banner en video: sin sonido, se pausa fuera de pantalla y con "reducir movimiento"
  function initHeroVideo() {
    var v = document.querySelector('[data-hero-video]');
    if (!v) return;
    v.muted = true;
    v.defaultMuted = true;
    if (reduceMotion) { v.pause(); v.removeAttribute('autoplay'); return; }
    var play = function () { var p = v.play(); if (p && p.catch) p.catch(function () {}); };
    play();
    if ('IntersectionObserver' in window) {
      new IntersectionObserver(function (entries) {
        entries.forEach(function (en) { if (en.isIntersecting) play(); else v.pause(); });
      }, { threshold: 0.05 }).observe(v);
    }
  }

  function boot() {
    var updateHeader = initHeader();
    var updateProgress = initScrollProgress();
    var updateTop = initScrollTop();

    // Un solo listener de scroll, throttled con requestAnimationFrame
    var ticking = false;
    function onScroll() {
      if (ticking) return;
      ticking = true;
      requestAnimationFrame(function () {
        var y = window.scrollY;
        updateHeader(y); updateProgress(y); updateTop(y);
        ticking = false;
      });
    }
    window.addEventListener('scroll', onScroll, { passive: true });
    window.addEventListener('resize', onScroll, { passive: true });
    onScroll();

    initAnchorLinks();
    initScrollSpy();
    initReveal();
    initImages();
    initHeroVideo();
    initYearKeyboard();

    document.querySelectorAll('[data-current-year]').forEach(function (el) {
      el.textContent = String(new Date().getFullYear());
    });
  }

  boot();
})();

(function () {
  // Conteos reales relevados del archivo del blog original (cosasdeunperro.blogspot.com)
  var BASE = [
    { y: 2008, n: 18 }, { y: 2009, n: 10 }, { y: 2010, n: 9 }, { y: 2011, n: 18 },
    { y: 2012, n: 2 }, { y: 2013, n: 11 }, { y: 2014, n: 26 }, { y: 2015, n: 9 },
    { y: 2016, n: 90 }, { y: 2017, n: 192 }, { y: 2018, n: 109 }, { y: 2019, n: 30 },
    { y: 2020, n: 27 }, { y: 2021, n: 11 }, { y: 2022, n: 7 }, { y: 2023, n: 7 },
    { y: 2024, n: 1 }, { y: 2025, n: 3 }, { y: 2026, n: 8 }
  ];

  var minSize = 1.05, maxSize = 2.6;
  var BASE_FROM = 2023;   // desde este año los conteos salen de los poemas reales (API)

  var row = document.getElementById('yearsRow');
  var panel = document.getElementById('yearPanel');
  var panelYear = document.getElementById('panelYear');
  var panelMeta = document.getElementById('panelMeta');
  var panelList = document.getElementById('panelList');
  var cards = document.getElementById('cards');
  var stonesBox = document.querySelector('.poem-row');

  var MESES = ['enero','febrero','marzo','abril','mayo','junio','julio','agosto','septiembre','octubre','noviembre','diciembre'];
  function fmtDate(d) { return MESES[Number(d.slice(5, 7)) - 1] + ' ' + d.slice(0, 4); }
  function cleanTitle(t) { return String(t).replace(/[ .]+$/, ''); }
  function track(tipo, datos) { if (window.Metricas && window.Metricas.track) window.Metricas.track(tipo, datos); }

  // Poemas de respaldo (copiados del blog): se muestran al instante y si la web se abre
  // sin servidor. Con servidor se reemplazan por los de /api/poemas (editables desde el panel).
  var FALLBACK = [{"id":"6b1e31a62d","fecha":"2026-10-09","titulo":"Pequeños pecados","texto":"Estoy pensando que fue lo que hice mal\nsolo eso.\nPorque,\nsi bien\nhice muchas cosas bien,\nal fin y al cabo,\na nadie le interesa...\nsino tus fracasos,\ncuanto dieron tus balances\ntambién a mi...\npues hoy\nme pesan,\nde tanto decir\n\"pésame Dios mío,\npor mi culpa, por mi culpa, por mi culpa\"\n\nEntonces,\nde los pequeños\nfracasos de los fracasos,\nlos errores,\naquellos eventos fallidos,\nesa cadena\nligada con pequeños eslabones,\nde problemas no resueltos,\nde mentiras\na espaldas de uno mismo\no de alguien mas,\nde palabras y actitudes\nmal dichas,\nmal hechas,\nde secretos bobos,\nde verdades serias,\nhasta de muertes...\n\nTropezamos...\n\nEsa cadena que arrastramos,\ncada vez mas larga,\nva ligada\ntambién al pasado\nde nuestros pasados,\ndel pasado\nque también nos pesa,\nerrores de mis padres,\nde mis abuelos,\nde los abuelos de mis abuelos,\nmis ancestros...\nhan socavado un precipicio\na nuestras espaldas,\ncarcome un borde,\ndesde el que vamos anclados,\ncon una cadena,\nque tira y tira hacia abajo...\n\nHe sacado\nmis desaciertos a relucir,\ny los he dejado\nexpuestos al viento de esta noche,\nya se han desenpolvado,\nsi es suficientemente fuerte\nse los llevará,\ncon sus lágrimas\ny su derrotero,\ncon su manojo de verdades, y sus puñaladas,\npara que\nnunca mas nadie,\nse quede con ese grillete,\nesa ancla.","enlace":"https://cosasdeunperro.blogspot.com/2026/10/pequenos-pecados.html","imagen":"https://blogger.googleusercontent.com/img/a/AVvXsEjSFo8bqI_UFaboyruu_S9fODQpDqj7eFVhWUdqCyuceRjg7od72yU8o6oUxip0-YrkyZ_Q9gLr7ubMSHDxiHUkzuJTOg2chV54lqz0aLX9AwxGebpe8QwC5um1PKoqCid9KfFSQ0z5jWsXwGPLt6j8SxRolPjyKaBo0bS7uBFoHJw81BJ6i2YfYg1PL3Oc","visible":true},{"id":"ebe1aa2db5","fecha":"2026-08-23","titulo":"Carmín","texto":"Nunca se lo dije... solo me grabe su canción de niña, el nombre de su calle, y el mapa del tesoro... en mis pupilas, y me lo lleve.Nunca lo supo, pero me robe su magia, su hechizo encantador, no me lo dio, no se lo pedí, se lo robé cual magia con miradas cotidianas, bebiendolo todo, sus pasos,  atento a cada momento, un descuido y me robe su mueca de niña, dos miradas impertinentes, sonrisas burlonas de recreo, carreritas en el patio del cole, pritty naranja limón y pomelo... y zas un descuido...De hecho, con el tiempo de testigo, encontré sus besos, sus ojos en los espejos, y su voz... el primer amor nunca se olvida de ningún modo, es como ese tatuaje de tinta y fuego, de los juegos... acaso hay algo mas real, algo más serio y verdadero que los juegos cuando uno es niño?\nY así caminando por la vida fui juntando los pedazos, ocres y rojos, armé con mi botín lo que recordaba de ella, lo único que no recuerdo es su alma, cómo era su alma? De que estaba hecha...\nAhora que la veo dormida a mi lado pude robarme eso...","enlace":"https://cosasdeunperro.blogspot.com/2026/08/carmin.html","imagen":"https://blogger.googleusercontent.com/img/a/AVvXsEijwOFPxuTD5eS7NpPduf_vsP4LcJV0VWlXz3L0Rb6YDk3sQRX-Wpoaa-cXXJVdEYUrAFJyJDx1W1VZl5fphiQtkfZgUFs5GcqBQXESwtRfIvAziOzI7RWj_MUo-1nZmu-Q9ldMpaVU37cYj6slCgVGFIFS8rGxnf9fghRVf7UffJqw5WdbTGkR-apxb-Ly","visible":true},{"id":"465237ed1f","fecha":"2026-03-24","titulo":"Huecos en la memoria","texto":"En las paredes, en los coches,\nen los vidrios,\nen algún policía,\nen algún soldado,\nen algún vecino,\nen algún amigo de mis hermanos mas grandes,\nquizá porque era chico solo recuerdo estar en la oscuridad escuchando los tiros...\nlas sirenas...\nlas explosiones...\ncallado, asustado, con las persianas bajas las luces apagadas, encerrado en el dormitorio,\n\"no se vayan a asomar por la ventana... puede entrar una bala perdida\", decía mi vieja...\ndespués de los tiros, las sirenas de las ambulancias justo en lo peor de la siesta...\ndespués salíamos a ver, parece que Moreno era guerrillero, era el comentario, subversivo...\nMoreno, el hermano era suboficial del ejercito que ironía, hermano contra hermano.\nRecuerdo los agujeros en la pared de la almacén de Doña Grella, podían entrar todos mis dedos ahí... recuerdo la ambulancia de culata entrando a la cochera de la casa de un militar que daba a los fondos de la casa de Moreno, recuerdo que se llevaron a alguien con un hueco del tamaño de su abdomen hecho por una itaca, en mi asombro de niño se me grabaron todos los huecos de esa siesta, los tiros, el olor, el sonido de la incertidumbre, de no saber que pasaba el hablar bajito de los viejos de la cuadra, pero lo que mas recuerdo son los huecos en las paredes... con los chicos de la barra buscábamos donde había mas huecos, buscábamos por las paredes, los baldíos, los techos. Y hoy en día de vez en cuando... todavía encuentro huecos, en las charlas de mi familia de vez en cuando aparece un hueco, cuando nombran a algún amigo de la barrita desaparecido, cuando me junto con los muchachos a jugar al fútbol los veo, veo huecos por todos lados, cuando veo la clase política que tenemos, y los que quedaron veo muchos huecos...huecos entre nosotros...","enlace":"https://cosasdeunperro.blogspot.com/2026/03/huecos-en-la-memoria.html","imagen":"https://blogger.googleusercontent.com/img/a/AVvXsEgP-GvNihWckknIxPY3Na_mXIsXTlDIopbTcRwYtwi3y_klxqzQ7a0F-zRiYQl288uZCGwo6W5NHfNTVCNbL27bNvYDeeIysDTqVKguaIVtof-I2nZF1CRub0BaZ4sULlWdg0_iqY-4PxwXO6wWqlIgnGMlXnbhvvu4m8o3AX8exizphlbR_NhDnBGmFzMP","visible":true},{"id":"7d7f644abf","fecha":"2026-02-26","titulo":"Crazy II","texto":"Con un pié en el suelo y otro en el cielo,con la paz de la montaña y la ansiedad de recorrerla,\ncon el calor del sol o el frío cortante del viento,\ncon los pulmones inflados de tanto oxígeno,\nvoy quemando locura...\nclaro que hace falta locura para esto,\npero una locura estable,\nporque si en medio de la nada,\nde la noche,\nde la tormenta,\no ante el temblor de las piernas,\ndecidís que ya no estás loco,\nestarás perdido...","enlace":"https://cosasdeunperro.blogspot.com/2026/02/crazy-ii.html","imagen":"https://blogger.googleusercontent.com/img/a/AVvXsEgBRCKg5uhBYQlPQ1O210VrvGcNqnE9QalPr0o05ihYeT2MKb9rFhYePyWQih9egIZtNhryNDRDAaYMimoeaZOl3gZOPH-ybL7rE6JqqB2CEvO3X-YA7nlWhTLod6EYDZHv7zBITfpnBlXocM5N27S7qaagtdM9GuArqYS1k6goAd3kDYfHk7CtQ6XLkxsB","visible":true},{"id":"f1ed475477","fecha":"2026-01-12","titulo":"En otra vida","texto":"Escudriñando las imágenes y las sensaciones aquellas que creía deseo\nencontró en un sensual cortejo\nlo que nunca imaginó real.\n\nCreyó que se trataba de un sueño\ndivagues adolescentes\nfantasias incoherentes\nsiempre en tiempo presente\nde lo que no fue ni será.\n\nTodas esas visiones\nque creía devenidas de un delirio\nparecían sacadas\nde una vieja historieta\npelícula de otra vida.\n\nNo fueron sueño o inventos\nni tampoco fantasía\nsi no recuerdos olvidados\nque venían aferrados\na su alma vieja desde mundos  ya lejanos.","enlace":"https://cosasdeunperro.blogspot.com/2026/01/en-otra-vida.html","imagen":"https://blogger.googleusercontent.com/img/a/AVvXsEjqBZOepexEbYUkNiX3KlFSmEjDq107JJN6Sq3mZaOAA85nxh4a0PKPROHUvItJQWRHpghf55Mjj16QcgN4Vj3_nC1NM4be4YPnNfJ8CEwLEewFvG8fUC0Tw40TEWpmOtAW3TOFYTKpxNIk-YGaID8TwrNV2gO0walWiBjSIVd2HwudkqYJoaKL6uqMMW28","visible":true},{"id":"20a40a1f01","fecha":"2026-01-12","titulo":"El impostor","texto":"No me juzgues y no transaré contigoasí decía el primer acuerdo\ntrampa de la que jamás volví a salir...\nal final él se salió con la suya.\n\nA partir de ese momento la voz se hizo presente\ny fue dictándolo todo al oído\na veces íbamos por la calle discutiendo\nestableciendo pautas necesarias\npara poder convivir.\n\nLos límites y los bordes desaparecieron\ny el todovale se hizo moneda corriente\nera cuestión de ganar o ganar\nadueñarse de la verdad\ny tener la primera y última palabra.\n\nSe convirtió en el tirano que me metió en este laberinto\nllenó mi cabeza de ideas imposibles, de mandatos viejos,\ny mi corazón se volvió un ovillo de dudas.","enlace":"https://cosasdeunperro.blogspot.com/2026/01/el-impostor.html","imagen":"https://blogger.googleusercontent.com/img/a/AVvXsEjbxP7AJFan_EWv851G4sBsJSCzgvytD0D-LBIeRvHvzybYEE9tu8uJ_-XKtqaV2dtOt1rqQNekVkhnA91cISy3n4DLLYhBpFaj7Vno_7oUEUkYsQdgem5hTZfqTkN1Qx4Rvjqp4sl5UyIqhvUlz_5Jx2AzccQgTY3Gd6roXe1i9VRn15vqnj63lEPv7_sU","visible":true},{"id":"6c75a38dec","fecha":"2026-01-12","titulo":"Que digan","texto":"Dirán que soy un romántico\n\npero yo no puse a la luna entre los árboles\n\nrecortando tu rostro con la luz que entra por la ventana\nsimplemente estaba hipnotizado.\n\nQue mi hambre es tan voraz\n\nporque decidí comerte en el desayuno,\n\npero,\n\nyo no escribí el menú esta mañana\n\nme diste a elegir, te, café, o un mate dulce... te elegí a vos.\n\nQue causé daño en tu maquillaje,\n\ntu rimel desteñido,\n\ntu rouge desparramado,\n\npero yo no elegí ser el artista que pinte tus sueños\n\nsolo quise estar en tus noches de amor.\n\nVan a decir que soy un loco arrebatado\n\nal sentarte en este viaje del lado del acompañante\n\nyo no elegí este destino nuestro,\n\nno hice esta ruta, ni la dirección en que va el camino,\n\nnos fuimos juntos.","enlace":"https://cosasdeunperro.blogspot.com/2018/04/que-digan.html","imagen":"https://blogger.googleusercontent.com/img/a/AVvXsEjw-ekF5ht6eoik2vuDHCbomrj21qLtrCVjfHJ9jq-eMGAciZ_QX0DLM_7lNRFfeEP_P7lOBWbaCuBxXjxBqFBm99JGjiUKc-p9V1Xp6_dRnu-XLxMNgDSow6SyAQpVypS7sINVS0-vjz50FzKT01QtTs2Tac9tSbomt0L2gqXYYYFQlTu4pMkkUIOE0w6B","visible":true},{"id":"7cdf2ce1ee","fecha":"2026-01-12","titulo":"Esperma y lágrimas","texto":"En contraste extremo me ilumina\n\nla luna...\nme hipnotiza\n\nni creciente ni menguate,\n\nllena.\n\nEn mi horizonte\n\nsobre las heridas y mi oscura piel\n\npinta una acuarela\n\nde esperma y lágrimas.\n\nNunca había besado a la luna,\n\nmucho menos con el alma,\n\nbajarla no fue fácil\n\nasí sea solo por una noche\n\npara este ritual de encuentro\n\npiedra contra piedra\n\nluz agua fuego\n\na corazón abierto.\n\nNo la habían besado...\n\nhasta esa blanca noche\n\nun beso en su frente,\n\nen su boca,\n\nen su pecho,\n\nacostumbrada a girar\n\nsin satélites a su alrededor\n\nrecibió todo el calor\n\nen un baño de luz solar\n\nNo había visto a la luna llorar,\n\npero ahora le hago el amor...\n\nsomos un terreno fértil\n\ndonde la luz\n\nlo ilumina todo\n\ntan tenue que brilla\n\ntan claro que acompaña\n\nun reencuentro.","enlace":"https://cosasdeunperro.blogspot.com/2018/05/esperma-y-lagrimas_14.html","imagen":"https://blogger.googleusercontent.com/img/a/AVvXsEgcEL7pRJRsuAZDNoYrIPDcqytKsUuzwXzDYu9MONIiaHnuIGlz-ZBk9VP_d711LP71sBgXGAj60HjyQ4GJtX_S71f9KMKUEu7En1MWYqcu0SFRrRTXX8xmBIGZU2nZjDx8ybP06YU1u54Sz07FJSasW9kim3MhRgxoYqBKjyhXbvTn2sjBbR9c-ooQoEqh","visible":true},{"id":"166b43c7c5","fecha":"2025-09-15","titulo":"Reflexión","texto":"El espejo roto en mil pedazosnunca mas volvió a reflejar el todo\naquel que era\nluces y sombras\nahí quedaron\ndesparramadas por el suelo...\nasí el alma única\nmadre de todas las almas\nnunca será una\nhasta reunir todas sus partes.","enlace":"https://cosasdeunperro.blogspot.com/2025/09/reflexion.html","imagen":"https://blogger.googleusercontent.com/img/a/AVvXsEgaA8CXbIgfceagWJ6yN3ZWbM2TO90CLBqQDjVRCZJc1X-0NQLntbJBeDzW8u6gSadtoajR4R4-hnL26R_yPj34hzFQYOj1PjqzQt4YEti9FAeopqbpB5Mu9Ub4UX5KfzQftcDZtPImcrjqO6M__znHx_k-aZol_ZScAeDuMdyPw_n1OgohYArYSYGduGBw","visible":true},{"id":"49f48df699","fecha":"2025-08-18","titulo":"Redención","texto":"Lo que tienes que comprender de la lluvia es que no es para ti ni para nadie\na veces ahoga y a veces salva.","enlace":"https://cosasdeunperro.blogspot.com/2025/08/redencion.html","imagen":"https://blogger.googleusercontent.com/img/a/AVvXsEioVe0oXf7YLM-JyWG6oAiMs013_xEWz4BY4u93cu5sq1aRhp18A-_zsuYjrmH1zWRjGrtca0sUiIOIIhDStBj50vlYFCIqiAV4zSbR7p9wv_BGv5T6wDna-_ilVnvMGDF5eP_UPmEyRo0CpBvhZiUnDt7gN9LbCw1JnrN9gwImYZHDvuN5nLUAVn49vgg1","visible":true},{"id":"19599e9050","fecha":"2025-05-02","titulo":"Portales","texto":"Los infinitos ojos de los animales los niños y los viejos el reflejo en el agua transparente y su orificio en las olas o cascadas\nLos árboles y sus cortezas huecas mientras más viejos mejor...\n\nLos túneles en la tierra o en la frondosa cara de los bosques\nel cielo cuando se convierte en piso de nubes y las nubes en tormenta\ny después de la tormenta en arcoiris, los arcoiris...\n\nLas noches cerradas oscuras como el fondo de un aljibe\nLos puentes viejos en el momento en que crujen\nLas sombras que proyecta la luz de la luna...\n\nLos bordes y las cornisas con caídas infinitas\ncomo cristales empañados que ciegan al que observa pero,\nsimplemente al pasar la mano se abren a la vista...\n\nTodos son portales...","enlace":"https://cosasdeunperro.blogspot.com/2025/05/portales.html","imagen":"https://blogger.googleusercontent.com/img/a/AVvXsEjFYvfzhpH_Y6oPEIuHc4n_2UPU1-6xEJWBaK5XnhpTDdfM6Osu30N1T2teNW3vlTY5S78ismdrmyAYQUFr57qtg2tLIeqXR4AwgGO259HjjP9AkQG1wpC5EFBT2CA2Gh0Tv0Gh0w1H470OJ6OijCx4867JZ07sQiKct5fhJ6fzb6soAwMnIRQyFzijTgwT","visible":true},{"id":"4fb77631a0","fecha":"2024-07-19","titulo":"Totem","texto":"Hay un lobo negro entre la vida que sucedey las cuatro paredes de donde habito\nvan conmigo donde sea\ny marcan el límite entre lo bueno y lo malo\nlo que traen los vientos\ny atajan todo como el trébol alto\ntambién de cuatro hojas.\n\nEllos no tienen tiempo ni lugar\nsolo están allí desde el principio\ny estarán hasta el final\nmostrándole sus dientes afilados a las alimañas de la desgracia\nsin dejar huellas ni rastros de las batallas que en esa oscuridad suceden.\n\nLos que van conmigo lo saben\nse huele se percibe en el aire\nel lugar en donde habito\nmi piel\nestos huesos pesados\nla piedra y la madera\ntoda esa amalgama que crece dentro\nsolo sabe a paz...","enlace":"https://cosasdeunperro.blogspot.com/2024/07/totem.html","imagen":"https://blogger.googleusercontent.com/img/a/AVvXsEgeUnKw25cICXlduY-LxH1Gzk1UdqPF3Wi0vptoYDEzJsGVz3JPq2nkwBCa3HWU0EiH3gcQF07OCSoU5quIvWmwaxhQ_DFfTU1t27_uqToo3rWkNsGziyp-PN8MXxcEC_4BkXU6kK4yFXf6VkPwIk-fwVVOuby-hYVY33V2QlJcbItcZ1o9Qsg6SNetcV5D","visible":true},{"id":"78231d0371","fecha":"2023-08-12","titulo":"Onírico","texto":"Seguramente la escena será roja o amarillala luz solar del ocaso me alumbrará desde un costado\ny mitad sol mitad sombra pintara mi rostro...\n\nEl lugar irreal el instante previo en el que apareciste en mi vida\ncuando aún éramos dos extraños\npero ya imaginábamos\nel sabor de nuestros labios.\n\nLo he visto en el cine... vi como Alfredo en Cinema Paraíso\nrevisa el carrusel de imágenes una por una\nhaciendo cruces o recortes.\n\nMarcaré mis sueños como la cinta de una películacuadro por cuadro\npara que cuando tú sueñes los veas y entres en ese momento en que yo aparezco.","enlace":"https://cosasdeunperro.blogspot.com/2023/08/onirico.html","imagen":"https://blogger.googleusercontent.com/img/a/AVvXsEj_hbNeNGV-Yr7KLKuvJCHTU-1ZX4ZTPeg3vBiGh4o76veRNqu7RzCzwG-Y3_rhn5JjwZomo_jyA8_yH0dC4rbWXgFHYAYn8SsWe0pJ5nOqftzMKyt1-wj3cOBekN5U9DOFyCP2IDGtK-0PIn-j0eZ8XB1R6t7PyJl1N_1_gnMTbEK8_RgnYD9dMsBkh4KO","visible":true},{"id":"4a660d22e0","fecha":"2023-07-04","titulo":"Crazy","texto":"Claro que hace falta locura para estoPero una locura estable,\nporque si en medio de la nada,\nde la noche,\nde la tormenta,\no ante el temblor de las piernas\ndecidís que ya no estás loco,\nestarás perdido...","enlace":"https://cosasdeunperro.blogspot.com/2023/07/crazy.html","imagen":"https://blogger.googleusercontent.com/img/a/AVvXsEjfmaW8exOpN7pU6TVJ_UzpQrTBe58sZQD9RF1yaNtPdN6DAa-7g7dq38XEQ_wwbn7Af0a5VJxsKVqxb-zNGQRswka_Y-Z-yFqZCBS0Gh8MgnX252n_g5l8evoO_Ko5EJkKLGZid0JRky_HvIvwKrsnvZsORNKDHRyIzMJ5oRhzThKCqrR13FKpuncj9ckq","visible":true},{"id":"8de6519b6f","fecha":"2023-06-22","titulo":"Liquidado","texto":"Fluir como el agua... Adaptarse al terreno y recorrerlo eternamente horadando la piedra\nno descansaré\nquiero ver como se pule el camino y crece la huella.\n\nHaré una senda de colores suaves desgaste del cuerpo y el alma\ny se irán degradando los tonos hacia la cima\ngolpe a golpe marcaré un nuevo horizonte...\n\n¿Qué viene después?\n¿Qué aparecerá tras la próxima cresta?\nSe hace un nudo rocoso en el infinito horizonte\ny se desata en una cortina líquida que me acompaña a partir de ahora.","enlace":"https://cosasdeunperro.blogspot.com/2023/06/liquidado.html","imagen":"https://blogger.googleusercontent.com/img/a/AVvXsEgfrgd3LH8YOLKmhvr1QIbiJp1cmpUugMdOGOI5-i1UIbfk3maw_rwFFDh0QclnAuL-cLC_Do1wlWI1O3e8CB9_taeUrPtYMfb6-zO3BNAyvWX8C8293kmqQ_1t_9BjjF82WPW44lfzUT8VUcCv-g0jsURQNUjv_1lgE15y4IQ0_Yppgyfi-u6zvGFOcdU2","visible":true},{"id":"9a0c6e7a22","fecha":"2023-05-31","titulo":"Como el musguito en la piedra","texto":"Humeando el lomo va dejando una estela en la noche fría de Copinaemparda la dureza de las piedras el cuádricep derecho al borde de estallar\nmientras la suela cien por ciento caucho se aferra e invade todo como el musgo gris.\n\nLa polvorosa greda dibuja en el aire una marca que serpentea por un buen rato detrás mío\ncómo buscando un rumbo del que ni siquiera yo tengo certeza.\nPero ahí vamos.\n\nSeñora de las Nieves que estás en la roca\nsantificado sea tu nombre\ndejame llegar a la cima\nlíbrame de la piedra floja\ndel verdín traicionero\ny que el perro ladre y no muerda.\n\nSolo quiero eso... un camino sinuoso\nuna cuesta eterna una quebrada\nun horizonte imposible\nuna cascada esmeralda donde pueda ver mi reflejo\ny al llegar sentir que lo merezco.","enlace":"https://cosasdeunperro.blogspot.com/2023/05/como-el-musguito-en-la-piedra.html","imagen":"https://blogger.googleusercontent.com/img/a/AVvXsEiKC-8V4EihLzieT0wbnny6uEzigC-uL5ZcicL1MZNGE2hotOBWPjp07pHXcFiRLO0BGIAnVLGfiI8fHdvr4vXQxivV42UzxzMjUAR3-bg04Gz5_7WEQdRnl17TCiezlMiTkJDv04y8oIAKPvmDrqIu9gW5f3u5iC3O4q1epMysWyBJ1FJWA1s9tN5djw","visible":true},{"id":"7e13bb19c2","fecha":"2023-05-04","titulo":"Sentido","texto":"Y para qué... para que un día podamos deciryo fui sí, yo estuve\nlo creí y entonces pude\nese día el más frío del año\nesa noche en que me encontré\ntrepando aquella cumbre.\n\nO metido en alguna encrucijada\npor un camino viejo\nun sendero\nen tal río en esa nube\ny entre dientes mordiendo el polvo\nrepetir sí, de nuevo pude.\n\nY volver a los lugares ya borrosos\npor donde de niño anduve\nde la mano de los viejos\ncon los ojos más abiertos\nque hoy hacen que no dude\nreencontrando las certezas\nsentir con toda el alma...\n\ny decir yo fui sí, yo estuve.","enlace":"https://cosasdeunperro.blogspot.com/2023/05/sentido.html","imagen":"","visible":true},{"id":"9220cc04e4","fecha":"2023-04-24","titulo":"La última carrera","texto":"¿Dónde enfriaremos los huesoscuando todo pase?\ndoblados como un ciprés en la intemperie,\nen la recta final,\nun cortejo solo sucederá entre dos líneas de árboles.","enlace":"https://cosasdeunperro.blogspot.com/2023/04/la-ultima-carrera.html","imagen":"https://blogger.googleusercontent.com/img/a/AVvXsEgJhViDLDli9zYFludaLA9y6bzQPaekuAoVlmSa81I7fV_qnkfJu5uOV9tDydsSzAi5CRw7oP0Zso2Z_KcJc5YYPlipd0NzpL2xNQA9peaa5z7ftWv-dC84ahhdi9Si39MYwM2qdZez5q7euNUmJ5kNyLf3-OHJGBYt74Om2KRHjwuLD_OmjZAvIQRQMw","visible":true},{"id":"cf6f342905","fecha":"2023-04-03","titulo":"Narcoiris","texto":"Buscamos la olla del tesoroen los confines del arcoiris\no donde pega el primer rayo de sol al amanecer\no el último del ocaso.\n\nExtasiados y con la mirada perdida en el horizonte\nhipnotizados por viejos mandatos\ngiramos en un carrusel infinito y loco.\n\nVamos tras de un premio grande como una zanahoria\nque nos lleva colgados de las narices\ncreyendo que eso es la felicidad...\n\nA veces la ruleta de la vida\nacomoda la bolilla en tu número, solo por un minuto.","enlace":"https://cosasdeunperro.blogspot.com/2023/04/narcoiris.html","imagen":"https://blogger.googleusercontent.com/img/a/AVvXsEiEdCIkpiRmnYoeodd-OjlvB3ckypdhMJm8DV6ShgilNXHfJmP0fWHIoq_tooT9ymK9if0U9aldTY1voJ-VzfALEplUKGoJy1kijvA3YAMbe6We-RQ5I9J6qOSc5PTy7bj5JFEy8oOv_zkujH4xJdf8sqW20R_4GqKO-3_6BmxRRIrGrSlbrnPFbtMJBQ","visible":true}];

  var POEMS = [];
  var YEARS = [];
  var buttons = {};
  var currentYear = null;

  function mapApi(list) {
    return list.map(function (p) {
      return { id: p.id, t: p.titulo, d: p.fecha, u: p.enlace || '', x: p.texto, img: p.imagen || '' };
    });
  }

  function buildYears() {
    var n = {};
    BASE.forEach(function (d) { n[d.y] = d.n; });
    var real = {};
    POEMS.forEach(function (p) { var y = Number(p.d.slice(0, 4)); real[y] = (real[y] || 0) + 1; });
    Object.keys(real).forEach(function (y) { if (!(y in n)) n[y] = 0; });
    YEARS = Object.keys(n).map(Number).sort(function (a, b) { return a - b; }).map(function (y) {
      return { y: y, n: y >= BASE_FROM ? (real[y] || 0) : n[y] };
    });
    var maxN = Math.max.apply(null, YEARS.map(function (d) { return d.n; })) || 1;

    row.replaceChildren();
    buttons = {};
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
      btn.addEventListener('click', function () { track('abrir_anio', { anio: String(d.y) }); openYear(d.y); });

      row.appendChild(btn);
      buttons[d.y] = btn;
    });
  }

  function renderCards(animate) {
    cards.replaceChildren();
    POEMS.forEach(function (p) {
      var art = document.createElement('article');
      art.className = 'poem-card';
      art.setAttribute('data-reveal', 'up');
      if (!animate) art.classList.add('is-visible');
      if (p.img) {
        var im = document.createElement('img');
        im.className = 'card-img';
        im.loading = 'lazy';
        im.alt = '';
        im.src = p.img;
        im.addEventListener('error', function () { im.remove(); });
        art.appendChild(im);
      }
      var d = document.createElement('p'); d.className = 'card-date'; d.textContent = fmtDate(p.d);
      var t = document.createElement('h3'); t.textContent = cleanTitle(p.t);
      var x = document.createElement('div'); x.className = 'card-text'; x.textContent = p.x;
      art.appendChild(d); art.appendChild(t); art.appendChild(x);
      if (p.u) {
        var l = document.createElement('a'); l.className = 'card-src'; l.href = p.u; l.target = '_blank'; l.rel = 'noopener'; l.textContent = 'Ver en el blog original';
        l.addEventListener('click', function () { track('click_blog', { poemaId: p.id }); });
        art.appendChild(l);
      }
      cards.appendChild(art);
    });
  }

  // "Piedras del camino": los cinco poemas más recientes
  function firstLine(text) {
    var line = String(text).split('\n').map(function (s) { return s.trim(); }).filter(Boolean)[0] || '';
    line = line.replace(/[,;:.\s]+$/, '');
    return line.length > 64 ? line.slice(0, 61).replace(/\s+\S*$/, '') + '…' : line;
  }

  function renderStones(animate) {
    if (!stonesBox) return;
    stonesBox.replaceChildren();
    POEMS.slice(0, 5).forEach(function (p, i) {
      var a = document.createElement('a');
      a.className = 'poem-stone';
      a.href = '#';
      a.setAttribute('data-id', p.id);
      a.setAttribute('data-reveal', '');
      a.style.setProperty('--reveal-delay', (i * 0.1) + 's');
      if (!animate) a.classList.add('is-visible');
      var m = document.createElement('span'); m.className = 'stone-marker';
      var dt = document.createElement('span'); dt.className = 'stone-date'; dt.textContent = fmtDate(p.d);
      var ti = document.createElement('span'); ti.className = 'stone-title'; ti.textContent = cleanTitle(p.t);
      var fr = document.createElement('span'); fr.className = 'stone-frag'; fr.textContent = firstLine(p.x);
      a.append(m, dt, ti, fr);
      stonesBox.appendChild(a);
    });
  }

  function setPoems(list, animate) {
    POEMS = list.slice().sort(function (a, b) { return a.d < b.d ? 1 : a.d > b.d ? -1 : 0; });
    buildYears();
    renderCards(animate);
    renderStones(animate);
    if (currentYear !== null) openYear(currentYear, true);
  }

  var reader = document.getElementById('reader');
  var lastFocus = null;
  function openPoem(id) {
    var p = POEMS.find(function (q) { return q.id === id; });
    if (!p) return;
    document.getElementById('readerDate').textContent = fmtDate(p.d);
    document.getElementById('readerTitle').textContent = cleanTitle(p.t);
    document.getElementById('readerText').textContent = p.x;
    var src = document.getElementById('readerSrc');
    src.hidden = !p.u;
    src.href = p.u || '#';
    src.onclick = function () { track('click_blog', { poemaId: p.id }); };
    var img = document.getElementById('readerImg');
    img.hidden = !p.img;
    if (p.img) img.src = p.img; else img.removeAttribute('src');
    lastFocus = document.activeElement;
    document.documentElement.style.overflow = 'hidden';
    reader.scrollTop = 0;
    track('abrir_poema', { poemaId: p.id });
    if (typeof reader.showModal === 'function') reader.showModal(); else reader.setAttribute('open', '');
  }
  document.addEventListener('click', function (e) {
    var a = e.target.closest('[data-id]');
    if (!a) return;
    e.preventDefault();
    openPoem(a.getAttribute('data-id'));
  });
  document.getElementById('readerClose').addEventListener('click', function () { reader.close(); });
  reader.addEventListener('click', function (e) { if (e.target === reader) reader.close(); });
  // Al cerrar: se libera el scroll y el foco vuelve a la tarjeta que abrió el lector
  reader.addEventListener('close', function () {
    document.documentElement.style.overflow = '';
    if (lastFocus && document.contains(lastFocus)) lastFocus.focus();
  });

  var igLink = document.querySelector('.about-social');
  if (igLink) igLink.addEventListener('click', function () { track('click_instagram'); });

  function openYear(y, quiet) {
    var data = YEARS.find(function (d) { return d.y === y; });
    if (!data) return;
    currentYear = y;

    Object.keys(buttons).forEach(function (key) {
      buttons[key].setAttribute('aria-expanded', String(Number(key) === y));
    });

    panelYear.textContent = y;
    var link = document.getElementById('panelLink');
    if (link) link.href = 'https://cosasdeunperro.blogspot.com/' + y + '/?m=0';
    panelMeta.textContent = data.n + (data.n === 1 ? ' poema publicado este año' : ' poemas publicados este año');
    panelList.innerHTML = '';

    var real = POEMS.filter(function (p) { return p.d.slice(0, 4) === String(y); });
    if (data.n === 0) {
      var li = document.createElement('li');
      li.innerHTML = '<p class="empty-note" style="padding:13px 4px;">Ese año el perro no ladró. No hay poemas publicados.</p>';
      panelList.appendChild(li);
    } else {
      real.forEach(function (p) {
        var li3 = document.createElement('li');
        var a3 = document.createElement('a');
        a3.href = '#';
        a3.setAttribute('data-id', p.id);
        a3.innerHTML = '<span class="ptitle"></span><span class="pdate"></span>';
        a3.children[0].textContent = cleanTitle(p.t);
        a3.children[1].textContent = fmtDate(p.d);
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
    if (!quiet) panel.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
  }

  // Carga inicial: primero el respaldo (instantáneo), después los poemas del servidor
  function loadPoems() {
    setPoems(mapApi(FALLBACK), true);
    if (!window.fetch || location.protocol === 'file:') return;
    var ctl = window.AbortController ? new AbortController() : null;
    var timer = window.setTimeout(function () { if (ctl) ctl.abort(); }, 4000);
    fetch('/api/poemas', { headers: { Accept: 'application/json' }, signal: ctl ? ctl.signal : undefined })
      .then(function (r) { if (!r.ok) throw new Error(r.status); return r.json(); })
      .then(function (list) { if (Array.isArray(list)) setPoems(mapApi(list), false); })
      .catch(function () { /* sin servidor: se queda el respaldo */ })
      .then(function () { window.clearTimeout(timer); });
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

  // Videos del hero, siempre sin sonido. Escritorio: lobo corriendo de fondo.
  // Móvil: aullidos debajo del texto. Cada uno se descarga y reproduce sólo en su
  // pantalla, se pausa fuera de vista y con "reducir movimiento" queda quieto.
  function initHeroVideo() {
    var desktop = window.matchMedia('(min-width: 821px)');
    var videos = [].slice.call(document.querySelectorAll('[data-hero-video]'));
    if (!videos.length) return;

    videos.forEach(function (v) {
      v.muted = true;
      v.defaultMuted = true;
      v._seen = true;
      v._wanted = function () { return v.dataset.heroVideo === 'desktop' ? desktop.matches : !desktop.matches; };
      v._sync = function () {
        if (reduceMotion || !v._wanted() || !v._seen) { v.pause(); return; }
        if (v.dataset.src && !v.getAttribute('src')) v.src = v.dataset.src;
        var p = v.play();
        if (p && p.catch) p.catch(function () {});
      };
      if ('IntersectionObserver' in window) {
        new IntersectionObserver(function (entries) {
          entries.forEach(function (en) { v._seen = en.isIntersecting; v._sync(); });
        }, { threshold: 0.05 }).observe(v);
      }
      v._sync();
    });

    var onChange = function () { videos.forEach(function (v) { v._sync(); }); };
    if (desktop.addEventListener) desktop.addEventListener('change', onChange);
    else desktop.addListener(onChange);
    window.addEventListener('load', onChange);
    window.addEventListener('resize', onChange, { passive: true });
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

  loadPoems();
  boot();
})();

export interface Canton {
  nombre: string;
  distritos: string[];
}

export interface Provincia {
  provincia: string;
  cantones: Canton[];
}

export const costarica: Provincia[] = [
  {
    "provincia": "San José",
    "cantones": [
      {
        "nombre": "San José",
        "distritos": [
          "Carmen",
          "Merced",
          "Hospital",
          "Catedral",
          "Zapote",
          "San Francisco de Dos Ríos",
          "Uruaca",
          "Mata Redonda",
          "Pavas",
          "Hatillo",
          "San Sebastián"
        ]
      },
      {
        "nombre": "Escazú",
        "distritos": [
          "Escazú",
          "San Antonio",
          "San Rafael"
        ]
      },
      {
        "nombre": "Desamparados",
        "distritos": [
          "Desamparados",
          "San Miguel",
          "San Juan de Dios",
          "San Rafael Abajo",
          "San Antonio",
          "Frailes",
          "Patarrá",
          "San Cristóbal",
          "Rosario"
        ]
      },
      {
        "nombre": "Puriscal",
        "distritos": [
          "Santiago",
          "Mercedes Sur",
          "Barbacos",
          "Grifo Alto",
          "San Rafael",
          "Candelarita",
          "Desamparados",
          "San Antonio",
          "Grifo Bajo",
          "Cerbatana",
          "San Juan de Mata"
        ]
      },
      {
        "nombre": "Tarrazú",
        "distritos": [
          "San Marcos",
          "San Lorenzo",
          "San Carlos"
        ]
      },
      {
        "nombre": "Aserrí",
        "distritos": [
          "Aserrí",
          "Tarbaca",
          "Vuelta de Jorco",
          "San Gabriel",
          "Legua",
          "Monterrey",
          "Salitrillos",
          "Limón"
        ]
      },
      {
        "nombre": "Mora",
        "distritos": [
          "Colón",
          "Guayabo",
          "Tabarcia",
          "Piedras Negras",
          "Picagres",
          "Jaris"
        ]
      },
      {
        "nombre": "Goicoechea",
        "distritos": [
          "Guadalupe",
          "San Francisco",
          "Calle Blancos",
          "Mata de Plátano",
          "Ipís",
          "Rancho Redondo",
          "Purral"
        ]
      },
      {
        "nombre": "Santa Ana",
        "distritos": [
          "Santa Ana",
          "Salitral",
          "Pozos",
          "Uruca",
          "Piedades",
          "Brasil"
        ]
      },
      {
        "nombre": "Alajuelita",
        "distritos": [
          "Alajuelita",
          "San Josecito",
          "San Antonio",
          "Concepción",
          "San Felipe"
        ]
      },
      {
        "nombre": "Vázquez de Coronado",
        "distritos": [
          "San Isidro",
          "San Rafael",
          "Dulce Nombre de Jesús",
          "Patalillo",
          "Cascajal"
        ]
      },
      {
        "nombre": "Acosta",
        "distritos": [
          "San Ignacio",
          "Guaitil",
          "Palmichal",
          "Cangrejal",
          "Sabanillas"
        ]
      },
      {
        "nombre": "Tibás",
        "distritos": [
          "San Juan",
          "Cinco Esquinas",
          "Anselmo Llorente",
          "León XIII",
          "Colima"
        ]
      },
      {
        "nombre": "Moravia",
        "distritos": [
          "San Vicente",
          "San Jerónimo",
          "La Trinidad"
        ]
      },
      {
        "nombre": "Montes de Oca",
        "distritos": [
          "San Pedro",
          "Sabanilla",
          "Mercedes",
          "San Rafael"
        ]
      },
      {
        "nombre": "Turrubares",
        "distritos": [
          "San Pablo",
          "San Pedro",
          "San Juan de Mata",
          "San Luis",
          "Carara"
        ]
      },
      {
        "nombre": "Dota",
        "distritos": [
          "Santa María",
          "Jardín",
          "Copey"
        ]
      },
      {
        "nombre": "Curridabat",
        "distritos": [
          "Curridabat",
          "Granadilla",
          "Sánchez",
          "Tirrases"
        ]
      },
      {
        "nombre": "Pérez Zeledón",
        "distritos": [
          "San Isidro de El General",
          "General",
          "Daniel Flores",
          "Rivas",
          "San Pedro",
          "Platanares",
          "Pejibaye",
          "Cajón",
          "Barú",
          "Río Nuevo",
          "Páramo"
        ]
      },
      {
        "nombre": "León Cortés",
        "distritos": [
          "San Pablo",
          "San Andrés",
          "Llano Bonito",
          "San Isidro",
          "Santa Cruz",
          "San Antonio"
        ]
      }
    ]
  },
  {
    "provincia": "Alajuela",
    "cantones": [
      {
        "nombre": "Alajuela",
        "distritos": [
          "Alajuela",
          "San José",
          "Carrizal",
          "San Antonio",
          "Guácima",
          "San Isidro",
          "Sabanilla",
          "San Rafael",
          "Río Segundo",
          "Desamparados",
          "Turrúcares",
          "Tambor",
          "La Garita",
          "Sarapiquí"
        ]
      },
      {
        "nombre": "San Ramón",
        "distritos": [
          "San Ramón",
          "Santiago",
          "San Juan",
          "Piedades Norte",
          "Piedades Sur",
          "San Rafael",
          "San Isidro",
          "Ángeles",
          "Alfaro",
          "Volio",
          "Concepción",
          "Zapotal",
          "Peñas Blancas"
        ]
      },
      {
        "nombre": "Grecia",
        "distritos": [
          "Grecia",
          "San Isidro",
          "San José",
          "San Roque",
          "Tacares",
          "Puente de Piedra",
          "Bolívar"
        ]
      },
      {
        "nombre": "San Mateo",
        "distritos": [
          "San Mateo",
          "Desmonte",
          "Jesús María",
          "Labrador"
        ]
      },
      {
        "nombre": "Atenas",
        "distritos": [
          "Atenas",
          "Jesús",
          "Mercedes",
          "San Isidro",
          "Concepción",
          "San José",
          "Santa Eulalia",
          "Escobal"
        ]
      },
      {
        "nombre": "Naranjo",
        "distritos": [
          "Naranjo",
          "San Miguel",
          "San José",
          "Cirrí Sur",
          "San Jerónimo",
          "San Juan",
          "Rosario",
          "Palmitos"
        ]
      },
      {
        "nombre": "Palmares",
        "distritos": [
          "Palmares",
          "Zaragoza",
          "Buenos Aires",
          "Santiago",
          "Candelaria",
          "Esquipulas",
          "La Granja"
        ]
      },
      {
        "nombre": "Poás",
        "distritos": [
          "San Pedro",
          "San Juan",
          "San Rafael",
          "Carrillos",
          "Sabana Redonda"
        ]
      },
      {
        "nombre": "Orotina",
        "distritos": [
          "Orotina",
          "Mastate",
          "Hacienda Vieja",
          "Ceiba Alta",
          "Coyolar",
          "La Ceiba"
        ]
      },
      {
        "nombre": "San Carlos",
        "distritos": [
          "Quesada",
          "Florencia",
          "Buenavista",
          "Aguas Zarcas",
          "Venecia",
          "Pital",
          "La Fortuna",
          "La Tigra",
          "La Palmera",
          "Venado",
          "Cutris",
          "Monterrey",
          "Pocosol"
        ]
      },
      {
        "nombre": "Zarcero",
        "distritos": [
          "Zarcero",
          "Laguna",
          "Zapote",
          "Guadalupe",
          "Palmira",
          "Brisas"
        ]
      },
      {
        "nombre": "Sarchí",
        "distritos": [
          "Sarchí Norte",
          "Sarchí Sur",
          "Toro Amarillo",
          "San Pedro",
          "Rodríguez"
        ]
      },
      {
        "nombre": "Upala",
        "distritos": [
          "Upala",
          "Aguas Claras",
          "San José",
          "Bijuagua",
          "Delicias",
          "Dos Ríos",
          "Yolillal"
        ]
      },
      {
        "nombre": "Los Chiles",
        "distritos": [
          "Los Chiles",
          "Caño Negro",
          "El Amparo",
          "San Jorge"
        ]
      },
      {
        "nombre": "Guatuso",
        "distritos": [
          "San Rafael",
          "Buenaventura",
          "Cote",
          "Katira"
        ]
      },
      {
        "nombre": "Río Cuarto",
        "distritos": [
          "Río Cuarto",
          "Santa Rita",
          "Santa Isabel"
        ]
      }
    ]
  },
  {
    "provincia": "Cartago",
    "cantones": [
      {
        "nombre": "Cartago",
        "distritos": [
          "Oriental",
          "Occidental",
          "Carmen",
          "San Nicolás",
          "Aguacaliente",
          "Guadalupe",
          "Dulce Nombre",
          "Quebrada Grande",
          "Coris",
          "Tierra Blanca",
          "El Carmen",
          "San Juan"
        ]
      },
      {
        "nombre": "Paraíso",
        "distritos": [
          "Paraíso",
          "Santiago",
          "Orosi",
          "Cachí",
          "Llanos de Santa Lucía",
          "Birrisito"
        ]
      },
      {
        "nombre": "La Unión",
        "distritos": [
          "Tres Ríos",
          "San Diego",
          "San Juan",
          "San Rafael",
          "Concepción",
          "Dulce Nombre",
          "San Ramón",
          "Río Azul"
        ]
      },
      {
        "nombre": "Jiménez",
        "distritos": [
          "Juan Viñas",
          "Tucurrique",
          "Pejibaye"
        ]
      },
      {
        "nombre": "Turrialba",
        "distritos": [
          "Turrialba",
          "La Suiza",
          "Pavones",
          "Tayutic",
          "Santa Rosa",
          "Tres Equis",
          "La Isabel",
          "Chirripó",
          "Peralta",
          "Santa Teresita"
        ]
      },
      {
        "nombre": "Alvarado",
        "distritos": [
          "Pacayas",
          "Cervantes",
          "Capellades"
        ]
      },
      {
        "nombre": "Oreamuno",
        "distritos": [
          "San Rafael",
          "Cot",
          "Potrero Cerrado",
          "Cipreses",
          "Santa Rosa"
        ]
      },
      {
        "nombre": "El Guarco",
        "distritos": [
          "El Tejar",
          "San Isidro",
          "Tobosi",
          "Paraíso"
        ]
      }
    ]
  },
  {
    "provincia": "Heredia",
    "cantones": [
      {
        "nombre": "Heredia",
        "distritos": [
          "Heredia",
          "Mercedes",
          "San Francisco",
          "Ulloa",
          "Vara Blanca"
        ]
      },
      {
        "nombre": "Barva",
        "distritos": [
          "Barva",
          "San Pedro",
          "San Pablo",
          "San Roque",
          "Santa Lucía",
          "San José de la Montaña"
        ]
      },
      {
        "nombre": "Santo Domingo",
        "distritos": [
          "Santo Domingo",
          "San Vicente",
          "San Miguel",
          "Paracito",
          "Tures",
          "Santa Rosa",
          "Tobosi"
        ]
      },
      {
        "nombre": "Santa Bárbara",
        "distritos": [
          "Santa Bárbara",
          "San Pedro",
          "San Juan",
          "Jesús",
          "Santo Domingo",
          "Purabá"
        ]
      },
      {
        "nombre": "San Rafael",
        "distritos": [
          "San Rafael",
          "San Josecito",
          "Santiago",
          "Ángeles",
          "Concepción"
        ]
      },
      {
        "nombre": "San Isidro",
        "distritos": [
          "San Isidro",
          "San José",
          "Concepción",
          "San Francisco"
        ]
      },
      {
        "nombre": "Belén",
        "distritos": [
          "San Antonio",
          "Ribera",
          "La Asunción"
        ]
      },
      {
        "nombre": "Flores",
        "distritos": [
          "San Joaquín",
          "Barrantes",
          "Llorente"
        ]
      },
      {
        "nombre": "San Pablo",
        "distritos": [
          "San Pablo",
          "Rincón de Sabanilla"
        ]
      },
      {
        "nombre": "Sarapiquí",
        "distritos": [
          "Puerto Viejo",
          "La Virgen",
          "Horquetas",
          "Llanuras de Gaspar",
          "Cureña"
        ]
      }
    ]
  },
  {
    "provincia": "Guanacaste",
    "cantones": [
      {
        "nombre": "Liberia",
        "distritos": [
          "Liberia",
          "Cañas Dulces",
          "Mayorga",
          "Nacascolo",
          "Curubandé"
        ]
      },
      {
        "nombre": "Nicoya",
        "distritos": [
          "Nicoya",
          "Mansión",
          "San Antonio",
          "Quebrada Honda",
          "Sámara",
          "Nandayure",
          "Nosara",
          "Belén de Nosarita"
        ]
      },
      {
        "nombre": "Santa Cruz",
        "distritos": [
          "Santa Cruz",
          "Boldón",
          "Veintisiete de Abril",
          "Tempate",
          "Cartagena",
          "Cuajiniquil",
          "Diriá",
          "Cabo Velas",
          "Tamarindo"
        ]
      },
      {
        "nombre": "Bagaces",
        "distritos": [
          "Bagaces",
          "La Fortuna",
          "Mogote",
          "Río Naranjo"
        ]
      },
      {
        "nombre": "Carrillo",
        "distritos": [
          "Filadelfia",
          "Palmira",
          "Sardinal",
          "Belén"
        ]
      },
      {
        "nombre": "Cañas",
        "distritos": [
          "Cañas",
          "Palmira",
          "San Miguel",
          "Bebedero",
          "Porozal"
        ]
      },
      {
        "nombre": "Abangares",
        "distritos": [
          "Las Juntas",
          "Sierra",
          "San Juan",
          "Colorado"
        ]
      },
      {
        "nombre": "Tilarán",
        "distritos": [
          "Tilarán",
          "Quebrada Grande",
          "Tronadora",
          "Santa Rosa",
          "Líbano",
          "Tierras Morenas",
          "Arenal"
        ]
      },
      {
        "nombre": "Nandayure",
        "distritos": [
          "Carmona",
          "Santa Rita",
          "Zapotal",
          "San Pablo",
          "Porvenir",
          "Bejuco"
        ]
      },
      {
        "nombre": "La Cruz",
        "distritos": [
          "La Cruz",
          "Santa Cecilia",
          "La Garita",
          "Santa Elena"
        ]
      },
      {
        "nombre": "Hojancha",
        "distritos": [
          "Hojancha",
          "Monte Romo",
          "Puerto Carrillo",
          "Huacas",
          "Santa Rita"
        ]
      }
    ]
  },
  {
    "provincia": "Puntarenas",
    "cantones": [
      {
        "nombre": "Puntarenas",
        "distritos": [
          "Puntarenas",
          "Pitahaya",
          "Chomes",
          "Lepanto",
          "Paquera",
          "Manzanillo",
          "Guacimal",
          "Barranca",
          "Isla del Coco",
          "Cóbano",
          "Chacarita",
          "Bella Vista",
          "Acapulco"
        ]
      },
      {
        "nombre": "Esparza",
        "distritos": [
          "Esparza",
          "San Juan Grande",
          "Macacona",
          "San Rafael",
          "San Jerónimo",
          "Caldera"
        ]
      },
      {
        "nombre": "Buenos Aires",
        "distritos": [
          "Buenos Aires",
          "Volcán",
          "Potrero Grande",
          "Brunka",
          "Chánguena",
          "Santa Marta",
          "Limoncito"
        ]
      },
      {
        "nombre": "Montes de Oro",
        "distritos": [
          "Miramar",
          "San Isidro",
          "Unión",
          "San Gerardo"
        ]
      },
      {
        "nombre": "Osa",
        "distritos": [
          "Puerto Cortés",
          "Palmar",
          "Sierpe",
          "Bahía Drake",
          "Piedras Blancas",
          "Rincón"
        ]
      },
      {
        "nombre": "Quepos",
        "distritos": [
          "Quepos",
          "Savegre",
          "Naranjito"
        ]
      },
      {
        "nombre": "Golfito",
        "distritos": [
          "Golfito",
          "Puerto Jiménez",
          "Guaycará",
          "Pavón"
        ]
      },
      {
        "nombre": "Coto Brus",
        "distritos": [
          "San Vito",
          "Sabalito",
          "Aguabuena",
          "Limoncito",
          "Pittier"
        ]
      },
      {
        "nombre": "Parrita",
        "distritos": [
          "Parrita"
        ]
      },
      {
        "nombre": "Corredores",
        "distritos": [
          "Corredores",
          "La Cuesta",
          "Paso Canoas",
          "Laurel"
        ]
      },
      {
        "nombre": "Monteverde",
        "distritos": [
          "Monteverde"
        ]
      },
      {
        "nombre": "Puerto Jiménez",
        "distritos": [
          "Puerto Jiménez"
        ]
      }
    ]
  },
  {
    "provincia": "Limón",
    "cantones": [
      {
        "nombre": "Limón",
        "distritos": [
          "Limón",
          "Valle La Estrella",
          "Río Blanco",
          "Matama"
        ]
      },
      {
        "nombre": "Pococí",
        "distritos": [
          "Guápiles",
          "Cariari",
          "La Rita",
          "Roxana",
          "Cascadas",
          "Colorado"
        ]
      },
      {
        "nombre": "Siquirres",
        "distritos": [
          "Siquirres",
          "Pacuarito",
          "Florida",
          "El Alcance",
          "Germania"
        ]
      },
      {
        "nombre": "Talamanca",
        "distritos": [
          "Bratsi",
          "Sixaola",
          "Cahuita",
          "Telire"
        ]
      },
      {
        "nombre": "Matina",
        "distritos": [
          "Matina",
          "Batán",
          "Carrandí"
        ]
      },
      {
        "nombre": "Guácimo",
        "distritos": [
          "Guácimo",
          "Río Jiménez",
          "Duacarí",
          "Pocora",
          "Rosa",
          "Mercedes"
        ]
      }
    ]
  }
];

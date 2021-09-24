const TIMEZONES = {
  'Pacific/Niue': '(GMT-11:00) Niue',
  'Pacific/Pago_Pago': '(GMT-11:00) Pago Pago',
  'Pacific/Honolulu': '(GMT-10:00) Hawaii Time',
  'Pacific/Rarotonga': '(GMT-10:00) Rarotonga',
  'Pacific/Tahiti': '(GMT-10:00) Tahiti',
  'Pacific/Marquesas': '(GMT-09:30) Marquesas',
  'America/Anchorage': '(GMT-09:00) Alaska Time',
  'Pacific/Gambier': '(GMT-09:00) Gambier',
  'America/Los_Angeles': '(GMT-08:00) Pacific Time',
  'America/Tijuana': '(GMT-08:00) Pacific Time - Tijuana',
  'America/Vancouver': '(GMT-08:00) Pacific Time - Vancouver',
  'America/Whitehorse': '(GMT-08:00) Pacific Time - Whitehorse',
  'Pacific/Pitcairn': '(GMT-08:00) Pitcairn',
  'America/Dawson_Creek': '(GMT-07:00) Mountain Time - Dawson Creek',
  'America/Denver': '(GMT-07:00) Mountain Time',
  'America/Edmonton': '(GMT-07:00) Mountain Time - Edmonton',
  'America/Hermosillo': '(GMT-07:00) Mountain Time - Hermosillo',
  'America/Mazatlan': '(GMT-07:00) Mountain Time - Chihuahua, Mazatlan',
  'America/Phoenix': '(GMT-07:00) Mountain Time - Arizona',
  'America/Yellowknife': '(GMT-07:00) Mountain Time - Yellowknife',
  'America/Belize': '(GMT-06:00) Belize',
  'America/Chicago': '(GMT-06:00) Central Time',
  'America/Costa_Rica': '(GMT-06:00) Costa Rica',
  'America/El_Salvador': '(GMT-06:00) El Salvador',
  'America/Guatemala': '(GMT-06:00) Guatemala',
  'America/Managua': '(GMT-06:00) Managua',
  'America/Mexico_City': '(GMT-06:00) Central Time - Mexico City',
  'America/Regina': '(GMT-06:00) Central Time - Regina',
  'America/Tegucigalpa': '(GMT-06:00) Central Time - Tegucigalpa',
  'America/Winnipeg': '(GMT-06:00) Central Time - Winnipeg',
  'Pacific/Galapagos': '(GMT-06:00) Galapagos',
  'America/Bogota': '(GMT-05:00) Bogota',
  'America/Cancun': '(GMT-05:00) America Cancun',
  'America/Cayman': '(GMT-05:00) Cayman',
  'America/Guayaquil': '(GMT-05:00) Guayaquil',
  'America/Havana': '(GMT-05:00) Havana',
  'America/Iqaluit': '(GMT-05:00) Eastern Time - Iqaluit',
  'America/Jamaica': '(GMT-05:00) Jamaica',
  'America/Lima': '(GMT-05:00) Lima',
  'America/Nassau': '(GMT-05:00) Nassau',
  'America/New_York': '(GMT-05:00) Eastern Time',
  'America/Panama': '(GMT-05:00) Panama',
  'America/Port-au-Prince': '(GMT-05:00) Port-au-Prince',
  'America/Rio_Branco': '(GMT-05:00) Rio Branco',
  'America/Toronto': '(GMT-05:00) Eastern Time - Toronto',
  'Pacific/Easter': '(GMT-05:00) Easter Island',
  'America/Caracas': '(GMT-04:30) Caracas',
  'America/Asuncion': '(GMT-03:00) Asuncion',
  'America/Barbados': '(GMT-04:00) Barbados',
  'America/Boa_Vista': '(GMT-04:00) Boa Vista',
  'America/Campo_Grande': '(GMT-03:00) Campo Grande',
  'America/Cuiaba': '(GMT-03:00) Cuiaba',
  'America/Curacao': '(GMT-04:00) Curacao',
  'America/Grand_Turk': '(GMT-04:00) Grand Turk',
  'America/Guyana': '(GMT-04:00) Guyana',
  'America/Halifax': '(GMT-04:00) Atlantic Time - Halifax',
  'America/La_Paz': '(GMT-04:00) La Paz',
  'America/Manaus': '(GMT-04:00) Manaus',
  'America/Martinique': '(GMT-04:00) Martinique',
  'America/Port_of_Spain': '(GMT-04:00) Port of Spain',
  'America/Porto_Velho': '(GMT-04:00) Porto Velho',
  'America/Puerto_Rico': '(GMT-04:00) Puerto Rico',
  'America/Santo_Domingo': '(GMT-04:00) Santo Domingo',
  'America/Thule': '(GMT-04:00) Thule',
  'Atlantic/Bermuda': '(GMT-04:00) Bermuda',
  'America/St_Johns': '(GMT-03:30) Newfoundland Time - St. Johns',
  'America/Araguaina': '(GMT-03:00) Araguaina',
  'America/Argentina/Buenos_Aires': '(GMT-03:00) Buenos Aires',
  'America/Bahia': '(GMT-03:00) Salvador',
  'America/Belem': '(GMT-03:00) Belem',
  'America/Cayenne': '(GMT-03:00) Cayenne',
  'America/Fortaleza': '(GMT-03:00) Fortaleza',
  'America/Godthab': '(GMT-03:00) Godthab',
  'America/Maceio': '(GMT-03:00) Maceio',
  'America/Miquelon': '(GMT-03:00) Miquelon',
  'America/Montevideo': '(GMT-03:00) Montevideo',
  'America/Paramaribo': '(GMT-03:00) Paramaribo',
  'America/Recife': '(GMT-03:00) Recife',
  'America/Santiago': '(GMT-03:00) Santiago',
  'America/Sao_Paulo': '(GMT-02:00) Sao Paulo',
  'Antarctica/Palmer': '(GMT-03:00) Palmer',
  'Antarctica/Rothera': '(GMT-03:00) Rothera',
  'Atlantic/Stanley': '(GMT-03:00) Stanley',
  'America/Noronha': '(GMT-02:00) Noronha',
  'Atlantic/South_Georgia': '(GMT-02:00) South Georgia',
  'America/Scoresbysund': '(GMT-01:00) Scoresbysund',
  'Atlantic/Azores': '(GMT-01:00) Azores',
  'Atlantic/Cape_Verde': '(GMT-01:00) Cape Verde',
  'Africa/Abidjan': '(GMT+00:00) Abidjan',
  'Africa/Accra': '(GMT+00:00) Accra',
  'Africa/Bissau': '(GMT+00:00) Bissau',
  'Africa/Casablanca': '(GMT+00:00) Casablanca',
  'Africa/El_Aaiun': '(GMT+00:00) El Aaiun',
  'Africa/Monrovia': '(GMT+00:00) Monrovia',
  'America/Danmarkshavn': '(GMT+00:00) Danmarkshavn',
  'Atlantic/Canary': '(GMT+00:00) Canary Islands',
  'Atlantic/Faroe': '(GMT+00:00) Faeroe',
  'Atlantic/Reykjavik': '(GMT+00:00) Reykjavik',
  'Etc/GMT': '(GMT+00:00) GMT (no daylight saving)',
  'Europe/Dublin': '(GMT+00:00) Dublin',
  'Europe/Lisbon': '(GMT+00:00) Lisbon',
  'Europe/London': '(GMT+00:00) London',
  'Africa/Algiers': '(GMT+01:00) Algiers',
  'Africa/Ceuta': '(GMT+01:00) Ceuta',
  'Africa/Lagos': '(GMT+01:00) Lagos',
  'Africa/Ndjamena': '(GMT+01:00) Ndjamena',
  'Africa/Tunis': '(GMT+01:00) Tunis',
  'Africa/Windhoek': '(GMT+02:00) Windhoek',
  'Europe/Amsterdam': '(GMT+01:00) Amsterdam',
  'Europe/Andorra': '(GMT+01:00) Andorra',
  'Europe/Belgrade': '(GMT+01:00) Central European Time - Belgrade',
  'Europe/Berlin': '(GMT+01:00) Berlin',
  'Europe/Brussels': '(GMT+01:00) Brussels',
  'Europe/Budapest': '(GMT+01:00) Budapest',
  'Europe/Copenhagen': '(GMT+01:00) Copenhagen',
  'Europe/Gibraltar': '(GMT+01:00) Gibraltar',
  'Europe/Luxembourg': '(GMT+01:00) Luxembourg',
  'Europe/Madrid': '(GMT+01:00) Madrid',
  'Europe/Malta': '(GMT+01:00) Malta',
  'Europe/Monaco': '(GMT+01:00) Monaco',
  'Europe/Oslo': '(GMT+01:00) Oslo',
  'Europe/Paris': '(GMT+01:00) Paris',
  'Europe/Prague': '(GMT+01:00) Central European Time - Prague',
  'Europe/Rome': '(GMT+01:00) Rome',
  'Europe/Stockholm': '(GMT+01:00) Stockholm',
  'Europe/Tirane': '(GMT+01:00) Tirane',
  'Europe/Vienna': '(GMT+01:00) Vienna',
  'Europe/Warsaw': '(GMT+01:00) Warsaw',
  'Europe/Zurich': '(GMT+01:00) Zurich',
  'Africa/Cairo': '(GMT+02:00) Cairo',
  'Africa/Johannesburg': '(GMT+02:00) Johannesburg',
  'Africa/Maputo': '(GMT+02:00) Maputo',
  'Africa/Tripoli': '(GMT+02:00) Tripoli',
  'Asia/Amman': '(GMT+02:00) Amman',
  'Asia/Beirut': '(GMT+02:00) Beirut',
  'Asia/Damascus': '(GMT+02:00) Damascus',
  'Asia/Gaza': '(GMT+02:00) Gaza',
  'Asia/Jerusalem': '(GMT+02:00) Jerusalem',
  'Asia/Nicosia': '(GMT+02:00) Nicosia',
  'Europe/Athens': '(GMT+02:00) Athens',
  'Europe/Bucharest': '(GMT+02:00) Bucharest',
  'Europe/Chisinau': '(GMT+02:00) Chisinau',
  'Europe/Helsinki': '(GMT+02:00) Helsinki',
  'Europe/Istanbul': '(GMT+02:00) Istanbul',
  'Europe/Kaliningrad': '(GMT+02:00) Moscow-01 - Kaliningrad',
  'Europe/Kiev': '(GMT+02:00) Kiev',
  'Europe/Riga': '(GMT+02:00) Riga',
  'Europe/Sofia': '(GMT+02:00) Sofia',
  'Europe/Tallinn': '(GMT+02:00) Tallinn',
  'Europe/Vilnius': '(GMT+02:00) Vilnius',
  'Africa/Khartoum': '(GMT+03:00) Khartoum',
  'Africa/Nairobi': '(GMT+03:00) Nairobi',
  'Antarctica/Syowa': '(GMT+03:00) Syowa',
  'Asia/Baghdad': '(GMT+03:00) Baghdad',
  'Asia/Qatar': '(GMT+03:00) Qatar',
  'Asia/Riyadh': '(GMT+03:00) Riyadh',
  'Europe/Minsk': '(GMT+03:00) Minsk',
  'Europe/Moscow': '(GMT+03:00) Moscow+00 - Moscow',
  'Asia/Tehran': '(GMT+03:30) Tehran',
  'Asia/Baku': '(GMT+04:00) Baku',
  'Asia/Dubai': '(GMT+04:00) Dubai',
  'Asia/Tbilisi': '(GMT+04:00) Tbilisi',
  'Asia/Yerevan': '(GMT+04:00) Yerevan',
  'Europe/Samara': '(GMT+04:00) Moscow+01 - Samara',
  'Indian/Mahe': '(GMT+04:00) Mahe',
  'Indian/Mauritius': '(GMT+04:00) Mauritius',
  'Indian/Reunion': '(GMT+04:00) Reunion',
  'Asia/Kabul': '(GMT+04:30) Kabul',
  'Antarctica/Mawson': '(GMT+05:00) Mawson',
  'Asia/Aqtau': '(GMT+05:00) Aqtau',
  'Asia/Aqtobe': '(GMT+05:00) Aqtobe',
  'Asia/Ashgabat': '(GMT+05:00) Ashgabat',
  'Asia/Dushanbe': '(GMT+05:00) Dushanbe',
  'Asia/Karachi': '(GMT+05:00) Karachi',
  'Asia/Tashkent': '(GMT+05:00) Tashkent',
  'Asia/Yekaterinburg': '(GMT+05:00) Moscow+02 - Yekaterinburg',
  'Indian/Kerguelen': '(GMT+05:00) Kerguelen',
  'Indian/Maldives': '(GMT+05:00) Maldives',
  'Asia/Calcutta': '(GMT+05:30) India Standard Time',
  'Asia/Colombo': '(GMT+05:30) Colombo',
  'Asia/Katmandu': '(GMT+05:45) Katmandu',
  'Antarctica/Vostok': '(GMT+06:00) Vostok',
  'Asia/Almaty': '(GMT+06:00) Almaty',
  'Asia/Bishkek': '(GMT+06:00) Bishkek',
  'Asia/Dhaka': '(GMT+06:00) Dhaka',
  'Asia/Omsk': '(GMT+06:00) Moscow+03 - Omsk, Novosibirsk',
  'Asia/Thimphu': '(GMT+06:00) Thimphu',
  'Indian/Chagos': '(GMT+06:00) Chagos',
  'Asia/Rangoon': '(GMT+06:30) Rangoon',
  'Indian/Cocos': '(GMT+06:30) Cocos',
  'Antarctica/Davis': '(GMT+07:00) Davis',
  'Asia/Bangkok': '(GMT+07:00) Bangkok',
  'Asia/Hovd': '(GMT+07:00) Hovd',
  'Asia/Jakarta': '(GMT+07:00) Jakarta',
  'Asia/Krasnoyarsk': '(GMT+07:00) Moscow+04 - Krasnoyarsk',
  'Asia/Saigon': '(GMT+07:00) Hanoi',
  'Asia/Ho_Chi_Minh': '(GMT+07:00) Ho Chi Minh',
  'Indian/Christmas': '(GMT+07:00) Christmas',
  'Antarctica/Casey': '(GMT+08:00) Casey',
  'Asia/Brunei': '(GMT+08:00) Brunei',
  'Asia/Choibalsan': '(GMT+08:00) Choibalsan',
  'Asia/Hong_Kong': '(GMT+08:00) Hong Kong',
  'Asia/Irkutsk': '(GMT+08:00) Moscow+05 - Irkutsk',
  'Asia/Kuala_Lumpur': '(GMT+08:00) Kuala Lumpur',
  'Asia/Macau': '(GMT+08:00) Macau',
  'Asia/Makassar': '(GMT+08:00) Makassar',
  'Asia/Manila': '(GMT+08:00) Manila',
  'Asia/Shanghai': '(GMT+08:00) China Time - Beijing',
  'Asia/Singapore': '(GMT+08:00) Singapore',
  'Asia/Taipei': '(GMT+08:00) Taipei',
  'Asia/Ulaanbaatar': '(GMT+08:00) Ulaanbaatar',
  'Australia/Perth': '(GMT+08:00) Western Time - Perth',
  'Asia/Pyongyang': '(GMT+08:30) Pyongyang',
  'Asia/Dili': '(GMT+09:00) Dili',
  'Asia/Jayapura': '(GMT+09:00) Jayapura',
  'Asia/Seoul': '(GMT+09:00) Seoul',
  'Asia/Tokyo': '(GMT+09:00) Tokyo',
  'Asia/Yakutsk': '(GMT+09:00) Moscow+06 - Yakutsk',
  'Pacific/Palau': '(GMT+09:00) Palau',
  'Australia/Adelaide': '(GMT+10:30) Central Time - Adelaide',
  'Australia/Darwin': '(GMT+09:30) Central Time - Darwin',
  'Antarctica/DumontDUrville': "(GMT+10:00) Dumont D'Urville",
  'Asia/Magadan': '(GMT+10:00) Moscow+07 - Magadan',
  'Asia/Vladivostok': '(GMT+10:00) Moscow+07 - Yuzhno-Sakhalinsk',
  'Australia/Brisbane': '(GMT+10:00) Eastern Time - Brisbane',
  'Australia/Hobart': '(GMT+11:00) Eastern Time - Hobart',
  'Australia/Sydney': '(GMT+11:00) Eastern Time - Melbourne, Sydney',
  'Pacific/Chuuk': '(GMT+10:00) Truk',
  'Pacific/Guam': '(GMT+10:00) Guam',
  'Pacific/Port_Moresby': '(GMT+10:00) Port Moresby',
  'Pacific/Efate': '(GMT+11:00) Efate',
  'Pacific/Guadalcanal': '(GMT+11:00) Guadalcanal',
  'Pacific/Kosrae': '(GMT+11:00) Kosrae',
  'Pacific/Norfolk': '(GMT+11:00) Norfolk',
  'Pacific/Noumea': '(GMT+11:00) Noumea',
  'Pacific/Pohnpei': '(GMT+11:00) Ponape',
  'Asia/Kamchatka': '(GMT+12:00) Moscow+09 - Petropavlovsk-Kamchatskiy',
  'Pacific/Auckland': '(GMT+13:00) Auckland',
  'Pacific/Fiji': '(GMT+13:00) Fiji',
  'Pacific/Funafuti': '(GMT+12:00) Funafuti',
  'Pacific/Kwajalein': '(GMT+12:00) Kwajalein',
  'Pacific/Majuro': '(GMT+12:00) Majuro',
  'Pacific/Nauru': '(GMT+12:00) Nauru',
  'Pacific/Tarawa': '(GMT+12:00) Tarawa',
  'Pacific/Wake': '(GMT+12:00) Wake',
  'Pacific/Wallis': '(GMT+12:00) Wallis',
  'Pacific/Apia': '(GMT+14:00) Apia',
  'Pacific/Enderbury': '(GMT+13:00) Enderbury',
  'Pacific/Fakaofo': '(GMT+13:00) Fakaofo',
  'Pacific/Tongatapu': '(GMT+13:00) Tongatapu',
  'Pacific/Kiritimati': '(GMT+14:00) Kiritimati',
};

const TIMEZONES_DICTIONARIES = [
  {
    key: 'Pacific/Niue',
    value: '(GMT-11:00) Niue',
  },
  {
    key: 'Pacific/Pago_Pago',
    value: '(GMT-11:00) Pago Pago',
  },
  {
    key: 'Pacific/Honolulu',
    value: '(GMT-10:00) Hawaii Time',
  },
  {
    key: 'Pacific/Rarotonga',
    value: '(GMT-10:00) Rarotonga',
  },
  {
    key: 'Pacific/Tahiti',
    value: '(GMT-10:00) Tahiti',
  },
  {
    key: 'Pacific/Marquesas',
    value: '(GMT-09:30) Marquesas',
  },
  {
    key: 'America/Anchorage',
    value: '(GMT-09:00) Alaska Time',
  },
  {
    key: 'Pacific/Gambier',
    value: '(GMT-09:00) Gambier',
  },
  {
    key: 'America/Los_Angeles',
    value: '(GMT-08:00) Pacific Time',
  },
  {
    key: 'America/Tijuana',
    value: '(GMT-08:00) Pacific Time - Tijuana',
  },
  {
    key: 'America/Vancouver',
    value: '(GMT-08:00) Pacific Time - Vancouver',
  },
  {
    key: 'America/Whitehorse',
    value: '(GMT-08:00) Pacific Time - Whitehorse',
  },
  {
    key: 'Pacific/Pitcairn',
    value: '(GMT-08:00) Pitcairn',
  },
  {
    key: 'America/Dawson_Creek',
    value: '(GMT-07:00) Mountain Time - Dawson Creek',
  },
  {
    key: 'America/Denver',
    value: '(GMT-07:00) Mountain Time',
  },
  {
    key: 'America/Edmonton',
    value: '(GMT-07:00) Mountain Time - Edmonton',
  },
  {
    key: 'America/Hermosillo',
    value: '(GMT-07:00) Mountain Time - Hermosillo',
  },
  {
    key: 'America/Mazatlan',
    value: '(GMT-07:00) Mountain Time - Chihuahua, Mazatlan',
  },
  {
    key: 'America/Phoenix',
    value: '(GMT-07:00) Mountain Time - Arizona',
  },
  {
    key: 'America/Yellowknife',
    value: '(GMT-07:00) Mountain Time - Yellowknife',
  },
  {
    key: 'America/Belize',
    value: '(GMT-06:00) Belize',
  },
  {
    key: 'America/Chicago',
    value: '(GMT-06:00) Central Time',
  },
  {
    key: 'America/Costa_Rica',
    value: '(GMT-06:00) Costa Rica',
  },
  {
    key: 'America/El_Salvador',
    value: '(GMT-06:00) El Salvador',
  },
  {
    key: 'America/Guatemala',
    value: '(GMT-06:00) Guatemala',
  },
  {
    key: 'America/Managua',
    value: '(GMT-06:00) Managua',
  },
  {
    key: 'America/Mexico_City',
    value: '(GMT-06:00) Central Time - Mexico City',
  },
  {
    key: 'America/Regina',
    value: '(GMT-06:00) Central Time - Regina',
  },
  {
    key: 'America/Tegucigalpa',
    value: '(GMT-06:00) Central Time - Tegucigalpa',
  },
  {
    key: 'America/Winnipeg',
    value: '(GMT-06:00) Central Time - Winnipeg',
  },
  {
    key: 'Pacific/Galapagos',
    value: '(GMT-06:00) Galapagos',
  },
  {
    key: 'America/Bogota',
    value: '(GMT-05:00) Bogota',
  },
  {
    key: 'America/Cancun',
    value: '(GMT-05:00) America Cancun',
  },
  {
    key: 'America/Cayman',
    value: '(GMT-05:00) Cayman',
  },
  {
    key: 'America/Guayaquil',
    value: '(GMT-05:00) Guayaquil',
  },
  {
    key: 'America/Havana',
    value: '(GMT-05:00) Havana',
  },
  {
    key: 'America/Iqaluit',
    value: '(GMT-05:00) Eastern Time - Iqaluit',
  },
  {
    key: 'America/Jamaica',
    value: '(GMT-05:00) Jamaica',
  },
  {
    key: 'America/Lima',
    value: '(GMT-05:00) Lima',
  },
  {
    key: 'America/New_York',
    value: '(GMT-05:00) Eastern Time',
  },
  {
    key: 'America/Nassau',
    value: '(GMT-05:00) Nassau',
  },
  {
    key: 'America/Panama',
    value: '(GMT-05:00) Panama',
  },
  {
    key: 'America/Port-au-Prince',
    value: '(GMT-05:00) Port-au-Prince',
  },
  {
    key: 'America/Rio_Branco',
    value: '(GMT-05:00) Rio Branco',
  },
  {
    key: 'America/Toronto',
    value: '(GMT-05:00) Eastern Time - Toronto',
  },
  {
    key: 'Pacific/Easter',
    value: '(GMT-05:00) Easter Island',
  },
  {
    key: 'America/Caracas',
    value: '(GMT-04:30) Caracas',
  },
  {
    key: 'America/Asuncion',
    value: '(GMT-03:00) Asuncion',
  },
  {
    key: 'America/Barbados',
    value: '(GMT-04:00) Barbados',
  },
  {
    key: 'America/Boa_Vista',
    value: '(GMT-04:00) Boa Vista',
  },
  {
    key: 'America/Campo_Grande',
    value: '(GMT-03:00) Campo Grande',
  },
  {
    key: 'America/Cuiaba',
    value: '(GMT-03:00) Cuiaba',
  },
  {
    key: 'America/Curacao',
    value: '(GMT-04:00) Curacao',
  },
  {
    key: 'America/Grand_Turk',
    value: '(GMT-04:00) Grand Turk',
  },
  {
    key: 'America/Guyana',
    value: '(GMT-04:00) Guyana',
  },
  {
    key: 'America/Halifax',
    value: '(GMT-04:00) Atlantic Time - Halifax',
  },
  {
    key: 'America/La_Paz',
    value: '(GMT-04:00) La Paz',
  },
  {
    key: 'America/Manaus',
    value: '(GMT-04:00) Manaus',
  },
  {
    key: 'America/Martinique',
    value: '(GMT-04:00) Martinique',
  },
  {
    key: 'America/Port_of_Spain',
    value: '(GMT-04:00) Port of Spain',
  },
  {
    key: 'America/Porto_Velho',
    value: '(GMT-04:00) Porto Velho',
  },
  {
    key: 'America/Puerto_Rico',
    value: '(GMT-04:00) Puerto Rico',
  },
  {
    key: 'America/Santo_Domingo',
    value: '(GMT-04:00) Santo Domingo',
  },
  {
    key: 'America/Thule',
    value: '(GMT-04:00) Thule',
  },
  {
    key: 'Atlantic/Bermuda',
    value: '(GMT-04:00) Bermuda',
  },
  {
    key: 'America/St_Johns',
    value: '(GMT-03:30) Newfoundland Time - St. Johns',
  },
  {
    key: 'America/Araguaina',
    value: '(GMT-03:00) Araguaina',
  },
  {
    key: 'America/Argentina/Buenos_Aires',
    value: '(GMT-03:00) Buenos Aires',
  },
  {
    key: 'America/Bahia',
    value: '(GMT-03:00) Salvador',
  },
  {
    key: 'America/Belem',
    value: '(GMT-03:00) Belem',
  },
  {
    key: 'America/Cayenne',
    value: '(GMT-03:00) Cayenne',
  },
  {
    key: 'America/Fortaleza',
    value: '(GMT-03:00) Fortaleza',
  },
  {
    key: 'America/Godthab',
    value: '(GMT-03:00) Godthab',
  },
  {
    key: 'America/Maceio',
    value: '(GMT-03:00) Maceio',
  },
  {
    key: 'America/Miquelon',
    value: '(GMT-03:00) Miquelon',
  },
  {
    key: 'America/Montevideo',
    value: '(GMT-03:00) Montevideo',
  },
  {
    key: 'America/Paramaribo',
    value: '(GMT-03:00) Paramaribo',
  },
  {
    key: 'America/Recife',
    value: '(GMT-03:00) Recife',
  },
  {
    key: 'America/Santiago',
    value: '(GMT-03:00) Santiago',
  },
  {
    key: 'America/Sao_Paulo',
    value: '(GMT-02:00) Sao Paulo',
  },
  {
    key: 'Antarctica/Palmer',
    value: '(GMT-03:00) Palmer',
  },
  {
    key: 'Antarctica/Rothera',
    value: '(GMT-03:00) Rothera',
  },
  {
    key: 'Atlantic/Stanley',
    value: '(GMT-03:00) Stanley',
  },
  {
    key: 'America/Noronha',
    value: '(GMT-02:00) Noronha',
  },
  {
    key: 'Atlantic/South_Georgia',
    value: '(GMT-02:00) South Georgia',
  },
  {
    key: 'America/Scoresbysund',
    value: '(GMT-01:00) Scoresbysund',
  },
  {
    key: 'Atlantic/Azores',
    value: '(GMT-01:00) Azores',
  },
  {
    key: 'Atlantic/Cape_Verde',
    value: '(GMT-01:00) Cape Verde',
  },
  {
    key: 'Africa/Abidjan',
    value: '(GMT+00:00) Abidjan',
  },
  {
    key: 'Africa/Accra',
    value: '(GMT+00:00) Accra',
  },
  {
    key: 'Africa/Bissau',
    value: '(GMT+00:00) Bissau',
  },
  {
    key: 'Africa/Casablanca',
    value: '(GMT+00:00) Casablanca',
  },
  {
    key: 'Africa/El_Aaiun',
    value: '(GMT+00:00) El Aaiun',
  },
  {
    key: 'Africa/Monrovia',
    value: '(GMT+00:00) Monrovia',
  },
  {
    key: 'America/Danmarkshavn',
    value: '(GMT+00:00) Danmarkshavn',
  },
  {
    key: 'Atlantic/Canary',
    value: '(GMT+00:00) Canary Islands',
  },
  {
    key: 'Atlantic/Faroe',
    value: '(GMT+00:00) Faeroe',
  },
  {
    key: 'Atlantic/Reykjavik',
    value: '(GMT+00:00) Reykjavik',
  },
  {
    key: 'Etc/GMT',
    value: '(GMT+00:00) GMT (no daylight saving)',
  },
  {
    key: 'Europe/Dublin',
    value: '(GMT+00:00) Dublin',
  },
  {
    key: 'Europe/Lisbon',
    value: '(GMT+00:00) Lisbon',
  },
  {
    key: 'Europe/London',
    value: '(GMT+00:00) London',
  },
  {
    key: 'Africa/Algiers',
    value: '(GMT+01:00) Algiers',
  },
  {
    key: 'Africa/Ceuta',
    value: '(GMT+01:00) Ceuta',
  },
  {
    key: 'Africa/Lagos',
    value: '(GMT+01:00) Lagos',
  },
  {
    key: 'Africa/Ndjamena',
    value: '(GMT+01:00) Ndjamena',
  },
  {
    key: 'Africa/Tunis',
    value: '(GMT+01:00) Tunis',
  },
  {
    key: 'Africa/Windhoek',
    value: '(GMT+02:00) Windhoek',
  },
  {
    key: 'Europe/Amsterdam',
    value: '(GMT+01:00) Amsterdam',
  },
  {
    key: 'Europe/Andorra',
    value: '(GMT+01:00) Andorra',
  },
  {
    key: 'Europe/Belgrade',
    value: '(GMT+01:00) Central European Time - Belgrade',
  },
  {
    key: 'Europe/Berlin',
    value: '(GMT+01:00) Berlin',
  },
  {
    key: 'Europe/Brussels',
    value: '(GMT+01:00) Brussels',
  },
  {
    key: 'Europe/Budapest',
    value: '(GMT+01:00) Budapest',
  },
  {
    key: 'Europe/Copenhagen',
    value: '(GMT+01:00) Copenhagen',
  },
  {
    key: 'Europe/Gibraltar',
    value: '(GMT+01:00) Gibraltar',
  },
  {
    key: 'Europe/Luxembourg',
    value: '(GMT+01:00) Luxembourg',
  },
  {
    key: 'Europe/Madrid',
    value: '(GMT+01:00) Madrid',
  },
  {
    key: 'Europe/Malta',
    value: '(GMT+01:00) Malta',
  },
  {
    key: 'Europe/Monaco',
    value: '(GMT+01:00) Monaco',
  },
  {
    key: 'Europe/Oslo',
    value: '(GMT+01:00) Oslo',
  },
  {
    key: 'Europe/Paris',
    value: '(GMT+01:00) Paris',
  },
  {
    key: 'Europe/Prague',
    value: '(GMT+01:00) Central European Time - Prague',
  },
  {
    key: 'Europe/Rome',
    value: '(GMT+01:00) Rome',
  },
  {
    key: 'Europe/Stockholm',
    value: '(GMT+01:00) Stockholm',
  },
  {
    key: 'Europe/Tirane',
    value: '(GMT+01:00) Tirane',
  },
  {
    key: 'Europe/Vienna',
    value: '(GMT+01:00) Vienna',
  },
  {
    key: 'Europe/Warsaw',
    value: '(GMT+01:00) Warsaw',
  },
  {
    key: 'Europe/Zurich',
    value: '(GMT+01:00) Zurich',
  },
  {
    key: 'Africa/Cairo',
    value: '(GMT+02:00) Cairo',
  },
  {
    key: 'Africa/Johannesburg',
    value: '(GMT+02:00) Johannesburg',
  },
  {
    key: 'Africa/Maputo',
    value: '(GMT+02:00) Maputo',
  },
  {
    key: 'Africa/Tripoli',
    value: '(GMT+02:00) Tripoli',
  },
  {
    key: 'Asia/Amman',
    value: '(GMT+02:00) Amman',
  },
  {
    key: 'Asia/Beirut',
    value: '(GMT+02:00) Beirut',
  },
  {
    key: 'Asia/Damascus',
    value: '(GMT+02:00) Damascus',
  },
  {
    key: 'Asia/Gaza',
    value: '(GMT+02:00) Gaza',
  },
  {
    key: 'Asia/Jerusalem',
    value: '(GMT+02:00) Jerusalem',
  },
  {
    key: 'Asia/Nicosia',
    value: '(GMT+02:00) Nicosia',
  },
  {
    key: 'Europe/Athens',
    value: '(GMT+02:00) Athens',
  },
  {
    key: 'Europe/Bucharest',
    value: '(GMT+02:00) Bucharest',
  },
  {
    key: 'Europe/Chisinau',
    value: '(GMT+02:00) Chisinau',
  },
  {
    key: 'Europe/Helsinki',
    value: '(GMT+02:00) Helsinki',
  },
  {
    key: 'Europe/Istanbul',
    value: '(GMT+02:00) Istanbul',
  },
  {
    key: 'Europe/Kaliningrad',
    value: '(GMT+02:00) Moscow-01 - Kaliningrad',
  },
  {
    key: 'Europe/Kiev',
    value: '(GMT+02:00) Kiev',
  },
  {
    key: 'Europe/Riga',
    value: '(GMT+02:00) Riga',
  },
  {
    key: 'Europe/Sofia',
    value: '(GMT+02:00) Sofia',
  },
  {
    key: 'Europe/Tallinn',
    value: '(GMT+02:00) Tallinn',
  },
  {
    key: 'Europe/Vilnius',
    value: '(GMT+02:00) Vilnius',
  },
  {
    key: 'Africa/Khartoum',
    value: '(GMT+03:00) Khartoum',
  },
  {
    key: 'Africa/Nairobi',
    value: '(GMT+03:00) Nairobi',
  },
  {
    key: 'Antarctica/Syowa',
    value: '(GMT+03:00) Syowa',
  },
  {
    key: 'Asia/Baghdad',
    value: '(GMT+03:00) Baghdad',
  },
  {
    key: 'Asia/Qatar',
    value: '(GMT+03:00) Qatar',
  },
  {
    key: 'Asia/Riyadh',
    value: '(GMT+03:00) Riyadh',
  },
  {
    key: 'Europe/Minsk',
    value: '(GMT+03:00) Minsk',
  },
  {
    key: 'Europe/Moscow',
    value: '(GMT+03:00) Moscow+00 - Moscow',
  },
  {
    key: 'Asia/Tehran',
    value: '(GMT+03:30) Tehran',
  },
  {
    key: 'Asia/Baku',
    value: '(GMT+04:00) Baku',
  },
  {
    key: 'Asia/Dubai',
    value: '(GMT+04:00) Dubai',
  },
  {
    key: 'Asia/Tbilisi',
    value: '(GMT+04:00) Tbilisi',
  },
  {
    key: 'Asia/Yerevan',
    value: '(GMT+04:00) Yerevan',
  },
  {
    key: 'Europe/Samara',
    value: '(GMT+04:00) Moscow+01 - Samara',
  },
  {
    key: 'Indian/Mahe',
    value: '(GMT+04:00) Mahe',
  },
  {
    key: 'Indian/Mauritius',
    value: '(GMT+04:00) Mauritius',
  },
  {
    key: 'Indian/Reunion',
    value: '(GMT+04:00) Reunion',
  },
  {
    key: 'Asia/Kabul',
    value: '(GMT+04:30) Kabul',
  },
  {
    key: 'Antarctica/Mawson',
    value: '(GMT+05:00) Mawson',
  },
  {
    key: 'Asia/Aqtau',
    value: '(GMT+05:00) Aqtau',
  },
  {
    key: 'Asia/Aqtobe',
    value: '(GMT+05:00) Aqtobe',
  },
  {
    key: 'Asia/Ashgabat',
    value: '(GMT+05:00) Ashgabat',
  },
  {
    key: 'Asia/Dushanbe',
    value: '(GMT+05:00) Dushanbe',
  },
  {
    key: 'Asia/Karachi',
    value: '(GMT+05:00) Karachi',
  },
  {
    key: 'Asia/Tashkent',
    value: '(GMT+05:00) Tashkent',
  },
  {
    key: 'Asia/Yekaterinburg',
    value: '(GMT+05:00) Moscow+02 - Yekaterinburg',
  },
  {
    key: 'Indian/Kerguelen',
    value: '(GMT+05:00) Kerguelen',
  },
  {
    key: 'Indian/Maldives',
    value: '(GMT+05:00) Maldives',
  },
  {
    key: 'Asia/Calcutta',
    value: '(GMT+05:30) India Standard Time',
  },
  {
    key: 'Asia/Colombo',
    value: '(GMT+05:30) Colombo',
  },
  {
    key: 'Asia/Katmandu',
    value: '(GMT+05:45) Katmandu',
  },
  {
    key: 'Antarctica/Vostok',
    value: '(GMT+06:00) Vostok',
  },
  {
    key: 'Asia/Almaty',
    value: '(GMT+06:00) Almaty',
  },
  {
    key: 'Asia/Bishkek',
    value: '(GMT+06:00) Bishkek',
  },
  {
    key: 'Asia/Dhaka',
    value: '(GMT+06:00) Dhaka',
  },
  {
    key: 'Asia/Omsk',
    value: '(GMT+06:00) Moscow+03 - Omsk, Novosibirsk',
  },
  {
    key: 'Asia/Thimphu',
    value: '(GMT+06:00) Thimphu',
  },
  {
    key: 'Indian/Chagos',
    value: '(GMT+06:00) Chagos',
  },
  {
    key: 'Asia/Rangoon',
    value: '(GMT+06:30) Rangoon',
  },
  {
    key: 'Indian/Cocos',
    value: '(GMT+06:30) Cocos',
  },
  {
    key: 'Antarctica/Davis',
    value: '(GMT+07:00) Davis',
  },
  {
    key: 'Asia/Bangkok',
    value: '(GMT+07:00) Bangkok',
  },
  {
    key: 'Asia/Hovd',
    value: '(GMT+07:00) Hovd',
  },
  {
    key: 'Asia/Jakarta',
    value: '(GMT+07:00) Jakarta',
  },
  {
    key: 'Asia/Krasnoyarsk',
    value: '(GMT+07:00) Moscow+04 - Krasnoyarsk',
  },
  {
    key: 'Asia/Saigon',
    value: '(GMT+07:00) Hanoi',
  },
  {
    key: 'Asia/Ho_Chi_Minh',
    value: '(GMT+07:00) Ho Chi Minh',
  },
  {
    key: 'Indian/Christmas',
    value: '(GMT+07:00) Christmas',
  },
  {
    key: 'Antarctica/Casey',
    value: '(GMT+08:00) Casey',
  },
  {
    key: 'Asia/Brunei',
    value: '(GMT+08:00) Brunei',
  },
  {
    key: 'Asia/Choibalsan',
    value: '(GMT+08:00) Choibalsan',
  },
  {
    key: 'Asia/Hong_Kong',
    value: '(GMT+08:00) Hong Kong',
  },
  {
    key: 'Asia/Irkutsk',
    value: '(GMT+08:00) Moscow+05 - Irkutsk',
  },
  {
    key: 'Asia/Kuala_Lumpur',
    value: '(GMT+08:00) Kuala Lumpur',
  },
  {
    key: 'Asia/Macau',
    value: '(GMT+08:00) Macau',
  },
  {
    key: 'Asia/Makassar',
    value: '(GMT+08:00) Makassar',
  },
  {
    key: 'Asia/Manila',
    value: '(GMT+08:00) Manila',
  },
  {
    key: 'Asia/Shanghai',
    value: '(GMT+08:00) China Time - Beijing',
  },
  {
    key: 'Asia/Singapore',
    value: '(GMT+08:00) Singapore',
  },
  {
    key: 'Asia/Taipei',
    value: '(GMT+08:00) Taipei',
  },
  {
    key: 'Asia/Ulaanbaatar',
    value: '(GMT+08:00) Ulaanbaatar',
  },
  {
    key: 'Australia/Perth',
    value: '(GMT+08:00) Western Time - Perth',
  },
  {
    key: 'Asia/Pyongyang',
    value: '(GMT+08:30) Pyongyang',
  },
  {
    key: 'Asia/Dili',
    value: '(GMT+09:00) Dili',
  },
  {
    key: 'Asia/Jayapura',
    value: '(GMT+09:00) Jayapura',
  },
  {
    key: 'Asia/Seoul',
    value: '(GMT+09:00) Seoul',
  },
  {
    key: 'Asia/Tokyo',
    value: '(GMT+09:00) Tokyo',
  },
  {
    key: 'Asia/Yakutsk',
    value: '(GMT+09:00) Moscow+06 - Yakutsk',
  },
  {
    key: 'Pacific/Palau',
    value: '(GMT+09:00) Palau',
  },
  {
    key: 'Australia/Adelaide',
    value: '(GMT+10:30) Central Time - Adelaide',
  },
  {
    key: 'Australia/Darwin',
    value: '(GMT+09:30) Central Time - Darwin',
  },
  {
    key: 'Antarctica/DumontDUrville',
    value: '(GMT+10:00) Dumont D\\"Urville',
  },
  {
    key: 'Asia/Magadan',
    value: '(GMT+10:00) Moscow+07 - Magadan',
  },
  {
    key: 'Asia/Vladivostok',
    value: '(GMT+10:00) Moscow+07 - Yuzhno-Sakhalinsk',
  },
  {
    key: 'Australia/Brisbane',
    value: '(GMT+10:00) Eastern Time - Brisbane',
  },
  {
    key: 'Australia/Hobart',
    value: '(GMT+11:00) Eastern Time - Hobart',
  },
  {
    key: 'Australia/Sydney',
    value: '(GMT+11:00) Eastern Time - Melbourne, Sydney',
  },
  {
    key: 'Pacific/Chuuk',
    value: '(GMT+10:00) Truk',
  },
  {
    key: 'Pacific/Guam',
    value: '(GMT+10:00) Guam',
  },
  {
    key: 'Pacific/Port_Moresby',
    value: '(GMT+10:00) Port Moresby',
  },
  {
    key: 'Pacific/Efate',
    value: '(GMT+11:00) Efate',
  },
  {
    key: 'Pacific/Guadalcanal',
    value: '(GMT+11:00) Guadalcanal',
  },
  {
    key: 'Pacific/Kosrae',
    value: '(GMT+11:00) Kosrae',
  },
  {
    key: 'Pacific/Norfolk',
    value: '(GMT+11:00) Norfolk',
  },
  {
    key: 'Pacific/Noumea',
    value: '(GMT+11:00) Noumea',
  },
  {
    key: 'Pacific/Pohnpei',
    value: '(GMT+11:00) Ponape',
  },
  {
    key: 'Asia/Kamchatka',
    value: '(GMT+12:00) Moscow+09 - Petropavlovsk-Kamchatskiy',
  },
  {
    key: 'Pacific/Auckland',
    value: '(GMT+13:00) Auckland',
  },
  {
    key: 'Pacific/Fiji',
    value: '(GMT+13:00) Fiji',
  },
  {
    key: 'Pacific/Funafuti',
    value: '(GMT+12:00) Funafuti',
  },
  {
    key: 'Pacific/Kwajalein',
    value: '(GMT+12:00) Kwajalein',
  },
  {
    key: 'Pacific/Majuro',
    value: '(GMT+12:00) Majuro',
  },
  {
    key: 'Pacific/Nauru',
    value: '(GMT+12:00) Nauru',
  },
  {
    key: 'Pacific/Tarawa',
    value: '(GMT+12:00) Tarawa',
  },
  {
    key: 'Pacific/Wake',
    value: '(GMT+12:00) Wake',
  },
  {
    key: 'Pacific/Wallis',
    value: '(GMT+12:00) Wallis',
  },
  {
    key: 'Pacific/Apia',
    value: '(GMT+14:00) Apia',
  },
  {
    key: 'Pacific/Enderbury',
    value: '(GMT+13:00) Enderbury',
  },
  {
    key: 'Pacific/Fakaofo',
    value: '(GMT+13:00) Fakaofo',
  },
  {
    key: 'Pacific/Tongatapu',
    value: '(GMT+13:00) Tongatapu',
  },
  {
    key: 'Pacific/Kiritimati',
    value: '(GMT+14:00) Kiritimati',
  },
];

module.exports = {
  TIMEZONES,
  TIMEZONES_DICTIONARIES,
};

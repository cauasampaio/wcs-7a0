const formationsData = {
  '4-3-3': {
    'Defensiva': [
      { role: 'POR', top: 89, left: 50 }, { role: 'LI', top: 73, left: 20 }, { role: 'DFC', top: 75, left: 37 }, { role: 'DFC', top: 75, left: 63 }, { role: 'LD', top: 73, left: 80 },
      { role: 'VOL', top: 65, left: 40 }, { role: 'VOL', top: 65, left: 60 }, { role: 'MAT', top: 45, left: 50 },
      { role: 'EI', top: 25, left: 18 }, { role: 'DC', top: 20, left: 50 }, { role: 'DE', top: 25, left: 82 }
    ],
    'Equilibrado': [
      { role: 'POR', top: 89, left: 50 }, { role: 'LI', top: 73, left: 20 }, { role: 'DFC', top: 75, left: 37 }, { role: 'DFC', top: 75, left: 63 }, { role: 'LD', top: 73, left: 80 },
      { role: 'VOL', top: 60, left: 50 }, { role: 'MLG', top: 50, left: 35 }, { role: 'MAT', top: 45, left: 65 },
      { role: 'EI', top: 22, left: 18 }, { role: 'DC', top: 17, left: 50 }, { role: 'DE', top: 22, left: 82 }
    ],
    'Ofensiva': [
      { role: 'POR', top: 89, left: 50 }, { role: 'LI', top: 73, left: 20 }, { role: 'DFC', top: 75, left: 37 }, { role: 'DFC', top: 75, left: 63 }, { role: 'LD', top: 73, left: 80 },
      { role: 'MLG', top: 55, left: 50 }, { role: 'MAT', top: 42, left: 35 }, { role: 'MAT', top: 42, left: 65 },
      { role: 'EI', top: 18, left: 18 }, { role: 'DC', top: 15, left: 50 }, { role: 'DE', top: 18, left: 82 }
    ]
  },
  '4-4-2': {
    'Defensiva': [
      { role: 'POR', top: 89, left: 50 }, { role: 'LI', top: 73, left: 20 }, { role: 'DFC', top: 75, left: 37 }, { role: 'DFC', top: 75, left: 63 }, { role: 'LD', top: 73, left: 80 },
      { role: 'ME', top: 55, left: 18 }, { role: 'VOL', top: 60, left: 40 }, { role: 'VOL', top: 60, left: 60 }, { role: 'MD', top: 55, left: 82 },
      { role: 'DC', top: 25, left: 40 }, { role: 'DC', top: 25, left: 60 }
    ],
    'Equilibrado': [
      { role: 'POR', top: 89, left: 50 }, { role: 'LI', top: 73, left: 20 }, { role: 'DFC', top: 75, left: 37 }, { role: 'DFC', top: 75, left: 63 }, { role: 'LD', top: 73, left: 80 },
      { role: 'ME', top: 50, left: 18 }, { role: 'VOL', top: 58, left: 42 }, { role: 'MLG', top: 52, left: 58 }, { role: 'MD', top: 50, left: 82 },
      { role: 'DC', top: 22, left: 40 }, { role: 'DC', top: 22, left: 60 }
    ],
    'Ofensiva': [
      { role: 'POR', top: 89, left: 50 }, { role: 'LI', top: 73, left: 20 }, { role: 'DFC', top: 75, left: 37 }, { role: 'DFC', top: 75, left: 63 }, { role: 'LD', top: 73, left: 80 },
      { role: 'ME', top: 45, left: 18 }, { role: 'MLG', top: 50, left: 40 }, { role: 'MAT', top: 45, left: 60 }, { role: 'MD', top: 45, left: 82 },
      { role: 'DC', top: 20, left: 40 }, { role: 'DC', top: 20, left: 60 }
    ]
  },
  '4-2-3-1': {
    'Defensiva': [
      { role: 'POR', top: 89, left: 50 }, { role: 'LI', top: 73, left: 20 }, { role: 'DFC', top: 75, left: 37 }, { role: 'DFC', top: 75, left: 63 }, { role: 'LD', top: 73, left: 80 },
      { role: 'VOL', top: 65, left: 38 }, { role: 'VOL', top: 65, left: 62 },
      { role: 'MLG', top: 48, left: 22 }, { role: 'MLG', top: 48, left: 50 }, { role: 'MLG', top: 48, left: 78 },
      { role: 'DC', top: 25, left: 50 }
    ],
    'Equilibrado': [
      { role: 'POR', top: 89, left: 50 }, { role: 'LI', top: 73, left: 20 }, { role: 'DFC', top: 75, left: 37 }, { role: 'DFC', top: 75, left: 63 }, { role: 'LD', top: 73, left: 80 },
      { role: 'VOL', top: 62, left: 38 }, { role: 'VOL', top: 62, left: 62 },
      { role: 'MEI', top: 45, left: 22 }, { role: 'MAT', top: 42, left: 50 }, { role: 'MEI', top: 45, left: 78 },
      { role: 'DC', top: 20, left: 50 }
    ],
    'Ofensiva': [
      { role: 'POR', top: 89, left: 50 }, { role: 'LI', top: 73, left: 20 }, { role: 'DFC', top: 75, left: 37 }, { role: 'DFC', top: 75, left: 63 }, { role: 'LD', top: 73, left: 80 },
      { role: 'MLG', top: 58, left: 38 }, { role: 'MLG', top: 58, left: 62 },
      { role: 'MAT', top: 40, left: 22 }, { role: 'MAT', top: 38, left: 50 }, { role: 'MAT', top: 40, left: 78 },
      { role: 'DC', top: 15, left: 50 }
    ]
  },
  '4-2-4': {
    'Defensiva': [
      { role: 'POR', top: 89, left: 50 }, { role: 'LI', top: 73, left: 20 }, { role: 'DFC', top: 75, left: 37 }, { role: 'DFC', top: 75, left: 63 }, { role: 'LD', top: 73, left: 80 },
      { role: 'VOL', top: 60, left: 38 }, { role: 'VOL', top: 60, left: 62 },
      { role: 'EI', top: 28, left: 15 }, { role: 'DC', top: 25, left: 40 }, { role: 'DC', top: 25, left: 60 }, { role: 'DE', top: 28, left: 85 }
    ],
    'Equilibrado': [
      { role: 'POR', top: 89, left: 50 }, { role: 'LI', top: 73, left: 20 }, { role: 'DFC', top: 75, left: 37 }, { role: 'DFC', top: 75, left: 63 }, { role: 'LD', top: 73, left: 80 },
      { role: 'VOL', top: 58, left: 38 }, { role: 'MLG', top: 55, left: 62 },
      { role: 'EI', top: 22, left: 15 }, { role: 'DC', top: 20, left: 40 }, { role: 'DC', top: 20, left: 60 }, { role: 'DE', top: 22, left: 85 }
    ],
    'Ofensiva': [
      { role: 'POR', top: 89, left: 50 }, { role: 'LI', top: 73, left: 20 }, { role: 'DFC', top: 75, left: 37 }, { role: 'DFC', top: 75, left: 63 }, { role: 'LD', top: 73, left: 80 },
      { role: 'MLG', top: 52, left: 38 }, { role: 'MAT', top: 48, left: 62 },
      { role: 'EI', top: 18, left: 15 }, { role: 'DC', top: 15, left: 40 }, { role: 'DC', top: 15, left: 60 }, { role: 'DE', top: 18, left: 85 }
    ]
  },
  '3-5-2': {
    'Defensiva': [
      { role: 'POR', top: 89, left: 50 }, { role: 'DFC', top: 75, left: 28 }, { role: 'DFC', top: 78, left: 50 }, { role: 'DFC', top: 75, left: 72 },
      { role: 'ME', top: 55, left: 15 }, { role: 'VOL', top: 65, left: 35 }, { role: 'VOL', top: 65, left: 50 }, { role: 'VOL', top: 65, left: 65 }, { role: 'MD', top: 55, left: 85 },
      { role: 'DC', top: 25, left: 40 }, { role: 'DC', top: 25, left: 60 }
    ],
    'Equilibrado': [
      { role: 'POR', top: 89, left: 50 }, { role: 'DFC', top: 75, left: 28 }, { role: 'DFC', top: 78, left: 50 }, { role: 'DFC', top: 75, left: 72 },
      { role: 'ME', top: 50, left: 15 }, { role: 'VOL', top: 60, left: 35 }, { role: 'MLG', top: 48, left: 50 }, { role: 'VOL', top: 60, left: 65 }, { role: 'MD', top: 50, left: 85 },
      { role: 'DC', top: 22, left: 40 }, { role: 'DC', top: 22, left: 60 }
    ],
    'Ofensiva': [
      { role: 'POR', top: 89, left: 50 }, { role: 'DFC', top: 75, left: 28 }, { role: 'DFC', top: 78, left: 50 }, { role: 'DFC', top: 75, left: 72 },
      { role: 'ME', top: 45, left: 15 }, { role: 'MLG', top: 55, left: 35 }, { role: 'MAT', top: 42, left: 50 }, { role: 'MLG', top: 55, left: 65 }, { role: 'MD', top: 45, left: 85 },
      { role: 'DC', top: 20, left: 40 }, { role: 'DC', top: 20, left: 60 }
    ]
  },
  '5-3-2': {
    'Defensiva': [
      { role: 'POR', top: 89, left: 50 }, { role: 'LI', top: 73, left: 15 }, { role: 'DFC', top: 75, left: 33 }, { role: 'DFC', top: 78, left: 50 }, { role: 'DFC', top: 75, left: 67 }, { role: 'LD', top: 73, left: 85 },
      { role: 'VOL', top: 60, left: 35 }, { role: 'VOL', top: 60, left: 50 }, { role: 'VOL', top: 60, left: 65 },
      { role: 'DC', top: 25, left: 40 }, { role: 'DC', top: 25, left: 60 }
    ],
    'Equilibrado': [
      { role: 'POR', top: 89, left: 50 }, { role: 'LI', top: 73, left: 15 }, { role: 'DFC', top: 75, left: 33 }, { role: 'DFC', top: 78, left: 50 }, { role: 'DFC', top: 75, left: 67 }, { role: 'LD', top: 73, left: 85 },
      { role: 'MLG', top: 52, left: 30 }, { role: 'VOL', top: 55, left: 50 }, { role: 'MAT', top: 52, left: 70 },
      { role: 'DC', top: 22, left: 40 }, { role: 'DC', top: 22, left: 60 }
    ],
    'Ofensiva': [
      { role: 'POR', top: 89, left: 50 }, { role: 'LI', top: 73, left: 15 }, { role: 'DFC', top: 75, left: 33 }, { role: 'DFC', top: 78, left: 50 }, { role: 'DFC', top: 75, left: 67 }, { role: 'LD', top: 73, left: 85 },
      { role: 'MLG', top: 48, left: 30 }, { role: 'MAT', top: 45, left: 50 }, { role: 'MAT', top: 48, left: 70 },
      { role: 'DC', top: 20, left: 40 }, { role: 'DC', top: 20, left: 60 }
    ]
  },
  '4-5-1': {
    'Defensiva': [
      { role: 'POR', top: 89, left: 50 }, { role: 'LI', top: 73, left: 20 }, { role: 'DFC', top: 75, left: 37 }, { role: 'DFC', top: 75, left: 63 }, { role: 'LD', top: 73, left: 80 },
      { role: 'ME', top: 52, left: 18 }, { role: 'VOL', top: 62, left: 38 }, { role: 'VOL', top: 62, left: 50 }, { role: 'VOL', top: 62, left: 62 }, { role: 'MD', top: 52, left: 82 },
      { role: 'DC', top: 25, left: 50 }
    ],
    'Equilibrado': [
      { role: 'POR', top: 89, left: 50 }, { role: 'LI', top: 73, left: 20 }, { role: 'DFC', top: 75, left: 37 }, { role: 'DFC', top: 75, left: 63 }, { role: 'LD', top: 73, left: 80 },
      { role: 'ME', top: 48, left: 18 }, { role: 'VOL', top: 58, left: 38 }, { role: 'MLG', top: 45, left: 50 }, { role: 'VOL', top: 58, left: 62 }, { role: 'MD', top: 48, left: 82 },
      { role: 'DC', top: 20, left: 50 }
    ],
    'Ofensiva': [
      { role: 'POR', top: 89, left: 50 }, { role: 'LI', top: 73, left: 20 }, { role: 'DFC', top: 75, left: 37 }, { role: 'DFC', top: 75, left: 63 }, { role: 'LD', top: 73, left: 80 },
      { role: 'ME', top: 42, left: 18 }, { role: 'MLG', top: 52, left: 38 }, { role: 'MAT', top: 38, left: 50 }, { role: 'MLG', top: 52, left: 62 }, { role: 'MD', top: 42, left: 82 },
      { role: 'DC', top: 15, left: 50 }
    ]
  },
  '3-4-3': {
    'Defensiva': [
      { role: 'POR', top: 89, left: 50 }, { role: 'DFC', top: 75, left: 28 }, { role: 'DFC', top: 78, left: 50 }, { role: 'DFC', top: 75, left: 72 },
      { role: 'ME', top: 55, left: 18 }, { role: 'VOL', top: 60, left: 38 }, { role: 'VOL', top: 60, left: 62 }, { role: 'MD', top: 55, left: 82 },
      { role: 'EI', top: 28, left: 18 }, { role: 'DC', top: 25, left: 50 }, { role: 'DE', top: 28, left: 82 }
    ],
    'Equilibrado': [
      { role: 'POR', top: 89, left: 50 }, { role: 'DFC', top: 75, left: 28 }, { role: 'DFC', top: 78, left: 50 }, { role: 'DFC', top: 75, left: 72 },
      { role: 'ME', top: 50, left: 18 }, { role: 'MLG', top: 52, left: 38 }, { role: 'MLG', top: 52, left: 62 }, { role: 'MD', top: 50, left: 82 },
      { role: 'EI', top: 22, left: 18 }, { role: 'DC', top: 17, left: 50 }, { role: 'DE', top: 22, left: 82 }
    ],
    'Ofensiva': [
      { role: 'POR', top: 89, left: 50 }, { role: 'DFC', top: 75, left: 28 }, { role: 'DFC', top: 78, left: 50 }, { role: 'DFC', top: 75, left: 72 },
      { role: 'ME', top: 45, left: 18 }, { role: 'MAT', top: 48, left: 38 }, { role: 'MAT', top: 48, left: 62 }, { role: 'MD', top: 45, left: 82 },
      { role: 'EI', top: 18, left: 18 }, { role: 'DC', top: 12, left: 50 }, { role: 'DE', top: 18, left: 82 }
    ]
  }
};

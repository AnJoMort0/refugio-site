export const ADMIN_DATA_VERSION = 2;

function parseDateKey(value) {
  const [year, month, day] = value.split('-').map(Number);
  return new Date(year, month - 1, day);
}

function formatDateKey(date) {
  const next = new Date(date);
  next.setHours(0, 0, 0, 0);
  return `${next.getFullYear()}-${String(next.getMonth() + 1).padStart(2, '0')}-${String(next.getDate()).padStart(2, '0')}`;
}

function addDays(date, amount) {
  const next = new Date(date);
  next.setDate(next.getDate() + amount);
  return next;
}

function atDate(dateKey, time = '09:00') {
  return `${dateKey}T${time}:00`;
}

export function createInitialAdminState(now = new Date()) {
  const today = new Date(now);
  today.setHours(0, 0, 0, 0);
  const todayKey = formatDateKey(today);
  const yesterdayKey = formatDateKey(addDays(today, -1));
  const tomorrowKey = formatDateKey(addDays(today, 1));
  const inTwoDays = formatDateKey(addDays(today, 2));
  const inFourDays = formatDateKey(addDays(today, 4));
  const inSixDays = formatDateKey(addDays(today, 6));
  const inEightDays = formatDateKey(addDays(today, 8));
  const inElevenDays = formatDateKey(addDays(today, 11));
  const lastWeek = formatDateKey(addDays(today, -8));
  const lastWeekEnd = formatDateKey(addDays(today, -5));

  return {
    version: ADMIN_DATA_VERSION,
    generatedAt: now.toISOString(),
    updatedAt: now.toISOString(),
    property: {
      name: 'O Refúgio',
      address: 'Rua da Arejinha 627, 4550-518 Pedorido',
      defaultCheckInTime: '15:00',
      defaultCheckOutTime: '10:00',
      occupancyLimit: 6
    },
    pricing: {
      currency: 'EUR',
      adultNight: 48,
      childNight: 28,
      bikeDay: 5,
      securityDeposit: 200,
      seasons: [],
      groupDiscounts: [
        {
          id: 'GROUPDISC-4PLUS',
          minGuests: 4,
          amountPerNight: 5,
          active: true
        }
      ],
      discounts: [
        {
          id: 'DISC-SUMMER-2026',
          title: 'Semana tranquila',
          code: 'REFUGIO10',
          type: 'percentage',
          percentage: 10,
          amount: 0,
          maxUses: 0,
          usedCount: 0,
          startDate: tomorrowKey,
          endDate: inEightDays,
          appliesTo: 'accommodation',
          active: true
        }
      ]
    },
    guests: [
      {
        id: 'GUEST-RODRIGUES-MARTINS',
        name: 'Rodrigues Martins',
        email: 'rodrigues.martins@example.com',
        phone: '+351 912 345 678',
        preferredLanguage: 'pt',
        nationality: 'Portugal',
        notes: 'Prefere contacto por email.'
      },
      {
        id: 'GUEST-CLAIRE-DUBOIS',
        name: 'Claire Dubois',
        email: 'claire@example.fr',
        phone: '+33 6 11 22 33 44',
        preferredLanguage: 'fr',
        nationality: 'França',
        notes: ''
      },
      {
        id: 'GUEST-TOM-WALKER',
        name: 'Tom Walker',
        email: 'tom.walker@example.com',
        phone: '+44 7700 900123',
        preferredLanguage: 'en',
        nationality: 'Reino Unido',
        notes: 'Já pediu informação sobre bicicletas.'
      }
    ],
    reservations: [
      {
        id: 'RES-2026-0001',
        guestId: 'GUEST-RODRIGUES-MARTINS',
        source: 'website',
        sourceReference: 'WEB-0001',
        status: 'checked_in',
        paymentStatus: 'paid',
        preferredLanguage: 'pt',
        contact: {
          name: 'Rodrigues Martins',
          email: 'rodrigues.martins@example.com',
          phone: '+351 912 345 678'
        },
        stay: {
          checkIn: yesterdayKey,
          checkOut: inTwoDays,
          checkInTime: '16:00',
          checkOutTime: '10:00'
        },
        guests: {
          adults: 2,
          children: 1,
          childAges: [7]
        },
        pricing: {
          adultNight: 48,
          childNight: 28,
          bikeDay: 5,
          discountPercent: 0,
          depositIncluded: true
        },
        extras: {
          bikes: { count: 2, days: 2 }
        },
        notes: {
          owner: 'Pagamento confirmado por transferência.',
          operational: 'Preparar cama extra no quarto pequeno.'
        },
        createdAt: atDate(lastWeek, '12:45'),
        updatedAt: atDate(todayKey, '09:30')
      },
      {
        id: 'RES-2026-0002',
        guestId: 'GUEST-CLAIRE-DUBOIS',
        source: 'booking',
        sourceReference: 'BOOKING-8841',
        status: 'confirmed',
        paymentStatus: 'paid',
        preferredLanguage: 'fr',
        contact: {
          name: 'Claire Dubois',
          email: 'claire@example.fr',
          phone: '+33 6 11 22 33 44'
        },
        stay: {
          checkIn: inFourDays,
          checkOut: inSixDays,
          checkInTime: '15:30',
          checkOutTime: '10:00'
        },
        guests: {
          adults: 2,
          children: 0,
          childAges: []
        },
        pricing: {
          adultNight: 52,
          childNight: 28,
          bikeDay: 5,
          discountPercent: 0,
          depositIncluded: false
        },
        extras: {
          bikes: { count: 0, days: 0 }
        },
        notes: {
          owner: '',
          operational: 'Chegada prevista de carro.'
        },
        createdAt: atDate(lastWeekEnd, '18:20'),
        updatedAt: atDate(lastWeekEnd, '18:20')
      },
      {
        id: 'RES-2026-0003',
        guestId: 'GUEST-TOM-WALKER',
        source: 'private',
        sourceReference: 'PHONE-2026-003',
        status: 'awaiting_payment',
        paymentStatus: 'awaiting_transfer',
        preferredLanguage: 'en',
        contact: {
          name: 'Tom Walker',
          email: 'tom.walker@example.com',
          phone: '+44 7700 900123'
        },
        stay: {
          checkIn: inEightDays,
          checkOut: inElevenDays,
          checkInTime: '17:00',
          checkOutTime: '09:30'
        },
        guests: {
          adults: 3,
          children: 0,
          childAges: []
        },
        pricing: {
          adultNight: 48,
          childNight: 28,
          bikeDay: 5,
          discountPercent: 10,
          depositIncluded: false
        },
        extras: {
          bikes: { count: 1, days: 3 }
        },
        notes: {
          owner: 'A aguardar comprovativo de transferência.',
          operational: ''
        },
        createdAt: atDate(todayKey, '11:05'),
        updatedAt: atDate(todayKey, '11:05')
      }
    ],
    websiteRequests: [
      {
        id: 'REQ-2026-0004',
        status: 'new',
        submittedAt: atDate(todayKey, '14:12'),
        preferredLanguage: 'es',
        contact: {
          name: 'Lucía García',
          email: 'lucia@example.es',
          phone: '+34 600 111 222'
        },
        stay: {
          checkIn: inSixDays,
          checkOut: inEightDays,
          checkInTime: '16:00',
          checkOutTime: '10:00'
        },
        guests: {
          adults: 2,
          children: 2,
          childAges: [4, 9]
        },
        extras: {
          bikes: { count: 0, days: 0 }
        },
        marketingOptIn: true,
        comments: 'Gostaria de saber se há berço disponível.',
        estimatedTotal: 304
      },
      {
        id: 'REQ-2026-0005',
        status: 'new',
        submittedAt: atDate(todayKey, '17:40'),
        preferredLanguage: 'de',
        contact: {
          name: 'Marlene Keller',
          email: 'marlene@example.de',
          phone: '+49 170 555 1212'
        },
        stay: {
          checkIn: tomorrowKey,
          checkOut: inFourDays,
          checkInTime: '15:00',
          checkOutTime: '10:00'
        },
        guests: {
          adults: 2,
          children: 0,
          childAges: []
        },
        extras: {
          bikes: { count: 1, days: 2 }
        },
        marketingOptIn: false,
        comments: 'Chegada provável ao fim da tarde.',
        estimatedTotal: 298
      }
    ],
    employees: [
      {
        id: 'EMP-JORGE',
        userId: 'user-owner-jorge',
        name: 'Jorge',
        role: 'owner',
        active: true,
        hourlyRates: [{ from: '2026-01-01', rate: 0 }],
        permissionsProfile: 'owner',
        compensationDefault: 'free'
      },
      {
        id: 'EMP-PAULA',
        userId: 'user-owner-paula',
        name: 'Paula',
        role: 'owner',
        active: true,
        hourlyRates: [{ from: '2026-01-01', rate: 0 }],
        permissionsProfile: 'owner',
        compensationDefault: 'free'
      },
      {
        id: 'EMP-BARBARA',
        userId: 'user-owner-barbara',
        name: 'Bárbara',
        role: 'owner',
        active: true,
        hourlyRates: [{ from: '2026-01-01', rate: 0 }],
        permissionsProfile: 'owner',
        compensationDefault: 'free'
      },
      {
        id: 'EMP-MARLENE',
        userId: 'user-owner-marlene',
        name: 'Marlene',
        role: 'owner',
        active: true,
        hourlyRates: [{ from: '2026-01-01', rate: 0 }],
        permissionsProfile: 'owner',
        compensationDefault: 'free'
      },
      {
        id: 'EMP-ANDRE',
        userId: 'user-dev-andre',
        name: 'André',
        role: 'dev',
        active: true,
        hourlyRates: [{ from: '2026-01-01', rate: 0 }],
        permissionsProfile: 'dev',
        compensationDefault: 'free'
      },
      {
        id: 'EMP-DULCE',
        userId: 'user-employee-dulce',
        name: 'Dulce',
        role: 'employee',
        active: true,
        hourlyRates: [
          { from: '2026-01-01', rate: 7 },
          { from: '2026-08-01', rate: 8 }
        ],
        permissionsProfile: 'employee',
        compensationDefault: 'paid'
      },
      {
        id: 'EMP-FABIO',
        userId: 'user-employee-fabio',
        name: 'Fábio',
        role: 'employee',
        active: true,
        hourlyRates: [{ from: '2026-01-01', rate: 0 }],
        permissionsProfile: 'employee',
        compensationDefault: 'voluntary'
      }
    ],
    workSessions: [
      {
        id: 'WORK-2026-0001',
        employeeId: 'EMP-DULCE',
        date: lastWeek,
        start: `${lastWeek}T09:00:00`,
        end: `${lastWeek}T13:30:00`,
        rateSnapshot: 8,
        compensationType: 'paid',
        tasks: ['clean', 'shopping'],
        otherDetails: '',
        notes: 'Limpeza e preparação exterior.'
      },
      {
        id: 'WORK-2026-0002',
        employeeId: 'EMP-DULCE',
        date: todayKey,
        start: `${todayKey}T09:20:00`,
        end: null,
        rateSnapshot: 8,
        compensationType: 'paid',
        tasks: ['clean'],
        otherDetails: '',
        notes: 'Turno iniciado no protótipo.'
      },
      {
        id: 'WORK-2026-0003',
        employeeId: 'EMP-JORGE',
        date: yesterdayKey,
        start: `${yesterdayKey}T15:00:00`,
        end: `${yesterdayKey}T18:10:00`,
        rateSnapshot: 0,
        compensationType: 'free',
        tasks: ['maintenance', 'shopping'],
        otherDetails: '',
        notes: 'Trabalho de proprietário sem pagamento.'
      },
      {
        id: 'WORK-2026-0004',
        employeeId: 'EMP-FABIO',
        date: lastWeekEnd,
        start: `${lastWeekEnd}T10:00:00`,
        end: `${lastWeekEnd}T12:45:00`,
        rateSnapshot: 0,
        compensationType: 'voluntary',
        tasks: ['maintenance', 'other'],
        otherDetails: 'Ajuda no exterior e pequenas reparações.',
        notes: 'Trabalho voluntário.'
      }
    ],
    expenses: [
      {
        id: 'EXP-2026-0001',
        date: lastWeek,
        category: 'consumiveis',
        description: 'Produtos de limpeza e papel',
        amount: 34.8,
        notes: ''
      },
      {
        id: 'EXP-2026-0002',
        date: yesterdayKey,
        category: 'manutencao',
        description: 'Pequena reparação exterior',
        amount: 58,
        notes: 'Recibo a anexar quando houver armazenamento privado.'
      }
    ],
    auditLog: [
      {
        id: 'AUDIT-2026-0001',
        at: now.toISOString(),
        actorId: 'system',
        actorName: 'Sistema',
        action: 'Dados de demonstração criados',
        entityType: 'system',
        entityId: 'seed'
      }
    ]
  };
}

export { addDays, formatDateKey, parseDateKey };

import { addDays, formatDateKey, parseDateKey } from '../utils/date.js';

export const ADMIN_DATA_VERSION = 6;

const DEFAULT_RESERVATION_PRICING = {
  adultNight: 70,
  minimumPaidAdults: 2,
  childNight: 65,
  bikeDay: 5,
  discountType: 'percentage',
  discountPercent: 0,
  discountAmount: 0,
  discountCode: '',
  depositIncluded: false
};

function atDate(dateKey, time = '09:00') {
  return `${dateKey}T${time}:00`;
}

function createReservation(options) {
  const { bikes = {}, guests = {}, preferences = {}, pricing = {}, notes = {}, ...reservation } = options;
  return {
    ...reservation,
    guests: { adults: 2, children: 0, childAges: [], ...guests },
    preferences: { bed: '', ...preferences },
    pricing: { ...DEFAULT_RESERVATION_PRICING, ...pricing },
    extras: { bikes: { count: 0, days: 0, ...bikes } },
    guestAdjustments: options.guestAdjustments || [],
    marketingOptIn: Boolean(options.marketingOptIn),
    websiteRequestId: options.websiteRequestId || '',
    notes: { owner: '', operational: '', ...notes },
    updatedAt: options.updatedAt || options.createdAt,
    createdBy: options.createdBy || 'user-owner-jorge'
  };
}

function createWebsiteRequest(options) {
  const { bikes = {}, guests = {}, preferences = {}, ...request } = options;
  return {
    ...request,
    status: options.status || 'new',
    updatedAt: options.updatedAt || options.submittedAt,
    preferredLanguage: options.preferredLanguage || 'pt',
    guests: { adults: 2, children: 0, childAges: [], ...guests },
    preferences: { bed: '', ...preferences },
    extras: { bikes: { count: 0, days: 0, ...bikes } },
    depositPrepay: Boolean(options.depositPrepay),
    marketingOptIn: Boolean(options.marketingOptIn),
    comments: options.comments || '',
    estimatedTotal: Number(options.estimatedTotal || 0)
  };
}

export function createInitialAdminState(now = new Date()) {
  const today = new Date(now);
  today.setHours(0, 0, 0, 0);
  const todayKey = formatDateKey(today);
  const dateAt = (offset) => formatDateKey(addDays(today, offset));
  const timestampAt = (offset, time = '09:00') => atDate(dateAt(offset), time);
  const id = (prefix, sequence, offset = 0) =>
    `${prefix}-${dateAt(offset).slice(0, 4)}-${String(sequence).padStart(4, '0')}`;
  const stay = (checkInOffset, checkOutOffset, checkInTime = '15:00', checkOutTime = '10:00') => ({
    checkIn: dateAt(checkInOffset),
    checkOut: dateAt(checkOutOffset),
    checkInTime,
    checkOutTime
  });

  const reservationIds = {
    current: id('RES', 1, -1),
    upcomingFrench: id('RES', 2, 3),
    awaitingEnglish: id('RES', 3, 7),
    abritelSpanish: id('RES', 4, 11),
    ownerStay: id('RES', 5, 16),
    provisional: id('RES', 6, 19),
    familyGerman: id('RES', 7, 23),
    abritelGerman: id('RES', 8, 29),
    cancelledFuture: id('RES', 9, 3),
    recentRepeat: id('RES', 10, -5),
    privatePast: id('RES', 11, -12),
    noShow: id('RES', 12, -19),
    cancelledPast: id('RES', 13, -27),
    abritelPast: id('RES', 14, -38),
    frenchRepeat: id('RES', 15, -55),
    privateCancelled: id('RES', 16, -75),
    ownerPast: id('RES', 17, -105),
    extraGuestsPast: id('RES', 18, -180),
    repeatPast: id('RES', 19, -240),
    previousYear: id('RES', 20, -370)
  };

  const requestIds = {
    currentAccepted: id('REQ', 1, -18),
    futureAccepted: id('REQ', 2, -28),
    conflictNew: id('REQ', 3),
    germanNew: id('REQ', 4),
    discountedNew: id('REQ', 5),
    englishNew: id('REQ', 6),
    portugueseNew: id('REQ', 7),
    rejectedUnavailable: id('REQ', 8, -3),
    rejectedWithdrawn: id('REQ', 9, -14),
    rejectedPast: id('REQ', 10, -45)
  };

  const guests = [
    { id: 'GUEST-RODRIGUES-MARTINS', name: 'Rodrigues Martins', email: 'rodrigues.martins@example.com', phone: '+351 912 345 678', preferredLanguage: 'pt', nationality: 'Portugal', notes: 'Hóspede repetente. Prefere contacto por email.' },
    { id: 'GUEST-CLAIRE-DUBOIS', name: 'Claire Dubois', email: 'claire.dubois@example.fr', phone: '+33 6 11 22 33 44', preferredLanguage: 'fr', nationality: 'França', notes: 'Hóspede repetente; viaja de carro.' },
    { id: 'GUEST-TOM-WALKER', name: 'Tom Walker', email: 'tom.walker@example.com', phone: '+44 7700 900123', preferredLanguage: 'en', nationality: 'Reino Unido', notes: 'Já pediu informação sobre bicicletas.' },
    { id: 'GUEST-SOFIA-ALVAREZ', name: 'Sofía Álvarez', email: 'sofia.alvarez@example.es', phone: '+34 611 234 567', preferredLanguage: 'es', nationality: 'Espanha', notes: 'Viaja com duas crianças.' },
    { id: 'GUEST-MANUEL-PEREIRA', name: 'Manuel Pereira', email: 'manuel.pereira@example.pt', phone: '917 222 444', preferredLanguage: 'pt', nationality: 'Portugal', notes: 'Estadia de uso do proprietário, sem cobrança.' },
    { id: 'GUEST-EMMA-WILSON', name: 'Emma Wilson', email: 'emma.wilson@example.ie', phone: '', preferredLanguage: 'en', nationality: 'Irlanda', notes: 'Contacto apenas por email.' },
    { id: 'GUEST-ANNA-SCHNEIDER', name: 'Anna Schneider', email: 'anna.schneider@example.de', phone: '+49 151 23456789', preferredLanguage: 'de', nationality: 'Alemanha', notes: '' },
    { id: 'GUEST-LUKAS-WEBER', name: 'Lukas Weber', email: 'lukas.weber@example.at', phone: '+43 660 1234567', preferredLanguage: 'de', nationality: 'Áustria', notes: 'Reserva recebida através da Abritel.fr.' },
    { id: 'GUEST-INES-CARVALHO', name: 'Inês Carvalho', email: 'ines.carvalho@example.pt', phone: '934 555 210', preferredLanguage: 'pt', nationality: 'Portugal', notes: '' },
    { id: 'GUEST-OLIVER-SMITH', name: 'Oliver Smith', email: 'oliver.smith@example.co.uk', phone: '+44 7700 900456', preferredLanguage: 'en', nationality: 'Reino Unido', notes: 'Não compareceu e não respondeu às mensagens.' },
    { id: 'GUEST-LUCIA-MARCIA', name: 'Lucia Marcia', email: 'lucia.marcia@example.com.br', phone: '+55 11 91234 5678', preferredLanguage: 'pt', nationality: 'Brasil', notes: 'Cancelou por alteração do voo.' },
    { id: 'GUEST-GIULIA-ROSSI', name: 'Giulia Rossi', email: 'giulia.rossi@example.it', phone: '+39 320 123 4567', preferredLanguage: 'en', nationality: 'Itália', notes: '' },
    { id: 'GUEST-PIERRE-MARTIN', name: 'Pierre Martin', email: 'pierre.martin@example.fr', phone: '+33 6 98 76 54 32', preferredLanguage: 'fr', nationality: 'França', notes: '' },
    { id: 'GUEST-JOAO-PEREIRA', name: 'João Pereira', email: 'joao.pereira@example.pt', phone: '229 555 010', preferredLanguage: 'pt', nationality: 'Portugal', notes: 'Reserva de utilização familiar do alojamento.' },
    { id: 'GUEST-SARA-OLIVEIRA', name: 'Sara Oliveira', email: 'sara.oliveira@example.pt', phone: '+351 963 444 111', preferredLanguage: 'pt', nationality: 'Portugal', notes: 'Foram acrescentados hóspedes a meio da estadia.' },
    { id: 'GUEST-MICHAEL-BROWN', name: 'Michael Brown', email: 'michael.brown@example.us', phone: '+1 202 555 0176', preferredLanguage: 'en', nationality: 'Estados Unidos', notes: 'Reserva do ano anterior para comparação estatística.' }
  ];
  const guestById = new Map(guests.map((guest) => [guest.id, guest]));
  const contactFor = (guestId) => {
    const guest = guestById.get(guestId);
    return { name: guest?.name || '', email: guest?.email || '', phone: guest?.phone || '' };
  };
  const reservation = (options) => createReservation({ ...options, contact: contactFor(options.guestId) });

  const reservations = [
    reservation({
      id: reservationIds.current,
      guestId: 'GUEST-RODRIGUES-MARTINS',
      source: 'website',
      sourceReference: requestIds.currentAccepted,
      websiteRequestId: requestIds.currentAccepted,
      status: 'checked_in',
      paymentStatus: 'paid',
      preferredLanguage: 'pt',
      stay: stay(-1, 2, '16:00'),
      guests: { adults: 2, children: 1, childAges: [7] },
      preferences: { bed: 'double' },
      pricing: { adultNight: 62.5, depositIncluded: true },
      bikes: { count: 2, days: 2 },
      guestAdjustments: [{
        id: 'GUESTADD-CURRENT-0001',
        fromDate: todayKey,
        adults: 1,
        children: 0,
        childAges: [],
        discountType: 'percentage',
        discountPercent: 10,
        discountAmount: 0,
        paymentStatus: 'awaiting_transfer',
        createdAt: timestampAt(0, '09:15'),
        createdBy: 'user-owner-paula'
      }],
      marketingOptIn: true,
      notes: {
        owner: 'Pagamento principal confirmado por transferência. Falta receber o valor do hóspede extra.',
        operational: 'Preparar cama extra e duas bicicletas. Hóspede extra chega hoje.'
      },
      createdAt: timestampAt(-18, '12:45'),
      updatedAt: timestampAt(0, '09:30'),
      createdBy: 'user-owner-paula'
    }),
    reservation({
      id: reservationIds.upcomingFrench,
      guestId: 'GUEST-CLAIRE-DUBOIS',
      source: 'booking',
      sourceReference: 'BOOKING-8841973621',
      status: 'confirmed',
      paymentStatus: 'paid',
      preferredLanguage: 'fr',
      stay: stay(3, 6, '15:30'),
      preferences: { bed: 'double' },
      notes: { operational: 'Chegada de carro. Deixar instruções de estacionamento prontas.' },
      createdAt: timestampAt(-35, '18:20'),
      updatedAt: timestampAt(-4, '11:10'),
      createdBy: 'user-owner-marlene'
    }),
    reservation({
      id: reservationIds.awaitingEnglish,
      guestId: 'GUEST-TOM-WALKER',
      source: 'private',
      sourceReference: 'PHONE-2026-003',
      status: 'awaiting_payment',
      paymentStatus: 'awaiting_transfer',
      preferredLanguage: 'en',
      stay: stay(7, 10, '17:00', '09:30'),
      guests: { adults: 3 },
      preferences: { bed: 'single' },
      pricing: { discountPercent: 10, discountCode: 'REGRESSO10' },
      bikes: { count: 1, days: 3 },
      notes: { owner: 'A aguardar comprovativo de transferência.', operational: 'Confirmar entrega da bicicleta.' },
      createdAt: timestampAt(-2, '11:05'),
      createdBy: 'user-owner-jorge'
    }),
    reservation({
      id: reservationIds.abritelSpanish,
      guestId: 'GUEST-SOFIA-ALVAREZ',
      source: 'website',
      sourceReference: requestIds.futureAccepted,
      websiteRequestId: requestIds.futureAccepted,
      status: 'confirmed',
      paymentStatus: 'deposit_paid',
      preferredLanguage: 'es',
      stay: stay(11, 15),
      guests: { adults: 2, children: 2, childAges: [4, 9] },
      preferences: { bed: 'double' },
      pricing: { discountType: 'amount', discountAmount: 35, discountCode: 'FAMILIA35' },
      notes: { owner: 'Depósito recebido; restante valor liquidado pela plataforma.', operational: 'Disponibilizar berço e cadeira de refeição.' },
      createdAt: timestampAt(-28, '10:20'),
      updatedAt: timestampAt(-7, '16:40'),
      createdBy: 'user-owner-barbara'
    }),
    reservation({
      id: reservationIds.ownerStay,
      guestId: 'GUEST-MANUEL-PEREIRA',
      source: 'owner',
      sourceReference: 'OWNER-STAY-01',
      status: 'confirmed',
      paymentStatus: 'paid',
      preferredLanguage: 'pt',
      stay: stay(16, 18),
      guests: { adults: 1 },
      pricing: { discountPercent: 100 },
      notes: { owner: 'Utilização do proprietário, registada para bloquear o calendário sem receita.' },
      createdAt: timestampAt(-12, '08:45')
    }),
    reservation({
      id: reservationIds.provisional,
      guestId: 'GUEST-EMMA-WILSON',
      source: 'website',
      sourceReference: 'PRE-ENQUIRY-204',
      status: 'request',
      paymentStatus: 'unpaid',
      preferredLanguage: 'en',
      stay: stay(19, 22),
      guests: { adults: 1 },
      notes: { owner: 'Pedido provisório registado manualmente; datas ainda não bloqueadas.' },
      createdAt: timestampAt(-1, '17:25'),
      createdBy: 'user-dev-andre'
    }),
    reservation({
      id: reservationIds.familyGerman,
      guestId: 'GUEST-ANNA-SCHNEIDER',
      source: 'booking',
      sourceReference: 'BOOKING-9926510473',
      status: 'confirmed',
      paymentStatus: 'paid',
      preferredLanguage: 'de',
      stay: stay(23, 27, '18:00'),
      guests: { adults: 2, children: 2, childAges: [6, 11] },
      preferences: { bed: 'single' },
      bikes: { count: 2, days: 4 },
      notes: { operational: 'Chegada tardia acordada. Preparar duas bicicletas e camas individuais.' },
      createdAt: timestampAt(-41, '14:05'),
      updatedAt: timestampAt(-6, '09:50'),
      createdBy: 'user-owner-marlene'
    }),
    reservation({
      id: reservationIds.abritelGerman,
      guestId: 'GUEST-LUKAS-WEBER',
      source: 'abritel',
      sourceReference: 'ABRITEL-HA-730442',
      status: 'awaiting_payment',
      paymentStatus: 'awaiting_transfer',
      preferredLanguage: 'de',
      stay: stay(29, 33),
      pricing: { depositIncluded: true },
      notes: { owner: 'Instruções de pagamento enviadas; prazo termina dentro de três dias.' },
      createdAt: timestampAt(-1, '10:15'),
      createdBy: 'user-owner-paula'
    }),
    reservation({
      id: reservationIds.cancelledFuture,
      guestId: 'GUEST-LUCIA-MARCIA',
      source: 'website',
      sourceReference: 'WEB-CANCELLED-118',
      status: 'cancelled',
      paymentStatus: 'refunded',
      preferredLanguage: 'pt',
      stay: stay(3, 6),
      guests: { adults: 2, children: 1, childAges: [10] },
      pricing: { depositIncluded: true },
      marketingOptIn: true,
      notes: { owner: 'Cancelada por alteração do voo. Reembolso integral processado.' },
      createdAt: timestampAt(-32, '16:10'),
      updatedAt: timestampAt(-5, '09:05'),
      createdBy: 'user-owner-barbara'
    }),
    reservation({
      id: reservationIds.recentRepeat,
      guestId: 'GUEST-RODRIGUES-MARTINS',
      source: 'website',
      sourceReference: 'WEB-RETURN-091',
      status: 'checked_out',
      paymentStatus: 'paid',
      preferredLanguage: 'pt',
      stay: stay(-5, -1, '15:20', '09:45'),
      preferences: { bed: 'double' },
      pricing: { discountPercent: 10, discountCode: 'REGRESSO10' },
      bikes: { count: 2, days: 3 },
      marketingOptIn: true,
      notes: { owner: 'Segunda estadia deste hóspede.', operational: 'Check-out concluído sem incidências.' },
      createdAt: timestampAt(-70, '13:40'),
      updatedAt: timestampAt(-1, '10:05'),
      createdBy: 'user-owner-paula'
    }),
    reservation({
      id: reservationIds.privatePast,
      guestId: 'GUEST-INES-CARVALHO',
      source: 'private',
      sourceReference: 'WHATSAPP-2026-044',
      status: 'checked_out',
      paymentStatus: 'paid',
      preferredLanguage: 'pt',
      stay: stay(-12, -8, '17:10'),
      guests: { adults: 1 },
      pricing: { discountType: 'amount', discountAmount: 20 },
      notes: { owner: 'Reserva feita por WhatsApp.', operational: 'Check-out concluído.' },
      createdAt: timestampAt(-29, '19:05'),
      updatedAt: timestampAt(-8, '10:20')
    }),
    reservation({
      id: reservationIds.noShow,
      guestId: 'GUEST-OLIVER-SMITH',
      source: 'booking',
      sourceReference: 'BOOKING-7712049850',
      status: 'no_show',
      paymentStatus: 'deposit_paid',
      preferredLanguage: 'en',
      stay: stay(-19, -16),
      notes: { owner: 'Não compareceu. Contactado por email e telefone sem resposta.' },
      createdAt: timestampAt(-64, '08:30'),
      updatedAt: timestampAt(-18, '20:15'),
      createdBy: 'user-owner-marlene'
    }),
    reservation({
      id: reservationIds.cancelledPast,
      guestId: 'GUEST-LUCIA-MARCIA',
      source: 'website',
      sourceReference: 'WEB-2026-062',
      status: 'cancelled',
      paymentStatus: 'refunded',
      preferredLanguage: 'pt',
      stay: stay(-27, -23),
      guests: { adults: 2, children: 1, childAges: [8] },
      pricing: { discountPercent: 5, depositIncluded: true },
      notes: { owner: 'Cancelamento dentro do prazo; reembolso processado.' },
      createdAt: timestampAt(-80, '15:30'),
      updatedAt: timestampAt(-31, '12:15'),
      createdBy: 'user-owner-barbara'
    }),
    reservation({
      id: reservationIds.abritelPast,
      guestId: 'GUEST-GIULIA-ROSSI',
      source: 'abritel',
      sourceReference: 'ABRITEL-HA-701842',
      status: 'checked_out',
      paymentStatus: 'paid',
      preferredLanguage: 'en',
      stay: stay(-38, -34, '16:30', '09:30'),
      guests: { adults: 2, children: 1, childAges: [5] },
      bikes: { count: 3, days: 2 },
      notes: { operational: 'Três bicicletas devolvidas sem danos.' },
      createdAt: timestampAt(-96, '11:50'),
      updatedAt: timestampAt(-34, '10:10'),
      createdBy: 'user-owner-marlene'
    }),
    reservation({
      id: reservationIds.frenchRepeat,
      guestId: 'GUEST-CLAIRE-DUBOIS',
      source: 'booking',
      sourceReference: 'BOOKING-7738194052',
      status: 'checked_out',
      paymentStatus: 'paid',
      preferredLanguage: 'fr',
      stay: stay(-55, -51),
      preferences: { bed: 'double' },
      notes: { owner: 'Primeira estadia de Claire; deixou avaliação positiva.' },
      createdAt: timestampAt(-142, '09:25'),
      updatedAt: timestampAt(-51, '10:30'),
      createdBy: 'user-owner-paula'
    }),
    reservation({
      id: reservationIds.privateCancelled,
      guestId: 'GUEST-PIERRE-MARTIN',
      source: 'private',
      sourceReference: 'EMAIL-2026-019',
      status: 'cancelled',
      paymentStatus: 'unpaid',
      preferredLanguage: 'fr',
      stay: stay(-75, -71),
      notes: { owner: 'Cancelou antes de efetuar qualquer pagamento.' },
      createdAt: timestampAt(-110, '17:35'),
      updatedAt: timestampAt(-91, '08:55')
    }),
    reservation({
      id: reservationIds.ownerPast,
      guestId: 'GUEST-JOAO-PEREIRA',
      source: 'owner',
      sourceReference: 'OWNER-STAY-00',
      status: 'checked_out',
      paymentStatus: 'paid',
      preferredLanguage: 'pt',
      stay: stay(-105, -101),
      pricing: { discountPercent: 100 },
      notes: { owner: 'Utilização familiar sem receita; ocupação preservada nas estatísticas.' },
      createdAt: timestampAt(-120, '10:10'),
      updatedAt: timestampAt(-101, '11:00')
    }),
    reservation({
      id: reservationIds.extraGuestsPast,
      guestId: 'GUEST-SARA-OLIVEIRA',
      source: 'website',
      sourceReference: 'WEB-2026-014',
      status: 'checked_out',
      paymentStatus: 'paid',
      preferredLanguage: 'pt',
      stay: stay(-180, -175, '15:40'),
      preferences: { bed: 'double' },
      guestAdjustments: [{
        id: 'GUESTADD-HISTORY-0001',
        fromDate: dateAt(-178),
        adults: 1,
        children: 1,
        childAges: [9],
        discountType: 'amount',
        discountPercent: 0,
        discountAmount: 20,
        paymentStatus: 'paid',
        createdAt: timestampAt(-178, '09:30'),
        createdBy: 'user-owner-barbara'
      }],
      notes: { owner: 'Dois hóspedes acrescentados durante a estadia; pagamento recebido no próprio dia.' },
      createdAt: timestampAt(-235, '12:00'),
      updatedAt: timestampAt(-175, '10:25'),
      createdBy: 'user-owner-barbara'
    }),
    reservation({
      id: reservationIds.repeatPast,
      guestId: 'GUEST-RODRIGUES-MARTINS',
      source: 'private',
      sourceReference: 'PHONE-2025-061',
      status: 'checked_out',
      paymentStatus: 'paid',
      preferredLanguage: 'pt',
      stay: stay(-240, -236, '16:00'),
      bikes: { count: 1, days: 4 },
      notes: { owner: 'Primeira reserva de Rodrigues Martins.' },
      createdAt: timestampAt(-285, '14:30'),
      updatedAt: timestampAt(-236, '10:15'),
      createdBy: 'user-owner-paula'
    }),
    reservation({
      id: reservationIds.previousYear,
      guestId: 'GUEST-MICHAEL-BROWN',
      source: 'booking',
      sourceReference: 'BOOKING-2025-551904',
      status: 'checked_out',
      paymentStatus: 'paid',
      preferredLanguage: 'en',
      stay: stay(-370, -365),
      guests: { adults: 2, children: 2, childAges: [3, 12] },
      preferences: { bed: 'single' },
      pricing: { discountPercent: 5 },
      bikes: { count: 2, days: 5 },
      notes: { owner: 'Registo do ano anterior para comparações e exportações.' },
      createdAt: timestampAt(-455, '10:45'),
      updatedAt: timestampAt(-365, '10:20'),
      createdBy: 'user-owner-marlene'
    })
  ];

  const websiteRequests = [
    createWebsiteRequest({
      id: requestIds.conflictNew,
      submittedAt: timestampAt(0, '08:42'),
      preferredLanguage: 'es',
      contact: { name: 'Lucía García', email: 'lucia.garcia@example.es', phone: '+34 600 111 222', nationality: 'Espanha' },
      stay: stay(4, 7, '16:00'),
      guests: { adults: 2, children: 2, childAges: [4, 9] },
      preferences: { bed: 'double' },
      marketingOptIn: true,
      comments: 'Precisamos de berço. Se estas datas não estiverem livres, podemos chegar um dia mais tarde.',
      estimatedTotal: 765
    }),
    createWebsiteRequest({
      id: requestIds.germanNew,
      submittedAt: timestampAt(0, '10:17'),
      preferredLanguage: 'de',
      contact: { name: 'Marlene Keller', email: 'marlene.keller@example.de', phone: '+49 170 555 1212', nationality: 'Alemanha' },
      stay: stay(34, 37, '18:30'),
      bikes: { count: 1, days: 2 },
      depositPrepay: true,
      comments: 'Chegada provável ao fim da tarde. Gostaria de reservar uma bicicleta.',
      estimatedTotal: 585
    }),
    createWebsiteRequest({
      id: requestIds.discountedNew,
      submittedAt: timestampAt(0, '11:36'),
      preferredLanguage: 'pt',
      contact: { name: 'Beatriz Costa', email: 'beatriz.costa@example.pt', phone: '962 110 844', nationality: 'Portugal' },
      stay: stay(23, 26),
      guests: { adults: 2, children: 1, childAges: [6] },
      preferences: { bed: 'single' },
      marketingOptIn: true,
      comments: 'Usei o código VERÃO10. A criança tem alergia a frutos secos.',
      pricing: { discountCode: 'VERAO10', discountTitle: 'Campanha de verão', discountType: 'amount', discountPercent: 0, discountAmount: 57 },
      estimatedTotal: 513
    }),
    createWebsiteRequest({
      id: requestIds.englishNew,
      submittedAt: timestampAt(-1, '21:08'),
      preferredLanguage: 'en',
      contact: { name: 'Hiro Tanaka', email: 'hiro.tanaka@example.jp', phone: '', nationality: 'Japão' },
      stay: stay(40, 44, '15:00', '09:00'),
      guests: { adults: 1 },
      comments: 'I will travel by public transport and would appreciate arrival directions.',
      estimatedTotal: 500
    }),
    createWebsiteRequest({
      id: requestIds.portugueseNew,
      submittedAt: timestampAt(-1, '18:22'),
      contact: { name: 'Marta Neves', email: 'marta.neves@example.pt', phone: '+351 919 808 707', nationality: 'Portugal' },
      stay: stay(46, 50, '16:30'),
      guests: { adults: 3 },
      bikes: { count: 2, days: 2 },
      estimatedTotal: 770
    }),
    createWebsiteRequest({
      id: requestIds.currentAccepted,
      status: 'accepted',
      submittedAt: timestampAt(-18, '12:30'),
      updatedAt: timestampAt(-17, '09:10'),
      contact: { ...contactFor('GUEST-RODRIGUES-MARTINS'), nationality: 'Portugal' },
      stay: stay(-1, 2, '16:00'),
      guests: { adults: 2, children: 1, childAges: [7] },
      preferences: { bed: 'double' },
      bikes: { count: 2, days: 2 },
      depositPrepay: true,
      marketingOptIn: true,
      comments: 'Gostaríamos de duas bicicletas. Um terceiro adulto poderá juntar-se mais tarde.',
      estimatedTotal: 815,
      acceptedReservationId: reservationIds.current
    }),
    createWebsiteRequest({
      id: requestIds.futureAccepted,
      status: 'accepted',
      submittedAt: timestampAt(-28, '10:02'),
      updatedAt: timestampAt(-27, '15:30'),
      preferredLanguage: 'es',
      contact: { ...contactFor('GUEST-SOFIA-ALVAREZ'), nationality: 'Espanha' },
      stay: stay(11, 15),
      guests: { adults: 2, children: 2, childAges: [4, 9] },
      preferences: { bed: 'double' },
      depositPrepay: true,
      comments: '¿Hay una cuna y una trona disponibles?',
      estimatedTotal: 1000,
      acceptedReservationId: reservationIds.abritelSpanish
    }),
    createWebsiteRequest({
      id: requestIds.rejectedUnavailable,
      status: 'rejected',
      submittedAt: timestampAt(-3, '13:14'),
      updatedAt: timestampAt(-2, '09:05'),
      preferredLanguage: 'fr',
      contact: { name: 'Camille Bernard', email: 'camille.bernard@example.fr', phone: '+33 6 45 67 89 10', nationality: 'França' },
      stay: stay(7, 10),
      comments: 'Dates indisponibles; foram sugeridas duas alternativas.',
      estimatedTotal: 375
    }),
    createWebsiteRequest({
      id: requestIds.rejectedWithdrawn,
      status: 'rejected',
      submittedAt: timestampAt(-14, '20:40'),
      updatedAt: timestampAt(-12, '16:25'),
      preferredLanguage: 'en',
      contact: { name: 'Daniel Cooper', email: 'daniel.cooper@example.com', phone: '+44 7700 900812', nationality: 'Reino Unido' },
      stay: stay(52, 57),
      guests: { adults: 4 },
      comments: 'Guest withdrew the request before payment instructions were sent.',
      estimatedTotal: 1200
    }),
    createWebsiteRequest({
      id: requestIds.rejectedPast,
      status: 'rejected',
      submittedAt: timestampAt(-45, '09:35'),
      updatedAt: timestampAt(-44, '12:00'),
      preferredLanguage: 'de',
      contact: { name: 'Greta Fischer', email: 'greta.fischer@example.de', phone: '+49 160 1234567', nationality: 'Alemanha' },
      stay: stay(-20, -17),
      guests: { adults: 2, children: 1, childAges: [3] },
      comments: 'Pedido antigo recusado por conflito com uma reserva Booking.com.',
      estimatedTotal: 570
    })
  ];

  const employees = [
    { id: 'EMP-JORGE', userId: 'user-owner-jorge', name: 'Jorge', role: 'owner', active: true, hourlyRates: [{ from: '2026-01-01', rate: 0 }], permissionsProfile: 'owner', compensationDefault: 'free' },
    { id: 'EMP-PAULA', userId: 'user-owner-paula', name: 'Paula', role: 'owner', active: true, hourlyRates: [{ from: '2026-01-01', rate: 0 }], permissionsProfile: 'owner', compensationDefault: 'free' },
    { id: 'EMP-BARBARA', userId: 'user-owner-barbara', name: 'Bárbara', role: 'owner', active: true, hourlyRates: [{ from: '2026-01-01', rate: 0 }], permissionsProfile: 'owner', compensationDefault: 'free' },
    { id: 'EMP-MARLENE', userId: 'user-owner-marlene', name: 'Marlene', role: 'owner', active: true, hourlyRates: [{ from: '2026-01-01', rate: 0 }], permissionsProfile: 'owner', compensationDefault: 'free' },
    { id: 'EMP-ANDRE', userId: 'user-dev-andre', name: 'André', role: 'dev', active: true, hourlyRates: [{ from: '2026-01-01', rate: 0 }], permissionsProfile: 'dev', compensationDefault: 'free' },
    { id: 'EMP-DULCE', userId: 'user-employee-dulce', name: 'Dulce', role: 'employee', active: true, hourlyRates: [{ from: '2026-01-01', rate: 7 }, { from: '2026-08-01', rate: 8 }], permissionsProfile: 'employee', compensationDefault: 'paid' },
    { id: 'EMP-FABIO', userId: 'user-employee-fabio', name: 'Fábio', role: 'employee', active: true, hourlyRates: [{ from: '2026-01-01', rate: 7.5 }], permissionsProfile: 'employee', compensationDefault: 'voluntary' }
  ];

  const workSession = (sequence, employeeId, offset, startTime, endTime, options = {}) => ({
    id: id('WORK', sequence, offset),
    employeeId,
    date: dateAt(offset),
    start: atDate(dateAt(offset), startTime),
    end: endTime ? atDate(dateAt(offset), endTime) : null,
    rateSnapshot: Number(options.rateSnapshot || 0),
    compensationType: options.compensationType || 'free',
    tasks: options.tasks || [],
    otherDetails: options.otherDetails || '',
    notes: options.notes || ''
  });
  const activeWorkStart = new Date(now.getTime() - (75 * 60 * 1000));
  const workSessions = [
    { id: id('WORK', 1), employeeId: 'EMP-DULCE', date: formatDateKey(activeWorkStart), start: activeWorkStart.toISOString(), end: null, rateSnapshot: 8, compensationType: 'paid', tasks: ['clean', 'checkin'], otherDetails: '', notes: 'Preparação da casa e receção do hóspede atual.' },
    workSession(2, 'EMP-JORGE', -1, '14:00', '18:10', { tasks: ['maintenance', 'shopping'], notes: 'Pequena reparação exterior e compra de material.' }),
    workSession(3, 'EMP-PAULA', -2, '09:15', '12:45', { tasks: ['bureaucracy', 'checkin'], notes: 'Faturação, mensagens e preparação do check-in.' }),
    workSession(4, 'EMP-DULCE', -3, '08:30', '14:00', { rateSnapshot: 8, compensationType: 'paid', tasks: ['clean', 'checkout', 'shopping'], notes: 'Check-out, limpeza completa e reposição.' }),
    workSession(5, 'EMP-FABIO', -4, '10:00', '13:20', { compensationType: 'voluntary', tasks: ['maintenance', 'other'], otherDetails: 'Tratamento do jardim e ajuda na zona exterior.', notes: 'Trabalho voluntário.' }),
    workSession(6, 'EMP-BARBARA', -5, '16:00', '18:30', { tasks: ['bureaucracy', 'checkout'], notes: 'Conferência de pagamentos e contacto pós-estadia.' }),
    workSession(7, 'EMP-MARLENE', -7, '11:00', '15:15', { tasks: ['clean', 'checkin'], notes: 'Preparação e receção de hóspedes estrangeiros.' }),
    workSession(8, 'EMP-ANDRE', -9, '19:00', '21:10', { tasks: ['bureaucracy', 'other'], otherDetails: 'Atualização técnica do protótipo administrativo.', notes: 'Apoio técnico sem custo.' }),
    workSession(9, 'EMP-FABIO', -12, '09:00', '12:00', { rateSnapshot: 7.5, compensationType: 'paid', tasks: ['maintenance'], notes: 'Reparação combinada como trabalho pago.' }),
    workSession(10, 'EMP-DULCE', -18, '08:45', '13:15', { rateSnapshot: 8, compensationType: 'paid', tasks: ['clean', 'checkout'] }),
    workSession(11, 'EMP-JORGE', -34, '15:00', '18:00', { tasks: ['maintenance'] }),
    workSession(12, 'EMP-PAULA', -55, '10:00', '12:30', { tasks: ['bureaucracy'] }),
    workSession(13, 'EMP-DULCE', -105, '08:30', '14:30', { rateSnapshot: 7, compensationType: 'paid', tasks: ['clean', 'checkin', 'shopping'] }),
    workSession(14, 'EMP-FABIO', -180, '09:30', '13:00', { compensationType: 'voluntary', tasks: ['maintenance', 'shopping'] }),
    workSession(15, 'EMP-MARLENE', -240, '14:00', '17:45', { tasks: ['checkin', 'bureaucracy'] }),
    workSession(16, 'EMP-DULCE', -370, '08:00', '14:00', { rateSnapshot: 7, compensationType: 'paid', tasks: ['clean', 'checkout'] })
  ];

  const expense = (sequence, offset, category, description, amount, notes = '') => ({ id: id('EXP', sequence, offset), date: dateAt(offset), category, description, amount, notes });
  const expenses = [
    expense(1, -1, 'consumiveis', 'Produtos de limpeza e papel', 34.8, 'Compra para a mudança de hóspedes desta semana.'),
    expense(2, -3, 'manutencao', 'Material para reparação exterior', 58, 'Parafusos, vedante e tinta; fatura arquivada.'),
    expense(3, -6, 'limpeza', 'Lavandaria de roupa de cama', 42.5),
    expense(4, -9, 'utilidades', 'Eletricidade', 118.37, 'Fatura mensal.'),
    expense(5, -14, 'equipamento', 'Torradeira de substituição', 39.9, 'Garantia de dois anos.'),
    expense(6, -22, 'reparacoes', 'Reparação da bomba de água', 185, 'Intervenção urgente; recibo digital disponível.'),
    expense(7, -31, 'funcionarios', 'Serviço externo de jardinagem', 90, 'Não inclui horas registadas na área Funcionários.'),
    expense(8, -42, 'outros', 'Taxa de licença anual', 64.25),
    expense(9, -68, 'consumiveis', 'Cápsulas de café e produtos de boas-vindas', 76.4),
    expense(10, -104, 'utilidades', 'Água', 82.16),
    expense(11, -179, 'equipamento', 'Duas bicicletas', 640, 'Investimento em equipamento de aluguer.'),
    expense(12, -369, 'manutencao', 'Revisão anual do alojamento', 275, 'Despesa do ano anterior para comparação.')
  ];

  const auditEntry = (sequence, offset, time, actorId, actorName, action, entityType, entityId, details = {}) => ({
    id: id('AUDIT', sequence, offset), at: timestampAt(offset, time), actorId, actorName, action, entityType, entityId, details
  });
  const auditLog = [
    auditEntry(1, 0, '11:36', 'website', 'Website', 'Pedido do website recebido', 'websiteRequest', requestIds.discountedNew, { origem: 'Formulário público', idioma: 'Português', desconto: 'VERAO10' }),
    auditEntry(2, 0, '10:17', 'website', 'Website', 'Pedido do website recebido', 'websiteRequest', requestIds.germanNew, { origem: 'Formulário público', idioma: 'Alemão', depósitoAntecipado: true }),
    auditEntry(3, 0, '09:30', 'user-owner-paula', 'Paula', 'Hóspede extra adicionado', 'reservation', reservationIds.current, { hóspedes: '1 adulto', chegada: todayKey, pagamento: 'A aguardar transferência' }),
    auditEntry(4, -1, '17:25', 'user-dev-andre', 'André', 'Pedido provisório criado manualmente', 'reservation', reservationIds.provisional, { estado: 'Pedido', origem: 'Website' }),
    auditEntry(5, -2, '11:05', 'user-owner-jorge', 'Jorge', 'Reserva criada manualmente', 'reservation', reservationIds.awaitingEnglish, { origem: 'Contacto privado', estado: 'A aguardar pagamento', desconto: '10%' }),
    auditEntry(6, -2, '09:05', 'user-owner-marlene', 'Marlene', 'Pedido do website rejeitado', 'websiteRequest', requestIds.rejectedUnavailable, { motivo: 'Datas indisponíveis', alternativasEnviadas: true }),
    auditEntry(7, -3, '14:00', 'user-owner-barbara', 'Bárbara', 'Despesa adicionada', 'expense', expenses[1].id, { descrição: expenses[1].description, valor: expenses[1].amount }),
    auditEntry(8, -5, '09:05', 'user-owner-barbara', 'Bárbara', 'Reserva cancelada e reembolsada', 'reservation', reservationIds.cancelledFuture, { motivo: 'Alteração do voo', reembolso: 'Integral' }),
    auditEntry(9, -7, '16:40', 'user-owner-barbara', 'Bárbara', 'Depósito marcado como recebido', 'reservation', reservationIds.abritelSpanish, { antes: 'A aguardar transferência', depois: 'Depósito recebido' }),
    auditEntry(10, -9, '21:10', 'user-dev-andre', 'André', 'Sessão de trabalho terminada', 'workSession', workSessions[7].id, { duração: '2h10', tipo: 'Trabalho gratuito' }),
    auditEntry(11, -12, '16:25', 'user-owner-paula', 'Paula', 'Pedido do website rejeitado', 'websiteRequest', requestIds.rejectedWithdrawn, { motivo: 'Pedido retirado pelo hóspede' }),
    auditEntry(12, -17, '09:10', 'user-owner-paula', 'Paula', 'Pedido do website convertido em reserva', 'reservation', reservationIds.current, { pedido: requestIds.currentAccepted, estadoInicial: 'A aguardar pagamento' }),
    auditEntry(13, -18, '13:15', 'user-employee-dulce', 'Dulce', 'Sessão de trabalho terminada', 'workSession', workSessions[9].id, { tarefas: ['Limpeza', 'Check-out'], tipo: 'Pago' }),
    auditEntry(14, -27, '15:30', 'user-owner-barbara', 'Bárbara', 'Pedido do website convertido em reserva', 'reservation', reservationIds.abritelSpanish, { pedido: requestIds.futureAccepted, idioma: 'Espanhol' }),
    auditEntry(15, -31, '12:15', 'user-owner-barbara', 'Bárbara', 'Reserva cancelada', 'reservation', reservationIds.cancelledPast, { motivo: 'Cancelamento dentro do prazo', pagamento: 'Reembolsado' }),
    auditEntry(16, -44, '12:00', 'user-owner-marlene', 'Marlene', 'Pedido do website rejeitado', 'websiteRequest', requestIds.rejectedPast, { motivo: 'Conflito de datas' }),
    auditEntry(17, -60, '10:00', 'user-owner-jorge', 'Jorge', 'Preço sazonal atualizado', 'pricing', 'SEASON-APR-SEP', { época: 'Primavera e verão', preçoAdulto: 75, preçoCriança: 65 }),
    auditEntry(18, -75, '09:20', 'user-owner-paula', 'Paula', 'Desconto criado', 'pricing', 'DISC-REGRESSO10', { código: 'REGRESSO10', valor: '10%', limite: 'Ilimitado' }),
    auditEntry(19, -178, '09:30', 'user-owner-barbara', 'Bárbara', 'Hóspedes extra adicionados', 'reservation', reservationIds.extraGuestsPast, { hóspedes: '1 adulto + 1 criança', desconto: '20€', pagamento: 'Pago' }),
    { id: id('AUDIT', 20), at: now.toISOString(), actorId: 'system', actorName: 'Sistema', action: 'Dados de demonstração completos criados', entityType: 'system', entityId: 'seed', details: { reservas: reservations.length, pedidosWebsite: websiteRequests.length, hóspedes: guests.length, sessõesTrabalho: workSessions.length, despesas: expenses.length } }
  ];

  return {
    version: ADMIN_DATA_VERSION,
    generatedAt: now.toISOString(),
    updatedAt: now.toISOString(),
    property: {
      name: 'O Refúgio',
      address: 'Rua da Arejinha 627, 4550-518 Pedorido',
      googleReviewUrl: 'https://www.google.com/maps/place/O+Ref%C3%BAgio/@41.0204811,-8.3871842,646m/data=!3m2!1e3!4b1!4m6!3m5!1s0xd24830c21a7821f:0x7babb9259b50311a!8m2!3d41.0204812!4d-8.3823133!16s%2Fg%2F11vqhfvg0k?entry=ttu',
      defaultCheckInTime: '15:00',
      defaultCheckOutTime: '10:00',
      occupancyLimit: 6
    },
    pricing: {
      currency: 'EUR',
      adultNight: 70,
      minimumPaidAdults: 2,
      childNight: 65,
      bikeDay: 5,
      securityDeposit: 200,
      seasons: [
        { id: 'SEASON-2026-UNTIL-DEC-22', kind: 'dated', title: 'Preço atual até 22 dezembro 2026', startDate: todayKey, endDate: '2026-12-22', adultNight: 62.5, childNight: 65, notes: 'Preço por adulto/noite; cobrança mínima de 2 adultos.', active: true },
        { id: 'SEASON-2026-DEC-24', kind: 'dated', title: 'Natal 24 dezembro', startDate: '2026-12-24', endDate: '2026-12-24', adultNight: 85, childNight: 65, notes: 'Noite especial de dezembro.', active: true },
        { id: 'SEASON-2026-DEC-25', kind: 'dated', title: 'Natal 25 dezembro', startDate: '2026-12-25', endDate: '2026-12-25', adultNight: 85, childNight: 65, notes: 'Noite especial de dezembro.', active: true },
        { id: 'SEASON-2026-DEC-30', kind: 'dated', title: 'Ano Novo 30 dezembro', startDate: '2026-12-30', endDate: '2026-12-30', adultNight: 85, childNight: 65, notes: 'Noite especial de dezembro.', active: true },
        { id: 'SEASON-2026-DEC-31', kind: 'dated', title: 'Ano Novo 31 dezembro', startDate: '2026-12-31', endDate: '2026-12-31', adultNight: 85, childNight: 65, notes: 'Noite especial de dezembro.', active: true },
        { id: 'SEASON-APR-SEP', kind: 'recurring', title: 'Primavera e verão', startDate: '', endDate: '', startMonthDay: '04-01', endMonthDay: '09-30', adultNight: 75, childNight: 65, notes: 'De 1 de abril ao fim de setembro; fora desta época aplica-se a base de 70€ por adulto/noite, com mínimo de 2 adultos.', active: true }
      ],
      groupDiscounts: [
        { id: 'GROUPDISC-4-GUESTS', minGuests: 4, amountPerNight: 5, active: true },
        { id: 'GROUPDISC-5-GUESTS-ARCHIVED', minGuests: 5, amountPerNight: 7.5, active: false },
        { id: 'GROUPDISC-6-GUESTS', minGuests: 6, amountPerNight: 10, active: true }
      ],
      discounts: [
        { id: 'DISC-VERAO10', title: 'Campanha de verão', code: 'VERAO10', type: 'percentage', percentage: 10, amount: 0, maxUses: 20, usedCount: 6, startDate: dateAt(-60), endDate: dateAt(60), appliesTo: 'accommodation', active: true },
        { id: 'DISC-REGRESSO10', title: 'Hóspede repetente', code: 'REGRESSO10', type: 'percentage', percentage: 10, amount: 0, maxUses: 0, usedCount: 3, startDate: '', endDate: '', appliesTo: 'accommodation', active: true },
        { id: 'DISC-BICICLETAS5', title: 'Oferta bicicletas', code: 'BIKES5', type: 'amount', percentage: 0, amount: 5, maxUses: 12, usedCount: 4, startDate: '', endDate: dateAt(90), appliesTo: 'services', active: true },
        { id: 'DISC-INVERNO25', title: 'Reserva de inverno', code: 'INVERNO25', type: 'amount', percentage: 0, amount: 25, maxUses: 0, usedCount: 0, startDate: '2026-10-01', endDate: '2027-03-31', appliesTo: 'both', active: true },
        { id: 'DISC-ARQUIVADO', title: 'Campanha encerrada', code: 'PRIMAVERA15', type: 'percentage', percentage: 15, amount: 0, maxUses: 10, usedCount: 10, startDate: dateAt(-180), endDate: dateAt(-120), appliesTo: 'accommodation', active: false }
      ]
    },
    guests,
    reservations,
    websiteRequests,
    employees,
    workSessions,
    expenses,
    auditLog
  };
}

export { addDays, formatDateKey, parseDateKey };

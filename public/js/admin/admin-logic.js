import { addDays, formatDateKey, parseDateKey } from './admin-seed.js';

export const LANGUAGE_LABELS = {
  pt: 'Português',
  fr: 'Francês',
  en: 'Inglês',
  es: 'Espanhol',
  de: 'Alemão'
};

export const STATUS_LABELS = {
  request: 'Pedido',
  awaiting_payment: 'A aguardar pagamento',
  confirmed: 'Confirmada',
  checked_in: 'Check-in realizado',
  checked_out: 'Check-out realizado',
  cancelled: 'Cancelada',
  no_show: 'Não compareceu'
};

export const PAYMENT_LABELS = {
  unpaid: 'Não pago',
  awaiting_transfer: 'A aguardar transferência',
  deposit_paid: 'Depósito recebido',
  paid: 'Pago',
  refunded: 'Reembolsado'
};

export const SOURCE_LABELS = {
  booking: 'Booking.com',
  website: 'Website',
  private: 'Contacto privado',
  owner: 'Reserva do proprietário'
};

export const EXPENSE_LABELS = {
  manutencao: 'Manutenção',
  limpeza: 'Limpeza',
  consumiveis: 'Consumíveis',
  utilidades: 'Utilidades',
  equipamento: 'Equipamento',
  reparacoes: 'Reparações',
  funcionarios: 'Custos de funcionários',
  outros: 'Outros'
};

export const COMPENSATION_LABELS = {
  paid: 'Pago',
  free: 'Trabalho gratuito',
  voluntary: 'Voluntário'
};

export const WORK_TASK_LABELS = {
  checkin: 'Check-in',
  checkout: 'Check-out',
  clean: 'Limpeza',
  bureaucracy: 'Burocracia',
  maintenance: 'Manutenção/reparações',
  shopping: 'Compras',
  other: 'Outro'
};

const BLOCKING_STATUSES = new Set(['awaiting_payment', 'confirmed', 'checked_in']);

export const MESSAGE_TEMPLATE_LABELS = {
  requestReceived: 'Pedido de reserva recebido',
  paymentInstructions: 'Instruções de pagamento',
  bookingConfirmation: 'Confirmação de reserva',
  paymentReceived: 'Confirmação de pagamento',
  checkinInfo: 'Informação de check-in',
  arrivalReminder: 'Lembrete antes da chegada',
  usefulInfo: 'Informações úteis',
  checkoutInstructions: 'Instruções de checkout',
  postStayThanks: 'Agradecimento e pedido de feedback'
};

const GUEST_MESSAGE_TEMPLATES = {
  requestReceived: {
    pt: 'Olá {guestName}, recebemos o seu pedido de reserva para O Refúgio.\n\nResumo: {checkIn} a {checkOut}, {nights} noite(s), {guestCount} hóspede(s).\n\nVamos verificar a disponibilidade e responder o mais brevemente possível. Obrigado.',
    fr: 'Bonjour {guestName}, nous avons bien reçu votre demande de réservation pour O Refúgio.\n\nRésumé : du {checkIn} au {checkOut}, {nights} nuit(s), {guestCount} personne(s).\n\nNous allons vérifier la disponibilité et vous répondre dès que possible. Merci.',
    en: 'Hello {guestName}, we have received your reservation request for O Refúgio.\n\nSummary: {checkIn} to {checkOut}, {nights} night(s), {guestCount} guest(s).\n\nWe will check availability and reply as soon as possible. Thank you.',
    es: 'Hola {guestName}, hemos recibido su solicitud de reserva para O Refúgio.\n\nResumen: del {checkIn} al {checkOut}, {nights} noche(s), {guestCount} huésped(es).\n\nComprobaremos la disponibilidad y responderemos lo antes posible. Gracias.',
    de: 'Hallo {guestName}, wir haben Ihre Reservierungsanfrage für O Refúgio erhalten.\n\nZusammenfassung: {checkIn} bis {checkOut}, {nights} Nacht/Nächte, {guestCount} Gast/Gäste.\n\nWir prüfen die Verfügbarkeit und antworten so bald wie möglich. Vielen Dank.'
  },
  paymentInstructions: {
    pt: 'Olá {guestName}, obrigado pelo seu pedido de reserva em O Refúgio.\n\nResumo: {checkIn} a {checkOut}, {nights} noite(s), {guestCount} hóspede(s).\nValor estimado: {total}.\n\nPara confirmar a reserva, pedimos a transferência do valor indicado para o IBAN definido pelo proprietário, usando a referência {reservationId}. Assim que o pagamento for confirmado, enviaremos a confirmação final.\n\nQualquer dúvida, estamos disponíveis.',
    fr: 'Bonjour {guestName}, merci pour votre demande de réservation à O Refúgio.\n\nRésumé : du {checkIn} au {checkOut}, {nights} nuit(s), {guestCount} personne(s).\nMontant estimé : {total}.\n\nPour confirmer la réservation, merci d’effectuer le virement du montant indiqué vers l’IBAN défini par le propriétaire, avec la référence {reservationId}. Dès réception du paiement, nous enverrons la confirmation finale.\n\nNous restons disponibles pour toute question.',
    en: 'Hello {guestName}, thank you for your reservation request at O Refúgio.\n\nSummary: {checkIn} to {checkOut}, {nights} night(s), {guestCount} guest(s).\nEstimated amount: {total}.\n\nTo confirm the reservation, please transfer the indicated amount to the IBAN defined by the owner, using reference {reservationId}. Once payment is confirmed, we will send the final confirmation.\n\nPlease let us know if you have any questions.',
    es: 'Hola {guestName}, gracias por su solicitud de reserva en O Refúgio.\n\nResumen: del {checkIn} al {checkOut}, {nights} noche(s), {guestCount} huésped(es).\nImporte estimado: {total}.\n\nPara confirmar la reserva, realice la transferencia del importe indicado al IBAN definido por el propietario, usando la referencia {reservationId}. Cuando el pago esté confirmado, enviaremos la confirmación final.\n\nEstamos disponibles para cualquier pregunta.',
    de: 'Hallo {guestName}, vielen Dank für Ihre Reservierungsanfrage bei O Refúgio.\n\nZusammenfassung: {checkIn} bis {checkOut}, {nights} Nacht/Nächte, {guestCount} Gast/Gäste.\nGeschätzter Betrag: {total}.\n\nZur Bestätigung der Reservierung überweisen Sie bitte den angegebenen Betrag auf die vom Eigentümer festgelegte IBAN mit der Referenz {reservationId}. Sobald die Zahlung bestätigt ist, senden wir die endgültige Bestätigung.\n\nBei Fragen stehen wir gerne zur Verfügung.'
  },
  paymentReceived: {
    pt: 'Olá {guestName}, confirmamos a receção do pagamento da reserva {reservationId}. A sua estadia em O Refúgio fica confirmada de {checkIn} a {checkOut}. Obrigado e até breve.',
    fr: 'Bonjour {guestName}, nous confirmons la réception du paiement de la réservation {reservationId}. Votre séjour à O Refúgio est confirmé du {checkIn} au {checkOut}. Merci et à bientôt.',
    en: 'Hello {guestName}, we confirm that payment for reservation {reservationId} has been received. Your stay at O Refúgio is confirmed from {checkIn} to {checkOut}. Thank you and see you soon.',
    es: 'Hola {guestName}, confirmamos la recepción del pago de la reserva {reservationId}. Su estancia en O Refúgio queda confirmada del {checkIn} al {checkOut}. Gracias y hasta pronto.',
    de: 'Hallo {guestName}, wir bestätigen den Zahlungseingang für die Reservierung {reservationId}. Ihr Aufenthalt im O Refúgio ist vom {checkIn} bis {checkOut} bestätigt. Vielen Dank und bis bald.'
  },
  bookingConfirmation: {
    pt: 'Olá {guestName}, a sua reserva {reservationId} em O Refúgio está confirmada.\n\nEstadia: {checkIn} a {checkOut}, {nights} noite(s), {guestCount} hóspede(s).\nCheck-in previsto: {checkInTime}. Check-out: {checkOutTime}.\n\nObrigado pela confiança. Ficamos à sua espera.',
    fr: 'Bonjour {guestName}, votre réservation {reservationId} à O Refúgio est confirmée.\n\nSéjour : du {checkIn} au {checkOut}, {nights} nuit(s), {guestCount} personne(s).\nCheck-in prévu : {checkInTime}. Check-out : {checkOutTime}.\n\nMerci pour votre confiance. Nous vous attendons avec plaisir.',
    en: 'Hello {guestName}, your reservation {reservationId} at O Refúgio is confirmed.\n\nStay: {checkIn} to {checkOut}, {nights} night(s), {guestCount} guest(s).\nExpected check-in: {checkInTime}. Check-out: {checkOutTime}.\n\nThank you for your trust. We look forward to welcoming you.',
    es: 'Hola {guestName}, su reserva {reservationId} en O Refúgio está confirmada.\n\nEstancia: del {checkIn} al {checkOut}, {nights} noche(s), {guestCount} huésped(es).\nCheck-in previsto: {checkInTime}. Check-out: {checkOutTime}.\n\nGracias por su confianza. Les esperamos.',
    de: 'Hallo {guestName}, Ihre Reservierung {reservationId} bei O Refúgio ist bestätigt.\n\nAufenthalt: {checkIn} bis {checkOut}, {nights} Nacht/Nächte, {guestCount} Gast/Gäste.\nVoraussichtlicher Check-in: {checkInTime}. Check-out: {checkOutTime}.\n\nVielen Dank für Ihr Vertrauen. Wir freuen uns auf Sie.'
  },
  checkinInfo: {
    pt: 'Olá {guestName}, deixamos a informação principal para o check-in da reserva {reservationId}.\n\nEntrada: {checkIn}, a partir das {checkInTime}.\nMorada: {propertyAddress}.\n\nSe houver atraso ou alguma dúvida no caminho, responda a esta mensagem.',
    fr: 'Bonjour {guestName}, voici les informations principales pour le check-in de la réservation {reservationId}.\n\nArrivée : {checkIn}, à partir de {checkInTime}.\nAdresse : {propertyAddress}.\n\nEn cas de retard ou de question pendant le trajet, répondez à ce message.',
    en: 'Hello {guestName}, here is the main check-in information for reservation {reservationId}.\n\nArrival: {checkIn}, from {checkInTime}.\nAddress: {propertyAddress}.\n\nIf you are delayed or have any question on the way, please reply to this message.',
    es: 'Hola {guestName}, aquí tiene la información principal para el check-in de la reserva {reservationId}.\n\nEntrada: {checkIn}, a partir de las {checkInTime}.\nDirección: {propertyAddress}.\n\nSi hay retraso o alguna duda durante el camino, responda a este mensaje.',
    de: 'Hallo {guestName}, hier sind die wichtigsten Check-in-Informationen für die Reservierung {reservationId}.\n\nAnreise: {checkIn}, ab {checkInTime}.\nAdresse: {propertyAddress}.\n\nWenn Sie sich verspäten oder unterwegs Fragen haben, antworten Sie bitte auf diese Nachricht.'
  },
  arrivalReminder: {
    pt: 'Olá {guestName}, lembramos que a sua estadia em O Refúgio começa em {checkIn}.\n\nCheck-in previsto: {checkInTime}. Morada: {propertyAddress}.\n\nBoa viagem e até breve.',
    fr: 'Bonjour {guestName}, petit rappel : votre séjour à O Refúgio commence le {checkIn}.\n\nCheck-in prévu : {checkInTime}. Adresse : {propertyAddress}.\n\nBon voyage et à bientôt.',
    en: 'Hello {guestName}, a quick reminder that your stay at O Refúgio starts on {checkIn}.\n\nExpected check-in: {checkInTime}. Address: {propertyAddress}.\n\nSafe travels and see you soon.',
    es: 'Hola {guestName}, le recordamos que su estancia en O Refúgio empieza el {checkIn}.\n\nCheck-in previsto: {checkInTime}. Dirección: {propertyAddress}.\n\nBuen viaje y hasta pronto.',
    de: 'Hallo {guestName}, eine kurze Erinnerung: Ihr Aufenthalt bei O Refúgio beginnt am {checkIn}.\n\nVoraussichtlicher Check-in: {checkInTime}. Adresse: {propertyAddress}.\n\nGute Reise und bis bald.'
  },
  usefulInfo: {
    pt: 'Olá {guestName}, seguem algumas informações úteis para a sua estadia em O Refúgio.\n\nMorada: {propertyAddress}.\nCheck-out: {checkOut}, até às {checkOutTime}.\n\n[Acrescentar aqui Wi-Fi, estacionamento, regras ou recomendações relevantes.]',
    fr: 'Bonjour {guestName}, voici quelques informations utiles pour votre séjour à O Refúgio.\n\nAdresse : {propertyAddress}.\nCheck-out : {checkOut}, jusqu’à {checkOutTime}.\n\n[Ajouter ici Wi-Fi, stationnement, règles ou recommandations utiles.]',
    en: 'Hello {guestName}, here is some useful information for your stay at O Refúgio.\n\nAddress: {propertyAddress}.\nCheck-out: {checkOut}, by {checkOutTime}.\n\n[Add Wi-Fi, parking, rules, or useful recommendations here.]',
    es: 'Hola {guestName}, aquí tiene información útil para su estancia en O Refúgio.\n\nDirección: {propertyAddress}.\nCheck-out: {checkOut}, hasta las {checkOutTime}.\n\n[Añadir aquí Wi-Fi, aparcamiento, normas o recomendaciones útiles.]',
    de: 'Hallo {guestName}, hier sind einige nützliche Informationen für Ihren Aufenthalt bei O Refúgio.\n\nAdresse: {propertyAddress}.\nCheck-out: {checkOut}, bis {checkOutTime}.\n\n[Hier WLAN, Parkplatz, Regeln oder Empfehlungen ergänzen.]'
  },
  checkoutInstructions: {
    pt: 'Olá {guestName}, deixamos as instruções de checkout da reserva {reservationId}.\n\nSaída: {checkOut}, até às {checkOutTime}.\n\n[Acrescentar aqui entrega de chaves, lixo, loiça, janelas, aquecimento ou outros pontos importantes.]',
    fr: 'Bonjour {guestName}, voici les instructions de check-out pour la réservation {reservationId}.\n\nDépart : {checkOut}, jusqu’à {checkOutTime}.\n\n[Ajouter ici clés, déchets, vaisselle, fenêtres, chauffage ou autres points importants.]',
    en: 'Hello {guestName}, here are the check-out instructions for reservation {reservationId}.\n\nDeparture: {checkOut}, by {checkOutTime}.\n\n[Add keys, rubbish, dishes, windows, heating, or other important points here.]',
    es: 'Hola {guestName}, aquí tiene las instrucciones de check-out de la reserva {reservationId}.\n\nSalida: {checkOut}, hasta las {checkOutTime}.\n\n[Añadir aquí llaves, basura, vajilla, ventanas, calefacción u otros puntos importantes.]',
    de: 'Hallo {guestName}, hier sind die Check-out-Anweisungen für die Reservierung {reservationId}.\n\nAbreise: {checkOut}, bis {checkOutTime}.\n\n[Hier Schlüssel, Müll, Geschirr, Fenster, Heizung oder weitere wichtige Punkte ergänzen.]'
  },
  postStayThanks: {
    pt: 'Olá {guestName}, esperamos que tenha gostado da estadia em O Refúgio.\n\nObrigado pela visita. Se quiser deixar feedback privado, basta responder a esta mensagem. Se a experiência foi positiva, agradecemos também uma avaliação no Google Maps.\n\nAté uma próxima.',
    fr: 'Bonjour {guestName}, nous espérons que votre séjour à O Refúgio vous a plu.\n\nMerci pour votre visite. Pour un retour privé, répondez simplement à ce message. Si l’expérience a été positive, un avis sur Google Maps nous aiderait beaucoup.\n\nÀ une prochaine fois.',
    en: 'Hello {guestName}, we hope you enjoyed your stay at O Refúgio.\n\nThank you for visiting. If you would like to leave private feedback, simply reply to this message. If you had a positive experience, a Google Maps review would also be greatly appreciated.\n\nHope to welcome you again.',
    es: 'Hola {guestName}, esperamos que haya disfrutado de su estancia en O Refúgio.\n\nGracias por la visita. Si quiere dejar feedback privado, responda a este mensaje. Si la experiencia fue positiva, agradeceríamos una reseña en Google Maps.\n\nHasta la próxima.',
    de: 'Hallo {guestName}, wir hoffen, dass Ihnen Ihr Aufenthalt bei O Refúgio gefallen hat.\n\nVielen Dank für Ihren Besuch. Für privates Feedback antworten Sie einfach auf diese Nachricht. Wenn die Erfahrung positiv war, freuen wir uns auch sehr über eine Google-Maps-Bewertung.\n\nBis zum nächsten Mal.'
  }
};

const REQUEST_COMMENT_LABELS = {
  pt: {
    comment: 'Comentário do hóspede:',
    reply: 'Resposta a acrescentar:'
  },
  fr: {
    comment: 'Commentaire du client :',
    reply: 'Réponse à ajouter :'
  },
  en: {
    comment: 'Guest comment:',
    reply: 'Reply to add:'
  },
  es: {
    comment: 'Comentario del huésped:',
    reply: 'Respuesta para añadir:'
  },
  de: {
    comment: 'Kommentar des Gastes:',
    reply: 'Antwort ergänzen:'
  }
};

export function escapeHtml(value) {
  return String(value ?? '')
    .replaceAll('&', '&amp;')
    .replaceAll('<', '&lt;')
    .replaceAll('>', '&gt;')
    .replaceAll('"', '&quot;')
    .replaceAll("'", '&#039;');
}

export function formatCurrency(value, currency = 'EUR') {
  return new Intl.NumberFormat('pt-PT', {
    style: 'currency',
    currency,
    maximumFractionDigits: 0
  }).format(Number(value || 0));
}

export function formatDate(value) {
  if (!value) return '-';
  const date = parseDateKey(value);
  if (!date || Number.isNaN(date.getTime())) return value;
  return new Intl.DateTimeFormat('pt-PT', {
    day: '2-digit',
    month: 'short',
    year: 'numeric'
  }).format(date);
}

export function formatDateTime(value) {
  if (!value) return '-';
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return value;
  return new Intl.DateTimeFormat('pt-PT', {
    day: '2-digit',
    month: 'short',
    hour: '2-digit',
    minute: '2-digit'
  }).format(date);
}

export function diffNights(checkIn, checkOut) {
  if (!checkIn || !checkOut) return 0;
  return Math.max(0, Math.round((parseDateKey(checkOut) - parseDateKey(checkIn)) / 86400000));
}

export function dateRangeOverlaps(aStart, aEnd, bStart, bEnd) {
  return parseDateKey(aStart) < parseDateKey(bEnd) && parseDateKey(aEnd) > parseDateKey(bStart);
}

export function reservationTouchesDate(reservation, dateKey) {
  return dateRangeOverlaps(reservation.stay.checkIn, reservation.stay.checkOut, dateKey, formatDateKey(addDays(parseDateKey(dateKey), 1)));
}

export function calculateReservationTotals(reservation, state) {
  const nights = diffNights(reservation.stay.checkIn, reservation.stay.checkOut);
  const adults = Number(reservation.guests?.adults || 0);
  const children = Number(reservation.guests?.children || 0);
  const adultNight = Number(reservation.pricing?.adultNight || state.pricing.adultNight);
  const childNight = Number(reservation.pricing?.childNight || state.pricing.childNight);
  const bikeDay = Number(reservation.pricing?.bikeDay || state.pricing.bikeDay);
  const bikeUnits = Number(reservation.extras?.bikes?.count || 0) * Number(reservation.extras?.bikes?.days || 0);
  const accommodation = nights * ((adults * adultNight) + (children * childNight));
  const services = bikeUnits * bikeDay;
  const guestCount = adults + children;
  const groupDiscountPerNight = [...(state.pricing.groupDiscounts || [])]
    .filter((discount) => discount.active !== false && guestCount >= Number(discount.minGuests || 0))
    .sort((a, b) => Number(b.minGuests || 0) - Number(a.minGuests || 0))[0]?.amountPerNight || 0;
  const groupDiscount = Math.min(accommodation, Math.max(0, Number(groupDiscountPerNight)) * nights);
  const discountType = reservation.pricing?.discountType || (Number(reservation.pricing?.discountAmount || 0) > 0 ? 'amount' : 'percentage');
  const manualDiscount = discountType === 'amount'
    ? Math.max(0, Number(reservation.pricing?.discountAmount || 0))
    : Math.round(accommodation * (Number(reservation.pricing?.discountPercent || 0) / 100));
  const discount = Math.min(accommodation + services, manualDiscount + groupDiscount);
  const deposit = reservation.pricing?.depositIncluded ? Number(state.pricing.securityDeposit || 0) : 0;
  const total = Math.max(0, accommodation + services + deposit - discount);

  return { nights, accommodation, services, deposit, discount, total, bikeUnits, groupDiscount, manualDiscount };
}

export function findReservationConflicts(state, candidate, ignoreId = '') {
  return state.reservations.filter((reservation) =>
    reservation.id !== ignoreId &&
    BLOCKING_STATUSES.has(reservation.status) &&
    dateRangeOverlaps(candidate.stay.checkIn, candidate.stay.checkOut, reservation.stay.checkIn, reservation.stay.checkOut)
  );
}

export function getGuestCount(reservation) {
  return Number(reservation.guests?.adults || 0) + Number(reservation.guests?.children || 0);
}

export function makeId(prefix, collection) {
  const year = new Date().getFullYear();
  const count = collection.length + 1;
  return `${prefix}-${year}-${String(count).padStart(4, '0')}`;
}

export function getOrCreateGuest(state, contact, preferredLanguage = 'pt', nationality = '') {
  const email = contact.email?.trim().toLowerCase();
  const existing = state.guests.find((guest) => email && guest.email.toLowerCase() === email);

  if (existing) {
    return existing;
  }

  const guest = {
    id: makeId('GUEST', state.guests),
    name: contact.name || 'Hóspede sem nome',
    email: contact.email || '',
    phone: contact.phone || '',
    preferredLanguage,
    nationality,
    notes: ''
  };

  state.guests.push(guest);
  return guest;
}

export function reservationFromWebsiteRequest(state, request, currentUser) {
  const guest = getOrCreateGuest(state, request.contact, request.preferredLanguage);

  return {
    id: makeId('RES', state.reservations),
    guestId: guest.id,
    source: 'website',
    sourceReference: request.id,
    status: 'awaiting_payment',
    paymentStatus: 'awaiting_transfer',
    preferredLanguage: request.preferredLanguage || guest.preferredLanguage || 'pt',
    contact: { ...request.contact },
    stay: { ...request.stay },
    guests: {
      adults: Number(request.guests?.adults || 1),
      children: Number(request.guests?.children || 0),
      childAges: Array.isArray(request.guests?.childAges) ? [...request.guests.childAges] : []
    },
    pricing: {
      adultNight: state.pricing.adultNight,
      childNight: state.pricing.childNight,
      bikeDay: state.pricing.bikeDay,
      discountType: request.pricing?.discountType || 'percentage',
      discountPercent: Number(request.pricing?.discountPercent || 0),
      discountAmount: Number(request.pricing?.discountAmount || 0),
      discountCode: request.pricing?.discountCode || '',
      depositIncluded: false
    },
    extras: {
      bikes: {
        count: Number(request.extras?.bikes?.count || 0),
        days: Number(request.extras?.bikes?.days || 0)
      }
    },
    notes: {
      owner: request.comments || '',
      operational: ''
    },
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    createdBy: currentUser.id
  };
}

export function addAudit(state, currentUser, action, entityType, entityId) {
  state.auditLog.unshift({
    id: makeId('AUDIT', state.auditLog),
    at: new Date().toISOString(),
    actorId: currentUser?.id || 'system',
    actorName: currentUser?.displayName || 'Sistema',
    action,
    entityType,
    entityId
  });
}

export function generateGuestMessage(reservation, state, templateKey = 'paymentInstructions') {
  const totals = calculateReservationTotals(reservation, state);
  const language = reservation.preferredLanguage || 'pt';
  const template = GUEST_MESSAGE_TEMPLATES[templateKey]?.[language] || GUEST_MESSAGE_TEMPLATES[templateKey]?.pt || GUEST_MESSAGE_TEMPLATES.paymentInstructions.pt;
  const requestComment = reservation.source === 'website' ? String(reservation.notes?.owner || '').trim() : '';
  const commentLabels = REQUEST_COMMENT_LABELS[language] || REQUEST_COMMENT_LABELS.pt;
  const values = {
    guestName: reservation.contact?.name || 'Hóspede',
    reservationId: reservation.id,
    checkIn: formatDate(reservation.stay.checkIn),
    checkOut: formatDate(reservation.stay.checkOut),
    checkInTime: reservation.stay.checkInTime || state.property.defaultCheckInTime || '15:00',
    checkOutTime: reservation.stay.checkOutTime || state.property.defaultCheckOutTime || '10:00',
    nights: String(totals.nights),
    guestCount: String(getGuestCount(reservation)),
    propertyAddress: state.property.address || '',
    total: formatCurrency(totals.total, state.pricing.currency)
  };

  const message = Object.entries(values).reduce((text, [key, value]) => text.replaceAll(`{${key}}`, value), template);
  if (!requestComment || templateKey !== 'paymentInstructions') return message;

  return `${message}\n\n${commentLabels.comment}\n${requestComment}\n\n${commentLabels.reply}\n[ ]`;
}

export function generateStandaloneMessage(state, language = 'pt', templateKey = 'usefulInfo') {
  const template = GUEST_MESSAGE_TEMPLATES[templateKey]?.[language] || GUEST_MESSAGE_TEMPLATES[templateKey]?.pt || GUEST_MESSAGE_TEMPLATES.usefulInfo.pt;
  const values = {
    guestName: '[nome do hóspede]',
    reservationId: '[referência]',
    checkIn: '[data de check-in]',
    checkOut: '[data de check-out]',
    checkInTime: state?.property?.defaultCheckInTime || '15:00',
    checkOutTime: state?.property?.defaultCheckOutTime || '10:00',
    nights: '[número]',
    guestCount: '[número]',
    propertyAddress: state?.property?.address || 'Rua da Arejinha 627, 4550-518 Pedorido',
    total: '[valor]'
  };

  return Object.entries(values).reduce((text, [key, value]) => text.replaceAll(`{${key}}`, value), template);
}

export function getEmployeeForUser(state, user) {
  return state.employees.find((employee) => employee.userId === user.id);
}

export function getHourlyRate(employee, dateKey = formatDateKey(new Date())) {
  const rates = [...(employee.hourlyRates || [])]
    .filter((rate) => rate.from <= dateKey)
    .sort((a, b) => a.from.localeCompare(b.from));
  return Number(rates.at(-1)?.rate || 0);
}

export function getWorkDurationHours(session, fallbackEnd = new Date()) {
  const start = new Date(session.start);
  const end = session.end ? new Date(session.end) : fallbackEnd;
  if (Number.isNaN(start.getTime()) || Number.isNaN(end.getTime()) || end <= start) return 0;
  return Math.round(((end - start) / 3600000) * 100) / 100;
}

export function getWorkSessionCost(session) {
  if ((session.compensationType || 'paid') !== 'paid') return 0;
  return getWorkDurationHours(session) * Number(session.rateSnapshot || 0);
}

export function calculateEmployeeEarnings(state, employeeId, monthKey = formatDateKey(new Date()).slice(0, 7)) {
  return state.workSessions
    .filter((session) => session.employeeId === employeeId && session.date.startsWith(monthKey))
    .reduce((total, session) => total + getWorkSessionCost(session), 0);
}

export function summarizeDashboard(state) {
  const todayKey = formatDateKey(new Date());
  const activeReservations = state.reservations.filter((reservation) =>
    ['confirmed', 'checked_in'].includes(reservation.status) &&
    reservation.stay.checkIn <= todayKey &&
    reservation.stay.checkOut > todayKey
  );
  const futureReservations = state.reservations
    .filter((reservation) => reservation.status !== 'cancelled' && reservation.stay.checkIn >= todayKey)
    .sort((a, b) => a.stay.checkIn.localeCompare(b.stay.checkIn));
  const departures = state.reservations
    .filter((reservation) => reservation.status !== 'cancelled' && reservation.stay.checkOut >= todayKey)
    .sort((a, b) => a.stay.checkOut.localeCompare(b.stay.checkOut));
  const awaitingPayment = state.reservations.filter((reservation) => reservation.status === 'awaiting_payment');
  const openRequests = state.websiteRequests.filter((request) => request.status === 'new');
  const confirmedRevenue = state.reservations
    .filter((reservation) => ['awaiting_payment', 'confirmed', 'checked_in', 'checked_out'].includes(reservation.status))
    .reduce((total, reservation) => total + calculateReservationTotals(reservation, state).total, 0);
  const expenses = state.expenses.reduce((total, expense) => total + Number(expense.amount || 0), 0);
  const employeeCosts = state.workSessions.reduce((total, session) => total + getWorkSessionCost(session), 0);

  return {
    todayKey,
    activeReservations,
    nextArrival: futureReservations[0] || null,
    nextDeparture: departures[0] || null,
    awaitingPayment,
    openRequests,
    confirmedRevenue,
    expenses,
    employeeCosts
  };
}

export { addDays, formatDateKey, parseDateKey };
